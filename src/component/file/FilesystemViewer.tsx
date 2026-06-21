import { useContext } from "react";
import { AppStore } from "../../App";
import type { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";

function FilesystemViewer() {
    const { state, dispatch } = useContext(AppStore);

    function setDirectory(directory: Directory) {
        dispatch({ type: "SET_CWD", payload: directory });
    }

    function setFile(file: File | null) {
        dispatch({ type: "SET_FILE", payload: file });
    }

    if (state.file) {
        return <FileViewer file={state.file} onClose={() => setFile(null)} />;
    }

    return <DirectoryView directory={state.cwd} onNavigate={setDirectory} onFileOpen={setFile} />;
}

export default FilesystemViewer;
