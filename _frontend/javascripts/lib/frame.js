// One scroll loop for every scroll-linked effect. An effect registers a layout
// function (reads sizes and positions; runs on start, resize, load and once the
// fonts arrive) and a frame function (writes styles; runs at most once per
// animation frame while the page scrolls, with the scroll position and window
// height).
const layouts = [];
const frames = [];
let started = false;
let pending = false;

function runFrames() {
  pending = false;
  const y = window.scrollY;
  const vh = window.innerHeight;
  frames.forEach((frame) => frame(y, vh));
}

export function requestFrame() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(runFrames);
}

function relayout() {
  layouts.forEach((layout) => layout());
  requestFrame();
}

// Effects that register after the loop has started (the home page's own script)
// are measured right away
export function onLayout(layout) {
  layouts.push(layout);
  if (started) {
    layout();
    requestFrame();
  }
}

export function onFrame(frame) {
  frames.push(frame);
  if (started) requestFrame();
}

export function start() {
  started = true;
  relayout();
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  document.fonts?.ready.then(relayout);
}
