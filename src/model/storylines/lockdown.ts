import instructions from "../../game-files/intro/instructions.txt?raw";
import lockExe from "../../game-files/intro/lock.exe.txt?raw";
import lockout from "../../game-files/intro/lockout.txt?raw";
import img1 from "../../game-files/storylines/lockdown/images/1.png";
import img4 from "../../game-files/storylines/lockdown/images/4.png";
import img6 from "../../game-files/storylines/lockdown/images/6.png";
import img7 from "../../game-files/storylines/lockdown/images/7.png";
import img8 from "../../game-files/storylines/lockdown/images/8.png";
import imgEd from "../../game-files/storylines/lockdown/images/ed.gif";
import imgErik from "../../game-files/storylines/lockdown/images/erik.jpg";
import { SUFFIXES, USER_NAMES } from "../data";
import { createDirectoryStructure, type Directory } from "../files";
import { addItem, type Inventory } from "../inventory";
import type { Storyline } from "../storyline";
import { randInt, randItem } from "../util";

const storyline: Storyline = {
    id: "lockdown",
    name: "The Lockdown",
    description:
        "Evan's deadman switch triggered. Hackers are infiltrating his system. Lock them out and uncover the truth he died to protect.",
    hook: "A deadman switch is live. You have one compromised filesystem and too many open doors.",
    playtime: "10–15 min",
    tags: ["thriller", "hacking", "secrets"],

    buildFilesystem(): Directory {
        const lockFile = "lucky7.exe";

        const help = createDirectoryStructure("$ROOT/help");
        const root = help.root;
        help.createFile("instructions.txt", instructions, {
            startHere: true,
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
        diary.createFile("may1.txt", DIARY_MAY1, {
            key: "diary_entry",
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Found Evan's diary. He's struggling with his mental health, trying to forget something he saw.",
                );
            },
        });
        diary.createFile("may5.txt", DIARY_MAY5, { key: "diary_entry" });
        diary.createFile("may8.txt", DIARY_MAY8, {
            key: "diary_entry",
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/users/evan/diary/may12.txt" });
                ctx.log(
                    "story",
                    "Evan's writing is becoming desperate. A hidden entry has surfaced — he wrote more than he wanted anyone to see.",
                );
                ctx.log("goal", "Read Evan's hidden diary entry. He's hiding something important.");
            },
        });
        diary.createFile("may12.txt", DIARY_MAY12, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/users/evan/diary/jun3.txt" });
                ctx.log("story", "Evan discovered something — data that doesn't belong. Someone is watching him now.");
            },
        });
        diary.createFile("jun3.txt", DIARY_JUN3, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/users/evan/notes" });
                ctx.log(
                    "story",
                    "Evan's final entry. He set up the deadman switch. If you're reading this, he's already gone.",
                );
                ctx.log("milestone", "Evan's notes directory revealed. His research is in there.");
                ctx.log("goal", "Search Evan's notes to understand what he uncovered.");
            },
        });
        diary.createFile("person.jpg", imgErik);

        const notes = evan.createDirectory("notes", { hidden: true });
        notes.createFile("project_brief.txt", NOTES_BRIEF, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Evan was investigating Project Argus — a surveillance system with no oversight. He found data that shouldn't exist.",
                );
            },
        });
        notes.createFile("findings.txt", NOTES_FINDINGS, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Evan's findings: the system is tracking citizens without warrants. Names, locations, communications — all of it. He has proof.",
                );
                ctx.log("goal", "Find the evidence Evan hid. It must be somewhere in this system.");
            },
        });
        notes.createFile("contacts.txt", NOTES_CONTACTS, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Evan's contacts list. Journalists, lawyers, whistleblower groups. He was preparing to go public.",
                );
            },
        });

        const porn = evan.createDirectory("porn");
        porn.createFile("italian.mp4", "vid/italian.mp4");
        porn.createFile("smell.mp4", "vid/smell.mp4");

        const programs = root.createDirectory("programs");
        programs.createFile("lock.exe", lockExe, {
            selfDestruct: true,
            corrupted: true,
        });
        programs.createFile("trace.exe", "", {
            run(log, ctx) {
                log("NETWORK TRACE UTILITY v0.9");
                log("=============================");
                log("");
                log("Scanning active connections...");
                log("");
                const ips = [
                    "198.51.100.14 — [SUSPICIOUS] — repeated auth failures",
                    "203.0.113.42 — [SUSPICIOUS] — port scanning detected",
                    "192.0.2.88  — [LEGITIMATE] — Evan's known workstation",
                ];
                for (const ip of ips) {
                    log(ip);
                }
                log("");
                log(`${ips.length} connections traced.`);
                log("2 suspicious hosts detected. Recommend lockdown.");
                ctx.log(
                    "story",
                    "Trace complete. Two suspicious hosts are actively probing the system. Find lucky7.exe to lock them out.",
                );
            },
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
                        c.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/truth" });
                        c.log(
                            "story",
                            "Evan's lockout message: he's running out of time and being silenced. The system is secure — now find what he died to protect.",
                        );
                        c.log("goal", "A hidden truth directory has been unlocked. The evidence is inside.");
                    },
                });
                this.root.createFile("gnu.webm", "vid/gnu.webm");
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

                log(`report created successfully`);
            },
        });

        // =========================================================================
        // TRUTH — hidden until lockout.txt is read after lockdown
        // =========================================================================

        const truth = root.createDirectory("truth", { hidden: true });
        truth.createFile("the_discovery.txt", TRUTH_DISCOVERY, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/resolve.txt" });
                ctx.log(
                    "story",
                    "The full truth: Project Argus is an illegal mass surveillance operation. Evan had evidence — enough to bring it down. That's why they silenced him.",
                );
                ctx.log("milestone", "You now know what Evan knew. The choice is yours.");
                ctx.log("goal", "Open resolve.txt to decide what to do with the evidence.");
            },
        });
        truth.createFile("evidence_manifest.txt", TRUTH_EVIDENCE, {
            onRead(ctx) {
                ctx.log(
                    "story",
                    "Evidence manifest: encrypted data dumps, server logs, witness statements. Enough to prosecute. Evan stored copies in three jurisdictions.",
                );
            },
        });

        // =========================================================================
        // RESOLVE — hidden, revealed after reading the truth
        // =========================================================================

        root.createFile("resolve.txt", RESOLVE_TEXT, {
            hidden: true,
            choices: [
                {
                    label: "Expose everything. Send the evidence to every contact on Evan's list.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_expose.txt" },
                },
                {
                    label: "Destroy the evidence. No one can know you were here.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_destroy.txt" },
                },
                {
                    label: "Encrypt and bury it. Wait until the moment is right.",
                    action: { type: "REVEAL_FILE", payload: "$ROOT/ending_wait.txt" },
                },
            ],
        });

        // Ending files
        root.createFile("ending_expose.txt", ENDING_EXPOSE, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to expose the truth.");
                ctx.log(
                    "story",
                    "ENDING: You uploaded everything. Within hours, three newsrooms published simultaneously. Within days, congressional hearings were announced. Within weeks, arrests began. Project Argus is dead. Evan's name is in every story. He didn't survive — but his work did. You close the laptop and stare at the ceiling. Somewhere, Evan is smiling. You hope.",
                );
            },
        });
        root.createFile("ending_destroy.txt", ENDING_DESTROY, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 98 });
                ctx.log("milestone", "You chose to destroy the evidence.");
                ctx.log(
                    "story",
                    "ENDING: You ran the wipe routine. Seven passes. Nothing recoverable. Evan's research, his notes, his proof — gone. You deleted the contacts list too. No one will ever know what you found here. The system is secure, the hackers are banned, and Project Argus continues operating in the dark. You protected yourself. You also protected them. You try not to think about which one matters more.",
                );
            },
        });
        root.createFile("ending_wait.txt", ENDING_WAIT, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 97 });
                ctx.log("milestone", "You chose to wait.");
                ctx.log(
                    "story",
                    "ENDING: You encrypted everything with a key only you possess. You buried copies in three offline storage locations — different continents, different jurisdictions. You set a deadman switch of your own: if you don't check in every 30 days, the evidence auto-releases to every contact on Evan's list. You've become Evan now. The weight of knowing sits on your chest every morning. But the evidence is safe. When the moment comes — and it will come — you'll be ready.",
                );
            },
        });

        return root;
    },

    getInitialInventory(): Inventory {
        let inventory: Inventory = {};
        inventory = addItem(inventory, "diary_entry");
        inventory = addItem(inventory, "diary_entry");
        inventory = addItem(inventory, "diary_entry");
        inventory = addItem(inventory, "sys");
        return inventory;
    },
};

