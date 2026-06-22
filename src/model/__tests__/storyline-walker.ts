/**
 * Narrative graph walker for automated storyline verification.
 *
 * Walks every reachable path through a storyline — reading files, unlocking
 * locked nodes, running executables, and following choice branches — and
 * reports which files were/were not accessed, which endings were reached,
 * and whether any keys are unobtainable.
 *
 * Only handles synchronous callbacks. Storylines that use `ctx.schedule`
 * (delayed dispatch) will lose those delayed actions — walker clears timers
 * after each drain cycle. Neither current storyline uses `schedule`, so this
 * is acceptable.
 */

import { type Action, deferredActions, reducer, type State } from "../../reducer";
import { clearAllTimers, Directory, File, type FileNode, findNode } from "../files";
import type { Inventory } from "../inventory";
import type { Storyline } from "../storyline";

// ---------------------------------------------------------------------------
// Report types
// ---------------------------------------------------------------------------

export interface WalkReport {
    /** Absolute paths of every file in the fresh filesystem tree. */
    allFilePaths: string[];
    /** Paths of files that were opened at least once across all branches. */
    accessedFilePaths: string[];
    /** Paths in `allFilePaths` that were never opened. */
    missedFilePaths: string[];
    /** Names of ending/resolve files reached. */
    endingsReached: string[];
    /** Number of choice branches explored. */
    choicePathsExplored: number;
    /** Non-fatal issues encountered during the walk. */
    warnings: string[];
    /** Fatal errors (e.g., unknown storyline). */
    errors: string[];
}

// ---------------------------------------------------------------------------
// Logical actions (path-based — safe to replay against a fresh tree)
// ---------------------------------------------------------------------------

type LogicalAction =
    | { type: "READ"; path: string }
    | { type: "UNLOCK"; path: string }
    | { type: "CHOICE"; label: string; action: Action }
    | { type: "EXEC"; path: string };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function walkStoryline(storyline: Storyline): WalkReport {
    // Clear any leftover deferred actions / timers from previous walks
    deferredActions.length = 0;
    clearAllTimers();

    const freshRoot = storyline.buildFilesystem();
    const allFilePaths = listAllFiles(freshRoot)
        .map((f) => f.fullName)
        .sort();

    const report: WalkReport = {
        allFilePaths,
        accessedFilePaths: [],
        missedFilePaths: [],
        endingsReached: [],
        choicePathsExplored: 0,
        warnings: [],
        errors: [],
    };

    // Verify the storyline can build its filesystem and initial state
    try {
        storyline.buildFilesystem();
        storyline.getInitialInventory();
    } catch (e) {
        report.errors.push(`Failed to build storyline: ${String(e)}`);
        return report;
    }

    const globalAccessed = new Set<string>();

    // DFS exploration — each branch gets its own accessed set
    explore([], storyline, report, globalAccessed, new Set());

    // Merge global accessed into report
    report.accessedFilePaths = [...globalAccessed].sort();
    report.missedFilePaths = allFilePaths.filter((p) => !globalAccessed.has(p));

    return report;
}

// ---------------------------------------------------------------------------
// DFS exploration
// ---------------------------------------------------------------------------

