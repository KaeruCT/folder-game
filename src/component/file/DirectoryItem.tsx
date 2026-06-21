import { Fragment, useContext, useState } from "react";
import "./DirectoryItem.scss";
import { FileCode, File as FileIcon, FileImage, FileVideo, Folder, FolderUp, Lock, Trash2 } from "lucide-react";
import { AppStore } from "../../App";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
import { Directory, type File, type FileNode } from "../../model/files";
import Modal from "../ui/Modal";

interface Props {
    fileNode: FileNode;
    isParent: boolean;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
}

function NodeIcon({ fileNode, isParent }: { fileNode: FileNode; isParent: boolean }) {
    const size = 40;
    if (isParent) {
        return <FolderUp size={size} strokeWidth={1.5} />;
    }
    if (fileNode.name === "trash") {
        return <Trash2 size={size} strokeWidth={1.5} />;
    }
    if (fileNode instanceof Directory) {
        return <Folder size={size} strokeWidth={1.5} />;
    }
    if (fileNode.extension === "exe") {
        return <FileCode size={size} strokeWidth={1.5} />;
    }
    if (IMAGE_EXTENSIONS.includes(fileNode.extension)) {
        return <FileImage size={size} strokeWidth={1.5} />;
    }
    if (VIDEO_EXTENSIONS.includes(fileNode.extension)) {
        return <FileVideo size={size} strokeWidth={1.5} />;
    }
    return <FileIcon size={size} strokeWidth={1.5} />;
}

function DirectoryItem({ fileNode, isParent, onNavigate, onFileOpen }: Props) {
    const { dispatch } = useContext(AppStore);
    const [showModal, setShowModal] = useState(false);

    function attemptUnlock() {
        dispatch({ type: "UNLOCK_FILENODE", payload: fileNode });
        setShowModal(false);
    }

    function onClick() {
        if (fileNode.locked) {
            setShowModal(true);
            return;
        }

        if (fileNode instanceof Directory) {
            return onNavigate(fileNode);
        }

        onFileOpen(fileNode as File);
    }

    const name = isParent ? "" : fileNode.name;

    return (
        <Fragment>
            <Modal show={showModal} onConfirm={attemptUnlock} onCancel={() => setShowModal(false)}>
                Attempt unlocking file {fileNode.name}?
            </Modal>
            <button
                type="button"
                onClick={onClick}
                title={fileNode.name}
                className={`directory-item ${fileNode.locked ? "locked" : ""}`}
            >
                <div className="directory-item__icon">
                    <NodeIcon fileNode={fileNode} isParent={isParent} />
                </div>
                <div className="directory-item__name">{name || "\u00A0"}</div>
                {fileNode.locked && <Lock className="directory-item__lock" size={12} strokeWidth={2} />}
            </button>
        </Fragment>
    );
}

export default DirectoryItem;
