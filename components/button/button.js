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
const { Spring, later, at, burstPixel, showSFX, wob, squashy, Base, define } = window.RayFX;
const BURST = { primary: '#ffe135', danger: '#ff4444', ghost: '#00f0ff', subtle: '#8f8fa8' };

class RVButton extends Base {
  static delegates = true;
  static observedAttributes = ['variant', 'disabled'];
  static css = `
    .btn { position: relative; padding: 12px 28px; border-radius: 6px; cursor: pointer; background: transparent;
      font: 800 15px/1 "Orbitron", "Black Ops One", "Arial Black", sans-serif; letter-spacing: .08em; text-transform: uppercase;
      user-select: none; -webkit-user-select: none; touch-action: manipulation; will-change: transform; }
    .btn[data-v="primary"] { color: var(--rv-pri); border: 2px solid var(--rv-pri); background: rgba(255,45,117,.16); box-shadow: 0 0 8px rgba(255,45,117,.45); }
    .btn[data-v="danger"]  { color: #ff4444; border: 2px solid #ff4444; background: rgba(255,68,68,.14); box-shadow: 0 0 8px rgba(255,68,68,.45); }
    .btn[data-v="ghost"]   { color: var(--rv-acc); border: 2px solid var(--rv-acc); background: transparent; }
    .btn[data-v="subtle"]  { color: var(--rv-dim); border: 1px solid rgba(255,255,255,.18); background: var(--rv-card); }
    .btn:hover:not(:disabled) { filter: brightness(1.25); }
    .btn:active:not(:disabled) { filter: brightness(1.5); }
    .btn:disabled { opacity: .4; cursor: not-allowed; }
    .check { display: inline-block; width: calc(var(--done, 0) * 22px); height: 16px; margin-left: 8px; vertical-align: -2px; overflow: visible; fill: none; stroke: #2dff6e; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; transform: scale(var(--done, 0)); filter: drop-shadow(0 0 5px rgba(45,255,110,.8)); }`;

  get variant() { return this.getAttribute('variant') || 'primary'; }
  set variant(v) { this.setAttribute('variant', v); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { this.toggleAttribute('disabled', !!v); }
  attributeChangedCallback(n, o, nv) { if (n === 'variant' && this.b) this.b.dataset.v = nv || 'primary'; if (n === 'disabled' && this.b) this.b.disabled = this.disabled; }

  render() {
    return `<button class="btn" type="button" part="button" data-v="${this.variant}"${this.disabled ? ' disabled' : ''}>`
      + `<slot></slot><svg class="check" viewBox="0 0 24 18" aria-hidden="true"><path d="M3 9.5l6 6L21 2.5"/></svg></button>`;
  }

  setup() {
    const b = this.b = this.$('.btn');
    this.sq = squashy(b, { low: 0.62, wide: 0.22 });
    this.ok = new Spring(0, 420, 14); this.seq = 0;
    b.addEventListener('click', () => { if (b.disabled) return; this.clickFx(); this.emit('rvclick', { variant: this.variant }); });
  }

  // the impact: what a click does. You can call it yourself.
  clickFx() {
    const b = this.b, c = at(b), n = ++this.seq; this.ok.to = 0; this.ok.x = 0;
    burstPixel(c.x, c.y, { color: BURST[this.variant] || BURST.primary, n: 18, speed: 320, life: 0.62, grav: 140 });
    showSFX(this.variant === 'danger' ? 'BOOM!' : 'WHAM!', c.x, c.y - c.h - 34, { size: 52, col: '#ffffff', edge: this.variant === 'danger' ? '#ff4444' : '#ff2d75' });
    wob(c.x - c.w / 2 - 8, c.y, { dir: -1 }); wob(c.x + c.w / 2 + 8, c.y, { dir: 1 });
    later(180, () => { if (n !== this.seq) return; this.sq.s.x = 1.25; this.sq.pop.x = 1.18; this.sq.tilt.x = -3; });
  }

  // a green check lands on the button with a PING! letter, and goes after a while. hold is how long it stays, in seconds.
  done(hold = 1.8) {
    if (!this.b) return; const n = this.seq; this.ok.to = 1;
    const c = at(this.b, 1, 0.5);
    showSFX('PING!', c.x - 24, c.y - 44, { size: 40, col: '#ffffff', edge: '#00f0ff' });
    if (hold > 0) later(hold * 1000, () => { if (n === this.seq) this.ok.to = 0; });
  }

  frame(dt) { this.sq.step(dt); this.b.style.setProperty('--done', Math.max(0, this.ok.step(dt)).toFixed(3)); }
}

define('rv-button', RVButton);
})();