function randUserName(): string {
    return `${randItem(USER_NAMES)}${randItem(SUFFIXES)}`;
}

// =============================================================================
// CONTENT — DIARY ENTRIES
// =============================================================================

const DIARY_MAY1 = `I am writing this to help my mental health.

I saw something at work today. Data that doesn't belong. Numbers
that don't add up. Names I recognized — people who have no idea
they're in a database.

I shouldn't have looked. But I did. And now I can't un-see it.`;

const DIARY_MAY5 = `I keep trying but I cannot forget what happened.

I ran the query three more times. Same result. The system is
collecting data on citizens — location, communications, financial
records — without warrants, without oversight, without anyone
knowing. They call it Project Argus.

I told Marcy at lunch. She said I should drop it. She looked
scared. I think she already knew.`;

const DIARY_MAY8 = `I don't know how much longer I will be able to write.

Someone accessed my apartment. Nothing was taken, but things were
moved. Subtle. Deliberate. A message.

I'm copying everything tonight. If something happens to me — if I
disappear — the deadman switch will trigger. The system will open.
Strangers will find their way in.

Whoever you are: the truth is here. You just have to look.`;

const DIARY_MAY12 = `May 12th

They're watching me now. I see the same car outside every morning.
Same make, same color, different plates — but the dent on the
rear bumper is identical. Amateurs.

I've been documenting everything. Project Argus isn't just a
surveillance operation. It's a private intelligence network
operating outside the law. They're selling access to the highest
bidder. Corporations. Political campaigns. Foreign governments.

I have names. I have dates. I have proof.

The deadman switch is armed. If I stop checking in, the server
opens to anyone who can find it. The credentials are hidden in
plain sight — scattered across forums, pastebins, darknets.

Whoever finds this: I'm probably already dead. Don't let them
win.`;

