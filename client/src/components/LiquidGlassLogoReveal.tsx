import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import bcareMarkImg from '../assets/bcare-mark.png';
import bcareHorizImg from '../assets/bcare-logo-horizontal.png';

/* ------------------------------------------------------------------ *
 * B care Bespoke SVG Logo for Liquid Glass Refraction
 * ------------------------------------------------------------------ */
const BCARE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bcareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="50%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
  </defs>
  <rect x="20" y="20" width="160" height="160" rx="52" fill="url(#bcareGrad)"/>
  <path fill="#ffffff" d="M88 48H112V88H152V112H112V152H88V112H48V88H88Z"/>
</svg>
`.trim();

const TEX = 1024;
const BOX = 0.75;

/* ------------------------------------------------------------------ *
 * Math & Physics Helpers (Snell's Law, EDT, Spring Physics)
 * ------------------------------------------------------------------ */
const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => { 
  const t = clamp01((x - a) / (b - a)); 
  return t * t * (3 - 2 * t); 
};
const hexToRgb = (h: string): [number, number, number] => { 
  const v = parseInt(h.slice(1), 16); 
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]; 
};
const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function spring(t: number, response: number, damping: number) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI / response;
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * w * t) * (Math.cos(wd * t) + (damping * w / wd) * Math.sin(wd * t));
}

const reachCache = new Map<string, number>();
function timeToReach(level: number, response: number, damping: number) {
  const key = `${level}/${response}/${damping}`;
  if (!reachCache.has(key)) {
    let lo = 0, hi = 3;
    for (let i = 0; i < 40; i++) { 
      const mid = (lo + hi) / 2; 
      if (spring(mid, response, damping) < level) lo = mid; 
      else hi = mid; 
    }
    reachCache.set(key, hi);
  }
  return reachCache.get(key)!;
}

function edt(grid: Float64Array, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  for (let x = 0; x < TEX; x++) edt1d(grid, x, TEX, f, v, z, INF);
  for (let y = 0; y < TEX; y++) edt1d(grid, y * TEX, 1, f, v, z, INF);
}

function edt1d(grid: Float64Array, offset: number, stride: number, f: Float64Array, v: Uint16Array, z: Float64Array, INF: number) {
  v[0] = 0; z[0] = -INF; z[1] = INF; f[0] = grid[offset];
  for (let q = 1, k = 0, s = 0; q < TEX; q++) {
    f[q] = grid[offset + q * stride];
    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  for (let q = 0, k = 0; q < TEX; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k], qr = q - r;
    grid[offset + q * stride] = f[r] + qr * qr;
  }
}

function buildSdf(canvas: HTMLCanvasElement) {
  const n = TEX * TEX;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array(n);
  const alpha = ctx.getImageData(0, 0, TEX, TEX).data;
  const INF = 1e20;
  const outer = new Float64Array(n), inner = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = alpha[i * 4 + 3] / 255;
    if (a >= 1) { outer[i] = 0; inner[i] = INF; }
    else if (a <= 0) { outer[i] = INF; inner[i] = 0; }
    else {
      const dd = 0.5 - a;
      outer[i] = dd > 0 ? dd * dd : 0;
      inner[i] = dd < 0 ? dd * dd : 0;
    }
  }
  const f = new Float64Array(TEX), z = new Float64Array(TEX + 1), v = new Uint16Array(TEX);
  edt(outer, f, v, z, INF);
  edt(inner, f, v, z, INF);
  const sdf = new Float32Array(n);
  for (let i = 0; i < n; i++) sdf[i] = (Math.sqrt(outer[i]) - Math.sqrt(inner[i])) / TEX;
  return sdf;
}

function fitToTexture(source: HTMLImageElement, sw: number, sh: number) {
  const tmp = document.createElement('canvas');
  tmp.width = TEX; tmp.height = TEX;
  const tc = tmp.getContext('2d', { willReadFrequently: true })!;
  const s0 = Math.min(TEX / sw, TEX / sh);
  const dx0 = (TEX - sw * s0) / 2, dy0 = (TEX - sh * s0) / 2;
  tc.drawImage(source, dx0, dy0, sw * s0, sh * s0);
  const d = tc.getImageData(0, 0, TEX, TEX).data;

  let opaque = true;
  for (let i = 3; i < d.length; i += 4 * 97) { if (d[i] < 250) { opaque = false; break; } }
  const key = [d[0], d[1], d[2]];
  const keyAlpha = (r: number, g: number, b: number) => Math.min(1, Math.max(0, (Math.hypot(r - key[0], g - key[1], b - key[2]) / 441 - 0.08) / 0.2));

  let x0 = TEX, y0 = TEX, x1 = -1, y1 = -1;
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const i = (y * TEX + x) * 4;
      const a = opaque ? keyAlpha(d[i], d[i + 1], d[i + 2]) * 255 : d[i + 3];
      if (a > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = TEX; y1 = TEX; }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  const s = TEX * BOX / Math.max(bw, bh);

  const out = document.createElement('canvas');
  out.width = TEX; out.height = TEX;
  const oc = out.getContext('2d', { willReadFrequently: true })!;
  oc.imageSmoothingQuality = 'high';
  const ox = TEX / 2 - (x0 + bw / 2 - dx0) * s;
  const oy = TEX / 2 - (y0 + bh / 2 - dy0) * s;
  oc.drawImage(source, ox, oy, sw * s0 * s, sh * s0 * s);
  if (opaque) {
    const im = oc.getImageData(0, 0, TEX, TEX), e = im.data;
    for (let i = 0; i < e.length; i += 4) e[i + 3] = Math.round(e[i + 3] * keyAlpha(e[i], e[i + 1], e[i + 2]));
    oc.putImageData(im, 0, 0);
  }
  return out;
}

function svgToUrl(text: string) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const svg = doc.documentElement;
  let w = parseFloat(svg.getAttribute('width') || '100'), h = parseFloat(svg.getAttribute('height') || '100');
  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) { w = vb[2]; h = vb[3]; }
  if (!(w > 0 && h > 0)) { w = h = 100; }
  const s = TEX / Math.max(w, h);
  svg.setAttribute('width', String(Math.round(w * s)));
  svg.setAttribute('height', String(Math.round(h * s)));
  const out = new XMLSerializer().serializeToString(svg);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(out);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('This image could not be read.'));
    img.src = src;
  });
}

// Module-level SDF and texture cache to ensure instantaneous subsequent renders with zero lag
let cachedSdf: Float32Array | null = null;
let cachedFitted: HTMLCanvasElement | null = null;

// Pre-warm the SDF cache in the background on startup using official B Care emblem
if (typeof window !== 'undefined') {
  setTimeout(async () => {
    try {
      if (!cachedFitted || !cachedSdf) {
        const img = await loadImage(bcareMarkImg);
        const fitted = fitToTexture(img, img.naturalWidth || 554, img.naturalHeight || 554);
        const sdf = buildSdf(fitted);
        cachedFitted = fitted;
        cachedSdf = sdf;
      }
    } catch {
      // Ignored: will fallback on demand in startAnimation
    }
  }, 0);
}

/* ------------------------------------------------------------------ *
 * WebGL2 Shaders (Zanwei / Shepovalov Denis Liquid Glass Reveal)
 * ------------------------------------------------------------------ */
const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;

uniform vec2 uCenter;
uniform float uTile;
uniform sampler2D uSdf;
uniform sampler2D uCol;
uniform float uTexSize;
uniform float uBoxFrac;

uniform float uPlateScale;
uniform float uShapeN;
uniform float uCornerN;
uniform float uOptics;
uniform float uPlateAlpha;
uniform float uLogoHalf;
uniform vec2 uLogoOff;
uniform float uBold;
uniform float uBlur;
uniform float uFrost;
uniform float uDome;
uniform float uDrop;
uniform float uPinch;
uniform float uTilt;
uniform float uRim;
uniform float uHalo;
uniform float uShadow;
uniform float uGhost;
uniform float uRipR;
uniform float uRipA;
uniform float uBare;
uniform float uReach;
uniform float uCornerPull;
uniform float uStreak;
uniform float uWiden;
uniform float uSlab;
uniform float uEtaSpread;
uniform float uFocus;
uniform float uFocusK;
uniform float uFocusSplit;
uniform float uRimLine;
uniform float uCornerOn;
uniform float uDissolve;
uniform float uGlow;
uniform float uFaceDisp;
uniform float uVivid;

uniform float uDepth;
uniform float uDisp;
uniform float uDouble;
uniform float uBevelW;
uniform float uSpec;
uniform float uIconPlate;
uniform float uUseColor;
uniform float uLightScene;

uniform vec3 uBg;
uniform vec3 uPlateCol;
uniform vec3 uLogoCol;

float px;

vec4 logoAt(vec2 q, float blur, float aa) {
  float L = uLogoHalf;
  float k = 0.5 * uBoxFrac / L;
  vec2 uv = vec2(0.5 + (q.x - uLogoOff.x) * k, 0.5 - (q.y - uLogoOff.y) * k);
  float d = texture(uSdf, uv).r / k;
  float w = 0.75 * aa + blur;
  float a = 1.0 - smoothstep(-w, w, d - uBold * L);
  vec3 c = uLogoCol;
  if (uUseColor > 0.5) {
    float lod = log2(max(1.0, w * k * uTexSize));
    vec4 c0 = textureLod(uCol, uv, lod);
    vec4 c1 = textureLod(uCol, uv, lod + 3.0);
    vec4 c2 = textureLod(uCol, uv, 7.0);
    c = c2.rgb / max(c2.a, 1e-4);
    c = mix(c, c1.rgb / max(c1.a, 1e-4), smoothstep(0.0, 0.06, c1.a));
    c = mix(c, c0.rgb / max(c0.a, 1e-4), smoothstep(0.02, 0.3, c0.a));
  }
  return vec4(c, a);
}

float shape(vec2 p, float scale, float n, out vec2 nOut, out float g, out vec2 dg) {
  vec2 pp = p / scale;
  vec2 a = max(abs(pp), vec2(1e-6));
  g = pow(pow(a.x, n) + pow(a.y, n), 1.0 / n);
  dg = sign(pp) * pow(a, vec2(n - 1.0)) * pow(max(g, 1e-6), 1.0 - n);
  float dgl = max(length(dg), 1e-6);
  nOut = dg / dgl;
  return (g - 1.0) / dgl * scale;
}

float contourRadius(vec2 p, float scale, float n) {
  vec2 a = max(abs(p / scale), vec2(1e-4));
  vec2 a1 = pow(a, vec2(n - 1.0));
  vec2 a2 = pow(a, vec2(n - 2.0));
  float k = (n - 1.0) * (a2.x * a1.y * a1.y + a2.y * a1.x * a1.x) / pow(max(dot(a1, a1), 1e-30), 1.5);
  return scale / max(k, 1e-3);
}

vec2 refractSample(float x, float bwF, float eta, float R, vec2 dirOut, vec2 p, float dome, float offMul) {
  float u = clamp(1.0 - x, 0.0, 0.995);
  float th = asin(u), thr = asin(u / eta);
  float z = uSlab + bwF * sqrt(1.0 - u * u);
  float off = offMul * z * tan(th - thr);
  off = off / (1.0 + off / (6.0 * R));
  return p - (dirOut * off + p * dome) * uOptics;
}

float gauss(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
float band(float x, float a, float b, float w) { return smoothstep(a - w, a, x) * (1.0 - smoothstep(b, b + w, x)); }

float bump(float x, float c, float w) { float d = (x - c) / w; return exp(-0.5 * d * d); }
vec3 spectrum(float x) {
  return vec3(bump(x, 0.34, 0.2) + 0.08 * bump(x, 0.93, 0.05), bump(x, 0.58, 0.1), bump(x, 0.8, 0.11));
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  px = 2.0 / uTile;
  vec2 p = (gl_FragCoord.xy - uCenter) * px;

  vec4 lg = logoAt(p, uBlur, px);
  vec3 plain = mix(uBg, lg.rgb, lg.a * uBare);

  vec2 nOut, dg; float g;
  float sd = shape(p, uPlateScale, uShapeN, nOut, g, dg);
  float s = -sd;
  float bw = max(uBevelW, 0.004) * uPlateScale;
  float x = clamp(s / bw, 0.0, 1.0);
  float R = contourRadius(p, uPlateScale, uShapeN);
  vec2 pq = p * p;
  float diag = 4.0 * pq.x * pq.y / max((pq.x + pq.y) * (pq.x + pq.y), 1e-6);
  float tilt = mix(1.0 - uTilt, 1.0, smoothstep(-0.02, 0.02, p.x * p.y));
  float pinchPart = uPinch * min(g * g, 1.0) * diag * diag * tilt;
  float dome = uDome * (1.0 - min(g * g, 1.0)) + pinchPart;
  vec2 dirOut = normalize(mix(nOut, p / max(length(p), 1e-4), 0.2));
  float cornerness = max(smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y), smoothstep(0.15, 0.75, diag));
  float offMul = 1.0 + 0.4 * max(uCornerPull - 1.0, 0.0) * tilt * cornerness * uCornerOn;
  vec2 focus = sign(p) * (pow(0.5, 1.0 / uShapeN) - uFocus * 0.70710678) * uPlateScale;
  float focusW = tilt * cornerness * uOptics * uCornerOn;
  float bwF = max(uReach, 0.004) * (1.0 + uWiden * tilt * cornerness * uCornerOn);
  float xf = clamp(s / bwF, 0.0, 1.0);
  vec2 qc = refractSample(xf, bwF, 1.5, R, dirOut, p, dome, offMul);
  float foot = max(max(length(dFdx(qc)), length(dFdy(qc))), 0.25 * px);

  vec3 bg = uBg;
  vec3 lift = mix(uBg + vec3(0.06), mix(uBg, vec3(1.0), 0.55), uLightScene);
  if (uGhost > 0.001) {
    vec2 gn, gdg; float gg;
    float gsd = shape(p, 1.0, uCornerN, gn, gg, gdg);
    bg = mix(bg, lift, uGhost * 0.12 * (1.0 - smoothstep(-0.16, 0.14, gsd)));
    bg *= 1.0 - uGhost * 0.03 * uLightScene * exp(-max(gsd, 0.0) / 0.12) * step(0.0, gsd);
  }
  float outside = max(sd, 0.0);
  if (uRipA > 0.001) {
    float d0 = (uRipR - 1.0) * uPlateScale;
    float rx = (sd - d0) / 0.022;
    float ring = exp(-rx * rx);
    bg += uRipA * ring * (0.04 * (0.55 + 0.45 * dot(nOut, normalize(vec2(-0.5, 0.8))))) * mix(0.5, 1.0, uLightScene);
    bg -= uRipA * 0.016 * uLightScene * exp(-(rx - 1.6) * (rx - 1.6));
  }
  float shadowFall = max(sd, 0.0) / (0.9 * uPlateScale);
  bg *= 1.0 - uShadow * 0.03 * exp(-shadowFall * shadowFall) * step(0.0, sd);
  vec3 haloCol = mix(vec3(0.62, 0.69, 0.80), vec3(1.0), uLightScene);
  bg = mix(bg, haloCol, clamp(uHalo * (0.30 * exp(-outside / (0.025 * uPlateScale)) + 0.07 * exp(-outside / (0.12 * uPlateScale))), 0.0, 1.0) * step(0.0, sd));

  vec3 col = bg;
  float soft = px + uBlur * 0.8 + 0.06 * uDissolve * uPlateScale;
  if (sd < soft) {
    float y1 = 1.0 - x;
    const float K = 2.6;
    float base1 = max(1.0 - pow(y1, K), 1e-4);
    float db = min(pow(y1, K - 1.0) * pow(base1, 1.0 / K - 1.0), 25.0);
    float s1 = bw * 0.62;
    float w2 = bw * 0.22;
    float t2 = clamp((s - s1) / w2, -1.0, 1.0);
    float dh2 = uDouble * bw * 0.16;
    float dd = dh2 * 0.5 * cos(t2 * 1.5707963) * 1.5707963 / w2 * step(abs(t2), 0.999);
    vec2 gDome = -uDome * 2.0 * g * dg * step(g, 1.0);
    vec2 grad = -(db + dd) * nOut + gDome;

    vec3 back = mix(uBg, uPlateCol, uIconPlate);
    float rblur = uBlur + 0.05 * length(qc - p) + min(uGlow * uOptics * (1.0 - xf) * foot / px, 0.04);

    float cornerW = smoothstep(0.1, 0.9, 4.0 * nOut.x * nOut.x * nOut.y * nOut.y);
    float streak = 0.35 * uStreak * bw * mix(0.15, 1.0, cornerW) * pow(1.0 - xf, 1.5) * uOptics;
    vec2 tangent = vec2(-nOut.y, nOut.x);
    vec3 acc = vec3(0.0), wsum = vec3(0.0);
    for (int i = 0; i < 20; i++) {
      float lam = (float(i) + 0.5) / 20.0;
      float c = uDisp * (1.0 - 2.0 * lam);
      vec2 along = tangent * (streak * 2.0 * (fract(float(i) * 0.618034 + 0.31) - 0.5));
      float cf = uDisp * (1.0 - 2.0 * lam) * (lam > 0.5 ? 1.0 : 0.5);
      vec2 sp = refractSample(xf, bwF, 1.5 + uEtaSpread * c, R, dirOut, p + along,
                              dome + pinchPart * 0.3 * c, offMul);
      vec2 focusL = focus - sign(p) * (0.70710678 * uFocusSplit * c * uPlateScale);
      float wFocus = pow(1.0 - xf, uFocusK) * smoothstep(0.0, uRimLine * (1.0 + 0.6 * c), xf);
      sp = mix(sp, mix(p + along, focusL, wFocus), focusW);
      float faceOnly = smoothstep(0.7, 1.0, xf) * uOptics;
      sp *= 1.0 + uFaceDisp * cf * faceOnly;
      vec4 l = logoAt(sp, rblur + 0.12 * streak + uFaceDisp * 0.5 * max(c, 0.0) * faceOnly, foot);
      vec3 w = spectrum(lam);
      acc += mix(back, l.rgb, l.a) * w;
      wsum += w;
    }
    vec3 trans = acc / wsum;
    float tl = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    trans = clamp(tl + (trans - tl) * (1.0 + uVivid * uOptics), 0.0, 1.0);
    float hazeLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float hazeGate = mix(1.0 - smoothstep(0.25, 0.75, hazeLum), smoothstep(0.25, 0.75, hazeLum), uLightScene);
    trans = mix(trans, lift, uFrost * 0.45 * hazeGate);

    float glassAmt = pow(1.0 - uDissolve, 1.5);
    float lit = uSpec * glassAmt;
    vec3 rimCol = mix(vec3(0.80, 0.87, 0.97), vec3(1.0), uLightScene);

    float sc = uPlateScale;
    float tLum = dot(trans, vec3(0.2126, 0.7152, 0.0722));
    float lightOnly = smoothstep(0.35, 0.85, tLum);
    float hw = smoothstep(-0.85, 0.5, dot(nOut, vec2(0.5, 0.866)));
    float tileBand = band(s, 0.016 * sc, 0.075 * sc, 0.022 * sc);
    float dropBand = (1.0 - smoothstep(0.06 * sc, 0.13 * sc, s)) * smoothstep(0.0, 0.004 * sc, s);
    float glow = mix(0.32 * tileBand, 0.75 * dropBand, uDrop) * lightOnly;
    float edgeLine = gauss(s, 0.005 * sc, 0.0045 * sc);
    float lip = gauss(s, 0.15 * sc, 0.007 * sc) * uDouble * (1.0 - uDrop);
    vec3 lightGlass = mix(trans, vec3(1.0), glow * glassAmt);
    lightGlass += (0.075 * hw * edgeLine + 0.06 * (0.4 + 0.6 * hw) * lip) * lit;
    lightGlass *= 1.0 - 0.05 * (1.0 - hw) * edgeLine * glassAmt * (1.0 - uDrop);
    lightGlass = mix(lightGlass, vec3(1.0), 0.55 * uDrop * glassAmt * edgeLine);

    vec3 Nl = normalize(vec3(-grad, 1.0));
    float edge = 1.0 - Nl.z;
    vec2 ldir = normalize(vec2(-0.62, 0.78));
    float side = dot(nOut, ldir);
    float fres = pow(edge, 1.5);
    vec3 rim = rimCol * fres * (0.35 + 0.65 * max(side, -side * 0.8)) * uRim * 0.65;
    vec3 Hv = normalize(normalize(vec3(-0.45, 0.6, 0.66)) + vec3(0.0, 0.0, 1.0));
    float sp = pow(max(dot(Nl, Hv), 0.0), 140.0) * 0.8 * smoothstep(0.0, 0.25, y1);
    vec3 darkGlass = trans * (1.0 - 0.25 * fres) + (rim + vec3(sp)) * lit;

    darkGlass = mix(darkGlass, rimCol, uDrop * 0.4 * uSpec * (1.0 - smoothstep(0.0, 0.1 * uPlateScale, s)));
    vec3 glass = mix(darkGlass, lightGlass, uLightScene);

    float cov = clamp(0.5 - sd / soft, 0.0, 1.0);
    col = mix(bg, glass, cov);
  }

  vec3 outc = mix(plain, col, uPlateAlpha);
  outc += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  outColor = vec4(outc, 1.0);
}`;

