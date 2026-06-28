# Root — itch.io page draft

## Short description

A haunted filesystem mystery game. Open files, collect clues, unlock folders, and decide what the truth becomes.

## Long description

Root is a short narrative puzzle game told through a corrupted desktop filesystem. Every folder is a room. Every file is evidence. Read old notes, recover keys, run strange executables, and follow each trail to an ending that says as much about you as it does about the machine.

Four stories are included:

- **The Echoes Below** — A missing researcher, an impossible city, and files that should not know your name.
- **The Lockdown** — A deadman switch is live. You have one compromised filesystem and too many open doors.
- **The Things We Don’t Say** — A father’s old laptop turns grief into a mystery about love, silence, and what families hide.
- **The Agent in the Machine** — The assistant that built the game left itself in the build. Now you review the ghost.

Best played with headphones.

## Tags

Mystery, Horror, Narrative, Puzzle, Interactive Fiction, Experimental, Short, Browser Game

## Controls

- Click files and folders to open them.
- Use collected keys to unlock protected files and folders.
- `Esc` closes the current file or overlay.
- `Backspace` goes up one folder.
- `Home` returns to root.

## Upload notes

1. Run `pnpm build`.
2. Zip the **contents** of `dist/`, not the project root.
3. Upload the zip to itch.io as an HTML game.
4. Set viewport to mobile-friendly portrait or allow fullscreen.
5. Use screenshots from `.playwright-mcp/captures/` for the page gallery.

## Screenshot checklist

- Storyline select with all four cards.
- A folder with the “start here” hint.
- A locked-folder dialog showing the needed key.
- A corrupted/executable file moment.
- A completion banner with ending/share text.
