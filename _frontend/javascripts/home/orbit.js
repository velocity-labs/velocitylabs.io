import { $, $$, svg, clamp01, ease, seeded } from '../lib/dom.js';
import { reduce, whenSeen } from '../lib/motion.js';
import { onLayout, onFrame } from '../lib/frame.js';

// The home hero's orbit (_includes/home/hero.html). One planet per orbit, one
// per service. The orbits are circles on a plane tipped away from the viewer
// and seen in perspective, so planets grow as they come round the near side and
// shrink as they recede; the near half of each orbit passes in front of the sun
// and the far half behind it. Inner planets go round faster (Kepler: the period
// grows with distance^1.5), and everything holds still while a planet is
// hovered or focused.
const CX = 308;
const CY = 300;
const TILT = -16 * Math.PI / 180;
const INCLINE = 62 * Math.PI / 180;
const EYE = 900;
const PERIOD = 180; // seconds per turn of the innermost orbit

// What comes after building the app, ordered by how long each usually takes:
// the shortest engagement on the inner, fastest orbit, ongoing maintenance on
// the outer, slowest one. _data/services.yml assigns each service its orbit.
// The gaps between orbits widen outward, like the real solar system. angle is
// where the planet starts (0 = right, 90 = nearest the viewer).
const ORBITS = {
  1: { dist: 81, angle: 210, r: 6 },
  2: { dist: 111, angle: 30, r: 7 },
  3: { dist: 147, angle: 130, r: 8 },
  4: { dist: 187, angle: 300, r: 9 },
  5: { dist: 234, angle: 75, r: 10 },
  6: { dist: 288, angle: 250, r: 11 }
};