const FRAME_KEYS = [
  'uPlateScale', 'uShapeN', 'uCornerN', 'uOptics', 'uPlateAlpha', 'uLogoHalf', 'uBold', 'uBlur', 'uFrost', 'uDome', 'uDrop', 'uPinch', 'uTilt', 'uBare',
  'uReach', 'uCornerPull', 'uStreak', 'uWiden', 'uSlab', 'uEtaSpread', 'uFocus', 'uFocusK', 'uFocusSplit', 'uRimLine', 'uCornerOn', 'uDissolve', 'uGlow', 'uFaceDisp', 'uVivid',
  'uRim', 'uHalo', 'uShadow', 'uGhost', 'uRipR', 'uRipA', 'uDepth', 'uDisp', 'uDouble', 'uBevelW', 'uSpec', 'uIconPlate',
  'uUseColor', 'uLightScene'
];

interface FrameData {
  [key: string]: any;
  uPlateScale: number;
  uShapeN: number;
  uCornerN: number;
  uOptics: number;
  uPlateAlpha: number;
  uLogoHalf: number;
  uLogoOff: [number, number];
  uBold: number;
  uBlur: number;
  uFrost: number;
  uDome: number;
  uDrop: number;
  uPinch: number;
  uTilt: number;
  uRim: number;
  uHalo: number;
  uShadow: number;
  uGhost: number;
  uRipR: number;
  uRipA: number;
  uBare: number;
  uReach: number;
  uCornerPull: number;
  uStreak: number;
  uWiden: number;
  uSlab: number;
  uEtaSpread: number;
  uFocus: number;
  uFocusK: number;
  uFocusSplit: number;
  uRimLine: number;
  uCornerOn: number;
  uDissolve: number;
  uGlow: number;
  uFaceDisp: number;
  uVivid: number;
  uDepth: number;
  uDisp: number;
  uDouble: number;
  uBevelW: number;
  uSpec: number;
  uIconPlate: number;
  uUseColor: number;
  uLightScene: number;
  uBg: [number, number, number];
  uPlateCol: [number, number, number];
  uLogoCol: [number, number, number];
}

