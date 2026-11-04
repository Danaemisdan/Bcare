import React, { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useTransform, animate, motion } from 'framer-motion';

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
  once?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  duration = 1.4,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
  once = true
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once });
  const motionVal = useMotionValue(from);
  const [displayValue, setDisplayValue] = useState<string>(
    formatNumber(from, decimals, separator)
  );

  function formatNumber(num: number, dec: number, sep: string): string {
    const fixed = num.toFixed(dec);
    const [intPart, decPart] = fixed.split('.');
    
    // Indian / Standard thousand separator
    const regex = /\B(?=(\d{3})+(?!\d))/g;
    const formattedInt = intPart.replace(regex, sep);
    
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionVal, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1], // Apple-smooth cubic-bezier easing
      onUpdate: (latest) => {
        setDisplayValue(formatNumber(latest, decimals, separator));
      }
    });

    return () => controls.stop();
  }, [isInView, to, duration, delay, decimals, separator, motionVal]);

  return (
    <span
      ref={ref}
      className={`inline-flex items-center tabular-nums select-none ${className}`}
    >
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span>{displayValue}</span>
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
};

export default CountUp;