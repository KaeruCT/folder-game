import { useCallback, useContext, useMemo } from "react";
import "./LogViewer.scss";
import { AppStore } from "../../App";
import { clearAllTimers } from "../../model/files";
import type { LogCategory, LogEntry } from "../../model/log";
import { deleteSave } from "../../model/save";
import { deferredActions } from "../../reducer";

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

function LogViewer() {
    const { state, dispatch } = useContext(AppStore);
    const entries = useMemo(() => [...state.logEntries].reverse(), [state.logEntries]);

    const handleReset = useCallback(() => {
        clearAllTimers();
        deferredActions.length = 0;
        deleteSave();
        window.location.reload();
    }, []);

    if (entries.length === 0) {
        return (
            <div className="window log">
                <div className="title">Log</div>
                <div className="content log-empty">
                    <p>No events yet. Explore the filesystem to discover the story.</p>
                </div>
                <div className="log-footer">
                    <button
                        type="button"
                        className="styled-button"
                        onClick={handleReset}
                        style={{ background: "#f44" }}
                    >
                        Reset Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="window log">
            <div className="title">Log</div>
            <div className="content log-list">
                {entries.map((entry: LogEntry) => (
                    <div key={entry.id} className={`log-entry log-entry--${entry.category}`}>
                        <div className="log-entry__header">
                            <span className="log-entry__badge">{CATEGORY_LABELS[entry.category]}</span>
                            <span className="log-entry__time">{formatTime(entry.timestamp)}</span>
                        </div>
                        <div className="log-entry__text">{entry.text}</div>
                    </div>
                ))}
            </div>
            <div className="log-footer">
                <button
                    type="button"
                    className="styled-button"
                    onClick={() => dispatch({ type: "SAVE_GAME", payload: null })}
                    style={{ marginRight: 12 }}
                >
                    Save Now
                </button>
                <button type="button" className="styled-button" onClick={handleReset} style={{ background: "#f44" }}>
                    Reset Game
                </button>
            </div>
        </div>
    );
}

export default LogViewer;