const BCARE_PARAMS = {
  tileSize: 260,
  logoScale: 0.76,
  finalScale: 0.82,
  iconPlate: false,
  opticalDepth: 1.15,
  dispersion: 1.85,
  glow: 1.35,
  doubleBevel: 1.0,
  bevelWidth: 0.15,
  corner: 4.8,
  cornerPull: 2.1,
  cornerWidth: 2.2,
  cornerFocus: 0.58,
  edgeSmear: 2.85,
  stretch: 0.1,
  tilt: 0.35,
  bulge: 1.0,
  specular: 1.1,
  halo: 0.8,
  shadow: 1.0,
  ripple: 1.2,
  bounce: 0.05,
  response: 0.34,
  startSize: 0.18,
  startZoom: 2.5,
  present: 1.3,
  drift: 0.10,
  focus: 1.0,
  swell: 0.5,
  hold: 0.8,
  background: '#fafafa',
  plateColor: '#ffffff',
  logoColor: '#122cf3',
  originalColors: true,
};

function frameAt(T: number, P = BCARE_PARAMS, outro = 0): FrameData {
  const tx = P.present;
  const damping = 1 - P.bounce;
  const grow = spring(T + 0.01, P.response, damping);
  const tl = timeToReach(0.85, P.response, damping) - 0.01;
  const tm = timeToReach(0.92, P.response, damping) - 0.01;
  const morph = spring(T - tm, 0.3, 1);
  const drop = 1 - smooth(0.05, 1, morph);
  const appear = smooth(0, 0.06, T);
  const drift = P.drift * spring(T - 0.25, 1.5, 1);
  const zoomIn = spring(T, 0.7, 1);
  const settle = spring(T - 0.4, 1.6, 1);
  const exit = spring(T - tx, 0.8, 1);
  const release = spring(T - tx - 0.05, 0.5, 1);
  const dome = 0.15 * P.bulge * (1 - smooth(0.4, 0.95, grow));
  const view = (1 + (P.startZoom - 1) * (1 - zoomIn)) * (1 - 0.045 * settle) * mix(1, P.finalScale, exit) * (1 - 0.06 * outro);
  const bandW = mix(P.bevelWidth, Math.max(P.bevelWidth, 0.4), drop);
  const plateScale = mix(P.startSize, 1, grow) * (1 + drift) * (1 + 0.14 * release);
  const light = luminance(hexToRgb(P.background)) > 0.5 ? 1 : 0;

  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, P.corner, morph),
    uCornerN: P.corner,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: appear * (1 - smooth(0.45, 1, release)),
    uLogoHalf: P.logoScale * view,
    uLogoOff: [0, 0],
    uBold: P.swell * 0.03 * (1 - zoomIn),
    uBlur: P.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: P.focus * (1 - smooth(0.5, 0.95, grow)),
    uPinch: 0.38 * P.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
    uTilt: P.tilt,
    uDome: dome,
    uDrop: drop,
    uRim: 1 + 0.8 * drop,
    uHalo: P.halo * (0.5 + 0.5 * drop),
    uShadow: P.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)),
    uGhost: smooth(0, 0.03, T) * (1 - smooth(0.04, 0.08, T)),
    uRipR: 1 + 0.9 * Math.max(0, T - tl),
    uRipA: P.ripple * smooth(tl, tl + 0.06, T) * Math.exp(-Math.max(0, T - tl) / 0.5),
    uBare: smooth(tx - 0.2, tx, T) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: P.cornerPull,
    uStreak: P.edgeSmear,
    uWiden: P.cornerWidth,
    uSlab: 0.3 * P.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: P.cornerFocus,
    uFocusK: 1.0,
    uFocusSplit: 0.056 * P.glow,
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * P.glow,
    uFaceDisp: 0.012 * P.dispersion,
    uVivid: 0.85,
    uDissolve: release,
    uDepth: P.opticalDepth,
    uDisp: P.dispersion,
    uDouble: P.doubleBevel,
    uBevelW: bandW * (1 - release),
    uSpec: P.specular,
    uIconPlate: P.iconPlate ? 1 : 0,
    uUseColor: P.originalColors ? 1 : 0,
    uLightScene: light,
    uBg: hexToRgb(P.background),
    uPlateCol: hexToRgb(P.plateColor),
    uLogoCol: hexToRgb(P.logoColor),
  };
}

