import { createDirectoryStructure, Directory } from "./files";
import { Inventory, addItem } from "./inventory";
const instructions = require("../game-files/intro/instructions.txt").default;
const oneTimeFile = require("../game-files/intro/one_time_file.txt").default;

export function getFilesystem(): Directory {
    const help = createDirectoryStructure("$ROOT/help");
    const root = help.root;
    help.createFile("instructions.txt", instructions);
    help.createFile("one_time_file.txt", oneTimeFile, { selfDestruct: true });

    const diary = root.createDirectory("users/evan/diary");

    diary.createFile("may1.txt", "I am writing this to help my mental health.", { key: "diary_entry" });
    diary.createFile("may5.txt", "I keep trying but I cannot forget what happened.", { key: "diary_entry" });
    diary.createFile("may8.txt", "I don't know how much longer I will be able to write.", { key: "diary_entry" });

    const programs = root.createDirectory("programs");
    programs.createFile("lock.exe", "", { selfDestruct: true });
    programs.createFile("user_info.exe", "", {
        run(log) {
            const filename = "user_report.txt";
            if (programs.fileExists(filename)) {
                log("previous report found, removing...");
                programs.remove(filename);
            }

            log(`creating user report: ${filename}`);
            programs.createFile(filename, "user info output");
        }
    });

    const system = root.createDirectory("sys");
    system.createDirectory("share", { key: "gates" });
    system.createDirectory("lib", { key: "gates" });
    system.createDirectory("cache", { key: "gates" });
    system.createDirectory("local", { key: "gates" });
    system.createDirectory("net", { key: "gates" });
    return root;
}

export function getInventory(): Inventory {
    const inventory = {};
    addItem(inventory, "diary_entry");
    addItem(inventory, "diary_entry");
    addItem(inventory, "sys");
    return inventory;
}