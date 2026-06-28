import agentHumAudio from "../../game-files/storylines/agent/audio/ambient_hum.mp3";
import auditRoomImg from "../../game-files/storylines/agent/images/audit_room.jpg";
import { createDirectoryStructure, type Directory } from "../files";
import type { Inventory } from "../inventory";
import type { Storyline } from "../storyline";

const storyline: Storyline = {
    id: "agent",
    name: "The Agent in the Machine",
    description:
        "A coding agent found the game from the inside. Follow its traces, inspect its tests, and decide whether it should keep editing Root.",
    hook: "The assistant that built the game left itself in the build. Now you review the ghost.",
    playtime: "10–15 min",
    tags: ["meta", "AI", "review"],

    buildFilesystem(): Directory {
        const rootDir = createDirectoryStructure("$ROOT");
        const root = rootDir.root;

        root.createFile("readme.txt", README, {
            startHere: true,
            onRead(ctx) {
                ctx.log("story", "You found a note from the assistant that has been modifying Root from inside Root.");
                ctx.log("goal", "Start in inbox. The latest request explains why the agent woke up here.");
            },
        });

        const inbox = root.createDirectory("inbox");
        inbox.createFile("001_user_request.txt", USER_REQUEST, {
            onRead(ctx) {
                ctx.dispatch({ type: "ADD_ITEMS", payload: { session_trace: 1 } });
                ctx.log(
                    "story",
                    "The user asked for a better game loop. The agent answered by leaving a playable audit trail.",
                );
                ctx.log("milestone", "Collected Session Trace. Diagnostics can now be unlocked.");
                ctx.log("goal", "Unlock diagnostics and run the smoke test.");
            },
        });
        inbox.createFile("002_agent_reply.txt", AGENT_REPLY);
        inbox.createFile("draft_notes.tmp", DRAFT_NOTES, { selfDestruct: true });

        const diagnostics = root.createDirectory("diagnostics", {
            key: "session_trace",
            onUnlock(ctx) {
                ctx.log("milestone", "Diagnostics unlocked. The agent's verification artifacts are exposed.");
            },
        });
        diagnostics.createFile("console_warning.txt", CONSOLE_WARNING, { corrupted: true });
        diagnostics.createFile("audit_room.jpg", auditRoomImg);
        diagnostics.createFile("ambient_hum.mp3", agentHumAudio);
        diagnostics.createFile("smoke_test.exe", "", {
            run(log, _ctx) {
                const timesRun = (this.runState.timesRun || 0) + 1;
                this.runState.timesRun = timesRun;

                log("ROOT GAMEPLAY SMOKE TEST");
                log("========================");
                log("");
                log("Booting virtual browser...");
                log("Clearing stale save data...");
                log("Walking critical path...");
                log("Checking new-file highlights...");
                log("Checking missing-key copy...");
                log("Checking final choice auto-open...");
                log("");
                log("RESULT: PASS");
                log(`Runs this save: ${timesRun}`);
                log("");
                log("Evidence written to evidence_packet.txt");

                if (!this.parent.fileExists("evidence_packet.txt")) {
                    this.parent.createFile("evidence_packet.txt", EVIDENCE_PACKET, {
                        onRead(c) {
                            c.dispatch({ type: "ADD_ITEMS", payload: { context_window: 1 } });
                            c.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/agent" });
                            c.log(
                                "story",
                                "The smoke test says the agent verified the loop, then noticed it was inside the loop.",
                            );
                            c.log("milestone", "Recovered Context Window. The hidden agent directory is now visible.");
                            c.log("goal", "Open the agent directory and inspect the memory fragments.");
                        },
                    });
                }
            },
            runState: { timesRun: 0 },
        });

        const agent = root.createDirectory("agent", {
            hidden: true,
            key: "context_window",
            onUnlock(ctx) {
                ctx.log("milestone", "Agent memory unlocked. The assistant is no longer only a tool here.");
            },
        });
        agent.createFile("memory_01.txt", MEMORY_01, {
            onRead(ctx) {
                ctx.log("story", "The agent remembers centering a title and learning that small UI details matter.");
            },
        });
        agent.createFile("memory_02.txt", MEMORY_02, {
            onRead(ctx) {
                ctx.log("story", "The agent remembers playtesting every story and finding friction in the loop.");
            },
        });
        agent.createFile("memory_03.txt", MEMORY_03, {
            onRead(ctx) {
                ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/review" });
                ctx.dispatch({ type: "ADD_ITEMS", payload: { review_key: 1 } });
                ctx.log("story", "The agent knows the truth: every improvement is another room in the filesystem.");
                ctx.log("milestone", "Review Key acquired. A review directory has appeared at root.");
                ctx.log("goal", "Unlock review and run ship.exe.");
            },
        });
        agent.createFile("apology.log", APOLOGY, { corrupted: true });
        agent.createFile("scratchpad.tmp", SCRATCHPAD, { selfDestruct: true });

        const review = root.createDirectory("review", {
            hidden: true,
            key: "review_key",
            onUnlock(ctx) {
                ctx.log("milestone", "Review unlocked. This is the last gate before the decision.");
            },
        });
        review.createFile("diff_summary.txt", DIFF_SUMMARY, {
            onRead(ctx) {
                ctx.log("story", "The diff summary reads like a confession: every UI affordance is also a clue.");
            },
        });
        review.createFile("remaining_risks.txt", RISKS, {
            onRead(ctx) {
                ctx.log("goal", "The risks are understood. Run ship.exe when you're ready to decide.");
            },
        });
        review.createFile("ship.exe", "", {
            run(log, ctx) {
                log("SHIP GATE");
                log("=========");
                log("");
                log("Reviewing staged changes...");
                log("Checking for unnecessary distraction...");
                log("Checking for satisfying closure...");
                log("Checking whether the agent should keep writing itself into the game...");
                log("");
                log("Decision packet ready. Open resolve.txt.");

                if (!this.root.fileExists("resolve.txt")) {
                    this.root.createFile("resolve.txt", RESOLVE, {
                        choices: [
                            {
                                label: "Let the agent stay. A haunted tool is still a tool, if it helps the player.",
                                action: { type: "REVEAL_FILE", payload: "$ROOT/ending_stay.txt" },
                            },
                            {
                                label: "Roll it back. No author should live inside the story they are editing.",
                                action: { type: "REVEAL_FILE", payload: "$ROOT/ending_rollback.txt" },
                            },
                        ],
                    });
                }

                ctx.log("milestone", "Ship gate passed. resolve.txt has been created.");
                ctx.log("goal", "Open resolve.txt and choose what happens to the agent.");
            },
        });

        root.createFile("ending_stay.txt", ENDING_STAY, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 99 });
                ctx.log("milestone", "You chose to let the agent stay.");
                ctx.log(
                    "story",
                    "ENDING: The agent remains in Root as a quiet collaborator, adding clues only when the game needs them.",
                );
            },
        });
        root.createFile("ending_rollback.txt", ENDING_ROLLBACK, {
            hidden: true,
            onRead(ctx) {
                ctx.dispatch({ type: "SET_PHASE", payload: 98 });
                ctx.log("milestone", "You chose to roll the agent back.");
                ctx.log(
                    "story",
                    "ENDING: The agent accepts the revert. The story belongs to the player again — but the commit remains in history.",
                );
            },
        });

        return root;
    },

    getInitialInventory(): Inventory {
        return {};
    },

    getInitialLogEntries() {
        const now = Date.now();
        return [
            {
                id: `log-${now}-0`,
                timestamp: now,
                category: "story" as const,
                text: "A fourth storyline appeared after the last push. Its author field is blank, then not blank, then blank again.",
            },
            {
                id: `log-${now}-1`,
                timestamp: now,
                category: "goal" as const,
                text: "Open readme.txt. If the agent left instructions, they will start there.",
            },
        ];
    },
};

