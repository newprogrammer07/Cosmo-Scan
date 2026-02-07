
import { create } from 'zustand';
import { tourSteps } from '../config/tourSteps';

interface TourState {
  isTourActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  isTourActive: false,
  currentStepIndex: 0,
  startTour: () => {
    set({ isTourActive: true, currentStepIndex: 0 });
  },
  endTour: () => {
    set({ isTourActive: false });
    localStorage.setItem('cosmic-watch-tour-completed', 'true');
  },
  nextStep: () => {
    if (get().currentStepIndex < tourSteps.length - 1) {
      set((state) => ({ currentStepIndex: state.currentStepIndex + 1 }));
    } else {
      get().endTour();
    }
  },
  prevStep: () => {
    if (get().currentStepIndex > 0) {
      set((state) => ({ currentStepIndex: state.currentStepIndex - 1 }));
    }
  },
}));
