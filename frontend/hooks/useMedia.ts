
import { useState, useEffect } from 'react';

/**
 * A React hook that tracks the state of a media query.
 * @param query The media query string to watch.
 * @returns `true` if the media query matches, otherwise `false`.
 */
export const useMedia = (query: string): boolean => {
  // Use a getter function for useState's initial value to run this logic only once.
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    // If the match state has changed, update it.
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    // Use the modern addEventListener/removeEventListener if available.
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Fallback for older browsers.
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
};

/**
 * Custom hook to detect if the user is on a mobile device based on viewport width.
 * @returns `true` if the viewport width is 768px or less.
 */
export const useIsMobile = (): boolean => useMedia('(max-width: 768px)');

/**
 * Custom hook to detect if the user prefers reduced motion.
 * @returns `true` if the user has enabled the 'prefers-reduced-motion' accessibility setting.
 */
export const usePrefersReducedMotion = (): boolean => useMedia('(prefers-reduced-motion: reduce)');
