import { createDirectoryStructure, Directory } from "./files";
import { Inventory, addItem } from "./inventory";
const instructions = require("../game-files/instructions.txt").default;
const oneTimeFile = require("../game-files/one_time_file.txt").default;

export function getFilesystem(): Directory {
    const help = createDirectoryStructure("$ROOT/help");
    const root = help.root;
    help.createFile("instructions.txt", instructions);
    help.createFile("one_time_file.txt", oneTimeFile, { selfDestruct: true });

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
    addItem(inventory, "diary_entry");
    addItem(inventory, "diary_entry");
    addItem(inventory, "gates");
    return inventory;
}