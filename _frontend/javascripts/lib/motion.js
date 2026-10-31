export const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Background tabs pause animation frames, so play the load moment when the tab
// is first seen
export function whenSeen(callback) {
  if (!document.hidden) {
    requestAnimationFrame(callback);
    return;
  }
  document.addEventListener('visibilitychange', function seen() {
    if (document.hidden) return;
    document.removeEventListener('visibilitychange', seen);
    requestAnimationFrame(callback);
  });
}
