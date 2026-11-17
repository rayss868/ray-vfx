// Load core + all components in a jsdom window; verify each custom element registers and renders.
// The v2 core bakes manga lettering with Path2D/canvas, so those are stubbed. Effects only run on interaction.
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only',
});
const { window } = dom;

class Path2DStub { constructor() {} moveTo() {} lineTo() {} arc() {} quadraticCurveTo() {} closePath() {} ellipse() {} }
window.Path2D = Path2DStub;
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => (t[k] = v, true) });
window.HTMLCanvasElement.prototype.getContext = () => {
  const c = Object.create(ctx);
  c.createPattern = () => ({}); c.createLinearGradient = () => ({ addColorStop() {} });
  c.createRadialGradient = () => ({ addColorStop() {} });
  c.measureText = () => ({ width: 10 });
  return c;
};
// jsdom gaps that the v2 components lean on: Web Animations, ElementInternals,
// ResizeObserver. None of these affect component registration, they affect runtime FX.
window.Element.prototype.animate = () => ({ finished: Promise.resolve(), onfinish: null, cancel() {}, finish() {}, play() {}, pause() {}, reverse() {} });
window.ElementInternals = class { constructor(el) { this._el = el; } setFormValue(v) { if (this._el) this._el.__internalsFormValue = v; } validationMessage = ''; checkValidity() { return true; } reportValidity() { return true; } addEventListener() {} removeEventListener() {} dispatchEvent() {} };
window.ResizeObserver = class { constructor() {} observe() {} unobserve() {} disconnect() {} };
// jsdom's HTMLElement.attachInternals returns a native object but without methods; override to our stub
const origAttachInternals = window.HTMLElement.prototype.attachInternals;
if (!origAttachInternals || !window.HTMLElement.formAssociated) {
  window.HTMLElement.prototype.attachInternals = function() { return new window.ElementInternals(this); };
}
// Do not override Image: jsdom's HTMLImageElement already has addEventListener; the toggle
// just stores a data-uri which will never load in jsdom, which is fine for a registration test.

const errors = [];
window.addEventListener('error', (e) => errors.push(String(e.error || e.message)));

function load(file) {
  try { window.eval(fs.readFileSync(path.join(__dirname, file), 'utf8') + '\n//# sourceURL=' + file); }
  catch (e) { errors.push(`${file}: ${e.message}`); }
}

load('core.js');
const names = fs.readdirSync(path.join(__dirname, 'components')).filter((d) =>
  fs.existsSync(path.join(__dirname, 'components', d, d + '.js'))).sort();
for (const name of names) load(`components/${name}/${name}.js`);

let ok = 0;
const failed = [];
for (const name of names) {
  const tag = 'rv-' + name;
  if (!window.customElements.get(tag)) { failed.push(`${tag}: NOT REGISTERED`); continue; }
  try {
    const el = window.document.createElement(tag);
    window.document.body.appendChild(el);
    if (!el.shadowRoot) { failed.push(`${tag}: NO SHADOW ROOT`); continue; }
    ok++;
  } catch (e) { failed.push(`${tag}: ${e.message}`); }
}

console.log(`components found: ${names.length}`);
console.log(`registered + rendered: ${ok}/${names.length}`);
if (errors.length) { console.log('JS ERRORS:', errors.length); errors.slice(0, 20).forEach((e) => console.log('  ', e)); }
if (failed.length) { console.log('FAILURES:'); failed.forEach((f) => console.log('  ', f)); }
const success = ok === names.length && errors.length === 0 && failed.length === 0;
console.log(success ? '=== SMOKE TEST PASS ===' : '=== SMOKE TEST FAIL ===');
process.exit(success ? 0 : 1);
