import React from "react";
import "./Navigation.scss";
import filesystemIcon from "../icons/filesystem.svg";
import inventoryIcon from "../icons/inventory.svg";
import logIcon from "../icons/log.svg";

export enum View {
    FILESYSTEM,
    INVENTORY,
    LOG,
};

const views = [
    View.FILESYSTEM,
    View.INVENTORY,
    View.LOG,
];

const viewTitles = {
    [View.FILESYSTEM]: "Filesystem",
    [View.INVENTORY]: "Inventory",
    [View.LOG]: "Log",
};

const viewIcons = {
    [View.FILESYSTEM]: filesystemIcon,
    [View.INVENTORY]: inventoryIcon,
    [View.LOG]: logIcon,
};

interface ViewsProps {
    currentView: View;
    setView: (view: View) => void;
}

function Navigation({ currentView, setView }: ViewsProps) {
    return (
        <div className="navigation-list">
            {views.map(view => (
                <button
                    key={view}
                    onClick={() => setView(view)}
                    className={`navigation-button ${currentView === view ? "selected" : ""}`}>
                    <img alt={viewTitles[view]} src={viewIcons[view]} />
                </button>
            ))}
        </div>
    );
}

export default Navigation;