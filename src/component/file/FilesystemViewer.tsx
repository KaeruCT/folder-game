import React, { useState } from "react";
import { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";

interface Props {
    root: Directory;
}

function FilesystemViewer({ root }: Props) {
    const [directory, setDirectory] = useState(root);

    function openFile(file: File) {
        console.log("file ", file.name, " opened");
    }

    return (
        <DirectoryView directory={directory} onNavigate={setDirectory} onFileOpen={openFile} />
    )
}

export default FilesystemViewer;