import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "./LogToast.scss";
import { AppStore } from "../../App";
import type { LogCategory } from "../../model/log";

const CATEGORY_LABELS: Record<LogCategory, string> = {
    story: "Story",
    goal: "Goal",
    milestone: "Milestone",
    system: "System",
};

function LogToast() {
    const { state } = useContext(AppStore);
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
    const timerRef = useRef<ReturnType<typeof setTimeout>>();
    const prevLenRef = useRef(state.logEntries.length);

    const latestEntry = state.logEntries[state.logEntries.length - 1];
    const isNew = state.logEntries.length > prevLenRef.current;
    prevLenRef.current = state.logEntries.length;

    const dismiss = useCallback(() => {
        if (latestEntry) {
            setDismissedIds((prev) => {
                const next = new Set(prev);
                next.add(latestEntry.id);
                return next;
            });
        }
    }, [latestEntry]);

    // Auto-dismiss after 8 seconds when a new entry arrives
    useEffect(() => {
        if (!latestEntry || !isNew) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(dismiss, 8000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [latestEntry, isNew, dismiss]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
                e.preventDefault();
                dismiss();
            }
        },
        [dismiss],
    );

    if (!latestEntry || dismissedIds.has(latestEntry.id)) return null;

    return (
        <div
            className={`log-toast log-toast--${latestEntry.category}`}
            onClick={dismiss}
            onKeyDown={handleKeyDown}
            role="status"
            aria-live="polite"
        >
            <span className="log-toast__badge">{CATEGORY_LABELS[latestEntry.category]}</span>
            <span className="log-toast__text">{latestEntry.text}</span>
            <button
                type="button"
                className="log-toast__close"
                onClick={(e) => {
                    e.stopPropagation();
                    dismiss();
                }}
                aria-label="Dismiss"
            >
                ×
            </button>
        </div>
    );
}

export default LogToast;
