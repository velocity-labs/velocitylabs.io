// Runs on every page. Each effect does nothing on pages without its element.
import { start as startFrames } from '../javascripts/lib/frame.js';
import { whenSeen } from '../javascripts/lib/motion.js';
import { init as initConsent } from '../javascripts/site/consent.js';
import { init as initMenu } from '../javascripts/site/menu.js';
import { init as initExternalLinks } from '../javascripts/site/external-links.js';
import { init as initReveals } from '../javascripts/site/reveals.js';
import { init as initSky } from '../javascripts/site/sky.js';
import { init as initRail } from '../javascripts/site/rail.js';
import { init as initQuotes } from '../javascripts/site/quotes.js';
import { init as initRings } from '../javascripts/site/rings.js';
import { init as initSteps } from '../javascripts/site/steps.js';
import { init as initMoons } from '../javascripts/site/moons.js';
import { init as initDawn } from '../javascripts/site/dawn.js';

// the failsafe in base.html shows everything if this never runs
window.orbitStarted = true;

initConsent();
initMenu();
initExternalLinks();
initSky();
initRail();
initQuotes();
initRings();
initSteps();
initMoons();
initDawn();
startFrames();

// the load moment: hero copy and page titles rise in, and reveals begin, once the tab is seen
const root = document.documentElement;
if (root.classList.contains('motion')) {
  whenSeen(() => {
    root.classList.add('go');
    initReveals();
  });
}

// loaded only on pages that have a contact form
const form = document.querySelector('[data-contact-form]');
if (form) import('../javascripts/site/contact-form.js').then(({ init }) => init(form));
