# Authoring Storylines

A storyline is a self-contained module that defines a complete game scenario: the filesystem tree, the narrative content, and the starting inventory. Players pick a storyline at the start, then play through to completion.

## Quick Start

1. Create `src/model/storylines/your-story.ts` (copy `lockdown.ts` as a template)
2. Register it in `src/model/game.ts`
3. The selection screen renders automatically from `getAllStorylines()`

## Storyline interface

```ts
// src/model/storyline.ts
interface Storyline {
    id: string;                                     // unique slug, used in save snapshots
    name: string;                                   // shown on the selection card
    description: string;                            // shown below the name
    buildFilesystem(): Directory;                   // build the entire directory tree
    getInitialInventory(): Inventory;               // starting player inventory
    getInitialLogEntries?(): LogEntry[];            // optional custom log messages
}
```

## Registration

In `src/model/game.ts`, add your storyline to the `storylines` map:

```ts
import yourStoryline from "./storylines/your-story";

const storylines: Record<string, Storyline> = {
    lockdown: lockdownStoryline,
    "your-id": yourStoryline,   // ← add this line
};
```

That's it. The selection screen and save/load automatically handle the rest.

## Building the filesystem

Use `createDirectoryStructure()` and the fluent `Directory` API:

```ts
buildFilesystem(): Directory {
    // createDirectoryStructure makes nested dirs and returns the deepest one
    const help = createDirectoryStructure("$ROOT/help");
    const root = help.root;       // always start from root

    // createFile(name, content, meta?)
    help.createFile("readme.txt", "Hello world.", { selfDestruct: true });

    // createDirectory(name, meta?)
    const sub = root.createDirectory("subdir", { key: "some_key" });

    // Return the root — the game navigates from here
    return root;
}
```

Root is always named `$ROOT`. Use `/` in `createDirectoryStructure` for nested paths.

## Meta — the narrative engine

Every `File` and `Directory` accepts a third argument: `Meta`. This is where all narrative behavior lives.

### Meta properties

| Property | Type | Applies to | Effect |
|---|---|---|---|
| `key` | `string` | File / Dir | Locks the node. Player needs a matching inventory item to unlock. |
| `selfDestruct` | `boolean` | File | Hides the file after the player closes it. |
| `corrupted` | `boolean` | File | Renders garbled, flickering text. |
| `hidden` | `boolean` | File / Dir | Hidden from directory listings (set via `revealsOn*` to unhide). |
| `run(log, ctx)` | function | File | Makes the file **executable**. Typewriter console output. Can mutate tree and dispatch actions. |
| `choices` | `Choice[]` | File | Shows action buttons below the file content. |
| `onRead(ctx)` | function | File | Fires when the player opens this file. |
| `onUnlock(ctx)` | function | File / Dir | Fires when the player unlocks this node. |
| `revealsOnRead` | `string[]` | File | Paths to unhide when this file is opened. |
| `revealsOnUnlock` | `string[]` | File / Dir | Paths to unhide when this node is unlocked. |
| `runState` | `Record<string, any>` | File | Initial state bag for executables. Survives save/load. |

### RunContext API

Callbacks (`run`, `onRead`, `onUnlock`) receive a `RunContext`:

```ts
ctx.dispatch(action)          // Queue an action for the reducer
ctx.schedule(action, delayMs) // Queue after N milliseconds (returns cancel function)
ctx.log(category, text)       // Add entry to the player's log
ctx.state.inventory           // Read-only snapshot of current inventory
ctx.state.gamePhase           // Current game phase (number)
ctx.state.readFiles           // Paths of all files the player has opened
```

### Log categories

```ts
type LogCategory = "story" | "goal" | "milestone" | "system";
```

- `story` — narrative events the player discovers
- `goal` — objectives or new tasks
- `milestone` — major progress points
- `system` — technical events (unlocks, file creation)

### Available actions

| Action | Payload | Effect |
|---|---|---|
| `INVENTORY_ADD` | `string` (item type) | +1 to an inventory item |
| `INVENTORY_REMOVE` | `string` (item type) | -1 from an inventory item |
| `ADD_ITEMS` | `Record<string, number>` | Bulk add items |
| `SET_PHASE` | `number` | Set the game phase |
| `REVEAL_FILE` | `string` (full path) | Unhide a file or directory |
| `SAVE_GAME` | `null` | Force a save |
| `LOG_ADD` | `LogEntry` | Add a log entry |

## ⚠️ Key-and-Lock Rules (READ BEFORE AUTHORING)

**Every unlock consumes the key from inventory.** The `UNLOCK_FILENODE` action removes the matching item after a successful unlock. This means:

### ✅ Do: Lock directories, never individual files that share a key

```ts
// GOOD — one key opens a directory with multiple files inside
const restricted = root.createDirectory("restricted", { key: "clearance" });
restricted.createFile("report_a.txt", "...");
restricted.createFile("report_b.txt", "...");
```

When the player uses `clearance` to unlock `restricted/`, the key is consumed but both `report_a.txt` and `report_b.txt` become accessible — because the directory is now unlocked.

### ❌ Don't: Lock multiple individual files with the same key

```ts
// BAD — key is consumed on first unlock, second file stays locked forever
root.createFile("report_a.txt", "...", { key: "clearance" });
root.createFile("report_b.txt", "...", { key: "clearance" });
// Player unlocks report_a → clearance is consumed → report_b is permanently locked
```

### Key design checklist

