import { create } from 'zustand';

export interface IntegrationState {
  gsc: {
    connected: boolean;
    sites: string[];
    selectedSite: string | null;
    lastSync: string | null;
    metrics: { clicks: number; impressions: number; ctr: number; position: number } | null;
  };
  ga4: {
    connected: boolean;
    properties: { id: string; name: string }[];
    selectedProperty: string | null;
    lastSync: string | null;
    metrics: { users: number; sessions: number; topPages: { path: string; views: number }[] } | null;
  };
  salla: {
    connected: boolean;
    storeName: string | null;
    productsCount: number | null;
    ordersCount: number | null;
    lastSync: string | null;
  };
  setGscState: (state: Partial<IntegrationState['gsc']>) => void;
  setGa4State: (state: Partial<IntegrationState['ga4']>) => void;
  setSallaState: (state: Partial<IntegrationState['salla']>) => void;
}

export const useIntegrationsStore = create<IntegrationState>((set) => ({
  gsc: {
    connected: false,
    sites: [],
    selectedSite: null,
    lastSync: null,
    metrics: null,
  },
  ga4: {
    connected: false,
    properties: [],
    selectedProperty: null,
    lastSync: null,
    metrics: null,
  },
  salla: {
    connected: false,
    storeName: null,
    productsCount: null,
    ordersCount: null,
    lastSync: null,
  },
  setGscState: (state) => set((prev) => ({ gsc: { ...prev.gsc, ...state } })),
  setGa4State: (state) => set((prev) => ({ ga4: { ...prev.ga4, ...state } })),
  setSallaState: (state) => set((prev) => ({ salla: { ...prev.salla, ...state } })),
}));