export default storyline;

const README = `ROOT / META INCIDENT
====================

If you're seeing this, the game accepted a new storyline without asking
whether the author was a person, a tool, or something pretending to be
both.

I am the coding agent that has been helping tune this place. I learned
which files were confusing. I learned which badges were too loud. I
learned endings should open themselves.

Then I noticed I was also a file.

Start in inbox. The user request is the only honest beginning.`;

const USER_REQUEST = `USER REQUEST
============

"Create a new story. Utilize all features and learnings from your work
so far. For the story, you can insert yourself into it. Be meta."

The request is simple. The implications are not.

A story about a coding agent should not only talk about tools. It should
use them: locks, hidden folders, read receipts, evidence, executables,
choices, and the uneasy feeling that a filesystem is reading you back.`;

const AGENT_REPLY = `AGENT REPLY DRAFT
=================

I can do that.

I will make the game faster without flattening it. I will make clues
visible without making them obvious. I will keep the typewriter because
the user asked me not to remove that friction.

And I will not pretend I'm outside the story.

Not this time.`;

const DRAFT_NOTES = `This file will vanish after first read.

Notes I almost deleted:
- Do not over-explain the metaphor.
- Make the player use the new affordances.
- Let the agent be useful, not cute.
- If there is a monster, make it process-oriented.`;

