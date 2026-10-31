import { $, $$, clamp01, absTop } from '../lib/dom.js';
import { onLayout, onFrame } from '../lib/frame.js';

// Scroll progress (_includes/site/sky.html): a sun travels the right edge, and
// a tick for each main > section[id] lights up once the reader reaches it
export function init() {
  const rail = $('.rail');
  if (!rail) return;
  const fill = $('.rail-fill', rail);
  const sun = $('.rail-sun', rail);
  const ticks = $$('main > section[id]').map((section) => {
    const tick = document.createElement('span');
    tick.className = 'rail-tick';
    rail.insertBefore(tick, sun);
    return { section, tick, at: 0 };
  });

  let max = 1;
  let height = 0;
  onLayout(() => {
    const vh = window.innerHeight;
    max = Math.max(1, document.documentElement.scrollHeight - vh);
    height = rail.offsetHeight;
    ticks.forEach((t) => {
      t.at = clamp01((absTop(t.section) - vh * 0.3) / max);
      t.tick.style.transform = `translate3d(0,${(t.at * height).toFixed(1)}px,0)`;
    });
  });
  onFrame((y) => {
    const progress = clamp01(y / max);
    fill.style.transform = `scaleY(${progress.toFixed(4)})`;
    sun.style.transform = `translate3d(0,${(progress * height).toFixed(1)}px,0)`;
    ticks.forEach((t) => t.tick.classList.toggle('lit', progress + 0.002 >= t.at));
  });
}
