export type LogCategory = "story" | "goal" | "milestone" | "system";

export interface LogEntry {
    id: string;
    timestamp: number;
    category: LogCategory;
    text: string;
}

let nextId = 0;

export function createLogEntry(category: LogCategory, text: string): LogEntry {
    return {
        id: `log-${Date.now()}-${nextId++}`,
        timestamp: Date.now(),
        category,
        text,
    };
}
