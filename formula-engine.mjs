import { Parser } from "expr-eval";

/**
 * Valuta i formulaSteps in ordine, con env iniziale (inputs).
 * Ritorna env esteso con i valori calcolati.
 */
export function evaluateSteps(spec, env) {
  const parser = new Parser({
    operators: {
      add: true, subtract: true, multiply: true, divide: true, power: true,
      factorial: false, modulo: true,
      logical: false, comparison: false, conditional: false,
    }
  });

  const ctx = { ...env };
  for (const step of spec.formulaSteps) {
    if (/[^0-9a-zA-Z_+\-*/()., ^% ]/.test(step.expression)) {
      throw new Error(`Token non sicuri nell'espressione '${step.key}'`);
    }
    const expr = parser.parse(step.expression);
    const val = expr.evaluate(ctx);
    if (!Number.isFinite(val)) throw new Error(`Risultato non finito allo step '${step.key}'`);
    ctx[step.key] = val;
  }
  return ctx;
}

/**
 * Esegue gli examples dichiarati nello spec
 * Ritorna { pass, failures }
 */
export function testExamples(spec) {
  const failures = [];
  for (let i = 0; i < spec.examples.length; i++) {
    const ex = spec.examples[i];
    let ctx;
    try {
      ctx = evaluateSteps(spec, ex.input);
    } catch (e) {
      failures.push({ index: i, error: String(e?.message || e) });
      continue;
    }
    for (const [k, exp] of Object.entries(ex.expected)) {
      const got = ctx[k];
      const tol = ex.tolerance ?? 1e-6;
      const delta = Math.abs((got ?? NaN) - exp);
      if (!(Number.isFinite(got) && delta <= tol)) {
        failures.push({ index: i, key: k, got, expected: exp, delta, tolerance: tol });
      }
    }
  }
  return { pass: failures.length === 0, failures };
}
