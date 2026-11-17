const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
global.customElements = dom.window.customElements;
global.matchMedia = () => ({ matches: false, addEventListener: () => {} });
global.devicePixelRatio = 1;
global.innerWidth = 1024;
global.innerHeight = 768;
global.scrollX = 0;
global.scrollY = 0;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = clearTimeout;

// Load core first
require('./core.js');

// Load all components
const components = [
  'button', 'toggle', 'slider', 'checkbox', 'radio', 'input',
  'tabs', 'progress', 'rating', 'toast', 'tooltip', 'badge',
  'select', 'textarea', 'alert', 'card', 'avatar', 'modal', 'pagination', 'spinner'
];

let failures = [];
for (const name of components) {
  try {
    require(`./components/${name}/${name}.js`);
    const tag = `rv-${name}`;
    if (!customElements.get(tag)) {
      failures.push(`${name}: NOT REGISTERED as ${tag}`);
    } else {
      console.log(`✓ ${name} registered as <${tag}>`);
    }
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
  }
}

if (failures.length > 0) {
  console.error('\n=== FAILURES ===');
  failures.forEach(f => console.error(f));
  process.exit(1);
} else {
  console.log('\n=== ALL 20 COMPONENTS REGISTERS OK ===');
  process.exit(0);
}
