import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const fontsDir = join(root, "public/fonts");
const manifestPath = join(root, "scripts/font-subset.json");
const notoFacesPath = join(root, "app/lib/notoFontFaces.ts");
const globalsPath = join(root, "app/globals.css");
const references = [globalsPath, join(root, "app/global-not-found.tsx"), join(root, "proxy.ts")];
const cacheDir = join(root, "node_modules/.cache/font-subset");

const FONTTOOLS = "fonttools[woff]==4.67.0";
const GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/";
const NOTO_FEATURES = "ccmp,liga,clig,calt,rlig,locl,vert,vrt2,halt,kern,mark,mkmk,palt,vhal,vkrn,vpal";
const GOOGLE_LATIN_FEATURES = "calt,ccmp,dnom,frac,locl,numr,pnum,tnum,kern,mark,mkmk";
const GOOGLE_LATIN_SLICE =
  "U+0000,U+0020-007E,U+00A0-00AC,U+00AE-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+2002,U+2009,U+200B,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191,U+2193,U+2212,U+FEFF";
const TEXT_OVERFLOW_ELLIPSIS = "U+2026";
const LOCALES = {
  ko: {
    name: "pretendard-core",
    extension: "pretendard-ext",
    source: "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/woff2/PretendardVariable.woff2",
    cache: "pretendard-1.3.9.woff2",
    instance: ["wght=400:800"],
    options: ["--layout-features=kern,liga,calt,tnum", "--desubroutinize"],
  },
  en: {
    name: "inter",
    source: `${GOOGLE_FONTS}e1d6480102fed30739fead0faee463101f892c8f/ofl/inter/Inter%5Bopsz,wght%5D.ttf`,
    cache: "inter-e1d6480.ttf",
    instance: ["opsz=14"],
    slice: [
      `--unicodes=${GOOGLE_LATIN_SLICE}`,
      `--layout-features=${GOOGLE_LATIN_FEATURES}`,
      "--recalc-bounds",
      "--glyph-names",
    ],
    options: [`--layout-features=${GOOGLE_LATIN_FEATURES}`, "--glyph-names", `--unicodes=${TEXT_OVERFLOW_ELLIPSIS}`],
  },
  ja: {
    name: "noto-sans-jp",
    family: "Noto Sans JP",
    source: `${GOOGLE_FONTS}295d98a7a0c17c68f1341eaeea354e7960ea70d3/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf`,
    cache: "jp-295d98a.ttf",
    options: [`--layout-features=${NOTO_FEATURES}`, `--unicodes=${TEXT_OVERFLOW_ELLIPSIS}`],
  },
  "zh-Hans": {
    name: "noto-sans-sc",
    family: "Noto Sans SC",
    source: `${GOOGLE_FONTS}2894aab31764f10f29c421bdfd2340d3b382d384/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf`,
    cache: "sc-2894aab.ttf",
    options: [`--layout-features=${NOTO_FEATURES}`],
  },
  "zh-Hant": {
    name: "noto-sans-tc",
    family: "Noto Sans TC",
    source: `${GOOGLE_FONTS}b950a7257470b900078f2bf3223823a8602de7e1/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf`,
    cache: "tc-b950a72.ttf",
    options: [`--layout-features=${NOTO_FEATURES}`],
  },
};

const pageText = html =>
  html
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

const blogShown = JSON.parse(readFileSync(join(root, "app/_generated/content.json"), "utf8")).blog.length > 0;

const UNDRAWN_MESSAGES = new Set([
  "Meta",
  "Header.openMenu",
  "Header.closeMenu",
  "Header.sectionNav",
  "ImageViewer.loading",
  ...(blogShown ? [] : ["Blog", "Nav.blog"]),
]);

const messageText = (value, key = "") =>
  UNDRAWN_MESSAGES.has(key)
    ? ""
    : typeof value === "string"
      ? value.replace(/<\/?[a-z]+>/g, "")
      : value && typeof value === "object"
        ? Object.entries(value)
            .map(([name, child]) => messageText(child, key ? `${key}.${name}` : name))
            .join("")
        : "";

