import { useContext, useEffect, useRef, useState } from "react";
import "./FileViewer.scss";
import { AppStore } from "../../App";
import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
import { File, findNode } from "../../model/files";

// ---------------------------------------------------------------------------
// Corrupted content (flickering)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Typewriter engine — reveals characters one at a time
// ---------------------------------------------------------------------------

// Typewriter speed. Set window.__TYPEWRITER_SPEED__ to override (e.g. 1 for tests).
function getSpeed(): number {
    // biome-ignore lint/suspicious/noExplicitAny: test-only window override
    const override = (window as any).__TYPEWRITER_SPEED__;
    return typeof override === "number" ? override : 4;
}

function Typewriter({ content, className }: { content: string; className?: string }) {
    const [revealed, setRevealed] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setRevealed((prev) => {
                const next = prev + 1;
                if (next >= content.length) {
                    clearInterval(intervalRef.current);
                }
                return next < content.length ? next : prev;
            });
        }, getSpeed());
        return () => clearInterval(intervalRef.current);
    }, [content.length]);

    const visible = content.slice(0, revealed);

    if (className === "corrupted") {
        return <CorruptedText content={visible} />;
    }

    return <div className="file-text">{visible}</div>;
}

function CorruptedText({ content }: { content: string }) {
    const TIMEOUT = 400;
    const [glitched, setGlitched] = useState(content);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitched(corruptContent(content));
        }, TIMEOUT);
        return () => clearInterval(interval);
    }, [content]);

    return <div className="file-text file-text--corrupted">{glitched}</div>;
}

// ---------------------------------------------------------------------------
// Output components
// ---------------------------------------------------------------------------

interface OutputProps {
    file: File;
}

function PlainTextOutput({ file }: OutputProps) {
    return (
        <div className="content file-content">
            <Typewriter key={file.content} content={file.content} />
        </div>
    );
}

function ExeOutput({ file }: OutputProps) {
    return (
        <div className="content file-content exe">
            <div className="exe-status" aria-hidden="true">
                <span className="exe-status__pulse" />
                <span>process running</span>
            </div>
            <Typewriter key={file.content} content={file.content} />
        </div>
    );
}

function CorruptedOutput({ file }: OutputProps) {
    return (
        <div className="content file-content">
            <Typewriter key={file.content} content={file.content} className="corrupted" />
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
    const { state, dispatch } = useContext(AppStore);
    const choices = file.meta.choices as { label: string; action: { type: string; payload: unknown } }[] | undefined;

    const [typewriterDone, setTypewriterDone] = useState(false);

    if (!choices || choices.length === 0) {
        return <PlainTextOutput file={file} />;
    }

    return (
        <div className="content file-content">
            <Typewriter key={file.content} content={file.content} />
            {/* Choices appear after a brief pause once typewriter finishes */}
            {typewriterDone && (
                <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {choices.map((choice) => (
                        <button
                            key={choice.label}
                            type="button"
                            className="styled-button"
                            onClick={() => {
                                const revealedNode =
                                    choice.action.type === "REVEAL_FILE"
                                        ? findNode(state.filesystemRoot, choice.action.payload as string)
                                        : undefined;
                                // biome-ignore lint/suspicious/noExplicitAny: generic action from meta
                                dispatch(choice.action as any);
                                if (revealedNode instanceof File) {
                                    dispatch({ type: "SET_FILE", payload: revealedNode });
                                    return;
                                }
                                onClose();
                            }}
                        >
                            {choice.label}
                        </button>
                    ))}
                </div>
            )}
            {!typewriterDone && <ChoiceRevealTimer content={file.content} onDone={() => setTypewriterDone(true)} />}
        </div>
    );
}

/** Tiny invisible component that fires onDone after the typewriter finishes. */
function ChoiceRevealTimer({ content, onDone }: { content: string; onDone: () => void }) {
    useEffect(() => {
        const delay = content.length * getSpeed() + 400; // 400ms extra pause
        const id = setTimeout(onDone, delay);
        return () => clearTimeout(id);
    }, [content.length, onDone]);
    return null;
}

// ---------------------------------------------------------------------------
// FileViewer
// ---------------------------------------------------------------------------

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

    if (file.meta.corrupted) {
        Output = CorruptedOutput;
    } else if (file.isExecutable || file.extension === "exe") {
        Output = ExeOutput;
    } else if (IMAGE_EXTENSIONS.includes(file.extension)) {
        Output = ImageResourceOutput;
    } else if (VIDEO_EXTENSIONS.includes(file.extension)) {
        Output = VideoResourceOutput;
    } else if (AUDIO_EXTENSIONS.includes(file.extension)) {
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
