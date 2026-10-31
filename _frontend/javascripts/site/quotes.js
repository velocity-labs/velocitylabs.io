import { $$, clamp01, absTop } from '../lib/dom.js';
import { reduce } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// Quote bands (_includes/blocks/quote.html): light sweeps across the words as
// the reader scrolls past
export function init() {
  if (reduce) return;
  const quotes = $$('[data-sweep]').map((paragraph) => ({ paragraph, words: [], top: 0, height: 0, lit: -1 }));
  if (!quotes.length) return;

  // split each quote into words; screen readers get the whole quote once
  quotes.forEach((quote) => {
    const text = quote.paragraph.textContent;
    quote.paragraph.textContent = '';
    const whole = document.createElement('span');
    whole.className = 'sr';
    whole.textContent = text;
    quote.paragraph.appendChild(whole);
    text.split(/(\s+)/).forEach((part) => {
      if (!part || /^\s+$/.test(part)) {
        quote.paragraph.appendChild(document.createTextNode(part));
        return;
      }
      const word = document.createElement('span');
      word.className = 'w';
      word.setAttribute('aria-hidden', 'true');
      word.textContent = part;
      quote.paragraph.appendChild(word);
      quote.words.push(word);
    });
  });

  onLayout(() => quotes.forEach((quote) => {
    quote.top = absTop(quote.paragraph);
    quote.height = quote.paragraph.offsetHeight;
  }));
  onFrame((y, vh) => {
    quotes.forEach((quote) => {
      const lit = clamp01((y + vh * 0.85 - quote.top) / (vh * 0.5 + quote.height * 0.5));
      if (lit === quote.lit) return; // nothing to do once a quote is fully dark or fully lit
      quote.lit = lit;
      const span = quote.words.length + 6;
      // unlit words stay bright enough to pass contrast as large text
      quote.words.forEach((word, i) => {
        word.style.opacity = (0.45 + 0.55 * clamp01((lit * span - i) / 6)).toFixed(3);
      });
    });
  });
}
