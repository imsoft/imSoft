/**
 * Trinquete de lint.
 *
 * El repo arrastra deuda de cuando ESLint estuvo roto (`eslint-plugin-react` no soporta
 * ESLint 10, ver 8ca076a). Exigir cero problemas hoy significaria bloquear cada commit,
 * asi que en la practica se acabaria ignorando la barrera.
 *
 * En vez de eso se fija un presupuesto: la cuenta actual. Si sube, falla. Si baja, avisa
 * para que se apriete el tornillo. El objetivo es que la deuda solo pueda ir a menos.
 *
 *   node scripts/lint-budget.mjs           comprueba
 *   node scripts/lint-budget.mjs --update  reescribe el presupuesto con la cuenta actual
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUDGET_FILE = path.join(ROOT, '.lint-budget.json');

function runEslint() {
  let raw;
  try {
    raw = execFileSync('npx', ['eslint', '.', '--format', 'json'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (err) {
    // ESLint sale con codigo 1 cuando hay errores; el JSON sigue viniendo por stdout.
    raw = err.stdout;
    if (!raw) throw err;
  }
  const results = JSON.parse(raw);
  return results.reduce(
    (acc, file) => ({
      errors: acc.errors + file.errorCount,
      warnings: acc.warnings + file.warningCount,
    }),
    { errors: 0, warnings: 0 },
  );
}

const current = runEslint();
const total = current.errors + current.warnings;

if (process.argv.includes('--update')) {
  fs.writeFileSync(BUDGET_FILE, `${JSON.stringify(current, null, 2)}\n`);
  console.log(`Presupuesto actualizado: ${current.errors} errores, ${current.warnings} avisos.`);
  process.exit(0);
}

if (!fs.existsSync(BUDGET_FILE)) {
  console.error(`No existe ${path.basename(BUDGET_FILE)}. Crealo con: node scripts/lint-budget.mjs --update`);
  process.exit(1);
}

const budget = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf8'));
const allowed = budget.errors + budget.warnings;

console.log(`lint: ${current.errors} errores, ${current.warnings} avisos (presupuesto: ${budget.errors} / ${budget.warnings})`);

if (total > allowed) {
  console.error(
    `\nLa deuda de lint subio de ${allowed} a ${total}.\n` +
      `Arregla lo que anadiste, o si el aumento es deliberado justificalo y corre:\n` +
      `  node scripts/lint-budget.mjs --update`,
  );
  process.exit(1);
}

if (total < allowed) {
  console.log(
    `\nBajo de ${allowed} a ${total}. Aprieta el tornillo para que no vuelva a subir:\n` +
      `  node scripts/lint-budget.mjs --update`,
  );
}
