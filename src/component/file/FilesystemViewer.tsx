import React, { useState } from "react";
import { Directory, File } from "../../model/files";
import DirectoryView from "./DirectoryView";
import FileViewer from "./FileViewer";

interface Props {
    root: Directory;
}

function FilesystemViewer({ root }: Props) {
    const [directory, setDirectory] = useState(root);
    const [file, setFile] = useState<File | null>(null);

    function openFile(file: File) {
        console.log("file ", file.name, " opened");
        setFile(file);
    }

    if (file) {
        return (
            <FileViewer file={file} onClose={() => setFile(null)} />
        );
    }

    return (
        <DirectoryView directory={directory} onNavigate={setDirectory} onFileOpen={openFile} />
    )
}

export default FilesystemViewer;