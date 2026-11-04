import React from 'react';
import { LiquidGlassLogoReveal } from './LiquidGlassLogoReveal';

interface SplashScreenProps {
  onFinish?: () => void;
  isSimulator?: boolean;
  autoDismiss?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  isSimulator = false,
  autoDismiss = true,
}) => {
  return (
    <LiquidGlassLogoReveal
      onFinish={onFinish}
      isSimulator={isSimulator}
      autoDismiss={autoDismiss}
    />
  );
};

export default SplashScreen;
