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

type UiSoundKind = "file" | "folder" | "close" | "toggle" | "locked" | "choice" | "item" | "unlock" | "ending";

type Store = {
    state: State;
    dispatch: React.Dispatch<Action>;
    playSound: (kind: UiSoundKind) => void;
};

export const AppStore = createContext({} as Store);

const TREE_MODE_KEY = "folder-game-view-mode";
const SOUND_KEY = "folder-game-sound";

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

function loadSoundEnabled(): boolean {
    try {
        return localStorage.getItem(SOUND_KEY) !== "0";
    } catch {
        return true;
    }
}

function saveSoundEnabled(enabled: boolean) {
    try {
        localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
    } catch {
        // ignore
    }
}

let uiAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
    if (!window.AudioContext) return null;
    uiAudioContext ??= new window.AudioContext();
    if (uiAudioContext.state === "suspended") void uiAudioContext.resume();
    return uiAudioContext;
}

function playTone(
    audio: AudioContext,
    frequency: number,
    duration: number,
    {
        delay = 0,
        endFrequency = frequency,
        volume = 0.035,
        type = "sine",
    }: {
        delay?: number;
        endFrequency?: number;
        volume?: number;
        type?: OscillatorType;
    } = {},
) {
    const now = audio.currentTime + delay;
    const gain = audio.createGain();
    const oscillator = audio.createOscillator();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
}

function playDust(audio: AudioContext, duration: number, volume = 0.018) {
    const bufferSize = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = audio.createBufferSource();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    source.start();
}

