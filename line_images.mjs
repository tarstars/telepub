// render_line.mjs — TeX (with \text{}) → SVG/PNG line image
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";

import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

const [,, texLine, outBase="dist/assets/line", width="1200"] = process.argv;

if (!texLine) {
  console.error('Usage: node render_line.mjs "<TeX with \\text{} and math>" dist/assets/lineN [widthpx]');
  process.exit(1);
}

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svgOut = new SVG({ fontCache: "none", scale: 1.0 });
const mj = mathjax.document("", { InputJax: tex, OutputJax: svgOut });

function toSVG(texSrc) {
  const node = mj.convert(texSrc, { display: false }); // single line
  let svg = adaptor.outerHTML(node);
  // slight outline so it’s readable in dark mode IV themes
  svg = svg.replace(/<g /, '<g stroke="white" stroke-width="0.6" ');
  // ensure crisp edges
  svg = svg.replace("<svg", '<svg shape-rendering="geometricPrecision"');
  return svg;
}

const svg = toSVG(texLine);
await fs.ensureDir(path.dirname(outBase));
await fs.writeFile(`${outBase}.svg`, svg);

// rasterize to PNG for OG previews or if you prefer PNG
const png = await sharp(Buffer.from(svg)).resize({ width: Number(width) }).png().toBuffer();
await fs.writeFile(`${outBase}.png`, png);

console.log(`Wrote: ${outBase}.svg and ${outBase}.png`);
