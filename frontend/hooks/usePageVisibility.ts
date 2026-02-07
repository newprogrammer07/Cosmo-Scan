
import { useState, useEffect } from 'react';

/**
 * A React hook that tracks whether the current browser tab is visible.
 * @returns `true` if the page is visible, otherwise `false`.
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
