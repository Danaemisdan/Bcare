import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface SlapBlockProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'grow' | 'slap' | 'subtle-slap';
  theme?: 'blue' | 'emerald' | 'dark' | 'white' | 'none';
  delay?: number;
  duration?: number;
  showRing?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * SlapBlock - Smooth, Minimal yet Sexy tactile block entrance.
 * 
 * Replaces cartoonish 16° rotation and 1.75x elastic slamming with
 * Apple / Linear-grade fluid tactile physics:
 * - Gentle vertical rise (y: 10px -> 0px)
 * - Micro-depth scale settle (0.985 -> 1.0)
 * - Soft optical focus dissolve (blur(3px) -> blur(0px))
 * - Buttery luxury spring physics that settles with poise and precision.
 */
export const SlapBlock: React.FC<SlapBlockProps> = ({
  children,
  variant = 'slap',
  theme = 'none',
  delay = 0,
  duration = 0.32,
  showRing = false,
  className = '',
  onClick,
  ...props
}) => {
  // Color theme styling
  const themeStyles = {
    // Elegant royal blue block (#4a6cf0) with specular rim
    blue: 'bg-gradient-to-br from-[#4a6cf0] via-[#3b5fe8] to-[#2547d0] text-white shadow-[0_12px_32px_-8px_rgba(74,108,240,0.32)] border border-[#6b8aff]/35',
    // Luxury Clinical Emerald
    emerald: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-[0_12px_32px_-8px_rgba(5,150,105,0.32)] border border-emerald-400/35',
    // Deep Obsidian / Slate
    dark: 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.4)] border border-slate-800/80',
    // Tactile Porcelain White
    white: 'bg-white text-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_6px_20px_rgba(0,0,0,0.04)] border border-slate-200/90',
    none: ''
  }[theme];

  if (variant === 'grow') {
    // Ultra-smooth fluid panel entrance
    return (
      <div className="relative overflow-visible">
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
            scale: 0.988,
            filter: 'blur(3px)'
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)'
          }}
          transition={{
            duration: 0.36,
            delay,
            ease: [0.16, 1, 0.3, 1] // Apple fluid decelerate
          }}
          whileHover={{ y: -1.5, transition: { duration: 0.2, ease: 'easeOut' } }}
          whileTap={{ scale: 0.985 }}
          onClick={onClick}
          className={`relative overflow-hidden rounded-3xl ${themeStyles} ${className}`}
          {...props}
        >
          {/* Subtle Ambient Specular Gleam */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          {children}
        </motion.div>
      </div>
    );
  }

  // Smooth minimal tactile snap
  return (
    <div className="relative overflow-visible">
      <motion.div
        initial={{
          opacity: 0,
          y: variant === 'subtle-slap' ? 6 : 9,
          scale: 0.985,
          filter: 'blur(2px)'
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)'
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 28,
          mass: 0.7,
          delay
        }}
        whileHover={{ y: -1.5, transition: { duration: 0.2, ease: 'easeOut' } }}
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        className={`relative ${themeStyles} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SlapBlock;
