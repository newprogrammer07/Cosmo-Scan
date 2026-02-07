import { create } from 'zustand';

export type LiveDataStatus = 'live' | 'idle' | 'error';

// Define the Chart Point Type
interface ChartPoint {
  time: string;
  value: number;
}

interface AppState {
  isCommandCenterMode: boolean;
  toggleCommandCenterMode: () => void;
  setCommandCenterMode: (isActive: boolean) => void;
  
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  
  liveDataStatus: LiveDataStatus;
  setLiveDataStatus: (status: LiveDataStatus) => void;

  // --- NEW: PERSISTENT CHART DATA ---
  communityChartData: ChartPoint[];
  addChartPoint: (point: ChartPoint) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isCommandCenterMode: false,
  toggleCommandCenterMode: () => set((state) => ({ isCommandCenterMode: !state.isCommandCenterMode })),
  setCommandCenterMode: (isActive) => set({ isCommandCenterMode: isActive }),
  
  isDemoMode: false,
  toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
  
  liveDataStatus: 'idle',
  setLiveDataStatus: (status) => set({ liveDataStatus: status }),

  // Initialize with empty array
  communityChartData: [],

  // Action to add a new point and keep only the last 20 (Simulates live feed)
  addChartPoint: (point) => set((state) => {
    const newData = [...state.communityChartData, point];
    // Keep array size manageable (last 20 points)
    return { 
      communityChartData: newData.length > 20 ? newData.slice(newData.length - 20) : newData 
    };
  }),
}));