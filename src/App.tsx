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
import InventoryToast from "./component/inventory/InventoryToast";
import InventoryViewer from "./component/inventory/InventoryViewer";
import LogToast from "./component/log/LogToast";
import LogViewer from "./component/log/LogViewer";
import Navigation, { View } from "./component/navigation/Navigation";
import StorylineSelect from "./component/storyline/StorylineSelect";
import { clearAllTimers } from "./model/files";
import { deleteSave, loadSnapshot } from "./model/save";
import { type Action, deferredActions, getInitialState, getNullState, reducer, type State } from "./reducer";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
};

export const AppStore = createContext({} as Store);

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

function App() {
    const memoizedReducer = useCallback(reducer, []);
    const [state, dispatch] = useReducer(memoizedReducer, resolveInitial());
    const [view, setView] = useState(View.FILESYSTEM);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>();
    const [loadError] = useState(() => {
        const result = loadState();
        return "error" in result ? result.error : null;
    });

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

    return (
        <ErrorBoundary>
            <div className="app">
                <div className="view-container">
                    <AppStore.Provider value={storeValue}>
                        {view === View.FILESYSTEM && <FilesystemViewer />}
                        {view === View.INVENTORY && <InventoryViewer />}
                        {view === View.LOG && <LogViewer />}
                        <LogToast />
                        <InventoryToast />
                    </AppStore.Provider>
                </div>
                <Navigation currentView={view} setView={setView} />
            </div>
        </ErrorBoundary>
    );
}

export default App;
