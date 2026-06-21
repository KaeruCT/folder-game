import { useEffect, useMemo, useRef, useState } from "react";
import "./FileViewer.scss";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
import type { File } from "../../model/files";

function corruptContent(content: string): string {
    const chars = new Array<string>(content.length);
    for (let i = 0; i < content.length; i++) {
        if (content[i] === "\n") {
            chars[i] = "\n";
            continue;
        }
        if (Math.random() < 0.001) {
            chars[i] = ".";
            continue;
        }
        if (Math.random() < 0.005) {
            chars[i] = content[i + 1] || content[i - 1] || content[i];
            continue;
        }
        chars[i] = Math.random() > 0.2 ? content[i].toLowerCase() : content[i].toUpperCase();
    }
    return chars.join("");
}

interface ContentProps {
    file: File;
    content: string;
}

function FileContent({ file, content }: ContentProps) {
    if (file.meta.corrupted) {
        return <CorruptedFileContent content={content} file={file} />;
    }
    return <pre>{content}</pre>;
}

function CorruptedFileContent({ content }: ContentProps) {
    const TIMEOUT = 400;
    const [corruptedContent, setCorruptedContent] = useState(content);

    useEffect(() => {
        const interval = setInterval(() => {
            setCorruptedContent(corruptContent(content));
        }, TIMEOUT);
        return () => clearInterval(interval);
    }, [content]);

    return <pre>{corruptedContent}</pre>;
}

interface OutputProps {
    file: File;
}

function ExeOutput({ file }: OutputProps) {
    const TIMEOUT = 600;
    const lines = useMemo(() => file.content.split("\n"), [file.content]);
    const [line, setLine] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setLine((prev) => {
                const next = prev + 1;
                return next < lines.length ? next : prev;
            });
        }, TIMEOUT);
        return () => clearInterval(intervalRef.current);
    }, [lines.length]);

    useEffect(() => {
        if (line >= lines.length - 1 && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, [line, lines.length]);

    return (
        <div className="content file-content exe">
            <FileContent content={lines.slice(0, line).join("\n")} file={file} />
        </div>
    );
}

function PlainTextOutput({ file }: OutputProps) {
    return (
        <div className="content file-content">
            <FileContent content={file.content} file={file} />
        </div>
    );
}

function ImageResourceOutput({ file }: OutputProps) {
    return (
        <div className="content media-content">
            <img src={file.content} alt="" loading="lazy" />
        </div>
    );
}

function VideoResourceOutput({ file }: OutputProps) {
    return (
        <div className="content media-content">
            {/* biome-ignore lint/a11y/useMediaCaption: game content, captions not applicable */}
            <video src={file.content} loop controls autoPlay />
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
        Output = ExeOutput;
    }

    if (IMAGE_EXTENSIONS.includes(file.extension)) {
        Output = ImageResourceOutput;
    }

    if (VIDEO_EXTENSIONS.includes(file.extension)) {
        Output = VideoResourceOutput;
    }

    return (
        <div className="window file-viewer">
            <div className="title">
                {file.name}
                <button type="button" className="close-button" onClick={() => onClose()} title="close">
                    &times;
                </button>
            </div>
            <Output file={file} />
        </div>
    );
}

export default FileViewer;
