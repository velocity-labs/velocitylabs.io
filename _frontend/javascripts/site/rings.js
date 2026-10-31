import { $$, absTop } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// Decorative rings (_includes/blocks/deco.html) keep turning as the reader scrolls
export function init() {
  if (reduce) return;
  const decos = $$('.deco svg').map((graphic) => ({ graphic, section: graphic.closest('section'), top: 0 }));
  if (!decos.length) return;

  onLayout(() => decos.forEach((deco) => { deco.top = absTop(deco.section); }));
  onFrame((y, vh) => decos.forEach((deco) => {
    const offset = y - deco.top;
    if (Math.abs(offset) < vh * 2) deco.graphic.style.transform = `rotate(${(offset * 0.045).toFixed(2)}deg)`;
  }));
}
