
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`glassmorphism rounded-2xl p-6 shadow-2xl shadow-black/30 transition-all duration-300 hover:border-white/20 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
