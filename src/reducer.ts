import { type Directory, type File, type FileNode, unlockFileNode } from "./model/files";
import { getFilesystem, getInventory } from "./model/game";
import { addItem, type Inventory, removeItem } from "./model/inventory";

type ActionType = "INVENTORY_ADD" | "INVENTORY_REMOVE" | "SET_CWD" | "SET_FILE" | "UNLOCK_FILENODE";

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
                filesystemRoot = unlockFileNode(action.payload);
            }
            return { ...state, filesystemRoot, inventory };
        }
        default:
            throw new Error();
    }
}

export function getInitialState(): State {
    const filesystemRoot = getFilesystem();
    return {
        inventory: getInventory(),
        filesystemRoot,
        cwd: filesystemRoot,
        file: null,
    };
}
