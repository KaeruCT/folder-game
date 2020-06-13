import React from "react";
import "./App.scss";
import { getFilesystem } from "./model/game";
import FilesystemViewer from "./component/file/FilesystemViewer";

const root = getFilesystem();

function App() {
  return (
    <div className="app">
      {/* <pre>{prettyPrint(root)}</pre> */}
      <FilesystemViewer root={root} />
    </div>
  );
}

export default App;
