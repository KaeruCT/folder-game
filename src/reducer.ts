import { Directory, type File, type FileNode, findNode, unlockFileNode } from "./model/files";
import { getFilesystem, getInitialLogEntries, getInventory } from "./model/game";
import { addItem, addItems, type Inventory, removeItem } from "./model/inventory";
import { createLogEntry, type LogCategory, type LogEntry } from "./model/log";
import { applySnapshot, buildSnapshot, loadSnapshot, type SaveSnapshot, saveGame } from "./model/save";

type ActionType =
    | "INVENTORY_ADD"
    | "INVENTORY_REMOVE"
    | "SET_CWD"
    | "SET_FILE"
    | "UNLOCK_FILENODE"
    | "LOAD_GAME"
    | "SAVE_GAME"
    | "REVEAL_FILE"
    | "ADD_ITEMS"
    | "SET_PHASE"
    | "LOG_ADD"
    | "SELECT_STORYLINE"
    | "MARK_INVENTORY_READ"
    | "MARK_LOG_READ";

export interface State {
    storylineId: string;
    inventory: Inventory;
    filesystemRoot: Directory;
    cwd: Directory;
    file: File | null;
    readFiles: string[];
    gamePhase: number;
    logEntries: LogEntry[];
    unreadInventoryCount: number;
    unreadLogCount: number;
    /** Bumped when visible filesystem state changes so directory/tree views re-filter hidden nodes. */
    revealCounter: number;
    /** Recently revealed or created nodes that should be visually called out until opened. */
    highlightedPaths: string[];
}

export interface Action {
    type: ActionType;
    // biome-ignore lint/suspicious/noExplicitAny: discriminated union via type field
    payload: any;
}

/** Queue for deferred actions dispatched from inside callbacks/executables. */
export const deferredActions: Action[] = [];

const activeTimers = new Set<ReturnType<typeof setTimeout>>();

function collectVisiblePaths(root: Directory): Set<string> {
    const paths = new Set<string>();

    function visit(node: FileNode) {
        if (node.hidden) return;
        paths.add(node.fullName);
        if (node instanceof Directory) {
            for (const child of node.contents) visit(child);
        }
    }

    visit(root);
    return paths;
}

function addNewVisiblePaths(highlightedPaths: string[] | undefined, before: Set<string>, root: Directory): string[] {
    const next = new Set(highlightedPaths ?? []);
    for (const path of collectVisiblePaths(root)) {
        if (path !== "/" && !before.has(path)) next.add(path);
    }
    return [...next];
}

function markPathSeen(highlightedPaths: string[] | undefined, path: string): string[] {
    return (highlightedPaths ?? []).filter((highlightedPath) => highlightedPath !== path);
}

function findVisibleLockedPathsForKeys(root: Directory, keys: string[]): string[] {
    const keySet = new Set(keys);
    const paths: string[] = [];

    function visit(node: FileNode) {
        if (node.hidden) return;
        if (node.locked && typeof node.meta.key === "string" && keySet.has(node.meta.key)) {
            paths.push(node.fullName);
        }
        if (node instanceof Directory) {
            for (const child of node.contents) visit(child);
        }
    }

    visit(root);
    return paths;
}

function scheduleDeferred(action: Action, delayMs: number): () => void {
    const id = setTimeout(() => {
        activeTimers.delete(id);
        deferredActions.push(action);
    }, delayMs);
    activeTimers.add(id);
    return () => {
        clearTimeout(id);
        activeTimers.delete(id);
    };
}

function makeRunContext(state: State) {
    return {
        // biome-ignore lint/suspicious/noExplicitAny: generic dispatch bridge
        dispatch: (a: { type: string; payload: any }) => {
            deferredActions.push(a as Action);
        },
        state: {
            inventory: state.inventory,
            gamePhase: state.gamePhase,
            readFiles: state.readFiles,
        },
        // biome-ignore lint/suspicious/noExplicitAny: generic action payload
        schedule: (a: { type: string; payload: any }, delayMs: number) => {
            return scheduleDeferred(a as Action, delayMs);
        },
        log: (category: LogCategory, text: string) => {
            deferredActions.push({ type: "LOG_ADD", payload: createLogEntry(category, text) });
        },
    };
}

