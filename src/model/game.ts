import { createDirectoryStructure, Directory } from "./files";
import { Inventory, addItem } from "./inventory";
const instructions = require("../game-files/instructions.txt");

export function getFilesystem(): Directory {
    const help = createDirectoryStructure("$ROOT/help");
    const root = help.root;
    help.createFile("instructions.txt", instructions);

    const diary = root.createDirectory("diary");

    diary.createFile("may1.txt", "I am writing this to help my mental health.", { key: "diary_entry" });
    diary.createFile("may5.txt", "I keep trying but I cannot forget what happened.", { key: "diary_entry" });
    diary.createFile("may8.txt", "I don't know how much longer I will be able to write.", { key: "diary_entry" });

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
    return inventory;
}