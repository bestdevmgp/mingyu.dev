import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const fontsDir = join(root, "public/fonts");
const manifestPath = join(root, "scripts/noto-subset.json");
const facesPath = join(root, "app/lib/notoFontFaces.ts");
const cacheDir = join(root, "node_modules/.cache/noto-subset");

const FONTTOOLS = "fonttools[woff]==4.67.0";
const FEATURES = "ccmp,liga,clig,calt,rlig,locl,vert,vrt2,halt,kern,mark,mkmk,palt,vhal,vkrn,vpal";
const LOCALES = {
  ja: {
    family: "Noto Sans JP",
    slug: "jp",
    source: "295d98a7a0c17c68f1341eaeea354e7960ea70d3/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf",
  },
  "zh-Hans": {
    family: "Noto Sans SC",
    slug: "sc",
    source: "2894aab31764f10f29c421bdfd2340d3b382d384/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf",
  },
  "zh-Hant": {
    family: "Noto Sans TC",
    slug: "tc",
    source: "b950a7257470b900078f2bf3223823a8602de7e1/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf",
  },
};

const pageText = html =>
  html
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

const messageText = value =>
  typeof value === "string"
    ? value
    : value && typeof value === "object"
      ? Object.values(value).map(messageText).join("")
      : "";

const sourceLiterals = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "_generated" ? [] : sourceLiterals(path);
    if (!/\.(tsx?|css)$/.test(name)) return [];
    const code = readFileSync(path, "utf8").replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "");
    return [...code.matchAll(/(["'`])((?:\\.|(?!\1).)*?[^\x00-\x7f](?:\\.|(?!\1).)*?)\1/g)].map(match => match[2]);
  });

const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");
const literals = sourceLiterals(join(root, "app")).join("");
const pagesDir = join(root, ".next/server/app");

const renderedChars = locale => {
  if (!existsSync(join(pagesDir, `${locale}.html`)))
    throw new Error(`noto subset: run next build first (${locale}.html missing)`);
  const projectDir = join(pagesDir, locale, "project");
  const pages = [
    join(pagesDir, `${locale}.html`),
    ...readdirSync(projectDir)
      .filter(name => name.endsWith(".html"))
      .map(name => join(projectDir, name)),
  ];
  const text =
    pages.map(page => pageText(readFileSync(page, "utf8"))).join("") +
    messageText(JSON.parse(readFileSync(join(root, `messages/${locale}.json`), "utf8"))) +
    literals +
    ascii;
  const chars = new Set([...text].filter(c => (c.codePointAt(0) >= 0x20 && !/\s/.test(c)) || c === " " || c === " "));
  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
};

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const rendered = Object.fromEntries(Object.keys(LOCALES).map(locale => [locale, renderedChars(locale)]));

if (process.argv.includes("--check")) {
  const missing = Object.entries(rendered)
    .map(([locale, chars]) => [locale, [...chars].filter(c => !manifest[locale]?.chars.includes(c))])
    .filter(([, chars]) => chars.length);
  if (missing.length) {
    for (const [locale, chars] of missing)
      console.error(`noto subset: ${locale} renders characters missing from the subset: ${chars.join("")}`);
    console.error("noto subset: run `npm run noto-subset` after this build and commit the regenerated fonts");
    process.exit(1);
  }
  console.log("noto subset: every rendered ja/zh character is in the subset");
  process.exit(0);
}

const uvx = args =>
  execFileSync("uvx", ["--from", FONTTOOLS, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const unicodeRange = path => {
  const codes = [
    ...new Set(
      [...uvx(["ttx", "-q", "-t", "cmap", "-o", "-", path]).matchAll(/<map code="0x([0-9a-f]+)"/gi)].map(m =>
        parseInt(m[1], 16),
      ),
    ),
  ].sort((a, b) => a - b);
  const ranges = [];
  for (let i = 0; i < codes.length; i++) {
    let end = i;
    while (codes[end + 1] === codes[end] + 1) end++;
    const hex = code => `U+${code.toString(16).toUpperCase().padStart(4, "0")}`;
    ranges.push(end === i ? hex(codes[i]) : `${hex(codes[i])}-${hex(codes[end]).slice(2)}`);
    i = end;
  }
  return ranges.join(",");
};

mkdirSync(cacheDir, { recursive: true });
for (const [locale, { slug, source }] of Object.entries(LOCALES)) {
  const previous = manifest[locale];
  if (previous?.chars === rendered[locale] && existsSync(join(fontsDir, previous.file))) continue;
  const version = previous ? Number(previous.file.match(/-v(\d+)\.woff2$/)[1]) + 1 : 1;
  const file = `noto-sans-${slug}-v${version}.woff2`;
  const sourcePath = join(cacheDir, `${slug}-${source.slice(0, 7)}.ttf`);
  if (!existsSync(sourcePath)) {
    const response = await fetch(`https://raw.githubusercontent.com/google/fonts/${source}`);
    if (!response.ok) throw new Error(`noto subset: HTTP ${response.status} for ${source}`);
    writeFileSync(sourcePath, Buffer.from(await response.arrayBuffer()));
  }
  const textPath = join(cacheDir, `${locale}.txt`);
  writeFileSync(textPath, rendered[locale]);
  uvx([
    "pyftsubset",
    sourcePath,
    `--text-file=${textPath}`,
    `--layout-features=${FEATURES}`,
    "--no-hinting",
    "--flavor=woff2",
    `--output-file=${join(fontsDir, file)}`,
  ]);
  if (previous && previous.file !== file) rmSync(join(fontsDir, previous.file), { force: true });
  manifest[locale] = { file, chars: rendered[locale] };
  console.log(`noto subset: wrote public/fonts/${file} (${[...rendered[locale]].length} characters requested)`);
}

const faces = Object.entries(LOCALES).map(
  ([locale, { family }]) =>
    `  ${JSON.stringify(locale)}: '@font-face{font-family:"${family}";src:url("/fonts/${manifest[locale].file}") format("woff2");font-weight:400 800;font-style:normal;font-display:swap;unicode-range:${unicodeRange(join(fontsDir, manifest[locale].file))}}',`,
);
writeFileSync(
  facesPath,
  `const notoFontFaces: Record<string, string> = {\n${faces.join("\n")}\n};\n\nexport default notoFontFaces;\n`,
);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
execFileSync("npx", ["prettier", "--write", facesPath, manifestPath], { cwd: root, stdio: "ignore" });
console.log("noto subset: updated app/lib/notoFontFaces.ts and scripts/noto-subset.json");
