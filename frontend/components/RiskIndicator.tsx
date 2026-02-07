
import React from 'react';
import { RiskLevel } from '../types';
import { usePrefersReducedMotion } from '../hooks/useMedia';
import { usePageVisibility } from '../hooks/usePageVisibility';

interface RiskIndicatorProps {
  risk: RiskLevel;
  className?: string;
}

const riskConfig = {
  [RiskLevel.None]: {
    label: 'No Risk',
    color: 'text-gray-400',
    glow: '',
    animation: '',
  },
  [RiskLevel.Low]: {
    label: 'Low Risk',
    color: 'text-green-400',
    glow: 'shadow-[0_0_8px_theme(colors.green.500/0.7)]',
    animation: '',
  },
  [RiskLevel.Moderate]: {
    label: 'Moderate Risk',
    color: 'text-yellow-400',
    glow: 'shadow-[0_0_10px_theme(colors.yellow.500/0.7)]',
    animation: 'animate-pulse-slow',
  },
  [RiskLevel.High]: {
    label: 'High Risk',
    color: 'text-orange-400',
    glow: 'shadow-[0_0_12px_theme(colors.orange.500/0.8)]',
    animation: 'animate-pulse-medium',
  },
  [RiskLevel.Critical]: {
    label: 'Critical Risk',
    color: 'text-red-400',
    glow: 'shadow-[0_0_15px_theme(colors.red.500/0.9)]',
    animation: 'animate-pulse-medium animate-shake-subtle',
  },
};

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk, className = '' }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPageVisible = usePageVisibility();
  
  const config = riskConfig[risk] || riskConfig[RiskLevel.None];
  
  const showAnimation = !prefersReducedMotion && isPageVisible;
  
  const animationClasses = showAnimation ? config.animation : '';

  return (
    <div className={`flex items-center gap-2 font-semibold ${config.color} ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${config.glow} ${animationClasses}`}
        style={{ backgroundColor: 'currentColor' }}
      ></div>
      <span>{config.label}</span>
    </div>
  );
};

export default RiskIndicator;
