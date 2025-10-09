// hotfix-tsx.mjs (ESM) — pulizia mirata dei TSX generati
// - Unescape sicuro di &apos; / &quot; SOLO in string literals (incl. import("…"))
// - Deduplica attributi JSX (tiene il primo, rimuove i successivi)
// - Normalizza "use client" (una sola direttiva all'inizio, rimuove ghost "use client;")
import path from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import fs from "fs/promises";
import tsMorph from "ts-morph";

const { Project, SyntaxKind } = tsMorph;

const parsed = parseArgs({
  options: {
    dir: { type: "string", short: "d" }, // cartella da processare
    manifest: { type: "string", short: "m" }, // opzionale: file lista
    verbose: { type: "boolean", short: "v" },
  },
});

const DIR = parsed.values.dir || "components/calculators";
const MANIFEST = parsed.values.manifest || "";
const VERBOSE = !!parsed.values.verbose;

const logv = (...a) => VERBOSE && console.log(...a);

function toGlobSafe(p) {
  // ts-morph accetta pattern glob; qui normalizziamo separatori
  return p.replace(/\\/g, "/");
}

async function readManifestList(file) {
  try {
    const txt = await fs.readFile(file, "utf8");
    return txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s.endsWith(".tsx"));
  } catch {
    return [];
  }
}

const project = new Project({
  // Non forziamo tsconfig per evitare crash su versioni TS; aggiungiamo file a mano
  skipAddingFilesFromTsConfig: true,
});

let files = [];
if (MANIFEST) {
  files = await readManifestList(MANIFEST);
  if (files.length === 0) {
    console.error(`Manifest vuoto o non leggibile: ${MANIFEST}`);
    process.exit(1);
  }
  project.addSourceFilesAtPaths(files.map(toGlobSafe));
} else {
  project.addSourceFilesAtPaths(toGlobSafe(path.join(DIR, "**/*.tsx")));
}

const srcFiles = project.getSourceFiles();
console.log(`Hotfix TSX: ${srcFiles.length} file in ${MANIFEST || DIR}`);

let fixed = 0;
let failed = 0;

for (const sf of srcFiles) {
  try {
    let changed = false;

    // --- Pass 0: rimuovi "use client;" nudo (senza virgolette) inserito per errore ---
    // lo facciamo con replace testuale per semplicità, poi ricarichiamo il file nel project
    {
      const raw = sf.getFullText();
      const replaced = raw.replace(/\n\s*use client;\s*\n/g, "\n");
      if (replaced !== raw) {
        sf.replaceWithText(replaced);
        changed = true;
      }
    }

    // --- Pass 1: assicurati che la prima statement sia 'use client'; una volta sola ---
    {
      const stmts = sf.getStatements();
      const first = stmts[0];
      const hasProper =
        first &&
        first.getKind() === SyntaxKind.ExpressionStatement &&
        /['"]use client['"]/.test(first.getText());

      // rimuovi eventuali duplicati successivi
      const extras = sf
        .getDescendantsOfKind(SyntaxKind.ExpressionStatement)
        .filter((n, idx) => {
          const txt = n.getText();
          return (
            /['"]use client['"]/.test(txt) &&
            (idx > 0 || !hasProper) // lascia il primo se già presente
          );
        });
      if (extras.length > 0) {
        extras.forEach((n) => n.remove());
        changed = true;
      }

      if (!hasProper) {
        sf.insertStatements(0, `'use client';`);
        changed = true;
      }
    }

    // --- Pass 2: unescape SOLO dentro stringhe letterali TS/JS ---
    sf.forEachDescendant((node) => {
      try {
        const k = node.getKind();
        if (k === SyntaxKind.StringLiteral) {
          const lit = node;
          const val = lit.getLiteralValue();
          const newVal = val.replaceAll("&apos;", "'").replaceAll("&quot;", '"');
          if (newVal !== val) {
            lit.setLiteralValue(newVal);
            changed = true;
          }
        } else if (k === SyntaxKind.NoSubstitutionTemplateLiteral) {
          const lit = node;
          const text = lit.getLiteralText();
          const newText = text
            .replaceAll("&apos;", "'")
            .replaceAll("&quot;", '"')
            .replace(/`/g, "\\`");
          if (newText !== text) {
            lit.replaceWithText("`" + newText + "`");
            changed = true;
          }
        }
      } catch {
        // continua
      }
    });

    // --- Pass 3: deduplica attributi JSX (className, aria-*, id, ecc.)
    const openings = [
      ...sf.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
      ...sf.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
    ];

    for (const el of openings) {
      const attrs = el.getAttributes();
      const seen = new Set();
      for (const attr of attrs) {
        if (attr.getKind() === SyntaxKind.JsxAttribute) {
          const name = attr.getName();
          if (seen.has(name)) {
            logv("remove duplicate attr", name, "in", sf.getBaseName());
            attr.remove();
            changed = true;
          } else {
            seen.add(name);
          }
        }
      }
    }

    if (changed) {
      await sf.save();
      fixed++;
    }
  } catch (e) {
    failed++;
    console.error(`Hotfix error in ${sf.getFilePath()}: ${e.message}`);
  }
}

console.log(`Hotfix completato. Files cambiati: ${fixed}  Falliti: ${failed}`);
