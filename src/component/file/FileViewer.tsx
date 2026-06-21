import { useContext, useEffect, useMemo, useRef, useState } from "react";
import "./FileViewer.scss";
import { AppStore } from "../../App";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
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

function AudioResourceOutput({ file }: OutputProps) {
    return (
        <div className="content media-content" style={{ background: "transparent", padding: 20 }}>
            {/* biome-ignore lint/a11y/useMediaCaption: game content, captions not applicable */}
            <audio src={file.content} controls autoPlay style={{ width: "100%" }} />
        </div>
    );
}

function ChoiceOutput({ file, onClose }: { file: File; onClose: () => void }) {
    const { dispatch } = useContext(AppStore);
    // biome-ignore lint/suspicious/noExplicitAny: generic action payload from meta
    const choices = file.meta.choices as { label: string; action: { type: string; payload: any } }[] | undefined;

    if (!choices || choices.length === 0) {
        return <PlainTextOutput file={file} />;
    }

    return (
        <div className="content file-content">
            <FileContent content={file.content} file={file} />
            <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {choices.map((choice) => (
                    <button
                        key={choice.label}
                        type="button"
                        className="styled-button"
                        onClick={() => {
                            // biome-ignore lint/suspicious/noExplicitAny: generic action from meta
                            dispatch(choice.action as any);
                            onClose();
                        }}
                    >
                        {choice.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

interface Props {
    file: File;
    onClose: () => void;
}
function FileViewer({ file, onClose }: Props) {
    if (file.meta.choices) {
        return (
            <div className="window file-viewer">
                <div className="title">
                    {file.name}
                    <button type="button" className="close-button" onClick={() => onClose()} title="close">
                        &times;
                    </button>
                </div>
                <ChoiceOutput file={file} onClose={onClose} />
            </div>
        );
    }

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

    if (AUDIO_EXTENSIONS.includes(file.extension)) {
        Output = AudioResourceOutput;
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
