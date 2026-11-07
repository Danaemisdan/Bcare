import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, Sparkles } from 'lucide-react';

// ============================================================================
// Liquid Glass Navbar
// Directly inspired by @gughigug/components/liquid-glass-navbar on 21st.dev
// ============================================================================

export interface LiquidNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  verifiedBeacon?: boolean;
  highlight?: boolean;
}

export interface LiquidGlassNavbarProps<T extends string = string> {
  items: LiquidNavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  tone?: 'light' | 'dark';
  className?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function LiquidGlassNavbar<T extends string = string>({
  items,
  activeId,
  onChange,
  tone = 'light',
  className = '',
}: LiquidGlassNavbarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ width: number; left: number }>({ width: 0, left: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [lastClickedId, setLastClickedId] = useState<T | null>(null);

  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));

  // Measure and align the liquid water droplet indicator
  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemsRef.current[activeIndex];
      const containerEl = containerRef.current;
      if (!activeEl || !containerEl) return;

      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      setIndicator({
        width: activeRect.width,
        left: activeRect.left - containerRect.left,
      });
    };

    updateIndicator();
    const t1 = setTimeout(updateIndicator, 40);
    const t2 = setTimeout(updateIndicator, 140);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeIndex, items.length]);

  // Handle pointer down ripple effect
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: T) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    const newRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 650);

    setLastClickedId(id);
    onChange(id);
  };

  return (
    <div className={`relative select-none ${className}`} style={{ colorScheme: 'light' }}>
      {/* ========================================================================= */}
      {/* NIMBUS LIQUID GLASS CAPSULE (@gughigug/components/liquid-glass-navbar)   */}
      {/* ========================================================================= */}
      <nav
        ref={containerRef}
        role="navigation"
        aria-label="Liquid Glass Bottom Navigation"
        className="relative flex items-center justify-between p-1.5 rounded-full 
                   bg-white/75 
                   backdrop-blur-2xl backdrop-saturate-180 
                   border border-white/85 
                   ring-1 ring-black/[0.04]
                   shadow-[0_16px_36px_-8px_rgba(0,40,90,0.14),0_4px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)]"
      >
        {/* Subtle Specular Rim Highlight */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-full" />

        {/* ========================================================================= */}
        {/* CLIPPED WATER DROP INDICATOR AND RIPPLES                                 */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
          {indicator.width > 0 && (
            <motion.div
              layoutId="nimbus-liquid-water-drop"
              animate={{
                width: indicator.width - 6,
                left: indicator.left + 3,
              }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 30,
                mass: 0.78,
              }}
              className="absolute top-1.5 bottom-1.5 rounded-full z-0 
                         bg-gradient-to-b from-white/95 to-white/80 
                         border border-white/90 
                         shadow-[inset_0_1.5px_2px_rgba(255,255,255,1),inset_0_-2px_6px_rgba(16,185,129,0.16),0_6px_18px_-4px_rgba(16,185,129,0.28),0_2px_6px_rgba(0,0,0,0.05)]"
            >
              {/* Liquid drop center gleam */}
              <div className="absolute inset-x-2 top-0.5 h-1 bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent rounded-full" />
            </motion.div>
          )}

          {/* Interactive Click Water Ripples - Smooth Minimal Tactile */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                initial={{ scale: 0.2, opacity: 0.35 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-8 h-8 rounded-full bg-emerald-400/20 pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"
                style={{ left: ripple.x, top: ripple.y }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* ========================================================================= */}
        {/* NAV ITEMS WITH SEXY 3D LUMINOUS AI ORB IN THE CENTER                     */}
        {/* ========================================================================= */}
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          // SPECIAL RENDERING: SEXY 3D LUMINOUS AI ORB
          if (item.highlight) {
            return (
              <button
                key={item.id}
                ref={(el) => (itemsRef.current[idx] = el)}
                type="button"
                onClick={() => onChange(item.id)}
                onPointerDown={(e) => handlePointerDown(e, item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative z-30 flex-1 flex flex-col items-center justify-center -mt-5 outline-none cursor-pointer group select-none"
              >
                {/* Outer Ethereal Pulsing AI Aura */}
                <div
                  className={`absolute -inset-3 rounded-full transition-all duration-700 pointer-events-none blur-md ${
                    isActive
                      ? 'bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 opacity-90 scale-110 animate-pulse'
                      : 'bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 opacity-60 scale-100 group-hover:opacity-85'
                  }`}
                />

                {/* The 3D Sexy Luminous AI Orb */}
                <motion.div
                  animate={
                    isActive
                      ? { scale: 1.12, y: -2 }
                      : { scale: 1, y: 0 }
                  }
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 24,
                    mass: 0.7,
                  }}
                  className="relative w-12 h-12 rounded-full p-[1.5px] 
                             bg-gradient-to-tr from-cyan-300 via-white to-indigo-400 
                             shadow-[0_10px_25px_-3px_rgba(6,182,212,0.55),0_4px_12px_rgba(79,70,229,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.95)] 
                             flex items-center justify-center overflow-hidden"
                >
                  {/* Deep Fluid Iridescent Core */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_25%,_#38bdf8_0%,_#0284c7_35%,_#4f46e5_75%,_#0f172a_100%)]" />

                  {/* Rotating Liquid Light Rays */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/40 via-transparent to-fuchsia-400/40 animate-[spin_6s_linear_infinite]" />

                  {/* Specular Top Crescent Glass Reflection */}
                  <div className="absolute top-1 inset-x-2 h-3.5 rounded-full bg-gradient-to-b from-white/95 to-transparent opacity-90 pointer-events-none" />

                  {/* Ambient Rim Glint */}
                  <div className="absolute bottom-1 inset-x-2.5 h-1.5 rounded-full bg-gradient-to-t from-teal-300/80 to-transparent pointer-events-none" />

                  {/* Center Glowing Sparkles Glyph */}
                  <Sparkles className="relative z-10 w-5 h-5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                </motion.div>

                {/* Minimal Chic AI Label */}
                <span
                  className={`text-[9px] mt-0.5 tracking-tight transition-all duration-200 ${
                    isActive
                      ? 'font-black text-indigo-950 scale-105'
                      : 'font-bold text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  AI
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              type="button"
              onClick={() => onChange(item.id)}
              onPointerDown={(e) => handlePointerDown(e, item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative z-10 flex-1 flex flex-col items-center justify-center py-1.5 px-1 
                         rounded-full cursor-pointer transition-colors duration-150 outline-none select-none ${
                           isActive ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                         }`}
            >
              {/* Icon Container with Smooth Micro-Lift */}
              <div className="relative flex items-center justify-center">
                <motion.div
                  animate={
                    isActive
                      ? { scale: 1.06, y: -1 }
                      : { scale: 1, y: 0 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 450,
                    damping: 26,
                    mass: 0.6,
                  }}
                  className="flex items-center justify-center"
                >
                  <Icon
                    className={`w-[19px] h-[19px] transition-transform duration-150 ${
                      isActive ? 'stroke-[2.2] text-emerald-600' : 'stroke-[1.8] text-slate-500'
                    }`}
                  />
                </motion.div>

                {/* Badge (e.g. Rx count) */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-bold text-[9px] shadow-xs tabular-nums border border-white leading-tight">
                    {item.badge}
                  </span>
                )}

                {/* Verified Beacon Dot (ABDM Profile) */}
                {item.verifiedBeacon && (
                  <span className="absolute -top-0.5 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-1 ring-white" />
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-0.5 leading-tight tracking-tight transition-all duration-200 ${
                  isActive ? 'font-bold text-emerald-800 scale-100' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default LiquidGlassNavbar;
