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
- `PUBLIC_URL=https://tarstars.github.io/telepub/ node build.mjs article.md "Forging the Algorithm" 1600` embeds absolute OG metadata and emits both SVG + PNG assets for link previews.
- Copy a 1200×630 preview to `dist/assets/cover.png` (for example, `cp dist/assets/eq-<hash>.png dist/assets/cover.png` and resize with `sharp dist/assets/cover.png --resize 1200 630`). Rebuild or rerun the copy whenever you change the hero image.
- `npm run preview` rebuilds the article for local review and opens `dist/index.html` in your default browser.
- `npm run open:remote` launches the published GitHub Pages URL (`https://tarstars.github.io/telepub/`) in your default browser.
- `npm test` is a placeholder today. When you add checks, document them here and keep the script green before opening a pull request.
- Manual verification: open `dist/index.html` in a browser to confirm layout, equation rendering, and asset paths.

## Telegram Instant View
- All math (inline + block) renders to `<img>` elements; block equations live in `<figure class="eq">`.
- Use `iv-template.yml` as your IV template seed. It maps the article body and captures both block `figure.eq` images and inline `.eq-inline` images.
- After deploying to GitHub Pages, revalidate Instant View with your template and clear cache if equations appear stale (append `?v=<timestamp>` to the URL).

## Coding Style & Naming Conventions
- Stick to modern ESM, two-space indentation, and camelCase identifiers in JavaScript.
- Break complex logic into small helpers; add short comments when intent may be unclear.
- Generated media should follow the existing `eq-<hash>.svg|png` pattern and live under `dist/assets/`.
- Instant View rule: never let `<img>` tags remain inside `<p>` elements. Wrap math or media in `<figure>`/`<span>` wrappers or restructure the Markdown so the renderer emits block elements.
- When referencing image assets in `article.md`, keep filenames slugged (no spaces, lowercase, optional version suffix like `_v314`) and ensure the build/publish paths stay consistent so IV fetches them correctly.

## Testing Guidelines
- No automated suite exists yet; contributions that affect rendering should add at least a smoke build to `npm test` (e.g., run the build and assert key files exist).
- Favor colocated `.test.mjs` files for new modules and keep fixtures minimal to avoid bloating the repo.
- After rebuilding, diff `dist/` to ensure only intentional changes ship, especially when math formatting is involved.

## Commit & Pull Request Guidelines
- Use short, imperative commit subjects under ~65 characters; expand details in the body when needed and reference issues with `Closes #123`.
- Pull requests should outline motivation, list notable changes, document manual verification steps (commands, browsers), and attach before/after screenshots whenever rendered output changes.
