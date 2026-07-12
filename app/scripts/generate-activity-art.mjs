// =========================================================================
// Premium-Kartenbilder für den Entdecken-Swiper — „Nordsee-Travel-Poster".
//
// Erzeugt 30 kohärente Vektorszenen (24 Aktivitäten + 6 Mood-Karten) als
// SVG und rastert sie mit sharp (aus dem Root-node_modules) zu WebP
// 1000×1400 nach assets/activities/. Dazu: Körnungs-Overlay (Siebdruck-
// Look), Scrim-Verlauf fürs Karten-Layout und die generierte Require-Map
// src/data/activityArt.ts (Muster: heroImages.ts).
//
//   node scripts/generate-activity-art.mjs [--sheet /pfad/kontaktbogen.png]
//
// Gestaltungsregeln (bewusst im Code fixiert, damit die Serie hält):
//   - Ein Horizont (HOR), eine Lichtrichtung (Sonne links/mittig)
//   - Palette ausschließlich aus Theme-Tönen + wenigen Szenenfarben
//   - Innenliegende Rahmenlinie wie bei klassischen Reisepostern
//   - Fokus der Motive in der oberen Bildhälfte (unten liegt der Text-Scrim)
// =========================================================================
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const requireRoot = createRequire(join(appDir, '..', 'package.json'));
const sharp = requireRoot('sharp');

const W = 1000;
const H = 1400;
const HOR = 868; // gemeinsame Horizontlinie (~62 %)

// --- Palette (Theme-Töne + abgestimmte Szenenfarben) ---------------------
const P = {
  aqua900: '#0d3b44',
  aqua700: '#155e6e',
  aqua500: '#2a8ca0',
  aqua300: '#7bc0cd',
  aqua100: '#d6ecf0',
  sand50: '#faf7f1',
  sand100: '#f3ece0',
  sand200: '#e7dcc8',
  sand400: '#cbb894',
  ink: '#18242a',
  gold: '#c9a24b',
  cream: '#fdf4de',
  sun: '#f6c453',
  coral: '#c0503a',
  coralDark: '#8e3423',
  night: '#0c2531',
  moon: '#f3ead2',
  mud: '#b9a67f',
  mudDark: '#98876a',
  mudLight: '#dccfa8',
  green: '#7d9b6a',
  greenDark: '#57764c',
  wood: '#a97c50',
  woodDark: '#7c5836',
};

// --- deterministischer Zufall (Streuung von Sternen, Glitzern, Schafen) --
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- SVG-Grundbausteine ----------------------------------------------------
const lg = (id, stops, [x1, y1, x2, y2] = [0, 0, 0, 1]) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
  stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('') +
  `</linearGradient>`;

const rg = (id, stops) =>
  `<radialGradient id="${id}">` +
  stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('') +
  `</radialGradient>`;

/** Wellige Oberkante ab y, gefüllt bis yB — Basis für Meer/Watt/Hügel. */
function band(y, amp, wl, fill, { phase = 0, yB = H + 20, op = 1 } = {}) {
  let d = `M ${-40 - phase} ${y}`;
  for (let x = -40 - phase; x < W + 60; x += wl) {
    d += ` q ${wl / 4} ${-amp} ${wl / 2} 0 q ${wl / 4} ${amp} ${wl / 2} 0`;
  }
  return `<path d="${d} L ${W + 40} ${yB} L ${-40 - phase} ${yB} Z" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}/>`;
}

/** Meer aus gestaffelten Wellenbändern (hell am Horizont, satt vorn). */
function sea(from, to, cols, { phase = 0 } = {}) {
  const n = cols.length;
  const step = (to - from) / n;
  let out = `<rect x="-20" y="${from}" width="${W + 40}" height="${to - from + 20}" fill="${cols[0]}"/>`;
  for (let i = 1; i < n; i++) {
    out += band(from + i * step, 4 + i * 3.2, 150 - i * 12, cols[i], { phase: phase + i * 37, yB: to + 20 });
  }
  return out;
}

/** Glitzerspur der Sonne auf dem Wasser: schmale Lichtstriche. */
function glints(cx, y0, y1, color, seed = 3, n = 14, maxW = 190) {
  const rnd = mulberry32(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const y = y0 + (y1 - y0) * t;
    const w = (0.25 + 0.75 * rnd()) * maxW * (0.35 + 0.65 * t);
    const x = cx + (rnd() - 0.5) * 90 * t;
    out += `<rect x="${(x - w / 2).toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="6" rx="3" fill="${color}" opacity="${(0.55 - 0.3 * t).toFixed(2)}"/>`;
  }
  return out;
}

function sun(cx, cy, r, { core = P.sun, halo = P.sun, haloR = 2.6, half = false } = {}) {
  const id = `sun${cx}${cy}`;
  const clip = half ? `<clipPath id="${id}c"><rect x="${cx - r * haloR}" y="${cy - r * haloR}" width="${r * haloR * 2}" height="${r * haloR}"/></clipPath>` : '';
  const g = half ? ` clip-path="url(#${id}c)"` : '';
  return (
    `<defs>${rg(id, [[0, halo, 0.55], [0.55, halo, 0.18], [1, halo, 0]])}${clip}</defs>` +
    `<g${g}><circle cx="${cx}" cy="${cy}" r="${r * haloR}" fill="url(#${id})"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${core}"/></g>`
  );
}

function cloud(cx, cy, s, fill = P.cream, op = 0.92) {
  return (
    `<g fill="${fill}" opacity="${op}">` +
    `<ellipse cx="${cx}" cy="${cy}" rx="${86 * s}" ry="${26 * s}"/>` +
    `<ellipse cx="${cx - 46 * s}" cy="${cy + 6 * s}" rx="${52 * s}" ry="${20 * s}"/>` +
    `<ellipse cx="${cx + 50 * s}" cy="${cy + 7 * s}" rx="${56 * s}" ry="${19 * s}"/>` +
    `<ellipse cx="${cx + 8 * s}" cy="${cy - 16 * s}" rx="${44 * s}" ry="${20 * s}"/>` +
    `</g>`
  );
}

function gull(x, y, s, color = P.ink, sw = 4) {
  return `<path d="M ${x - s} ${y - s * 0.2} Q ${x - s * 0.42} ${y - s * 0.8} ${x} ${y} Q ${x + s * 0.42} ${y - s * 0.8} ${x + s} ${y - s * 0.2}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
}

function gulls(list, color = P.ink) {
  return list.map(([x, y, s, sw]) => gull(x, y, s, color, sw ?? Math.max(3, s / 9))).join('');
}

function stars(seed, n, y0, y1, color = P.moon) {
  const rnd = mulberry32(seed);
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = 30 + rnd() * (W - 60);
    const y = y0 + rnd() * (y1 - y0);
    const r = 1.5 + rnd() * 2.6;
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="${color}" opacity="${(0.35 + rnd() * 0.6).toFixed(2)}"/>`;
    if (rnd() > 0.85) {
      out += `<path d="M ${x - r * 4} ${y} H ${x + r * 4} M ${x} ${y - r * 4} V ${y + r * 4}" stroke="${color}" stroke-width="1.4" opacity="0.5"/>`;
    }
  }
  return out;
}

function grassTuft(x, y, s, color = P.greenDark) {
  return (
    `<g stroke="${color}" stroke-width="${4 * s}" stroke-linecap="round" fill="none">` +
    `<path d="M ${x} ${y} q ${-10 * s} ${-34 * s} ${-20 * s} ${-46 * s}"/>` +
    `<path d="M ${x} ${y} q ${-2 * s} ${-40 * s} ${2 * s} ${-56 * s}"/>` +
    `<path d="M ${x} ${y} q ${12 * s} ${-32 * s} ${22 * s} ${-42 * s}"/>` +
    `<path d="M ${x} ${y} q ${7 * s} ${-24 * s} ${30 * s} ${-30 * s}"/>` +
    `</g>`
  );
}

function sheep(x, y, s, { face = P.ink, body = P.sand50 } = {}) {
  return (
    `<g>` +
    `<ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${17 * s}" fill="${body}"/>` +
    `<ellipse cx="${x - 8 * s}" cy="${y - 10 * s}" rx="${14 * s}" ry="${10 * s}" fill="${body}"/>` +
    `<circle cx="${x - 24 * s}" cy="${y - 8 * s}" r="${7 * s}" fill="${face}"/>` +
    `<rect x="${x - 14 * s}" y="${y + 12 * s}" width="${4 * s}" height="${10 * s}" fill="${face}"/>` +
    `<rect x="${x + 8 * s}" y="${y + 12 * s}" width="${4 * s}" height="${10 * s}" fill="${face}"/>` +
    `</g>`
  );
}

// --- wiederkehrende Motive -------------------------------------------------

/** Büsumer Leuchtturm: roter Turm, weiße Bänder, Galerie, Laterne. */
function lighthouse(x, baseY, s, { glow = true } = {}) {
  const h = 330 * s;
  const wB = 47 * s;
  const wT = 30 * s;
  const top = baseY - h;
  return (
    `<g>` +
    `<path d="M ${x - wB} ${baseY} L ${x - wT} ${top} L ${x + wT} ${top} L ${x + wB} ${baseY} Z" fill="${P.coral}"/>` +
    `<path d="M ${x + wT * 0.1} ${top} L ${x + wT} ${top} L ${x + wB} ${baseY} L ${x + wB * 0.1} ${baseY} Z" fill="${P.coralDark}" opacity="0.45"/>` +
    ((t1, t2) => {
      const wAt = (t) => wB + (wT - wB) * t;
      return `<path d="M ${x - wAt(t1)} ${baseY - h * t1} L ${x + wAt(t1)} ${baseY - h * t1} L ${x + wAt(t2)} ${baseY - h * t2} L ${x - wAt(t2)} ${baseY - h * t2} Z" fill="${P.sand50}"/>`;
    })(0.26, 0.4) +
    ((t1, t2) => {
      const wAt = (t) => wB + (wT - wB) * t;
      return `<path d="M ${x - wAt(t1)} ${baseY - h * t1} L ${x + wAt(t1)} ${baseY - h * t1} L ${x + wAt(t2)} ${baseY - h * t2} L ${x - wAt(t2)} ${baseY - h * t2} Z" fill="${P.sand50}"/>`;
    })(0.58, 0.72) +
    `<rect x="${x - wT - 14 * s}" y="${top - 14 * s}" width="${(wT + 14 * s) * 2}" height="${16 * s}" rx="${6 * s}" fill="${P.sand50}"/>` +
    `<path d="M ${x - wT - 10 * s} ${top - 14 * s} v ${-16 * s} m ${14 * s} ${16 * s} v ${-16 * s} m ${14 * s} ${16 * s} v ${-16 * s} m ${14 * s} ${16 * s} v ${-16 * s} m ${14 * s} ${16 * s} v ${-16 * s} m ${14 * s} ${16 * s} v ${-16 * s}" stroke="${P.ink}" stroke-width="${3 * s}"/>` +
    `<rect x="${x - 20 * s}" y="${top - 58 * s}" width="${40 * s}" height="${44 * s}" fill="${P.ink}"/>` +
    (glow ? `<rect x="${x - 14 * s}" y="${top - 52 * s}" width="${28 * s}" height="${32 * s}" rx="${4 * s}" fill="${P.sun}"/>` : `<rect x="${x - 14 * s}" y="${top - 52 * s}" width="${28 * s}" height="${32 * s}" rx="${4 * s}" fill="${P.aqua300}"/>`) +
    `<path d="M ${x - 24 * s} ${top - 58 * s} Q ${x} ${top - 92 * s} ${x + 24 * s} ${top - 58 * s} Z" fill="${P.coralDark}"/>` +
    `<line x1="${x}" y1="${top - 90 * s}" x2="${x}" y2="${top - 106 * s}" stroke="${P.ink}" stroke-width="${4 * s}"/>` +
    `</g>`
  );
}

/** Krabbenkutter, Seitenansicht: Rumpf, Ruderhaus, Mast + V-Ausleger. */
function kutter(x, y, s, { hull = P.coral, sil = null } = {}) {
  const c = (col) => (sil ? sil : col);
  return (
    `<g>` +
    `<path d="M ${x - 150 * s} ${y} C ${x - 140 * s} ${y + 34 * s} ${x + 140 * s} ${y + 34 * s} ${x + 150 * s} ${y} L ${x + 132 * s} ${y - 36 * s} L ${x - 118 * s} ${y - 36 * s} C ${x - 138 * s} ${y - 24 * s} ${x - 146 * s} ${y - 12 * s} ${x - 150 * s} ${y} Z" fill="${c(hull)}"/>` +
    `<rect x="${x - 118 * s}" y="${y - 44 * s}" width="${250 * s}" height="${9 * s}" fill="${c(P.sand50)}"/>` +
    `<rect x="${x + 22 * s}" y="${y - 104 * s}" width="${84 * s}" height="${62 * s}" rx="${8 * s}" fill="${c(P.sand100)}"/>` +
    `<rect x="${x + 34 * s}" y="${y - 92 * s}" width="${24 * s}" height="${20 * s}" rx="${3 * s}" fill="${c(P.aqua700)}"/>` +
    `<rect x="${x + 68 * s}" y="${y - 92 * s}" width="${24 * s}" height="${20 * s}" rx="${3 * s}" fill="${c(P.aqua700)}"/>` +
    `<rect x="${x - 52 * s}" y="${y - 210 * s}" width="${7 * s}" height="${170 * s}" fill="${c(P.woodDark)}"/>` +
    `<line x1="${x - 48 * s}" y1="${y - 196 * s}" x2="${x - 158 * s}" y2="${y - 60 * s}" stroke="${c(P.woodDark)}" stroke-width="${6 * s}"/>` +
    `<line x1="${x - 48 * s}" y1="${y - 196 * s}" x2="${x + 66 * s}" y2="${y - 118 * s}" stroke="${c(P.woodDark)}" stroke-width="${6 * s}"/>` +
    `<line x1="${x - 158 * s}" y1="${y - 60 * s}" x2="${x - 128 * s}" y2="${y - 40 * s}" stroke="${c(P.ink)}" stroke-width="${3 * s}"/>` +
    `<path d="M ${x - 48 * s} ${y - 208 * s} L ${x - 148 * s} ${y - 64 * s} M ${x - 48 * s} ${y - 208 * s} L ${x + 60 * s} ${y - 122 * s}" stroke="${c(P.ink)}" stroke-width="${2 * s}" opacity="0.7"/>` +
    `<path d="M ${x - 100 * s} ${y - 128 * s} l ${-16 * s} ${44 * s} l ${30 * s} ${-6 * s} Z" fill="${c(P.aqua700)}" opacity="0.85"/>` +
    `<line x1="${x - 52 * s}" y1="${y - 210 * s}" x2="${x - 48 * s}" y2="${y - 226 * s}" stroke="${c(P.coralDark)}" stroke-width="${5 * s}"/>` +
    `</g>`
  );
}

