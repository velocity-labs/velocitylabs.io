import { $$ } from '../lib/dom.js';
import { onLayout } from '../lib/frame.js';

// Elements marked data-reveal wait hidden (see _motion.scss) until they scroll
// into view, then get .in, which plays their entrance
export function init() {
  if (!document.documentElement.classList.contains('motion')) return;
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  // arc items spin into place around their group's center, like bodies settling
  // into orbit: aim each one's rotation and pivot at that center
  const arcs = targets
    .filter((element) => element.dataset.reveal === 'arc')
    .map((element) => ({ element, group: element.closest('[data-arc-group]') || element.parentElement }));
  const aim = () => arcs.forEach(({ element, group }) => {
    if (element.classList.contains('in')) return;
    const cx = group.offsetWidth / 2;
    const cy = group.offsetHeight / 2;
    const ex = element.offsetLeft + element.offsetWidth / 2;
    const ey = element.offsetTop + element.offsetHeight / 2;
    let r = Math.hypot(ex - cx, ey - cy);
    let px = cx;
    let py = cy;
    // too near the center to swing visibly: pivot on a point far below instead
    if (r < 60) {
      py = cy + 420;
      r = Math.hypot(ex - px, ey - py);
    }
    const degrees = -Math.min(24, (150 / r) * 57.3);
    element.style.transformOrigin = `${(px - element.offsetLeft).toFixed(1)}px ${(py - element.offsetTop).toFixed(1)}px`;
    element.style.setProperty('--rot', `${degrees.toFixed(2)}deg`);
  });
  onLayout(aim);

  if (!('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  targets.forEach((element) => observer.observe(element));
}
