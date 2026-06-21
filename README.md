# folder-game

A mystery/puzzle game that simulates a hacked computer's filesystem. Navigate directories, read files, run executables, collect inventory keys, unlock hidden files, and uncover the story of a system administrator being hunted.

## Table of Contents

- [Overview](#overview)
- [Game Story](#game-story)
- [Gameplay Mechanics](#gameplay-mechanics)
- [Narrative System](#narrative-system)
- [Tech Stack](#tech-stack)
- [Quality Pipeline](#quality-pipeline)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Component Tree](#component-tree)
  - [State Management](#state-management)
  - [Data Model](#data-model)
  - [Save System](#save-system)
- [Setup & Development](#setup--development)
- [Deployment](#deployment)
- [License](#license)

## Overview

**folder-game** is a single-page React application that simulates exploring someone else's computer. Navigate a mock directory tree, read files, run executables, collect inventory keys, unlock hidden content, and uncover the story. Features a dark terminal aesthetic with CRT scanlines, togglable tree/directory views, floating inventory and log panels, and three distinct storylines.

Built for mobile — touch-friendly, notch-safe, 44px tap targets, no pull-to-refresh. Progress auto-saves to `localStorage`.

## Game Story

An anonymous system administrator built a **deadman switch**: if anything happened to them, access credentials to their server would be published in plain sight for hackers to find.

The player is one of potentially hundreds of infiltrators who have accessed the system. The admin's instructions urge you to **lock everyone else out** before they lock you out.

Game files provide narrative through:
- `instructions.txt` — initial briefing; self-destructs after reading
- `lock.exe` (in `sys/safe/`) — runs the lockdown routine once triggered
- `lockout.txt` — appears after lockdown; reveals file keys as a reward
- Evan's diary entries (`users/evan/diary/`) — personal logs from a person losing their mental health
- Miscellaneous files and images scattered through the directory tree

The admin's identity, what happened to them, and who "they" are that are coming to silence them are left ambiguous — part of the mystery.

## Gameplay Mechanics

### Filesystem Navigation

The player starts at the root directory (`$ROOT/`). Two views are available, toggled via the 🌳/📂 button in the header bar:

- **Directory view** (default): Cards showing files and subdirectories. Click a directory to navigate into it. Click a file to open it. A back-navigation item (`..`) goes up one level.
- **Tree view**: Full filesystem hierarchy as a collapsible tree. Expand/collapse directories, click files to open. Current directory is highlighted. State persists across file opens and page reloads.

Both views filter out `hidden` files and directories. The view preference is saved to localStorage.

Inventory (📦) and Log (📜) open as floating overlay panels from the header bar. Click the backdrop or press Escape to dismiss. Save Now and Reset Game live in the settings gear (⚙) dropdown.

### Executable Files (`.exe`)

Files with the `.exe` extension or a `run` function in their metadata are **executables**. When opened, instead of displaying raw content, they simulate console output line-by-line with a typewriter effect. Executables receive a `RunContext` with access to:
- `ctx.dispatch(action)` — queue an action to be processed by the reducer
- `ctx.schedule(action, delayMs)` — dispatch an action after a delay (returns cancel function)
- `ctx.state` — read-only snapshot of inventory, gamePhase, and readFiles
- `this.runState` — mutable state bag persisted across save/load

### Locked Files

Files and directories can be `locked` (requiring a key to access). Clicking a locked item opens a modal asking to confirm unlocking. If the player's inventory has the required key, the item unlocks and the key is consumed. Keys cannot be reused. Unlocking fires `onUnlock` callbacks and `revealsOnUnlock`.

### Self-Destructing Files

Files with the `selfDestruct` metadata flag become hidden after the first read.

### Corrupted Files

Files with the `corrupted` metadata flag display garbled content that animates randomly (character case flips, substitutions, insertions), simulating data corruption.

### Inventory System

The player has an inventory of **items** (keyed by type with a quantity). Items are used to unlock locked file nodes. The game starts with 2 `diary_entry` keys and 1 `sys` key. Locking down the system awards additional keys. Items can be added/removed programmatically via `ADD_ITEMS` / `INVENTORY_REMOVE` actions.

### Media Files

| Extension | Rendered as |
|---|---|
| `jpg`, `jpeg`, `gif`, `png` | `<img>` |
| `webm`, `mp4` | `<video>` player |
| `mp3`, `ogg`, `wav`, `flac` | `<audio>` player |

### Log & Toasts

Story events, goals, and milestones are recorded in the player's log (📜 in the header bar). Each log entry has a category badge (Story/Goal/Milestone/System) with color-coded styling.

When a new log entry is created, a toast notification slides up at the bottom of the screen. Toasts auto-dismiss after 3 seconds or can be dismissed by clicking.

### Player Choices

Files with `meta.choices` render button options below their content. Each choice dispatches an action when clicked. Example:

```ts
createFile("door.txt", "You see a locked door.", {
    choices: [
        { label: "Pick the lock", action: { type: "REVEAL_FILE", payload: "$ROOT/room" } },
        { label: "Walk away",     action: { type: "SET_PHASE", payload: 2 } },
    ],
});
```

### Log & Toasts

Story events, goals, and milestones are recorded in the player's log (📜 in the header bar). Each log entry has a category badge (Story/Goal/Milestone/System) with color-coded styling.

When a new log entry is created, a toast notification slides up at the bottom of the screen. Toasts auto-dismiss after 3 seconds or can be dismissed by clicking.

## Narrative System

Files and directories carry a **Meta** bag that drives all narrative behavior. Below is the full API.

### Meta Properties

| Property | Type | On | Effect |
|---|---|---|---|
| `key` | `string` | File/Dir | Locks the node; requires matching inventory item to unlock |
| `selfDestruct` | `boolean` | File | Hides file after first read |
| `corrupted` | `boolean` | File | Renders garbled flickering text |
| `run` | `(log, ctx) => void` | File | Makes file executable; typewriter output, can mutate tree and dispatch actions |
| `onRead` | `(ctx) => void` | File | Callback fired when file is opened |
| `onUnlock` | `(ctx) => void` | File/Dir | Callback fired when node is unlocked |
| `revealsOnRead` | `string[]` | File | Paths to unhide when this file is opened |
| `revealsOnUnlock` | `string[]` | File/Dir | Paths to unhide when this node is unlocked |
| `choices` | `{label, action}[]` | File | Renders choice buttons; dispatches on click |
| `runState` | `Record<string, any>` | File | Persistent state bag for executables (survives save/load) |

### RunContext API

Passed to `run()`, `onRead()`, and `onUnlock()` callbacks:

```ts
ctx.dispatch(action)         // Queue an action for the reducer
ctx.schedule(action, delay)  // Queue after N milliseconds (returns cancel function)
ctx.state.inventory          // Read-only snapshot: current inventory
ctx.state.gamePhase          // Current game phase
ctx.state.readFiles          // Paths of all files the player has opened
```

Actions are processed through a **deferred queue** — `ctx.dispatch` pushes to a queue, and the App component drains it through React's `useReducer` dispatch. This means dispatched actions go through the normal reducer pipeline and trigger re-renders and auto-saves.

### Game State

```ts
interface State {
    inventory: Inventory;           // Record<ItemType, { type, quantity }>
    filesystemRoot: Directory;      // Root of the filesystem tree
    cwd: Directory;                 // Current working directory
    file: File | null;              // Currently open file (null = directory view)
    readFiles: string[];            // Paths of every file the player has opened
    gamePhase: number;              // Chapter/phase for conditional logic
}
```

### All Actions

| Action | Payload | Effect |
|---|---|---|
| `INVENTORY_ADD` | `ItemType` | +1 to inventory item |
| `INVENTORY_REMOVE` | `ItemType` | -1 from inventory item |
| `ADD_ITEMS` | `Record<ItemType, number>` | Bulk add items |
| `SET_CWD` | `Directory` | Change current working directory |
| `SET_FILE` | `File \| null` | Open/close a file (fires onRead, revealsOnRead, selfDestruct, run) |
| `UNLOCK_FILENODE` | `FileNode` | Consume key + unlock (fires onUnlock, revealsOnUnlock) |
| `REVEAL_FILE` | `string` (path) | Unhide a file/directory by path |
| `SET_PHASE` | `number` | Set game phase |
| `SAVE_GAME` | `null` | Persist current state to localStorage |
| `LOAD_GAME` | `SaveSnapshot` | Restore state from a save snapshot |

## Tech Stack

| Dependency | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript 5 | Type checking (strict mode) |
| Vite 5 | Bundler + dev server |
| pnpm | Package manager |
| SCSS (dart-sass) | Styling |
| Lucide React | Icon library |

**Quality tools:**

| Tool | Purpose |
|---|---|
| Biome 2 | Linter + formatter (Rust) |
| Knip | Dead code detection (Rust) |
| dupehound | Structural duplicate detection (Rust) |

No external state library — uses `useReducer` + `Context`. No runtime dependencies beyond React.

## Quality Pipeline

Every change must pass all four checks before being considered done:

```sh
pnpm check && pnpm knip && pnpm dupe && pnpm build
```

| Script | What it does |
|---|---|
| `pnpm check` | Biome linter + formatter (167 files, zero tolerance) |
| `pnpm check:write` | Auto-fix formatting, imports, and safe lint fixes |
| `pnpm knip` | Dead code detection (unused exports, deps, files) |
| `pnpm dupe` | dupehound structural duplicate scan (grade A, 0% slop) |
| `pnpm dupe:check` | CI diff gate — fails if new code duplicates existing functions |
| `pnpm build` | TypeScript compilation + Vite production build |
| `pnpm dev` | Vite dev server (hot reload) |
| `pnpm preview` | Preview the production build locally |

See [AGENTS.md](./AGENTS.md) for code style and contribution rules.

## Project Structure

```
folder-game/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages deployment on push to master
├── public/                     # Static assets (favicon, manifest, videos)
│   └── vid/                    #   In-game video files
├── src/
│   ├── component/
│   │   ├── file/               # Filesystem browsing + tree view
│   │   │   ├── DirectoryItem.tsx    # Single file/directory entry in grid view
│   │   │   ├── DirectoryView.tsx    # Flat directory contents listing
│   │   │   ├── FilesystemViewer.tsx # Top-level: file viewer, directory, or tree view
│   │   │   ├── FileViewer.tsx       # File renderer (text/image/video/audio/exe/choices)
│   │   │   └── TreeView.tsx         # Collapsible filesystem tree
│   │   ├── icons/              # Legacy SVG icons (143 icons, mostly unused)
│   │   ├── inventory/          # Inventory overlay + item-acquired toast
│   │   ├── log/                # Log overlay + log-entry toast
│   │   ├── storyline/          # Storyline selection screen
│   │   └── ui/                 # Shared UI (Modal, HeaderBar, FloatingOverlay)
│   ├── game-files/             # Static game content
│   │   ├── images/             #   Images referenced by in-game files
│   │   └── intro/              #   Initial game text files
│   ├── model/                  # Core game logic and data structures
│   │   ├── data.ts             #   Constants (user names, extension maps)
│   │   ├── files.ts            #   File, Directory, FileNode, RunContext, Meta
│   │   ├── game.ts             #   Storyline registration + selection entry points
│   │   ├── storyline.ts        #   Storyline interface
│   │   ├── icons.tsx           #   Lucide icon name → component resolver
│   │   ├── inventory.ts        #   Pure inventory functions (add/remove/addItems)
│   │   ├── items.ts            #   Item registry (display name, description, icon)
│   │   ├── log.ts              #   Log entry types and creation
│   │   ├── save.ts             #   Save/load delta snapshots (localStorage)
│   │   └── util.ts             #   Random generation helpers
│   ├── model/storylines/       # Storyline definitions
│   │   ├── lockdown.ts         #   The Lockdown
│   │   └── echoes.ts           #   The Echoes Below
│   ├── App.tsx                 #   Root: layout, header bar, overlays, auto-save, deferred drain
│   ├── reducer.ts              #   Game state reducer + deferred action queue
│   ├── index.tsx               #   React 18 entry point (createRoot)
│   └── vite-env.d.ts           #   Vite type declarations
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite config (base, chunks, SCSS modern API)
├── biome.json                  # Biome linter + formatter config
├── knip.json                   # Knip dead code detection config
├── tsconfig.json               # TypeScript (strict, incremental)
├── package.json
├── pnpm-lock.yaml
├── AGENTS.md                   # Agent instructions
├── STORYLINES.md               # Storyline authoring guide
├── .gitignore
└── LICENSE
```

## Architecture

### Component Tree

```
App (ErrorBoundary > AppStore.Provider)
├── HeaderBar
│   ├── Tree/List view toggle (🌳 / 📂)
│   ├── Inventory button (📦) → FloatingOverlay > InventoryViewer
│   ├── Log button (📜) → FloatingOverlay > LogViewer
│   └── Settings gear (⚙) → Save Now / Reset Game dropdown
├── FilesystemViewer
│   ├── DirectoryView
│   │   └── DirectoryItem (× N per listing)
│   │       └── Modal (unlock confirmation)
│   ├── TreeView (collapsible filesystem tree)
│   └── FileViewer
│       ├── ExeOutput              (typewriter effect)
│       │   └── FileContent
│       ├── PlainTextOutput
│       │   └── FileContent
│       │       └── CorruptedFileContent
│       ├── ImageResourceOutput
│       ├── VideoResourceOutput
│       ├── AudioResourceOutput
│       └── ChoiceOutput           (button actions from meta)
├── LogToast (auto-dismiss notification)
└── InventoryToast (item acquired notification)
```

### State Management

Uses React's `useReducer` + `Context`. No external state library.

Actions dispatched from inside callbacks/executables go through a **deferred queue**: `ctx.dispatch()` pushes to `deferredActions[]`, and a `useEffect` in App drains the queue through the real React dispatcher. This ensures all state changes flow through the normal reducer → re-render → auto-save pipeline.

Timer-based actions via `ctx.schedule()` use `setTimeout` behind a registry. All timers are cleared on game reset via `clearAllTimers()`.

### Data Model

#### File

```typescript
class File {
    readonly name: string;
    content: string;              // Raw text or imported asset path
    tempContent: string;          // Buffer for executable output
    readonly parent: Directory;
    readonly meta: Meta;          // All narrative behavior
    locked: boolean;
    hidden: boolean;
    runState: Record<string, any>; // Persistent executable state
    // Computed: fullName, root, extension, size, isExecutable
    run(ctx: RunContext): void;   // Executes meta.run with context
}
```

#### Directory

```typescript
class Directory {
    readonly name: string;
    readonly meta: Meta;
    parent: Directory | undefined;
    locked: boolean;
    hidden: boolean;
    // Computed: fullName, fileCount, contents, root
    createDirectory(name, meta?): Directory;
    createFile(name, content, meta?): File;
    fileExists(name): boolean;
    getFileNode(name): FileNode;
    remove(name): void;
}
```

#### Meta — the narrative engine

```typescript
type Meta = {
    [key: string]: any;
    run?: (this: File, log: LoggerFunction, ctx: RunContext) => void;
    onRead?: (ctx: RunContext) => void;
    onUnlock?: (ctx: RunContext) => void;
    revealsOnRead?: string[];
    revealsOnUnlock?: string[];
    choices?: { label: string; action: { type: string; payload: any } }[];
    runState?: Record<string, any>;
    key?: string;
    selfDestruct?: boolean;
    corrupted?: boolean;
};
```

#### Inventory

Pure functions operating on `Record<ItemType, { type, quantity }>`:
- `addItem(inventory, type)` — returns new inventory with +1
- `removeItem(inventory, type)` — returns new inventory with -1 (removes at 0)
- `addItems(inventory, { type: qty })` — bulk add

### Save System

`model/save.ts` implements delta-based snapshots to `localStorage`:

1. **Build snapshot**: Compare the current tree against a fresh initial tree — extract only what changed
2. **Persist**: Serialize to JSON via `localStorage.setItem()`
3. **Restore**: On app init, check `localStorage`; if saved state exists, build fresh tree and apply deltas

**What's persisted:**

| Field | Contents |
|---|---|
| `cwdPath` | Last browsed directory |
| `gamePhase` | Current chapter/phase |
| `readFiles` | All files the player has opened |
| `inventory` | Item quantities |
| `hiddenPaths` | Files hidden by selfDestruct |
| `unlockedPaths` | Nodes the player unlocked |
| `modifiedContent` | Files changed by executables |
| `createdFiles` | Runtime-created files (content + meta) |
| `runStates` | Per-file executable state |

**Auto-save**: Debounced 500ms after every state change. Manual save via Game tab. Reset clears localStorage and reloads the page.

## Setup & Development

### Prerequisites

- Node.js 22+
- pnpm

### Install

```bash
pnpm install
```

### Start Dev Server

```bash
pnpm dev
```

Opens at [http://localhost:5173](http://localhost:5173). Hot reload on changes.

### Run Quality Checks

```bash
pnpm check && pnpm knip && pnpm dupe && pnpm build
```

All four must pass with zero errors.

### Build for Production

```bash
pnpm build
```

Outputs to `dist/` — ~11 KB gzipped app JS, ~45 KB gzipped vendor JS, ~2 KB gzipped CSS.

## Deployment

Pushes to `master` automatically deploy to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. The site is served at:

```
https://kaeruct.github.io/folder-game/
```

The workflow uses `pnpm install --frozen-lockfile` → `pnpm build` → GitHub Pages artifact deployment.

## License

MIT — see [LICENSE](./LICENSE) for details.
