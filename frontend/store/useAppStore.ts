import { create } from 'zustand';

export type LiveDataStatus = 'live' | 'idle' | 'error';


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

  
  communityChartData: [],

  
  addChartPoint: (point) => set((state) => {
    const newData = [...state.communityChartData, point];
    
    return { 
      communityChartData: newData.length > 20 ? newData.slice(newData.length - 20) : newData 
    };
  }),
}));