interface LiquidGlassLogoRevealProps {
  onFinish?: () => void;
  isSimulator?: boolean;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
}

export const LiquidGlassLogoReveal: React.FC<LiquidGlassLogoRevealProps> = ({
  onFinish,
  isSimulator = false,
  autoDismiss = true,
  autoDismissDelay = 750
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const hasRenderedFirstFrame = useRef(false);
  const [isFinished, setIsFinished] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rendererRef = useRef<any>(null);

  const startAnimation = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Compile WebGL2
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.warn('WebGL2 not available, falling back');
      setTimeout(() => { if (onFinish) onFinish(); }, 1200);
      return;
    }

    // Immediately clear WebGL backbuffer synchronously to #fafafa to guarantee ZERO black box flash
    gl.clearColor(0.98, 0.98, 0.98, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(sh) || 'Shader compile error');
      }
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U: Record<string, WebGLUniformLocation | null> = {};
    const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const info = gl.getActiveUniform(prog, i)!;
      U[info.name] = gl.getUniformLocation(prog, info.name);
    }

    const sdfTex = gl.createTexture();
    const colTex = gl.createTexture();
    gl.uniform1i(U.uSdf, 0);
    gl.uniform1i(U.uCol, 1);

    // Load or retrieve cached B Care emblem & SDF
    let fitted = cachedFitted;
    let sdf = cachedSdf;
    if (!fitted || !sdf) {
      const img = await loadImage(bcareMarkImg);
      fitted = fitToTexture(img, img.naturalWidth || 554, img.naturalHeight || 554);
      sdf = buildSdf(fitted);
      cachedFitted = fitted;
      cachedSdf = sdf;
    }

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, TEX, TEX, 0, gl.RED, gl.FLOAT, sdf);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, colTex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, fitted);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    rendererRef.current = {
      render: (fr: FrameData, w: number, h: number, tilePx: number) => {
        gl.viewport(0, 0, w, h);
        gl.uniform2f(U.uCenter, w / 2, h / 2);
        gl.uniform1f(U.uTile, tilePx);
        gl.uniform1f(U.uTexSize, TEX);
        gl.uniform1f(U.uBoxFrac, BOX);
        for (const k of FRAME_KEYS) {
          if (U[k]) gl.uniform1f(U[k], fr[k]);
        }
        gl.uniform3fv(U.uBg, fr.uBg);
        gl.uniform3fv(U.uPlateCol, fr.uPlateCol);
        gl.uniform3fv(U.uLogoCol, fr.uLogoCol);
        gl.uniform2fv(U.uLogoOff, fr.uLogoOff);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };

    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      const tilePx = BCARE_PARAMS.tileSize * dpr;
      const fr = frameAt(elapsed, BCARE_PARAMS, 0);

      if (rendererRef.current) {
        rendererRef.current.render(fr, w, h, tilePx);
        if (!hasRenderedFirstFrame.current) {
          hasRenderedFirstFrame.current = true;
          setCanvasReady(true);
        }
      }

      // Complete reveal after ~2.3 seconds
      if (elapsed < 2.35) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        setIsFinished(true);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  }, [onFinish]);

  useEffect(() => {
    startAnimation();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startAnimation]);

  // Auto-dismiss after reveal completes if enabled
  useEffect(() => {
    if (isFinished && autoDismiss && !exiting && !unmounted) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          setUnmounted(true);
          if (onFinish) onFinish();
        }, 350);
      }, autoDismissDelay);
      return () => clearTimeout(timer);
    }
  }, [isFinished, autoDismiss, exiting, unmounted, autoDismissDelay, onFinish]);

  const handleSkipOrEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExiting(true);
    setTimeout(() => {
      setUnmounted(true);
      if (onFinish) onFinish();
    }, 200);
  };

  if (unmounted) return null;

  return (
    <AnimatePresence>
      {!unmounted && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1, scale: exiting ? 1.03 : 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkipOrEnter}
          className={`${
            isSimulator ? 'absolute inset-0' : 'fixed inset-0'
          } z-[9999] bg-[#fafafa] flex flex-col items-center justify-between p-6 select-none overflow-hidden cursor-pointer`}
          title="Click anywhere to enter app or skip"
        >
          {/* Top Health Mission Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="pt-4 z-20 flex items-center gap-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 shadow-2xs border border-zinc-200/80 text-[11px] font-semibold text-zinc-700 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-display">National Health Authority • ABDM Ecosystem</span>
            </div>
          </motion.div>

          {/* WebGL2 Liquid Glass Canvas (Central Stage) */}
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center my-auto z-10 bg-transparent">
            <canvas
              ref={canvasRef}
              className={`w-full h-full block rounded-3xl transition-opacity duration-200 ${
                canvasReady ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ width: '100%', height: '100%', backgroundColor: '#fafafa' }}
            />
          </div>

          {/* Bottom Brand Title & Enter App Trigger */}
          <div className="flex flex-col items-center text-center space-y-3 pb-4 z-20 w-full">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="space-y-1 flex flex-col items-center"
            >
              <img
                src={bcareHorizImg}
                alt="B Care"
                className="h-9 w-auto object-contain pointer-events-none select-none drop-shadow-xs"
              />
              <p className="text-xs text-zinc-500 font-semibold tracking-tight font-display">
                Decentralized Healthcare & OPD Network
              </p>
            </motion.div>

            {/* Enter App / Skip Pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-3 pt-1"
            >
              <button
                onClick={handleSkipOrEnter}
                className="px-5 py-2 rounded-full bg-[#122cf3] hover:bg-[#0e24cc] text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 font-display"
              >
                <span>Explore B Care</span>
                <span>→</span>
              </button>
            </motion.div>

            {/* Security Footer */}
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#122cf3]" />
              <span>256-Bit Encrypted • ABDM Ayushman Bharat Certified</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiquidGlassLogoReveal;
