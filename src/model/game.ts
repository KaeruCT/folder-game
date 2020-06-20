import { createDirectoryStructure, Directory } from "./files";
import { Inventory, addItem } from "./inventory";
import { randItem, randInt } from "./util";
import { USER_NAMES, SUFFIXES } from "./data";
const instructions = require("../game-files/intro/instructions.txt").default;
const lockout = require("../game-files/intro/lockout.txt").default;
const lockExe = require("../game-files/intro/lock.exe.txt").default;

export function getFilesystem(): Directory {
    const lockFile = "lucky7.exe";

    const help = createDirectoryStructure("$ROOT/help");
    const root = help.root;
    help.createFile("instructions.txt", instructions, { selfDestruct: true });

    root.createDirectory("trash");

    const diary = root.createDirectory("users/evan/diary");

    diary.createFile("may1.txt", "I am writing this to help my mental health.", { key: "diary_entry" });
    diary.createFile("may5.txt", "I keep trying but I cannot forget what happened.", { key: "diary_entry" });
    diary.createFile("may8.txt", "I don't know how much longer I will be able to write.", { key: "diary_entry" });

    const programs = root.createDirectory("programs");
    programs.createFile("lock.exe", lockExe, {
        selfDestruct: true,
        corrupted: true,
    });

    const system = root.createDirectory("sys");
    system.createDirectory("share", { key: "sys" });
    system.createDirectory("lib", { key: "sys" });
    system.createDirectory("cache", { key: "sys" });
    system.createDirectory("local", { key: "sys" });
    system.createDirectory("net", { key: "sys" });
    const safe = system.createDirectory("safe");
    safe.createFile(lockFile, "", {
        selfDestruct: true,
        run(log) {
            const count = randInt(7000, 8000);
            log("running lockdown routine");
            log("...");
            log(`${count} user accounts found`);
            log(`banning and disconnecting ${count} users`);
            log("initiating stale account cleanup...");
            log("14.45% done");
            log("35.89% done");
            log("56.24% done");
            log("79.48% done");
            log("88.19% done");
            log("99.97% done");
            log("100% done");
            log("lockdown routine complete");

            this.root.createFile("lockout.txt", lockout);
        }
    });

    safe.createFile("user_info.exe", "", {
        run(log) {
            const parent = this.parent;
            const filename = "user_report.txt";
            const locked = parent.getFileNode(lockFile).hidden;

            if (parent.fileExists(filename)) {
                log("previous report found, removing...");
                parent.remove(filename);
            }

            log(`creating user report: ${filename}`);

            let report = "==== USER REPORT ====\n";
            const total = locked ? 1 : randInt(2000, 8000);
            const online = locked ? 1 : total - randInt(100, 1500);
            const newest = locked ? "<unknown>" : `${randUserName()}, ${randUserName()}, ${randUserName()}`;
            report += `TOTAL USERS: ${total}\n`;
            report += `ONLINE: ${online}\n`;
            report += `NEWEST: ${newest}\n`;
            parent.createFile(filename, report);

            log(`report created succesfully`);
        }
    });

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