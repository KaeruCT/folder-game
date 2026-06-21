# AGENTS.md

See [STORYLINES.md](./STORYLINES.md) for how to author and register new storylines.

## Check before declaring done

Before marking any task complete, run all four:

```sh
pnpm check && pnpm knip && pnpm dupe && pnpm build
```

All must pass with zero errors. If Biome, Knip, or dupehound fail, fix them. If the build fails, fix it. Never suppress issues without a comment explaining why.

When adding new functions, prefer reusing existing ones. Run `pnpm dupe:check` to verify new code doesn't duplicate what's already in the codebase.

## Code style

Biome enforces everything. Let `pnpm check:write` auto-fix formatting and imports. If a rule must be suppressed, use `// biome-ignore` with a brief justification.

## Project stack

- **pnpm** — package manager
- **Vite** — bundler
- **React 18** — UI (use `createRoot`, not `ReactDOM.render`)
- **TypeScript 5** — strict mode
- **SCSS** — styling
- **Biome** — linter + formatter (Rust, fast)
- **Knip** — dead code detection (Rust, fast)
- **dupehound** — structural duplicate detection (Rust)

No external state library — uses `useReducer` + `Context`.

## State & Save System

All game state lives in `useReducer` + `Context`. The filesystem is class-based (`File`/`Directory`); mutations happen in-place and are captured via **delta snapshots** against a fresh initial tree. `model/save.ts` handles serialization to `localStorage`.

- **Auto-save**: debounced (500ms) after every state change
- **On init**: checks `localStorage` for saved state, restores if found
- **Reset**: Game tab → Reset clears localStorage and reloads

If you add new mutable state to File/Directory (fields beyond `hidden`, `locked`, `content`, `runState`), update `buildSnapshot` and `applySnapshot` in `model/save.ts`.

## Narrative System

Every `File` and `Directory` carries a `Meta` bag (`Record<string, any>`) that drives all narrative behavior:

| Property | On | Effect |
|---|---|---|
| `key` | File/Dir | Locks node; requires matching inventory item to unlock |
| `selfDestruct` | File | Hides file after first read |
| `corrupted` | File | Renders garbled flickering text |
| `run(log, ctx)` | File | Executable — typewriter output, can mutate tree + dispatch actions |
| `onRead(ctx)` | File | Callback fired when file is opened |
| `onUnlock(ctx)` | File/Dir | Callback fired when node is unlocked |
| `revealsOnRead` | File | Paths to unhide when this file is opened |
| `revealsOnUnlock` | File/Dir | Paths to unhide when this node is unlocked |
| `choices` | File | `[{label, action}]` — renders choice buttons; dispatches on click |
| `runState` | File | Persistent state bag for executables (survives save/load) |

### RunContext

Callbacks (`run`, `onRead`, `onUnlock`) receive a `RunContext`:

```ts
ctx.dispatch(action)         // Queue action → deferred queue → reducer pipeline
ctx.schedule(action, delay)  // Queue after N ms (returns cancel function)
ctx.state.inventory          // Read-only snapshot of inventory
ctx.state.gamePhase          // Current phase
ctx.state.readFiles          // All files player has opened
```

Actions from callbacks go through a **deferred queue** — `ctx.dispatch` pushes to `deferredActions[]`. App's `useEffect` drains it through the real React dispatcher, ensuring re-renders and auto-saves.

### Available actions

| Action | Payload | Effect |
|---|---|---|
| `INVENTORY_ADD` | `ItemType` | +1 to inventory item |
| `INVENTORY_REMOVE` | `ItemType` | -1 from inventory item |
| `ADD_ITEMS` | `Record<ItemType, number>` | Bulk add items |
| `SET_CWD` | `Directory` | Change current directory |
| `SET_FILE` | `File \| null` | Open/close file (fires onRead, revealsOnRead, selfDestruct, run) |
| `UNLOCK_FILENODE` | `FileNode` | Consume key + unlock (fires onUnlock, revealsOnUnlock) |
| `REVEAL_FILE` | `string` (path) | Unhide a file/directory |
| `SET_PHASE` | `number` | Set game phase |
| `SAVE_GAME` | `null` | Persist to localStorage |
| `LOAD_GAME` | `SaveSnapshot` | Restore from save |

### Example: quest chain

```ts
// In game.ts — define files with narrative meta:
diary.createFile("note.txt", "The key is under the rug.", {
    onRead: (ctx) => ctx.dispatch({ type: "ADD_ITEMS", payload: { rug_key: 1 } }),
});

root.createDirectory("basement", { key: "rug_key" });
root.createDirectory("basement/secret", {
    hidden: true,
    revealsOnUnlock: ["$ROOT/basement/secret"],
    onUnlock: (ctx) => ctx.dispatch({ type: "SET_PHASE", payload: 2 }),
});
```

## Project structure

```
src/
├── model/
│   ├── files.ts      # File, Directory, FileNode, Meta, RunContext
│   ├── game.ts       # Filesystem + inventory initialization (narrative content here)
│   ├── inventory.ts  # Pure add/remove/addItems functions
│   ├── save.ts       # Save/load delta snapshots (localStorage)
│   ├── data.ts       # Constants (user names, extension maps)
│   └── util.ts       # Random generation helpers
├── component/
│   ├── file/         # Directory browser, file viewer (text/image/video/audio/exe/choices)
│   ├── inventory/    # Inventory panel
│   ├── navigation/   # Bottom tab bar
│   └── ui/           # Shared UI (Modal)
├── game-files/       # Static game content (images, text)
├── App.tsx           # Root: Provider, ErrorBoundary, auto-save, deferred action drain, tab routing
├── reducer.ts        # State + deferred action queue + all actions
└── index.tsx         # Entry point (createRoot)
```
