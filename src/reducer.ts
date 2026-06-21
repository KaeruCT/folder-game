import { Directory, type File, type FileNode, findNode, unlockFileNode } from "./model/files";
import { getFilesystem, getInventory } from "./model/game";
import { addItem, addItems, type Inventory, removeItem } from "./model/inventory";
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
    | "SET_PHASE";

export interface State {
    inventory: Inventory;
    filesystemRoot: Directory;
    cwd: Directory;
    file: File | null;
    readFiles: string[];
    gamePhase: number;
}

export interface Action {
    type: ActionType;
    // biome-ignore lint/suspicious/noExplicitAny: discriminated union via type field
    payload: any;
}

/** Queue for deferred actions dispatched from inside callbacks/executables. */
export const deferredActions: Action[] = [];

const activeTimers = new Set<ReturnType<typeof setTimeout>>();

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
    };
}

export function reducer(state: State, action: Action): State {
    let { inventory, filesystemRoot, readFiles } = state;
    switch (action.type) {
        case "INVENTORY_ADD":
            return { ...state, inventory: addItem(inventory, action.payload) };
        case "INVENTORY_REMOVE":
            return { ...state, inventory: removeItem(inventory, action.payload) };
        case "ADD_ITEMS":
            return { ...state, inventory: addItems(inventory, action.payload) };
        case "SET_PHASE":
            return { ...state, gamePhase: action.payload as number };
        case "SET_CWD":
            return { ...state, cwd: action.payload as Directory };
        case "REVEAL_FILE": {
            const path = action.payload as string;
            const node = findNode(filesystemRoot, path);
            if (node) node.hidden = false;
            return { ...state, filesystemRoot };
        }
        case "SET_FILE": {
            const file = action.payload as File;
            if (file) {
                if (!readFiles.includes(file.fullName)) {
                    readFiles = [...readFiles, file.fullName];
                }

                const ctx = makeRunContext(state);

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
                if (file.isExecutable) {
                    file.run(ctx);
                }
            }
            return { ...state, file, filesystemRoot: file ? file.root : filesystemRoot, readFiles };
        }
        case "UNLOCK_FILENODE": {
            const fileNode: FileNode = action.payload as FileNode;
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
            }
            return { ...state, filesystemRoot, inventory };
        }
        case "LOAD_GAME": {
            const snapshot = action.payload as SaveSnapshot;
            const freshRoot = getFilesystem();
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
                filesystemRoot: freshRoot,
                inventory: loadedInventory,
                cwd,
                file: null,
                readFiles: snapshot.readFiles ?? [],
                gamePhase: snapshot.gamePhase ?? 0,
            };
        }
        case "SAVE_GAME": {
            const freshRoot = getFilesystem();
            const snapshot = buildSnapshot(
                filesystemRoot,
                state.cwd,
                state.gamePhase,
                state.readFiles,
                state.inventory,
                freshRoot,
            );
            saveGame(snapshot);
            return state;
        }
        default:
            throw new Error(`Unknown action type: ${(action as Action).type}`);
    }
}

export function getInitialState(): State {
    const snapshot = loadSnapshot();
    if (snapshot) {
        const root = getFilesystem();
        applySnapshot(root, snapshot);

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
            filesystemRoot: root,
            inventory,
            cwd,
            file: null,
            readFiles: snapshot.readFiles ?? [],
            gamePhase: snapshot.gamePhase ?? 0,
        };
    }

    const filesystemRoot = getFilesystem();
    return {
        inventory: getInventory(),
        filesystemRoot,
        cwd: filesystemRoot,
        file: null,
        readFiles: [],
        gamePhase: 0,
    };
}
