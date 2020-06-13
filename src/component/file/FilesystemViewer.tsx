import React, { useReducer } from "react";
import { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";

interface State {
    directory: Directory;
}

interface Props {
    root: Directory;
}

type ActionType = 'SET_DIRECTORY';

interface Action {
    type: ActionType;
    payload: any;
}

function reducer(state: State, action: Action) {
    switch (action.type) {
        case 'SET_DIRECTORY':
            return { ...state, directory: action.payload };
        default:
            throw new Error();
    }
}

function FilesystemViewer({ root }: Props) {
    const [state, dispatch] = useReducer(reducer, { directory: root });

    function setDirectory(directory: Directory) {
        dispatch({ type: 'SET_DIRECTORY', payload: directory });
    }

    function openFile(file: File) {
        console.log("file ", file.name, " opened");
    }

    return (
        <DirectoryView directory={state.directory} onNavigate={setDirectory} onFileOpen={openFile} />
    )
}

export default FilesystemViewer;