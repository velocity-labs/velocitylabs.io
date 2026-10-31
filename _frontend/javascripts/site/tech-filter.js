import { $$ } from '../lib/dom.js';

// The portfolio's technology filter. Technology pills across the site link to
// /portfolio/?tech=<slug>, which opens with that technology chosen; the
// buttons switch technologies in place and keep the address in step.
export function init() {
  const filter = document.querySelector('[data-tech-filter]');
  if (!filter) return;
  const buttons = $$('button[data-tech]', filter);
  const cards = $$('[data-techs]');
  const unfiltered = $$('[data-unfiltered]');
  const status = filter.querySelector('[role="status"]');

  // shows the cards that use the technology (all of them for ''), and returns
  // the slug it chose ('' for one the filter doesn't list)
  const choose = (slug) => {
    const button = buttons.find((candidate) => candidate.dataset.tech === slug) || buttons[0];
    const chosen = button.dataset.tech;
    buttons.forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
    let shown = 0;
    cards.forEach((card) => {
      card.hidden = Boolean(chosen) && !card.dataset.techs.split(' ').includes(chosen);
      if (!card.hidden) shown += 1;
    });
    unfiltered.forEach((element) => { element.hidden = Boolean(chosen); });
    status.textContent = chosen
      ? `${shown} ${shown === 1 ? 'project uses' : 'projects use'} ${button.textContent}.`
      : `Showing all ${shown} projects.`;
    return chosen;
  };

  const address = (chosen) => {
    const url = new URL(window.location.href);
    if (chosen) url.searchParams.set('tech', chosen);
    else url.searchParams.delete('tech');
    window.history.replaceState(window.history.state, '', url);
  };

  const requested = new URL(window.location.href).searchParams.get('tech');
  const chosen = choose(requested || '');
  // an old or mistyped technology shows everything, so drop it from the address
  if (requested !== null && !chosen) address('');
  filter.hidden = false;

  filter.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-tech]');
    if (!button) return;
    address(choose(button.dataset.tech));
    // cards coming back into view appear at once rather than waiting to reveal
    cards.forEach((card) => card.classList.add('in'));
  });
}
