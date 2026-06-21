import type { LogCategory } from "./log";

const SEPARATOR = "/";

const activeTimers = new Set<ReturnType<typeof setTimeout>>();

export function clearAllTimers() {
    for (const id of activeTimers) clearTimeout(id);
    activeTimers.clear();
}

export type FileNode = Directory | File;

type LoggerFunction = (line: string) => void;

export interface RunContext {
    // biome-ignore lint/suspicious/noExplicitAny: generic action dispatch
    dispatch: (action: { type: string; payload: any }) => any;
    /** Schedule an action to dispatch after `delayMs` milliseconds. Returns a cancel function. */
    // biome-ignore lint/suspicious/noExplicitAny: generic action payload
    schedule: (action: { type: string; payload: any }, delayMs: number) => () => void;
    /** Log an event to the game log (visible in the Log tab). */
    log: (category: LogCategory, text: string) => void;
    state: {
        inventory: Record<string, { type: string; quantity: number }>;
        gamePhase: number;
        readFiles: string[];
    };
}

export type Meta = {
    // biome-ignore lint/suspicious/noExplicitAny: intentionally flexible metadata bag
    [key: string]: any;
    hidden?: boolean;
    run?: (this: File, log: LoggerFunction, ctx: RunContext) => void;
    onRead?: (ctx: RunContext) => void;
    onUnlock?: (ctx: RunContext) => void;
    revealsOnRead?: string[];
    revealsOnUnlock?: string[];
    // biome-ignore lint/suspicious/noExplicitAny: generic action payload
    choices?: { label: string; action: { type: string; payload: any } }[];
    // biome-ignore lint/suspicious/noExplicitAny: flexible run state bag
    runState?: Record<string, any>;
};

export class File {
    readonly name: string;
    content: string;
    tempContent: string = "";
    readonly parent: Directory;
    readonly meta: Meta;
    locked = false;
    hidden = false;
    // biome-ignore lint/suspicious/noExplicitAny: flexible run state bag
    runState: Record<string, any> = {};

    constructor(name: string, content: string, parent: Directory, meta: Meta = {}) {
        this.name = name;
        this.content = content;
        this.parent = parent;
        this.meta = meta;
        this.hidden = meta.hidden === true;
        if (meta.runState) {
            this.runState = meta.runState;
        }
        setLock(this, meta);
    }

    get fullName(): string {
        return getFullName(this);
    }

    get root(): Directory {
        return getRoot(this);
    }

    get extension(): string {
        return this.name.substring(this.name.indexOf(".") + 1);
    }

    get size(): number {
        return this.content.length;
    }

    get isExecutable(): boolean {
        return typeof this.meta.run === "function";
    }

    run(ctx: RunContext) {
        if (!this.isExecutable) return;
        this.tempContent = "";
        this.meta.run?.call(this, this.output, ctx);
        if (this.tempContent) {
            this.content = this.tempContent;
        }
    }

    private output = (line: string) => {
        this.tempContent += `${line}\n`;
    };
}

export class Directory {
    protected readonly children: Record<string, FileNode> = {};
    readonly name: string;
    readonly meta: Meta;
    parent: Directory | undefined;
    locked = false;
    hidden = false;

    constructor(name: string, parent: Directory | undefined = undefined, meta: Meta = {}) {
        this.name = name;
        this.meta = meta;
        this.hidden = meta.hidden === true;
        if (parent) {
            this.parent = parent;
        }
        setLock(this, meta);
    }

    get fullName(): string {
        return getFullName(this);
    }

    get fileCount(): number {
        return Object.keys(this.children).length;
    }

    get contents(): FileNode[] {
        return Object.values(this.children);
    }

    get root(): Directory {
        return getRoot(this);
    }

    addDirectory(directory: Directory) {
        if (this.children[directory.name]) {
            throw Error(`FileNode already exists: ${this.fullName}${SEPARATOR}${directory.name}`);
        }
        directory.parent = this;
        this.children[directory.name] = directory;
        return directory;
    }

    createDirectory(name: string, meta = {}): Directory {
        if (name.indexOf(SEPARATOR) !== -1) {
            const newDirectoryStructure = createDirectoryStructure(name);
            const newDirectoryStructureRoot = newDirectoryStructure.root;
            this.addDirectory(newDirectoryStructureRoot);
            return newDirectoryStructure;
        }

        if (this.children[name]) {
            throw Error(`FileNode already exists: ${this.fullName}${SEPARATOR}${name}`);
        }

        const newDirectory = new Directory(name, this, meta);
        this.children[name] = newDirectory;
        return newDirectory;
    }

    createFile(name: string, content: string, meta: Meta = {}): File {
        if (this.children[name]) {
            throw Error(`FileNode already exists: ${this.fullName}${SEPARATOR}${name}`);
        }

        const newFile = new File(name, content, this, meta);
        this.children[name] = newFile;
        return newFile;
    }

    fileExists(name: string): boolean {
        return !!this.children[name];
    }

    getFileNode(name: string): FileNode {
        return this.children[name];
    }

    remove(name: string): void {
        delete this.children[name];
    }
}

function getRoot(node: FileNode): Directory {
    let directory: Directory = node instanceof Directory ? node : node.parent;
    while (directory.parent) {
        directory = directory.parent;
    }
    return directory;
}

function getFullName(node: FileNode): string {
    let fullName = node.name;
    let parent = node.parent;
    while (parent) {
        fullName = `${parent.name}${SEPARATOR}${fullName}`;
        parent = parent.parent;
    }
    return fullName;
}

function setLock(node: FileNode, meta: Meta) {
    if (meta.key || meta.password) {
        node.locked = true;
    }
}

/** Find a node by its full path (e.g. "$ROOT/users/evan/diary/may1.txt"). */
export function findNode(root: Directory, fullPath: string): FileNode | undefined {
    const parts = fullPath.split(SEPARATOR).filter(Boolean);
    let current: FileNode | undefined = root;

    for (const part of parts) {
        if (!(current instanceof Directory)) return undefined;
        current = current.getFileNode(part);
        if (!current) return undefined;
    }
    return current;
}

/**
 * Create a directory structure and returns the last directory (imagine mkdir -p)
 * @param fullName the full path to create a directory structure for
 */
export function createDirectoryStructure(fullName: string): Directory {
    const nameParts = fullName.split(SEPARATOR);

    let directory: Directory | undefined;
    for (const part of nameParts) {
        if (!directory) {
            directory = new Directory(part);
        } else {
            directory = directory.createDirectory(part);
        }
    }
    // biome-ignore lint/style/noNonNullAssertion: guaranteed to be set after loop
    return directory!;
}

/**
 * Unlocks a FileNode and returns its root Directory
 * @param fileNode FileNode to unlock
 */
export function unlockFileNode(fileNode: FileNode): Directory {
    fileNode.locked = false;
    return fileNode.root;
}