const sourceLiterals = dir =>
  readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceLiterals(path);
    if (!/\.(tsx?|css)$/.test(name) || name === "ConsoleGreeting.tsx") return [];
    const code = readFileSync(path, "utf8").replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, "");
    return [...code.matchAll(/(["'`])((?:\\.|(?!\1).)*?[^\x00-\x7f](?:\\.|(?!\1).)*?)\1/g)].map(match => match[2]);
  });

const literals = sourceLiterals(join(root, "app/_components")).join("");
const serverDir = join(root, ".next/server");

const htmlFiles = dir =>
  readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory()
      ? htmlFiles(join(dir, entry.name))
      : entry.name.endsWith(".html")
        ? [join(dir, entry.name)]
        : [],
  );

const prerendered = existsSync(serverDir)
  ? htmlFiles(serverDir).flatMap(path => {
      const route = relative(serverDir, path)
        .split(sep)
        .join("/")
        .match(/^(?:app|route-cache\/APP_PAGE\/[^/]+\/\$)\/(.+)\.html$/)?.[1];
      return route ? [{ route, path }] : [];
    })
  : [];

const renderedChars = locale => {
  if (!prerendered.some(({ route }) => route === locale))
    throw new Error(`font subset: run next build first (${locale}.html missing)`);
  const pages = prerendered
    .filter(({ route }) => route === locale || route.startsWith(`${locale}/project/`))
    .map(({ path }) => path);
  const text =
    pages.map(page => pageText(readFileSync(page, "utf8"))).join("") +
    messageText(JSON.parse(readFileSync(join(root, `messages/${locale}.json`), "utf8"))) +
    literals;
  const chars = new Set(
    [...text].filter(c => (c.codePointAt(0) >= 0x20 && !/\s/.test(c)) || c === " " || c === "\u00a0"),
  );
  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0)).join("");
};

const recipeOf = ({ source, instance, slice, options }) =>
  createHash("sha256")
    .update(JSON.stringify([FONTTOOLS, source, instance, slice, options]))
    .digest("hex")
    .slice(0, 12);

const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const rendered = Object.fromEntries(Object.keys(LOCALES).map(locale => [locale, renderedChars(locale)]));

if (process.argv.includes("--check")) {
  const problems = Object.entries(rendered).flatMap(([locale, chars]) => {
    const needed = new Set(chars);
    const listed = new Set(manifest[locale]?.chars);
    const missing = [...needed].filter(c => !listed.has(c)).join("");
    const unused = [...listed].filter(c => !needed.has(c)).join("");
    return [
      ...(missing ? [`${locale} renders characters its subset was not built for: ${missing}`] : []),
      ...(unused ? [`${locale} subset was built for characters no page renders: ${unused}`] : []),
      ...(manifest[locale]?.recipe !== recipeOf(LOCALES[locale])
        ? [`${locale} subset was built with another recipe`]
        : []),
    ];
  });
  if (problems.length) {
    for (const problem of problems) console.error(`font subset: ${problem}`);
    console.error("font subset: run `npm run font-subset` after this build and commit the regenerated fonts");
    process.exit(1);
  }
  console.log("font subset: every locale's subset was built for exactly the characters its pages render");
  process.exit(0);
}

