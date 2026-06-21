import { Directory, File, type FileNode } from "./files";

export interface SaveSnapshot {
    cwdPath: string;
    inventory: Record<string, number>;
    hiddenPaths: string[];
    unlockedPaths: string[];
    modifiedContent: Record<string, string>;
    createdFiles: Record<string, string>;
}

const SAVE_KEY = "folder-game-save";

/** Build a save snapshot by comparing current tree against a fresh initial tree. */
export function buildSnapshot(
    root: Directory,
    cwd: Directory,
    inventory: Record<string, { quantity: number }>,
    freshRoot: Directory,
): SaveSnapshot {
    const snapshot: SaveSnapshot = {
        cwdPath: cwd.fullName,
        inventory: {},
        hiddenPaths: [],
        unlockedPaths: [],
        modifiedContent: {},
        createdFiles: {},
    };

    for (const [type, item] of Object.entries(inventory)) {
        snapshot.inventory[type] = item.quantity;
    }

    diffTrees(root, freshRoot, snapshot);
    return snapshot;
}

function diffTrees(current: Directory, fresh: Directory, snapshot: SaveSnapshot) {
    for (const node of current.contents) {
        const freshNode = fresh.getFileNode(node.name);
        const path = node.fullName;

        if (node instanceof File) {
            const freshFile = freshNode instanceof File ? freshNode : undefined;

            if (!freshFile) {
                // Runtime-created file
                snapshot.createdFiles[path] = node.content;
                continue;
            }

            if (node.hidden !== freshFile.hidden) {
                snapshot.hiddenPaths.push(path);
            }
            if (node.content !== freshFile.content) {
                snapshot.modifiedContent[path] = node.content;
            }
        }

        if (node.locked === false) {
            snapshot.unlockedPaths.push(path);
        }

        if (node instanceof Directory && freshNode instanceof Directory) {
            diffTrees(node, freshNode, snapshot);
        }
    }
}

/** Apply a save snapshot to a fresh filesystem tree (mutates in place — call on fresh copy). */
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
    for (const [path, content] of Object.entries(snapshot.createdFiles)) {
        createFileAt(root, path, content);
    }
}

function findNode(root: Directory, fullPath: string): FileNode | undefined {
    const parts = fullPath.split("/").filter(Boolean);
    let current: FileNode | undefined = root;

    for (const part of parts) {
        if (!(current instanceof Directory)) return undefined;
        current = current.getFileNode(part);
        if (!current) return undefined;
    }
    return current;
}

function createFileAt(root: Directory, fullPath: string, content: string): void {
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
        dir.createFile(filename, content);
    }
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
