# ray-vfx

[![license: MIT](https://img.shields.io/badge/license-MIT-b6ff3c?style=flat-square)](#license) [![20 components](https://img.shields.io/badge/components-20-00f0ff?style=flat-square)](#components) [![0 dependencies](https://img.shields.io/badge/dependencies-0-ff2e97?style=flat-square)](#how-it-works) [![Web Components](https://img.shields.io/badge/Web%20Components-native-a855f7?style=flat-square)](#how-it-works)

Retro-neon arcade UI components. Twenty native Web Components, plain `<script>` tags, zero dependencies, MIT licensed. Every control reacts with spring physics and hand-built CRT/neon effects — no framework, no bundler, no CSS import.

GitHub: <https://github.com/rayss868/ray-vfx>

---

## Install

### Script tag, one per component

Each component is a **single self-contained classic script**. Copy the files you need from [`components/`](components/) into your public folder (e.g. `public/ray-vfx/`) and add one tag per component:

```html
<script src="/ray-vfx/button.js"></script>
<script src="/ray-vfx/toggle.js"></script>
<script src="/ray-vfx/slider.js"></script>
<script src="/ray-vfx/checkbox.js"></script>
<script src="/ray-vfx/radio.js"></script>
<script src="/ray-vfx/input.js"></script>
<script src="/ray-vfx/tabs.js"></script>
<script src="/ray-vfx/progress.js"></script>
<script src="/ray-vfx/rating.js"></script>
<script src="/ray-vfx/toast.js"></script>
<script src="/ray-vfx/tooltip.js"></script>
<script src="/ray-vfx/badge.js"></script>
<script src="/ray-vfx/select.js"></script>
<script src="/ray-vfx/textarea.js"></script>
<script src="/ray-vfx/alert.js"></script>
<script src="/ray-vfx/card.js"></script>
<script src="/ray-vfx/avatar.js"></script>
<script src="/ray-vfx/modal.js"></script>
<script src="/ray-vfx/pagination.js"></script>
<script src="/ray-vfx/spinner.js"></script>
```

Or load straight from the CDN — same one-tag-per-component rule, no build step:

```html
<script src="https://cdn.jsdelivr.net/gh/rayss868/ray-vfx@main/components/button.js"></script>
```

Use a plain `<script>` (not `type="module"`). Styles live inside each element's shadow root, so there is no stylesheet to import and nothing leaks into your page. Load order doesn't matter; each file registers its own `<rv-*>` element independently.

### shadcn registry (placeholder)

`registry.json` is a valid [shadcn registry](https://ui.shadcn.com/docs/registry/registry-json). Once the registry is hosted, installing an item looks like:

```bash
npx shadcn@latest add https://<REGISTRY_HOST>/r/button.json
npx shadcn@latest add https://<REGISTRY_HOST>/r/toggle.json
```

> `<REGISTRY_HOST>` is a placeholder — the registry is published from this repo but has no permanent host yet. Until then, treat `registry.json` as the source of truth and copy `components/<name>.js` (or use the CDN URLs above). Each item's `files[].target` is `~/public/ray-vfx/<name>.js`, which matches the local script paths.

### Quick start

```html
<!doctype html>
<html>
  <head>
    <script src="/ray-vfx/button.js"></script>
    <script src="/ray-vfx/input.js"></script>
    <script src="/ray-vfx/toast.js"></script>
  </head>
  <body>
    <rv-input label="Callsign" name="callsign" placeholder="PLAYER_1"></rv-input>
    <rv-button variant="primary" fx="burst" id="start">Insert coin</rv-button>
    <rv-toast id="toasts" position="top-right"></rv-toast>

    <script>
      document.querySelector('#start').addEventListener('click', () => {
        document.querySelector('#toasts').success('Player 1 ready');
      });
    </script>
  </body>
</html>
```

No `npm install`. Works in plain HTML, React, Vue, Svelte, Astro or any other renderer — they are DOM elements, and you read/write properties and listen to events the same way you would with `<input>`.

---

## Components

All 20 components. Full attribute/method/event reference is in [`llms.txt`](llms.txt).

### 1. button
A pressable key that squashes on press, blooms neon on release and throws a spark burst on success.
```html
<rv-button variant="primary" fx="burst">Insert coin</rv-button>
```

### 2. toggle
A power switch whose knob snaps across a light tube on a spring and floods the track with color.
```html
<rv-toggle label="CRT scanlines" checked></rv-toggle>
```

### 3. slider
A volume fader with a stretchy thumb that lags behind the drag on a spring and leaves a phosphor trail.
```html
<rv-slider label="Volume" min="0" max="100" value="72" unit="%"></rv-slider>
```

### 4. checkbox
A checkbox that slashes a neon tick into the box with a chromatic flash.
```html
<rv-checkbox name="remember" checked>Remember me</rv-checkbox>
```

### 5. radio
A radio group where the selected dot springs in with a fan of wedges and a hollow blip.
```html
<rv-radio name="difficulty" label="Difficulty" value="hard">
  <option value="easy">Easy</option>
  <option value="hard">Hard</option>
</rv-radio>
```

### 6. input
A text field whose caret kicks up a puff of pixel dust on every keystroke.
```html
<rv-input label="Callsign" name="callsign" placeholder="PLAYER_1"></rv-input>
```

### 7. tabs
A tab strip where the glowing indicator stretches and slingshots between tabs; you render the panels.
```html
<rv-tabs value="scores">
  <option value="scores">High scores</option>
  <option value="settings">Settings</option>
</rv-tabs>
```

### 8. progress
A loading bar with a comet head that drags scanlines and lands with a 1UP burst at 100%.
```html
<rv-progress label="Loading ROM" value="0.42"></rv-progress>
```

### 9. rating
Five stars that pop in sequence with an escalating arcade chime; a full score triggers confetti.
```html
<rv-rating label="Your score" value="4" max="5"></rv-rating>
```

### 10. toast
A notification that streaks in as a smear, wobbles on landing and dissolves into pixels.
```html
<rv-toast id="toasts" position="top-right" duration="3200"></rv-toast>
<script>document.querySelector('#toasts').show('New high score!');</script>
```

### 11. tooltip
A hint bubble that springs out of its trigger with a CRT flicker; opens on hover, focus or tap.
```html
<rv-tooltip text="Hold START to pause" placement="top"><button>?</button></rv-tooltip>
```

### 12. badge
A compact status chip with a breathing neon edge and a scanline shimmer.
```html
<rv-badge variant="pink" pulse>1UP</rv-badge>
```

### 13. select
A dropdown that unfolds like a cabinet menu with a scanline sweep and keyboard typeahead.
```html
<rv-select label="Level" name="level">
  <option value="1">Sector 1</option>
  <option value="2">Sector 2</option>
</rv-select>
```

### 14. textarea
A multi-line field with a glowing caret, auto-grow and a per-line dust effect.
```html
<rv-textarea label="Notes" rows="4" auto-grow placeholder="GG..."></rv-textarea>
```

### 15. alert
A banner that slides in with a glitch cut and a colored edge glow per severity.
```html
<rv-alert variant="warning" title="Coin low" dismissible>Credits: 1</rv-alert>
```

### 16. card
A glass panel with pointer-tracked tilt, parallax sheen and a hover bloom.
```html
<rv-card title="High score" subtitle="Sector 7" interactive><p>098,420</p></rv-card>
```

### 17. avatar
A ringed avatar with a status LED, neon outline and initials fallback when the image fails.
```html
<rv-avatar src="/img/p1.png" alt="Player 1" initials="P1" status="online"></rv-avatar>
```

### 18. modal
A dialog that zooms in on a spring with a dimmed CRT backdrop and a focus trap.
```html
<rv-modal id="pause" title="Paused">
  <p>Resume?</p>
  <button slot="actions" data-close>Resume</button>
</rv-modal>
<script>document.querySelector('#pause').show();</script>
```

### 19. pagination
Page chips where the active one springs and the rail sweeps a light between pages.
```html
<rv-pagination total="24" per-page="10" page="2"></rv-pagination>
```

### 20. spinner
An orbit/pulse/bars loader driven by the same spring ticker, with a determinate mode.
```html
<rv-spinner variant="orbit" size="md" label="Loading"></rv-spinner>
```

---

## How it works

### Core engine: the `Base` class

Every `<rv-*>` element extends `Base` (authoring source in `core/base.js`). `Base extends HTMLElement` and owns the pieces all components share:

- **Shadow DOM + template** — one `attachShadow({ mode: 'open' })`, a `<style>` block of component CSS and a small DOM skeleton. Nothing global is written except the `customElements` registration.
- **Attribute/property reflection** — `observedAttributes` maps kebab-case attributes to camelCase properties; boolean attributes use presence, and reflected properties update the attribute so HTML and JS stay in sync.
- **Spring animation** — `this.spring(...)` and `this.animateSpring(...)` drive state changes.
- **Effects** — `this.fx(name, opts)` runs an effect on the element's overlay and returns a cleanup handle.
- **Form association** — controls set `static formAssociated = true` and use `ElementInternals` (`attachInternals()`) so they submit, reset and validate like native inputs.
- **Events** — `this.emit(name, detail)` dispatches a `CustomEvent` with `{ bubbles: true, composed: true }`, so listeners on the element or any ancestor work across shadow boundaries.
- **Lifecycle cleanup** — `disconnectedCallback()` cancels the element's RAF handles, removes listeners, tears down effects and drops pooled particles. No leaks on re-render.

The distributed files in `components/` are generated: `scripts/build.mjs` inlines `core/*` into each `src/components/<name>.js`, producing one standalone classic script per component. That is why one `<script>` tag is enough and why there are no runtime imports.

### Spring physics

Transitions are integrated, not keyframed. `core/spring.js` implements a damped harmonic oscillator with semi-implicit Euler integration:

```
a = (-k * (x - target) - c * v) / m
v = v + a * dt
x = x + v * dt
```

| Parameter | Default | Meaning |
| --- | --- | --- |
| `k` stiffness | `220` | pull toward the target |
| `c` damping | `26` | resistance; critical damping is `2 * sqrt(k * m)` |
| `m` mass | `1` | inertia |
| settle threshold | `0.01` position + `0.01` velocity | stops the ticker |

A single shared `requestAnimationFrame` loop ticks every live spring; `dt` is clamped to 32 ms so a backgrounded tab doesn't launch the value into orbit. Spring handles expose `.to(value)`, `.set(value)`, `.stop()`, `.onFrame(fn)` and `.settled`. Because a spring carries velocity, interrupting it (a second click, a fast drag, rapidly switching tabs) continues smoothly from the current state instead of restarting a CSS animation. Press squash, toggle knob travel, slider thumb lag, tooltip pop, modal zoom and pagination rail sweep are all the same primitive.

Tune globally with `RayFX.config({ stiffness, damping, mass })`, per element with `--rv-spring-stiffness` / `--rv-spring-damping`, or per spring by passing options.

### Effects system

`core/effects.js` is a small registry: `RayFX.registerEffect(name, factory)` and `RayFX.run(host, name, opts)`. Effects render on an absolutely positioned overlay inside the shadow root using pooled DOM particles (max 48 per element), GPU transforms only, and self-remove when finished. Every effect returns a cleanup function and fires `ray:fx-start` / `ray:fx-end`.

| Effect | What it does |
| --- | --- |
| `glow` | breathing neon bloom around the element |
| `burst` | radial spark burst on activation/success |
| `sparks` | short directional sparks from an edge |
| `scanline` | CRT sweep across the surface |
| `shake` | brief positional jitter for errors |
| `glitch` | RGB-split / slice displacement |
| `trail` | phosphor trail following movement |
| `pulse` | single ring expansion |
| `chromatic` | chromatic aberration flash |
| `confetti` | pixel confetti for high scores |

Attach one declaratively with `fx="burst"` (comma-separated for several, `fx="none"` to disable), or imperatively:

```js
RayFX.run(document.querySelector('#start'), 'confetti', { count: 24 });
```

Custom effects are plain functions `(host, opts) => cleanup`, so adding one never touches the core.

### CSS variables palette

All color, spacing and timing come from CSS custom properties. Override them on `:root`, on a section, or on one element — components read them through `getComputedStyle(this)` and re-read on changes, so theming needs no JS.

| Variable | Default | Role |
| --- | --- | --- |
| `--rv-bg` | `#07060f` | page / deep backdrop |
| `--rv-surface` | `#12102a` | control surface |
| `--rv-surface-2` | `#1b1740` | raised surface, popovers |
| `--rv-cyan` | `#00f0ff` | primary accent |
| `--rv-pink` | `#ff2e97` | secondary accent, danger |
| `--rv-violet` | `#a855f7` | tertiary accent |
| `--rv-lime` | `#b6ff3c` | success |
| `--rv-amber` | `#ffb020` | warning |
| `--rv-red` | `#ff4d5e` | error |
| `--rv-text` | `#f2f0ff` | primary text |
| `--rv-muted` | `#8b86b8` | secondary text, labels |
| `--rv-border` | `rgba(0,240,255,.35)` | outlines, dividers |
| `--rv-glow-cyan` | `0 0 12px rgba(0,240,255,.65)` | cyan glow shadow |
| `--rv-glow-pink` | `0 0 12px rgba(255,46,151,.65)` | pink glow shadow |
| `--rv-focus` | `#ffffff` | focus ring |
| `--rv-radius` | `10px` | corner radius |
| `--rv-gap` | `8px` | base spacing unit |
| `--rv-font` | `ui-monospace, "SFMono-Regular", monospace` | arcade-ish type |
| `--rv-duration` | `220ms` | fallback transition timing |
| `--rv-spring-stiffness` | `220` | spring `k` |
| `--rv-spring-damping` | `26` | spring `c` |
| `--rv-z-overlay` | `1000` | modal / toast stacking |

```css
:root {
  --rv-cyan: #39ff14;
  --rv-pink: #ff00a0;
  --rv-radius: 4px;
  --rv-spring-damping: 34; /* calmer motion */
}
```

### Accessibility

- **`prefers-reduced-motion: reduce`** is honored live via `matchMedia` (including mid-session changes). Springs snap straight to their target, particles, shake, glitch, trails and confetti are skipped, glow is rendered as a static opacity change, and no infinite loops run. You can force the same behavior with a `reduced-motion` attribute on any element or `RayFX.config({ reducedMotion: true })`.
- **Keyboard**: all controls are reachable with Tab, activated with Space/Enter, arrow keys move sliders, ratings, tabs, radios and pagination, Escape closes tooltip/select/modal, and typeahead works in select.
- **Semantics**: correct roles and `aria-*` state (`aria-checked`, `aria-valuenow`, `aria-selected`, `aria-expanded`, `aria-invalid`, `aria-busy`), visible `:focus-visible` rings, and `aria-live` regions for toast, progress and alert.
- **Forms**: `ElementInternals` makes value-bearing components participate in submit, reset, validation and labels.
- **Contrast / forced colors**: text uses `--rv-text` on `--rv-surface`; `@media (forced-colors: active)` swaps glows for system-color borders.
- Motion never conveys meaning alone — state is also expressed in text, shape or color.

---

## Project layout

```
ray-vfx/
├── components/             # 20 standalone browser scripts (load these)
├── src/components/         # authoring source, one file per component
├── core/
│   ├── base.js             # Base class
│   ├── spring.js           # Spring + shared RAF ticker
│   ├── effects.js          # effect registry
│   └── tokens.css          # CSS variable defaults
├── scripts/build.mjs       # inlines core into each component, writes dist/
├── dist/                   # generated minified bundles (gitignored)
├── registry.json           # shadcn registry index
├── llms.txt                # AI-agent / API reference
└── README.md
```

---

## License

MIT. Copyright (c) 2026 rayss868.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
