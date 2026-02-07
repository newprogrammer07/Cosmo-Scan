
export interface TourStep {
  selector: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    selector: '[data-tour-id="live-feed"]',
    content: 'This is the live asteroid feed, constantly updating with near-Earth objects.',
    position: 'bottom',
  },
  {
    selector: '[data-tour-id="view-details"]',
    content: 'Click here to explore an asteroid’s trajectory and risk data in 3D.',
    position: 'bottom',
  },
  {
    selector: '[data-tour-id="watchlist-button"]',
    content: 'Save asteroids to your personal watchlist to monitor them over time.',
    position: 'bottom',
  },
  {
    selector: '[data-tour-id="alerts-nav"]',
    content: 'Set custom alerts to get notified about potentially hazardous approaches.',
    position: 'right',
  },
  {
    selector: '[data-tour-id="community-nav"]',
    content: 'Discuss your findings and collaborate with the community in real time.',
    position: 'right',
  },
];