const DIARY_JUN3 = `June 3rd

This is my last entry. I can feel it closing in.

They contacted me today. Not the street-level watchers — someone
higher up. Offered me money. A lot of money. "Consulting fee" for
my "discretion." I said I'd think about it.

I'm not going to think about it. I'm going to disappear.

The switch is live. The server is open. The evidence is here.

Evan's notes are hidden in a directory called "notes" under my
user folder. The full truth is buried deeper — but you'll need
to secure the system first. Run the lockdown tool. Ban the
intruders. Then find what I left behind.

Good luck.

— Evan`;

// =============================================================================
// CONTENT — NOTES
// =============================================================================

const NOTES_BRIEF = `PROJECT ARGUS — INTERNAL BRIEF (UNAUTHORIZED COPY)
==================================================

Classification: EYES ONLY / NO OVERSIGHT
Operational since: Q3 2019
Jurisdiction: None — operates outside all legal frameworks

Project Argus is a domestic surveillance initiative collecting
real-time data on U.S. citizens without judicial authorization.

Data collected includes:
- Geolocation (cell tower triangulation, GPS metadata)
- Communications (SMS, email metadata, voice call records)
- Financial transactions (credit/debit, wire transfers)
- Social media activity (public and private)
- Biometric data (facial recognition feeds)

Access to the system is sold on a subscription model to:
- Fortune 500 corporations
- Political action committees
- Foreign intelligence services (via shell companies)

Evan's notes: I found this on an unsecured server during a
routine security audit. The server shouldn't have existed. The
project shouldn't exist. But it does. And now I have proof.`;

const NOTES_FINDINGS = `EVAN'S FINDINGS — KEY EVIDENCE
=====================================

1. SERVER LOGS
   Three years of access logs showing queries against citizen
   data by unauthorized parties. Includes timestamps, query
   parameters, and user IDs tied to known corporate executives
   and foreign agents.

2. FINANCIAL RECORDS
   Wire transfer receipts showing payments from shell companies
   to Project Argus operators. Total documented revenue exceeds
   $340 million over two fiscal years.

3. WITNESS STATEMENTS
   Recorded conversations with four former Argus employees who
   confirmed the operation and expressed willingness to testify
   under whistleblower protection.

4. SURVEILLANCE TARGETS
   A partial list of targeted individuals, including journalists,
   activists, political candidates, and — chillingly — members
   of congressional oversight committees.

All evidence is encrypted and distributed across multiple
jurisdictions. Full decryption keys are in the truth directory.

STATUS: READY FOR RELEASE`;

const NOTES_CONTACTS = `EVAN'S CONTACT LIST
====================

JOURNALISTS:
- Sarah Chen, The Guardian (US desk)
- Marcus Webb, ProPublica
- Lena Okonkwo, Der Spiegel

LEGAL:
- David Rosenthal, ACLU (whistleblower division)
- Amira Hassan, Electronic Frontier Foundation

WHISTLEBLOWER GROUPS:
- ExposeFacts
- The Government Accountability Project
- SecureDrop (anonymous submission portal)

PERSONAL:
- Marcy Liu (colleague — knows partial details)

INSTRUCTIONS: If you're reading this and I'm gone, send the
evidence to everyone on this list simultaneously. Do not stagger
the releases. Do not give them time to prepare. Flood the zone.`;

// =============================================================================
// CONTENT — TRUTH
// =============================================================================

