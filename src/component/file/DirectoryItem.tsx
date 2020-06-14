import React, { useContext } from "react";
import "./DirectoryItem.scss";
import { Directory, File, FileNode } from "../../model/files";

import folderIcon from "../icons/folder-3.svg";
import textIcon from "../icons/text-5.svg";
import parentIcon from "../icons/folder.svg";
import { AppDispatch } from "../../App";

interface Props {
    fileNode: FileNode;
    isParent: boolean;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
}

function Icon({ fileNode, isParent }: { fileNode: FileNode, isParent: boolean }) {
    if (isParent) {
        return <img src={parentIcon} alt="" />;
    }
    if (fileNode instanceof Directory) {
        return <img src={folderIcon} alt="" />;
    }
    return <img src={textIcon} alt="" />;
}

function DirectoryItem({ fileNode, isParent, onNavigate, onFileOpen }: Props) {
    const dispatch = useContext(AppDispatch);

    function onClick() {
        if (fileNode.locked) {
            if (window.confirm("Attempt unlocking?")) {
                dispatch({ type: "UNLOCK_FILENODE", payload: fileNode });
            }
            return;
        }

        if (fileNode instanceof Directory) {
            return onNavigate(fileNode);
        }

        onFileOpen(fileNode as File);
    }

    const name = isParent ? '..' : (fileNode.name || ' ');

    return (
        <button onClick={onClick} title={fileNode.name} className={`directory-item ${fileNode.locked ? "locked" : ""}`}>
            <Icon fileNode={fileNode} isParent={isParent} />
            {name}
        </button>
    );
}

export default DirectoryItem;