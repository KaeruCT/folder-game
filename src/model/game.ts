import { createDirectoryStructure, Directory, File } from "./files";
import { Inventory, addItem } from "./inventory";
import { randItem, randInt } from "./util";
import { USER_NAMES, SUFFIXES } from "./data";
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
    programs.createFile("lock.exe", "", {
        selfDestruct: true,
        run(this: File, log) {
            log("nice try");
            this.parent.createFile("", "");
        }
    });
    programs.createFile("user_info.exe", "", {
        run(this: File, log) {
            const parent = this.parent;
            const filename = "user_report.txt";
            if (parent.fileExists(filename)) {
                log("previous report found, removing...");
                parent.remove(filename);
            }

            log(`creating user report: ${filename}`);

            let report = "==== USER REPORT ====\n";
            const total = randInt(2000, 8000);
            report += `TOTAL USERS: ${total}\n`;
            report += `ONLINE: ${total - randInt(100, 1500)}\n`;
            report += `NEWEST: ${randUserName()}, ${randUserName()}, ${randUserName()}\n`;
            parent.createFile(filename, report);
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

function randUserName(): string {
    return `${randItem(USER_NAMES)}${randItem(SUFFIXES)}`;
}