const TRUTH_DISCOVERY = `PROJECT ARGUS — COMPLETE EXPOSURE
=====================================

Evan Anders was a senior security engineer at Meridian Data
Systems, a government contractor.

In March 2024, during a routine security audit, Evan discovered
an unregistered server cluster operating on Meridian's
infrastructure. The servers were not on any inventory. They had
no oversight. They were running Project Argus.

Project Argus is a mass surveillance system that collects and
sells access to citizen data without warrants, without consent,
without anyone in government knowing — or anyone willing to
admit they know.

Evan spent three months documenting the operation. He copied
server logs. He recorded conversations with insiders. He traced
the money to shell companies in Panama, Cyprus, and the Cayman
Islands.

On June 1st, Evan was approached by a representative of the
project's financiers. The offer: $2 million for his silence and
a job in a different division. Evan refused.

On June 3rd, Evan armed his deadman switch and disappeared.

His body has not been found.

His evidence remains.

You are now the custodian of everything Evan died to protect.

What you do next defines everything.
`;

const TRUTH_EVIDENCE = `EVIDENCE MANIFEST — VERIFIED COPIES
=========================================

LOCATION 1: Secure server, Reykjavik, Iceland
  - server_logs_2022-2024.tar.gz (encrypted)
  - financial_records_complete.xlsx (encrypted)
  - witness_transcripts.zip (encrypted)

LOCATION 2: Offshore backup, Singapore
  - argus_source_code.tar.gz
  - operator_identities.tar.gz
  - client_list_full.tar.gz

LOCATION 3: Physical drive, safety deposit box #4471
            First Federal Bank, Portland, Oregon
  - Complete evidence set on encrypted SSD
  - Access key included with this manifest

All files encrypted with AES-256. Decryption keys distributed
separately to three trusted parties with instructions to release
upon confirmation of Evan's death or 90 days of inactivity.

You hold the fourth copy. Four copies. Four continents. They
can't stop them all.
`;

// =============================================================================
// CONTENT — RESOLVE & ENDINGS
// =============================================================================

const RESOLVE_TEXT = `You've seen everything.

Evan Anders was murdered — silenced because he discovered Project
Argus, an illegal mass surveillance operation selling citizen data
to corporations, political campaigns, and foreign governments.

He spent his last days copying evidence, setting up deadman
switches, and making sure the truth would survive him. And it did.

You hold the fourth copy of the evidence. Four contacts lists.
Three encrypted server locations. One dead man's legacy.

What do you do?
`;

const ENDING_EXPOSE = `You uploaded everything.

Three newsrooms. Four whistleblower groups. Two civil liberties
organizations. Every contact on Evan's list received the full
evidence package at exactly 9:00 AM Eastern.

By noon, The Guardian published. By evening, Congress announced
an emergency hearing. Within a month, twelve indictments were
filed. Project Argus was terminated. Its operators face life in
prison. Its financiers are scrambling to delete records that
don't delete anymore.

Evan Anders is a household name now. His photo — the one from his
diary — is on every front page. The story calls him a hero. He
would have hated that. He just wanted to do the right thing.

You close the laptop. The sun is coming up. You haven't slept.

Somewhere, Evan is smiling. You hope.
`;

const ENDING_DESTROY = `You ran the wipe routine.

Seven passes. Military-grade overwrite. Nothing recoverable.

The server logs. The financial records. The witness statements.
The contacts list. The decryption keys. All of it — gone.

You told yourself it was about self-preservation. You're not a
hero. You're not Evan. You're just someone who stumbled into
something too big and wanted out.

But the truth is simpler: you were scared. Scared of the people
who killed Evan. Scared of what they'd do to you. Scared of
becoming the next name on a diary page.

Project Argus continues. The surveillance feeds still run. The
subscription payments still process. The operators still sleep
soundly at night.

You protected yourself. You also protected them.

You try not to think about which one matters more.
`;

const ENDING_WAIT = `You didn't release. You didn't destroy.

You encrypted everything with a key only you know. You distributed
copies to three offline locations — a safety deposit box in
Portland, a buried drive in the Nevada desert, and a server in a
Reykjavik data center that doesn't log visitors.

You set your own deadman switch. Every 30 days, you check in. If
you miss a check-in, the evidence auto-releases — every contact,
every newsroom, every watchdog group on Evan's list.

You've become Evan now. The weight of knowing sits on your chest
every morning. You see the same car sometimes and wonder if it's
paranoia or if they found you.

But the evidence is safe. Four copies. Four continents. They
can't stop them all.

When the moment comes — and it will come — you'll be ready.

Until then, you wait. And you watch. And you remember.
`;

export default storyline;