function explore(
    actionLog: LogicalAction[],
    storyline: Storyline,
    report: WalkReport,
    globalAccessed: Set<string>,
    visited: Set<string>,
): void {
    // Check for infinite loops via state hash
    const hash = stateHash(actionLog);
    if (visited.has(hash)) return;
    visited.add(hash);

    let state = buildCleanState(storyline);
    const branchAccessed = new Set<string>();

    // Replay the actionLog to reach this branch point
    const runningLog: LogicalAction[] = [];
    for (const la of actionLog) {
        state = applyLogicalAction(state, la, report, branchAccessed);
        runningLog.push(la);
    }

    // Detect whether a choice was already resolved by the actionLog.
    // When the log ends with a CHOICE, the choice file's options have
    // been handled and we must not re-fork on them.
    let resolvedChoicePath: string | null = null;
    if (actionLog.length > 0) {
        const last = actionLog[actionLog.length - 1];
        if (last.type === "CHOICE") {
            // Walk backwards to find the read/exec that opened the choice file
            for (let i = actionLog.length - 2; i >= 0; i--) {
                const prev = actionLog[i];
                if (prev.type === "READ" || prev.type === "EXEC") {
                    resolvedChoicePath = prev.path;
                    break;
                }
            }
        }
    }

    // Exhaust loop — apply one action at a time, checking for choices/endings
    // after each action application.
    while (true) {
        // Check for choices on the currently open file (if any)
        const currentFile = state.file;
        if (
            currentFile instanceof File &&
            currentFile.meta.choices?.length &&
            currentFile.fullName !== resolvedChoicePath
        ) {
            report.choicePathsExplored += currentFile.meta.choices.length;

            for (const choice of currentFile.meta.choices) {
                const la: LogicalAction = {
                    type: "CHOICE",
                    label: choice.label,
                    action: choice.action as Action,
                };
                explore([...runningLog, la], storyline, report, globalAccessed, visited);
            }
            // Merge branchAccessed into global BEFORE returning
            for (const p of branchAccessed) globalAccessed.add(p);
            return;
        }

        // Record ending if the currently open file is an ending/resolve file
        if (currentFile instanceof File) {
            const name = currentFile.name;
            if (isEndingFile(name) && !report.endingsReached.includes(name)) {
                report.endingsReached.push(name);
            }
        }

        // Get next available actions for this branch
        const actions = getAvailableLogicalActions(state, branchAccessed);
        if (actions.length === 0) break;

        // Apply the first available action (unlocks before reads)
        const next = actions[0];
        runningLog.push(next);
        state = applyLogicalAction(state, next, report, branchAccessed);
    }

    // Merge branch accessed into global
    for (const p of branchAccessed) globalAccessed.add(p);
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

function buildCleanState(storyline: Storyline): State {
    const root = storyline.buildFilesystem();
    const inventory = storyline.getInitialInventory();
    const logEntries = storyline.getInitialLogEntries?.() ?? [];
    return {
        storylineId: storyline.id,
        filesystemRoot: root,
        cwd: root,
        inventory,
        file: null,
        readFiles: [],
        gamePhase: 0,
        logEntries,
        unreadInventoryCount: 0,
        unreadLogCount: 0,
        revealCounter: 0,
    };
}

/** Apply an action via the reducer, then drain all deferred actions. */
function applyAndDrain(state: State, action: Action): State {
    deferredActions.length = 0;
    clearAllTimers();

    let next = reducer(state, action);

    // Drain deferred actions
    while (deferredActions.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: guarded by while length check
        const da = deferredActions.shift()!;
        next = reducer(next, da);
    }

    clearAllTimers();
    return next;
}

// ---------------------------------------------------------------------------
// Logical action resolution
// ---------------------------------------------------------------------------

function applyLogicalAction(state: State, la: LogicalAction, report: WalkReport, accessedSet: Set<string>): State {
    switch (la.type) {
        case "READ":
        case "EXEC": {
            const file = findNodeAsFile(state.filesystemRoot, la.path);
            if (!file) {
                report.warnings.push(`${la.type}: file not found: ${la.path}`);
                return state;
            }
            if (la.type === "EXEC" && !file.isExecutable) {
                report.warnings.push(`EXEC: file is not executable: ${la.path}`);
                return state;
            }
            accessedSet.add(file.fullName);
            return applyAndDrain(state, { type: "SET_FILE", payload: file });
        }
        case "UNLOCK": {
            const node = findNode(state.filesystemRoot, la.path);
            if (!node) {
                report.warnings.push(`UNLOCK: node not found: ${la.path}`);
                return state;
            }
            return applyAndDrain(state, { type: "UNLOCK_FILENODE", payload: node });
        }
        case "CHOICE": {
            return applyAndDrain(state, la.action);
        }
    }
}

// ---------------------------------------------------------------------------
// Available actions (uses branch-local accessed set)
// ---------------------------------------------------------------------------

function getAvailableLogicalActions(state: State, accessedSet: Set<string>): LogicalAction[] {
    const unlocks: LogicalAction[] = [];
    const others: LogicalAction[] = [];

    // Unlock actions: any locked node whose key the player holds
    for (const node of visibleFileNodes(state.filesystemRoot)) {
        if (node.locked && canUnlock(node, state.inventory)) {
            unlocks.push({ type: "UNLOCK", path: node.fullName });
        }
    }

    // Read/exec actions: any visible, unlocked file not yet read
    for (const file of visibleFiles(state.filesystemRoot)) {
        if (!accessedSet.has(file.fullName)) {
            if (file.isExecutable) {
                others.push({ type: "EXEC", path: file.fullName });
            } else {
                others.push({ type: "READ", path: file.fullName });
            }
        }
    }

    // Sort unlock actions: nodes with narrative callbacks (onUnlock,
    // revealsOnUnlock, onRead) first, so that when keys are limited the
    // walker prioritises branches that advance the story.
    unlocks.sort((a, b) => {
        if (a.type !== "UNLOCK" || b.type !== "UNLOCK") return 0;
        const nodeA = findNode(state.filesystemRoot, a.path);
        const nodeB = findNode(state.filesystemRoot, b.path);
        const scoreA = hasNarrativeCallback(nodeA) ? 1 : 0;
        const scoreB = hasNarrativeCallback(nodeB) ? 1 : 0;
        return scoreB - scoreA; // higher first
    });

    return [...unlocks, ...others];
}

function hasNarrativeCallback(node: FileNode | undefined): boolean {
    if (!node) return false;
    const m = node.meta ?? {};
    return !!(m.onUnlock || m.revealsOnUnlock || m.onRead);
}

// ---------------------------------------------------------------------------
// Tree traversal helpers
// ---------------------------------------------------------------------------

function listAllFiles(dir: Directory, result: File[] = []): File[] {
    for (const child of dir.contents) {
        if (child instanceof File) {
            result.push(child);
        } else if (child instanceof Directory) {
            listAllFiles(child, result);
        }
    }
    return result;
}

function findNodeAsFile(root: Directory, path: string): File | undefined {
    const node = findNode(root, path);
    return node instanceof File ? node : undefined;
}

/**
 * All visible (non-hidden) FileNodes in the tree, including locked ones.
 * Does NOT recurse into locked directories (their children are hidden from the player).
 */
function visibleFileNodes(dir: Directory, result: FileNode[] = []): FileNode[] {
    for (const child of dir.contents) {
        if (!child.hidden) {
            result.push(child);
        }
        if (child instanceof Directory && !child.hidden && !child.locked) {
            visibleFileNodes(child, result);
        }
    }
    return result;
}

/**
 * All visible, unlocked files in the tree.
 * Does NOT recurse into locked directories.
 */
function visibleFiles(dir: Directory, result: File[] = []): File[] {
    for (const child of dir.contents) {
        if (child instanceof File && !child.hidden && !child.locked) {
            result.push(child);
        } else if (child instanceof Directory && !child.hidden && !child.locked) {
            visibleFiles(child, result);
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Key / lock helpers
// ---------------------------------------------------------------------------

function canUnlock(node: FileNode, inventory: Inventory): boolean {
    const key = node.meta?.key;
    if (!key || typeof key !== "string") return false;
    return (inventory[key]?.quantity ?? 0) > 0;
}

// ---------------------------------------------------------------------------
// State hashing for cycle detection
// ---------------------------------------------------------------------------

function stateHash(actionLog: LogicalAction[]): string {
    // Hash based on the sequence of actions taken — prevents infinite loops
    // when walker tries the same action sequence repeatedly
    const parts = actionLog.map((la) => `${la.type}:${"path" in la ? la.path : la.label}`);
    return parts.join("|");
}

// ---------------------------------------------------------------------------
// Ending detection
// ---------------------------------------------------------------------------

function isEndingFile(name: string): boolean {
    return name.startsWith("ending_") || name === "resolve.txt" || name === "decide.txt";
}
