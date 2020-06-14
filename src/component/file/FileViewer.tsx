import React from "react";
import "./FileViewer.scss";
import { File } from "../../model/files";

interface Props {
    file: File;
    onClose: () => void;
}

function FileViewer({ file, onClose }: Props) {
    return (
        <div className="file-viewer">
            <div>{file.name}</div>
            <button className="close-button" onClick={() => onClose()}>Close</button>
            <div className="file-content">
                <pre>{file.content}</pre>
            </div>
        </div>
    );
}

export default FileViewer;