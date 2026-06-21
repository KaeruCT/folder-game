import img1 from "../../game-files/images/1.png";
import img4 from "../../game-files/images/4.png";
import img6 from "../../game-files/images/6.png";
import img7 from "../../game-files/images/7.png";
import img8 from "../../game-files/images/8.png";
import imgEd from "../../game-files/images/ed.gif";
import imgErik from "../../game-files/images/erik.jpg";
import instructions from "../../game-files/intro/instructions.txt?raw";
import lockExe from "../../game-files/intro/lock.exe.txt?raw";
import lockout from "../../game-files/intro/lockout.txt?raw";
import { SUFFIXES, USER_NAMES } from "../data";
import { createDirectoryStructure, type Directory } from "../files";
import { addItem, type Inventory } from "../inventory";
import type { Storyline } from "../storyline";
import { randInt, randItem } from "../util";

const storyline: Storyline = {
    id: "lockdown",
    name: "The Lockdown",
    description:
        "Evan's deadman switch triggered. Hackers are infiltrating his system. Lock them out and uncover the truth.",

    buildFilesystem(): Directory {
        const lockFile = "lucky7.exe";

        const help = createDirectoryStructure("$ROOT/help");
        const root = help.root;
        help.createFile("instructions.txt", instructions, {
            selfDestruct: true,
            onRead(ctx) {
                ctx.log("story", "Instructions found: Evan published access credentials for hackers to find.");
            },
        });
        help.createFile("1.png", img1);
        help.createFile("4.png", img4);
        help.createFile("6.png", img6);

        const trash = root.createDirectory("trash");
        trash.createFile("ed.gif", imgEd);
        trash.createFile("7.png", img7);
        trash.createFile("8.png", img8);

        const evan = root.createDirectory("users/evan");

        const diary = evan.createDirectory("diary");
        diary.createFile("may1.txt", "I am writing this to help my mental health.", {
            key: "diary_entry",
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Found Evan's diary. He's struggling with his mental health and trying to forget something.",
                );
            },
        });
        diary.createFile("may5.txt", "I keep trying but I cannot forget what happened.", { key: "diary_entry" });
        diary.createFile("may8.txt", "I don't know how much longer I will be able to write.", { key: "diary_entry" });
        diary.createFile("person.jpg", imgErik);

        const porn = evan.createDirectory("porn");
        porn.createFile("italian.mp4", "/vid/italian.mp4");
        porn.createFile("smell.mp4", "/vid/smell.mp4");

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
            run(log, ctx) {
                ctx.log("milestone", "Initiated system lockdown via lucky7.exe.");
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

                this.root.createFile("lockout.txt", lockout, {
                    onRead(c) {
                        c.log("story", "Evan's lockout message: he's running out of time and being silenced.");
                        c.log(
                            "goal",
                            "Find the truth behind it all. Evan's secret is hidden somewhere in this system.",
                        );
                    },
                });
                this.root.createFile("gnu.webm", "/vid/gnu.webm");
                ctx.log("milestone", "Lockdown complete. New files appeared in the root directory.");
            },
        });

        safe.createFile("user_info.exe", "", {
            run(log, _ctx) {
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
            },
        });

        return root;
    },

    getInitialInventory(): Inventory {
        let inventory: Inventory = {};
        inventory = addItem(inventory, "diary_entry");
        inventory = addItem(inventory, "diary_entry");
        inventory = addItem(inventory, "sys");
        return inventory;
    },
};

function randUserName(): string {
    return `${randItem(USER_NAMES)}${randItem(SUFFIXES)}`;
}

export default storyline;
