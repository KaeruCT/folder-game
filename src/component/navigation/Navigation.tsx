import { FolderTree, PackageSearch, ScrollText } from "lucide-react";
import "./Navigation.scss";

export enum View {
    FILESYSTEM,
    INVENTORY,
    LOG,
}

const views = [View.FILESYSTEM, View.INVENTORY, View.LOG];

const viewTitles: Record<View, string> = {
    [View.FILESYSTEM]: "Filesystem",
    [View.INVENTORY]: "Inventory",
    [View.LOG]: "Log",
};

const viewIcons: Record<View, React.ReactNode> = {
    [View.FILESYSTEM]: <FolderTree size={24} />,
    [View.INVENTORY]: <PackageSearch size={24} />,
    [View.LOG]: <ScrollText size={24} />,
};

interface ViewsProps {
    currentView: View;
    setView: (view: View) => void;
}

function Navigation({ currentView, setView }: ViewsProps) {
    return (
        <div className="navigation-list">
            {views.map((view) => (
                <button
                    type="button"
                    key={view}
                    onClick={() => setView(view)}
                    className={`navigation-button ${currentView === view ? "selected" : ""}`}
                    aria-label={viewTitles[view]}
                >
                    {viewIcons[view]}
                </button>
            ))}
        </div>
    );
}

export default Navigation;
