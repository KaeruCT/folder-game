import {
    Component,
    createContext,
    type PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import "./App.scss";
import FilesystemViewer from "./component/file/FilesystemViewer";
import InventoryViewer from "./component/inventory/InventoryViewer";
import LogViewer from "./component/log/LogViewer";
import StorylineSelect from "./component/storyline/StorylineSelect";
import FloatingOverlay from "./component/ui/FloatingOverlay";
import HeaderBar from "./component/ui/HeaderBar";
import { clearAllTimers, Directory, File, type FileNode } from "./model/files";
import { deleteSave, loadSnapshot } from "./model/save";
import { type Action, deferredActions, getInitialState, getNullState, reducer, type State } from "./reducer";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
};

export const AppStore = createContext({} as Store);

const TREE_MODE_KEY = "folder-game-view-mode";

function loadTreeMode(): boolean {
    try {
        return localStorage.getItem(TREE_MODE_KEY) === "1";
    } catch {
        return false;
    }
}

function saveTreeMode(showTree: boolean) {
    try {
        localStorage.setItem(TREE_MODE_KEY, showTree ? "1" : "0");
    } catch {
        // ignore
    }
}

class ErrorBoundary extends Component<PropsWithChildren, { error: Error | null }> {
    state = { error: null as Error | null };

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="crash-screen" style={{ padding: 40, textAlign: "center" }}>
                    <h2 style={{ color: "var(--color-goal)" }}>Something broke</h2>
                    <p style={{ color: "var(--text-secondary)" }}>{this.state.error.message}</p>
                    <button type="button" className="styled-button" onClick={() => this.setState({ error: null })}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function loadState(): { ok: State } | { error: string } | { empty: true } {
    const loaded = loadSnapshot();
    if (loaded && "error" in loaded) return { error: loaded.error };
    if (loaded && "snapshot" in loaded) {
        const result = getInitialState(loaded.snapshot.storylineId ?? "lockdown");
        if (typeof result === "string") return { error: result };
        return { ok: result };
    }
    return { empty: true };
}

function resolveInitial(): State {
    const result = loadState();
    if ("ok" in result) return result.ok;
    return getNullState();
}

function countFiles(node: FileNode): number {
    if (node instanceof File) return 1;
    if (!(node instanceof Directory)) return 0;
    return node.contents.reduce((total, child) => total + countFiles(child), 0);
}

function App() {
    const memoizedReducer = useCallback(reducer, []);
    const [state, dispatch] = useReducer(memoizedReducer, resolveInitial());
    const saveTimer = useRef<ReturnType<typeof setTimeout>>();
    const [loadError] = useState(() => {
        const result = loadState();
        return "error" in result ? result.error : null;
    });

    // Persisted tree view mode
    const [showTree, setShowTree] = useState(loadTreeMode);
    const toggleTree = useCallback(() => {
        setShowTree((prev) => {
            const next = !prev;
            saveTreeMode(next);
            return next;
        });
    }, []);

    // Floating overlay state
    const [inventoryOpen, setInventoryOpen] = useState(false);
    const [logOpen, setLogOpen] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: dispatch identity is stable
    const toggleInventory = useCallback(() => {
        setInventoryOpen((prev) => !prev);
        dispatch({ type: "MARK_INVENTORY_READ", payload: null });
    }, [dispatch]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: dispatch identity is stable
    const toggleLog = useCallback(() => {
        setLogOpen((prev) => !prev);
        dispatch({ type: "MARK_LOG_READ", payload: null });
    }, [dispatch]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: dispatch identity is stable but explicit is clearer
    const storeValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    useEffect(() => {
        if (state.storylineId === "") return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            dispatch({ type: "SAVE_GAME", payload: null });
        }, 500);
        return () => clearTimeout(saveTimer.current);
    }, [state]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: must drain after every state change
    useEffect(() => {
        while (deferredActions.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: guarded by while length check
            const action = deferredActions.shift()!;
            dispatch(action);
        }
    }, [state]);

    useEffect(() => {
        if (state.storylineId === "") return;

        function isEditableTarget(target: EventTarget | null): boolean {
            if (!(target instanceof HTMLElement)) return false;
            return (
                target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
            );
        }

        function onKeyDown(event: KeyboardEvent) {
            if (
                event.defaultPrevented ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                isEditableTarget(event.target)
            ) {
                return;
            }

            if (event.key === "Escape") {
                if (state.file) {
                    event.preventDefault();
                    dispatch({ type: "SET_FILE", payload: null });
                    return;
                }
                if (inventoryOpen) {
                    event.preventDefault();
                    setInventoryOpen(false);
                    return;
                }
                if (logOpen) {
                    event.preventDefault();
                    setLogOpen(false);
                }
                return;
            }

            if (document.querySelector(".modal")) return;

            if (event.key === "Backspace" && !state.file && state.cwd.parent) {
                event.preventDefault();
                dispatch({ type: "SET_CWD", payload: state.cwd.parent });
                return;
            }

            if (event.key === "Home" && state.cwd !== state.filesystemRoot) {
                event.preventDefault();
                dispatch({ type: "SET_CWD", payload: state.filesystemRoot });
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [state.storylineId, state.file, state.cwd, state.filesystemRoot, inventoryOpen, logOpen]);

    const handleStartOver = useCallback(() => {
        clearAllTimers();
        deferredActions.length = 0;
        deleteSave();
        window.location.reload();
    }, []);

    if (loadError) {
        return (
            <div className="app">
                <div className="view-container">
                    <div style={{ padding: 40, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
                        <h2 style={{ color: "var(--color-goal)" }}>Save Data Error</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>{loadError}</p>
                        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
                            Your saved progress cannot be loaded. You&apos;ll need to start over.
                        </p>
                        <button
                            type="button"
                            className="styled-button"
                            onClick={handleStartOver}
                            style={{ background: "var(--color-goal)" }}
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (state.storylineId === "") {
        return (
            <div className="app">
                <div className="view-container">
                    <StorylineSelect dispatch={dispatch} />
                </div>
            </div>
        );
    }

    const headerTitle = state.cwd.fullName;
    const recentEntries = [...state.logEntries].reverse();
    const currentGoal = recentEntries.find((entry) => entry.category === "goal")?.text;
    const finalChoice = recentEntries.find((entry) => entry.category === "milestone")?.text;
    const evidenceEntries = recentEntries.filter((entry) => entry.category === "milestone").slice(0, 4);
    const storyComplete = state.gamePhase >= 97;
    const totalFileCount = countFiles(state.filesystemRoot);
    const missedFileCount = Math.max(totalFileCount - new Set(state.readFiles).size, 0);

    return (
        <ErrorBoundary>
            <AppStore.Provider value={storeValue}>
                <div className="app">
                    <HeaderBar
                        title={headerTitle}
                        showTree={showTree}
                        onToggleTree={toggleTree}
                        onToggleInventory={toggleInventory}
                        onToggleLog={toggleLog}
                        inventoryOpen={inventoryOpen}
                        logOpen={logOpen}
                        unreadInventoryCount={state.unreadInventoryCount}
                        unreadLogCount={state.unreadLogCount}
                    />
                    {storyComplete ? (
                        <div className="completion-banner">
                            <div>
                                <strong>Story complete</strong>
                                <span>
                                    {finalChoice ? `${finalChoice} · ` : ""}
                                    {state.readFiles.length}/{totalFileCount} files discovered · {missedFileCount}{" "}
                                    optional secrets missed
                                </span>
                            </div>
                            <button type="button" onClick={handleStartOver}>
                                Choose another storyline
                            </button>
                        </div>
                    ) : currentGoal ? (
                        <div className="current-goal" aria-live="polite">
                            <span>Current goal</span>
                            <strong>{currentGoal}</strong>
                            {evidenceEntries.length > 0 && (
                                <div className="evidence-panel">
                                    <span>Evidence collected</span>
                                    <ul>
                                        {evidenceEntries.map((entry) => (
                                            <li key={entry.id}>{entry.text}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}
                    <div className="view-container">
                        <FilesystemViewer showTree={showTree} />
                    </div>

                    {inventoryOpen && (
                        <FloatingOverlay title="Inventory" onClose={() => setInventoryOpen(false)} right={76}>
                            <InventoryViewer overlay />
                        </FloatingOverlay>
                    )}
                    {logOpen && (
                        <FloatingOverlay title="Log" onClose={() => setLogOpen(false)} right={42}>
                            <LogViewer overlay entries={state.logEntries} />
                        </FloatingOverlay>
                    )}
                </div>
            </AppStore.Provider>
        </ErrorBoundary>
    );
}

export default App;
