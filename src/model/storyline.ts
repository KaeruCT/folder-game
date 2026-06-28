import type { Directory } from "./files";
import type { Inventory } from "./inventory";
import type { LogEntry } from "./log";

export interface Storyline {
    id: string;
    name: string;
    description: string;
    hook?: string;
    playtime?: string;
    tags?: string[];
    hidden?: boolean;
    buildFilesystem(): Directory;
    getInitialInventory(): Inventory;
    getInitialLogEntries?(): LogEntry[];
}
