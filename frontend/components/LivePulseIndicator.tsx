import React from 'react';
import { usePrefersReducedMotion } from '../hooks/useMedia';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { LiveDataStatus } from '../store/useAppStore';

interface LivePulseIndicatorProps {
  status: LiveDataStatus;
}

const statusConfig = {
  live: {
    dotColor: 'bg-neon-cyan',
    textColor: 'text-neon-cyan',
    label: 'LIVE DATA',
    animation: 'animate-pulse-live',
  },
  idle: {
    dotColor: 'bg-gray-500',
    textColor: 'text-gray-400',
    label: 'DATA PAUSED',
    animation: '',
  },
  error: {
    dotColor: 'bg-red-500',
    textColor: 'text-red-400',
    label: 'CONNECTION LOST',
    animation: '',
  },
};

const LivePulseIndicator: React.FC<LivePulseIndicatorProps> = ({ status }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isPageVisible = usePageVisibility();
  
  const config = statusConfig[status] || statusConfig.idle;
  
  const showAnimation = status === 'live' && !prefersReducedMotion && isPageVisible;

  return (
    <div
      className="flex items-center gap-2"
      role="status"
      aria-live="polite"
      aria-label={`Data status: ${config.label}`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full transition-colors ${config.dotColor} ${showAnimation ? config.animation : ''}`}
      ></div>
      <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
};

export default LivePulseIndicator;
