import React from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';

export type SiriOrbState = 'idle' | 'listening' | 'thinking' | 'streaming' | 'done' | 'error';

export interface SiriOrbProps {
  size?: number | string;
  className?: string;
  state?: SiriOrbState;
  animationDuration?: number;
  colors?: {
    bg?: string;
    c1?: string;
    c2?: string;
    c3?: string;
    c4?: string;
  };
  onClick?: () => void;
}

const STATE_CONFIG: Record<SiriOrbState, { speed: number; glow: number; scale: number; saturation: number }> = {
  idle: { speed: 1.0, glow: 0.5, scale: 1, saturation: 1.2 },
  listening: { speed: 1.6, glow: 0.75, scale: 1.05, saturation: 1.3 },
  thinking: { speed: 2.0, glow: 0.85, scale: 1.07, saturation: 1.35 },
  streaming: { speed: 1.6, glow: 0.7, scale: 1.04, saturation: 1.25 },
  done: { speed: 0.8, glow: 0.6, scale: 1.05, saturation: 1.2 },
  error: { speed: 0.5, glow: 0.35, scale: 0.96, saturation: 0.75 },
};

export const SiriOrb: React.FC<SiriOrbProps> = ({
  size = 50,
  className = '',
  state = 'idle',
  animationDuration = 18,
  colors,
  onClick,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const config = STATE_CONFIG[state] || STATE_CONFIG.idle;

  // Luminous Apple Intelligence Siri Orb Palette
  const defaultColors = {
    bg: '#090d1a', // Deep twilight space
    c1: '#ff375f', // Apple Vibrant Rose
    c2: '#00d4ff', // Luminous Electric Cyan
    c3: '#7952ff', // Electric Violet
    c4: '#30e8bd', // Fresh Aurora Emerald
  };

  const finalColors = { ...defaultColors, ...colors };
  const sizeValue = typeof size === 'number' ? size : parseInt(size.replace('px', ''), 10) || 50;

  // Ultra-smooth liquid blur calculations
  const blurAmount = Math.max(sizeValue * 0.11, 7.0);
  const contrastAmount = 1.15;
  const shadowSpread = Math.max(sizeValue * 0.08, 4);
  const rim = Math.max(sizeValue * 0.08, 2.5);
  const loopDuration = shouldReduceMotion ? animationDuration : animationDuration / config.speed;
  const driftDuration = (12 / (1 + config.speed)) * 1.5;

  return (
    <motion.div
      onClick={onClick}
      animate={
        shouldReduceMotion
          ? { scale: 1 }
          : { scale: [config.scale, config.scale * 1.03, config.scale] }
      }
      transition={{
        duration: state === 'thinking' ? 2.4 : 4.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`relative select-none ${className}`}
      style={{
        width: `${sizeValue}px`,
        height: `${sizeValue}px`,
      }}
    >
      {/* Outer Ethereal Atmosphere Bloom - Smooth & Luminous */}
      <motion.div
        animate={{
          opacity: [config.glow * 0.7, config.glow * 1.0, config.glow * 0.7],
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: state === 'thinking' ? 1.8 : 3.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-[-18%] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.55) 0%, rgba(168, 85, 247, 0.38) 42%, transparent 72%)`,
          filter: `blur(${sizeValue * 0.25}px)`,
        }}
      />

      {/* The 21st.dev Siri Orb Container */}
      <div
        className="siri-orb-root w-full h-full rounded-full relative overflow-hidden"
        style={{
          // Custom CSS properties passed into scoped animation styles
          ['--animation-duration' as any]: `${loopDuration}s`,
          ['--bg' as any]: finalColors.bg,
          ['--blur-amount' as any]: `${blurAmount}px`,
          ['--c1' as any]: finalColors.c1,
          ['--c2' as any]: finalColors.c2,
          ['--c3' as any]: finalColors.c3,
          ['--c4' as any]: finalColors.c4,
          ['--contrast-amount' as any]: contrastAmount,
          ['--drift-duration' as any]: `${driftDuration}s`,
          ['--rim' as any]: `${rim}px`,
          ['--shadow-spread' as any]: `${shadowSpread}px`,
          filter: `saturate(${config.saturation})`,
        }}
      >
        {/* Specular Sheen (Drifts gracefully across the top half) */}
        <span aria-hidden="true" className="siri-orb-layer siri-orb-sheen" />

        {/* 3D Depth Rim (Lit top edge and silky smooth shaded bottom) */}
        <span aria-hidden="true" className="siri-orb-layer siri-orb-rim" />

        {/* Global Component Scoped Styles */}
        <style>{`
          @property --angle {
            syntax: "<angle>";
            inherits: false;
            initial-value: 0deg;
          }

          .siri-orb-root {
            display: grid;
            grid-template-areas: "stack";
            overflow: hidden;
            border-radius: 50%;
            position: relative;
            isolation: isolate;
            box-shadow: 
              0 14px 38px -4px rgba(0, 212, 255, 0.42),
              0 6px 18px -2px rgba(121, 82, 255, 0.35),
              inset 0 1.5px 2px rgba(255, 255, 255, 0.95);
          }

          .siri-orb-root::before,
          .siri-orb-root::after,
          .siri-orb-root > .siri-orb-layer {
            content: "";
            display: block;
            grid-area: stack;
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }

          /* Glassy highlight that drifts infinitely */
          .siri-orb-sheen {
            background:
              radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.15) 28%, transparent 42%),
              radial-gradient(circle at 68% 78%, rgba(255, 255, 255, 0.22) 0%, transparent 45%);
            mix-blend-mode: screen;
            animation: siri-sheen-drift var(--drift-duration) ease-in-out infinite alternate;
          }

          /* 3D Glass Lit Rim - Pure Apple Specular Sheen */
          .siri-orb-rim {
            box-shadow:
              inset 0 0 0 1px rgba(255, 255, 255, 0.4),
              inset 0 calc(var(--rim) * 1) calc(var(--rim) * 1.5) rgba(255, 255, 255, 0.65),
              inset 0 calc(var(--rim) * -1) calc(var(--rim) * 1.8) rgba(10, 15, 35, 0.5);
            pointer-events: none;
          }

          @keyframes siri-sheen-drift {
            0% { transform: translate(-4%, -3%) scale(1.02); }
            100% { transform: translate(4%, 4%) scale(1.06); }
          }

          /* Multi-layer rotating conic gradients blended with liquid softness */
          .siri-orb-root::before {
            background:
              conic-gradient(
                from calc(var(--angle) * 2) at 25% 70%,
                var(--c3),
                transparent 22% 78%,
                var(--c3)
              ),
              conic-gradient(
                from calc(var(--angle) * 2) at 45% 75%,
                var(--c2),
                transparent 30% 60%,
                var(--c2)
              ),
              conic-gradient(
                from calc(var(--angle) * -3) at 80% 20%,
                var(--c1),
                transparent 35% 65%,
                var(--c1)
              ),
              conic-gradient(
                from calc(var(--angle) * 1.5) at 60% 35%,
                var(--c4),
                transparent 25% 75%,
                var(--c4)
              ),
              conic-gradient(
                from calc(var(--angle) * 2) at 15% 5%,
                var(--c2),
                transparent 15% 85%,
                var(--c2)
              ),
              conic-gradient(
                from calc(var(--angle) * 1) at 20% 80%,
                var(--c1),
                transparent 15% 85%,
                var(--c1)
              ),
              conic-gradient(
                from calc(var(--angle) * -2) at 85% 10%,
                var(--c3),
                transparent 22% 78%,
                var(--c3)
              );
            box-shadow: inset var(--bg) 0 0 var(--shadow-spread) calc(var(--shadow-spread) * 0.3);
            filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(1.35);
            animation: siri-mesh-rotate var(--animation-duration) linear infinite;
          }

          /* Pure Silky Glass Specular Glaze (Zero Grain / No Dithering) */
          .siri-orb-root::after {
            background: radial-gradient(
              circle at 45% 40%,
              rgba(255, 255, 255, 0.35) 0%,
              rgba(255, 255, 255, 0.08) 35%,
              transparent 70%
            );
            mix-blend-mode: overlay;
            pointer-events: none;
          }

          @keyframes siri-mesh-rotate {
            from {
              --angle: 0deg;
              transform: rotate(0deg);
            }
            to {
              --angle: 360deg;
              transform: rotate(360deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .siri-orb-root::before,
            .siri-orb-sheen {
              animation: none;
            }
          }
        `}</style>
      </div>
    </motion.div>
  );
};

export default SiriOrb;