/**
 * Strandkorb (Frontansicht) — muss sofort als Strandkorb lesbar sein:
 * überhängende, gerundete Haube mit gestreiftem Bezug + Volant-Bogenkante,
 * heller Korb mit Geflecht-Linien, dunkle Sitzhöhle mit Kissen, Armlehnen,
 * ausgezogener Fußkasten.
 */
function strandkorb(x, y, s, { stripe = P.aqua500, dark = false, glowSeat = false } = {}) {
  const w = 190 * s; // Korpusbreite
  const h = 250 * s;
  const top = y - h;
  const hoodW = w * 1.16;
  const hoodH = h * 0.46;
  const wicker = dark ? '#123540' : P.sand100;
  const wickerLine = dark ? '#0a1e27' : '#d8c9a6';
  const stripeCol = dark ? '#0e2a34' : stripe;
  const stripeAlt = dark ? '#16323c' : P.sand50;
  const cave = dark ? '#08161d' : '#12333c';
  // Haube: gerundete Kappe, unten mit Bogen-Volant
  let hood = `<path d="M ${x - hoodW / 2} ${top + hoodH} L ${x - hoodW / 2} ${top + hoodH * 0.55} Q ${x - hoodW / 2} ${top} ${x} ${top} Q ${x + hoodW / 2} ${top} ${x + hoodW / 2} ${top + hoodH * 0.55} L ${x + hoodW / 2} ${top + hoodH} Z" fill="${stripeAlt}"/>`;
  // Streifen auf der Haube (senkrecht, der Rundung folgend angeschnitten)
  hood += `<clipPath id="hood${x}${y}"><path d="M ${x - hoodW / 2} ${top + hoodH} L ${x - hoodW / 2} ${top + hoodH * 0.55} Q ${x - hoodW / 2} ${top} ${x} ${top} Q ${x + hoodW / 2} ${top} ${x + hoodW / 2} ${top + hoodH * 0.55} L ${x + hoodW / 2} ${top + hoodH} Z"/></clipPath>`;
  hood += `<g clip-path="url(#hood${x}${y})">`;
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) continue;
    hood += `<rect x="${x - hoodW / 2 + (i * hoodW) / 7}" y="${top - 4}" width="${hoodW / 7}" height="${hoodH + 8}" fill="${stripeCol}"/>`;
  }
  hood += `</g>`;
  // Volant: Bogenkante unten an der Haube
  let volant = `<g>`;
  const scallops = 5;
  for (let i = 0; i < scallops; i++) {
    const sx = x - hoodW / 2 + (i * hoodW) / scallops;
    const sw2 = hoodW / scallops;
    volant += `<path d="M ${sx} ${top + hoodH} h ${sw2} a ${sw2 / 2} ${sw2 / 3.2} 0 0 1 ${-sw2} 0 Z" fill="${i % 2 ? stripeCol : stripeAlt}"/>`;
  }
  volant += `</g>`;
  // Geflecht-Linien am Korb
  let weave = '';
  for (let i = 1; i < 5; i++) {
    weave += `<line x1="${x - w / 2 + 6 * s}" y1="${top + hoodH + ((h - hoodH) * i) / 5}" x2="${x + w / 2 - 6 * s}" y2="${top + hoodH + ((h - hoodH) * i) / 5}" stroke="${wickerLine}" stroke-width="${3 * s}" opacity="0.8"/>`;
  }
  return (
    `<g>` +
    `<ellipse cx="${x}" cy="${y + 8 * s}" rx="${w * 0.7}" ry="${12 * s}" fill="${P.ink}" opacity="0.14"/>` +
    // Korpus
    `<rect x="${x - w / 2}" y="${top + hoodH * 0.7}" width="${w}" height="${h - hoodH * 0.7}" rx="${18 * s}" fill="${wicker}"/>` +
    weave +
    // Sitzhöhle
    `<rect x="${x - w * 0.34}" y="${top + hoodH + 6 * s}" width="${w * 0.68}" height="${h * 0.34}" rx="${12 * s}" fill="${glowSeat ? P.sun : cave}"/>` +
    (glowSeat
      ? `<rect x="${x - w * 0.34}" y="${top + hoodH + 6 * s}" width="${w * 0.68}" height="${h * 0.34}" rx="${12 * s}" fill="url(#seatGlow)"/>`
      : `<rect x="${x - w * 0.3}" y="${top + hoodH + 10 * s}" width="${w * 0.6}" height="${h * 0.13}" rx="${8 * s}" fill="${stripeCol}" opacity="0.9"/>` +
        `<rect x="${x - w * 0.3}" y="${top + hoodH + 10 * s + h * 0.15}" width="${w * 0.6}" height="${h * 0.13}" rx="${8 * s}" fill="${stripeAlt}" opacity="0.9"/>`) +
    // Armlehnen
    `<rect x="${x - w * 0.46}" y="${top + hoodH + h * 0.2}" width="${w * 0.14}" height="${10 * s}" rx="${5 * s}" fill="${dark ? '#1b3d49' : P.sand400}"/>` +
    `<rect x="${x + w * 0.32}" y="${top + hoodH + h * 0.2}" width="${w * 0.14}" height="${10 * s}" rx="${5 * s}" fill="${dark ? '#1b3d49' : P.sand400}"/>` +
    // Fußkasten
    `<rect x="${x - w * 0.3}" y="${y - 26 * s}" width="${w * 0.6}" height="${22 * s}" rx="${8 * s}" fill="${dark ? '#123540' : P.sand200}" stroke="${wickerLine}" stroke-width="${2.5 * s}"/>` +
    hood +
    volant +
    `</g>`
  );
}

/** Seehund: liegender Körper, Kopf und Schwanz angehoben. */
function seal(x, y, s, { flip = false, tone = '#b9b2a4', belly = '#ded8ca', pup = false } = {}) {
  const f = flip ? -1 : 1;
  const k = pup ? 0.72 : 1;
  return (
    `<g transform="translate(${x} ${y}) scale(${f * s * k} ${s * k})">` +
    `<ellipse cx="0" cy="12" rx="120" ry="16" fill="${P.ink}" opacity="0.1"/>` +
    `<path d="M -118 6 C -128 -6 -122 -22 -106 -24 C -84 -46 -20 -52 30 -40 C 74 -30 104 -16 118 -2 C 128 8 122 14 108 14 L -100 14 C -112 14 -114 12 -118 6 Z" fill="${tone}"/>` +
    `<path d="M -96 10 C -60 -6 60 -10 108 8 C 112 12 108 14 100 14 L -88 14 Z" fill="${belly}"/>` +
    `<circle cx="-104" cy="-24" r="${pup ? 26 : 24}" fill="${tone}"/>` +
    `<circle cx="-112" cy="-28" r="3.6" fill="${P.ink}"/>` +
    `<circle cx="-122" cy="-18" r="4.6" fill="#8f887b"/>` +
    `<path d="M -126 -16 h -8 m 9 4 h -8" stroke="${P.ink}" stroke-width="1.6" opacity="0.7"/>` +
    `<path d="M 112 -4 q 16 -14 22 -30 q 6 16 -2 34 Z" fill="${tone}"/>` +
    `<path d="M -30 6 q 12 -16 30 -12 q -8 14 -20 18 Z" fill="${tone === '#b9b2a4' ? '#a29a8b' : tone}"/>` +
    `</g>`
  );
}

/** Silhouetten-Figur (Wattwanderer): Körper, Kopf, Beine, optional Stock. */
function walker(x, y, s, { lean = 0, stick = true, color = P.ink } = {}) {
  return (
    `<g transform="translate(${x} ${y}) rotate(${lean})" fill="${color}">` +
    `<circle cx="0" cy="${-74 * s}" r="${11 * s}"/>` +
    `<rect x="${-9 * s}" y="${-66 * s}" width="${18 * s}" height="${42 * s}" rx="${9 * s}"/>` +
    `<path d="M ${-5 * s} ${-26 * s} L ${-14 * s} 0 L ${-8 * s} 0 L ${-1 * s} ${-18 * s} L ${7 * s} 0 L ${13 * s} 0 L ${5 * s} ${-26 * s} Z"/>` +
    (stick ? `<line x1="${14 * s}" y1="${-58 * s}" x2="${24 * s}" y2="0" stroke="${color}" stroke-width="${3.4 * s}"/>` : '') +
    `</g>`
  );
}

/** Radfahrer-Silhouette in Fahrt. */
function cyclist(x, y, s, color = P.ink) {
  return (
    `<g transform="translate(${x} ${y})" stroke="${color}" fill="none" stroke-width="${5 * s}">` +
    `<circle cx="${-34 * s}" cy="0" r="${26 * s}"/>` +
    `<circle cx="${40 * s}" cy="0" r="${26 * s}"/>` +
    `<path d="M ${-34 * s} 0 L ${-6 * s} ${-2 * s} L ${10 * s} ${-30 * s} M ${-6 * s} ${-2 * s} L ${-14 * s} ${-34 * s} L ${34 * s} ${-36 * s} L ${40 * s} 0" />` +
    `<g fill="${color}" stroke="none">` +
    `<circle cx="${26 * s}" cy="${-66 * s}" r="${10 * s}"/>` +
    `<path d="M ${-16 * s} ${-36 * s} C ${-6 * s} ${-58 * s} ${16 * s} ${-64 * s} ${30 * s} ${-56 * s} L ${34 * s} ${-38 * s} L ${2 * s} ${-30 * s} Z"/>` +
    `<path d="M ${0 * s} ${-30 * s} L ${-10 * s} ${-6 * s} L ${0 * s} ${-2 * s} L ${8 * s} ${-22 * s} Z"/>` +
    `</g></g>`
  );
}

function fish(x, y, s, color, flip = false) {
  const f = flip ? -1 : 1;
  return (
    `<g transform="translate(${x} ${y}) scale(${f * s} ${s})" fill="${color}">` +
    `<ellipse cx="0" cy="0" rx="26" ry="11"/>` +
    `<path d="M 22 0 L 40 -11 L 40 11 Z"/>` +
    `<circle cx="-14" cy="-3" r="2.6" fill="${P.night}"/>` +
    `</g>`
  );
}

function footprints(x0, y0, x1, y1, n, color = P.mudDark) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = x0 + (x1 - x0) * t + (i % 2 === 0 ? -14 : 14) * (1 - t * 0.4);
    const y = y0 + (y1 - y0) * t;
    const s = 1 - t * 0.55;
    out += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${9 * s}" ry="${16 * s}" fill="${color}" opacity="${0.5 - 0.25 * t}" transform="rotate(${i % 2 === 0 ? -8 : 8} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
  }
  return out;
}

/**
 * Glattes, sich verbreiterndes Band entlang einer Mittellinie
 * (Catmull-Rom-Abtastung + senkrechter Offset) — für Priele und Wege.
 * pts: [[x, y, halbeBreite], ...] von fern nach nah.
 */
function ribbonPath(pts, samples = 14) {
  const P2 = pts.map(([x, y]) => [x, y]);
  const widths = pts.map(([, , w]) => w);
  const pt = (i) => P2[Math.max(0, Math.min(P2.length - 1, i))];
  const curve = [];
  for (let i = 0; i < P2.length - 1; i++) {
    const [p0, p1, p2, p3] = [pt(i - 1), pt(i), pt(i + 1), pt(i + 2)];
    for (let j = 0; j < samples; j++) {
      const t = j / samples;
      const t2 = t * t;
      const t3 = t2 * t;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      const w = widths[i] + (widths[i + 1] - widths[i]) * t;
      curve.push([x, y, w]);
    }
  }
  curve.push([...P2[P2.length - 1], widths[widths.length - 1]]);
  const left = [];
  const right = [];
  for (let i = 0; i < curve.length; i++) {
    const [x, y, w] = curve[i];
    const [xn, yn] = curve[Math.min(i + 1, curve.length - 1)];
    const [xp, yp] = curve[Math.max(i - 1, 0)];
    const dx = xn - xp;
    const dy = yn - yp;
    const len = Math.hypot(dx, dy) || 1;
    left.push(`${(x - (dy / len) * w).toFixed(1)},${(y + (dx / len) * w).toFixed(1)}`);
    right.push(`${(x + (dy / len) * w).toFixed(1)},${(y - (dx / len) * w).toFixed(1)}`);
  }
  return `M ${left.join(' L ')} L ${right.reverse().join(' L ')} Z`;
}

/** Priel: gewundener Wasserlauf im Watt, spiegelt den Himmel. */
function priel(fillId, cx = 500, sw = 1, highlight = P.cream) {
  const pts = [
    [cx, HOR + 2, 7],
    [cx - 60 * sw, HOR + 90, 16],
    [cx + 70 * sw, HOR + 200, 30],
    [cx - 90 * sw, HOR + 330, 52],
    [cx + 40 * sw, HOR + 440, 80],
    [cx - 30 * sw, H + 30, 130],
  ];
  const inner = pts.map(([x, y, w]) => [x, y, Math.max(2, w * 0.3)]);
  return (
    `<path d="${ribbonPath(pts)}" fill="url(#${fillId})"/>` +
    `<path d="${ribbonPath(inner)}" fill="${highlight}" opacity="0.28"/>`
  );
}

/** Innenliegende Poster-Rahmenlinie. */
function frame(color = P.cream, op = 0.5) {
  return `<rect x="26" y="26" width="${W - 52}" height="${H - 52}" rx="34" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="3"/>`;
}

