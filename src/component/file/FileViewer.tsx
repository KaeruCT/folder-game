import React, { useState, useEffect } from "react";
import "./FileViewer.scss";
import { File } from "../../model/files";

interface OutputProps {
    file: File;
}

function ExeOutput({ file }: OutputProps) {
    const TIMEOUT = 600;

    const lines = file.content.split('\n');
    const [line, setLine] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLine(line + 1);

            if (line === lines.length - 1) {
                clearInterval(interval);
            }
        }, TIMEOUT);

        return () => {
            clearInterval(interval);
        }
    });

    return (
        <div className="content file-content exe">
            <pre>{lines.slice(0, line).join('\n')}</pre>
        </div>
    );
}

function PlainTextOutput({ file }: OutputProps) {
    return (
        <div className="content file-content">
            <pre>{file.content}</pre>
        </div>
    );
}
interface Props {
    file: File;
    onClose: () => void;
}
function FileViewer({ file, onClose }: Props) {
    let Output = PlainTextOutput;

    if (file.isExecutable) {
        Output = ExeOutput;
    }

    return (
        <div className="window file-viewer">
            <div className="title">
                {file.name}
                <button className="close-button" onClick={() => onClose()} title="close">&times;</button>
            </div>
            <Output file={file} />
        </div>
    );
}

export default FileViewer;