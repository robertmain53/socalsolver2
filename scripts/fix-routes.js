// scripts/fix-routes.js
import fs from "fs";
import path from "path";

const ROOT = path.resolve("app");

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (st.isFile() && name === "page.tsx") out.push(p);
  }
  return out;
}

function ensureHumanize(src) {
  if (/function\s+humanize\s*\(/.test(src)) return src;
  // Inserisci subito prima di "export default"
  return src.replace(
    /(^|\n)(export\s+default)/,
    `\nfunction humanize(slug: string): string { return slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); }\n\n$2`
  );
}

function fixFile(file) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("loadCalculator(") && !/mod\?\.\s*meta/.test(s)) return false;

  const before = s;

  // 1) Togli la/e riga/he con loadCalculator(...);
  s = s.replace(
    /^[^\n]*\bconst\b\s+mod\s*=\s*await\s*loadCalculator\s*\(\s*params\.slug\s*\)\s*;\s*\r?\n?/gm,
    ""
  );
  // se ci fossero altre forme, fallback “grezzo”:
  s = s.replace(/^[^\n]*loadCalculator\s*\(\s*params\.slug\s*\)[^\n]*\n?/gm, "");

  // 2) title da mod?.meta?.title ?? humanize(...) -> humanize(...)
  s = s.replace(
    /const\s+title\s*=\s*mod\?\.\s*meta\?\.\s*title\s*\?\?\s*humanize\s*\(\s*params\.slug\s*\)\s*;\s*/gm,
    "const title = humanize(params.slug);\n"
  );

  // 3) description da mod?.meta?.description ?? "" -> ""
  s = s.replace(
    /const\s+description\s*=\s*mod\?\.\s*meta\?\.\s*description\s*\?\?\s*""\s*;\s*/gm,
    'const description = "";\n'
  );

  // 4) Aggiungi humanize tipata se non esiste
  s = ensureHumanize(s);

  if (s !== before) {
    fs.writeFileSync(file, s, "utf8");
    console.log("fixed:", file);
    return true;
  }
  return false;
}

const files = walk(ROOT);
let count = 0;
for (const f of files) {
  const changed = fixFile(f);
  if (changed) count++;
}
console.log(`Done. Updated ${count} file(s).`);
