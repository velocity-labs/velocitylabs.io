import { $$, absTop } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// A moon circles each team photo (_includes/home/team.html) as the reader scrolls
export function init() {
  if (reduce) return;
  const moons = $$('.moon');
  if (!moons.length) return;
  const section = moons[0].closest('section');

  let top = 0;
  onLayout(() => { top = absTop(section); });
  onFrame((y, vh) => {
    if (Math.abs(y - top) >= vh * 2) return;
    moons.forEach((moon, i) => {
      moon.style.transform = `rotate(${((y - top) * 0.25 + 40 + i * 150).toFixed(1)}deg)`;
    });
  });
}
