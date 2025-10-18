# Repository Guidelines

# Telepub

**Purpose:** Compile Markdown + LaTeX into **Telegram-ready** articles: static HTML with equations rendered to **SVG/PNG**, so posts open cleanly in **Instant View** or **Telegraph** without client-side JS.

**What it does**
- Parse `$…$` / `$$…$$` in `article.md`
- Render math with MathJax (server-side) to SVG (+ optional PNG)
- Inject `<img>` tags; emit plain, IV-friendly `dist/index.html` + `dist/assets/`
- Publish via static hosting + Instant View template, or via Telegraph API


## Project Structure
- `article.md` is the single source for content and math markup; treat it as the document of record.
- `build.mjs` contains the MathJax-aware build pipeline; update helpers here when changing rendering or asset rules.
- `dist/index.html` and `dist/assets/` are generated outputs; rebuild rather than editing them directly.
- `node_modules/` is npm-managed. Run `npm install` after dependency changes and commit the updated lockfile.

## Build, Test, and Development Commands
- `npm install` prepares dependencies; use Node.js 20 or newer.
- `node build.mjs article.md "My Math Article"` renders Markdown to static HTML with inline SVG equations.
- `node build.mjs article.md "My Math Article" 1600` adds PNG rasterization for clients that prefer bitmaps; adjust width as needed.
- `npm test` is a placeholder today. When you add checks, document them here and keep the script green before opening a pull request.
- Manual verification: open `dist/index.html` in a browser to confirm layout, equation rendering, and asset paths.

## Coding Style & Naming Conventions
- Stick to modern ESM, two-space indentation, and camelCase identifiers in JavaScript.
- Break complex logic into small helpers; add short comments when intent may be unclear.
- Generated media should follow the existing `eq-<hash>.svg|png` pattern and live under `dist/assets/`.

## Testing Guidelines
- No automated suite exists yet; contributions that affect rendering should add at least a smoke build to `npm test` (e.g., run the build and assert key files exist).
- Favor colocated `.test.mjs` files for new modules and keep fixtures minimal to avoid bloating the repo.
- After rebuilding, diff `dist/` to ensure only intentional changes ship, especially when math formatting is involved.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects under ~65 characters; expand details in the body when needed and reference issues with `Closes #123`.
- Pull requests should outline motivation, list notable changes, document manual verification steps (commands, browsers), and attach before/after screenshots whenever rendered output changes.
