import { mkdirSync, writeFileSync } from "node:fs";

const VERSION = "1.3.9";
const SIZE_ADJUST = "106%";
const KEEP_WEIGHTS = new Set(["400", "500", "600", "700", "800"]);

const SRC_CDN = `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@${VERSION}/dist/web/static/pretendard-dynamic-subset.css`;
const ABS_PREFIX = `url(https://cdn.jsdelivr.net/gh/orioncactus/pretendard@${VERSION}/packages/`;

const res = await fetch(SRC_CDN);
if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`);
const css = await res.text();

const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const kept = blocks
  .filter(b => {
    const w = b.match(/font-weight:\s*(\d+)/);
    return w && KEEP_WEIGHTS.has(w[1]);
  })
  .map(b =>
    b
      .replace(/url\(\.\.\/\.\.\/\.\.\/packages\//g, ABS_PREFIX)
      .replace(/@font-face\s*\{/, `@font-face {\n\tsize-adjust: ${SIZE_ADJUST};`),
  );

mkdirSync("public/fonts", { recursive: true });
writeFileSync("public/fonts/pretendard.css", kept.join("\n") + "\n");

console.log(
  `Wrote public/fonts/pretendard.css — ${kept.length}/${blocks.length} faces kept, size-adjust ${SIZE_ADJUST}`,
);
