import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { API_BASE_URL } from '../config'; 

export interface Alert {
  id: number;
  name: string;
  threshold: number;
  enabled: boolean;
}

interface AlertStore {
  alerts: Alert[];
  fetchAlerts: () => Promise<void>;
  addAlert: (name: string, threshold: number) => Promise<void>;
  toggleAlert: (id: number, currentState: boolean) => Promise<void>;
  deleteAlert: (id: number) => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  fetchAlerts: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/alerts?email=${user.email}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      
      const data = (await res.json()) as Alert[]; 
      set({ alerts: data });
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
  },

  addAlert: async (name, threshold) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, threshold, email: user.email }),
      });

      if (!res.ok) throw new Error("Failed to create alert");

      const newAlert = (await res.json()) as Alert;
      set((state) => ({ alerts: [...state.alerts, newAlert] }));
    } catch (error) {
      console.error("Failed to add alert", error);
    }
  },

  toggleAlert: async (id, currentState) => {
    try {
      set((state) => ({
        alerts: state.alerts.map((a) => 
          a.id === id ? { ...a, enabled: !currentState } : a
        )
      }));

      
      await fetch(`${API_BASE_URL}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentState }),
      });
    } catch (error) {
      console.error("Failed to toggle alert", error);
    }
  },

  deleteAlert: async (id) => {
    try {
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id)
      }));

      await fetch(`${API_BASE_URL}/alerts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete alert", error);
    }
  }
}));