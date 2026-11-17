# ray-vfx

Everyday UI controls that react like an anime key animator drew them. At rest they are plain: press one and it squashes on a spring, throws smoke puffs, impact bursts, crystal shards and slashes around itself, and lets a manga sound effect land. White paper, two-tone effects, violet lines, pink accents.

Twenty native Web Components, one self-contained file each, zero dependencies, MIT licensed. No framework, no build step for you.

GitHub: https://github.com/rayss868/ray-vfx
Live: https://ray-vfx.vercel.app

---

## Install

Each component is a single classic script that registers its own element:

```html
<script src="/ray-vfx/button.js"></script>
<script src="/ray-vfx/toggle.js"></script>
```

or straight from the CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/rayss868/ray-vfx@main/components/button/button.js"></script>
```

Use a plain `<script>` (not type="module"). Each file carries its own copy of the effects core, so any subset works on its own; the first one loaded sets window.RayFX and the rest reuse it. One full-page canvas holds every effect.

## The twenty

| element | reaction |
|---|---|
| <rv-button> | Squash on press, invert for one frame, a spiky burst, four smoke puffs, ドン! |
| <rv-toggle> | A drawn 43-frame flip: the knob smears, slams, and throws a splash |
| <rv-slider> | The thumb stretches into a teardrop and lags on a spring |
| <rv-checkbox> | Two crescents swing round the box, crystals fly, ズザッ |
| <rv-radio> | The dot springs in with a fan of wedges and a hollow ポン |
| <rv-input> | Every key kicks up dust where the caret is |
| <rv-tabs> | The raised tab slides, stretches, and lands with wedges and a puff |
| <rv-progress> | A storm cloud rides the leading edge; a burst and a check at the end |
| <rv-rating> | Stars pop in one after another; five gets a confetti burst |
| <rv-toast> | Streaks in as a smear, lands in dust, leaves by shrinking |
| <rv-tooltip> | Springs out like a speech bubble with puffs and カチッ |
| <rv-select> | Unfolds like a cabinet menu, scanline sweep, keyboard typeahead |
| <rv-textarea> | A glowing caret and pixel dust on every keystroke |
| <rv-alert> | Cuts in with a slash across the banner |
| <rv-card> | A paper card with pointer-tracked tilt and a hover glint |
| <rv-avatar> | A ringed avatar with a status LED |
| <rv-badge> | A small paper chip with a two-tone shadow |
| <rv-modal> | Zooms in on a spring, PAAN!, lands in dust |
| <rv-pagination> | Chips spring, and a smoke ring drifts off the active one |
| <rv-spinner> | An ink dot orbits; a glint when it finishes |

For agents, [llms.txt](llms.txt) lists every file and what it is.

## The look

White paper, two-tone effects (white, lavender and a violet line), pink accents. The controls read the --rv-* CSS variables (--rv-card, --rv-ink, --rv-pri, --rv-acc, --rv-r, --rv-bw, --rv-sh, and so on); a page's own :root { --rv-acc: ... } wins over the defaults.

## Use one

```html
<script src="/ray-vfx/button.js"></script>
<rv-button>Confirm</rv-button>

<script src="/ray-vfx/progress.js"></script>
<rv-progress label="Uploading"></rv-progress>   <!-- then el.set(0.4) -->
```

The value controls (toggle, slider, checkbox, radio, input, rating, select, textarea, textarea) work inside a <form> like the native ones.

## Accessibility

- prefers-reduced-motion turns every drawn effect off; the springs and state changes stay.
- Keyboard: Tab, Space/Enter, arrows, Escape, and typeahead in select.
- Correct roles and aria state; focus traps in modal.
- Motion never conveys meaning alone.

## License

MIT, (c) 2026 rayss868. The manga lettering and toggle frames are drawn inside the files, so there is nothing else to fetch.
