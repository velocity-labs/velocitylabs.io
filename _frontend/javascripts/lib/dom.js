export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

export const clamp01 = (value) => Math.max(0, Math.min(1, value));
export const ease = (t) => 1 - Math.pow(1 - t, 3);

// An element's distance from the top of the page
export const absTop = (element) => element.getBoundingClientRect().top + window.scrollY;

export function svg(name, attributes = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const key in attributes) node.setAttribute(key, attributes[key]);
  return node;
}

// Seeded random numbers, so the stars land in the same places on every visit
export function seeded(seed) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
