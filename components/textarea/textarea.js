(() => {
// >>> RayFX core
if (window.RayFX) return;
'use strict';
const TAU = Math.PI * 2, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => b === undefined ? Math.random() * a : a + Math.random() * (b - a);
// A spring: the thing that makes a control overshoot and settle instead of stopping dead.
class Spring {
  constructor(x = 0, k = 300, d = 20) { this.x = x; this.v = 0; this.to = x; this.k = k; this.d = d; }
  step(dt) { if (!(dt > 0)) return this.x; for (let n = Math.ceil(dt / 0.008), h = dt / n; n--;) { this.v += (-this.k * (this.x - this.to) - this.d * this.v) * h; this.x += this.v * h; } return this.x; }
}
// ── the neon palette; the CSS variables below are for the controls. :where() keeps them at no
// specificity so a page's own :root { --rv-pri: ... } wins.
const VARS = '--rv-pri:#ff2d75;--rv-acc:#00f0ff;--rv-warn:#ffe135;--rv-card:#1a1a2e;--rv-ink:#0d0d16;--rv-dim:#8f8fa8;';
document.head.append(Object.assign(document.createElement('style'), { textContent: `:where(:root){${VARS}}canvas.ray-fx{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000}` }));
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let calm = reduce.matches; reduce.addEventListener?.('change', (e) => { calm = e.matches; });
// ── the canvas: one fixed full-page layer. Effects live in page coordinates and scroll with their control.
let g = null, dpr = 1;
const front = { c: null, g: null, live: [], dirty: false }, layers = [front];
function ensureFront() {
  if (front.c || !document.body) return;
  front.c = Object.assign(document.createElement('canvas'), { className: 'ray-fx' }); front.c.setAttribute('aria-hidden', 'true');
  document.body.append(front.c); front.g = front.c.getContext('2d'); size();
}
function size() { dpr = Math.min(2.5, devicePixelRatio || 1); if (front.c) { front.c.width = innerWidth * dpr; front.c.height = innerHeight * dpr; } }
addEventListener('resize', size);
const add = (life, draw, L) => { const p = { t: 0, life, draw }; if (!calm) { L = L || front; if (L === front) ensureFront(); L.live.push(p); start(); } return p; };
// ── the clock: one loop for every component; later() runs on this clock, not on setTimeout.
let now = 0, last = 0, running = false;
const frames = new Set(), timers = [];
const later = (ms, f) => { timers.push({ at: now + ms / 1000, f }); start(); };
function advance(dt) {
  now += dt;
  const due = timers.filter((q) => q.at <= now).sort((a, b) => a.at - b.at); if (due.length) for (const q of due) timers.splice(timers.indexOf(q), 1);
  for (const q of due) q.f();
  for (const f of frames) f(dt);
  for (const L of layers) {
    if (!L.c || (!L.live.length && !L.dirty)) continue;
    let ox = scrollX, oy = scrollY;
    if (L !== front) { if (!L.c.isConnected) { L.live = []; L.dirty = false; continue; } const r = L.c.getBoundingClientRect(); ox += r.left; oy += r.top; }
    g = L.g; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, L.c.width / dpr, L.c.height / dpr);
    g.translate(-ox, -oy); g.lineJoin = g.lineCap = 'round';
    L.live = L.live.filter((p) => !p.dead && (p.t += dt) < p.life);
    for (const p of L.live) { g.save(); p.draw(p.t / p.life, p.t, dt); g.restore(); }
    L.dirty = L.live.length > 0;
  }
}
function loop(ms) {
  if (!running) return;
  const dt = clamp((ms - last) / 1000, 0, 0.034); last = ms;
  if (!api.paused) advance(dt);
  if (!frames.size && !timers.length && layers.every((L) => !L.live.length && !L.dirty)) { running = false; return; }
  requestAnimationFrame(loop);
}
function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
// ── the effects
// a square pixel: the retro burst. Crisp blocks that fly outward and shrink away.
function burstPixel(cx, cy, { color = '#ffe135', n = 14, speed = 280, life = 0.55, grav = 0 } = {}) {
  for (let i = 0; i < n; i++) {
    const a = rnd(TAU), sp = speed * rnd(0.4, 1.15), sz = rnd(3, 8), gl = life * rnd(0.7, 1);
    add(gl, (k, t) => {
      const px = cx + Math.cos(a) * sp * t, py = cy + Math.sin(a) * sp * t + grav * t * t, s = sz * (1 - k * k), o = 1 - k;
      g.save(); g.globalAlpha = o; g.fillStyle = color; g.fillRect(px - s / 2, py - s / 2, s, s); g.restore();
    });
  }
}
// an arcade letter: bold text with a neon edge glow, landing big then winking out.
function showSFX(text, x, y, { size = 56, rot = -0.12, life = 0.9, col = '#ffffff', edge = '#ff2d75' } = {}) {
  const s = new Spring(0.2, 520, 17); s.to = 1; let lt = 0;
  add(life, (k, t) => {
    const sc = s.step(t - lt) * (1 - Math.pow(clamp((k - 0.85) / 0.15, 0, 1), 3)) * (size / 60); lt = t;
    g.save(); g.translate(x + Math.sin(t * 31) * 0.8, y + Math.cos(t * 27) * 0.8); g.rotate(rot + Math.sin(t * 6) * 0.03);
    g.font = `900 ${Math.max(8, Math.round(sc * 60))}px "Black Ops One", "Arial Black", sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = edge; g.shadowBlur = 16 * sc; g.fillStyle = edge; g.fillText(text, 0, 0);
    g.shadowBlur = 0; g.fillStyle = col; g.fillText(text, 0, 0); g.restore();
  });
}
// wobble marks: the little arcs beside something that just stopped.
function wob(x, y, { dir = 1, r = 16, life = 0.45 } = {}) {
  add(life, (k) => { g.strokeStyle = '#fff'; g.lineWidth = 2.2 * (1 - k); if (g.lineWidth < 0.2) return;
    g.beginPath(); for (const d of [0, 7]) { const rr = r + d + (1 - Math.pow(1 - k, 3)) * 8, c = dir > 0 ? 0 : Math.PI;
      g.moveTo(x - dir * r + Math.cos(c - 0.45) * rr, y + Math.sin(c - 0.45) * rr); g.arc(x - dir * r, y, rr, c - 0.45, c + 0.45); } g.stroke(); });
}
const at = (el, fx = 0.5, fy = 0.5) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX + b.width * fx, y: b.top + scrollY + b.height * fy, w: b.width, h: b.height }; };
// a press: squash flat while held, overshoot on release. Call step(dt) every frame.
function squashy(el, { low = 0.72, k = 520, d = 15, wide = 0.55 } = {}) {
  const s = new Spring(1, k, d), pop = new Spring(1, 300, 12), tilt = new Spring(0, 260, 10);
  el.addEventListener('pointerdown', () => { if (!el.disabled) s.to = low; });
  for (const e of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) el.addEventListener(e, () => { s.to = 1; });
  return { s, pop, tilt, step(dt) { const y = s.step(dt), p = pop.step(dt), r = tilt.step(dt), still = Math.abs(y - 1) < 0.001 && Math.abs(s.v) < 0.01 && Math.abs(p - 1) < 0.001 && Math.abs(r) < 0.02;
    el.style.transform = still ? '' : `rotate(${r}deg) scale(${(1 + (1 - y) * wide) * p}, ${y * p})`; } };
}
// ── the base for every component: one frame callback on the shared clock while it is on the page.
const BASE_CSS = `:host{display:inline-block;position:relative;isolation:isolate;-webkit-tap-highlight-color:transparent}
:host([hidden]){display:none}*{box-sizing:border-box}button,input{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}
:focus-visible{outline:2.5px solid var(--rv-acc);outline-offset:3px}`;
class Base extends HTMLElement {
  constructor() { super(); this.root = this.attachShadow({ mode: 'open', delegatesFocus: !!this.constructor.delegates }); }
  connectedCallback() {
    if (!this.ready) { this.ready = true; this.root.innerHTML = `<style>${BASE_CSS}${this.constructor.css || ''}</style>${this.render()}`; this.setup(); }
    this.tickFn ||= (dt) => this.frame(dt); frames.add(this.tickFn); start();
  }
  disconnectedCallback() { frames.delete(this.tickFn); }
  $(s) { return this.root.querySelector(s); } $$(s) { return [...this.root.querySelectorAll(s)]; }
  render() { return ''; } setup() {} frame() {}
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail })); }
}
const define = (tag, cls) => { if (!customElements.get(tag)) customElements.define(tag, cls); };
const api = window.RayFX = { version: 1, paused: false, TAU, clamp, lerp, rnd, Spring, later, burstPixel, showSFX, wob, at, squashy, Base, define };
})();
// <<< RayFX core

(() => {
const { Spring, later, at, burstPixel, showSFX, Base, define } = window.RayFX;

class RVTextarea extends Base {
  static observedAttributes = ['value', 'placeholder', 'disabled', 'rows'];
  static css = `
    .wrap{position:relative;display:block;width:100%}
    .glow{position:absolute;inset:-3px;border-radius:6px;pointer-events:none;opacity:var(--glow,0);
      box-shadow:0 0 16px 2px var(--rv-acc),inset 0 0 10px rgba(0,240,255,.35)}
    textarea{display:block;width:100%;min-height:72px;resize:vertical;padding:10px 12px;
      background:var(--rv-card);border:2px solid #3a2a5a;border-radius:4px;color:#fff;
      font:14px/1.5 "Share Tech Mono",monospace;letter-spacing:.03em;caret-color:var(--rv-acc);
      outline:none;transition:border-color .14s,box-shadow .14s}
    textarea:hover{border-color:#6a4a9a}
    textarea:focus{border-color:var(--rv-acc);box-shadow:0 0 12px rgba(0,240,255,.25)}
    textarea::placeholder{color:var(--rv-dim);opacity:.7}
    textarea:disabled{opacity:.5;cursor:not-allowed}
    .count{position:absolute;right:8px;bottom:6px;font:10px "Share Tech Mono",monospace;
      color:var(--rv-dim);opacity:var(--glow,0);transition:opacity .18s;pointer-events:none}`;

  get value() { return this.ta ? this.ta.value : (this.getAttribute('value') || ''); }
  set value(v) { if (this.ta) this.ta.value = v; this.setAttribute('value', v); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { this.toggleAttribute('disabled', !!v); }

  render() {
    const rows = this.getAttribute('rows') || '4';
    return `<div class="wrap" part="wrap"><span class="glow" aria-hidden="true"></span>
      <textarea part="input" rows="${rows}" placeholder="${this.getAttribute('placeholder') || ''}"
      spellcheck="false"${this.disabled ? ' disabled' : ''}>${this.getAttribute('value') || ''}</textarea>
      <span class="count" aria-hidden="true"></span></div>`;
  }

  setup() {
    this.ta = this.$('textarea'); this.glow = new Spring(0, 260, 16); this.seq = 0;
    this.ta.addEventListener('focus', () => { this.glow.to = 1; this.emit('rvfocus', { value: this.value }); });
    this.ta.addEventListener('blur', () => { this.glow.to = 0; this.emit('rvblur', { value: this.value }); });
    this.ta.addEventListener('input', () => {
      const n = ++this.seq; this._updateCount();
      this._puff();
      this.emit('rvinput', { value: this.value });
      if (this.value.endsWith('\n')) later(30, () => { if (n === this.seq) this._puff(); });
    });
    this._updateCount();
  }

  _updateCount() { this.$('.count').textContent = this.ta.value.length + ' chars'; }

  _caret() {
    const ta = this.ta, pos = ta.selectionStart;
    const before = ta.value.slice(0, pos), lines = before.split('\n');
    const last = lines[lines.length - 1];
    const cv = document.createElement('canvas').getContext('2d');
    cv.font = getComputedStyle(ta).font;
    const x = Math.min(cv.measureText(last).width, ta.clientWidth - 10) - ta.scrollLeft;
    const lineH = parseFloat(getComputedStyle(ta).lineHeight) || 21;
    const y = (lines.length - 1) * lineH + lineH / 2 - ta.scrollTop;
    return { x, y };
  }

  _puff() {
    const ta = this.ta, r = ta.getBoundingClientRect(), p = this._caret();
    const px = r.left + Math.max(4, Math.min(r.width - 4, p.x));
    const py = r.top + Math.max(4, Math.min(r.height - 4, p.y));
    burstPixel(px, py, { color: '#00f0ff', n: 5, speed: 90, life: .34, grav: -30 });
  }

  frame(dt) {
    this.style.setProperty('--glow', this.glow.step(dt).toFixed(3));
  }

  attributeChangedCallback(n, o, nv) {
    if (!this.ta) return;
    if (n === 'value' && nv !== this.ta.value) this.ta.value = nv || '';
    if (n === 'disabled') this.ta.disabled = this.disabled;
    if (n === 'placeholder') this.ta.placeholder = nv || '';
    if (n === 'rows') this.ta.rows = parseInt(nv, 10) || 4;
  }
}
define('rv-textarea', RVTextarea);
})();
