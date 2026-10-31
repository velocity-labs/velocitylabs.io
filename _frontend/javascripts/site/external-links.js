import { $$ } from '../lib/dom.js';

// Links in a post that leave the site open in a new tab
export function init() {
  $$('.post-body a[href]').forEach((link) => {
    if (!/^https?:$/.test(link.protocol) || link.host === location.host) return;
    link.target = '_blank';
    const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('external');
    link.setAttribute('rel', [...rel].join(' '));
  });
}
