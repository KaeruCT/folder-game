import { Fragment, useContext, useState } from "react";
import "./DirectoryItem.scss";
import { FileCode, File as FileIcon, FileImage, FileVideo, Folder, FolderUp, Lock, Trash2 } from "lucide-react";
import { AppStore } from "../../App";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
import { Directory, type File, type FileNode, isMediaFileNode } from "../../model/files";
import { getItemInfo } from "../../model/items";
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
    if (fileNode.locked) {
        return <Lock size={size} strokeWidth={1.5} />;
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
    const { state, dispatch } = useContext(AppStore);
    const [showModal, setShowModal] = useState(false);

    function attemptUnlock() {
        dispatch({ type: "UNLOCK_FILENODE", payload: fileNode });
        setShowModal(false);
        // Open files immediately; navigate into directories
        if (fileNode instanceof Directory) {
            onNavigate(fileNode);
        } else {
            onFileOpen(fileNode as File);
        }
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
    const keyName = fileNode.meta.key ? getItemInfo(fileNode.meta.key).name : "key";
    const hasKey = fileNode.meta.key ? Boolean(state.inventory[fileNode.meta.key]) : false;
    const nodeKind = fileNode instanceof Directory ? "folder" : "file";
    const isNew = state.highlightedPaths.includes(fileNode.fullName);
    const isMedia = isMediaFileNode(fileNode);
    const className = `directory-item${fileNode.locked ? " locked" : ""}${isNew ? " directory-item--new" : ""}${isMedia ? " directory-item--media" : ""}`;

    return (
        <Fragment>
            <Modal show={showModal} onConfirm={attemptUnlock} onCancel={() => setShowModal(false)}>
                {hasKey
                    ? `Unlock ${nodeKind} “${fileNode.name}” with ${keyName}?`
                    : `“${fileNode.name}” requires ${keyName}. Find it, then come back.`}
            </Modal>
            <button type="button" onClick={onClick} title={fileNode.name} className={className}>
                <div className="directory-item__icon">
                    <NodeIcon fileNode={fileNode} isParent={isParent} />
                </div>
                <div className="directory-item__name">{name || "\u00A0"}</div>
                {isNew && (
                    <span className="directory-item__badge" aria-hidden="true">
                        new
                    </span>
                )}
                {isMedia && (
                    <span className="directory-item__meta" aria-hidden="true">
                        media
                    </span>
                )}
            </button>
        </Fragment>
    );
}

export default DirectoryItem;
