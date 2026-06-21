import { useCallback, useContext } from "react";
import { AppStore } from "../../App";
import type { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";
import TreeView from "./TreeView";

interface Props {
    showTree: boolean;
}

function FilesystemViewer({ showTree }: Props) {
    const { state, dispatch } = useContext(AppStore);

    const setDirectory = useCallback(
        (directory: Directory) => {
            dispatch({ type: "SET_CWD", payload: directory });
        },
        [dispatch],
    );

    const setFile = useCallback(
        (file: File | null) => {
            dispatch({ type: "SET_FILE", payload: file });
        },
        [dispatch],
    );

    if (state.file) {
        return <FileViewer file={state.file} onClose={() => setFile(null)} />;
    }

    // Expand state is still managed here for tree persistence
    return <TreeModeView showTree={showTree} cwd={state.cwd} onNavigate={setDirectory} onFileOpen={setFile} />;
}

export default FilesystemViewer;

// ---------------------------------------------------------------------------
// Inner component to own tree-expanded state (so it survives file open/close)
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";

function TreeModeView({
    showTree,
    cwd,
    onNavigate,
    onFileOpen,
}: {
    showTree: boolean;
    cwd: Directory;
    onNavigate: (d: Directory) => void;
    onFileOpen: (f: File) => void;
}) {
    const { state } = useContext(AppStore);

    const [expanded, setExpanded] = useState<Set<string>>(() => {
        // Always expand root and cwd ancestors
        const s = new Set<string>();
        s.add(state.filesystemRoot.fullName);
        let dir: Directory | undefined = cwd;
        while (dir) {
            s.add(dir.fullName);
            dir = dir.parent;
        }
        // Load persisted state
        try {
            const raw = localStorage.getItem(`folder-game-tree-expanded-${state.storylineId}`);
            if (raw) {
                for (const p of JSON.parse(raw) as string[]) {
                    s.add(p);
                }
            }
        } catch {
            // ignore
        }
        return s;
    });

    useEffect(() => {
        try {
            localStorage.setItem(`folder-game-tree-expanded-${state.storylineId}`, JSON.stringify([...expanded]));
        } catch {
            // ignore
        }
    }, [expanded, state.storylineId]);

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

    if (showTree) {
        return (
            <TreeView
                onFileOpen={onFileOpen}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                revealCounter={state.revealCounter}
            />
        );
    }

    return (
        <DirectoryView
            directory={cwd}
            onNavigate={onNavigate}
            onFileOpen={onFileOpen}
            revealCounter={state.revealCounter}
        />
    );
}