export function init() {
  const orbit = document.getElementById('orbit');
  if (!orbit) return;
  const hero = orbit.closest('.hero');

  // the planets are the services list's items (data-orbit), innermost first
  const bodies = $$('[data-orbit]')
    .map((item) => ({ name: item.dataset.planet, sub: item.dataset.planetSub, href: `#${item.id}`, ...ORBITS[item.dataset.orbit] }))
    .sort((a, b) => a.dist - b.dist);
  bodies.forEach((body) => {
    body.speed = 360 / (PERIOD * Math.pow(body.dist / bodies[0].dist, 1.5)); // degrees per second
  });
  const reach = bodies[bodies.length - 1].dist * Math.sin(INCLINE); // how far the outer orbit comes toward the viewer

  function point(body, degrees) {
    const t = degrees * Math.PI / 180;
    const x = body.dist * Math.cos(t);
    const y = body.dist * Math.sin(t); // on the orbit's own plane
    const z = y * Math.sin(INCLINE);   // toward the viewer
    const f = EYE / (EYE - z);         // perspective: nearer looks bigger
    const u = x * f;
    const v = y * Math.cos(INCLINE) * f;
    return {
      x: CX + u * Math.cos(TILT) - v * Math.sin(TILT),
      y: CY + u * Math.sin(TILT) + v * Math.cos(TILT),
      depth: z / reach, // 1 nearest the viewer, -1 farthest away (on the outer orbit)
      scale: f
    };
  }
  // half an orbit as a path: 0 to 180 degrees is the near half, 180 to 360 the far half
  function halfOrbit(body, from) {
    let d = '';
    for (let i = 0; i <= 48; i++) {
      const p = point(body, from + i * 180 / 48);
      d += `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    }
    return d;
  }

  // back to front: far orbit halves, far planets, the sun, near orbit halves, near planets
  const backRings = svg('g');
  const backBodies = svg('g');
  const frontRings = svg('g');
  const frontBodies = svg('g');
  $('#back', orbit).append(backRings, backBodies);
  $('#front', orbit).append(frontRings, frontBodies);

  const held = () => nodes.some((n) => n.hover || n.focus);
  const nodes = bodies.map((body) => {
    const far = svg('path', { class: 'ring far', d: halfOrbit(body, 180) });
    const near = svg('path', { class: 'ring', d: halfOrbit(body, 0) });
    backRings.appendChild(far);
    frontRings.appendChild(near);
    const link = svg('a', { href: body.href, class: 'orbit-link', 'aria-label': `${body.name}: ${body.sub}` });
    const hit = svg('circle', { r: 26, class: 'hit' });
    const halo = svg('circle', { r: body.r + 7, class: 'halo' });
    const dot = svg('circle', { r: body.r, class: 'body-dot' });
    const tag = svg('g');
    const label = svg('text', { class: 'label', 'text-anchor': 'middle' });
    label.textContent = body.name;
    const sub = svg('text', { class: 'label-sub', 'text-anchor': 'middle', y: 16 });
    sub.textContent = body.sub;
    tag.append(label, sub);
    link.append(hit, halo, dot, tag);
    const node = {
      body, link, rings: [far, near], hit, halo, dot, tag, label, sub,
      load: 0, show: 1, fade: 1, depth: 0, fontSize: 15, w: 0, h: 15, hover: false, focus: false
    };
    // the hovered or keyboard-focused planet and its orbit light up
    const sync = () => {
      const hot = node.hover || node.focus;
      link.classList.toggle('hot', hot);
      node.rings.forEach((ring) => ring.classList.toggle('hot', hot));
      orbit.classList.toggle('focus', held());
    };
    link.addEventListener('mouseenter', () => { node.hover = true; sync(); });
    link.addEventListener('mouseleave', () => { node.hover = false; sync(); });
    link.addEventListener('focus', () => { node.focus = link.matches(':focus-visible'); sync(); });
    link.addEventListener('blur', () => { node.focus = false; sync(); });
    link.addEventListener('click', () => { node.hover = false; sync(); });
    return node;
  });

  // labels sit just outside the planet, on the side facing away from the sun, so they never flip sides
  function labelSpot(node, p, scale, turn) {
    const a = Math.atan2(p.y - CY, p.x - CX) + turn;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const d = clearance(Math.abs(ux), Math.abs(uy), node.w / 2, node.h / 2, node.body.r * scale + 8);
    return { x: p.x + ux * d, y: p.y + uy * d };
  }
  // how far out a label's center sits, in direction (ux, uy), to keep its box r away from the planet:
  // where that direction leaves the box grown by r all round (with rounded corners)
  function clearance(ux, uy, hw, hh, r) {
    if (uy * (hw + r) <= ux * hh) return (hw + r) / ux; // out through a side
    if (ux * (hh + r) <= uy * hw) return (hh + r) / uy; // out through the top or bottom
    const b = ux * hw + uy * hh;
    return b + Math.sqrt(Math.max(0, b * b - hw * hw - hh * hh + r * r)); // around a corner
  }
  // where that would run out of the frame at the left or right edge, the label instead swings once
  // around the inner side of its planet while the planet passes the edge
  const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
  function swing(node, degrees) {
    if (!node.edge) return 0;
    const t = ((degrees % 360) + 360) % 360;
    const left = t - 180;
    const right = t > 180 ? t - 360 : t;
    const off = Math.abs(left) < node.edge ? left : Math.abs(right) < node.edge ? right : null;
    return off === null ? 0 : 2 * Math.PI * smooth((node.edge - off) / (2 * node.edge));
  }

  // label sizes, for placing labels and spotting overlaps (they change at the phone breakpoint), and
  // how far labels keep from the frame's sides (phones run the orbit to the screen's edges)
  let inset = 0;
  function measureLabels() {
    inset = parseFloat(getComputedStyle(orbit).getPropertyValue('--label-inset')) || 0;
    nodes.forEach((node) => {
      node.fontSize = parseFloat(getComputedStyle(node.label).fontSize) || 15;
      node.subOn = getComputedStyle(node.sub).display !== 'none';
      node.w = Math.max(node.label.getComputedTextLength(), node.subOn ? node.sub.getComputedTextLength() : 0);
      node.h = node.fontSize + (node.subOn ? 16 : 0);
      // how many degrees either side of an edge the label needs to swing (0 if it always fits)
      node.edge = 0;
      for (let d = 0; d <= 90; d++) {
        [180 + d, 180 - d, d, -d].forEach((degrees) => {
          const q = point(node.body, degrees);
          const c = labelSpot(node, q, q.scale, 0);
          if (c.x - node.w / 2 < inset || c.x + node.w / 2 > 640 - inset) node.edge = Math.max(node.edge, d + 15);
        });
      }
    });
  }

  function placeLabel(node, p, scale, degrees) {
    const c = labelSpot(node, p, scale, swing(node, degrees));
    c.x = Math.min(Math.max(c.x, inset + node.w / 2), 640 - inset - node.w / 2); // mid-swing, above or below the planet, stay inside the frame
    const base = c.y - node.h / 2 + node.fontSize * 0.8;
    // browsers snap level text to whole pixels vertically, so a slowly moving label steps while its
    // planet glides; a hair of rotation (too small to see) turns that snapping off
    node.tag.setAttribute('transform', `translate(${c.x.toFixed(2)} ${base.toFixed(2)}) rotate(.05)`);
    node.box = { x: c.x - node.w / 2, y: c.y - node.h / 2, w: node.w, h: node.h };
  }
  const overlap = (p, q) => p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
  // does planet n's dot touch a label box?
  function covers(node, box) {
    const dx = Math.max(box.x - node.p.x, 0, node.p.x - box.x - box.w);
    const dy = Math.max(box.y - node.p.y, 0, node.p.y - box.y - box.h);
    return dx * dx + dy * dy < node.size * node.size;
  }

  let spin = 0;
  let driftSec = 0;
  let ringLoad = 0;
  let ringScroll = 0;
  let order = '';
  function draw() {
    nodes.forEach((node) => {
      const degrees = node.body.angle - node.body.speed * (spin + driftSec) + node.load;
      const p = point(node.body, degrees);
      const scale = p.scale; // nearer planets look bigger (and brighter, below)
      node.depth = p.depth;
      node.p = p;
      node.size = node.body.r * scale;
      [node.hit, node.halo, node.dot].forEach((circle) => {
        circle.setAttribute('cx', p.x.toFixed(2));
        circle.setAttribute('cy', p.y.toFixed(2));
      });
      node.dot.setAttribute('r', (node.body.r * scale).toFixed(2));
      node.halo.setAttribute('r', (node.body.r * scale + 7).toFixed(2));
      node.link.style.opacity = node.hover || node.focus ? 1 : (0.85 + 0.15 * p.depth).toFixed(3);
      placeLabel(node, p, scale, degrees);
    });
    // where two labels cross, the farther planet's label fades (a hovered one always stays),
    // and so does a label while a nearer planet passes in front of it
    nodes.forEach((node) => { node.want = 1; });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const m = nodes[i];
        const k = nodes[j];
        if (!overlap(m.box, k.box)) continue;
        const behind = m.hover || m.focus ? k : k.hover || k.focus ? m : m.depth < k.depth ? m : k;
        behind.want = 0.12;
      }
    }
    nodes.forEach((m) => {
      if (m.hover || m.focus) return;
      nodes.forEach((k) => { if (k.depth > m.depth && covers(k, m.box)) m.want = 0.12; });
    });
    nodes.forEach((node, i) => {
      node.fade += (node.want - node.fade) * 0.15;
      node.tag.style.opacity = (node.show * node.fade).toFixed(3);
      const offset = (ringLoad * (6 - i) * 0.5 - ringScroll * (1 - i * 0.1)).toFixed(2);
      node.rings.forEach((ring) => { ring.style.strokeDashoffset = offset; });
    });
    // nearer planets draw over farther ones, and over the sun on the near half of their orbit
    if (held()) return;
    const sorted = nodes.slice().sort((p, q) => p.depth - q.depth);
    const key = sorted.map((node) => (node.depth < 0 ? 'b' : 'f') + node.body.dist).join();
    if (key === order) return;
    order = key;
    sorted.forEach((node) => (node.depth < 0 ? backBodies : frontBodies).appendChild(node.link));
  }

  if (!reduce) {
    nodes.forEach((node) => { node.load = 140; node.show = 0; });
    ringLoad = 22;
  }
  draw();
  measureLabels();
  draw();
  onLayout(() => { measureLabels(); draw(); });

  // the hero's own sparse field of stars (closest layer)
  const stars = $('#stars', hero);
  const random = seeded(7);
  for (let i = 0; i < 70; i++) {
    stars.appendChild(svg('circle', {
      cx: (random() * 1000).toFixed(1), cy: (random() * 600).toFixed(1),
      r: (random() * 1.1 + 0.3).toFixed(2), fill: '#E8ECF8', opacity: (random() * 0.35 + 0.08).toFixed(2)
    }));
  }

  if (reduce) return;

  // planets swing into place on load, then keep slowly orbiting while the hero is on screen
  let inView = true;
  new IntersectionObserver((entries) => { inView = entries[0].isIntersecting; }).observe(orbit);
  whenSeen(() => {
    let start = null;
    let last = null;
    let pace = 1;
    const duration = 2200;
    requestAnimationFrame(function step(ts) {
      if (start === null) start = last = ts;
      const t = Math.min(1, (ts - start) / duration);
      nodes.forEach((node, i) => {
        const lag = i * 0.06;
        const lt = clamp01((t - lag) / (1 - lag));
        node.load = 140 * (1 - ease(lt));
        node.show = clamp01((lt - 0.75) / 0.25);
      });
      ringLoad = 22 * (1 - ease(t));
      // ease to a stop while a planet is hovered or focused, so it is easy to read and click
      const dt = Math.min(0.1, (ts - last) / 1000);
      last = ts;
      pace += ((held() ? 0 : 1) - pace) * Math.min(1, dt * 6);
      spin += dt * pace;
      if (inView) draw();
      requestAnimationFrame(step);
    });
  });

  // scrolling away: the stars lag, the orbit recedes and keeps turning, and the
  // copy drifts a little slower than the page
  const copy = $('.hero-copy', hero);
  const figure = $('.orbit-figure', hero);
  const stacked = window.matchMedia('(max-width: 960px)');
  let heroHeight = 0;
  onLayout(() => { heroHeight = hero.offsetHeight; });
  onFrame((y, vh) => {
    if (y >= heroHeight + vh) return;
    const progress = clamp01(y / heroHeight);
    stars.style.transform = `translate3d(0,${(y * 0.5).toFixed(1)}px,0)`;
    if (stacked.matches) {
      // narrow screens stack the orbit above the copy, so both stay put instead of sliding into each other
      figure.style.transform = copy.style.transform = figure.style.opacity = copy.style.opacity = '';
    } else {
      figure.style.transform = `translate3d(0,${(progress * heroHeight * 0.3).toFixed(1)}px,0) scale(${(1 - 0.12 * progress).toFixed(4)})`;
      figure.style.opacity = (1 - 0.55 * progress).toFixed(3);
      copy.style.transform = `translate3d(0,${(progress * heroHeight * 0.12).toFixed(1)}px,0)`;
      copy.style.opacity = (1 - 0.35 * progress).toFixed(3);
    }
    driftSec = 12 * progress;
    ringScroll = y * 0.05;
  });
}
