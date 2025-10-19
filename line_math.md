Goal

Telegram Instant View (IV) forbids <img> inside <p>. Inline LaTeX renders (e.g., s_i, y_i) therefore break validation and also look huge if used as blocks.
Solution: for this page only, render the two math-heavy sentences as single “line images” (text + math together), and place them as block <figure> elements. Keep the big equation as a block image.

Scope (this page only)

URL: https://tarstars.github.io/telepub/
Source: dist/index.html + images in dist/assets/

We will:

Generate two images: line1.png, line2.png (and SVG twins).

Replace one paragraph (the one containing s_i / y_i) with two <figure> blocks that show those images.

Keep IV rules minimal (already set).

Why this works

IV renders images as blocks only; no inline images allowed in <p>.

By pre-rendering the whole sentence as a single image, we keep layout and pass IV validation.

The rest of the text remains normal HTML paragraphs.

Files to add

render_line.mjs — a tiny renderer that turns a TeX string (with \text{} for words) into SVG + PNG line images.