import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prescription, LabOrder } from '../types';
import { prescriptions as mockRx, labOrders as mockLabs } from '../mock/data';

interface ClinicalState {
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  addPrescription: (rx: Prescription) => void;
  addLabOrder: (order: LabOrder) => void;
}

export const useClinicalStore = create<ClinicalState>()(
  persist(
    (set) => ({
      prescriptions: mockRx,
      labOrders: mockLabs,

      addPrescription: (rx) => set((s) => ({ prescriptions: [rx, ...s.prescriptions] })),

      addLabOrder: (order) => set((s) => ({ labOrders: [order, ...s.labOrders] })),
    }),
    { name: 'medicore-clinical-records' }
  )
);
