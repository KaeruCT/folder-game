const SEPARATOR = '/';

type FileNode = {
    name: string;
    parent: FileNode | undefined;
}

export class File {
    readonly name: string;
    readonly content: string;
    readonly parent: Directory;

    constructor(name: string, content: string, parent: Directory) {
        this.name = name;
        this.content = content;
        this.parent = parent;
    }

    get fullName(): string {
        return getFullName(this);
    }

    get extension(): string {
        return this.name.substring(this.name.indexOf('.'));
    }

    get size(): number {
        return this.content.length;
    }
}

export class Directory {
    readonly children: Record<string, FileNode> = {};
    readonly name: string;
    readonly parent: Directory | undefined;

    constructor(name: string, parent: Directory | undefined = undefined) {
        this.name = name;
        if (parent) {
            this.parent = parent;
        }
    }

    get fullName(): string {
        return getFullName(this);
    }

    get fileCount(): number {
        return Object.keys(this.children).length;
    }

    get root(): Directory {
        let directory: Directory = this;
        while (directory.parent) {
            directory = directory.parent;
        }
        return directory;
    }

    createDirectory(name: string): Directory {
        if (this.children[name]) {
            throw Error(`FileNode already exists: ${this.fullName}${SEPARATOR}${name}`);
        }

        const newDirectory = new Directory(name, this);
        this.children[name] = newDirectory;
        return newDirectory;
    }

    createFile(name: string, content: string): File {
        if (this.children[name]) {
            throw Error(`FileNode already exists: ${this.fullName}${SEPARATOR}${name}`);
        }

        const newFile = new File(name, content, this);
        this.children[name] = newFile;
        return newFile;
    }

    remove(name: string): void {
        delete this.children[name];
    }
}

function getFullName(node: FileNode): string {
    let fullName = node.name;
    let parent = node.parent;
    while (parent) {
        fullName = `${parent.name}${SEPARATOR}${fullName}`
        parent = parent.parent;
    }
    return fullName;
}

/**
 * Create a directory structure and returns the last directory (imagine mkdir -p)
 * @param fullName the full path to create a directory structure for
 */
export function createDirectoryStructure(fullName: string): Directory {
    const nameParts = fullName.split(SEPARATOR);

    let directory: Directory | undefined = undefined;
    let root: Directory;
    for (const part of nameParts) {
        if (!directory) {
            directory = new Directory(part);
            root = directory;
        } else {
            directory = directory.createDirectory(part);
        }
    }
    return directory!;
}

function tab(level: number): string {
    let tab = '';
    for (let i = 0; i < level; i++) {
        tab += '--';
    }
    return tab;
}

export function prettyPrint(directory: Directory, level = 0): string {
    let output = `${tab(level)}${directory.name}/\n`;

    for (const node of Object.values(directory.children)) {
        if (node instanceof Directory) {
            output += prettyPrint(node, level + 1);
        } else {
            output += `${tab(level + 1)}${node.name}\n`;
        }
    }

    return output;
}