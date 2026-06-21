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
import Navigation, { View } from "./component/navigation/Navigation";
import StorylineSelect from "./component/storyline/StorylineSelect";
import { loadSnapshot } from "./model/save";
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
                    <h2>Something broke</h2>
                    <p>{this.state.error.message}</p>
                    <button type="button" className="styled-button" onClick={() => this.setState({ error: null })}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function resolveInitialState(): State {
    const snapshot = loadSnapshot();
    if (snapshot) {
        const id = snapshot.storylineId ?? "lockdown";
        return getInitialState(id);
    }
    return getNullState();
}

function App() {
    const memoizedReducer = useCallback(reducer, []);
    const [state, dispatch] = useReducer(memoizedReducer, resolveInitialState());
    const [view, setView] = useState(View.FILESYSTEM);
    const saveTimer = useRef<ReturnType<typeof setTimeout>>();

    // biome-ignore lint/correctness/useExhaustiveDependencies: dispatch identity is stable but explicit is clearer
    const storeValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    useEffect(() => {
        if (state.storylineId === "") return; // don't auto-save before storyline selected
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            dispatch({ type: "SAVE_GAME", payload: null });
        }, 500);
        return () => clearTimeout(saveTimer.current);
    }, [state]);

    // Drain deferred actions (from callbacks, executables, and timers)
    // biome-ignore lint/correctness/useExhaustiveDependencies: state is the trigger
    useEffect(() => {
        while (deferredActions.length > 0) {
            // biome-ignore lint/style/noNonNullAssertion: guarded by while length check
            const action = deferredActions.shift()!;
            dispatch(action);
        }
    }, [state]);

    // Show storyline selection if no storyline is active
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
                    </AppStore.Provider>
                </div>
                <Navigation currentView={view} setView={setView} />
            </div>
        </ErrorBoundary>
    );
}

export default App;
