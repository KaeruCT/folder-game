# Root

A mystery/puzzle game disguised as a hacked computer filesystem. Navigate directories, read files, run executables, collect inventory keys, unlock hidden content, and uncover the truth.

## Table of Contents

- [Overview](#overview)
- [Game Story](#game-story)
- [Gameplay Mechanics](#gameplay-mechanics)
- [Narrative System](#narrative-system)
- [Tech Stack](#tech-stack)
- [Quality Pipeline](#quality-pipeline)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Setup & Development](#setup--development)
- [Deployment](#deployment)
- [License](#license)

## Overview

**Root** is a single-page React application that simulates exploring someone else's server. Navigate a mock directory tree, read files, run executables, collect inventory keys, unlock hidden content, and uncover the story. Features a dark terminal aesthetic, togglable tree/directory views, floating inventory and log panels, and multiple storylines.

Built for mobile — touch-friendly, notch-safe, 44px tap targets, no pull-to-refresh. Progress auto-saves to `localStorage`.

## Game Story

Root ships with two storylines:

### The Lockdown
An anonymous system administrator built a **deadman switch**: if anything happened to them, access credentials to their server would be published for hackers to find. The player is one of potentially hundreds of infiltrators. Lock everyone else out before they lock you out — then uncover what the admin died to protect.

### The Echoes Below
Frank Nicholas vanished into the Hollow Earth. His server holds the answers: obsession, discovery, and a terrible choice. Uncover his research on the inner world, his stalking of a woman named Chiara, and the ritual that could grant him telepathy — at the cost of her life.

## Gameplay Mechanics

### Filesystem Navigation

The player starts at the root directory (`/`). Two views are available, toggled via the folder button in the header bar:

- **Directory view** (default): Cards showing files and subdirectories. Click a directory to navigate into it. Click a file to open it. A back-navigation item (`..`) goes up one level.
- **Tree view**: Full filesystem hierarchy as a collapsible tree. Click a directory to expand and navigate into it. Click again to collapse and return to the parent. Current directory is highlighted. State persists across file opens and page reloads.

Both views filter out `hidden` files and directories. The view preference is saved to localStorage.

Inventory and Log open as floating overlay panels from the header bar. Click the backdrop or press Escape to dismiss. Save Now and Reset Game live in the settings gear (⚙) dropdown.

### Executable Files (`.exe`)

Files with the `.exe` extension or a `run` function in their metadata are **executables**. When opened, instead of displaying raw content, they simulate console output line-by-line with a typewriter effect. Executables receive a `RunContext` with access to:
- `ctx.dispatch(action)` — queue an action to be processed by the reducer
- `ctx.schedule(action, delayMs)` — dispatch an action after a delay (returns cancel function)
- `ctx.log(category, text)` — add an entry to the player's log
- `ctx.state` — read-only snapshot of inventory, gamePhase, and readFiles
- `this.runState` — mutable state bag persisted across save/load

### Locked Files

Files and directories can be `locked` (requiring a key to access). Clicking a locked item prompts to unlock. If the player's inventory has the required key, the item unlocks and the key is consumed. After unlock: files open immediately, directories navigate in.

### Self-Destructing Files

Files with the `selfDestruct` metadata flag become hidden after the first read.

### Corrupted Files

Files with the `corrupted` metadata flag display garbled flickering text (case flips, character substitutions, random insertions).

### Inventory System

The player has an inventory of **items** (keyed by type with a quantity). Items are used to unlock locked nodes. Items can be added/removed programmatically via `ADD_ITEMS` / `INVENTORY_REMOVE` actions.

### Media Files

| Extension | Rendered as |
|---|---|
| `jpg`, `jpeg`, `gif`, `png` | `<img>` |
| `webm`, `mp4` | `<video>` player |
| `mp3`, `ogg`, `wav`, `flac` | `<audio>` player |

Media is organized per-storyline under `src/game-files/storylines/<id>/{images,audio}/`.

### Log & Notifications

Story events, goals, and milestones are recorded in the player's log (📜 in the header bar). Each log entry has a category badge (Story/Goal/Milestone/System).

When new log entries or inventory items arrive, a red count badge appears on the corresponding header icon. Opening the panel clears it.

### Player Choices

Files with `meta.choices` render button options below their content. Each choice dispatches an action when clicked.

## Narrative System

Files and directories carry a **Meta** bag that drives all narrative behavior.

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

```ts
ctx.dispatch(action)         // Queue an action for the reducer
ctx.schedule(action, delay)  // Queue after N milliseconds (returns cancel function)
ctx.log(category, text)      // Add a log entry
ctx.state.inventory          // Read-only snapshot: current inventory
ctx.state.gamePhase          // Current game phase
ctx.state.readFiles          // Paths of all files the player has opened
```

Actions go through a **deferred queue** — `ctx.dispatch` pushes to `deferredActions[]`, and a `useEffect` in App drains it through React's `useReducer` dispatch.

### Game State

```ts
interface State {
    storylineId: string;
    inventory: Inventory;
    filesystemRoot: Directory;
    cwd: Directory;
    file: File | null;
    readFiles: string[];
    gamePhase: number;
    logEntries: LogEntry[];
    unreadInventoryCount: number;   // Badge count for inventory icon
    unreadLogCount: number;         // Badge count for log icon
    revealCounter: number;          // Bumped on every reveal so views re-filter
}
```

### All Actions

| Action | Payload | Effect |
|---|---|---|
| `SELECT_STORYLINE` | `string` | Start a new storyline |
| `INVENTORY_ADD` | `ItemType` | +1 to inventory item |
| `INVENTORY_REMOVE` | `ItemType` | -1 from inventory item |
| `ADD_ITEMS` | `Record<ItemType, number>` | Bulk add items |
| `SET_CWD` | `Directory` | Change current working directory |
| `SET_FILE` | `File \| null` | Open/close a file (fires onRead, revealsOnRead, selfDestruct, run) |
| `UNLOCK_FILENODE` | `FileNode` | Consume key + unlock (fires onUnlock, revealsOnUnlock) |
| `REVEAL_FILE` | `string` (path) | Unhide a file/directory by path |
| `LOG_ADD` | `LogEntry` | Add a log entry |
| `MARK_INVENTORY_READ` | `null` | Clear inventory badge |
| `MARK_LOG_READ` | `null` | Clear log badge |
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
| `pnpm check` | Biome linter + formatter (177 files, zero tolerance) |
| `pnpm check:write` | Auto-fix formatting, imports, and safe lint fixes |
| `pnpm knip` | Dead code detection (unused exports, deps, files) |
| `pnpm dupe` | dupehound structural duplicate scan |
| `pnpm dupe:check` | CI diff gate — fails if new code duplicates existing functions |
| `pnpm build` | TypeScript compilation + Vite production build |
| `pnpm dev` | Vite dev server (hot reload) |
| `pnpm preview` | Preview the production build locally |

See [AGENTS.md](./AGENTS.md) for code style and contribution rules. See [STORYLINES.md](./STORYLINES.md) for how to author and register new storylines.

## Project Structure

```
root/
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
│   │   ├── inventory/          # Inventory overlay
│   │   ├── log/                # Log overlay
│   │   ├── storyline/          # Storyline selection screen
│   │   └── ui/                 # Shared UI (Modal, HeaderBar, FloatingOverlay)
│   ├── game-files/             # Static game content
│   │   ├── intro/              #   Shared text files
│   │   └── storylines/         #   Storyline-specific media
│   │       ├── echoes/         #     images + audio for The Echoes Below
│   │       └── lockdown/       #     images for The Lockdown
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
│   ├── Tree/List view toggle
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
│       ├── PlainTextOutput
│       ├── ImageResourceOutput
│       ├── VideoResourceOutput
│       ├── AudioResourceOutput
│       └── ChoiceOutput           (button actions from meta)
```

### State Management

Uses React's `useReducer` + `Context`. No external state library.

Actions dispatched from inside callbacks/executables go through a **deferred queue**: `ctx.dispatch()` pushes to `deferredActions[]`, and a `useEffect` in App drains the queue through the real React dispatcher. Timer-based actions via `ctx.schedule()` use `setTimeout`. All timers are cleared on game reset via `clearAllTimers()`.

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
    createDirectory(name, meta?): Directory;
    createFile(name, content, meta?): File;
    fileExists(name): boolean;
    getFileNode(name): FileNode;
    remove(name): void;
}
```

### Save System

`model/save.ts` implements delta-based snapshots to `localStorage`:

1. **Build snapshot**: Compare the current tree against a fresh initial tree — extract only what changed
2. **Persist**: Serialize to JSON via `localStorage.setItem()`
3. **Restore**: On app init, check `localStorage`; if saved state exists, build fresh tree and apply deltas

**What's persisted:**

| Field | Contents |
|---|---|
| `storylineId` | Active storyline |
| `cwdPath` | Last browsed directory |
| `gamePhase` | Current chapter/phase |
| `readFiles` | All files the player has opened |
| `logEntries` | Player's event log |
| `inventory` | Item quantities |
| `hiddenStates` | Per-node hidden state (reveals + selfDestruct) |
| `unlockedPaths` | Nodes the player unlocked |
| `modifiedContent` | Files changed by executables |
| `createdFiles` | Runtime-created files (content + meta) |
| `runStates` | Per-file executable state |

**Auto-save**: Debounced 500ms after every state change. Manual save via Settings gear. Reset clears localStorage and reloads the page.

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

Outputs to `dist/`.

## Deployment

Pushes to `master` automatically deploy to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. The site is served at:

```
https://kaeruct.github.io/folder-game/
```

The workflow uses `pnpm install --frozen-lockfile` → `pnpm build` → GitHub Pages artifact deployment.

## License

MIT — see [LICENSE](./LICENSE) for details.
