const SEPARATOR = "/";

export type FileNode = Directory | File;

type LoggerFunction = (line: string) => void;

type Meta = {
    [key: string]: any,
    run?: (this: File, log: LoggerFunction) => void
};

export class File {
    readonly name: string;
    content: string;
    tempContent: string = ""; // used only by exes that log output
    readonly parent: Directory;
    readonly meta: Meta;
    locked = false;
    hidden = false;

    constructor(name: string, content: string, parent: Directory, meta: Meta = {}) {
        this.name = name;
        this.content = content;
        this.parent = parent;
        this.meta = meta;
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
        return typeof this.meta.run === 'function';
    }

    run() {
        if (!this.isExecutable) return;
        this.tempContent = "";
        this.meta.run!.call(this, this.output);
        if (this.tempContent) {
            this.content = this.tempContent;
        }
    }

    private output = (line: string) => {
        this.tempContent += `${line}\n`;
    }
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

/**
 * Create a directory structure and returns the last directory (imagine mkdir -p)
 * @param fullName the full path to create a directory structure for
 */
export function createDirectoryStructure(fullName: string): Directory {
    const nameParts = fullName.split(SEPARATOR);

    let directory: Directory | undefined = undefined;
    for (const part of nameParts) {
        if (!directory) {
            directory = new Directory(part);
        } else {
            directory = directory.createDirectory(part);
        }
    }
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

function tab(level: number): string {
    let tab = "";
    for (let i = 0; i < level; i++) {
        tab += "--";
    }
    return tab;
}

export function prettyPrint(directory: Directory, level = 0): string {
    let output = `${tab(level)}${directory.name}/\n`;

    for (const node of directory.contents) {
        if (node instanceof Directory) {
            output += prettyPrint(node, level + 1);
        } else {
            output += `${tab(level + 1)}${node.name}\n`;
        }
    }

    return output;
}