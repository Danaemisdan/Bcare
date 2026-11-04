import React, { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

// ============================================================================
// Snell's Law Displacement Mapping & Optical Refraction Engine
// Inspired by @aakashmehra/components/liquid-glass-button on 21st.dev
// ============================================================================

function bendFromDepth(depth: number): number {
  const d = 1 - Math.min(1, Math.max(0, depth));
  const r = (1 - d ** 4) ** 0.75;
  if (r < 1e-6) return 0;
  const theta = Math.atan(Math.min(d ** 3 / r, 8));
  const sinRefract = Math.sin(theta) / 1.5; // Index of refraction of glass/water ~1.5
  return sinRefract >= 1 ? Math.sin(theta) : Math.sin(theta - Math.asin(sinRefract));
}

function buildPhiTable(steps: number): Float32Array {
  const s = Math.max(1, Math.ceil(steps));
  const phi = new Float32Array(s + 1);
  for (let i = 1; i <= s; i++) {
    phi[i] = phi[i - 1] + bendFromDepth(i / s);
  }
  return phi;
}

function samplePhi(phi: Float32Array, index: number): number {
  const maxIdx = phi.length - 1;
  if (index <= 0) return phi[0];
  if (index >= maxIdx) return phi[maxIdx];
  const floor = Math.floor(index);
  const frac = index - floor;
  return phi[floor] * (1 - frac) + phi[floor + 1] * frac;
}

function roundedBoxDist(x: number, y: number, hw: number, hh: number, r: number): number {
  const qx = Math.abs(x) - hw + r;
  const qy = Math.abs(y) - hh + r;
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

interface DisplacementConfig {
  width: number;
  height: number;
  radius: number;
  bevelDepth: number;
  dpr?: number;
  gain?: number;
  light?: { x: number; y: number };
}

function computeDisplacementData(cfg: DisplacementConfig) {
  const dpr = cfg.dpr ?? 1;
  const gain = cfg.gain ?? 1.35;
  const light = cfg.light ?? { x: -0.55, y: -0.85 };
  const lightLen = Math.hypot(light.x, light.y) || 1;
  const lx = light.x / lightLen;
  const ly = light.y / lightLen;

  const w = Math.max(1, Math.round(cfg.width * dpr));
  const h = Math.max(1, Math.round(cfg.height * dpr));
  const hw = w / 2;
  const hh = h / 2;
  const radius = Math.min(cfg.radius * dpr, hw, hh);
  const bevelDepth = Math.max(1, cfg.bevelDepth * dpr);
  const phiTable = buildPhiTable(bevelDepth);

  const depthMap = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const dy = y - hh + 0.5;
    for (let x = 0; x < w; x++) {
      const d = roundedBoxDist(x - hw + 0.5, dy, hw, hh, radius);
      depthMap[y * w + x] = d > 0 ? 0 : samplePhi(phiTable, Math.min(bevelDepth, -d));
    }
  }

  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const dy = y - hh + 0.5;
    for (let x = 0; x < w; x++) {
      const dx = x - hw + 0.5;
      const idx = (y * w + x) * 4;
      const d = roundedBoxDist(dx, dy, hw, hh, radius);

      if (d > 0) {
        out[idx] = 128;
        out[idx + 1] = 128;
        out[idx + 2] = 128;
        out[idx + 3] = 0;
        continue;
      }

      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(w - 1, x + 1);
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(h - 1, y + 1);

      const ddx = (depthMap[y * w + x1] - depthMap[y * w + x0]) / (x1 - x0 || 1);
      const ddy = (depthMap[y1 * w + x] - depthMap[y0 * w + x]) / (y1 - y0 || 1);

      const vx = Math.max(-1, Math.min(1, ddx * gain));
      const vy = Math.max(-1, Math.min(1, ddy * gain));

      let specular = 0;
      if (d >= -bevelDepth) {
        const nx = roundedBoxDist(dx + 1, dy, hw, hh, radius) - roundedBoxDist(dx - 1, dy, hw, hh, radius);
        const ny = roundedBoxDist(dx, dy + 1, hw, hh, radius) - roundedBoxDist(dx, dy - 1, hw, hh, radius);
        const nLen = Math.hypot(nx, ny) || 1;
        const dot = (nx / nLen) * lx + (ny / nLen) * ly;
        const edgeFactor = 1 - Math.min(1, -d / bevelDepth);
        specular = (Math.max(0, dot) + Math.max(0, -dot) * 0.35) * edgeFactor;
      }

      out[idx] = 128 + vx * 127;
      out[idx + 1] = 128 + vy * 127;
      out[idx + 2] = Math.round(specular * 255);
      out[idx + 3] = 255;
    }
  }

  return { data: out, width: w, height: h };
}

