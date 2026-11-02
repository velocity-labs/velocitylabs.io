import { svg, clamp01, ease } from '../lib/dom.js';

// Easter egg: click "Your app" and the sun lives out a massive star's
// death in about twelve seconds. It swells into a red supergiant and swallows
// the planets whose orbits it reaches, its core falls in, it blows apart as a
// supernova that rocks the whole page, and a black hole is left in the nebula, slowly drawing the
// surviving orbits in, until the "Rescue it" planet dives into it and lights
// the sun back up. Esc cuts it short. Desktop only (it needs a mouse and the
// side-by-side hero); home/orbit.js skips it for reduced motion.
//
// The star is the orbit svg's own sun circle, restyled. Everything else (the
// collapse, the flash, the debris, the nebula and the black hole) is drawn on a
// canvas behind the svg (.nova-sky), in the svg's own units. The black hole's
// disk lies in the orbits' plane, seen through orbit.js's projection, with the
// far side's light bent up over the top the way a real one looks. Planets are
// orbit.js's: `alive` fades a swallowed one out and `pull` draws one in.

// $stack is 960px: below it the hero stacks and the orbit fills a phone screen
const DESKTOP = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 961px)');

// The timeline, in seconds
const SWELL = 3;            // the red supergiant at full size
const COLLAPSE = 3.55;      // its core has fallen in
const BANG = 3.7;           // supernova
const HOLE_IN = [4.1, 5.6]; // the black hole shows through the glare
const RESCUE = 8.6;         // "Rescue it" heads for the black hole
const ARRIVE = 10;          // and relights the sun
const END = 11.8;

const SUN_R = 26;           // the sun's radius in hero.html
const GLOW_R = 35;
const GIANT = 125;          // past orbits 1 and 2 (81 and 111), short of 3 (147)
const SHADOW_R = 14;        // the black hole's shadow
const DISK_IN = 17;         // its accretion disk's edges
const DISK_OUT = 62;

const SUN = [255, 186, 66];
// the swelling star cools from yellow to deep red, darker toward its edge
const SURFACE = [[0, SUN], [0.35, [255, 142, 60]], [0.7, [236, 92, 50]], [1, [208, 60, 44]]];
const LIMB = [[0, SUN], [0.4, [214, 90, 42]], [1, [128, 24, 30]]];
const HOT = [214, 232, 255]; // the collapsing core, blue-white
// debris cools as it flies: white, gold, orange, red, then a violet glow
const EMBERS = [[0, [104, 60, 170]], [0.15, [186, 60, 124]], [0.3, [236, 92, 60]], [0.5, [255, 160, 80]], [0.75, [255, 226, 160]], [1, [255, 255, 255]]];
// the accretion disk, white-hot at its inner edge, red at its rim
const DISK = [[0, [255, 250, 236]], [0.22, [255, 222, 150]], [0.55, [255, 158, 76]], [1, [204, 78, 46]]];

const mix = (a, b, t) => a + (b - a) * t;
const mixRGB = (a, b, t) => a.map((v, i) => Math.round(mix(v, b[i], t)));
const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const span = (t, from, to) => clamp01((t - from) / (to - from)); // 0 before from, 1 after to
const smooth = (x) => x * x * (3 - 2 * x);
const easeIn = (x) => x * x * x;
const overshoot = (x) => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2);
const gauss = () => Math.random() + Math.random() + Math.random() - 1.5; // roughly normal, -1.5 to 1.5
function ramp(stops, t) {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) return mixRGB(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  }
  return stops[stops.length - 1][1];
}
const around = (cx, cy, k) => `translate(${cx} ${cy}) scale(${k.toFixed(4)}) translate(${-cx} ${-cy})`;

