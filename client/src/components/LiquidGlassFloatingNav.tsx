import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface FloatingNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  activeColor?: string;
  verifiedBeacon?: boolean;
}

interface LiquidGlassFloatingNavProps<T extends string = string> {
  items: FloatingNavItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

export function LiquidGlassFloatingNav<T extends string = string>({
  items,
  activeId,
  onChange,
  className = ''
}: LiquidGlassFloatingNavProps<T>) {
  const [indicator, setIndicator] = useState<{ width: number; left: number }>({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.max(0, items.findIndex(item => item.id === activeId));

  useEffect(() => {
    const updateIndicator = () => {
      const activeEl = itemsRef.current[activeIndex];
      const containerEl = containerRef.current;
      if (!activeEl || !containerEl) return;

      const activeRect = activeEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();

      setIndicator({
        width: activeRect.width,
        left: activeRect.left - containerRect.left
      });
    };

    updateIndicator();
    const timer1 = setTimeout(updateIndicator, 40);
    const timer2 = setTimeout(updateIndicator, 120);

    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeIndex, items.length]);

  return (
    <div className={`relative select-none ${className}`} style={{ colorScheme: 'light' }}>
      {/* Outer Pristine Liquid Glass Capsule */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-between p-1 rounded-full 
                   bg-white/85 
                   backdrop-blur-2xl backdrop-saturate-150 
                   border border-white/95 
                   ring-1 ring-zinc-950/[0.06]
                   shadow-[0_16px_36px_-6px_rgba(0,0,0,0.12),0_4px_14px_-2px_rgba(0,0,0,0.06),inset_0_1.5px_2px_rgba(255,255,255,1)]"
      >
        {/* Sliding Liquid Droplet Indicator with Spring Physics */}
        {indicator.width > 0 && (
          <motion.div
            animate={{
              width: indicator.width - 6,
              left: indicator.left + 3,
            }}
            transition={{
              type: "spring",
              stiffness: 480,
              damping: 34,
              mass: 0.8
            }}
            className="absolute top-1 bottom-1 rounded-full pointer-events-none
                       bg-white
                       shadow-[0_3px_10px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]
                       border border-zinc-200/70"
          />
        )}

        {/* Tab Items */}
        {items.map((item, idx) => {
          const isActive = item.id === activeId;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              ref={el => (itemsRef.current[idx] = el)}
              onClick={() => onChange(item.id)}
              className={`relative z-10 flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-full transition-all duration-150 cursor-pointer group ${
                isActive ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-4 h-4 transition-all duration-200 ${
                    isActive 
                      ? 'scale-105 text-emerald-700 stroke-[2.2]' 
                      : 'text-slate-400 group-hover:text-slate-600 stroke-[1.8]'
                  }`} 
                />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-slate-900 text-white tabular-nums text-[9px] min-w-3.5 h-3.5 px-1 rounded-full flex items-center justify-center font-medium shadow-xs">
                    {item.badge}
                  </span>
                )}
                {item.verifiedBeacon && (
                  <span className="absolute -top-0.5 -right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full ring-1 ring-white" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors leading-tight ${
                isActive ? 'text-slate-950 font-semibold' : 'text-slate-400 group-hover:text-slate-600 font-normal'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
