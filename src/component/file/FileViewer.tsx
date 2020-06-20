import React, { useState, useEffect } from "react";
import "./FileViewer.scss";
import { File } from "../../model/files";

function corruptContent(content: string): string {
    return content.split("").map((_, i) => {
        if (content[i] === "\n") return content[i];

        if (Math.random() < 0.001) {
            return ".";
        }
        if (Math.random() < 0.005) {
            return content[i + 1] || content[i - 1];
        }
        if (Math.random() > 0.2) {
            return content[i].toLowerCase();
        }
        return content[i].toUpperCase();
    }).join("");
}

interface ContentProps {
    file: File;
    content: string;
}

function FileContent({ file, content }: ContentProps) {
    if (file.meta.corrupted) {
        return <CorruptedFileContent content={content} file={file} />;
    }
    return <>{content}</>;
}

function CorruptedFileContent({ content }: ContentProps) {
    const TIMEOUT = 400;
    const [corruptedContent, setCorruptedContent] = useState(content);

    useEffect(() => {
        const interval = setInterval(() => {
            setCorruptedContent(corruptContent(content));
        }, TIMEOUT);

        return () => {
            clearInterval(interval);
        }
    });

    return <>{corruptedContent}</>;
}

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
            <pre><FileContent content={lines.slice(0, line).join('\n')} file={file} /></pre>
        </div>
    );
}

function PlainTextOutput({ file }: OutputProps) {
    return (
        <div className="content file-content">
            <pre><FileContent content={file.content} file={file} /></pre>
        </div>
    );
}
interface Props {
    file: File;
    onClose: () => void;
}
function FileViewer({ file, onClose }: Props) {
    let Output = PlainTextOutput;

    if (file.isExecutable || file.extension === "exe") {
        // check for extension to allow for "fake" executables
        // that just print out their content
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