async function generateDisplacementBlobUrl(cfg: DisplacementConfig): Promise<string> {
  const { data, width, height } = computeDisplacementData(cfg);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');
  ctx.putImageData(new ImageData(data, width, height), 0, 0);
  const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png'));
  if (!blob) throw new Error('Failed to encode displacement map');
  return URL.createObjectURL(blob);
}

function buildFilterSvg({
  id,
  mapUrl,
  width,
  height,
  scale,
  aberration,
  frost
}: {
  id: string;
  mapUrl: string;
  width: number;
  height: number;
  scale: number;
  aberration: number;
  frost: number;
}): string {
  const pad = Math.ceil(scale + aberration + 4);
  const padX = (pad / Math.max(1, width)) * 100;
  const padY = (pad / Math.max(1, height)) * 100;
  const filterRegion = `x="-${padX.toFixed(3)}%" y="-${padY.toFixed(3)}%" width="${(100 + 2 * padX).toFixed(3)}%" height="${(100 + 2 * padY).toFixed(3)}%"`;
  const feImg = `<feImage href="${mapUrl}" xlink:href="${mapUrl}" x="0" y="0" width="${width}" height="${height}" result="map" preserveAspectRatio="none"/>`;

  const displace = (sc: number, res: string) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="${res}"/>`;

  const matrix = aberration <= 0
    ? `${displace(scale, 'rgb')}`
    : `${displace(scale + aberration, 'dispR')}
  <feColorMatrix in="dispR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
  ${displace(scale, 'dispG')}
  <feColorMatrix in="dispG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"/>
  ${displace(Math.max(0, scale - aberration), 'dispB')}
  <feColorMatrix in="dispB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"/>
  <feBlend in="red" in2="green" mode="screen" result="rg"/>
  <feBlend in="rg" in2="blue" mode="screen" result="rgb"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">
<filter id="${id}" color-interpolation-filters="sRGB" ${filterRegion}>
  ${feImg}
  ${matrix}
  <feGaussianBlur in="rgb" stdDeviation="${frost}"/>
</filter></svg>`;
}

// ============================================================================
// Core LiquidGlass Container
// ============================================================================

export interface LiquidGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  radius?: number;
  bevelDepth?: number;
  scale?: number;
  aberration?: number;
  frost?: number;
  tint?: number;
  contentClassName?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = '',
  contentClassName = '',
  radius = 28,
  bevelDepth = 14,
  scale = 36,
  aberration = 3.5,
  frost = 0.35,
  tint = 0.08,
  style,
  ...props
}) => {
  const rawId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [filterState, setFilterState] = useState<{ id: string; svg: string } | null>(null);
  const [mode, setMode] = useState<'pending' | 'refract' | 'simple'>('simple');

  useEffect(() => {
    // Check backdrop-filter SVG url support (Chrome 122+ / WebKit / Blink)
    const supportsSvgFilter = typeof CSS !== 'undefined' && CSS.supports && CSS.supports('backdrop-filter', 'url(#test)');
    if (supportsSvgFilter) {
      setMode('pending');
    } else {
      setMode('simple');
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mode !== 'pending') return;

    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const w = entry.contentRect.width || entry.borderBoxSize?.[0]?.inlineSize || 0;
      const h = entry.contentRect.height || entry.borderBoxSize?.[0]?.blockSize || 0;
      setDims({ w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'pending' || dims.w <= 1 || dims.h <= 1) return;
    let isCancelled = false;

    (async () => {
      try {
        const url = await generateDisplacementBlobUrl({
          width: dims.w,
          height: dims.h,
          radius: Math.min(radius, dims.w / 2, dims.h / 2),
          bevelDepth: Math.min(bevelDepth, Math.min(dims.w, dims.h) / 2),
          dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2)
        });

        if (isCancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = url;

        const id = `lg-${rawId}-${dims.w}x${dims.h}`;
        const svg = buildFilterSvg({
          id,
          mapUrl: url,
          width: dims.w,
          height: dims.h,
          scale,
          aberration,
          frost
        });

        setFilterState({ id, svg });
        setMode('refract');
      } catch (e) {
        setMode('simple');
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [mode, dims.w, dims.h, radius, bevelDepth, scale, aberration, frost, rawId]);

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  const backdrop = mode === 'refract' && filterState
    ? `url(#${filterState.id}) blur(0.5px) saturate(1.85) brightness(1.02)`
    : 'blur(16px) saturate(1.7) brightness(1.04)';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${
        mode === 'simple'
          ? 'bg-white/40 ring-1 ring-white/60 ring-inset shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
          : 'bg-white/30 ring-1 ring-white/50 ring-inset shadow-[0_12px_40px_rgba(0,0,0,0.12)]'
      } ${className}`}
      style={{
        borderRadius: radius,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        ...style
      }}
      {...props}
    >
      {filterState ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute size-0 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: filterState.svg }}
        />
      ) : null}
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
};

// ============================================================================
// Liquid Spring Physics Popup / Modal Wrapper
// "when I click on something and something opens up or pops up it'll pop up
// in a very nice liquidy way animated"
// ============================================================================

export interface LiquidGlassPopupProps extends HTMLMotionProps<'div'> {
  isOpen: boolean;
  onClose?: () => void;
  radius?: number;
  backdropDismiss?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
}

export const LiquidGlassPopup: React.FC<LiquidGlassPopupProps> = ({
  isOpen,
  onClose,
  radius = 32,
  backdropDismiss = true,
  className = '',
  contentClassName = '',
  children,
  ...props
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dimmed Optical Liquid Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={backdropDismiss ? onClose : undefined}
            className="absolute inset-0 z-50 bg-slate-950/45 backdrop-blur-[3px] select-none"
          />

          {/* Liquid Spring Pop-Up Window */}
          <div className="absolute inset-0 z-50 flex items-center justify-center p-3.5 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.86,
                y: 28,
                filter: 'blur(8px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: 'blur(0px)',
              }}
              exit={{
                opacity: 0,
                scale: 0.88,
                y: 18,
                filter: 'blur(6px)',
              }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 24,
                mass: 0.82,
              }}
              onClick={(e) => e.stopPropagation()}
              className={`pointer-events-auto relative w-full max-w-[348px] overflow-hidden 
                         bg-gradient-to-b from-white/92 via-white/84 to-white/76 
                         text-slate-900 
                         border border-white/90 
                         shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.15),inset_0_1.5px_2px_rgba(255,255,255,1)] 
                         backdrop-blur-2xl backdrop-saturate-150 ${className}`}
              style={{ borderRadius: radius }}
              {...props}
            >
              {/* Specular Liquid Edge Highlight */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

              {/* Children Content */}
              <div className={contentClassName}>{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// Liquid Glass Button
// ============================================================================

export interface LiquidGlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'emerald' | 'white' | 'dark';
  glow?: boolean;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  children,
  variant = 'emerald',
  glow = true,
  className = '',
  ...props
}) => {
  const variantStyles = {
    emerald: `bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/50 
              shadow-[0_4px_16px_rgba(16,185,129,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]`,
    white: `bg-white/80 hover:bg-white text-slate-900 border-white/90 
            shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_1.5px_rgba(255,255,255,1)]`,
    dark: `bg-slate-950/90 hover:bg-slate-950 text-white border-slate-700/80 
           shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]`,
  }[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.96, y: 1 }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 24,
        mass: 0.8,
      }}
      className={`relative inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full 
                 text-xs font-semibold backdrop-blur-xl border cursor-pointer select-none transition-colors ${variantStyles} ${className}`}
      {...props}
    >
      {/* Specular Liquid Glaze Rim */}
      <span className="absolute inset-x-3 top-0 h-px bg-white/40 pointer-events-none" />
      {children}
    </motion.button>
  );
};

export default LiquidGlass;
