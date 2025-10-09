#!/usr/bin/env node
// peek-sheet.mjs
import "dotenv/config";
import fs from "fs/promises";
import path from "path";

const stripQ = s => (typeof s === "string" ? s.trim().replace(/^['"]+|['"]+$/g, "") : s);
function arg(keys, def) {
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const t = a[i];
    if (!t.startsWith("-")) continue;
    const eq = t.indexOf("=");
    if (eq > 1 && keys.includes(t.slice(0, eq))) return stripQ(a[i].slice(eq + 1));
    if (keys.includes(t)) {
      const v = a[i + 1];
      if (v && !v.startsWith("-")) return stripQ(v);
      return "";
    }
  }
  return def;
}
function envOrArg(envKey, keys, fallback) {
  const vA = arg(keys, undefined);
  if (vA !== undefined) return stripQ(vA);
  const vE = stripQ(process.env[envKey] || "");
  if (vE) return vE;
  return fallback;
}

const SHEET_ID   = envOrArg("SHEET_ID",   ["--sheetId","--sheet-id","-s"], "");
const SHEET_NAME = envOrArg("SHEET_NAME", ["--sheetName","--sheet-name","-n"], "calculators");
const LIMIT      = Number(arg(["--limit","-l"], "10")) || 10;
const OUTDIR     = ".gen_tmp";

if (!SHEET_ID) {
  console.error("❌ SHEET_ID mancante. Mettilo in .env o passa --sheetId");
  process.exit(1);
}

const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(SHEET_ID)}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
console.log("🌐 Fetch:", url.replace(/\/d\/[^/]+/, "/d/…"));

function gvizToTable(txt) {
  const a = txt.indexOf("{"), b = txt.lastIndexOf("}");
  if (a === -1 || b === -1 || b <= a) throw new Error("GViz: JSON non trovato");
  const obj = JSON.parse(txt.slice(a, b + 1));
  const table = obj.table;
  const cols = table.cols.map((c, i) => ({
    raw: (c.label || c.id || `col_${i}`).toString(),
    norm: (c.label || c.id || `col_${i}`).toString().trim().toLowerCase()
  }));
  const rows = (table.rows || []).map(r => r.c || []);
  const records = rows.map(cells => {
    const rec = {};
    for (let i = 0; i < cols.length; i++) rec[cols[i].raw] = cells[i]?.v ?? null;
    return rec;
  });
  return { cols, records };
}

function toCSV({ cols, records }) {
  const header = cols.map(c => c.raw);
  const esc = v => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    header.map(esc).join(","),
    ...records.map(r => header.map(h => esc(r[h])).join(","))
  ];
  return lines.join("\n");
}

function preview({ cols, records }, limit) {
  const head = cols.map(c => c.raw);
  console.log(`\n🧱 Colonne (${head.length}):`);
  console.log(" - " + head.join(" | "));

  const n = Math.min(limit, records.length);
  console.log(`\n🔎 Prime ${n}/${records.length} righe:`);
  for (let i = 0; i < n; i++) {
    const r = records[i];
    const line = head.map(h => {
      const v = r[h];
      if (v === null || v === undefined) return "";
      const s = String(v);
      return s.length > 80 ? s.slice(0, 77) + "…" : s;
    }).join(" | ");
    console.log(String(i + 1).padStart(3, " "), ":", line);
  }
}

(async () => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txt = await res.text();
    const table = gvizToTable(txt);

    await fs.mkdir(OUTDIR, { recursive: true });
    await fs.writeFile(path.join(OUTDIR, "sheet-raw.json"), JSON.stringify(table, null, 2), "utf8");
    await fs.writeFile(path.join(OUTDIR, "sheet.csv"), toCSV(table), "utf8");

    preview(table, LIMIT);
    console.log(`\n💾 Salvato: ${OUTDIR}/sheet-raw.json, ${OUTDIR}/sheet.csv`);
    console.log("✅ Fatto.");
  } catch (e) {
    console.error("❌ Lettura Sheet fallita:", e.message);
    process.exit(1);
  }
})();
