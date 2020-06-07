import React from 'react';
import './App.css';
import { prettyPrint, createDirectoryStructure } from './model/files';

const newDir = createDirectoryStructure("/Users/darkl/Desktop/muexport/31may2020");
const root = newDir.root;
const notes = newDir.createDirectory("liner_notes");
notes.createFile("hello.txt", "this is a message");
notes.createFile("hello2.txt", "this is a message");
newDir.createFile("track1.wav", "...");
newDir.createFile("track2.wav", "...");
root.createFile("secrets.txt", "do not dead open inside");

function App() {
  return (
    <div className="App">
      <pre>{prettyPrint(root)}</pre>
    </div>
  );
}

export default App;
