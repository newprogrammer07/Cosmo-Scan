
import { useState, useEffect } from 'react';


export const useMedia = (query: string): boolean => {
  
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
     
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
};


export const useIsMobile = (): boolean => useMedia('(max-width: 768px)');


export const usePrefersReducedMotion = (): boolean => useMedia('(prefers-reduced-motion: reduce)');
