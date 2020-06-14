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
            <div className="title">
                {file.name}
                <button className="close-button" onClick={() => onClose()} title="close">&times;</button>
            </div>
            <div className="file-content">
                <pre>{file.content}</pre>
            </div>
        </div>
    );
}

export default FileViewer;