export function reducer(state: State, action: Action): State {
    let { inventory, filesystemRoot, readFiles } = state;
    switch (action.type) {
        case "SELECT_STORYLINE": {
            const id = action.payload as string;
            const result = getInitialState(id);
            if (typeof result === "string") {
                // Should never happen for valid storyline IDs, but fall back to null state
                return getNullState();
            }
            return result;
        }
        case "INVENTORY_ADD": {
            const itemType = action.payload as string;
            return {
                ...state,
                inventory: addItem(inventory, itemType),
                highlightedPaths: [
                    ...new Set([
                        ...(state.highlightedPaths ?? []),
                        ...findVisibleLockedPathsForKeys(filesystemRoot, [itemType]),
                    ]),
                ],
                unreadInventoryCount: state.unreadInventoryCount + 1,
            };
        }
        case "INVENTORY_REMOVE":
            return { ...state, inventory: removeItem(inventory, action.payload) };
        case "ADD_ITEMS": {
            const items = action.payload as Record<string, number>;
            return {
                ...state,
                inventory: addItems(inventory, items),
                highlightedPaths: [
                    ...new Set([
                        ...(state.highlightedPaths ?? []),
                        ...findVisibleLockedPathsForKeys(filesystemRoot, Object.keys(items)),
                    ]),
                ],
                unreadInventoryCount: state.unreadInventoryCount + 1,
            };
        }
        case "LOG_ADD": {
            const entry = action.payload as LogEntry;
            const isImportant = entry.category === "goal" || entry.category === "milestone";
            return {
                ...state,
                logEntries: [...state.logEntries, entry],
                unreadLogCount: state.unreadLogCount + (isImportant ? 1 : 0),
            };
        }
        case "MARK_INVENTORY_READ":
            return { ...state, unreadInventoryCount: 0 };
        case "MARK_LOG_READ":
            return { ...state, unreadLogCount: 0 };
        case "SET_PHASE":
            return { ...state, gamePhase: action.payload as number };
        case "SET_CWD": {
            const cwd = action.payload as Directory;
            return { ...state, cwd, highlightedPaths: markPathSeen(state.highlightedPaths, cwd.fullName) };
        }
        case "REVEAL_FILE": {
            const path = action.payload as string;
            const node = findNode(filesystemRoot, path);
            const wasHidden = node?.hidden === true;
            if (node) node.hidden = false;
            const highlightedPaths = wasHidden
                ? [...new Set([...(state.highlightedPaths ?? []), node.fullName])]
                : state.highlightedPaths;
            return { ...state, filesystemRoot, highlightedPaths, revealCounter: state.revealCounter + 1 };
        }
        case "SET_FILE": {
            const file = action.payload as File | null;
            let highlightedPaths = file ? markPathSeen(state.highlightedPaths, file.fullName) : state.highlightedPaths;
            const beforeVisible = collectVisiblePaths(filesystemRoot);
            if (file) {
                const isFirstRead = !readFiles.includes(file.fullName);
                if (isFirstRead) {
                    readFiles = [...readFiles, file.fullName];
                }

                const ctx = makeRunContext(state);

                if (isFirstRead) {
                    if (file.meta.onRead) {
                        file.meta.onRead(ctx);
                    }
                    if (file.meta.revealsOnRead) {
                        for (const revealPath of file.meta.revealsOnRead) {
                            const node = findNode(filesystemRoot, revealPath);
                            if (node) node.hidden = false;
                        }
                    }
                    if (file.meta.selfDestruct) {
                        file.hidden = true;
                    }
                }
                if (file.isExecutable) {
                    file.run(ctx);
                }
                highlightedPaths = addNewVisiblePaths(highlightedPaths, beforeVisible, file.root);
            }
            return {
                ...state,
                file,
                filesystemRoot: file ? file.root : filesystemRoot,
                readFiles,
                highlightedPaths,
                revealCounter:
                    highlightedPaths.join("\0") === (state.highlightedPaths ?? []).join("\0")
                        ? state.revealCounter
                        : state.revealCounter + 1,
            };
        }
        case "UNLOCK_FILENODE": {
            const fileNode: FileNode = action.payload as FileNode;
            const beforeVisible = collectVisiblePaths(filesystemRoot);
            let highlightedPaths = markPathSeen(state.highlightedPaths, fileNode.fullName);
            const key: string = fileNode.meta.key;
            if (inventory[key]) {
                inventory = removeItem(inventory, key);
                filesystemRoot = unlockFileNode(fileNode);

                const ctx = makeRunContext(state);

                if (fileNode.meta.onUnlock) {
                    fileNode.meta.onUnlock(ctx);
                }
                if (fileNode.meta.revealsOnUnlock) {
                    for (const revealPath of fileNode.meta.revealsOnUnlock) {
                        const node = findNode(filesystemRoot, revealPath);
                        if (node) node.hidden = false;
                    }
                }
                highlightedPaths = addNewVisiblePaths(highlightedPaths, beforeVisible, filesystemRoot);
            }
            return { ...state, filesystemRoot, inventory, highlightedPaths, revealCounter: state.revealCounter + 1 };
        }
        case "LOAD_GAME": {
            const snapshot = action.payload as SaveSnapshot;
            const freshRoot = getFilesystem(snapshot.storylineId ?? "lockdown");
            applySnapshot(freshRoot, snapshot);

            const loadedInventory: Inventory = {};
            for (const [type, qty] of Object.entries(snapshot.inventory)) {
                loadedInventory[type] = { type, quantity: qty };
            }

            let cwd = freshRoot;
            if (snapshot.cwdPath) {
                const parts = snapshot.cwdPath.split("/").filter(Boolean);
                for (const part of parts) {
                    const child = cwd.getFileNode(part);
                    if (child instanceof Directory) cwd = child;
                    else break;
                }
            }

            return {
                storylineId: snapshot.storylineId ?? "lockdown",
                filesystemRoot: freshRoot,
                inventory: loadedInventory,
                cwd,
                file: null,
                readFiles: snapshot.readFiles ?? [],
                gamePhase: snapshot.gamePhase ?? 0,
                logEntries: snapshot.logEntries ?? [],
                unreadInventoryCount: 0,
                unreadLogCount: 0,
                revealCounter: 0,
                highlightedPaths: snapshot.highlightedPaths ?? [],
            };
        }
        case "SAVE_GAME": {
            const freshRoot = getFilesystem(state.storylineId);
            const snapshot = buildSnapshot(
                filesystemRoot,
                state.cwd,
                state.storylineId,
                state.gamePhase,
                state.readFiles,
                state.logEntries,
                state.inventory,
                state.highlightedPaths,
                freshRoot,
            );
            saveGame(snapshot);
            return state;
        }
        default:
            throw new Error(`Unknown action type: ${(action as Action).type}`);
    }
}

