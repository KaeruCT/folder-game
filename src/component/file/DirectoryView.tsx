import { useContext, useMemo } from "react";
import "./DirectoryView.scss";
import { AppStore } from "../../App";
import { compareFileNodes, type Directory, type File } from "../../model/files";
import DirectoryItem from "./DirectoryItem";

interface Props {
    directory: Directory;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
    revealCounter: number;
}

function DirectoryView({ directory, onNavigate, onFileOpen, revealCounter }: Props) {
    const { state } = useContext(AppStore);
    const highlightedPaths = state.highlightedPaths ?? [];

    // biome-ignore lint/correctness/useExhaustiveDependencies: revealCounter is a state primitive, changes trigger re-renders
    const fileNodes = useMemo(() => {
        const available = directory.contents.filter((fn) => !fn.hidden);
        const nodes = [...available].sort((a, b) => {
            const newDelta =
                Number(highlightedPaths.includes(b.fullName)) - Number(highlightedPaths.includes(a.fullName));
            if (newDelta !== 0) return newDelta;
            return compareFileNodes(a, b);
        });
        if (directory.parent) {
            nodes.unshift(directory.parent);
        }
        return nodes;
    }, [directory, revealCounter, highlightedPaths]);

    return (
        <div className="window directory">
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
