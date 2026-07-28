import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ClinicEntry {
  id: string;
  name: string;
  contact: string;
  address: string;
  branch: string;
  pincode: string;
  openingTime: string;
  closingTime: string;
  status: 'Active' | 'Trial' | 'Inactive';
  admin: string;
  enabledModules: string[];
  clientId: string;
  apiKey: string;
  mfaEnforced: boolean;
  ipRestriction: string;
  activeSessions: number;
}

interface SuperHospitalState {
  hospitals: ClinicEntry[];
  addHospital: (
    hospital: Omit<
      ClinicEntry,
      | 'id'
      | 'clientId'
      | 'apiKey'
      | 'activeSessions'
      | 'enabledModules'
      | 'mfaEnforced'
      | 'ipRestriction'
    >,
  ) => ClinicEntry;
  updateHospital: (id: string, patch: Partial<ClinicEntry>) => void;
  deleteHospital: (id: string) => void;
  setHospitals: (hospitals: ClinicEntry[]) => void;
}

export const useSuperHospitals = create<SuperHospitalState>()(
  persist(
    (set) => ({
      hospitals: [], // Real data only, starts empty
      addHospital: (data) => {
        const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const randHex = () => Math.floor(Math.random() * 16777215).toString(16);
        const newHospital: ClinicEntry = {
          ...data,
          id: `H${String(Date.now()).slice(-4)}`,
          clientId: `cli_${cleanName || 'clinic'}_${String(Date.now()).slice(-3)}`,
          apiKey: `mc_live_${randHex()}${randHex()}`,
          activeSessions: 0,
          enabledModules: ['opd'],
          mfaEnforced: false,
          ipRestriction: '',
        };
        set((state) => ({ hospitals: [newHospital, ...state.hospitals] }));
        return newHospital;
      },
      updateHospital: (id, patch) =>
        set((state) => ({
          hospitals: state.hospitals.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
      deleteHospital: (id) =>
        set((state) => ({
          hospitals: state.hospitals.filter((h) => h.id !== id),
        })),
      setHospitals: (hospitals) => set({ hospitals }),
    }),
    { name: 'medicore-super-hospitals' },
  ),
);
