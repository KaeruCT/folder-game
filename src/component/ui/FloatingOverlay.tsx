import { type PropsWithChildren, useCallback, useEffect, useRef } from "react";
import "./FloatingOverlay.scss";

interface Props {
    title: string;
    onClose: () => void;
}

function FloatingOverlay({ title, onClose, children }: PropsWithChildren<Props>) {
    const ref = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        },
        [onClose],
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss */}
            <div className="floating-backdrop" onClick={onClose} />
            <div className="floating-overlay" ref={ref} role="dialog" aria-label={title}>
                <div className="floating-overlay__header">
                    <span>{title}</span>
                    <button type="button" className="floating-overlay__close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="floating-overlay__body">{children}</div>
            </div>
        </>
    );
}

export default FloatingOverlay;
