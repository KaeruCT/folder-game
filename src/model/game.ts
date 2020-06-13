import { createDirectoryStructure } from "./files";

export function getFilesystem() {
    const newDir = createDirectoryStructure("$ROOT/Users/darkl/Desktop/muexport/31may2020");
    const root = newDir.root;
    const notes = newDir.createDirectory("liner_notes");
    notes.createFile("hello.txt", "this is a message");
    notes.createFile("hello2.txt", "this is a message");
    newDir.createFile("track1.wav", "...");
    newDir.createFile("track2.wav", "...");
    root.createFile("secrets.txt", "do not dead open inside");
    root.createFile("secrets1.txt", "do not dead open inside");
    root.createFile("secrets2.txt", "do not dead open inside");
    root.createFile("secrets3.txt", "do not dead open inside");
    root.createFile("secrets4.txt", "do not dead open inside");
    root.createFile("secrets5.txt", "do not dead open inside");
    root.createFile("secrets6.txt", "do not dead open inside");
    root.createFile("secrets7.txt", "do not dead open inside");
    root.createFile("secrets8.txt", "do not dead open inside");
    root.createFile("secrets9.txt", "do not dead open inside");
    root.createDirectory("hackintosh");
    root.createDirectory("lunix");
    root.createDirectory("micro$oft");
    return root;
}