import { $$, svg, seeded } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// Three fixed layers of stars behind the page (_includes/site/sky.html), each
// drifting at its own rate as the page scrolls. Each layer is one window tall
// and drawn twice, so it wraps seamlessly.
const KINDS = {
  far:  { per: 9000,  r: [0.35, 0.8], opacity: [0.12, 0.35], warm: 0 },
  mid:  { per: 24000, r: [0.7, 1.15], opacity: [0.25, 0.5],  warm: 0.05 },
  near: { per: 70000, r: [1.1, 1.7],  opacity: [0.35, 0.6],  warm: 0.18 }
};

export function init() {
  const layers = $$('.sky-layer').map((element) => ({
    element, rate: parseFloat(element.dataset.rate), kind: KINDS[element.dataset.kind]
  }));
  if (!layers.length) return;

  let width = 0;
  let height = 0;
  function build() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // phones resize the window as the address bar shows and hides; keep the stars through that
    if (width === w && h <= height && h > height - 140) return;
    width = w;
    height = h;
    const random = seeded(23);
    layers.forEach(({ element, kind }) => {
      element.replaceChildren();
      element.setAttribute('viewBox', `0 0 ${w} ${2 * h}`);
      element.style.height = `${2 * h}px`;
      const count = Math.round((w * h) / kind.per);
      for (let i = 0; i < count; i++) {
        const x = (random() * w).toFixed(1);
        const y = random() * h;
        const star = {
          cx: x,
          r: (kind.r[0] + random() * (kind.r[1] - kind.r[0])).toFixed(2),
          fill: random() < kind.warm ? '#FFBA42' : '#E8ECF8',
          opacity: (kind.opacity[0] + random() * (kind.opacity[1] - kind.opacity[0])).toFixed(2)
        };
        element.appendChild(svg('circle', { ...star, cy: y.toFixed(1) }));
        element.appendChild(svg('circle', { ...star, cy: (y + h).toFixed(1) }));
      }
    });
  }
  build();
  onLayout(build);

  if (reduce) return;
  onFrame((y) => {
    layers.forEach(({ element, rate }) => {
      element.style.transform = `translate3d(0,${(-((y * rate) % height)).toFixed(1)}px,0)`;
    });
  });
}
