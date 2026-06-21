import "./DirectoryView.scss";
import { Directory, type File } from "../../model/files";
import DirectoryItem from "./DirectoryItem";

interface Props {
    directory: Directory;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
}

function DirectoryView({ directory, onNavigate, onFileOpen }: Props) {
    const availableFileNodes = directory.contents.filter((fileNode) => !fileNode.hidden);
    const fileNodes = [...availableFileNodes].sort((a, b) => {
        const aIsDir = a instanceof Directory;
        const bIsDir = b instanceof Directory;
        // directories first
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        // within same type, sort by name
        return a.name.localeCompare(b.name);
    });
    if (directory.parent) {
        fileNodes.unshift(directory.parent);
    }
    return (
        <div className="window directory">
            <div className="title">{directory.fullName}</div>
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
