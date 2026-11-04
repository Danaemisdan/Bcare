import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

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
                   bg-white/70 
                   backdrop-blur-2xl backdrop-saturate-180 
                   border border-white/85 
                   ring-1 ring-black/[0.04]
                   shadow-[0_16px_36px_-8px_rgba(0,40,90,0.14),0_4px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)] 
                   overflow-hidden"
      >
        {/* Subtle Specular Rim Highlight */}
        <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* ========================================================================= */}
        {/* REAL WATER DROP INDICATOR (.nimbus-drop with stretch and ripple)          */}
        {/* ========================================================================= */}
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
            className="absolute top-1.5 bottom-1.5 rounded-full pointer-events-none z-0 
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

        {/* ========================================================================= */}
        {/* NAV ITEMS WITH SMOOTH MINIMAL TACTILE ICONS                               */}
        {/* ========================================================================= */}
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              ref={(el) => (itemsRef.current[idx] = el)}
              type="button"
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
