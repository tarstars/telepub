import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import sharp from "sharp";

// MathJax (TeX -> SVG)
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svgOutput = new SVG({
  fontCache: "none", // embed paths -> self-contained SVG
  scale: 1.0
});
const mj = mathjax.document("", { InputJax: tex, OutputJax: svgOutput });

function hash(s){ return crypto.createHash("sha1").update(s).digest("hex").slice(0,12); }

async function texToSVG(texSrc, display=false) {
  const node = mj.convert(texSrc, { display });
  let svg = adaptor.outerHTML(node);               // <svg>…</svg>
  // Improve readability on light/dark backgrounds
  svg = svg.replace("<svg", '<svg shape-rendering="geometricPrecision"');
  // Optional: add faint outline for dark themes
  svg = svg.replace(/<g /, '<g stroke="white" stroke-width="0.6" ');
  return svg;
}

async function svgToPNG(svgString, widthPx) {
  return await sharp(Buffer.from(svgString)).resize({ width: widthPx }).png().toBuffer();
}

function mathCompiler({ outDir="dist", imgDir="assets", rasterWidth=null } = {}) {
  const eqDir = path.join(outDir, imgDir);
  fs.ensureDirSync(eqDir);

  let eqCounter = 0;

  return async function transformer(tree, file) {
    const tasks = [];
    const handle = (isDisplay) => (node, index, parent) => {
      if (!parent || typeof index !== "number") return;

      const id = hash(node.value);
      const base = `eq-${id}`;
      const svgPath = path.join(eqDir, `${base}.svg`);
      const pngPath = path.join(eqDir, `${base}.png`);

      const alt = node.value.replace(/\s+/g," ").trim();
      const svgSrc = `./${path.posix.join(imgDir, `${base}.svg`)}`;
      const pngSrc = `./${path.posix.join(imgDir, `${base}.png`)}`;
      const chosenSrc = rasterWidth ? pngSrc : svgSrc;
      const imgHTML = isDisplay
        ? `<p><img src="${chosenSrc}" alt="${alt}" /></p>`
        : `<img src="${chosenSrc}" alt="${alt}" />`;

      parent.children[index] = { type: "html", value: imgHTML };

      tasks.push((async () => {
        const svg = await texToSVG(node.value, isDisplay);
        await fs.writeFile(svgPath, svg);

        if (rasterWidth) {
          // Optional PNG rasterization for clients that need bitmap math.
          const png = await svgToPNG(svg, rasterWidth);
          await fs.writeFile(pngPath, png);
        }
        eqCounter++;
      })());
    };
    visit(tree, 'inlineMath', handle(false));
    visit(tree, 'math',       handle(true));
    await Promise.all(tasks);
    if (eqCounter) console.log(`Rendered ${eqCounter} equations → ${imgDir}/`);
  };
}

async function build(mdPath, { title="Article", outDir="dist", rasterWidth=null, publicDir="public" } = {}) {
  const md = await fs.readFile(mdPath, "utf8");
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(mathCompiler, { outDir, imgDir:"assets", rasterWidth })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true });

  const htmlBody = String(await processor.process(md));

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head><body>
<article>
<h1>${title}</h1>
${htmlBody}
</article>
</body></html>`;

  await fs.ensureDir(outDir);
  await fs.writeFile(path.join(outDir, "index.html"), html);

  if (publicDir) {
    const publicOut = path.join(publicDir);
    const publicAssets = path.join(publicOut, "assets");
    await fs.ensureDir(publicOut);
    await fs.copy(path.join(outDir, "index.html"), path.join(publicOut, "index.html"));
    await fs.ensureDir(publicAssets);
    await fs.copy(path.join(outDir, "assets"), publicAssets, { overwrite: true });
  }
}

const mdFile = process.argv[2] || "article.md";
const title = process.argv[3] || "My Math Article";
const raster = process.argv[4] ? Number(process.argv[4]) : null; // e.g. 1600
const outDir = process.argv[5] || "dist";
const publicDir = process.argv[6] || "public";
build(mdFile, { title, rasterWidth: raster, outDir, publicDir }).then(()=>console.log("Built."));
