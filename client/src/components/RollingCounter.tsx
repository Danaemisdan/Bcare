import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface DigitProps {
  digit: string;
  height: number;
  stiffness?: number;
  damping?: number;
  motionBlur?: boolean;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

const SingleDigitColumn: React.FC<DigitProps> = ({
  digit,
  height,
  stiffness = 300,
  damping = 30,
  motionBlur = true
}) => {
  const numericDigit = parseInt(digit, 10);
  const isNumber = !isNaN(numericDigit);

  // If not a number (e.g. comma, dot, slash, plus), render statically inline
  if (!isNumber) {
    return (
      <span className="inline-flex items-center justify-center tabular-nums">
        {digit}
      </span>
    );
  }

  // Spring physics for smooth continuous rolling
  const animatedIndex = useSpring(numericDigit, {
    stiffness,
    damping,
    mass: 0.8
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const prevDigitRef = useRef(numericDigit);

  useEffect(() => {
    if (prevDigitRef.current !== numericDigit) {
      setIsAnimating(true);
      animatedIndex.set(numericDigit);
      prevDigitRef.current = numericDigit;
      const timeout = setTimeout(() => setIsAnimating(false), 380);
      return () => clearTimeout(timeout);
    }
  }, [numericDigit, animatedIndex]);

  const y = useTransform(animatedIndex, (val) => `-${val * 10}%`);

  return (
    <span
      className="inline-block relative overflow-hidden tabular-nums select-none"
      style={{ height: `${height}px`, verticalAlign: 'top' }}
    >
      <motion.span
        style={{ y }}
        className={`flex flex-col items-center ${
          motionBlur && isAnimating ? 'transition-all duration-150 filter blur-[0.4px]' : ''
        }`}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex items-center justify-center"
            style={{ height: `${height}px` }}
          >
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

export interface RollingCounterProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  className?: string;
  height?: number;
  stiffness?: number;
  damping?: number;
  motionBlur?: boolean;
  formatCommas?: boolean;
}

export const RollingCounter: React.FC<RollingCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
  height = 20,
  stiffness = 280,
  damping = 26,
  motionBlur = true,
  formatCommas = true
}) => {
  // Format numeric value with commas if requested
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'number') {
      if (formatCommas) {
        return value.toLocaleString('en-IN');
      }
      return value.toString();
    }
    return value.toString();
  }, [value, formatCommas]);

  const characters = formattedValue.split('');

  return (
    <span className={`inline-flex items-center tabular-nums font-sans ${className}`}>
      {prefix && <span className="mr-0.5 select-none">{prefix}</span>}
      <span className="inline-flex items-center">
        {characters.map((char, index) => (
          <SingleDigitColumn
            key={`${index}-${char}`}
            digit={char}
            height={height}
            stiffness={stiffness}
            damping={damping}
            motionBlur={motionBlur}
          />
        ))}
      </span>
      {suffix && <span className="ml-1 select-none">{suffix}</span>}
    </span>
  );
};

export default RollingCounter;