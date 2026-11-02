import { svg } from '../lib/dom.js';

// Now and then a small solar flare lifts off the sun's edge (hero.html's
// #core): a bundle of hot filaments that rises, frays and fades, with plasma
// streaming along the strands and sparks thrown clear, some of them falling
// back in. It rests while the sun is off being a supernova (home/supernova.js
// marks #orbit.nova), while the tab is hidden, and while the hero is scrolled
// out of view. home/orbit.js skips it for reduced motion.
const CX = 308;
const CY = 300;
const R = 26; // the sun's radius in hero.html
const LIFE = 3.2; // seconds a flare lasts

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);

export function flares(orbit) {
  const layer = svg('g', { class: 'flares' });
  orbit.querySelector('#core .core-label').before(layer);

  const onScreen = () => {
    const box = orbit.getBoundingClientRect();
    return box.bottom > 0 && box.top < window.innerHeight;
  };
  const later = (ms) => setTimeout(fire, ms);
  // one flare most of the time, now and then two or three from different parts
  // of the limb, a few hundred milliseconds apart
  function fire() {
    if (document.hidden || orbit.classList.contains('nova') || !onScreen()) return later(4000);
    const roll = Math.random();
    const count = roll < 0.55 ? 1 : roll < 0.85 ? 2 : 3;
    const first = Math.random() * Math.PI * 2;
    for (let i = 0; i < count; i++) {
      const angle = first + i * (Math.PI * 2 / count) + (Math.random() - 0.5) * 0.8;
      setTimeout(() => { if (!orbit.classList.contains('nova')) flare(angle); }, i * (250 + Math.random() * 500));
    }
    later(7000 + Math.random() * 9000);
  }
  later(2500 + Math.random() * 3000);

  function flare(angle) {                       // angle: where on the limb
    const spread = 0.3 + Math.random() * 0.2;   // radians between the loop's feet
    const height = 11 + Math.random() * 11;
    const nx = Math.cos(angle);                 // out from the sun
    const ny = Math.sin(angle);
    const tx = -ny;                             // along the limb
    const ty = nx;
    const foot = (a) => [CX + Math.cos(a) * R, CY + Math.sin(a) * R];

    // the loop as a curve: its feet on the limb and two control points lifted
    // off along the normal, leaning along the limb
    const curve = (a1, a2, h, lean) => {
      const [x1, y1] = foot(a1);
      const [x2, y2] = foot(a2);
      const lx = tx * h * lean;
      const ly = ty * h * lean;
      return [x1, y1, x1 + nx * h + lx, y1 + ny * h + ly, x2 + nx * h + lx, y2 + ny * h + ly, x2, y2];
    };
    const toPath = (c) => `M${c[0].toFixed(1)} ${c[1].toFixed(1)} C${c[2].toFixed(1)} ${c[3].toFixed(1)} ${c[4].toFixed(1)} ${c[5].toFixed(1)} ${c[6].toFixed(1)} ${c[7].toFixed(1)}`;
    const along = (c, s) => { // a point s of the way along the curve
      const u = 1 - s;
      const w = [u * u * u, 3 * u * u * s, 3 * u * s * s, s * s * s];
      return [w[0] * c[0] + w[1] * c[2] + w[2] * c[4] + w[3] * c[6], w[0] * c[1] + w[1] * c[3] + w[2] * c[5] + w[3] * c[7]];
    };

    const haze = svg('path', { class: 'flare-haze', fill: 'none', filter: 'url(#flare-glow)' });
    const strands = Array.from({ length: 4 + Math.floor(Math.random() * 2) }, (_, i) => {
      const dash = i && Math.random() < 0.7 ? 2 + Math.random() * 3 : 0;
      const path = svg('path', { class: i ? 'flare-strand' : 'flare', fill: 'none', 'stroke-width': (i ? 0.8 + Math.random() * 0.8 : 1.5).toFixed(2) });
      if (dash) path.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${(dash * 1.6).toFixed(1)}`);
      return {
        path, dash, flow: 10 + Math.random() * 14,
        a1: angle - spread / 2 + (Math.random() - 0.5) * 0.08,
        a2: angle + spread / 2 + (Math.random() - 0.5) * 0.08,
        h: height * (i ? 0.75 + Math.random() * 0.5 : 1),
        lean: (Math.random() - 0.5) * 0.5, drift: (Math.random() - 0.5) * 0.6, // where the apex leans, and how it drifts as it fades
        start: Math.random() * 0.1, end: 0.75 + Math.random() * 0.25
      };
    });
    const main = strands[0];
    const sparks = Array.from({ length: 7 + Math.floor(Math.random() * 7) }, () => {
      const side = (Math.random() - 0.5) * 0.9;
      const speed = 8 + Math.random() * 22;
      return {
        dot: svg('circle', { class: 'spark', r: (0.7 + Math.random() * 0.9).toFixed(2) }),
        born: 0.08 + Math.random() * 0.45, life: 0.8 + Math.random() * 0.7, at: 0.15 + Math.random() * 0.7, // when, for how long, and from where along the loop
        vx: (nx + tx * side) * speed, vy: (ny + ty * side) * speed, x: 0, y: 0, launched: false
      };
    });
    const parts = [haze, ...strands.map((strand) => strand.path), ...sparks.map((spark) => spark.dot)];
    layer.append(...parts);

    const start = performance.now();
    let last = start;
    requestAnimationFrame(function step(now) {
      if (orbit.classList.contains('nova')) return parts.forEach((part) => part.remove());
      const t = Math.min(1, (now - start) / 1000 / LIFE);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      strands.forEach((strand) => {
        const rise = easeOut((t - strand.start) / 0.3);
        const h = strand.h * rise * (1 + 0.25 * t);
        const c = curve(strand.a1, strand.a2, h, strand.lean + strand.drift * t);
        strand.path.setAttribute('d', toPath(c));
        const alpha = Math.min(easeOut((t - strand.start) / 0.1), 1 - clamp01((t - strand.end + 0.3) / 0.3));
        strand.path.style.opacity = alpha.toFixed(3);
        if (strand.dash) strand.path.style.strokeDashoffset = (-t * LIFE * strand.flow).toFixed(1);
        if (strand === main) {
          haze.setAttribute('d', toPath(c));
          haze.style.opacity = (alpha * 0.7).toFixed(3);
          strand.curve = c;
        }
      });

      // sparks leave the loop, slow down, and are drawn back toward the sun
      sparks.forEach((spark) => {
        if (t < spark.born) return;
        if (!spark.launched) {
          spark.launched = true;
          [spark.x, spark.y] = along(main.curve, spark.at);
        }
        const age = (t - spark.born) * LIFE;
        if (age > spark.life) {
          spark.dot.style.opacity = '0';
          return;
        }
        const dx = spark.x - CX;
        const dy = spark.y - CY;
        const d = Math.hypot(dx, dy) || 1;
        spark.vx -= dx / d * 14 * dt; // gravity
        spark.vy -= dy / d * 14 * dt;
        spark.vx *= 1 - 0.6 * dt;     // drag
        spark.vy *= 1 - 0.6 * dt;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.dot.setAttribute('cx', spark.x.toFixed(1));
        spark.dot.setAttribute('cy', spark.y.toFixed(1));
        const k = age / spark.life;
        spark.dot.style.opacity = (Math.min(1, k / 0.08) * (1 - k * k) * (Math.hypot(spark.x - CX, spark.y - CY) > R ? 1 : 0)).toFixed(3);
      });

      if (t < 1) requestAnimationFrame(step);
      else parts.forEach((part) => part.remove());
    });
  }
}
