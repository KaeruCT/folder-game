import { createDirectoryStructure, Directory } from "./files";
import { Inventory, addItem } from "./inventory";

export function getFilesystem(): Directory {
    const newDir = createDirectoryStructure("$ROOT/Users/darkl/Desktop/muexport/31may2020");
    const root = newDir.root;
    const notes = newDir.createDirectory("liner_notes");
    notes.createFile("hello.txt", "this is a message");
    notes.createFile("hello2.txt", "this is a message");
    newDir.createFile("track1.wav", "...");
    newDir.createFile("track2.wav", "...");
    root.createFile("secrets1.txt", "do not dead open inside", { key: "locked_secrets" });
    root.createFile("secrets20.txt", "do not dead open inside", { key: "locked_secrets" });
    root.createFile("secrets50.txt", "do not dead open inside", { key: "locked_secrets" });
    root.createFile("secrets99.txt", "do not dead open inside", { key: "locked_secrets" });
    root.createDirectory("hackintosh", { key: "mac" });

    root.createDirectory("lunix");
    root.createDirectory("micro$oft", { key: "gates" });
    return root;
}

export function getInventory(): Inventory {
    const inventory = {};
    addItem(inventory, "locked_secrets");
    addItem(inventory, "locked_secrets");
    addItem(inventory, "gates");
    console.log(inventory);
    return inventory;
}