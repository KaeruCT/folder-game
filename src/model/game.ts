import type { Directory } from "./files";
import type { Inventory } from "./inventory";
import type { LogEntry } from "./log";
import type { Storyline } from "./storyline";
import agentStoryline from "./storylines/agent";
import echoesStoryline from "./storylines/echoes";
import lockdownStoryline from "./storylines/lockdown";
import unsaidStoryline from "./storylines/unsaid";

const storylines: Record<string, Storyline> = {
    agent: agentStoryline,
    echoes: echoesStoryline,
    lockdown: lockdownStoryline,
    unsaid: unsaidStoryline,
};

export function getAllStorylines(): Storyline[] {
    return Object.values(storylines);
}

export function getFilesystem(storylineId: string): Directory {
    const storyline = storylines[storylineId];
    if (!storyline) throw new Error(`Unknown storyline: ${storylineId}`);
    return storyline.buildFilesystem();
}

export function getInventory(storylineId: string): Inventory {
    const storyline = storylines[storylineId];
    if (!storyline) throw new Error(`Unknown storyline: ${storylineId}`);
    return storyline.getInitialInventory();
}

export function getInitialLogEntries(storylineId: string): LogEntry[] {
    const storyline = storylines[storylineId];
    if (!storyline) throw new Error(`Unknown storyline: ${storylineId}`);
    return storyline.getInitialLogEntries?.() ?? defaultLogEntries();
}

function defaultLogEntries(): LogEntry[] {
    const now = Date.now();
    return [
        { id: `log-${now}-0`, timestamp: now, category: "story" as const, text: "You've accessed the system." },
        {
            id: `log-${now}-1`,
            timestamp: now,
            category: "goal" as const,
            text: "Explore the filesystem to understand what happened here.",
        },
    ];
}
