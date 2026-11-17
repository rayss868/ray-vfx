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
const { Spring, later, at, burstPixel, showSFX, wob, Base, define } = window.RayFX;

class RVModal extends Base {
  static observedAttributes = ['open'];
  static css = `
    .back{position:fixed;inset:0;background:rgba(13,13,22,.92);backdrop-filter:blur(4px);
      z-index:2000;opacity:var(--bo,0);pointer-events:none;transition:opacity .2s}
    .box{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--sc,0.88));
      z-index:2001;max-width:calc(100vw - 48px);max-height:calc(100vh - 48px);
      background:linear-gradient(135deg,#1a1a2e,#0d0d16);
      border:2px solid var(--rv-pri);border-radius:8px;
      box-shadow:0 0 40px rgba(255,45,117,.35),inset 0 1px 0 rgba(255,255,255,.08);
      overflow:hidden;opacity:var(--bo,0);pointer-events:none;transition:opacity .2s}
    .box.open{opacity:1;pointer-events:auto}
    .hd{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;
      border-bottom:1px solid rgba(255,45,117,.35);background:rgba(255,45,117,.08)}
    .hd h3{margin:0;font:700 14px "Orbitron",sans-serif;letter-spacing:.08em;color:var(--rv-pri);
      text-transform:uppercase}
    .x{background:transparent;border:1px solid var(--rv-pri);color:var(--rv-pri);
      width:28px;height:28px;line-height:24px;text-align:center;cursor:pointer;
      font:700 16px monospace;border-radius:3px;padding:0}
    .x:hover{background:var(--rv-pri);color:#0d0d16}
    .bd{padding:16px;color:#fff;font:14px/1.5 "Share Tech Mono",monospace;overflow:auto;
      max-height:calc(100vh - 140px)}
    .ft{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;
      border-top:1px solid rgba(255,45,117,.25);background:rgba(0,0,0,.2)}`;

  get open() { return this.hasAttribute('open'); }
  set open(v) { v ? this.setAttribute('open', '') : this.removeAttribute('open'); }

  render() {
    return `<div class="back" part="backdrop" aria-hidden="true"></div>
      <div class="box" part="box" role="dialog" aria-modal="true" aria-labelledby="rvm-title">
        <div class="hd"><h3 id="rvm-title"><slot name="title">Modal</slot></h3>
          <button class="x" type="button" aria-label="Close" part="close">×</button></div>
        <div class="bd" part="body"><slot></slot></div>
        <div class="ft" part="footer"><slot name="footer"></slot></div>
      </div>`;
  }

  setup() {
    this.back = this.$('.back'); this.box = this.$('.box');
    this.sc = new Spring(0.88, 280, 12); this.bo = new Spring(0, 260, 14);
    this._close = () => this.hide();
    this.$('.x').addEventListener('click', this._close);
    this.back.addEventListener('click', this._close);
    document.addEventListener('keydown', this._esc = (e) => { if (e.key === 'Escape') this.hide(); });
    this._restoreFocus = null;
  }

  show() {
    if (this.open) return;
    this._restoreFocus = document.activeElement;
    this.open = true; this.box.classList.add('open');
    this.bo.to = 1; this.sc.to = 1;
    const c = at(this.box);
    showSFX('WHAM!', c.x, c.y - 24, { size: 38, col: '#fff', edge: '#ff2d75' });
    wob(c.x - this.box.offsetWidth/2 - 10, c.y, { dir: -1 });
    wob(c.x + this.box.offsetWidth/2 + 10, c.y, { dir: 1 });
    burstPixel(c.x, c.y, { color: '#ff2d75', n: 16, speed: 260, life: .55 });
    later(30, () => { this.$('.x').focus(); });
    this.emit('rvshow', {});
  }

  hide() {
    if (!this.open) return;
    this.bo.to = 0; this.sc.to = 0.88;
    const c = at(this.box);
    burstPixel(c.x, c.y, { color: '#ff4444', n: 10, speed: 200, life: .4 });
    showSFX('BOOM!', c.x, c.y - 18, { size: 28, col: '#fff', edge: '#ff4444' });
    later(160, () => {
      this.box.classList.remove('open');
      this.open = false;
      if (this._restoreFocus) this._restoreFocus.focus();
      this.emit('rvhide', {});
    });
  }

  frame(dt) {
    this.style.setProperty('--sc', this.sc.step(dt).toFixed(3));
    this.style.setProperty('--bo', this.bo.step(dt).toFixed(3));
    this.back.style.opacity = this.bo.x.toFixed(3);
    this.box.style.opacity = this.bo.x.toFixed(3);
  }

  // Modal is display:none-ish via opacity animation; stays in DOM.
  // No body append — fixed-position overlay renders fine where it lives.
  connectedCallback() { super.connectedCallback(); }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._esc);
  }
  attributeChangedCallback(n, o, nv) { if (n === 'open' && !this.sc) this.open = this.open; }
}
define('rv-modal', RVModal);
})();
