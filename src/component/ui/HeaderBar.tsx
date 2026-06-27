import { ArrowLeft, Folder, FolderTree, Home, PackageSearch, ScrollText, Settings } from "lucide-react";
import { useCallback, useContext, useState } from "react";
import "./HeaderBar.scss";
import { AppStore } from "../../App";
import { clearAllTimers, type Directory } from "../../model/files";
import { deleteSave } from "../../model/save";
import { deferredActions } from "../../reducer";

interface Props {
    title: string;
    showTree: boolean;
    onToggleTree: () => void;
    onToggleInventory: () => void;
    onToggleLog: () => void;
    inventoryOpen: boolean;
    logOpen: boolean;
    unreadInventoryCount: number;
    unreadLogCount: number;
}

function badge(count: number) {
    if (count <= 0) return null;
    const label = count > 9 ? "9+" : String(count);
    return <span className="header-bar__badge">{label}</span>;
}

const ICON_SIZE = 20;

function HeaderBar({
    title,
    showTree,
    onToggleTree,
    onToggleInventory,
    onToggleLog,
    inventoryOpen,
    logOpen,
    unreadInventoryCount,
    unreadLogCount,
}: Props) {
    const { state, dispatch } = useContext(AppStore);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const handleSave = useCallback(() => {
        dispatch({ type: "SAVE_GAME", payload: null });
        setSettingsOpen(false);
    }, [dispatch]);

    const handleReset = useCallback(() => {
        clearAllTimers();
        deferredActions.length = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key?.startsWith("folder-game-")) {
                localStorage.removeItem(key);
            }
        }
        deleteSave();
        window.location.reload();
    }, []);

    const ancestors: Directory[] = [];
    let current: Directory | undefined = state.cwd;
    while (current) {
        ancestors.unshift(current);
        current = current.parent;
    }

    const navigateTo = useCallback(
        (directory: Directory) => {
            dispatch({ type: "SET_CWD", payload: directory });
        },
        [dispatch],
    );

    return (
        <div className="header-bar">
            <button
                type="button"
                className="header-bar__btn header-bar__btn--nav"
                onClick={() => state.cwd.parent && navigateTo(state.cwd.parent)}
                disabled={!state.cwd.parent}
                title="Back"
            >
                <ArrowLeft size={ICON_SIZE} strokeWidth={1.5} />
            </button>

            <button
                type="button"
                className="header-bar__btn header-bar__btn--nav"
                onClick={() => navigateTo(state.filesystemRoot)}
                disabled={state.cwd === state.filesystemRoot}
                title="Root"
            >
                <Home size={ICON_SIZE} strokeWidth={1.5} />
            </button>

            <nav className="header-bar__title" aria-label="Current folder path" title={title}>
                {ancestors.map((directory, index) => (
                    <span key={directory.fullName} className="header-bar__crumb-group">
                        {index > 0 && <span className="header-bar__crumb-separator">/</span>}
                        <button
                            type="button"
                            className="header-bar__crumb"
                            onClick={() => navigateTo(directory)}
                            disabled={directory === state.cwd}
                        >
                            {index === 0 ? "root" : directory.name}
                        </button>
                    </span>
                ))}
            </nav>

            <button
                type="button"
                className="header-bar__btn"
                onClick={onToggleTree}
                title={showTree ? "Directory view" : "Tree view"}
            >
                {showTree ? (
                    <Folder size={ICON_SIZE} strokeWidth={1.5} />
                ) : (
                    <FolderTree size={ICON_SIZE} strokeWidth={1.5} />
                )}
            </button>

            <span className="header-bar__divider" />

            <button
                type="button"
                className={`header-bar__btn${inventoryOpen ? " header-bar__btn--active" : ""}`}
                onClick={onToggleInventory}
                title="Inventory"
            >
                <PackageSearch size={ICON_SIZE} strokeWidth={1.5} />
                {inventoryOpen ? null : badge(unreadInventoryCount)}
            </button>

            <button
                type="button"
                className={`header-bar__btn${logOpen ? " header-bar__btn--active" : ""}`}
                onClick={onToggleLog}
                title="Log"
            >
                <ScrollText size={ICON_SIZE} strokeWidth={1.5} />
                {logOpen ? null : badge(unreadLogCount)}
            </button>

            <button
                type="button"
                className={`header-bar__btn${settingsOpen ? " header-bar__btn--active" : ""}`}
                onClick={() => setSettingsOpen((prev) => !prev)}
                title="Settings"
            >
                <Settings size={ICON_SIZE} strokeWidth={1.5} />
            </button>

            {settingsOpen && (
                <>
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
                    {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss */}
                    <div className="floating-backdrop" onClick={() => setSettingsOpen(false)} />
                    <div className="settings-menu">
                        <button type="button" className="settings-menu__item" onClick={handleSave}>
                            Save Now
                        </button>
                        <button
                            type="button"
                            className="settings-menu__item settings-menu__item--danger"
                            onClick={handleReset}
                        >
                            Reset Game
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default HeaderBar;
