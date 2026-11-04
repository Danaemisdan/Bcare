import React from 'react';
import bcareMarkImg from '../assets/bcare-mark.png';
import bcareHorizImg from '../assets/bcare-logo-horizontal.png';
import bcareFullImg from '../assets/bcare-logo.png';

interface BCareLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'icon' | 'full' | 'stacked';
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  showGlow?: boolean;
}

export const BCareLogo: React.FC<BCareLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showGlow = false
}) => {
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm': return 24;
      case 'md': return 32;
      case 'lg': return 40;
      case 'xl': return 52;
      default: return 32;
    }
  };

  const dim = getDimension();

  if (variant === 'icon') {
    return (
      <div 
        className={`inline-flex items-center justify-center select-none shrink-0 ${
          showGlow ? 'drop-shadow-[0_4px_14px_rgba(18,44,243,0.35)]' : ''
        } ${className}`}
        style={{ width: dim, height: dim }}
      >
        <img
          src={bcareMarkImg}
          alt="B Care Medical Logo"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div 
        className={`inline-flex flex-col items-center select-none shrink-0 ${
          showGlow ? 'drop-shadow-[0_6px_18px_rgba(18,44,243,0.3)]' : ''
        } ${className}`}
        style={{ width: dim * 2, height: 'auto' }}
      >
        <img
          src={bcareFullImg}
          alt="B Care Medical Logo"
          className="w-full h-auto object-contain pointer-events-none select-none"
        />
      </div>
    );
  }

  // Default: variant === 'full' (horizontal emblem + B Care™ wordmark)
  return (
    <div 
      className={`inline-flex items-center select-none shrink-0 ${
        showGlow ? 'drop-shadow-[0_3px_10px_rgba(18,44,243,0.22)]' : ''
      } ${className}`}
      style={{ height: dim }}
    >
      <img
        src={bcareHorizImg}
        alt="B Care Medical Logo"
        className="h-full w-auto object-contain pointer-events-none select-none"
        style={{ height: dim, maxHeight: dim }}
      />
    </div>
  );
};

export default BCareLogo;
