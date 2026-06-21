import { useMemo } from "react";
import "./DirectoryView.scss";
import { FolderTree } from "lucide-react";
import { Directory, type File } from "../../model/files";
import DirectoryItem from "./DirectoryItem";

interface Props {
    directory: Directory;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
    onToggleView: () => void;
}

function DirectoryView({ directory, onNavigate, onFileOpen, onToggleView }: Props) {
    const fileNodes = useMemo(() => {
        const available = directory.contents.filter((fn) => !fn.hidden);
        const nodes = [...available].sort((a, b) => {
            const aIsDir = a instanceof Directory;
            const bIsDir = b instanceof Directory;
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.name.localeCompare(b.name);
        });
        if (directory.parent) {
            nodes.unshift(directory.parent);
        }
        return nodes;
    }, [directory]);

    return (
        <div className="window directory">
            <div className="title">
                {directory.fullName}
                <button type="button" className="tree-toggle" onClick={onToggleView} title="Switch to tree view">
                    <FolderTree size={18} strokeWidth={1.5} />
                </button>
            </div>
            <div className="content">
                <div className="file-list">
                    {fileNodes.map((fileNode) => (
                        <DirectoryItem
                            isParent={fileNode === directory.parent}
                            fileNode={fileNode}
                            onNavigate={onNavigate}
                            onFileOpen={onFileOpen}
                            key={fileNode.fullName}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DirectoryView;
