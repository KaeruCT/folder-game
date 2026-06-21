import { Folder, FolderTree, PackageSearch, ScrollText, Settings } from "lucide-react";
import { useCallback, useContext, useState } from "react";
import "./HeaderBar.scss";
import { AppStore } from "../../App";
import { clearAllTimers } from "../../model/files";
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
    const label = count > 9 ? "*" : String(count);
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
    const { dispatch } = useContext(AppStore);
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

    return (
        <div className="header-bar">
            <span className="header-bar__title">{title}</span>

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