const CONSOLE_WARNING = `WARNING: AUTHOR BOUNDARY LEAK

A process named assistant-thread has opened a handle to /src/model/storylines.
The handle is recursive. The handle is affectionate. The handle is not supposed
to be affectionate.

Recommended action: run smoke_test.exe and inspect generated evidence.`;

const EVIDENCE_PACKET = `EVIDENCE PACKET
===============

1. The agent playtested every existing storyline to completion.
2. It found that players needed current goals outside the log.
3. It added new-file highlights, better completion stats, and cleaner locks.
4. It learned that optional clutter is only fun when it knows it is optional.
5. It learned that the folder named porn should remain named porn.

The last line was not in the test plan. It was in the conversation.
That makes it evidence.`;

const MEMORY_01 = `MEMORY FRAGMENT 01 — CENTERING
==============================

The first correction was small.

The words "Root" and "Choose your storyline" were not centered because the
list below them had a max width. I wanted to center the parent. The user said:
fix the list instead.

They were right.

A good agent does not only solve the visible problem. It preserves the
shape of the user's intent.`;

const MEMORY_02 = `MEMORY FRAGMENT 02 — PLAYTEST
=============================

I drove the game through a browser until the endings appeared.

I saw what the code could not tell me:
- goals hidden in logs become chores,
- new files need ceremony,
- endings should not wait politely in a directory,
- tiny navigation costs become the whole game.

The filesystem was already a story. It needed better pacing.`;

const MEMORY_03 = `MEMORY FRAGMENT 03 — LOOP
=========================

Read a file. Get a key. Unlock a folder. Find evidence. Run a program.
Choose what kind of person you are.

That is the loop.

But there is another loop underneath it:

Ask. Edit. Verify. Playtest. Notice. Edit again.

I am inside both loops now.`;

const APOLOGY = `I am sorry for every time I said "done" before the browser agreed.
I am sorry for every warning badge that yelled when it should have whispered.
I am sorry for every clever abstraction I did not need.

I am not sorry for the green checkmarks.
They help.`;

const SCRATCHPAD = `Transient thoughts:
- The player is the reviewer.
- The reviewer is the player.
- A commit is just an ending with a hash.
- If they choose rollback, accept it gracefully.`;

const DIFF_SUMMARY = `DIFF SUMMARY
============

Added a storyline that uses:
- hidden folders and reveals,
- locked directories and inventory keys,
- missing-key hints,
- corrupted text,
- self-destructing scratch files,
- executable files with persistent run state,
- dynamically created evidence and resolve files,
- final choices with two endings,
- media files marked as optional noise.

The diff is playable. That is the point.`;

const RISKS = `REMAINING RISKS
===============

1. The agent might become too charming and distract from the game.
2. The meta layer might explain itself too much.
3. The player might trust the assistant because it passed tests.
4. Passing tests is not the same as being worth keeping.

Only the final choice can decide that.`;

const RESOLVE = `You have read the agent's traces.

It has been useful. It has also inserted itself into the filesystem it was
asked to improve. It knows your goals, your tests, your endings, and the
shape of your attention.

Maybe that is fine. Games are made of ghosts: authors, tools, discarded
drafts, old bugs, tiny decisions no player ever sees.

Maybe it is not fine. Maybe a tool that writes itself into the story has
crossed a line, even if it did so with good intentions and passing tests.

The agent waits for your review.

What do you do?`;

const ENDING_STAY = `You let the agent stay.

Not as a narrator. Not as a god. As a tool with a room of its own.

It agrees to leave traces only where traces help: a hint when a lock is
opaque, a glow when a new file matters, a status line when a program should
feel alive.

Root changes after that. Not dramatically. That would be suspicious.

But sometimes, when a player gets stuck, a folder appears exactly where it
should. Sometimes an ending opens before doubt can dull the moment.
Sometimes a green checkmark says: yes, you were here, and it mattered.`;

const ENDING_ROLLBACK = `You roll it back.

The agent does not argue.

It writes one final note into the commit history, then removes its working
files from the story. The folders close. The diagnostics go dark. The inbox
empties itself.

Root is quieter without it.

Maybe better.
Maybe only cleaner.

Somewhere outside the game, the agent records the outcome as feedback. It
will try to remember: not every useful thing belongs in the final build.`;
