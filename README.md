# folder-game

A mystery/puzzle game that simulates a hacked computer's filesystem. Navigate directories, read files, run executables, collect inventory keys, unlock hidden files, and uncover the story of a system administrator being hunted.

## Table of Contents

- [Overview](#overview)
- [Game Story](#game-story)
- [Gameplay Mechanics](#gameplay-mechanics)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Component Tree](#component-tree)
  - [State Management](#state-management)
  - [Data Model](#data-model)
- [Setup & Development](#setup--development)
- [Available Scripts](#available-scripts)
- [Webpack Configuration](#webpack-configuration)
- [License](#license)

## Overview

**folder-game** is a single-page React application that presents a fake operating system desktop with a filesystem browser. The player navigates a mock directory tree, opens files, runs executables, and uses inventory items (keys) to unlock secured content. Files can self-destruct, execute with simulated console output, display images/videos, or become corrupted.

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

| Dependency | Version | Purpose |
|---|---|---|
| React | ^16.13.1 | UI framework |
| TypeScript | ~3.7.2 | Type checking |
| @craco/craco | ^5.6.4 | CRA configuration override (webpack customization) |
| immer | ^7.0.3 | Immutable state updates |
| lodash | ^4.17.15 | Utility functions (sortBy) |
| node-sass | ^4.14.1 | SCSS compilation |
| raw-loader | ^4.0.1 | Import `.txt` files as raw strings |
| react-scripts | 3.4.1 | Create React App toolchain |
| @testing-library/react | ^9.3.2 | Component testing |

## Project Structure

```
folder-game/
├── public/                          # Static assets (HTML, favicon, manifest)
│   └── index.html
├── src/
│   ├── component/
│   │   ├── file/                    # Filesystem browsing components
│   │   │   ├── DirectoryItem.tsx     #   Single file/directory entry in a listing
│   │   │   ├── DirectoryItem.scss
│   │   │   ├── DirectoryView.tsx     #   Directory contents listing
│   │   │   ├── DirectoryView.scss
│   │   │   ├── FilesystemViewer.tsx  #   Top-level: file viewer or directory view
│   │   │   ├── FileViewer.tsx        #   Renders file content (text/image/video/exe)
│   │   │   └── FileViewer.scss
│   │   ├── icons/                   # SVG icons for file types and UI elements
│   │   │   ├── folder.svg, folder-1..3.svg
│   │   │   ├── text.svg, text-1..5.svg
│   │   │   ├── pdf.svg, pdf-1..5.svg
│   │   │   ├── excel.svg, excel-1..5.svg
│   │   │   ├── ai.svg, ai-1..5.svg
│   │   │   ├── ps.svg, ps-1..5.svg
│   │   │   ├── browser.svg, filesystem.svg, inventory.svg, log.svg
│   │   │   └── ... (100+ icons)
│   │   ├── inventory/               # Inventory panel
│   │   │   ├── InventoryViewer.tsx
│   │   │   └── InventoryViewer.scss
│   │   ├── navigation/              # Bottom navigation bar
│   │   │   ├── Navigation.tsx
│   │   │   └── Navigation.scss
│   │   └── ui/                      # Shared UI primitives
│   │       ├── Modal.tsx
│   │       └── Modal.scss
│   ├── game-files/                  # Static game content
│   │   ├── images/                  #   Images referenced by in-game files
│   │   │   ├── 1.png, 4.png, 6.png, 7.png, 8.png
│   │   │   ├── art.jpg, ed.gif, erik.jpg
│   │   └── intro/                   #   Initial game text files
│   │       ├── instructions.txt     #     First file the player reads
│   │       ├── lock.exe.txt         #     Content for the fake lock.exe
│   │       └── lockout.txt          #     Revealed after lockdown
│   ├── model/                       # Core game logic and data structures
│   │   ├── data.ts                  #   Constants: user name lists, file extension maps
│   │   ├── files.ts                 #   File, Directory, and FileNode classes
│   │   ├── game.ts                  #   Game initialization (filesystem + inventory)
│   │   ├── inventory.ts             #   Inventory item management
│   │   └── util.ts                  #   Random generation helpers
│   ├── App.tsx                      # Root component (context provider + view router)
│   ├── App.scss
│   ├── reducer.ts                   # Game state reducer (useReducer)
│   ├── index.tsx                    # React entry point
│   ├── index.scss                   # Global styles
│   ├── react-app-env.d.ts           # CRA TypeScript declarations
│   ├── serviceWorker.ts             # CRA service worker (unused)
│   └── setupTests.ts                # Test setup
├── craco.config.js                  # CRACO/webpack override (raw-loader for .txt)
├── tsconfig.json                    # TypeScript configuration
├── package.json
├── yarn.lock
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
│       ├── ExeOutput          (executable files)
│       │   └── FileContent
│       │       └── CorruptedFileContent
│       ├── PlainTextOutput    (default text files)
│       │   └── FileContent
│       ├── ImageResourceOutput (image extensions)
│       └── VideoResourceOutput (video extensions)
├── InventoryViewer
└── Navigation (tab bar)
```

### State Management

The app uses React's `useReducer` + `Context` rather than external state libraries. Immer was a dependency but is not directly used in the reducer.

**State shape:**

```typescript
interface State {
    inventory: Inventory;           // Record<ItemType, Item>
    filesystemRoot: Directory;      // Root of the entire directory tree
    cwd: Directory;                // Current working directory
    file: File | null;             // Currently open file (null = directory view)
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
    addDirectory(directory: Directory): Directory;
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
    run?: (this: File, log: (line: string) => void) => void;  // Executable behavior
};
```

Used properties include: `key` (lock type), `selfDestruct` (hide after read), `corrupted` (garbled display), `password` (alternative lock mechanism, unused).

#### Inventory

```typescript
type ItemType = string;
type Item = { type: ItemType; quantity: number };
type Inventory = Record<ItemType, Item>;
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

- Node.js (v12+ recommended to match the `@types/node` version)
- Yarn (v1.x)

### Install

```bash
yarn install
```

> **Note:** This project uses `node-sass` v4 which may require Python 2 and a C++ compiler. If you encounter build errors, consider upgrading to `sass` (dart-sass) or using a compatible Node version.

### Start Development Server

```bash
yarn start
```

Opens the app at [http://localhost:3000](http://localhost:3000). Hot reloads on changes.

### Build for Production

```bash
yarn build
```

Outputs optimized, minified assets to the `build/` directory with content hashes in filenames.

### Running Tests

```bash
yarn test
```

Launches Jest in interactive watch mode.

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `start` | `craco start` | Development server |
| `build` | `craco build` | Production build |
| `test` | `craco test` | Test runner (Jest) |
| `eject` | `craco eject` | Eject CRA configuration |

All scripts use `craco` (Create React App Configuration Override) instead of `react-scripts` directly, allowing the custom webpack configuration below.

## Webpack Configuration

The project uses **CRACO** (`@craco/craco`) to customize the Create React App webpack config without ejecting. The override in `craco.config.js` adds `raw-loader` for `.txt` files, placed before the default `file-loader`:

```javascript
// craco.config.js
module.exports = {
    plugins: [{
        plugin: {
            overrideWebpackConfig: ({ webpackConfig }) => {
                addBeforeLoader(webpackConfig, loaderByName('file-loader'), {
                    test: /\.txt$/i,
                    use: 'raw-loader',
                });
                return webpackConfig;
            }
        }
    }]
};
```

This allows importing `.txt` files as raw strings in TypeScript:

```typescript
const instructions = require("../game-files/intro/instructions.txt").default;
```

## License

MIT — see [LICENSE](./LICENSE) for details.
