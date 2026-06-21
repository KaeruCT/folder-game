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

## Project structure

```
src/
├── model/          # Game logic (filesystem, inventory, data)
├── component/
│   ├── file/       # Directory browser, file viewer
│   ├── inventory/  # Inventory panel
│   ├── navigation/ # Bottom tab bar
│   └── ui/         # Shared UI (Modal)
├── game-files/     # Static game content (images, text)
├── index.tsx       # Entry point
├── App.tsx         # Root component + context provider
└── reducer.ts      # Game state management
```
