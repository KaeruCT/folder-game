# AGENTS.md

## Check before declaring done

Before marking any task complete, run all three:

```sh
pnpm check && pnpm knip && pnpm build
```

All must pass with zero errors. If Biome or Knip fail, fix them. If the build fails, fix it. Never suppress issues without a comment explaining why.

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
