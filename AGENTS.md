# AGENTS.md

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
- **dupehound** — structural duplicate detection (Rust, finds renamed copies)

No external state library — uses `useReducer` + `Context`.

## State & Save System

All game state lives in `useReducer` + `Context`. The filesystem is class-based (`File`/`Directory`); mutations happen in-place and are captured via **delta snapshots** against a fresh initial tree. The `model/save.ts` module handles serialization to `localStorage`.

- **Auto-save**: debounced (500ms) after every dispatch
- **On init**: checks `localStorage` for saved state, restores if found
- **Snapshot stores**: cwd path, inventory quantities, hidden paths, unlocked paths, modified content, runtime-created files
- **Reset**: clears localStorage, reloads the page

If you add new mutable state to File/Directory (fields beyond `hidden`, `locked`, `content`), update `buildSnapshot` and `applySnapshot` in `model/save.ts`.

## Project structure

```
src/
├── model/
│   ├── files.ts      # File, Directory, FileNode classes
│   ├── game.ts       # Filesystem + inventory initialization
│   ├── inventory.ts  # Pure add/remove item functions
│   ├── save.ts       # Save/load delta snapshots (localStorage)
│   ├── data.ts       # Constants (user names, extension maps)
│   └── util.ts       # Random generation helpers
├── component/
│   ├── file/         # Directory browser, file viewer
│   ├── inventory/    # Inventory panel
│   ├── navigation/   # Bottom tab bar
│   └── ui/           # Shared UI (Modal)
├── game-files/       # Static game content (images, text)
├── App.tsx           # Root: Provider, ErrorBoundary, auto-save, tab routing
├── reducer.ts        # Game state: actions, save/load, init from localStorage
└── index.tsx         # Entry point (createRoot)
```
