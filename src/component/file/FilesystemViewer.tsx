import React, { useContext } from "react";
import { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";
import { AppStore } from "../../App";

function FilesystemViewer() {
    const { state, dispatch } = useContext(AppStore);

    function setDirectory(directory: Directory) {
        dispatch({ type: "SET_CWD", payload: directory });
    }

    function setFile(file: File | null) {
        dispatch({ type: "SET_FILE", payload: file });
    }

    if (state.file) {
        return (
            <FileViewer file={state.file} onClose={() => setFile(null)} />
        );
    }

    return (
        <DirectoryView directory={state.cwd} onNavigate={setDirectory} onFileOpen={setFile} />
    )
}

export default FilesystemViewer;