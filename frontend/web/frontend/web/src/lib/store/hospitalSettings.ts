import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HospitalSettings {
  logoUrl: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  licenseNumber: string;
  updateSettings: (settings: Partial<Omit<HospitalSettings, 'updateSettings'>>) => void;
}

export const useHospitalSettings = create<HospitalSettings>()(
  persist(
    (set) => ({
      logoUrl: '', // Defaults to empty so we can display placeholder/MediCore logo, and customizable via file upload
      name: 'MediCore Multispecialty Hospital',
      phone: '+91 22 4000 0000',
      email: 'contact@medicore.io',
      address: '2nd Floor, Health Plaza, Bandra Kurla Complex, Mumbai 400051',
      gstNumber: '27AABCM1234L1ZP',
      licenseNumber: 'HOSP-MH-887421',
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    { name: 'medicore-hospital-settings' }
  )
);
