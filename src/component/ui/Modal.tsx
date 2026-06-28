import type { PropsWithChildren } from "react";
import { useEffect, useRef } from "react";

interface ModalProps {
    show: boolean;
    onConfirm?: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

function Modal({
    show,
    onConfirm,
    onCancel,
    confirmLabel = "OK",
    cancelLabel = "Cancel",
    children,
}: PropsWithChildren<ModalProps>) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show) return;
        const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialogRef.current?.focus();
        return () => previousFocus?.focus();
    }, [show]);

    useEffect(() => {
        if (!show) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [show, onCancel]);

    if (!show) return null;

    return (
        <div className="modal">
            <div
                className="modal-content"
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label="Game dialog"
                tabIndex={-1}
            >
                <div>{children}</div>
                <div className="modal-options">
                    <button type="button" className="styled-button" onClick={() => onCancel()}>
                        {cancelLabel}
                    </button>
                    {onConfirm && (
                        <button type="button" className="styled-button" onClick={() => onConfirm()}>
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Modal;
