import type { Directory } from "./files";
import type { Inventory } from "./inventory";
import type { LogEntry } from "./log";

export interface Storyline {
    id: string;
    name: string;
    description: string;
    buildFilesystem(): Directory;
    getInitialInventory(): Inventory;
    getInitialLogEntries?(): LogEntry[];
}
