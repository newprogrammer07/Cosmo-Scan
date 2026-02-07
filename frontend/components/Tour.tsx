
import React, { useEffect, useState, useRef } from 'react';
import { useTourStore } from '../store/useTourStore';
import { tourSteps } from '../config/tourSteps';
import GlassCard from './GlassCard';

interface HighlightStyle {
  top: number;
  left: number;
  width: number;
  height: number;
}

const Tour: React.FC = () => {
  const { isTourActive, currentStepIndex, nextStep, prevStep, endTour } = useTourStore();
  const [highlightStyle, setHighlightStyle] = useState<HighlightStyle | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = tourSteps[currentStepIndex];

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setHighlightStyle(null);
      return;
    }

    const updateHighlight = () => {
        const element = document.querySelector(currentStep.selector);
        if (element) {
            const rect = element.getBoundingClientRect();
            setHighlightStyle({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            });
            
            if (element instanceof HTMLElement) {
                element.focus({ preventScroll: true });
            }
        } else {
             
            nextStep();
        }
    }
    
    
    updateHighlight();

    
    const timeoutId = setTimeout(updateHighlight, 100);

    
    window.addEventListener('resize', updateHighlight);

    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updateHighlight);
    };

  }, [isTourActive, currentStep, currentStepIndex, nextStep]);

  if (!isTourActive || !highlightStyle) {
    return null;
  }

  const tooltipPositionStyle = (): React.CSSProperties => {
    if (!tooltipRef.current) return {};
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 16;
    let style: React.CSSProperties = {
        position: 'fixed',
        transition: 'top 0.3s ease, left 0.3s ease'
    };
    
    switch(currentStep.position) {
        case 'top':
            style.top = highlightStyle.top - tooltipRect.height - margin;
            style.left = highlightStyle.left + highlightStyle.width / 2 - tooltipRect.width / 2;
            break;
        case 'left':
            style.top = highlightStyle.top + highlightStyle.height / 2 - tooltipRect.height / 2;
            style.left = highlightStyle.left - tooltipRect.width - margin;
            break;
        case 'right':
            style.top = highlightStyle.top + highlightStyle.height / 2 - tooltipRect.height / 2;
            style.left = highlightStyle.left + highlightStyle.width + margin;
            break;
        default: // bottom
            style.top = highlightStyle.top + highlightStyle.height + margin;
            style.left = highlightStyle.left + highlightStyle.width / 2 - tooltipRect.width / 2;
            break;
    }

    
    style.left = Math.max(margin, Math.min(style.left as number, window.innerWidth - tooltipRect.width - margin));
    style.top = Math.max(margin, Math.min(style.top as number, window.innerHeight - tooltipRect.height - margin));

    return style;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[999] transition-opacity duration-300 animate-fadeIn" onClick={endTour}></div>
      <div
        className="fixed box-border rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] z-[1000] transition-all duration-300"
        style={{
          top: highlightStyle.top - 4,
          left: highlightStyle.left - 4,
          width: highlightStyle.width + 8,
          height: highlightStyle.height + 8,
          boxShadow: `0 0 0 9999px rgba(0,0,0,0.7), 0 0 15px theme(colors.neon.cyan)`,
          borderColor: 'theme(colors.neon.cyan)',
          borderWidth: '2px',
        }}
      />
      
      <div ref={tooltipRef} style={tooltipPositionStyle()} className="z-[1001] w-72" role="dialog" aria-modal="true">
        <GlassCard>
          <p className="text-sm text-gray-200">{currentStep.content}</p>
          <div className="flex justify-between items-center mt-4">
            <button onClick={endTour} className="text-sm text-gray-400 hover:text-white">Skip Tour</button>
            <div className="flex gap-2">
              {currentStepIndex > 0 && <button onClick={prevStep} className="text-sm bg-white/10 text-white rounded-lg py-1 px-3 hover:bg-white/20">&larr; Back</button>}
              <button onClick={nextStep} className="text-sm bg-neon-cyan/80 text-black font-bold rounded-lg py-1 px-3 hover:bg-neon-cyan">
                {currentStepIndex === tourSteps.length - 1 ? 'Finish' : 'Next'} &rarr;
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
};

export default Tour;
