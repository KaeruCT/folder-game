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

/** Initial log entries set when starting a new game. */
export function getInitialLogEntries(): LogEntry[] {
    const now = Date.now();
    return [
        {
            id: `log-${now}-${nextId++}`,
            timestamp: now,
            category: "story",
            text: "Evan's deadman switch activated. You've gained access to his system.",
        },
        {
            id: `log-${now}-${nextId++}`,
            timestamp: now,
            category: "goal",
            text: "Lock out other hackers before they lock you out. Check the help directory.",
        },
    ];
}