- Each key unlocks exactly **one directory** (that may contain many files)
- If you want two separate locked areas, use **two different keys**
- Keys handed to the player via `onRead` callbacks must match the key name exactly
- Every key you grant via `ADD_ITEMS` must have a corresponding locked directory
- Keys that appear in `getInitialInventory()` are available from game start

## Patterns

### Locked content

```ts
// Directory locked behind a key — preferred pattern
root.createDirectory("vault", { key: "vault_key" });

// Only lock individual files when each has a UNIQUE key
root.createFile("secret.txt", "content", { key: "secret_code" });
// Don't reuse "secret_code" on another file — it's consumed on unlock.

// Give the player the key in inventory
import { addItem } from "../inventory";
getInitialInventory(): Inventory {
    let inv: Inventory = {};
    inv = addItem(inv, "vault_key");
    return inv;
}
```

### Item registry

Every key and collectible item must be registered in `src/model/items.ts`:

```ts
// In src/model/items.ts — add an entry to ITEM_REGISTRY:
const ITEM_REGISTRY: Record<string, ItemInfo> = {
    // ...existing items...
    your_key_id: {
        name: "Display Name",          // shown in inventory and toasts
        description: "What it unlocks", // shown below the name
        icon: "🔑",                     // emoji
    },
};
```

This powers the inventory tab cards and the item-acquired toast. If an item is missing from the registry, it shows as "Unknown Item" with a ❓ icon.

### Executable with console output

```ts
root.createFile("scan.exe", "", {
    run(log, ctx) {
        log("Scanning system...");
        log("Found 3 anomalies.");
        log("Done.");
        // Executables can create new files
        this.root.createFile("scan_results.txt", "Anomaly at sector 7.");
    },
});
```

### Conditional content (game phases)

```ts
root.createFile("door.exe", "", {
    run(log, ctx) {
        if (ctx.state.gamePhase >= 2) {
            log("The door opens.");
            ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/secret_room" });
        } else {
            log("The door is locked. You need to find the key first.");
        }
        // Track execution count across saves
        this.runState.timesOpened = (this.runState.timesOpened || 0) + 1;
    },
});
```

### Quest chain

```ts
// Step 1: reading a note gives the player a key
root.createFile("note.txt", "The basement key is under the rug.", {
    onRead(ctx) {
        ctx.dispatch({ type: "ADD_ITEMS", payload: { basement_key: 1 } });
        ctx.log("story", "You found a note mentioning a basement key.");
        ctx.log("goal", "Use the basement key to explore the basement.");
    },
});

// Step 2: the basement is locked, requires the key
root.createDirectory("basement", {
    key: "basement_key",
    onUnlock(ctx) {
        ctx.dispatch({ type: "SET_PHASE", payload: 2 });
        ctx.log("milestone", "Basement unlocked.");
    },
});

// Step 3: inside the basement, a hidden file is revealed on unlock
const basement = root.createDirectory("basement");
basement.createFile("final_clue.txt", "The truth is...", {
    hidden: true,
});
basement.meta.revealsOnUnlock = ["$ROOT/basement/final_clue.txt"];
```

### Player choices

```ts
root.createFile("door.txt", "You stand before a heavy door.", {
    choices: [
        {
            label: "Open the door",
            action: { type: "REVEAL_FILE", payload: "$ROOT/beyond" },
        },
        {
            label: "Walk away",
            action: { type: "SET_PHASE", payload: 3 },
        },
    ],
});
```

### Timed events

```ts
root.createFile("bomb.exe", "", {
    run(log, ctx) {
        log("Bomb armed. 5 seconds...");
        ctx.schedule(
            { type: "REVEAL_FILE", payload: "$ROOT/explosion.txt" },
            5000,
        );
    },
});
```

### Storing state in executables

```ts
root.createFile("counter.exe", "", {
    run(log, ctx) {
        this.runState.count = (this.runState.count || 0) + 1;
        log(`You've run this ${this.runState.count} time(s).`);
        if (this.runState.count >= 3) {
            ctx.dispatch({ type: "REVEAL_FILE", payload: "$ROOT/bonus.txt" });
        }
    },
    runState: { count: 0 },  // initial state (optional, defaults to {})
});
```

## The save system

Everything covered by the save snapshot is **automatically persisted**:

- Unlocked nodes
- Hidden files (self-destruct)
- Modified file content (executable output)
- Runtime-created files (including their non-function meta)
- Executable `runState`
- Read files tracking
- Game phase
- Inventory state
- Log entries

**Not persisted** (reconstructed from the storyline on load):

- Function callbacks in Meta (`run`, `onRead`, `onUnlock`) — these come from your storyline code
- The directory tree structure — built fresh from `buildFilesystem()`, then deltas are applied

## Checklist

When adding a new storyline:

- [ ] Create `src/model/storylines/<id>.ts` implementing the `Storyline` interface
- [ ] `buildFilesystem()` returns a valid tree starting from a `$ROOT` directory
- [ ] `getInitialInventory()` returns the starting items
- [ ] Keys only lock **directories**, not individual files (see Key-and-Lock Rules above)
- [ ] Every key has one corresponding locked node — never reuse a key on two nodes
- [ ] Register every key in `src/model/items.ts` with display name, description, and icon
- [ ] Register in `src/model/game.ts` → `storylines` map
- [ ] Run `pnpm check && pnpm knip && pnpm dupe && pnpm build` — all must pass
- [ ] Test: clear localStorage → pick storyline → play through a few steps → reload → verify state restored
- [ ] Test: corrupt localStorage manually → verify error screen + Start Over works
