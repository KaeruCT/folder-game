import { getFilesystem, getInventory } from "./model/game";
import { Directory, unlockFileNode, FileNode } from "./model/files";
import { Inventory, addItem, removeItem } from "./model/inventory";

type ActionType = "INVENTORY_ADD" | "INVENTORY_REMOVE" | "UNLOCK_FILENODE";

export interface State {
    inventory: Inventory;
    filesystemRoot: Directory;
}

export interface Action {
    type: ActionType;
    payload: any;
}

export function reducer(state: State, action: Action): State {
    console.log("state", state);
    let { inventory, filesystemRoot } = state;
    switch (action.type) {
        case "INVENTORY_ADD":
            return { ...state, inventory: addItem(inventory, action.payload) };
        case "INVENTORY_REMOVE":
            return { ...state, inventory: removeItem(inventory, action.payload) };
        case "UNLOCK_FILENODE":
            const fileNode: FileNode = action.payload as FileNode;
            const key: string = fileNode.meta.key;
            if (inventory[key]) {
                // unlock FileNode only if the inventory has the required item
                inventory = removeItem(inventory, key);
                filesystemRoot = unlockFileNode(action.payload);
            }
            return { ...state, filesystemRoot, inventory };
        default:
            throw new Error();
    }
}

export function getInitialState(): State {
    return {
        inventory: getInventory(),
        filesystemRoot: getFilesystem(),
    };
}