export function supernova({ orbit, nodes, project, tilt, cx, cy }) {
  const core = orbit.querySelector('#core');
  const [glow, sun] = core.querySelectorAll('circle');
  const label = core.querySelector('.core-label');
  const layers = [orbit.querySelector('#back'), orbit.querySelector('#front')];
  const figure = orbit.closest('.orbit-figure');
  // the blast rocks the whole page: the stars, the header and everything in main
  // (the fixed rail and cookie banner are left alone, so they stay put on screen)
  const page = ['.sky', 'header', 'main'].map((selector) => document.querySelector(selector)).filter(Boolean);
  let running = false;

  core.addEventListener('click', () => {
    if (running || !DESKTOP.matches) return;
    running = true;
    orbit.classList.add('nova'); // home/flares.js stands down while the show is on
    play(() => {
      orbit.classList.remove('nova');
      running = false;
    });
  });

  function play(done) {
    const scene = buildScene();
    const sky = buildSky();
    const rescuer = nodes.find((node) => node.body.href === '#project-rescue') ?? nodes[nodes.length - 1];
    let t = 0;
    let last = null;
    let debris = null;
    let gas = null;
    let cut = false;
    const onKey = (event) => { if (event.key === 'Escape') cut = true; };
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function step(ts) {
      // a background tab pauses the show rather than skipping it
      const dt = last === null ? 0 : Math.min(0.05, (ts - last) / 1000);
      last = ts;
      t += dt;
      if (t >= BANG && !debris) {
        debris = sky.burst();
        gas = sky.nebula();
      }

      const r = starRadius(t);
      drawStar(scene, t, r);
      movePlanets(t, dt, r, rescuer);
      const jolt = shake(t);
      page.forEach((element) => { element.style.transform = jolt; });
      document.documentElement.style.overflowX = jolt ? 'hidden' : ''; // no scrollbar popping in as the page shifts sideways
      sky.draw(t, dt, r, debris, gas);

      if (t < END && !cut) {
        requestAnimationFrame(step);
      } else {
        document.removeEventListener('keydown', onKey);
        restore(scene, sky, rescuer);
        done();
      }
    });
  }

  // the star's radius: it swells, shudders, falls in to a point, and after the
  // black hole's turn comes back as the sun
  function starRadius(t) {
    if (t < SWELL) {
      let r = mix(SUN_R, GIANT, smooth(t / SWELL));
      const shudder = t - (SWELL - 0.8); // faster and harder just before the collapse
      if (shudder > 0) r *= 1 + 0.06 * (shudder / 0.8) * Math.sin(2 * Math.PI * (3 * shudder + 5 * shudder * shudder));
      return r;
    }
    if (t < COLLAPSE) return Math.max(2.4, GIANT * (1 - easeIn(span(t, SWELL, COLLAPSE))));
    if (t < BANG) return 2.4;
    if (t < ARRIVE) return 0;
    return SUN_R * overshoot(span(t, ARRIVE, ARRIVE + 0.9));
  }

  // how far in the black hole has come (0 to 1) and how big it is drawn
  function holeAt(t) {
    const grow = ease(span(t, HOLE_IN[0], HOLE_IN[1]));
    const k = grow * (1 - span(t, ARRIVE, ARRIVE + 0.45));
    return { k, s: t < ARRIVE ? 0.3 + 0.7 * grow : k };
  }

  function buildScene() {
    const saved = {
      sun: { r: sun.getAttribute('r'), fill: sun.getAttribute('fill') },
      glow: { r: glow.getAttribute('r'), fill: glow.getAttribute('fill'), opacity: glow.getAttribute('opacity') }
    };
    const defs = svg('defs');

    // the supergiant's face: darker toward the edge, with a few huge boiling
    // convection cells (two drifting copies of one noise, blended) that also
    // ripple its outline
    const surface = svg('radialGradient', { id: 'nova-surface' });
    const stops = [0, 0.65, 1].map((offset) => svg('stop', { offset }));
    surface.append(...stops);
    const boil = svg('filter', { id: 'nova-boil', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    const noise = svg('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.03, numOctaves: 2, seed: 4, result: 'noise' });
    const driftA = svg('feOffset', { in: 'noise', result: 'a' });
    const driftB = svg('feOffset', { in: 'noise', result: 'b' });
    const blend = svg('feComposite', { in: 'a', in2: 'b', operator: 'arithmetic', k2: 0.5, k3: 0.5, result: 'cells' });
    const warp = svg('feDisplacementMap', { in: 'SourceGraphic', in2: 'cells', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G', result: 'star' });
    const shade = svg('feColorMatrix', { in: 'cells', type: 'matrix', values: '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 0', result: 'shade' });
    const spots = svg('feComposite', { in: 'shade', in2: 'star', operator: 'in', result: 'spots' });
    const merge = svg('feMerge');
    merge.append(svg('feMergeNode', { in: 'star' }), svg('feMergeNode', { in: 'spots' }));
    boil.append(noise, driftA, driftB, blend, warp, shade, spots, merge);
    defs.append(surface, boil);
    orbit.prepend(defs);
    sun.setAttribute('fill', 'url(#nova-surface)');
    glow.style.animation = sun.style.animation = 'none'; // the sun's heartbeat gives way to the show's own motion

    return { saved, defs, stops, driftA, driftB, warp, shade, boiling: false };
  }

  function drawStar(scene, t, r) {
    const { stops } = scene;
    let surface;
    let limb;
    if (t < SWELL) {
      const u = t / SWELL;
      surface = ramp(SURFACE, u);
      limb = ramp(LIMB, u);
      stops[0].setAttribute('stop-color', rgb(mixRGB(surface, [255, 236, 200], 0.3 * u)));
    } else {
      // the core heats to blue-white as it falls in; after the black hole it's the sun again
      const c = t < ARRIVE ? span(t, SWELL, COLLAPSE) : 0;
      surface = t < ARRIVE ? mixRGB(ramp(SURFACE, 1), HOT, c) : SUN;
      limb = t < ARRIVE ? mixRGB(ramp(LIMB, 1), HOT, c) : SUN;
      stops[0].setAttribute('stop-color', rgb(surface));
    }
    stops[1].setAttribute('stop-color', rgb(surface));
    stops[2].setAttribute('stop-color', rgb(limb));

    sun.setAttribute('r', r.toFixed(2));
    const giant = t < BANG ? r : 0;
    glow.setAttribute('r', (t < ARRIVE ? giant * 1.35 : GLOW_R * overshoot(span(t, ARRIVE, ARRIVE + 0.9))).toFixed(2));
    glow.setAttribute('fill', rgb(t < ARRIVE ? limb : SUN));
    glow.setAttribute('opacity', (t < SWELL ? 0.18 + 0.1 * (t / SWELL) : 0.18).toFixed(3));

    // the surface boils only while it's big enough to see it
    const boiling = t < COLLAPSE;
    if (boiling !== scene.boiling) {
      scene.boiling = boiling;
      if (boiling) sun.setAttribute('filter', 'url(#nova-boil)');
      else sun.removeAttribute('filter');
    }
    if (boiling) {
      scene.driftA.setAttribute('dx', (t * 9).toFixed(2));
      scene.driftA.setAttribute('dy', (t * 4).toFixed(2));
      scene.driftB.setAttribute('dx', (-t * 7).toFixed(2));
      scene.driftB.setAttribute('dy', (t * 6).toFixed(2));
      scene.warp.setAttribute('scale', (Math.max(0, r - SUN_R) * 0.11).toFixed(2));
      // the cells darken in as it grows, so the first frame is still the sun
      const k = smooth(Math.min(1, t / SWELL));
      scene.shade.setAttribute('values', `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${(1.7 * k).toFixed(3)} 0 0 0 ${(-0.76 * k).toFixed(3)}`);
    }

    label.style.opacity = (t < ARRIVE ? 1 - span(t, 0, 0.5) : span(t, ARRIVE + 0.4, ARRIVE + 1)).toFixed(3);
  }

  function movePlanets(t, dt, r, rescuer) {
    nodes.forEach((node) => {
      // the giant swallows every planet whose orbit it reaches; they come back with the sun
      if (t < BANG && !node.swallowed && node.body.dist < r) node.swallowed = true;
      if (node.swallowed) node.alive = t < ARRIVE ? Math.max(0, node.alive - dt / 0.3) : smooth(span(t, ARRIVE + 0.3, ARRIVE + 1.5));
      if (node === rescuer) {
        node.pull = t < ARRIVE ? easeIn(span(t, RESCUE, ARRIVE)) : 0;
        node.alive = t < ARRIVE ? 1 : smooth(span(t, ARRIVE + 0.6, ARRIVE + 1.6));
        node.link.classList.toggle('hot', t >= RESCUE && t < ARRIVE);
      }
      node.link.style.pointerEvents = node.alive < 0.5 ? 'none' : '';
      // dim a swallowed planet's orbit with it
      if (node.swallowed) node.rings.forEach((ring, i) => { ring.style.opacity = ((i ? 1 : 0.5) * node.alive).toFixed(3); });
    });

    // the blast shoves every orbit outward and they settle back; then the black
    // hole slowly draws them in, until the relit sun lets them spring back out
    const a = t - BANG;
    const push = a < 0 ? 1 : 1 + 0.12 * (1 - Math.exp(-a * 14)) * Math.exp(-a * 1.3);
    const drawn = 0.07 * (t < ARRIVE ? smooth(span(t, HOLE_IN[1], RESCUE)) : 1 - overshoot(span(t, ARRIVE, ARRIVE + 1.1)));
    layers.forEach((layer) => layer.setAttribute('transform', around(cx, cy, push * (1 - drawn))));
  }

  // the camera shake: hard at the bang, dying away over most of a second
  function shake(t) {
    const a = t - BANG;
    if (a < 0 || a > 0.95) return '';
    const amp = 11 * Math.pow(1 - a / 0.95, 2);
    return `translate(${((Math.random() * 2 - 1) * amp).toFixed(1)}px, ${((Math.random() * 2 - 1) * amp).toFixed(1)}px)`;
  }

  // the canvas behind the orbit, drawn in the svg's units
  function buildSky() {
    const canvas = document.createElement('canvas');
    canvas.className = 'nova-sky';
    canvas.setAttribute('aria-hidden', 'true');
    figure.prepend(canvas);
    const ctx = canvas.getContext('2d');

    function fit() {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      const w = Math.round(canvas.offsetWidth * dpr);
      const h = Math.round(canvas.offsetHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // the figure may be scaled and moved by the hero's scroll effect; measure through it
      const box = figure.getBoundingClientRect();
      const zoom = box.width / figure.offsetWidth || 1;
      const svgBox = orbit.getBoundingClientRect();
      const view = orbit.viewBox.baseVal;
      const unit = svgBox.width / zoom / view.width;
      const x = (svgBox.left - box.left) / zoom - canvas.offsetLeft - view.x * unit;
      const y = (svgBox.top - box.top) / zoom - canvas.offsetTop - view.y * unit;
      ctx.setTransform(dpr * unit, 0, 0, dpr * unit, dpr * x, dpr * y);
      // the hero clips the blast at its top and bottom; fade it out before those edges instead
      const hero = figure.closest('.hero').getBoundingClientRect();
      const top = (hero.top - box.top) / zoom - canvas.offsetTop;
      const bottom = (hero.bottom - box.top) / zoom - canvas.offsetTop;
      const fade = `linear-gradient(transparent ${top}px, #000 ${top + 120}px, #000 ${bottom - 90}px, transparent ${bottom}px)`;
      canvas.style.maskImage = canvas.style.webkitMaskImage = fade;
    }
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('scroll', fit, { passive: true });

    // soft round sprites for the nebula's gas
    const sprite = (color) => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      const fill = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      fill.addColorStop(0, rgb(color));
      fill.addColorStop(0.45, rgb(color, 0.45));
      fill.addColorStop(1, rgb(color, 0));
      g.fillStyle = fill;
      g.fillRect(0, 0, 64, 64);
      return c;
    };
    const blue = sprite([90, 156, 255]);
    const magenta = sprite([226, 78, 150]);
    const orange = sprite([255, 120, 70]);

    // hot spots riding the accretion disk, so it visibly turns (inner ones faster)
    const spots = Array.from({ length: 10 }, (_, i) => {
      const dist = DISK_IN + (DISK_OUT - DISK_IN) * (0.08 + 0.84 * ((i * 0.618) % 1));
      return { dist, angle: i * 137.5, speed: 150 * Math.pow(DISK_IN / dist, 1.5), size: 3 + 2.5 * Math.random() };
    });

    function glowAt(x, y, radius, color, alpha) {
      if (alpha <= 0 || radius <= 0) return;
      const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
      fill.addColorStop(0, rgb(color, alpha));
      fill.addColorStop(0.35, rgb(color, alpha * 0.45));
      fill.addColorStop(1, rgb(color, 0));
      ctx.fillStyle = fill;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    // a shockwave: a faint wide band of compressed gas with a bright, slightly ragged front
    function ring(radius, width, color, alpha, seed) {
      if (alpha <= 0) return;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const th = i / 90 * Math.PI * 2;
        const rho = radius * (1 + 0.025 * Math.sin(3 * th + seed) + 0.018 * Math.sin(5 * th - 2 * seed) + 0.012 * Math.sin(9 * th + 4 * seed));
        const x = cx + Math.cos(th) * rho;
        const y = cy + Math.sin(th) * rho;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.lineWidth = width * 4;
      ctx.strokeStyle = rgb(color, alpha * 0.12);
      ctx.stroke();
      ctx.lineWidth = width;
      ctx.strokeStyle = rgb(color, alpha);
      ctx.stroke();
    }

    // The black hole. Its disk lies in the orbits' plane: the near half passes
    // in front of the shadow, and the far half's light is bent around the
    // shadow and appears as an arc over the top (and a thin one underneath),
    // joining the disk at its tips. The side turning toward us is brighter.
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    function drawHole(t) {
      const { k, s } = holeAt(t);
      if (k <= 0) return;
      const rIn = DISK_IN * s;
      const rOut = DISK_OUT * s;
      const rs = SHADOW_R * s;
      const flicker = 0.95 + 0.05 * Math.sin(t * 23) * Math.sin(t * 7.3);
      // where the far side's light shows: at the tips it's where the disk is, over the
      // shadow it's pinched into a band just outside the photon ring
      const bent = (dist, u, over) => {
        const peak = Math.pow(Math.sin(Math.PI * u), 0.55);
        const atPeak = over ? rs * 1.06 + (dist - rIn) / (rOut - rIn) * 11 * s : rs * 1.02 + (dist - rIn) / (rOut - rIn) * 2.5 * s;
        const rho = dist + (atPeak - dist) * peak;
        const phi = (over ? Math.PI : 0) + Math.PI * u + tilt; // over: left tip, top, right tip; under: the other way
        return { x: cx + rho * Math.cos(phi), y: cy + rho * Math.sin(phi) };
      };
      const beam = (color, alpha) => {
        const g = ctx.createLinearGradient(cx - rOut * cosT, cy - rOut * sinT, cx + rOut * cosT, cy + rOut * sinT);
        g.addColorStop(0, rgb(color, alpha));
        g.addColorStop(0.5, rgb(color, alpha * 0.7));
        g.addColorStop(1, rgb(color, alpha * 0.32));
        return g;
      };
      const trace = (points) => {
        ctx.beginPath();
        points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
      };
      const steps = 36;
      const nearBand = (r0, r1) => {
        const outer = [];
        const inner = [];
        for (let i = 0; i <= steps; i++) {
          outer.push(project(r1, i * 180 / steps));
          inner.unshift(project(r0, i * 180 / steps));
        }
        trace(outer.concat(inner));
      };
      const farBand = (r0, r1) => {
        const outer = [];
        const inner = [];
        for (let i = 0; i <= steps; i++) {
          outer.push(bent(r1, i / steps, true));
          inner.unshift(bent(r0, i / steps, true));
        }
        trace(outer.concat(inner));
      };

      glowAt(cx, cy, rOut * 1.3, [255, 150, 70], 0.22 * k);
      const bands = 12;
      for (let i = 0; i < bands; i++) {
        const r0 = rIn + (rOut - rIn) * i / bands;
        const r1 = rIn + (rOut - rIn) * (i + 1) / bands + 0.6 * s;
        const color = ramp(DISK, (i + 0.5) / bands);
        ctx.fillStyle = beam(color, (1 - 0.5 * i / bands) * k * flicker);
        farBand(r0, r1);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(cx, cy, rs, 0, Math.PI * 2);
      ctx.fillStyle = rgb([4, 5, 12], k);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < bands; i++) {
        const r0 = rIn + (rOut - rIn) * i / bands;
        const r1 = rIn + (rOut - rIn) * (i + 1) / bands + 0.6 * s;
        ctx.fillStyle = beam(ramp(DISK, (i + 0.5) / bands), (1 - 0.5 * i / bands) * k * flicker);
        nearBand(r0, r1);
        ctx.fill();
      }
      // the far side's second, fainter image, squeezed under the shadow
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const p = bent(rIn + (rOut - rIn) * 0.3, i / steps, false);
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
      }
      ctx.lineWidth = 1.6 * s;
      ctx.strokeStyle = beam([255, 236, 210], 0.55 * k);
      ctx.stroke();
      // the photon ring: a thin bright line with a soft glow around it
      ctx.beginPath();
      ctx.arc(cx, cy, rs * 1.03, 0, Math.PI * 2);
      ctx.lineWidth = 5 * s;
      ctx.strokeStyle = rgb([255, 190, 110], 0.22 * k);
      ctx.stroke();
      ctx.lineWidth = 1.1 * s;
      ctx.strokeStyle = rgb([255, 244, 226], 0.9 * k);
      ctx.stroke();
      // the hot spots: on the near half they ride the disk, on the far half their light comes over the top
      spots.forEach((spot) => {
        const degrees = ((spot.angle - spot.speed * t) % 360 + 360) % 360;
        const p = degrees < 180 ? project(spot.dist * s, degrees) : bent(spot.dist * s, (degrees - 180) / 180, true);
        const toward = 0.5 - 0.5 * ((p.x - cx) * cosT + (p.y - cy) * sinT) / rOut; // 1 on the approaching side
        glowAt(p.x, p.y, spot.size * s, [255, 246, 230], (0.35 + 0.65 * toward) * 0.8 * k);
      });
    }

    return {
      canvas,
      stop() {
        window.removeEventListener('resize', fit);
        window.removeEventListener('scroll', fit);
        canvas.remove();
      },
      // the debris: most of it in a dozen clumps flung at different speeds, the
      // rest scattered, plus a few big glowing knots, all seen flattened onto the screen
      burst() {
        const clumps = Array.from({ length: 12 }, () => ({
          a: Math.random() * Math.PI * 2, z: Math.random() * 2 - 1, spread: 0.16 + Math.random() * 0.22, pace: 0.6 + Math.random() * 0.9
        }));
        const fling = (a, z, pace) => {
          const s = Math.sqrt(1 - z * z);
          const speed = (50 + 430 * Math.pow(Math.random(), 1.3)) * pace; // most of it slow, some very fast
          return { x: cx, y: cy, vx: Math.cos(a) * s * speed, vy: Math.sin(a) * s * speed };
        };
        const embers = Array.from({ length: 650 }, (_, i) => {
          const clump = Math.random() < 0.72 ? clumps[i % clumps.length] : null;
          const z = clump ? Math.max(-1, Math.min(1, clump.z + gauss() * clump.spread)) : Math.random() * 2 - 1;
          const a = clump ? clump.a + gauss() * clump.spread : Math.random() * Math.PI * 2;
          return { ...fling(a, z, clump ? clump.pace : 1), size: 0.4 + Math.random() * 1.4, cool: 0.8 + Math.random(), bright: 0.55 + 0.45 * Math.random() };
        });
        const knots = Array.from({ length: 16 }, (_, i) => {
          const clump = clumps[i % clumps.length];
          const z = Math.max(-1, Math.min(1, clump.z + gauss() * clump.spread));
          const { x, y, vx, vy } = fling(clump.a + gauss() * clump.spread, z, clump.pace);
          return { x, y, vx: vx * 0.4, vy: vy * 0.4, size: 3 + Math.random() * 2.5, cool: 1.6 + Math.random(), bright: 0.5 + 0.4 * Math.random() };
        });
        return { embers, knots };
      },
      // the nebula: blue near the middle, red and magenta further out
      nebula: () => Array.from({ length: 22 }, () => {
        const reach = 60 + Math.random() * 220;
        return {
          angle: Math.random() * Math.PI * 2, reach, spin: (Math.random() - 0.5) * 0.08,
          size: 50 + Math.random() * 90, alpha: 0.05 + Math.random() * 0.06,
          sprite: reach < 150 ? blue : Math.random() < 0.5 ? magenta : orange
        };
      }),
      draw(t, dt, r, debris, gas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';

        if (t < COLLAPSE) {
          // the supergiant's red haze
          glowAt(cx, cy, r * 2.6, ramp(LIMB, Math.min(1, t / SWELL)), 0.32 * Math.min(1, t / SWELL));
          if (t > SWELL) {
            // the collapse: the outer layers streak inward and the core shows through, blue-white
            const c = span(t, SWELL, COLLAPSE);
            ctx.lineWidth = 1;
            ctx.strokeStyle = rgb(HOT, 0.55 * c);
            for (let i = 0; i < 40; i++) {
              const angle = i * 2.399 + 0.3;
              const far = GIANT * (1.2 + (i % 5) * 0.12) * (1 - c * 0.85);
              const near = Math.max(r * 1.02, far - (14 + 30 * c));
              if (near >= far) continue;
              ctx.beginPath();
              ctx.moveTo(cx + Math.cos(angle) * far, cy + Math.sin(angle) * far);
              ctx.lineTo(cx + Math.cos(angle) * near, cy + Math.sin(angle) * near);
              ctx.stroke();
            }
            glowAt(cx, cy, 12 + 30 * c, HOT, 0.7 * c);
          }
        } else if (t < BANG) {
          // the held breath: a blue-white pinpoint, flaring
          const h = span(t, COLLAPSE, BANG);
          glowAt(cx, cy, 34 + 6 * Math.sin(t * 70), HOT, 0.6);
          const len = 20 + 80 * h;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = rgb([255, 255, 255], 0.9);
          ctx.beginPath();
          ctx.moveTo(cx - len, cy);
          ctx.lineTo(cx + len, cy);
          ctx.moveTo(cx, cy - len * 0.7);
          ctx.lineTo(cx, cy + len * 0.7);
          ctx.stroke();
        }

        const a = t - BANG;
        if (a >= 0) {
          // one flash, the white-hot heart of the blast, then two shockwaves
          glowAt(cx, cy, 30 + 480 * ease(span(a, 0, 0.9)), [255, 250, 240], 0.95 * Math.pow(1 - span(a, 0, 0.9), 1.6));
          glowAt(cx, cy, 40 + 50 * ease(span(a, 0, 1.6)), [255, 236, 214], 0.7 * (1 - span(a, 0, 1.6)));
          const shock = span(a, 0, 1.6);
          ring(10 + 650 * ease(shock), 0.4 + 2.2 * (1 - shock), [255, 236, 200], 0.75 * (1 - shock), 1.3);
          const echo = span(a, 0.12, 2.1);
          if (echo > 0) ring(10 + 520 * ease(echo), 0.4 + 1.6 * (1 - echo), [255, 170, 90], 0.5 * (1 - echo), 4.1);

          // the nebula thins out before the rescue
          const fade = 1 - span(t, RESCUE - 1.5, ARRIVE + 0.5);
          gas.forEach((cloud) => {
            const d = cloud.reach * (ease(clamp01(a / 2.6)) + 0.06 * a);
            const angle = cloud.angle + cloud.spin * a;
            const size = cloud.size * (0.3 + 0.7 * ease(clamp01(a / 2))) * (1 + 0.05 * a);
            ctx.globalAlpha = cloud.alpha * clamp01(a / 0.4) * fade;
            ctx.drawImage(cloud.sprite, cx + Math.cos(angle) * d - size, cy + Math.sin(angle) * d - size, size * 2, size * 2);
          });
          ctx.globalAlpha = 1;

          const drag = Math.exp(-1.25 * dt);
          const fly = (piece) => {
            piece.vx *= drag;
            piece.vy *= drag;
            piece.x += piece.vx * dt;
            piece.y += piece.vy * dt;
            return Math.exp(-a / piece.cool); // how hot it still is
          };
          ctx.lineCap = 'round';
          debris.embers.forEach((ember) => {
            const heat = fly(ember);
            const alpha = ember.bright * Math.min(1, 0.4 + heat) * fade;
            if (alpha <= 0.01) return;
            ctx.beginPath();
            ctx.moveTo(ember.x - ember.vx * 0.022, ember.y - ember.vy * 0.022); // a streak while it's fast
            ctx.lineTo(ember.x, ember.y);
            ctx.lineWidth = ember.size;
            ctx.strokeStyle = rgb(ramp(EMBERS, heat), alpha.toFixed(3));
            ctx.stroke();
          });
          debris.knots.forEach((knot) => {
            const heat = fly(knot);
            glowAt(knot.x, knot.y, knot.size * (1 + 0.5 * a), ramp(EMBERS, heat), knot.bright * (0.3 + 0.7 * heat) * fade);
          });

          drawHole(t);
        }

        // the sun relights with a warm flash
        const relight = span(t, ARRIVE, ARRIVE + 0.7);
        if (relight > 0 && relight < 1) glowAt(cx, cy, 20 + 260 * ease(relight), [255, 214, 140], 0.8 * Math.pow(1 - relight, 2));
        ctx.globalCompositeOperation = 'source-over';
      }
    };
  }

  function restore(scene, sky, rescuer) {
    const { saved } = scene;
    Object.entries(saved.sun).forEach(([name, value]) => sun.setAttribute(name, value));
    Object.entries(saved.glow).forEach(([name, value]) => glow.setAttribute(name, value));
    sun.removeAttribute('filter');
    sun.removeAttribute('style');
    glow.removeAttribute('style');
    label.removeAttribute('style');
    scene.defs.remove();
    sky.stop();
    layers.forEach((layer) => layer.removeAttribute('transform'));
    page.forEach((element) => { element.style.transform = ''; });
    document.documentElement.style.overflowX = '';
    rescuer.link.classList.remove('hot');
    nodes.forEach((node) => {
      node.alive = 1;
      node.pull = 0;
      node.swallowed = false;
      node.link.style.pointerEvents = '';
      node.rings.forEach((ring) => { ring.style.opacity = ''; });
    });
  }
}
