// Smoke test: load every component in a headless browser is overkill for this repo; here we parse + syntax-check each file.
const { readFileSync } = require('node:fs');

let fail = 0;
const NAMES = ['button','toggle','slider','checkbox','radio','input','tabs','progress','rating','toast','tooltip','select','textarea','alert','card','avatar','badge','pagination','spinner','modal'];
for (const n of NAMES) {
  const f = `components/${n}/${n}.js`;
  try { new Function(readFileSync(f, 'utf8')); console.log('ok  ', n); }
  catch (e) { fail++; console.error('FAIL', n, e.message); }
}
process.exit(fail ? 1 : 0);
