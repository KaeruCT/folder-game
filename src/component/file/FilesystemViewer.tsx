import { useCallback, useContext, useEffect, useState } from "react";
import { AppStore } from "../../App";
import type { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";
import TreeView from "./TreeView";

const TREE_STATE_KEY = "folder-game-tree-expanded";

function loadExpandedState(storylineId: string): Set<string> {
    try {
        const raw = localStorage.getItem(`${TREE_STATE_KEY}-${storylineId}`);
        if (raw) {
            return new Set(JSON.parse(raw) as string[]);
        }
    } catch {
        // corrupted — start fresh
    }
    return new Set();
}

function saveExpandedState(storylineId: string, expanded: Set<string>) {
    try {
        localStorage.setItem(`${TREE_STATE_KEY}-${storylineId}`, JSON.stringify([...expanded]));
    } catch {
        // storage full or unavailable — silently ignore
    }
}

function FilesystemViewer() {
    const { state, dispatch } = useContext(AppStore);
    const [showTree, setShowTree] = useState(false);

    const [expanded, setExpanded] = useState<Set<string>>(() => {
        const persisted = loadExpandedState(state.storylineId);
        // Ensure root and cwd ancestors are always expanded
        const s = new Set(persisted);
        s.add(state.filesystemRoot.fullName);
        let dir: Directory | undefined = state.cwd;
        while (dir) {
            s.add(dir.fullName);
            dir = dir.parent;
        }
        return s;
    });

    // Persist expanded state to localStorage whenever it changes
    useEffect(() => {
        saveExpandedState(state.storylineId, expanded);
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

    const toggleView = useCallback(() => {
        setShowTree((prev) => !prev);
    }, []);

    if (state.file) {
        return <FileViewer file={state.file} onClose={() => setFile(null)} />;
    }

    if (showTree) {
        return (
            <TreeView
                onFileOpen={setFile}
                onToggleView={toggleView}
                expanded={expanded}
                onToggleExpand={toggleExpand}
            />
        );
    }

    return (
        <DirectoryView directory={state.cwd} onNavigate={setDirectory} onFileOpen={setFile} onToggleView={toggleView} />
    );
}

export default FilesystemViewer;
