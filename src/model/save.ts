import { Directory, File, findNode } from "./files";
import type { LogEntry } from "./log";

export interface SaveSnapshot {
    storylineId: string;
    cwdPath: string;
    gamePhase: number;
    readFiles: string[];
    logEntries: LogEntry[];
    inventory: Record<string, number>;
    hiddenPaths: string[];
    unlockedPaths: string[];
    modifiedContent: Record<string, string>;
    // biome-ignore lint/suspicious/noExplicitAny: serialized meta bag
    createdFiles: Record<string, { content: string; meta?: Record<string, any> }>;
    // biome-ignore lint/suspicious/noExplicitAny: serialized run state
    runStates: Record<string, Record<string, any>>;
}

const SAVE_KEY = "folder-game-save";

/** Build a save snapshot by comparing current tree against a fresh initial tree. */
export function buildSnapshot(
    root: Directory,
    cwd: Directory,
    storylineId: string,
    gamePhase: number,
    readFiles: string[],
    logEntries: LogEntry[],
    inventory: Record<string, { quantity: number }>,
    freshRoot: Directory,
): SaveSnapshot {
    const snapshot: SaveSnapshot = {
        storylineId,
        cwdPath: cwd.fullName,
        gamePhase,
        readFiles: [...readFiles],
        logEntries: [...logEntries],
        inventory: {},
        hiddenPaths: [],
        unlockedPaths: [],
        modifiedContent: {},
        createdFiles: {},
        runStates: {},
    };

    for (const [type, item] of Object.entries(inventory)) {
        snapshot.inventory[type] = item.quantity;
    }

    diffTrees(root, freshRoot, snapshot);
    return snapshot;
}

// biome-ignore lint/suspicious/noExplicitAny: meta deserialization — intentionally flexible
function stripMeta(meta: Record<string, any>): Record<string, any> {
    // biome-ignore lint/suspicious/noExplicitAny: meta deserialization
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(meta)) {
        if (typeof value === "function") continue; // skip callbacks
        cleaned[key] = value;
    }
    return cleaned;
}

function diffTrees(current: Directory, fresh: Directory, snapshot: SaveSnapshot) {
    for (const node of current.contents) {
        const freshNode = fresh.getFileNode(node.name);
        const path = node.fullName;

        if (node instanceof File) {
            const freshFile = freshNode instanceof File ? freshNode : undefined;

            if (!freshFile) {
                snapshot.createdFiles[path] = {
                    content: node.content,
                    meta: stripMeta(node.meta),
                };
                continue;
            }

            if (node.hidden !== freshFile.hidden) {
                snapshot.hiddenPaths.push(path);
            }
            if (node.content !== freshFile.content) {
                snapshot.modifiedContent[path] = node.content;
            }
            if (Object.keys(node.runState).length > 0) {
                snapshot.runStates[path] = { ...node.runState };
            }
        }

        if (node.locked === false && freshNode) {
            snapshot.unlockedPaths.push(path);
        }

        if (node instanceof Directory && freshNode instanceof Directory) {
            diffTrees(node, freshNode, snapshot);
        }
    }
}

/** Apply a save snapshot to a fresh filesystem tree. */
export function applySnapshot(root: Directory, snapshot: SaveSnapshot): void {
    for (const path of snapshot.unlockedPaths) {
        const node = findNode(root, path);
        if (node) node.locked = false;
    }
    for (const path of snapshot.hiddenPaths) {
        const node = findNode(root, path);
        if (node instanceof File) node.hidden = true;
    }
    for (const [path, content] of Object.entries(snapshot.modifiedContent)) {
        const node = findNode(root, path);
        if (node instanceof File) node.content = content;
    }
    for (const [path, data] of Object.entries(snapshot.createdFiles)) {
        const node = createFileAt(root, path, data.content);
        if (node && data.meta) {
            Object.assign(node.meta, data.meta);
            if (data.meta.key) node.locked = true;
        }
    }
    for (const [path, runState] of Object.entries(snapshot.runStates)) {
        const node = findNode(root, path);
        if (node instanceof File) node.runState = { ...runState };
    }
}

function createFileAt(root: Directory, fullPath: string, content: string): File | undefined {
    const parts = fullPath.split("/").filter(Boolean);
    // biome-ignore lint/style/noNonNullAssertion: split + filter guarantees at least one element
    const filename = parts.pop()!;
    let dir = root;

    for (const part of parts) {
        let child = dir.getFileNode(part);
        if (!(child instanceof Directory)) {
            child = dir.createDirectory(part);
        }
        dir = child;
    }

    if (!dir.fileExists(filename)) {
        return dir.createFile(filename, content);
    }
    const existing = dir.getFileNode(filename);
    if (existing instanceof File) {
        existing.content = content;
        return existing;
    }
    return undefined;
}

export function saveGame(snapshot: SaveSnapshot): void {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

export function loadSnapshot(): SaveSnapshot | null {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as SaveSnapshot;
    } catch {
        localStorage.removeItem(SAVE_KEY);
        return null;
    }
}

export function deleteSave(): void {
    localStorage.removeItem(SAVE_KEY);
}