const uvx = args =>
  execFileSync("uvx", ["--from", FONTTOOLS, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const cmap = path =>
  JSON.parse(
    uvx([
      "python",
      "-c",
      "import json,sys\nfrom fontTools.ttLib import TTFont\nprint(json.dumps(sorted(set().union(*(t.cmap for t in TTFont(sys.argv[1])['cmap'].tables if t.isUnicode())))))",
      path,
    ]),
  );

const unicodeRange = codes => {
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

const sourceFont = async ({ source, cache, instance }) => {
  const path = join(cacheDir, cache);
  if (!existsSync(path)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`font subset: HTTP ${response.status} for ${source}`);
    writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  }
  if (!instance) return path;
  const instanced = join(cacheDir, `${cache.replace(/\.\w+$/, "")}-${instance.join("-").replace(/[=:]/g, "_")}.ttf`);
  if (!existsSync(instanced))
    uvx(["fonttools", "varLib.instancer", path, ...instance, "--no-recalc-timestamp", "-o", instanced]);
  return instanced;
};

const subset = (sourcePath, codes, { name, slice, options }) => {
  const listPath = join(cacheDir, "unicodes.txt");
  const outputPath = join(cacheDir, "subset.woff2");
  writeFileSync(listPath, codes.map(code => code.toString(16)).join("\n"));
  const input = slice ? join(cacheDir, `${name}-slice.ttf`) : sourcePath;
  if (slice)
    uvx(["pyftsubset", sourcePath, `--unicodes-file=${listPath}`, ...slice, "--no-hinting", `--output-file=${input}`]);
  uvx([
    "pyftsubset",
    input,
    `--unicodes-file=${listPath}`,
    ...options,
    "--no-hinting",
    "--flavor=woff2",
    `--output-file=${outputPath}`,
  ]);
  return readFileSync(outputPath);
};

const replaceReferences = (from, to) => {
  for (const path of references) {
    const text = readFileSync(path, "utf8");
    if (text.includes(from)) writeFileSync(path, text.replaceAll(from, to));
  }
};

const setUnicodeRange = (file, range) =>
  writeFileSync(
    globalsPath,
    readFileSync(globalsPath, "utf8").replace(/@font-face\s*{[^}]*}/g, block =>
      block.includes(`/fonts/${file}`) ? block.replace(/unicode-range:[^;]*;/, `unicode-range: ${range};`) : block,
    ),
  );

mkdirSync(cacheDir, { recursive: true });
let notoChanged = false;
for (const [locale, font] of Object.entries(LOCALES)) {
  const previous = manifest[locale];
  const chars = rendered[locale];
  const recipe = recipeOf(font);
  if (previous?.chars === chars && previous.recipe === recipe) continue;
  const sourcePath = await sourceFont(font);
  const available = new Set(cmap(sourcePath));
  const codes = { file: [...chars].map(c => c.codePointAt(0)).filter(code => available.has(code)) };
  if (font.extension) {
    const coverage = new Set([...cmap(join(fontsDir, previous.file)), ...cmap(join(fontsDir, previous.extension))]);
    codes.extension = [...coverage].filter(code => !codes.file.includes(code)).sort((a, b) => a - b);
  }
  const built = Object.fromEntries(Object.entries(codes).map(([key, list]) => [key, subset(sourcePath, list, font)]));
  if (
    previous &&
    Object.entries(built).every(([key, data]) => data.equals(readFileSync(join(fontsDir, previous[key]))))
  ) {
    manifest[locale] = { ...previous, chars, recipe };
    console.log(`font subset: ${locale} font unchanged, kept public/fonts/${previous.file}`);
    continue;
  }
  const version = previous ? Number(previous.file.match(/-v(\d+)\.woff2$/)[1]) + 1 : 1;
  const next = { file: `${font.name}-v${version}.woff2` };
  if (font.extension) next.extension = `${font.extension}-v${version}.woff2`;
  for (const [key, data] of Object.entries(built)) {
    writeFileSync(join(fontsDir, next[key]), data);
    if (!previous) continue;
    rmSync(join(fontsDir, previous[key]));
    replaceReferences(previous[key], next[key]);
  }
  if (font.family) notoChanged = true;
  else setUnicodeRange(next.file, unicodeRange(cmap(join(fontsDir, next.file))));
  manifest[locale] = { ...next, chars, recipe };
  console.log(
    `font subset: wrote public/fonts/${next.file} (${codes.file.length} of ${[...chars].length} characters are in the font)`,
  );
}

if (notoChanged) {
  const faces = Object.entries(LOCALES)
    .filter(([, { family }]) => family)
    .map(
      ([locale, { family }]) =>
        `  ${JSON.stringify(locale)}: '@font-face{font-family:"${family}";src:url("/fonts/${manifest[locale].file}") format("woff2");font-weight:400 800;font-style:normal;font-display:swap;unicode-range:${unicodeRange(cmap(join(fontsDir, manifest[locale].file)))}}',`,
    );
  writeFileSync(
    notoFacesPath,
    `const notoFontFaces: Record<string, string> = {\n${faces.join("\n")}\n};\n\nexport default notoFontFaces;\n`,
  );
}
writeFileSync(
  manifestPath,
  `${JSON.stringify(Object.fromEntries(Object.keys(LOCALES).map(locale => [locale, manifest[locale]])), null, 2)}\n`,
);
execFileSync("npx", ["prettier", "--write", manifestPath, ...(notoChanged ? [notoFacesPath] : [])], {
  cwd: root,
  stdio: "ignore",
});
console.log("font subset: updated scripts/font-subset.json");