/** Returns a "null" state when no storyline is selected yet (shows selection screen). */
export function getNullState(): State {
    // Minimal dummy state — replace entirely when storyline is selected
    const dummyRoot = new Directory("loading");
    return {
        storylineId: "",
        filesystemRoot: dummyRoot,
        cwd: dummyRoot,
        inventory: {},
        file: null,
        readFiles: [],
        gamePhase: 0,
        logEntries: [],
        unreadInventoryCount: 0,
        unreadLogCount: 0,
        revealCounter: 0,
        highlightedPaths: [],
    };
}

/** Returns a state or an error string. Never returns null — if no save, builds fresh state. */
export function getInitialState(storylineId: string): State | string {
    const loaded = loadSnapshot();
    if (loaded && "error" in loaded) {
        return loaded.error;
    }

    if (loaded && "snapshot" in loaded) {
        const snapshot = loaded.snapshot;
        const id = snapshot.storylineId ?? storylineId;

        // Validate storyline exists
        try {
            getFilesystem(id);
        } catch {
            return `Save data references a storyline that no longer exists ("${id}").`;
        }

        const root = getFilesystem(id);
        try {
            applySnapshot(root, snapshot);
        } catch {
            return "Save data could not be applied. It may be from a different version.";
        }

        const inventory: Inventory = {};
        for (const [type, qty] of Object.entries(snapshot.inventory)) {
            inventory[type] = { type, quantity: qty };
        }

        let cwd = root;
        if (snapshot.cwdPath) {
            const parts = snapshot.cwdPath.split("/").filter(Boolean);
            for (const part of parts) {
                const child = cwd.getFileNode(part);
                if (child instanceof Directory) cwd = child;
                else break;
            }
        }

        return {
            storylineId: id,
            filesystemRoot: root,
            inventory,
            cwd,
            file: null,
            readFiles: snapshot.readFiles ?? [],
            gamePhase: snapshot.gamePhase ?? 0,
            logEntries: snapshot.logEntries ?? [],
            unreadInventoryCount: 0,
            unreadLogCount: 0,
            revealCounter: 0,
            highlightedPaths: snapshot.highlightedPaths ?? [],
        };
    }

    // No save exists — build fresh
    const filesystemRoot = getFilesystem(storylineId);
    const freshInventory = getInventory(storylineId);
    const freshLogEntries = getInitialLogEntries(storylineId);
    return {
        storylineId,
        inventory: freshInventory,
        filesystemRoot,
        cwd: filesystemRoot,
        file: null,
        readFiles: [],
        gamePhase: 0,
        logEntries: freshLogEntries,
        unreadInventoryCount: Object.keys(freshInventory).length,
        unreadLogCount: freshLogEntries.filter((entry) => entry.category === "goal" || entry.category === "milestone")
            .length,
        revealCounter: 0,
        highlightedPaths: [],
    };
}