function playUiSound(kind: UiSoundKind) {
    const audio = getAudioContext();
    if (!audio) return;

    switch (kind) {
        case "file":
            playTone(audio, 620, 0.07, { endFrequency: 470, volume: 0.026 });
            playDust(audio, 0.035, 0.008);
            break;
        case "folder":
            playTone(audio, 180, 0.08, { endFrequency: 260, volume: 0.025, type: "triangle" });
            break;
        case "close":
            playTone(audio, 360, 0.05, { endFrequency: 220, volume: 0.018 });
            break;
        case "toggle":
            playTone(audio, 520, 0.04, { endFrequency: 520, volume: 0.016 });
            break;
        case "locked":
            playTone(audio, 115, 0.09, { endFrequency: 92, volume: 0.028, type: "sawtooth" });
            playDust(audio, 0.06, 0.01);
            break;
        case "choice":
            playTone(audio, 330, 0.08, { endFrequency: 495, volume: 0.028, type: "triangle" });
            break;
        case "item":
            playTone(audio, 660, 0.09, { endFrequency: 990, volume: 0.03 });
            playTone(audio, 990, 0.08, { delay: 0.07, endFrequency: 1180, volume: 0.018 });
            break;
        case "unlock":
            playTone(audio, 220, 0.08, { endFrequency: 330, volume: 0.026, type: "triangle" });
            playTone(audio, 440, 0.11, { delay: 0.06, endFrequency: 660, volume: 0.024 });
            break;
        case "ending":
            playTone(audio, 146.83, 0.28, { endFrequency: 220, volume: 0.032, type: "triangle" });
            playTone(audio, 293.66, 0.24, { delay: 0.09, endFrequency: 440, volume: 0.018, type: "sine" });
            break;
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
    const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
    const [storyFlash, setStoryFlash] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(loadSoundEnabled);

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

    const playSound = useCallback(
        (kind: UiSoundKind) => {
            if (soundEnabled) playUiSound(kind);
        },
        [soundEnabled],
    );

    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => {
            const next = !prev;
            playUiSound("toggle");
            saveSoundEnabled(next);
            return next;
        });
    }, []);

    // biome-ignore lint/correctness/useExhaustiveDependencies: dispatch identity is stable but explicit is clearer
    const storeValue = useMemo(() => ({ state, dispatch, playSound }), [state, dispatch, playSound]);

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
        if (!state.feedback) return;
        setFeedbackToast(state.feedback.text);
        setStoryFlash(true);
        playSound(state.feedback.kind);
        const toastId = setTimeout(() => setFeedbackToast(null), 2200);
        const flashId = setTimeout(() => setStoryFlash(false), 520);
        return () => {
            clearTimeout(toastId);
            clearTimeout(flashId);
        };
    }, [state.feedback, playSound]);

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
                    playSound("close");
                    dispatch({ type: "SET_FILE", payload: null });
                    return;
                }
                if (inventoryOpen) {
                    event.preventDefault();
                    playSound("close");
                    setInventoryOpen(false);
                    return;
                }
                if (logOpen) {
                    event.preventDefault();
                    playSound("close");
                    setLogOpen(false);
                }
                return;
            }

            if (document.querySelector(".modal")) return;

            if (event.key === "Backspace" && !state.file && state.cwd.parent) {
                event.preventDefault();
                playSound("close");
                dispatch({ type: "SET_CWD", payload: state.cwd.parent });
                return;
            }

            if (event.key === "Home" && state.cwd !== state.filesystemRoot) {
                event.preventDefault();
                playSound("folder");
                dispatch({ type: "SET_CWD", payload: state.filesystemRoot });
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [state.storylineId, state.file, state.cwd, state.filesystemRoot, inventoryOpen, logOpen, playSound]);

    const handleStartOver = useCallback(() => {
        clearAllTimers();
        deferredActions.length = 0;
        deleteSave();
        window.location.reload();
    }, []);

    const handleReplay = useCallback(() => {
        const storylineId = state.storylineId;
        clearAllTimers();
        deferredActions.length = 0;
        deleteSave();
        dispatch({ type: "SELECT_STORYLINE", payload: storylineId });
    }, [state.storylineId]);

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
    const discoveredFileCount = new Set(state.readFiles).size;
    const missedFileCount = Math.max(totalFileCount - discoveredFileCount, 0);
    const endingTitle = finalChoice?.replace(/^You chose to /, "").replace(/\.$/, "") ?? "your ending";
    const shareLine = `I got “${endingTitle}” in Root — ${discoveredFileCount}/${totalFileCount} files found.`;

    const handleCopyShare = async () => {
        try {
            await navigator.clipboard.writeText(shareLine);
            setFeedbackToast("Ending copied");
        } catch {
            setFeedbackToast(shareLine);
        }
    };

    return (
        <ErrorBoundary>
            <AppStore.Provider value={storeValue}>
                <div className={`app${storyFlash ? " app--flash" : ""}`}>
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
                        soundEnabled={soundEnabled}
                        onToggleSound={toggleSound}
                    />
                    {feedbackToast && <div className="feedback-toast">{feedbackToast}</div>}
                    {storyComplete ? (
                        <div className="completion-banner">
                            <div className="completion-banner__summary">
                                <strong>Story complete</strong>
                                <span className="completion-banner__ending">{endingTitle}</span>
                                <span>
                                    {discoveredFileCount}/{totalFileCount} files discovered · {missedFileCount} optional
                                    secrets missed
                                </span>
                                <code>{shareLine}</code>
                            </div>
                            <div className="completion-banner__actions">
                                <button type="button" onClick={handleCopyShare}>
                                    Share ending
                                </button>
                                <button type="button" onClick={handleReplay}>
                                    Replay story
                                </button>
                                <button type="button" onClick={handleStartOver}>
                                    Try another
                                </button>
                            </div>
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
                        <FloatingOverlay
                            title="Inventory"
                            onClose={() => {
                                playSound("close");
                                setInventoryOpen(false);
                            }}
                            right={76}
                        >
                            <InventoryViewer overlay />
                        </FloatingOverlay>
                    )}
                    {logOpen && (
                        <FloatingOverlay
                            title="Log"
                            onClose={() => {
                                playSound("close");
                                setLogOpen(false);
                            }}
                            right={42}
                        >
                            <LogViewer overlay entries={state.logEntries} />
                        </FloatingOverlay>
                    )}
                </div>
            </AppStore.Provider>
        </ErrorBoundary>
    );
}

export default App;
