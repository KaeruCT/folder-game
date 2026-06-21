# folder-game

A mystery/puzzle game that simulates a hacked computer's filesystem. Navigate directories, read files, run executables, collect inventory keys, unlock hidden files, and uncover the story of a system administrator being hunted.

## Table of Contents

- [Overview](#overview)
- [Game Story](#game-story)
- [Gameplay Mechanics](#gameplay-mechanics)
- [Tech Stack](#tech-stack)
- [Quality Pipeline](#quality-pipeline)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Component Tree](#component-tree)
  - [State Management](#state-management)
  - [Data Model](#data-model)
- [Setup & Development](#setup--development)
- [Deployment](#deployment)
- [License](#license)

## Overview

**folder-game** is a single-page React application that presents a fake operating system desktop with a filesystem browser. The player navigates a mock directory tree, opens files, runs executables, and uses inventory items (keys) to unlock secured content. Files can self-destruct, execute with simulated console output, display images/videos, or become corrupted.

Built for mobile — touch-friendly, notch-safe, 44px tap targets, no pull-to-refresh.

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

The player starts at the root directory (`$ROOT/`). Clicking a directory navigates into it. Clicking a file opens it in the file viewer. Each directory view shows a back-navigation item (`..`) to go up one level. Files and directories that are `hidden` are filtered from view.

### Executable Files (`.exe`)

Files with the `.exe` extension or a `run` function in their metadata are **executables**. When opened, instead of displaying raw content, they simulate console output line-by-line with a typewriter effect. For example, `user_info.exe` generates a user report file after displaying simulated terminal output.

### Locked Files

Files and directories can be `locked` (requiring a key to access). Clicking a locked item opens a modal asking to confirm unlocking. If the player's inventory has the required key, the item unlocks and the key is consumed. Keys cannot be reused.

### Self-Destructing Files

Files with the `selfDestruct` metadata flag become hidden after the first read. The `instructions.txt` file uses this to reinforce the urgency of the narrative.

### Corrupted Files

Files with the `corrupted` metadata flag display garbled content that animates randomly (character case flips, substitutions, insertions), simulating data corruption. `lock.exe` uses this before the file is properly unlocked/executed.

### Inventory System

The player has an inventory of **items** (keyed by type with a quantity). Items are used to unlock locked file nodes. The game starts with 2 `diary_entry` keys and 1 `sys` key. Locking down the system awards additional keys.

### Media Files

Files with image extensions (`jpg`, `jpeg`, `gif`, `png`) render as images. Files with video extensions (`webm`, `mp4`) render as HTML5 video players.

## Tech Stack

| Dependency | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript 5 | Type checking (strict mode) |
| Vite 5 | Bundler + dev server |
| pnpm | Package manager |
| SCSS (dart-sass) | Styling |

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
| `pnpm check` | Biome linter + formatter (166 files, zero tolerance) |
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
│   │   ├── file/               # Filesystem browsing components
│   │   │   ├── DirectoryItem.tsx    # Single file/directory entry
│   │   │   ├── DirectoryView.tsx    # Directory contents listing
│   │   │   ├── FilesystemViewer.tsx # Top-level: file viewer or directory view
│   │   │   └── FileViewer.tsx       # File content renderer (text/image/video/exe)
│   │   ├── icons/              # SVG icons for file types and UI elements (143 icons)
│   │   ├── inventory/          # Inventory panel
│   │   ├── navigation/         # Bottom navigation bar
│   │   └── ui/                 # Shared UI primitives (Modal)
│   ├── game-files/             # Static game content
│   │   ├── images/             #   Images referenced by in-game files
│   │   └── intro/              #   Initial game text files
│   ├── model/                  # Core game logic and data structures
│   │   ├── data.ts             #   Constants (user names, extension maps)
│   │   ├── files.ts            #   File, Directory, and FileNode classes
│   │   ├── game.ts             #   Game initialization (filesystem + inventory)
│   │   ├── inventory.ts        #   Inventory item management
│   │   └── util.ts             #   Random generation helpers
│   ├── App.tsx                 # Root component + context provider + view router
│   ├── reducer.ts              # Game state reducer (useReducer)
│   ├── index.tsx               # React 18 entry point (createRoot)
│   └── vite-env.d.ts           # Vite type declarations
├── index.html                  # Vite HTML entry point
├── vite.config.ts              # Vite configuration
├── biome.json                  # Biome linter + formatter config
├── knip.json                   # Knip dead code detection config
├── tsconfig.json               # TypeScript configuration
├── package.json
├── pnpm-lock.yaml
├── AGENTS.md                   # Agent instructions
├── .gitignore
└── LICENSE
```

## Architecture

### Component Tree

```
App (AppStore.Provider)
├── FilesystemViewer
│   ├── DirectoryView
│   │   └── DirectoryItem (× N per listing)
│   │       └── Modal (for unlock confirmation)
│   └── FileViewer
│       ├── ExeOutput          (executable files / typewriter effect)
│       │   └── FileContent
│       │       └── CorruptedFileContent
│       ├── PlainTextOutput    (default text files)
│       │   └── FileContent
│       ├── ImageResourceOutput (image extensions)
│       └── VideoResourceOutput (video extensions)
├── InventoryViewer
└── Navigation (tab bar: Filesystem / Inventory / Log)
```

### State Management

Uses React's `useReducer` + `Context`. No external state library.

**State shape:**

```typescript
interface State {
    inventory: Inventory;           // Record<ItemType, { type, quantity }>
    filesystemRoot: Directory;      // Root of the entire directory tree
    cwd: Directory;                 // Current working directory
    file: File | null;              // Currently open file (null = directory view)
}
```

**Actions:**

| Action | Payload | Effect |
|---|---|---|
| `INVENTORY_ADD` | `ItemType` | Adds 1 to an inventory item's quantity |
| `INVENTORY_REMOVE` | `ItemType` | Removes 1 from an inventory item's quantity |
| `SET_CWD` | `Directory` | Changes the current working directory |
| `SET_FILE` | `File \| null` | Opens a file (handles self-destruct + auto-run) or closes to directory view |
| `UNLOCK_FILENODE` | `FileNode` | Consumes a matching inventory key to unlock a locked file or directory |

**Key behaviors:**

- **SET_FILE**: When a File is opened, it checks `file.meta.selfDestruct` (hides the file after read) and `file.isExecutable` (automatically runs the file). It also updates the filesystem root reference so mutations propagate.
- **UNLOCK_FILENODE**: Looks up the file node's `meta.key` in the player's inventory. If the key exists, it removes the key and unlocks the node. Otherwise, nothing happens (modal closes without effect).

### Data Model

#### File

```typescript
class File {
    readonly name: string;
    content: string;           // Raw text content or imported asset path
    tempContent: string;       // Buffer for executable output
    readonly parent: Directory;
    readonly meta: Meta;       // Arbitrary metadata (key, selfDestruct, corrupted, run, etc.)
    locked: boolean;
    hidden: boolean;
    // Computed: fullName, root, extension, size, isExecutable
    run(): void;               // Executes meta.run if defined
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
    createDirectory(name: string, meta?: Meta): Directory;
    createFile(name: string, content: string, meta?: Meta): File;
    fileExists(name: string): boolean;
    getFileNode(name: string): FileNode;
    remove(name: string): void;
}
```

#### Meta (File/Directory metadata)

```typescript
type Meta = {
    [key: string]: any;
    run?: (this: File, log: (line: string) => void) => void;
};
```

Used properties: `key` (lock type), `selfDestruct` (hide after read), `corrupted` (garbled display).

#### Inventory

```typescript
type ItemType = string;
type Inventory = Record<ItemType, { type: ItemType; quantity: number }>;
```

Functions: `addItem(inventory, itemType)` increments quantity; `removeItem(inventory, itemType)` decrements and removes at zero.

### Game Data Initialization

`getFilesystem()` in `model/game.ts` builds the directory tree:

```
$ROOT/
├── help/
│   ├── instructions.txt    [selfDestruct]
│   ├── 1.png
│   ├── 4.png
│   └── 6.png
├── trash/
│   ├── ed.gif
│   ├── 7.png
│   └── 8.png
├── users/
│   └── evan/
│       ├── diary/
│       │   ├── may1.txt     [key: diary_entry]
│       │   ├── may5.txt     [key: diary_entry]
│       │   ├── may8.txt     [key: diary_entry]
│       │   └── person.jpg
│       └── porn/
│           ├── italian.mp4
│           └── smell.mp4
├── programs/
│   └── lock.exe             [selfDestruct, corrupted]
└── sys/
    ├── share/               [key: sys]
    ├── lib/                 [key: sys]
    ├── cache/               [key: sys]
    ├── local/               [key: sys]
    ├── net/                 [key: sys]
    └── safe/
        ├── lucky7.exe       [selfDestruct, executable: runs lockdown routine]
        └── user_info.exe    [executable: generates user report]
```

Initial inventory: 2× `diary_entry`, 1× `sys`.

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

Outputs to `dist/` — 54 KB gzipped JS, 2 KB gzipped CSS.

## Deployment

Pushes to `master` automatically deploy to GitHub Pages via the workflow in `.github/workflows/deploy.yml`. The site is served at:

```
https://kaeruct.github.io/folder-game/
```

The workflow uses `pnpm install --frozen-lockfile` → `pnpm build` → GitHub Pages artifact deployment. No branch juggling — deploys directly from the workflow run.

## License

MIT — see [LICENSE](./LICENSE) for details.