function wrap(defs, body, frameCol = P.cream, frameOp = 0.5) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs>${defs}</defs>${body}${frame(frameCol, frameOp)}</svg>`
  );
}

// --- Himmel-Presets ----------------------------------------------------------
const SKY = {
  day: [[0, '#8fc3cd'], [0.55, '#c2e0e2'], [1, '#eef2e6']],
  fresh: [[0, '#5f9fae'], [0.6, '#a7d2d6'], [1, '#e8f0e4']],
  golden: [[0, '#2f6673'], [0.42, '#7fb0ab'], [0.72, '#e8c07c'], [1, '#eb9d5f']],
  dusk: [[0, '#173f4e'], [0.5, '#3d7580'], [0.82, '#c98d5f'], [1, '#e2a468']],
  night: [[0, '#081b25'], [0.6, '#0e2f3d'], [1, '#17454f']],
};

const skyRect = (id) => `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#${id})"/>`;

// =========================================================================
// SZENEN — 24 Aktivitäten + 6 Mood-Karten
// =========================================================================
const SCENES = {
  // --- Golden Hour: Hafen & Leuchtturm -----------------------------------
  'hafen-leuchtturm': () => {
    const defs = lg('sky', SKY.golden) + lg('quay', [[0, '#2c4a52'], [1, '#1c343c']]);
    let b = skyRect('sky');
    b += sun(300, 470, 74, { half: false });
    b += cloud(700, 250, 1.15, P.cream, 0.85) + cloud(180, 180, 0.8, P.cream, 0.7);
    b += sea(HOR, HOR + 210, ['#c78a54', '#a97046', '#7d5a44', '#54514c']);
    b += glints(320, HOR + 14, HOR + 150, P.cream, 5, 12, 200);
    b += kutter(190, HOR + 60, 0.55, { sil: '#3a3a3c' });
    b += `<rect x="-20" y="${HOR + 190}" width="${W + 40}" height="${H}" fill="url(#quay)"/>`;
    b += `<rect x="-20" y="${HOR + 190}" width="${W + 40}" height="16" fill="#476069"/>`;
    b += lighthouse(660, HOR + 196, 1.55);
    b += `<circle cx="250" cy="${HOR + 260}" r="26" fill="#233d45"/><rect x="238" y="${HOR + 236}" width="24" height="30" rx="8" fill="#233d45"/>`;
    b += `<path d="M 262 ${HOR + 248} C 380 ${HOR + 290} 470 ${HOR + 250} 560 ${HOR + 282}" stroke="#0f2930" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    b += gulls([[470, 300, 34], [560, 360, 26], [410, 400, 20]], '#2e4d55');
    return wrap(defs, b);
  },

  // --- Sonnenuntergang am Deich -------------------------------------------
  'sonnenuntergang-deich': () => {
    const defs = lg('sky', [[0, '#1d4a58'], [0.45, '#576f6e'], [0.72, '#e2a05f'], [1, '#e77e50']]) + lg('dike', [[0, '#4c6b48'], [1, '#28413a']]);
    let b = skyRect('sky');
    b += sun(500, HOR - 4, 120, { core: '#f7cf6f', halo: '#f2a05e', half: true });
    b += cloud(220, 300, 1, '#e8b184', 0.5) + cloud(790, 210, 1.2, '#e8b184', 0.42);
    b += sea(HOR, HOR + 170, ['#c9773f', '#9c5f3d', '#6a4c41']);
    b += glints(500, HOR + 10, HOR + 130, '#f7cf6f', 11, 16, 260);
    b += `<path d="M -20 ${H} L -20 ${HOR + 320} C 260 ${HOR + 210} 620 ${HOR + 170} 1020 ${HOR + 150} L 1020 ${H} Z" fill="url(#dike)"/>`;
    b += `<path d="M -20 ${HOR + 330} C 260 ${HOR + 222} 620 ${HOR + 182} 1020 ${HOR + 162}" stroke="#5d7c50" stroke-width="9" fill="none" opacity="0.8"/>`;
    // Bank mit Blick aufs Meer
    b += `<g fill="${P.ink}"><rect x="356" y="${HOR + 208}" width="150" height="12" rx="5"/><rect x="360" y="${HOR + 178}" width="142" height="10" rx="5"/><rect x="366" y="${HOR + 186}" width="10" height="52"/><rect x="486" y="${HOR + 186}" width="10" height="52"/></g>`;
    b += sheep(720, HOR + 250, 1.15, { body: '#e7ddc4' }) + sheep(816, HOR + 290, 0.95, { body: '#e7ddc4' });
    b += gulls([[260, 380, 30], [350, 330, 22]], '#2e4048');
    return wrap(defs, b);
  },

  // --- Strandkorb-Tag -------------------------------------------------------
  'strandkorb-tag': () => {
    const defs = lg('sky', SKY.day) + lg('beach', [[0, '#eadfc2'], [1, '#d9c8a2']]);
    let b = skyRect('sky');
    b += sun(230, 260, 62);
    b += cloud(660, 220, 1.1) + cloud(860, 330, 0.7, P.cream, 0.8);
    b += sea(HOR - 130, HOR + 40, [P.aqua300, P.aqua500, '#3e97a8']);
    b += band(HOR + 26, 5, 130, P.sand50, { yB: HOR + 60 });
    b += `<rect x="-20" y="${HOR + 40}" width="${W + 40}" height="${H}" fill="url(#beach)"/>`;
    b += strandkorb(790, HOR + 170, 0.62, { stripe: P.coral });
    b += strandkorb(340, HOR + 350, 1.25, { stripe: P.aqua500 });
    b += `<circle cx="640" cy="${HOR + 420}" r="48" fill="${P.coral}"/><path d="M 594 ${HOR + 410} a 48 48 0 0 1 92 0" fill="${P.cream}"/><path d="M 612 ${HOR + 462} a 48 48 0 0 0 58 -2" fill="${P.gold}" opacity="0.9"/>`;
    b += footprints(880, H - 30, 800, HOR + 240, 8, '#c3b28d');
    b += gulls([[480, 250, 30], [560, 200, 22], [420, 320, 18]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Fischbrötchen am Hafen ----------------------------------------------
  'fischbroetchen-hafen': () => {
    const defs =
      lg('sky', SKY.golden) +
      lg('counter', [[0, '#b98a5c'], [1, '#96683f']]) +
      lg('paper', [[0, P.sand50], [1, '#efe3cb']]);
    let b = skyRect('sky');
    b += sun(760, 420, 60, { haloR: 2.2 });
    b += cloud(260, 220, 1);
    b += sea(HOR, HOR + 150, ['#c78a54', '#a06a45', '#6b5545']);
    b += kutter(320, HOR + 66, 0.72, { sil: '#37474d' });
    b += gulls([[600, 330, 30], [680, 280, 24], [540, 260, 18]], '#33454d');
    // Tresen mit Brötchen
    b += `<rect x="-20" y="${HOR + 210}" width="${W + 40}" height="${H}" fill="url(#counter)"/>`;
    b += `<rect x="-20" y="${HOR + 210}" width="${W + 40}" height="14" fill="#d9b58a"/>`;
    b += `<path d="M -20 ${HOR + 254} h 1040 M -20 ${HOR + 320} h 1040" stroke="#7c5836" stroke-width="4" opacity="0.5"/>`;
    b += `<path d="M 160 ${HOR + 470} L 840 ${HOR + 470} L 780 ${HOR + 300} L 220 ${HOR + 300} Z" fill="url(#paper)"/>`;
    const bx = 500;
    const by = HOR + 400;
    // Brötchen-Unterseite
    b += `<path d="M ${bx - 210} ${by - 20} L ${bx + 210} ${by - 20} A 210 74 0 0 1 ${bx - 210} ${by - 20} Z" fill="#e0bd7d" stroke="#c39a56" stroke-width="6"/>`;
    // Salat-Rüsche
    b += `<path d="M ${bx - 214} ${by - 22} q 26 -30 58 -12 q 4 -26 44 -22 q 10 -24 52 -16 q 16 -22 56 -12 q 22 -18 56 -4 q 30 -12 52 6 q 30 -2 44 20 q 20 6 24 24 l -12 22 l -366 6 Z" fill="#7ea45f"/>`;
    b += `<path d="M ${bx - 190} ${by - 34} q 30 -18 60 -6 M ${bx - 60} ${by - 52} q 34 -14 66 -2 M ${bx + 80} ${by - 44} q 30 -10 58 4" stroke="#5d7c45" stroke-width="5" fill="none" opacity="0.7"/>`;
    // Krabben — klare Halbmonde mit Schwanzfächer
    const shrimp = (x, y, s, rot) =>
      `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
      `<path d="M -8 -34 A 34 34 0 1 0 30 16 A 48 48 0 0 1 -8 -34 Z" fill="${P.coral}" stroke="${P.coralDark}" stroke-width="4"/>` +
      `<path d="M 26 20 l 20 14 l -26 4 Z" fill="${P.coral}" stroke="${P.coralDark}" stroke-width="3"/>` +
      `<path d="M -10 -26 q -14 -10 -26 -8 M -6 -30 q -8 -14 -20 -18" stroke="${P.coralDark}" stroke-width="3" fill="none"/>` +
      `<circle cx="-8" cy="-22" r="2.6" fill="${P.night}"/>` +
      `</g>`;
    b += shrimp(bx - 150, by - 64, 1.05, -12) + shrimp(bx - 52, by - 78, 1.15, 6) + shrimp(bx + 52, by - 74, 1.1, -8) + shrimp(bx + 148, by - 58, 1.0, 10);
    // Brötchen-Oberseite, leicht nach hinten versetzt
    b += `<path d="M ${bx - 186} ${by - 96} a 186 104 0 0 1 372 0 Z" fill="#d9a862" stroke="#b9884b" stroke-width="6"/>`;
    b += `<circle cx="${bx - 96}" cy="${by - 150}" r="5" fill="${P.cream}"/><circle cx="${bx - 26}" cy="${by - 172}" r="5" fill="${P.cream}"/><circle cx="${bx + 52}" cy="${by - 164}" r="5" fill="${P.cream}"/><circle cx="${bx + 118}" cy="${by - 136}" r="5" fill="${P.cream}"/><circle cx="${bx + 10}" cy="${by - 140}" r="5" fill="${P.cream}"/>`;
    // Fähnchen-Picker
    b += `<line x1="${bx + 148}" y1="${by - 250}" x2="${bx + 132}" y2="${by - 110}" stroke="${P.ink}" stroke-width="6"/><path d="M ${bx + 148} ${by - 250} l 76 12 l -72 26 Z" fill="${P.gold}"/>`;
    // Zitronenscheibe daneben
    b += `<circle cx="${bx - 300}" cy="${by + 10}" r="46" fill="#f2d886" stroke="#d9b95c" stroke-width="5"/><g stroke="#d9b95c" stroke-width="4"><line x1="${bx - 300}" y1="${by - 30}" x2="${bx - 300}" y2="${by + 50}"/><line x1="${bx - 340}" y1="${by + 10}" x2="${bx - 260}" y2="${by + 10}"/><line x1="${bx - 328}" y1="${by - 18}" x2="${bx - 272}" y2="${by + 38}"/><line x1="${bx - 328}" y1="${by + 38}" x2="${bx - 272}" y2="${by - 18}"/></g>`;
    return wrap(defs, b);
  },

  // --- Krabbenfangfahrt ------------------------------------------------------
  'krabbenfangfahrt': () => {
    const defs = lg('sky', SKY.fresh);
    let b = skyRect('sky');
    b += sun(220, 240, 58);
    b += cloud(700, 200, 1.3) + cloud(420, 300, 0.8, P.cream, 0.75);
    b += sea(HOR - 40, H + 20, ['#5fa3b0', '#3d92a4', '#2a7f93', '#1f6a7e', '#175a6c']);
    b += glints(240, HOR - 20, HOR + 60, P.cream, 7, 10, 150);
    b += kutter(470, HOR + 210, 1.35, { hull: P.coral });
    b += `<path d="M 260 ${HOR + 250} q 60 26 130 22 M 640 ${HOR + 250} q 70 24 150 14" stroke="${P.cream}" stroke-width="10" fill="none" opacity="0.7" stroke-linecap="round"/>`;
    b += band(HOR + 290, 9, 110, '#cfe6e2', { yB: HOR + 320, op: 0.35 });
    b += gulls([[300, 380, 40, 5], [700, 320, 34], [620, 430, 26], [220, 480, 22], [790, 500, 20], [520, 300, 18]], P.sand50);
    b += gulls([[380, 470, 28]], '#e8e0cc');
    return wrap(defs, b);
  },

  // --- Helgoland: Lange Anna -------------------------------------------------
  'helgoland-ausflug': () => {
    const defs = lg('sky', SKY.day) + lg('rock', [[0, '#c65f43'], [1, '#8e3423']]);
    let b = skyRect('sky');
    b += sun(750, 250, 60);
    b += cloud(280, 210, 1.1) + cloud(520, 320, 0.7, P.cream, 0.8);
    b += sea(HOR - 60, H + 20, ['#79b6bf', '#4f9dac', '#357f92', '#256a7d', '#1b5867']);
    // Lange Anna — gestufte, schroffe Silhouette mit Guano-Kappe
    b += `<path d="M 232 ${HOR + 190} L 252 ${HOR + 40} L 240 ${HOR + 30} L 262 ${HOR - 120} L 250 ${HOR - 130} L 274 ${HOR - 250} L 264 ${HOR - 258} L 282 ${HOR - 344} Q 288 ${HOR - 388} 330 ${HOR - 390} Q 374 ${HOR - 388} 380 ${HOR - 346} L 394 ${HOR - 262} L 384 ${HOR - 252} L 404 ${HOR - 128} L 392 ${HOR - 118} L 410 ${HOR + 36} L 398 ${HOR + 46} L 414 ${HOR + 190} Z" fill="url(#rock)"/>`;
    b += `<path d="M 330 ${HOR - 390} Q 374 ${HOR - 388} 380 ${HOR - 346} L 390 ${HOR - 290} L 330 ${HOR - 300} L 332 ${HOR - 390} Z" fill="#a8442c" opacity="0.55"/>`;
    b += `<path d="M 282 ${HOR - 344} Q 288 ${HOR - 388} 330 ${HOR - 390} Q 374 ${HOR - 388} 380 ${HOR - 346} l 8 48 q -66 -24 -100 2 Z" fill="${P.sand50}"/>`;
    b += `<path d="M 268 ${HOR - 190} q 62 20 122 2 M 258 ${HOR - 40} q 68 20 138 2 M 248 ${HOR + 90} q 74 20 152 0" stroke="#7c2d1c" stroke-width="8" fill="none" opacity="0.5"/>`;
    // kleine Felsnadel daneben
    b += `<path d="M 168 ${HOR + 190} L 186 ${HOR + 60} L 178 ${HOR + 52} L 196 ${HOR - 30} Q 200 ${HOR - 54} 216 ${HOR - 54} Q 232 ${HOR - 52} 234 ${HOR - 28} L 246 ${HOR + 190} Z" fill="#8e3423" opacity="0.9"/>`;
    b += `<path d="M 196 ${HOR - 30} Q 200 ${HOR - 54} 216 ${HOR - 54} Q 232 ${HOR - 52} 234 ${HOR - 28} l 3 20 q -24 -10 -40 2 Z" fill="${P.sand50}" opacity="0.9"/>`;
    b += band(HOR + 178, 8, 120, '#d9ece6', { yB: HOR + 206, op: 0.5 });
    // Vogelpunkte am Fels
    b += `<circle cx="300" cy="${HOR - 200}" r="4" fill="${P.sand50}"/><circle cx="356" cy="${HOR - 160}" r="4" fill="${P.sand50}"/><circle cx="320" cy="${HOR - 60}" r="4" fill="${P.sand50}"/><circle cx="376" cy="${HOR - 20}" r="4" fill="${P.sand50}"/>`;
    // Fähre am Horizont
    b += `<g fill="#33454d"><rect x="742" y="${HOR - 34}" width="120" height="22" rx="6"/><rect x="768" y="${HOR - 52}" width="58" height="20" rx="4"/><rect x="806" y="${HOR - 64}" width="10" height="14"/></g>`;
    b += gulls([[420, 300, 30], [500, 250, 24], [370, 380, 20], [560, 350, 18], [470, 430, 15]], P.sand50);
    return wrap(defs, b);
  },

  // --- Fahrt zur Seehundsbank --------------------------------------------------
  'seehundsbank-fahrt': () => {
    const defs = lg('sky', SKY.day) + lg('bankg', [[0, '#e3d5ae'], [1, '#cdb98c']]);
    let b = skyRect('sky');
    b += sun(260, 250, 56);
    b += cloud(720, 230, 1.1) + cloud(500, 170, 0.75, P.cream, 0.8);
    b += sea(HOR - 40, H + 20, ['#6fb0ba', '#4d9aa9', '#357f92', '#26697b']);
    // Ausflugsboot in der Ferne
    b += `<g fill="#2f4750"><path d="M 700 ${HOR + 34} q 60 18 130 0 l -12 -26 l -104 0 Z"/><rect x="740" y="${HOR - 16}" width="52" height="26" rx="5" fill="${P.sand50}"/><rect x="756" y="${HOR - 34}" width="8" height="18"/></g>`;
    // Sandbank
    b += `<path d="M -20 ${HOR + 300} C 200 ${HOR + 190} 640 ${HOR + 174} 1020 ${HOR + 260} L 1020 ${H} L -20 ${H} Z" fill="url(#bankg)"/>`;
    b += `<path d="M -20 ${HOR + 306} C 200 ${HOR + 198} 640 ${HOR + 182} 1020 ${HOR + 268}" stroke="${P.cream}" stroke-width="8" fill="none" opacity="0.7"/>`;
    b += seal(300, HOR + 350, 1.5);
    b += seal(680, HOR + 316, 1.25, { flip: true, tone: '#a89e8c', belly: '#d4cbb8' });
    b += seal(500, HOR + 440, 1.75, { tone: '#c4bcae' });
    b += gulls([[500, 300, 28], [590, 260, 20], [420, 350, 17]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Seehundstation Friedrichskoog -------------------------------------------
  'seehundstation-friedrichskoog': () => {
    const defs = lg('sky', SKY.fresh) + lg('pool', [[0, '#57b0bd'], [1, '#2a8ca0']]) + lg('deck', [[0, '#e4d6b4'], [1, '#cfbd94']]);
    let b = skyRect('sky');
    b += cloud(300, 200, 1) + cloud(760, 260, 0.8);
    b += sun(180, 300, 48);
    // Stations-Gebäude als Silhouette
    b += `<g fill="#527d87"><path d="M 560 ${HOR - 10} l 0 -130 l 110 -60 l 110 60 l 0 130 Z"/><rect x="620" y="${HOR - 90}" width="44" height="44" rx="6" fill="${P.aqua100}"/><rect x="700" y="${HOR - 90}" width="44" height="44" rx="6" fill="${P.aqua100}"/></g>`;
    b += `<rect x="-20" y="${HOR - 10}" width="${W + 40}" height="60" fill="#7fae9f"/>`;
    // Becken
    b += `<rect x="-20" y="${HOR + 50}" width="${W + 40}" height="330" fill="url(#pool)"/>`;
    b += band(HOR + 120, 7, 150, '#6ec0ca', { yB: HOR + 150, op: 0.55 }) + band(HOR + 230, 8, 130, '#8ed0d6', { yB: HOR + 260, op: 0.4 });
    b += `<circle cx="810" cy="${HOR + 180}" r="34" fill="${P.coral}"/><circle cx="810" cy="${HOR + 180}" r="16" fill="url(#pool)"/>`;
    // Deck mit Heulern
    b += `<path d="M -20 ${H} L -20 ${HOR + 320} C 300 ${HOR + 280} 700 ${HOR + 280} 1020 ${HOR + 330} L 1020 ${H} Z" fill="url(#deck)"/>`;
    b += seal(320, HOR + 450, 1.7, { pup: true, tone: '#c9c1b1', belly: '#e7e0d2' });
    b += seal(680, HOR + 420, 1.45, { pup: true, flip: true, tone: '#b3aa98' });
    b += `<circle cx="510" cy="${HOR + 510}" r="34" fill="${P.aqua500}"/><path d="M 484 ${HOR + 502} a 34 34 0 0 1 52 0" fill="${P.cream}"/>`;
    b += gulls([[420, 280, 24], [520, 240, 18]], '#40616b');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Wassersport: Kite ---------------------------------------------------------
  'wassersport-schule': () => {
    const defs = lg('sky', SKY.fresh) + lg('kite', [[0, '#d1603f'], [1, '#a8432c']], [0, 0, 1, 0]);
    let b = skyRect('sky');
    b += sun(180, 250, 54);
    b += cloud(760, 180, 1.05, P.cream, 0.85);
    // Kite-Schirm
    b += `<g transform="rotate(-14 660 300)"><path d="M 480 320 C 540 200 780 200 840 320 C 770 268 550 268 480 320 Z" fill="url(#kite)"/><path d="M 508 296 C 570 224 750 224 812 296" stroke="${P.cream}" stroke-width="7" fill="none" opacity="0.7"/><path d="M 560 236 L 580 300 M 660 220 L 660 292 M 760 236 L 740 300" stroke="#8e3423" stroke-width="5" opacity="0.6"/></g>`;
    b += `<path d="M 520 330 L 330 ${HOR + 120} M 800 330 L 356 ${HOR + 134}" stroke="${P.ink}" stroke-width="4.5" opacity="0.75"/>`;
    b += sea(HOR - 30, H + 20, ['#5fa3b0', '#3d92a4', '#2b8296', '#1f6a7e', '#175a6c']);
    // Rider — groß genug, um die Szene zu tragen
    b += `<g transform="translate(340 ${HOR + 190}) scale(1.75) translate(-340 ${-(HOR + 190)})">` +
      `<g fill="${P.ink}"><circle cx="330" cy="${HOR + 90}" r="15"/><path d="M 322 ${HOR + 102} C 306 ${HOR + 126} 312 ${HOR + 154} 330 ${HOR + 168} L 352 ${HOR + 160} C 344 ${HOR + 138} 348 ${HOR + 120} 342 ${HOR + 106} Z"/><path d="M 348 ${HOR + 116} L 388 ${HOR + 96} M 348 ${HOR + 126} L 384 ${HOR + 128}" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/><path d="M 330 ${HOR + 166} L 310 ${HOR + 198} L 366 ${HOR + 206} L 356 ${HOR + 178} Z"/></g>` +
      `<rect x="266" y="${HOR + 202}" width="158" height="16" rx="8" fill="${P.gold}" transform="rotate(-9 345 ${HOR + 210})"/>` +
      `</g>`;
    b += `<path d="M 190 ${HOR + 300} q 70 -60 140 -16 M 470 ${HOR + 250} q 66 14 120 62" stroke="${P.cream}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>`;
    b += `<circle cx="182" cy="${HOR + 262}" r="9" fill="${P.cream}"/><circle cx="610" cy="${HOR + 300}" r="11" fill="${P.cream}" opacity="0.85"/><circle cx="220" cy="${HOR + 330}" r="6" fill="${P.cream}" opacity="0.7"/><circle cx="560" cy="${HOR + 250}" r="6" fill="${P.cream}" opacity="0.8"/>`;
    b += gulls([[160, 420, 26], [240, 380, 18]], P.sand50);
    return wrap(defs, b);
  },

  // --- Perlebucht ------------------------------------------------------------------
  'perlebucht-lagune': () => {
    const defs = lg('sky', SKY.day) + lg('lagune', [[0, '#9fd8d8'], [1, '#46a0af']]) + lg('spit', [[0, '#f0e4c4'], [1, '#d9c8a2']]);
    let b = skyRect('sky');
    b += sun(240, 220, 58);
    b += cloud(700, 180, 1.05);
    b += sea(HOR - 90, HOR + 10, [P.aqua300, '#57a6b4']);
    // äußerer Sandarm, der die Lagune umschließt
    b += `<path d="M -20 ${HOR - 10} C 240 ${HOR - 40} 560 ${HOR - 30} 1020 ${HOR + 10} L 1020 ${HOR + 70} C 620 ${HOR + 30} 300 ${HOR + 40} -20 ${HOR + 60} Z" fill="#e6d8b2"/>`;
    // Lagune
    b += `<rect x="-20" y="${HOR + 50}" width="${W + 40}" height="${H}" fill="url(#lagune)"/>`;
    b += band(HOR + 130, 6, 170, '#b3e2e0', { yB: HOR + 158, op: 0.55 }) + band(HOR + 250, 8, 150, '#8fd0d2', { yB: HOR + 282, op: 0.4 });
    // Badende + Schwimmring im Wasser
    b += `<circle cx="600" cy="${HOR + 170}" r="13" fill="${P.coral}"/><path d="M 584 ${HOR + 190} a 18 9 0 0 0 34 0" fill="${P.ink}" opacity="0.45"/>`;
    b += `<circle cx="700" cy="${HOR + 230}" r="11" fill="${P.gold}"/>`;
    b += `<ellipse cx="420" cy="${HOR + 226}" rx="44" ry="18" fill="${P.coral}"/><ellipse cx="420" cy="${HOR + 222}" rx="44" ry="18" fill="#d1603f"/><ellipse cx="420" cy="${HOR + 222}" rx="20" ry="8" fill="url(#lagune)"/><circle cx="424" cy="${HOR + 204}" r="12" fill="${P.ink}"/>`;
    // naher Sandarm mit Schirmen und Strandleben
    b += `<path d="M -20 ${H} L -20 ${HOR + 320} C 300 ${HOR + 260} 640 ${HOR + 330} 1020 ${HOR + 420} L 1020 ${H} Z" fill="url(#spit)"/>`;
    b += `<path d="M -20 ${HOR + 328} C 300 ${HOR + 268} 640 ${HOR + 338} 1020 ${HOR + 428}" stroke="${P.cream}" stroke-width="9" fill="none" opacity="0.85"/>`;
    // großer Sonnenschirm vorn
    b += `<g><line x1="300" y1="${HOR + 400}" x2="288" y2="${HOR + 580}" stroke="${P.woodDark}" stroke-width="11"/><path d="M 186 ${HOR + 416} a 118 74 0 0 1 232 -14 Z" fill="${P.coral}"/><path d="M 186 ${HOR + 416} a 118 74 0 0 1 232 -14" fill="none" stroke="${P.coralDark}" stroke-width="6"/><path d="M 246 ${HOR + 408} a 60 60 0 0 1 58 -52 l 8 46 Z" fill="${P.cream}" opacity="0.45"/></g>`;
    // zweiter Schirm + Decke
    b += `<g><line x1="700" y1="${HOR + 460}" x2="694" y2="${HOR + 580}" stroke="${P.woodDark}" stroke-width="8"/><path d="M 622 ${HOR + 470} a 82 52 0 0 1 162 -10 Z" fill="${P.gold}"/></g>`;
    b += `<rect x="420" y="${HOR + 500}" width="170" height="90" rx="12" fill="${P.aqua100}" transform="rotate(-6 505 ${HOR + 545})"/><rect x="440" y="${HOR + 516}" width="130" height="58" rx="8" fill="${P.aqua300}" transform="rotate(-6 505 ${HOR + 545})" opacity="0.6"/>`;
    b += `<circle cx="860" cy="${HOR + 520}" r="42" fill="${P.coral}"/><path d="M 820 ${HOR + 512} a 42 42 0 0 1 80 0" fill="${P.cream}"/>`;
    b += gulls([[460, 280, 28], [550, 240, 20], [380, 330, 16]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Wattwanderung (Schutzstation, Golden Hour) -------------------------------------
  'wattwanderung-schutzstation': () => {
    const defs =
      lg('sky', SKY.golden) +
      lg('watt1', [[0, '#c3ab7d'], [1, '#9d8a66']]) +
      lg('prielG', [[0, '#ecc27f'], [0.5, '#d9a468'], [1, '#8a9a92']]);
    let b = skyRect('sky');
    b += sun(360, 430, 96, { haloR: 2.4 });
    b += cloud(760, 240, 1.1, '#eac394', 0.5);
    b += cloud(200, 200, 0.85, '#eac394', 0.45);
    b += `<rect x="-20" y="${HOR}" width="${W + 40}" height="${H}" fill="url(#watt1)"/>`;
    b += band(HOR + 90, 5, 220, '#ac9770', { yB: HOR + 130, op: 0.8 }) + band(HOR + 240, 6, 190, '#93815f', { yB: HOR + 290, op: 0.7 });
    b += priel('prielG', 480, 1.15);
    // Wanderergruppe mit Spiegelung
    const grp = [
      [430, HOR + 120, 1.05, -3],
      [500, HOR + 128, 1.15, 4],
      [560, HOR + 116, 0.95, 0],
      [620, HOR + 130, 1.1, 5],
    ];
    for (const [x, y, s, l] of grp) b += walker(x, y, s, { lean: l, color: '#2e3c42' });
    for (const [x, y, s] of grp) b += `<g transform="translate(${x} ${y + 10}) scale(1 -0.5)" opacity="0.25">${walker(0, 0, s, { color: '#2e3c42' })}</g>`;
    b += gulls([[240, 350, 26], [700, 300, 30], [780, 360, 20]], '#4c4436');
    return wrap(defs, b);
  },

  // --- Wattführung „für Alle" (barrierearm, Tag) ------------------------------------------
  'wattfuehrung-fuer-alle': () => {
    const defs = lg('sky', SKY.fresh) + lg('prielB', [[0, '#bfe0e0'], [1, '#8fb4ae']]);
    let b = skyRect('sky');
    b += sun(210, 240, 54);
    b += cloud(680, 190, 1.15) + cloud(420, 280, 0.7, P.cream, 0.75);
    b += `<rect x="-20" y="${HOR}" width="${W + 40}" height="${H}" fill="#bda986"/>`;
    b += band(HOR + 80, 5, 240, '#a9946e', { yB: HOR + 120, op: 0.8 }) + band(HOR + 230, 6, 200, '#93805e', { yB: HOR + 280, op: 0.65 });
    b += priel('prielB', 620, 0.9);
    // Watt-Rollstuhl mit großen Ballonrädern + Begleitung — groß im Bild
    b += `<g transform="translate(420 ${HOR + 170}) scale(1.5) translate(-420 ${-(HOR + 170)})">` +
      `<g stroke="${P.ink}" fill="none" stroke-width="7">` +
      `<circle cx="380" cy="${HOR + 190}" r="44"/>` +
      `<circle cx="380" cy="${HOR + 190}" r="20" fill="${P.ink}"/>` +
      `<circle cx="472" cy="${HOR + 202}" r="26"/>` +
      `<path d="M 348 ${HOR + 120} L 412 ${HOR + 118} L 428 ${HOR + 168} L 470 ${HOR + 176}"/>` +
      `</g>` +
      `<g fill="${P.ink}"><circle cx="380" cy="${HOR + 74}" r="13"/><path d="M 366 ${HOR + 86} h 30 l 12 40 l -18 4 l -10 -26 l -18 2 Z"/></g>` +
      walker(548, HOR + 212, 1.05, { lean: -4, color: P.ink }) +
      `</g>`;
    b += walker(230, HOR + 260, 1.5, { lean: 6, stick: false, color: P.ink });
    b += footprints(700, HOR + 420, 640, HOR + 260, 7);
    b += gulls([[500, 300, 26], [590, 250, 18]], '#40616b');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Kronenloch: Vögel ------------------------------------------------------------------
  'kronenloch-voegel': () => {
    const defs = lg('sky', [[0, '#3c7181'], [0.55, '#87b6b4'], [1, '#e7d9ad']]) + lg('waterK', [[0, '#c7ceab'], [1, '#6f8f84']]);
    let b = skyRect('sky');
    b += sun(700, 350, 66, { core: '#f3d27c' });
    // aufsteigender Vogelschwarm — die eigentliche Hauptfigur der Szene
    b += gulls(
      [
        [300, 620, 34], [400, 540, 44], [510, 450, 52], [630, 350, 58], [750, 250, 46],
        [400, 680, 26], [510, 600, 32], [620, 510, 38], [720, 420, 32], [820, 330, 26],
        [560, 680, 22], [670, 600, 24], [780, 510, 20], [860, 430, 17], [340, 460, 20],
      ],
      '#243b42'
    );
    b += `<rect x="-20" y="${HOR}" width="${W + 40}" height="${H}" fill="url(#waterK)"/>`;
    b += band(HOR + 110, 4, 260, '#8fa892', { yB: HOR + 140, op: 0.5 });
    b += glints(700, HOR + 16, HOR + 90, '#f3d27c', 13, 8, 150);
    // Beobachtungshütte auf Stelzen
    b += `<g fill="#22383f"><rect x="130" y="${HOR - 108}" width="150" height="86" rx="8"/><path d="M 118 ${HOR - 108} L 205 ${HOR - 150} L 292 ${HOR - 108} Z"/><rect x="164" y="${HOR - 84}" width="34" height="26" fill="#c8b471"/><rect x="216" y="${HOR - 84}" width="34" height="26" fill="#c8b471"/><rect x="146" y="${HOR - 22}" width="10" height="70"/><rect x="254" y="${HOR - 22}" width="10" height="70"/></g>`;
    // Schilf vorn
    const reed = (x, y, s, col) =>
      `<g stroke="${col}" stroke-width="${6 * s}" stroke-linecap="round" fill="none">` +
      `<path d="M ${x} ${y} q ${-8 * s} ${-90 * s} ${-22 * s} ${-150 * s}"/>` +
      `<path d="M ${x + 18 * s} ${y} q ${2 * s} ${-100 * s} ${-4 * s} ${-170 * s}"/>` +
      `<path d="M ${x + 36 * s} ${y} q ${10 * s} ${-80 * s} ${26 * s} ${-140 * s}"/>` +
      `</g>` +
      `<ellipse cx="${x - 24 * s}" cy="${y - 156 * s}" rx="${7 * s}" ry="${26 * s}" fill="${col}" transform="rotate(-8 ${x - 24 * s} ${y - 156 * s})"/>` +
      `<ellipse cx="${x + 14 * s}" cy="${y - 176 * s}" rx="${7 * s}" ry="${28 * s}" fill="${col}"/>`;
    b += reed(90, H - 40, 2.6, '#243b30');
    b += reed(280, H + 10, 2.0, '#33503f');
    b += reed(830, H - 20, 2.8, '#243b30');
    b += reed(660, H + 30, 1.9, '#33503f');
    return wrap(defs, b);
  },

  // --- Deich-Radtour ----------------------------------------------------------------------
  'deich-radtour': () => {
    const defs = lg('sky', SKY.day) + lg('dikeR', [[0, '#83a468'], [1, '#5d7c50']]);
    let b = skyRect('sky');
    b += sun(760, 230, 60);
    b += cloud(280, 190, 1.15) + cloud(520, 290, 0.75, P.cream, 0.8);
    b += sea(HOR - 130, HOR - 40, [P.aqua300, P.aqua500]);
    // Deichkamm
    b += `<path d="M -20 ${H} L -20 ${HOR + 140} C 240 ${HOR - 10} 640 ${HOR - 60} 1020 ${HOR - 20} L 1020 ${H} Z" fill="url(#dikeR)"/>`;
    b += `<path d="M -20 ${HOR + 152} C 240 ${HOR + 2} 640 ${HOR - 48} 1020 ${HOR - 8}" stroke="${P.sand100}" stroke-width="16" fill="none"/>`;
    b += `<path d="M -20 ${HOR + 152} C 240 ${HOR + 2} 640 ${HOR - 48} 1020 ${HOR - 8}" stroke="${P.sand400}" stroke-width="3" fill="none" stroke-dasharray="26 20"/>`;
    b += cyclist(430, HOR + 2, 1.8, P.ink);
    b += sheep(180, HOR + 240, 1.2) + sheep(300, HOR + 330, 1.0) + sheep(700, HOR + 200, 0.95) + sheep(830, HOR + 300, 1.25);
    b += grassTuft(120, H - 60, 1.6) + grassTuft(900, H - 90, 1.4) + grassTuft(520, H - 30, 1.8);
    b += gulls([[550, 220, 28], [640, 180, 20]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Kartbahn ---------------------------------------------------------------------------
  'kartbahn-nordseering': () => {
    const defs = lg('sky', SKY.day) + lg('track', [[0, '#4a5560'], [1, '#333d47']]);
    let b = skyRect('sky');
    b += sun(200, 220, 52);
    b += cloud(700, 190, 1);
    // Wimpelkette
    b += `<path d="M -20 300 C 250 360 750 360 1020 290" stroke="${P.ink}" stroke-width="4" fill="none"/>`;
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const x = -20 + t * 1040;
      const y = 300 + Math.sin(Math.PI * t) * 58;
      b += `<path d="M ${x} ${y} l 16 44 l 20 -40 Z" fill="${i % 2 ? P.coral : P.aqua500}"/>`;
    }
    b += `<rect x="-20" y="${HOR - 120}" width="${W + 40}" height="140" fill="#9db98b"/>`;
    // Piste mit Curbs
    b += `<path d="M -20 ${H} L -20 ${HOR + 120} C 300 ${HOR - 10} 700 ${HOR - 10} 1020 ${HOR + 160} L 1020 ${H} Z" fill="url(#track)"/>`;
    let curb = '';
    for (let i = 0; i < 26; i++) curb += `<rect x="${i * 44}" y="0" width="22" height="18" fill="${i % 2 ? P.coral : P.cream}"/>`;
    b += `<g transform="translate(-20 ${HOR + 104}) rotate(-7)">${curb}</g>`;
    b += `<path d="M 60 ${H - 60} C 320 ${HOR + 190} 640 ${HOR + 170} 960 ${H - 120}" stroke="${P.cream}" stroke-width="7" stroke-dasharray="40 36" fill="none" opacity="0.6"/>`;
    // Kart
    const kx = 520;
    const ky = HOR + 265;
    b += `<g transform="translate(${kx} ${ky}) scale(1.8) translate(${-kx} ${-ky}) rotate(-4 ${kx} ${ky})">` +
      `<path d="M ${kx - 130} ${ky + 6} q -18 -40 30 -66 q 100 -22 190 -6 q 44 10 48 44 q 2 22 -18 28 Z" fill="${P.coral}"/>` +
      `<rect x="${kx - 24}" y="${ky - 96}" width="94" height="16" rx="8" fill="${P.coralDark}"/>` +
      `<rect x="${kx + 44}" y="${ky - 84}" width="12" height="30" fill="${P.coralDark}"/>` +
      `<circle cx="${kx - 6}" cy="${ky - 74}" r="26" fill="${P.gold}"/><rect x="${kx - 32}" y="${ky - 78}" width="24" height="12" rx="6" fill="${P.gold}"/>` +
      `<path d="M ${kx - 30} ${ky - 52} q 24 22 56 4 l 6 22 q -36 14 -68 -6 Z" fill="${P.ink}"/>` +
      `<circle cx="${kx + 82}" cy="${ky + 10}" r="40" fill="${P.ink}"/><circle cx="${kx + 82}" cy="${ky + 10}" r="16" fill="#5a6870"/>` +
      `<circle cx="${kx - 96}" cy="${ky + 12}" r="30" fill="${P.ink}"/><circle cx="${kx - 96}" cy="${ky + 12}" r="12" fill="#5a6870"/>` +
      `</g>`;
    b += `<path d="M ${kx - 420} ${ky - 70} h 150 M ${kx - 450} ${ky - 10} h 120 M ${kx - 400} ${ky + 50} h 95" stroke="${P.cream}" stroke-width="11" stroke-linecap="round" opacity="0.8"/>`;
    return wrap(defs, b, P.cream, 0.4);
  },

  // --- Adventure-Golf ------------------------------------------------------------------------
  'adventure-golf': () => {
    const defs = lg('sky', SKY.day) + lg('dune', [[0, '#ecdfba'], [1, '#d5c194']]);
    let b = skyRect('sky');
    b += sun(230, 240, 56);
    b += cloud(680, 200, 1.05) + cloud(420, 150, 0.6, P.cream, 0.7);
    b += sea(HOR - 110, HOR - 40, [P.aqua300, P.aqua500]);
    b += `<path d="M -20 ${H} L -20 ${HOR + 30} C 200 ${HOR - 60} 420 ${HOR + 40} 640 ${HOR - 10} C 820 ${HOR - 46} 940 ${HOR + 10} 1020 ${HOR - 6} L 1020 ${H} Z" fill="url(#dune)"/>`;
    // Windmühlen-Hindernis
    const mx = 700;
    const my = HOR + 130;
    b += `<path d="M ${mx - 66} ${my} L ${mx - 40} ${my - 190} L ${mx + 40} ${my - 190} L ${mx + 66} ${my} Z" fill="${P.sand50}"/>` +
      `<path d="M ${mx - 40} ${my - 190} L ${mx} ${my - 250} L ${mx + 40} ${my - 190} Z" fill="${P.coral}"/>` +
      `<rect x="${mx - 16}" y="${my - 64}" width="32" height="64" rx="8" fill="${P.aqua700}"/>` +
      `<g stroke="${P.gold}" stroke-width="12" stroke-linecap="round">` +
      `<line x1="${mx}" y1="${my - 210}" x2="${mx + 92}" y2="${my - 300}"/>` +
      `<line x1="${mx}" y1="${my - 210}" x2="${mx - 92}" y2="${my - 120}"/>` +
      `<line x1="${mx}" y1="${my - 210}" x2="${mx + 92}" y2="${my - 120}"/>` +
      `<line x1="${mx}" y1="${my - 210}" x2="${mx - 92}" y2="${my - 300}"/>` +
      `</g><circle cx="${mx}" cy="${my - 210}" r="12" fill="${P.coralDark}"/>`;
    // Putting-Bahn
    b += `<path d="M 120 ${H - 60} C 180 ${HOR + 220} 420 ${HOR + 150} 620 ${HOR + 190} L 600 ${HOR + 260} C 430 ${HOR + 230} 260 ${HOR + 310} 240 ${H} Z" fill="#79a465"/>`;
    b += `<ellipse cx="560" cy="${HOR + 222}" rx="20" ry="10" fill="${P.ink}"/>`;
    b += `<line x1="560" y1="${HOR + 224}" x2="560" y2="${HOR + 40}" stroke="${P.ink}" stroke-width="8"/>`;
    b += `<path d="M 560 ${HOR + 40} l 104 20 l -104 32 Z" fill="${P.coral}"/>`;
    b += `<circle cx="300" cy="${HOR + 300}" r="18" fill="${P.cream}" stroke="${P.sand400}" stroke-width="2.5"/>`;
    b += `<path d="M 330 ${HOR + 296} q 40 -18 84 -30" stroke="${P.cream}" stroke-width="4" stroke-dasharray="10 12" fill="none" opacity="0.8"/>`;
    b += grassTuft(140, HOR + 160, 1.3) + grassTuft(880, HOR + 120, 1.5) + grassTuft(820, H - 60, 1.8);
    b += gulls([[480, 260, 24], [560, 220, 17]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Phänomania (Indoor, Wissenschaft) -------------------------------------------------------
  'phaenomania': () => {
    const defs = lg('lab', [[0, '#123a46'], [0.6, '#0f2f3a'], [1, '#0a2029']]) + rg('glowG', [[0, '#f6c453', 0.9], [1, '#f6c453', 0]]);
    let b = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#lab)"/>`;
    // Orbit-Ellipsen
    b += `<g fill="none" stroke="${P.aqua300}" opacity="0.5">` +
      `<ellipse cx="500" cy="520" rx="330" ry="120" stroke-width="3" transform="rotate(-18 500 520)"/>` +
      `<ellipse cx="500" cy="520" rx="250" ry="88" stroke-width="2.4" transform="rotate(24 500 520)"/>` +
      `</g>`;
    b += `<circle cx="266" cy="430" r="16" fill="${P.aqua500}"/><circle cx="748" cy="620" r="11" fill="${P.coral}"/>`;
    // Pendel
    b += `<line x1="500" y1="60" x2="500" y2="470" stroke="${P.sand100}" stroke-width="5"/>`;
    b += `<path d="M 500 60 Q 300 240 260 470 M 500 60 Q 700 240 740 470" stroke="${P.sand100}" stroke-width="3" stroke-dasharray="4 16" fill="none" opacity="0.6"/>`;
    b += `<circle cx="500" cy="520" r="120" fill="url(#glowG)"/><circle cx="500" cy="520" r="56" fill="${P.gold}"/><circle cx="480" cy="500" r="16" fill="${P.cream}" opacity="0.7"/>`;
    // Zahnrad
    let gear = '';
    for (let i = 0; i < 10; i++) gear += `<rect x="-9" y="-74" width="18" height="26" rx="5" fill="${P.aqua300}" transform="rotate(${i * 36})"/>`;
    b += `<g transform="translate(200 900)" opacity="0.85">${gear}<circle r="56" fill="none" stroke="${P.aqua300}" stroke-width="14"/><circle r="16" fill="${P.aqua300}"/></g>`;
    // Prisma + Strahl
    b += `<path d="M 700 950 L 790 800 L 880 950 Z" fill="none" stroke="${P.sand100}" stroke-width="6"/>` +
      `<line x1="560" y1="900" x2="742" y2="880" stroke="${P.cream}" stroke-width="5"/>` +
      `<g stroke-width="7"><line x1="812" y1="866" x2="960" y2="800" stroke="${P.coral}"/><line x1="816" y1="880" x2="964" y2="856" stroke="${P.gold}"/><line x1="816" y1="894" x2="960" y2="912" stroke="${P.aqua500}"/></g>`;
    b += stars(21, 26, 80, 1300, P.aqua100);
    return wrap(defs, b, P.aqua300, 0.4);
  },

  // --- Wellenbad (Indoor) ------------------------------------------------------------------------
  'meerzeit-wellenbad': () => {
    const defs =
      lg('glass', [[0, '#bfe0e6'], [1, '#e8f2ea']]) +
      lg('poolW', [[0, '#4fa9b8'], [1, '#1f7488']]) +
      lg('hall', [[0, '#e6f0ee'], [1, '#cfe4e4']]);
    let b = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#hall)"/>`;
    // Glasfront mit Blick auf Meer
    b += `<rect x="70" y="90" width="860" height="560" rx="60" fill="url(#glass)" stroke="#9db9bb" stroke-width="10"/>`;
    b += `<g clip-path="url(#gc)"><clipPath id="gc"><rect x="80" y="100" width="840" height="540" rx="52"/></clipPath>` +
      `<rect x="80" y="100" width="840" height="540" fill="#cde9ea"/>` +
      `<rect x="80" y="430" width="840" height="210" fill="${P.aqua300}"/>` +
      `<circle cx="300" cy="240" r="54" fill="${P.sun}"/>` +
      cloud(660, 220, 0.9, P.cream, 0.9) +
      gulls([[500, 320, 26], [590, 280, 18]], '#5b7c84') +
      `</g>`;
    b += `<path d="M 70 370 h 860 M 70 510 h 860 M 355 90 v 560 M 645 90 v 560" stroke="#9db9bb" stroke-width="9"/>`;
    // Becken mit großer, brechender Welle (Curl rechts)
    b += `<rect x="-20" y="700" width="${W + 40}" height="${H}" fill="url(#poolW)"/>`;
    b += `<path d="M -20 900 C 160 860 340 840 480 790 C 620 740 700 680 720 620 C 840 640 880 740 850 810 C 810 792 770 796 740 820 C 900 830 980 880 1020 920 L 1020 ${H} L -20 ${H} Z" fill="#2e8496"/>`;
    // Curl-Kamm mit Schaum
    b += `<path d="M 720 620 C 840 640 880 740 850 810" fill="none" stroke="${P.cream}" stroke-width="16" stroke-linecap="round"/>`;
    b += `<circle cx="846" cy="812" r="26" fill="${P.cream}"/><circle cx="810" cy="826" r="19" fill="${P.cream}"/><circle cx="774" cy="830" r="14" fill="${P.cream}"/><circle cx="744" cy="826" r="10" fill="${P.cream}"/>`;
    b += `<path d="M -20 902 C 160 862 340 842 480 792" stroke="${P.cream}" stroke-width="10" fill="none" opacity="0.8" stroke-linecap="round"/>`;
    // Gischt
    b += `<circle cx="760" cy="580" r="9" fill="${P.cream}"/><circle cx="820" cy="608" r="7" fill="${P.cream}" opacity="0.85"/><circle cx="700" cy="570" r="6" fill="${P.cream}" opacity="0.8"/><circle cx="874" cy="660" r="8" fill="${P.cream}" opacity="0.8"/>`;
    b += band(1020, 10, 150, '#66b5c2', { yB: 1060, op: 0.55 }) + band(1180, 12, 130, '#7fc4cd', { yB: 1230, op: 0.4 });
    // Schwimmring
    b += `<ellipse cx="260" cy="1090" rx="104" ry="42" fill="${P.coralDark}"/><ellipse cx="260" cy="1078" rx="104" ry="42" fill="#d1603f"/><ellipse cx="260" cy="1078" rx="48" ry="18" fill="url(#poolW)"/>` +
      `<path d="M 170 1064 a 104 42 0 0 1 48 -32 M 296 1042 a 104 42 0 0 1 54 26" stroke="${P.cream}" stroke-width="12" fill="none"/>`;
    return wrap(defs, b, P.aqua700, 0.35);
  },

  // --- Sauna „Meerzeit" (Indoor) --------------------------------------------------------------------
  'spa-meerzeit': () => {
    const defs =
      lg('wood', [[0, '#c99a66'], [0.5, '#b3824f'], [1, '#8f6238']]) +
      rg('stoveGlow', [[0, '#f6c453', 0.75], [1, '#f6c453', 0]]) +
      lg('sea9', [[0, '#7bc0cd'], [1, '#2a8ca0']]);
    let b = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#wood)"/>`;
    for (let i = 0; i < 9; i++) b += `<line x1="0" y1="${120 + i * 150}" x2="${W}" y2="${120 + i * 150}" stroke="#7c5836" stroke-width="5" opacity="0.5"/>`;
    // Bullauge mit Meerblick
    b += `<circle cx="500" cy="360" r="150" fill="url(#sea9)" stroke="#6b4a2c" stroke-width="18"/>` +
      `<path d="M 358 330 a 150 150 0 0 1 60 -90" stroke="${P.cream}" stroke-width="10" fill="none" opacity="0.5"/>` +
      `<rect x="352" y="352" width="296" height="4" fill="${P.cream}" opacity="0.4"/>` +
      gull(470, 320, 22, P.cream, 4) + gull(540, 300, 16, P.cream, 3.4) +
      `<circle cx="430" cy="290" r="26" fill="${P.sun}"/>`;
    // Bänke
    b += `<g fill="#a4744a" stroke="#6b4a2c" stroke-width="4">` +
      `<rect x="40" y="880" width="560" height="46" rx="14"/>` +
      `<rect x="40" y="1060" width="700" height="50" rx="14"/>` +
      `<rect x="80" y="926" width="26" height="140"/><rect x="520" y="926" width="26" height="140"/>` +
      `</g>`;
    b += `<path d="M 60 898 h 520 M 60 1082 h 660" stroke="#6b4a2c" stroke-width="3" opacity="0.6"/>`;
    // Aufgusskübel + Kelle
    b += `<g><path d="M 660 1010 L 676 928 L 764 928 L 780 1010 Z" fill="#8f6238" stroke="#5f402a" stroke-width="5"/><ellipse cx="720" cy="928" rx="44" ry="12" fill="#5f402a"/><line x1="740" y1="920" x2="812" y2="852" stroke="#5f402a" stroke-width="9"/><circle cx="820" cy="846" r="16" fill="none" stroke="#5f402a" stroke-width="8"/></g>`;
    // Ofen mit Steinen
    b += `<circle cx="850" cy="1030" r="110" fill="url(#stoveGlow)"/>`;
    b += `<g><rect x="782" y="960" width="140" height="150" rx="18" fill="#4a4a4c"/><circle cx="822" cy="990" r="19" fill="#6d6d70"/><circle cx="874" cy="978" r="16" fill="#7d7d80"/><circle cx="852" cy="1012" r="21" fill="#606063"/><circle cx="898" cy="1010" r="15" fill="#6d6d70"/><rect x="800" y="1052" width="104" height="40" rx="8" fill="#333336"/><rect x="812" y="1062" width="80" height="18" rx="6" fill="${P.sun}"/></g>`;
    // Dampf
    b += `<g stroke="${P.cream}" stroke-width="13" stroke-linecap="round" fill="none" opacity="0.8">` +
      `<path d="M 812 930 C 780 870 840 830 806 770 C 780 726 812 690 800 650"/>` +
      `<path d="M 872 936 C 902 870 848 830 886 764 C 912 720 884 686 896 640"/>` +
      `<path d="M 190 840 C 160 790 214 756 186 706"/>` +
      `</g>`;
    return wrap(defs, b, P.cream, 0.45);
  },

  // --- museum am meer (Aquarium) -----------------------------------------------------------------------
  'museum-am-meer': () => {
    const defs =
      lg('room', [[0, '#123642'], [1, '#0a222c']]) +
      lg('tank', [[0, '#3d97a9'], [0.6, '#1f6a7e'], [1, '#155263']]);
    let b = `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#room)"/>`;
    b += `<rect x="90" y="140" width="820" height="760" rx="70" fill="url(#tank)" stroke="#d8c9a6" stroke-width="14"/>`;
    // Lichtkegel
    b += `<path d="M 250 150 L 190 890 L 330 890 Z" fill="${P.cream}" opacity="0.08"/><path d="M 620 150 L 540 890 L 700 890 Z" fill="${P.cream}" opacity="0.07"/>`;
    // Fischschwarm
    b += fish(300, 340, 1.4, '#e8b45c') + fish(400, 300, 1.1, '#e8b45c') + fish(360, 420, 1.2, '#d98a4d') + fish(500, 380, 1.6, '#7bc0cd') + fish(590, 300, 1.15, '#e8b45c', true) + fish(650, 430, 1.3, '#d98a4d') + fish(720, 350, 1.0, '#7bc0cd', true) + fish(560, 500, 1.05, '#e8b45c');
    // Plattfisch + Krabbe unten
    b += `<ellipse cx="720" cy="800" rx="66" ry="26" fill="#a58a5b"/><circle cx="694" cy="792" r="4" fill="${P.night}"/><circle cx="712" cy="790" r="4" fill="${P.night}"/>`;
    b += `<g transform="translate(320 810)"><ellipse rx="40" ry="26" fill="${P.coral}"/><path d="M -34 -14 q -22 -22 -8 -38 M 34 -14 q 22 -22 8 -38" stroke="${P.coral}" stroke-width="9" fill="none"/><circle cx="-30" cy="-36" r="8" fill="${P.coral}"/><circle cx="30" cy="-36" r="8" fill="${P.coral}"/><path d="M -36 16 l -18 16 M -16 22 l -12 20 M 16 22 l 12 20 M 36 16 l 18 16" stroke="${P.coral}" stroke-width="7"/></g>`;
    // Wasserpflanzen + Boden
    b += `<path d="M 90 860 q 210 -26 410 0 q 210 26 410 0 l 0 40 l -820 0 Z" fill="#0f3d49"/>`;
    b += grassTuft(180, 866, 2.2, '#2f7d75') + grassTuft(500, 880, 1.8, '#2f7d75') + grassTuft(840, 862, 2.4, '#25655f');
    for (let i = 0; i < 8; i++) b += `<circle cx="${170 + i * 40}" cy="${560 - i * 44}" r="${5 + (i % 3)}" fill="${P.aqua100}" opacity="0.5"/>`;
    // Besucher-Silhouetten
    b += `<g fill="#04121a"><circle cx="430" cy="1050" r="34"/><rect x="390" y="1078" width="80" height="330" rx="30"/><circle cx="560" cy="1120" r="26"/><rect x="530" y="1142" width="60" height="270" rx="24"/></g>`;
    return wrap(defs, b, P.aqua300, 0.4);
  },

  // --- KOHLosseum -----------------------------------------------------------------------------------------
  'kohlosseum': () => {
    const defs = lg('sky', SKY.day) + lg('field', [[0, '#9db98b'], [1, '#6f8f5f']]);
    let b = skyRect('sky');
    b += sun(230, 230, 54);
    b += cloud(700, 200, 1.05);
    b += `<rect x="-20" y="${HOR - 60}" width="${W + 40}" height="${H}" fill="url(#field)"/>`;
    // Feldreihen
    for (let i = 0; i < 6; i++) {
      const y = HOR - 20 + i * 26;
      b += `<path d="M ${500 - (i + 1) * 150} ${H} L 500 ${HOR - 40}" stroke="#5d7c50" stroke-width="${6 + i}" opacity="0.45"/><path d="M ${500 + (i + 1) * 150} ${H} L 500 ${HOR - 40}" stroke="#5d7c50" stroke-width="${6 + i}" opacity="0.45"/>`;
      void y;
    }
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5 + r; c++) {
        const y = HOR + 20 + r * 56;
        const x = 500 + (c - (4 + r) / 2) * (130 + r * 40);
        if (Math.abs(x - 500) > 470) continue;
        b += `<circle cx="${x}" cy="${y}" r="${13 + r * 4}" fill="#88a86f"/><circle cx="${x - 4}" cy="${y - 3}" r="${8 + r * 3}" fill="#a9c48c"/>`;
      }
    }
    // Riesenkohl thront AUF der Kiste — der Star der Szene
    const cx = 500;
    const cy = H - 520; // Kugelzentrum
    b += `<g><rect x="300" y="${H - 400}" width="400" height="180" rx="12" fill="${P.wood}" stroke="${P.woodDark}" stroke-width="7"/><path d="M 300 ${H - 340} h 400 M 300 ${H - 282} h 400" stroke="${P.woodDark}" stroke-width="6"/></g>`;
    // äußere Blätter rundum (Rosette)
    const leaf = (rot, len, wid, col) =>
      `<path d="M 0 0 C ${-wid} ${-len * 0.35} ${-wid * 0.7} ${-len * 0.85} 0 ${-len} C ${wid * 0.7} ${-len * 0.85} ${wid} ${-len * 0.35} 0 0 Z" fill="${col}" transform="translate(${cx} ${cy + 60}) rotate(${rot})"/>`;
    b += leaf(-78, 230, 120, '#5d8748') + leaf(78, 230, 120, '#5d8748') + leaf(-46, 260, 130, '#6f9a58') + leaf(46, 260, 130, '#6f9a58') + leaf(-16, 280, 140, '#7ca863') + leaf(16, 280, 140, '#7ca863');
    // Kopf
    b += `<circle cx="${cx}" cy="${cy}" r="160" fill="#8fb474"/>`;
    b += `<path d="M ${cx - 120} ${cy - 40} C ${cx - 60} ${cy - 140} ${cx + 80} ${cy - 130} ${cx + 120} ${cy - 30}" stroke="#b8d29c" stroke-width="15" fill="none"/>`;
    b += `<path d="M ${cx - 95} ${cy + 40} C ${cx - 30} ${cy - 40} ${cx + 65} ${cy - 36} ${cx + 100} ${cy + 40}" stroke="#b8d29c" stroke-width="11" fill="none"/>`;
    b += `<path d="M ${cx - 40} ${cy - 130} C ${cx + 4} ${cy - 80} ${cx + 10} ${cy - 20} ${cx - 6} ${cy + 70}" stroke="#6f9a58" stroke-width="10" fill="none"/>`;
    b += `<path d="M ${cx - 130} ${cy + 70} q 130 70 260 0" stroke="#6f9a58" stroke-width="10" fill="none" opacity="0.7"/>`;
    // kleine Kohlköpfe daneben
    b += `<circle cx="210" cy="${H - 250}" r="56" fill="#88a86f"/><circle cx="200" cy="${H - 258}" r="38" fill="#a9c48c"/><path d="M 168 ${H - 274} q 40 -26 80 0" stroke="#c3d8a8" stroke-width="7" fill="none"/>`;
    b += `<circle cx="792" cy="${H - 236}" r="48" fill="#88a86f"/><circle cx="784" cy="${H - 243}" r="32" fill="#a9c48c"/>`;
    b += gulls([[560, 260, 24], [640, 220, 17]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Landesmuseum Meldorf ---------------------------------------------------------------------------------
  'landesmuseum-meldorf': () => {
    const defs = lg('sky', SKY.day) + lg('brick', [[0, '#b2543c'], [1, '#8e3423']]);
    let b = skyRect('sky');
    b += sun(210, 220, 52);
    b += cloud(760, 210, 1);
    // Treppengiebel-Fassade
    const gx = 500;
    const gy = HOR + 240;
    b += `<g>` +
      `<rect x="${gx - 260}" y="${gy - 420}" width="520" height="420" fill="url(#brick)"/>` +
      `<path d="M ${gx - 260} ${gy - 420} h 60 v -46 h 56 v -46 h 56 v -46 h 56 v -46 h 64 v 46 h 56 v 46 h 56 v 46 h 56 v 46 h 60" fill="url(#brick)" stroke="none"/>` +
      `<path d="M ${gx - 260} ${gy - 420} h 60 v -46 h 56 v -46 h 56 v -46 h 56 v -46 h 64 v 46 h 56 v 46 h 56 v 46 h 56 v 46 h 60" fill="none" stroke="${P.sand100}" stroke-width="7"/>` +
      `</g>`;
    // Fenster (Rundbögen)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = gx - 150 + c * 150;
        const y = gy - 350 + r * 150;
        b += `<path d="M ${x - 34} ${y + 76} v -50 a 34 34 0 0 1 68 0 v 50 Z" fill="${P.aqua100}" stroke="${P.sand100}" stroke-width="6"/><line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + 76}" stroke="${P.sand100}" stroke-width="4"/>`;
      }
    }
    b += `<path d="M ${gx - 44} ${gy} v -104 a 44 44 0 0 1 88 0 v 104 Z" fill="#5f402a" stroke="${P.sand100}" stroke-width="6"/><circle cx="${gx + 20}" cy="${gy - 56}" r="5" fill="${P.gold}"/>`;
    b += `<circle cx="${gx}" cy="${gy - 470}" r="4" fill="${P.ink}"/><path d="M ${gx} ${gy - 500} v 30 M ${gx} ${gy - 496} l 40 8 l -40 10 Z" stroke="${P.ink}" stroke-width="4" fill="${P.coral}"/>`;
    // Bäume
    const tree = (x, y, s) =>
      `<rect x="${x - 7 * s}" y="${y - 60 * s}" width="${14 * s}" height="${60 * s}" fill="${P.woodDark}"/>` +
      `<circle cx="${x}" cy="${y - 96 * s}" r="${52 * s}" fill="#6f8f5f"/><circle cx="${x - 34 * s}" cy="${y - 72 * s}" r="${34 * s}" fill="#7d9b6a"/><circle cx="${x + 36 * s}" cy="${y - 70 * s}" r="${36 * s}" fill="#5d7c50"/>`;
    b += tree(120, gy, 1.15) + tree(880, gy, 1.3);
    // Kopfsteinpflaster
    b += `<rect x="-20" y="${gy}" width="${W + 40}" height="${H}" fill="#c9bda4"/>`;
    const rnd = mulberry32(31);
    for (let i = 0; i < 60; i++) {
      const x = rnd() * W;
      const y = gy + 24 + rnd() * (H - gy - 40);
      const s = 0.7 + ((y - gy) / (H - gy)) * 1.4;
      b += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${26 * s}" ry="${11 * s}" fill="#b8ab90" stroke="#a1957c" stroke-width="2"/>`;
    }
    b += gulls([[350, 250, 24], [430, 210, 17]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Promenaden-Bummel mit Eis ------------------------------------------------------------------------------
  'promenaden-bummel': () => {
    const defs = lg('sky', SKY.day) + lg('prom', [[0, '#dcd2ba'], [1, '#c4b795']]);
    let b = skyRect('sky');
    b += sun(700, 230, 60);
    b += cloud(260, 190, 1.05) + cloud(480, 290, 0.7, P.cream, 0.75);
    b += sea(HOR - 120, HOR + 60, [P.aqua300, P.aqua500, '#2a7f93']);
    b += glints(700, HOR - 90, HOR + 20, P.cream, 17, 9, 130);
    // Promenade
    b += `<path d="M -20 ${H} L -20 ${HOR + 90} L 1020 ${HOR + 40} L 1020 ${H} Z" fill="url(#prom)"/>`;
    b += `<path d="M -20 ${HOR + 150} L 1020 ${HOR + 96} M -20 ${HOR + 260} L 1020 ${HOR + 190} M -20 ${HOR + 420} L 1020 ${HOR + 330}" stroke="#a89a78" stroke-width="4" opacity="0.6"/>`;
    // Geländer
    b += `<g stroke="${P.sand50}" stroke-width="11" fill="none">` +
      `<path d="M -20 ${HOR - 14} L 1020 ${HOR - 66}"/>` +
      `<path d="M -20 ${HOR + 34} L 1020 ${HOR - 22}"/>` +
      `</g>`;
    for (let i = 0; i < 8; i++) {
      const x = 30 + i * 136;
      const y0 = HOR - 14 - (x + 20) * (48 / 1040);
      b += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0 + 106}" stroke="${P.sand50}" stroke-width="10"/>`;
    }
    // Laterne
    b += `<g><line x1="150" y1="${HOR + 118}" x2="150" y2="${HOR - 210}" stroke="${P.aqua900}" stroke-width="12"/><circle cx="150" cy="${HOR - 236}" r="30" fill="${P.sun}" stroke="${P.aqua900}" stroke-width="8"/><path d="M 120 ${HOR - 258} h 60" stroke="${P.aqua900}" stroke-width="8"/></g>`;
    // Riesen-Eiswaffel
    const ix = 680;
    const iy = HOR + 270;
    b += `<g transform="translate(${ix} ${iy}) scale(1.18) translate(${-ix} ${-iy}) rotate(6 ${ix} ${iy})">` +
      `<path d="M ${ix - 110} ${iy} L ${ix} ${iy + 330} L ${ix + 110} ${iy} Z" fill="#d9a862"/>` +
      `<path d="M ${ix - 96} ${iy + 40} l 190 0 M ${ix - 78} ${iy + 96} l 156 0 M ${ix - 58} ${iy + 152} l 118 0 M ${ix - 40} ${iy + 206} l 80 0 M ${ix - 66} ${iy - 4} l 60 190 M ${ix + 8} ${iy - 4} l 44 150 M ${ix - 8} ${iy - 4} l -44 150 M ${ix + 66} ${iy - 4} l -60 190" stroke="#b9884b" stroke-width="5"/>` +
      `<circle cx="${ix - 44}" cy="${iy - 44}" r="62" fill="${P.cream}"/>` +
      `<circle cx="${ix + 48}" cy="${iy - 52}" r="58" fill="${P.coral}"/>` +
      `<circle cx="${ix - 2}" cy="${iy - 122}" r="60" fill="#e8b45c"/>` +
      `<path d="M ${ix - 30} ${iy - 150} a 60 60 0 0 1 56 -28" stroke="${P.cream}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
      `<line x1="${ix + 34}" y1="${iy - 168}" x2="${ix + 70}" y2="${iy - 238}" stroke="${P.woodDark}" stroke-width="7"/><path d="M ${ix + 70} ${iy - 238} a 26 26 0 1 1 2 0 Z" fill="${P.coral}"/>` +
      `</g>`;
    b += gulls([[300, 330, 30], [390, 290, 22], [240, 400, 17]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },

  // --- Schlafstrandkorb (Nacht) ---------------------------------------------------------------------------------
  'schlafstrandkorb': () => {
    const defs =
      lg('sky', SKY.night) +
      rg('moonG', [[0, P.moon, 0.5], [1, P.moon, 0]]) +
      rg('seatGlow', [[0, '#f9d98c', 0.95], [1, '#c9932e', 0.85]]) +
      rg('lampGlow', [[0, '#f6c453', 0.5], [1, '#f6c453', 0]]) +
      lg('nsea', [[0, '#14424e'], [1, '#0c2a34']]) +
      lg('nsand', [[0, '#57584e'], [1, '#3a3d38']]);
    let b = skyRect('sky');
    b += stars(9, 46, 60, HOR - 120);
    b += `<circle cx="260" cy="290" r="170" fill="url(#moonG)"/><circle cx="260" cy="290" r="76" fill="${P.moon}"/><circle cx="234" cy="270" r="14" fill="#ddd2b4"/><circle cx="286" cy="316" r="10" fill="#ddd2b4"/><circle cx="282" cy="266" r="7" fill="#ddd2b4"/>`;
    b += `<path d="M 640 200 l 110 44" stroke="${P.moon}" stroke-width="4" stroke-linecap="round" opacity="0.8"/><circle cx="750" cy="244" r="5" fill="${P.moon}"/>`;
    b += `<rect x="-20" y="${HOR}" width="${W + 40}" height="220" fill="url(#nsea)"/>`;
    b += glints(260, HOR + 12, HOR + 150, P.moon, 23, 12, 170);
    b += `<path d="M -20 ${H} L -20 ${HOR + 200} C 300 ${HOR + 150} 700 ${HOR + 160} 1020 ${HOR + 210} L 1020 ${H} Z" fill="url(#nsand)"/>`;
    b += strandkorb(620, HOR + 470, 1.35, { dark: true, glowSeat: true });
    // Laterne im Sand
    b += `<g><circle cx="380" cy="${HOR + 430}" r="70" fill="url(#lampGlow)"/><line x1="380" y1="${HOR + 470}" x2="380" y2="${HOR + 400}" stroke="#20272b" stroke-width="7"/><rect x="352" y="${HOR + 396}" width="56" height="70" rx="12" fill="#20272b"/><rect x="362" y="${HOR + 408}" width="36" height="46" rx="8" fill="${P.sun}"/></g>`;
    b += grassTuft(150, HOR + 300, 1.5, '#2c3630') + grassTuft(880, HOR + 330, 1.3, '#2c3630');
    return wrap(defs, b, P.moon, 0.35);
  },

  // === MOOD-KARTEN ===========================================================

  'mood-wasser': () => {
    const defs = lg('sky', SKY.fresh);
    let b = skyRect('sky');
    b += sun(500, 400, 120, { haloR: 2.2 });
    b += cloud(220, 220, 0.9, P.cream, 0.8) + cloud(800, 300, 1.05, P.cream, 0.7);
    b += sea(HOR, H + 20, ['#5fa3b0', '#3d92a4', '#2b8296', '#206b7f', '#175a6c']);
    b += glints(500, HOR + 16, HOR + 220, P.cream, 27, 16, 240);
    b += kutter(500, HOR + 6, 0.8, { sil: '#1d3a43' });
    b += gulls([[300, 480, 34], [390, 430, 24], [640, 460, 28], [720, 520, 18]], P.sand50);
    return wrap(defs, b);
  },

  'mood-watt': () => {
    const defs = lg('sky', SKY.golden) + lg('prielM', [[0, '#ecc27f'], [0.55, '#d9a468'], [1, '#8a9a92']]);
    let b = skyRect('sky');
    b += sun(500, 500, 110, { haloR: 2.3 });
    b += cloud(230, 230, 0.9, '#eac394', 0.5);
    b += `<rect x="-20" y="${HOR}" width="${W + 40}" height="${H}" fill="#ab9670"/>`;
    b += band(HOR + 100, 5, 230, '#98855f', { yB: HOR + 150, op: 0.8 }) + band(HOR + 280, 7, 200, '#8a7a58', { yB: HOR + 330, op: 0.7 });
    b += priel('prielM', 500, 1.3);
    b += walker(700, HOR + 100, 0.85, { lean: 3, color: '#33454d' }) + walker(760, HOR + 108, 0.75, { lean: -2, color: '#33454d' });
    b += footprints(320, H - 60, 460, HOR + 160, 9);
    b += gulls([[300, 400, 28], [380, 350, 20]], '#4c4436');
    return wrap(defs, b);
  },

  'mood-action': () => {
    const defs = lg('sky', SKY.fresh) + lg('kiteM', [[0, '#d1603f'], [1, '#a8432c']], [0, 0, 1, 0]);
    let b = skyRect('sky');
    b += sun(200, 260, 56);
    b += cloud(780, 200, 0.9);
    b += `<g transform="rotate(-10 620 360)"><path d="M 430 390 C 495 250 745 250 810 390 C 735 330 505 330 430 390 Z" fill="url(#kiteM)"/><path d="M 462 358 C 530 276 710 276 778 358" stroke="${P.cream}" stroke-width="8" fill="none" opacity="0.7"/></g>`;
    b += `<path d="M 470 400 L 330 ${HOR + 140} M 780 400 L 360 ${HOR + 160}" stroke="${P.ink}" stroke-width="4.5" opacity="0.7"/>`;
    b += sea(HOR - 20, H + 20, ['#57a1ae', '#3a8ea0', '#2a7d91', '#1f6a7e']);
    b += `<g transform="translate(350 ${HOR + 150}) scale(1.7) translate(-350 ${-(HOR + 150)})">` +
      `<g fill="${P.ink}"><circle cx="340" cy="${HOR + 90}" r="16"/><path d="M 330 ${HOR + 104} C 316 ${HOR + 128} 320 ${HOR + 152} 338 ${HOR + 168} L 360 ${HOR + 160} C 352 ${HOR + 140} 356 ${HOR + 122} 352 ${HOR + 108} Z"/><path d="M 356 ${HOR + 116} L 396 ${HOR + 100} M 356 ${HOR + 126} L 392 ${HOR + 130}" stroke="${P.ink}" stroke-width="9" stroke-linecap="round"/></g>` +
      `<rect x="282" y="${HOR + 166}" width="140" height="15" rx="7" fill="${P.gold}" transform="rotate(-8 352 ${HOR + 172})"/>` +
      `</g>`;
    b += `<path d="M 190 ${HOR + 290} q 70 -56 138 -14 M 500 ${HOR + 240} q 62 16 112 60" stroke="${P.cream}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.9"/>`;
    b += `<circle cx="182" cy="${HOR + 254}" r="9" fill="${P.cream}"/><circle cx="640" cy="${HOR + 292}" r="11" fill="${P.cream}" opacity="0.85"/><circle cx="560" cy="${HOR + 238}" r="6" fill="${P.cream}" opacity="0.8"/>`;
    return wrap(defs, b);
  },

  'mood-kultur': () => {
    const defs = lg('sky', SKY.golden);
    let b = skyRect('sky');
    b += sun(260, 360, 66);
    b += cloud(720, 220, 1.05, '#eac394', 0.6);
    b += sea(HOR + 60, H + 20, ['#c78a54', '#9c6a45', '#6b5545']);
    b += glints(280, HOR + 74, HOR + 190, P.cream, 29, 9, 150);
    b += `<rect x="-20" y="${HOR + 180}" width="${W + 40}" height="${H}" fill="#22404a"/>`;
    b += lighthouse(560, HOR + 190, 2.05);
    b += gulls([[300, 500, 34], [390, 450, 24], [720, 560, 26]], '#2e4d55');
    return wrap(defs, b);
  },

  'mood-wellness': () => {
    const defs = lg('sky', [[0, '#9fc6c9'], [0.6, '#cfe5df'], [1, '#efe9d6']]) + lg('calm', [[0, '#7bc0cd'], [1, '#2a8ca0']]);
    let b = skyRect('sky');
    b += sun(500, 330, 92, { core: '#f7d489', halo: '#f6c453', haloR: 2.4 });
    b += `<rect x="-20" y="${HOR - 140}" width="${W + 40}" height="${H}" fill="url(#calm)"/>`;
    b += band(HOR - 40, 3, 300, '#8fcbd4', { yB: HOR, op: 0.55 }) + band(HOR + 140, 4, 260, '#5da9b8', { yB: HOR + 190, op: 0.5 }) + band(HOR + 320, 5, 240, '#4d9dad', { yB: HOR + 370, op: 0.45 });
    b += glints(500, HOR - 120, HOR + 60, P.cream, 33, 12, 210);
    b += `<path d="M 320 ${HOR + 250} C 290 ${HOR + 170} 350 ${HOR + 120} 318 ${HOR + 40} C 296 ${HOR - 10} 330 ${HOR - 50} 320 ${HOR - 100}" stroke="${P.cream}" stroke-width="15" stroke-linecap="round" fill="none" opacity="0.75"/>`;
    b += `<path d="M 500 ${HOR + 300} C 466 ${HOR + 200} 538 ${HOR + 150} 500 ${HOR + 50} C 476 ${HOR - 10} 514 ${HOR - 60} 502 ${HOR - 130}" stroke="${P.cream}" stroke-width="21" stroke-linecap="round" fill="none" opacity="0.95"/>`;
    b += `<path d="M 680 ${HOR + 250} C 650 ${HOR + 170} 710 ${HOR + 120} 678 ${HOR + 40} C 656 ${HOR - 10} 690 ${HOR - 50} 680 ${HOR - 100}" stroke="${P.cream}" stroke-width="15" stroke-linecap="round" fill="none" opacity="0.75"/>`;
    b += `<path d="M 410 ${HOR + 180} C 392 ${HOR + 130} 424 ${HOR + 100} 406 ${HOR + 50}" stroke="${P.cream}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.55"/>`;
    b += `<path d="M 590 ${HOR + 190} C 572 ${HOR + 140} 604 ${HOR + 110} 586 ${HOR + 60}" stroke="${P.cream}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.55"/>`;
    b += gulls([[220, 300, 24], [790, 340, 20]], '#71979b');
    return wrap(defs, b, P.aqua900, 0.22);
  },

  'mood-strand': () => {
    const defs = lg('sky', SKY.day) + lg('beachM', [[0, '#eadfc2'], [1, '#d9c8a2']]);
    let b = skyRect('sky');
    b += sun(240, 250, 62);
    b += cloud(700, 210, 1.1);
    b += sea(HOR - 110, HOR + 30, [P.aqua300, P.aqua500, '#3e97a8']);
    b += band(HOR + 16, 5, 140, P.sand50, { yB: HOR + 50 });
    b += `<rect x="-20" y="${HOR + 30}" width="${W + 40}" height="${H}" fill="url(#beachM)"/>`;
    b += strandkorb(480, HOR + 400, 1.55, { stripe: P.aqua500 });
    // Sonnenschirm, schräg im Sand verankert (Drehpunkt = Schaftfuß)
    b += `<g transform="rotate(-14 830 ${HOR + 430})"><line x1="830" y1="${HOR + 430}" x2="830" y2="${HOR + 210}" stroke="${P.woodDark}" stroke-width="10"/><path d="M 730 ${HOR + 226} a 100 60 0 0 1 200 0 Z" fill="${P.coral}"/><path d="M 764 ${HOR + 226} a 66 50 0 0 1 132 0 Z" fill="${P.cream}" opacity="0.35"/><circle cx="830" cy="${HOR + 160}" r="9" fill="${P.coralDark}"/></g>`;
    b += `<circle cx="200" cy="${HOR + 450}" r="52" fill="${P.gold}"/><path d="M 150 ${HOR + 440} a 52 52 0 0 1 100 0" fill="${P.cream}"/><path d="M 166 ${HOR + 490} a 52 52 0 0 0 64 -2" fill="${P.coral}" opacity="0.9"/>`;
    b += footprints(900, H - 20, 790, HOR + 160, 8, '#c3b28d');
    b += gulls([[420, 280, 28], [510, 240, 20]], '#3f5860');
    return wrap(defs, b, P.aqua900, 0.25);
  },
};

// Aliasse: zwei Aktivitäten teilen sich die Seehund-Grundidee bewusst NICHT —
// jede id bekommt ihre eigene Szene (siehe oben). Hier nur Vollständigkeit prüfen.

// =========================================================================
// Rendern
// =========================================================================
const outDir = join(appDir, 'assets', 'activities');
mkdirSync(outDir, { recursive: true });

const content = JSON.parse(readFileSync(join(appDir, 'assets', 'content.json'), 'utf8'));
const activityIds = content.activities.map((a) => a.id);
const moodKeys = content.moods.map((m) => `mood-${m.id}`);
const wanted = [...activityIds, ...moodKeys];

const missing = wanted.filter((id) => !SCENES[id]);
const orphans = Object.keys(SCENES).filter((id) => !wanted.includes(id));
if (missing.length || orphans.length) {
  throw new Error(`Szenen-Drift! fehlend: [${missing.join(', ')}] verwaist: [${orphans.join(', ')}]`);
}

/** Körnung: deterministisches Rauschen, als soft-light über das Motiv gelegt. */
async function noiseOverlay() {
  const w = 500;
  const h = 700;
  const rnd = mulberry32(7);
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const v = 108 + Math.floor(rnd() * 40);
    buf[i * 4] = v;
    buf[i * 4 + 1] = v;
    buf[i * 4 + 2] = v;
    buf[i * 4 + 3] = 255;
  }
  return sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .resize(W, H, { kernel: 'nearest' })
    .png()
    .toBuffer();
}

async function main() {
  const sheetArgIx = process.argv.indexOf('--sheet');
  const sheetPath = sheetArgIx > -1 ? process.argv[sheetArgIx + 1] : null;

  const noise = await noiseOverlay();
  const rendered = [];
  let total = 0;

  for (const id of wanted) {
    const svg = SCENES[id]();
    const webp = await sharp(Buffer.from(svg))
      .composite([{ input: noise, blend: 'soft-light' }])
      .webp({ quality: 80 })
      .toBuffer();
    const file = join(outDir, `${id}.webp`);
    writeFileSync(file, webp);
    total += webp.length;
    rendered.push({ id, file, kb: Math.round(webp.length / 1024) });
    console.log(`  ${id}.webp — ${Math.round(webp.length / 1024)} KB`);
  }

  // Scrim für das Karten-Layout (transparent → aqua900)
  const scrimSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="256"><defs>${lg('s', [[0, P.aqua900, 0], [0.45, P.aqua900, 0.45], [1, P.aqua900, 0.94]])}</defs><rect width="8" height="256" fill="url(#s)"/></svg>`;
  const scrim = await sharp(Buffer.from(scrimSvg)).webp({ quality: 90, alphaQuality: 90 }).toBuffer();
  writeFileSync(join(outDir, 'card-scrim.webp'), scrim);

  // Require-Map generieren (Muster: heroImages.ts)
  const map =
    `// GENERIERT von scripts/generate-activity-art.mjs — nicht von Hand editieren.\n` +
    `// Metro braucht statische require()-Pfade, daher diese Map.\n` +
    `export const activityArt: Record<string, number> = {\n` +
    wanted.map((id) => `  '${id}': require('../../assets/activities/${id}.webp'),`).join('\n') +
    `\n};\n\n` +
    `export const cardScrim = require('../../assets/activities/card-scrim.webp');\n`;
  writeFileSync(join(appDir, 'src', 'data', 'activityArt.ts'), map);

  console.log(`\n${wanted.length} Motive, gesamt ${(total / 1024 / 1024).toFixed(2)} MB → assets/activities/`);

  // Kontaktbogen für die Qualitätsschleife
  if (sheetPath) {
    const cols = 6;
    const rows = Math.ceil(wanted.length / cols);
    const tw = 300;
    const th = 420;
    const thumbs = await Promise.all(
      rendered.map(async (r, i) => ({
        input: await sharp(r.file).resize(tw, th).toBuffer(),
        left: (i % cols) * tw,
        top: Math.floor(i / cols) * th,
      }))
    );
    await sharp({ create: { width: cols * tw, height: rows * th, channels: 3, background: '#222' } })
      .composite(thumbs)
      .png()
      .toFile(sheetPath);
    console.log(`Kontaktbogen: ${sheetPath}`);
  }
}

await main();
