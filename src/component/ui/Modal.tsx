import type { PropsWithChildren } from "react";
import "./Modal.scss";

interface ModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function Modal({ show, onConfirm, onCancel, children }: PropsWithChildren<ModalProps>) {
    if (!show) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <div>{children}</div>
                <div className="modal-options">
                    <button type="button" className="styled-button" onClick={() => onCancel()}>
                        Cancel
                    </button>
                    <button type="button" className="styled-button" onClick={() => onConfirm()}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
