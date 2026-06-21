import { useCallback, useContext, useState } from "react";
import { AppStore } from "../../App";
import type { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";
import TreeView from "./TreeView";

function FilesystemViewer() {
    const { state, dispatch } = useContext(AppStore);
    const [showTree, setShowTree] = useState(false);

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
        return <TreeView onFileOpen={setFile} onToggleView={toggleView} />;
    }

    return (
        <DirectoryView directory={state.cwd} onNavigate={setDirectory} onFileOpen={setFile} onToggleView={toggleView} />
    );
}

export default FilesystemViewer;
