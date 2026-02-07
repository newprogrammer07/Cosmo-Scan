import React, { useRef, useState } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ children, onClick, className = '', variant = 'primary', type = 'button', disabled }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  // FIX: Reset position if the button becomes disabled to avoid it getting stuck in a hover state.
  React.useEffect(() => {
    if (disabled) {
      setPosition({ x: 0, y: 0 });
    }
  }, [disabled]);

  const { x, y } = position;

  const primaryClasses = 'bg-neon-cyan/80 text-space-black hover:bg-neon-cyan shadow-[0_0_15px_rgba(0,255,255,0.6)]';
  const secondaryClasses = 'border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 backdrop-blur-sm';

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      type={type}
      disabled={disabled}
      style={{
        transform: `translate(${x * 0.15}px, ${y * 0.15}px)`,
      }}
      className={`relative rounded-full px-8 py-3 font-bold uppercase tracking-wider transition-all duration-300 ease-out ${variant === 'primary' ? primaryClasses : secondaryClasses} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
    >
      <span
        style={{
          transform: `translate(${x * 0.1}px, ${y * 0.1}px)`,
        }}
        className="block transition-transform duration-500 ease-out"
      >
        {children}
      </span>
    </button>
  );
};

export default MagneticButton;
