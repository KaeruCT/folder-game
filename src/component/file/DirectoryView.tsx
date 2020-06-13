import React from "react";
import "./DirectoryView.scss";
import { Directory, File, FileNode } from "../../model/files";
import sortBy from "lodash/sortBy";
import Item from "./Item";

interface Props {
    directory: Directory;
    onNavigate: (directory: Directory) => void;
    onFileOpen: (file: File) => void;
}

function DirectoryView({ directory, onNavigate, onFileOpen }: Props) {
    const fileNodes = sortBy([...directory.contents], [
        { name: 'asc' },
        (fileNode) => !(fileNode instanceof Directory)]
    );
    if (directory.parent) {
        fileNodes.unshift(directory.parent);
    }
    return (
        <div className="directory">
            <div className="title">{directory.fullName}</div>
            <div className="item-list">
                {fileNodes.map((fileNode) => (
                    <Item
                        isParent={fileNode === directory.parent}
                        fileNode={fileNode}
                        onNavigate={onNavigate}
                        onFileOpen={onFileOpen}
                        key={fileNode.fullName}
                    />
                ))}
            </div>
        </div>
    );
}

export default DirectoryView;