import { $, $$, clamp01, absTop } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// Numbered steps (_includes/blocks/steps.html): a satellite carries the sun
// along the line from step to step, lighting the line behind it and each
// number it reaches
export function init() {
  const wrap = $('.steps-wrap');
  if (!wrap || reduce) return;
  const line = $('.steps-line', wrap);
  const fill = $('.steps-fill', wrap);
  const satellite = $('.steps-sat', wrap);
  const items = $$('.steps li', wrap);

  let top = 0;
  let width = 0;
  onLayout(() => {
    top = absTop(wrap);
    width = line.offsetWidth; // 0 once the steps stack and the line is hidden
  });
  onFrame((y, vh) => {
    if (!width) return;
    const progress = clamp01((y + vh * 0.78 - top) / (vh * 0.5));
    satellite.style.transform = `translate3d(${(progress * width).toFixed(1)}px,0,0)`;
    fill.style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(2)}% 0 0)`;
    items.forEach((item, i) => {
      item.classList.toggle('lit', progress >= i / (items.length - 1) - 0.02 && progress > 0.01);
    });
  });
}
