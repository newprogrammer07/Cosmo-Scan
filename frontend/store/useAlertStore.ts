import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

// 1. Export the Interface so other files can use it
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

const API_URL = 'http://localhost:5000';

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  fetchAlerts: async () => {
    // Access the user from the Auth Store
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const res = await fetch(`${API_URL}/alerts?email=${user.email}`);
      if (!res.ok) throw new Error("Failed to fetch alerts");
      
      // Fix: Tell TypeScript this data is an array of Alerts
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
      const res = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, threshold, email: user.email }),
      });

      if (!res.ok) throw new Error("Failed to create alert");

      // Fix: Tell TypeScript this is a single Alert
      const newAlert = (await res.json()) as Alert;
      set((state) => ({ alerts: [...state.alerts, newAlert] }));
    } catch (error) {
      console.error("Failed to add alert", error);
    }
  },

  toggleAlert: async (id, currentState) => {
    try {
      // Optimistic Update: Update UI immediately
      set((state) => ({
        alerts: state.alerts.map((a) => 
          a.id === id ? { ...a, enabled: !currentState } : a
        )
      }));

      // Send to Backend
      await fetch(`${API_URL}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentState }),
      });
    } catch (error) {
      console.error("Failed to toggle alert", error);
      // Optional: Revert state here if failed
    }
  },

  deleteAlert: async (id) => {
    try {
      // Optimistic Update: Remove from UI immediately
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id)
      }));

      // Send to Backend
      await fetch(`${API_URL}/alerts/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete alert", error);
    }
  }
}));