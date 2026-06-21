import { Fragment, useContext, useState } from "react";
import "./DirectoryItem.scss";
import { AppStore } from "../../App";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../../model/data";
import { Directory, type File, type FileNode } from "../../model/files";
import browserIcon from "../icons/browser.svg";
import parentIcon from "../icons/folder.svg";
import folderIcon from "../icons/folder-3.svg";
import imageIcon from "../icons/image.svg";
import televisionIcon from "../icons/television.svg";
import textIcon from "../icons/text-5.svg";
import trashIcon from "../icons/trash.svg";
import Modal from "../ui/Modal";

interface Props {
    fileNode: FileNode;
    isParent: boolean;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
}

function Icon({ fileNode, isParent }: { fileNode: FileNode; isParent: boolean }) {
    if (isParent) {
        return <img src={parentIcon} alt="" />;
    }
    if (fileNode.name === "trash") {
        return <img src={trashIcon} alt="" />;
    }
    if (fileNode instanceof Directory) {
        return <img src={folderIcon} alt="" />;
    }
    if (fileNode.extension === "exe") {
        return <img src={browserIcon} alt="" />;
    }
    if (IMAGE_EXTENSIONS.includes(fileNode.extension)) {
        return <img src={imageIcon} alt="" />;
    }
    if (VIDEO_EXTENSIONS.includes(fileNode.extension)) {
        return <img src={televisionIcon} alt="" />;
    }
    return <img src={textIcon} alt="" />;
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
                <Icon fileNode={fileNode} isParent={isParent} />
                {name || "\u00A0"}
            </button>
        </Fragment>
    );
}

export default DirectoryItem;
