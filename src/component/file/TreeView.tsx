import { useCallback, useContext, useMemo, useState } from "react";
import "./TreeView.scss";
import { AppStore } from "../../App";
import { Directory, type File, type FileNode } from "../../model/files";

interface Props {
    onFileOpen: (file: File) => void;
    onToggleView: () => void;
}

function TreeView({ onFileOpen, onToggleView }: Props) {
    const { state } = useContext(AppStore);
    const root = state.filesystemRoot;
    const cwd = state.cwd;

    const [expanded, setExpanded] = useState<Set<string>>(() => {
        const s = new Set<string>();
        s.add(root.fullName);
        let dir: Directory | undefined = cwd;
        while (dir) {
            s.add(dir.fullName);
            dir = dir.parent;
        }
        return s;
    });

    const toggleExpand = useCallback((path: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const tree = useMemo(() => {
        function renderNode(node: FileNode, depth: number): React.ReactNode {
            if (node.hidden) return null;

            const isDir = node instanceof Directory;
            const isExpanded = expanded.has(node.fullName);
            const isCwd = node === cwd;
            const isLocked = node.locked;

            const children = isDir
                ? node.contents
                      .filter((c) => !c.hidden)
                      .sort((a, b) => {
                          const aIsDir = a instanceof Directory;
                          const bIsDir = b instanceof Directory;
                          if (aIsDir && !bIsDir) return -1;
                          if (!aIsDir && bIsDir) return 1;
                          return a.name.localeCompare(b.name);
                      })
                : [];

            function handleClick() {
                if (isLocked) {
                    return;
                }
                if (isDir) {
                    toggleExpand(node.fullName);
                } else {
                    onFileOpen(node as File);
                }
            }

            function handleKeyDown(e: React.KeyboardEvent) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }

            const className = `tree-node tree-node--${isDir ? "dir" : "file"}${isCwd ? " tree-node--cwd" : ""}${isLocked ? " tree-node--locked" : ""}`;

            const row = (
                <div
                    className="tree-node__row"
                    style={{ paddingLeft: depth * 16 + 8 }}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    role="treeitem"
                    tabIndex={0}
                    aria-expanded={isDir ? isExpanded : undefined}
                    aria-selected={isCwd}
                    title={isLocked ? `${node.name} (locked)` : node.name}
                >
                    <span className="tree-node__arrow">
                        {isDir ? (isExpanded ? "▼" : children.length > 0 || isLocked ? "▶" : " ") : " "}
                    </span>
                    <span className="tree-node__icon">{isDir ? "📁" : "📄"}</span>
                    <span className="tree-node__name">{node.name}</span>
                    {isLocked && <span className="tree-node__lock">🔒</span>}
                </div>
            );

            if (!isDir || !isExpanded) {
                return (
                    <li key={node.fullName} className={className} role="none">
                        {row}
                    </li>
                );
            }

            return (
                <li key={node.fullName} className={className} role="none">
                    {row}
                    {/* biome-ignore lint/a11y/useSemanticElements: <ul role="group"> is valid ARIA for tree children */}
                    <ul role="group">{children.map((child) => renderNode(child, depth + 1))}</ul>
                </li>
            );
        }

        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <ul role="tree"> is the WAI-ARIA recommended tree pattern
        return <ul role="tree">{renderNode(root, 0)}</ul>;
    }, [root, cwd, expanded, onFileOpen, toggleExpand]);

    return (
        <div className="window tree">
            <div className="title">
                {root.name}
                <button type="button" className="tree-toggle" onClick={onToggleView} title="Switch to directory view">
                    📂
                </button>
            </div>
            <div className="content tree-content">{tree}</div>
        </div>
    );
}

export default TreeView;
