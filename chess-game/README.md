# Chess Game: Player vs Computer

A simple frontend-only chess game where you play White and the computer plays Black.

## What is included

- 8x8 responsive chess board
- Standard chess pieces
- Legal move highlighting
- Selected-piece highlighting
- Last-move highlighting
- Check, checkmate, stalemate, and draw status
- Restart button
- Browser-only computer opponent

## How to run on macOS

You can open the project directly:

1. Open `chess-game/index.html` in a browser.

Or run a tiny local static server:

```bash
cd chess-game
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How the AI works

The game uses `chess.js` from a CDN for chess rules, legal moves, check, checkmate, stalemate, and draw detection.

The computer opponent is a simple local minimax AI with alpha-beta pruning. It looks a few moves ahead, scores material, lightly considers mobility, and picks the best Black move it finds. It is intentionally beginner-friendly and does not use any backend, account, paid API, or hosted chess engine.

## Free deployment with GitHub Pages

1. Create a GitHub repository.
2. Add the `chess-game` folder contents to the repository.
3. Commit and push the files.
4. In GitHub, open the repository settings.
5. Go to **Pages**.
6. Choose the branch that contains `index.html`.
7. Save. GitHub will provide a free public URL.

If you keep these files inside a `chess-game` subfolder, configure Pages to serve that folder or move the four files to the repository root.

## Customization

- Edit `style.css` to change colors, spacing, board size, and responsive layout.
- Edit `script.js` to change AI strength, status text, or piece behavior.
- Edit `index.html` to change page structure or labels.

## Files

```text
chess-game/
├── index.html
├── style.css
├── script.js
└── README.md
```
