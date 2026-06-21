import { Directory, type File, type FileNode, unlockFileNode } from "./model/files";
import { getFilesystem, getInventory } from "./model/game";
import { addItem, type Inventory, removeItem } from "./model/inventory";
import { applySnapshot, buildSnapshot, loadSnapshot, type SaveSnapshot, saveGame } from "./model/save";

type ActionType =
    | "INVENTORY_ADD"
    | "INVENTORY_REMOVE"
    | "SET_CWD"
    | "SET_FILE"
    | "UNLOCK_FILENODE"
    | "LOAD_GAME"
    | "SAVE_GAME";

export interface State {
    inventory: Inventory;
    filesystemRoot: Directory;
    cwd: Directory;
    file: File | null;
}

export interface Action {
    type: ActionType;
    // biome-ignore lint/suspicious/noExplicitAny: discriminated union via type field
    payload: any;
}

export function reducer(state: State, action: Action): State {
    let { inventory, filesystemRoot } = state;
    switch (action.type) {
        case "INVENTORY_ADD":
            return { ...state, inventory: addItem(inventory, action.payload) };
        case "INVENTORY_REMOVE":
            return { ...state, inventory: removeItem(inventory, action.payload) };
        case "SET_CWD":
            return { ...state, cwd: action.payload as Directory };
        case "SET_FILE": {
            const file = action.payload as File;
            if (file) {
                if (file.meta.selfDestruct) {
                    file.hidden = true;
                }
                if (file.isExecutable) {
                    file.run();
                }
            }
            return { ...state, file, filesystemRoot: file ? file.root : filesystemRoot };
        }
        case "UNLOCK_FILENODE": {
            const fileNode: FileNode = action.payload as FileNode;
            const key: string = fileNode.meta.key;
            if (inventory[key]) {
                inventory = removeItem(inventory, key);
                filesystemRoot = unlockFileNode(fileNode);
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

            return { filesystemRoot: freshRoot, inventory: loadedInventory, cwd, file: null };
        }
        case "SAVE_GAME": {
            const freshRoot = getFilesystem();
            const snapshot = buildSnapshot(filesystemRoot, state.cwd, state.inventory, freshRoot);
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

        return { filesystemRoot: root, inventory, cwd, file: null };
    }

    const filesystemRoot = getFilesystem();
    return {
        inventory: getInventory(),
        filesystemRoot,
        cwd: filesystemRoot,
        file: null,
    };
}
