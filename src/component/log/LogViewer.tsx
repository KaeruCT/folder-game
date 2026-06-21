import { useMemo } from "react";
import "./LogViewer.scss";
import type { LogCategory, LogEntry } from "../../model/log";

const CATEGORY_LABELS: Record<LogCategory, string> = {
    story: "Story",
    goal: "Goal",
    milestone: "Milestone",
    system: "System",
};

function formatTime(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

interface Props {
    overlay?: boolean;
    entries: LogEntry[];
}

function LogViewer({ overlay, entries }: Props) {
    const sorted = useMemo(() => [...entries].reverse(), [entries]);

    if (sorted.length === 0) {
        const empty = (
            <div className="log-empty">
                <p>No events yet. Explore the filesystem to discover the story.</p>
            </div>
        );
        if (overlay) return <>{empty}</>;
        return (
            <div className="window log">
                <div className="content">{empty}</div>
            </div>
        );
    }

    const list = (
        <div className="log-list">
            {sorted.map((entry: LogEntry) => (
                <div key={entry.id} className={`log-entry log-entry--${entry.category}`}>
                    <div className="log-entry__header">
                        <span className="log-entry__badge">{CATEGORY_LABELS[entry.category]}</span>
                        <span className="log-entry__time">{formatTime(entry.timestamp)}</span>
                    </div>
                    <div className="log-entry__text">{entry.text}</div>
                </div>
            ))}
        </div>
    );

    if (overlay) return <>{list}</>;

    return (
        <div className="window log">
            <div className="content">{list}</div>
        </div>
    );
}

export default LogViewer;
