import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer Orbit - Cyan */}
        <div 
          className="absolute w-full h-full border-t-2 border-b-2 border-neon-cyan rounded-full animate-spin" 
          style={{ animationDuration: '2s' }}
        ></div>
        
        {/* Inner Orbit - Purple (Reverse) */}
        <div 
          className="absolute w-24 h-24 border-l-2 border-r-2 border-purple-500 rounded-full animate-spin" 
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        ></div>

        {/* Core - Glowing Dot */}
        <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
      </div>

      {/* Text - Positioned below and tracking/pulsing */}
      <div className="mt-8 flex flex-col items-center">
        <span className="text-xs font-bold tracking-[0.3em] uppercase text-neon-cyan animate-pulse">
          Scanning Deep Space
        </span>
        <div className="flex gap-1 mt-2">
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;