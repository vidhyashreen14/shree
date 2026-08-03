import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prescription, LabOrder } from '../types';
import { prescriptions as mockRx, labOrders as mockLabs } from '../mock/data';

import { useAuth } from './auth';
import { useAudit } from './audit';

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

      addPrescription: (rx) => {
        set((s) => ({ prescriptions: [rx, ...s.prescriptions] }));
        const user = useAuth.getState().user;
        if (user) {
          useAudit.getState().addLog({
            user: user.name,
            role: user.role,
            action: 'Prescribed medication',
            target: rx.id,
          });
        }
      },

      addLabOrder: (order) => {
        set((s) => ({ labOrders: [order, ...s.labOrders] }));
        const user = useAuth.getState().user;
        if (user) {
          useAudit.getState().addLog({
            user: user.name,
            role: user.role,
            action: 'Ordered lab test',
            target: order.id,
          });
        }
      },
    }),
    {
      name: 'medicore-clinical-records',
      onRehydrateStorage: () => () => {
        if (typeof window === 'undefined') return;
        window.addEventListener('storage', (e) => {
          if (e.key === 'medicore-clinical-records') {
            useClinicalStore.persist.rehydrate();
          }
        });
      },
    },
  ),
);
