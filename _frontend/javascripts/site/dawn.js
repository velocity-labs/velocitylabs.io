import { $, clamp01, ease, absTop } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// The sun rises over the contact panel (_includes/blocks/contact.html) as the
// reader arrives
export function init() {
  const dawn = $('.dawn');
  if (!dawn || reduce) return;
  const wrap = dawn.parentNode;

  let top = 0;
  onLayout(() => { top = absTop(wrap); });
  onFrame((y, vh) => {
    const risen = clamp01((y + vh - top) / (vh * 0.75));
    dawn.style.transform = `translate3d(0,${((1 - ease(risen)) * 140).toFixed(1)}px,0)`;
  });
}
