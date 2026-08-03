import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NurseQueueEntry } from '../types';
import { useAuth } from './auth';
import { useAudit } from './audit';

interface NurseQueueState {
  queue: NurseQueueEntry[];
  addToQueue: (entry: NurseQueueEntry) => void;
  markVitalsStatus: (id: string, status: NurseQueueEntry['vitalsStatus']) => void;
  saveVitals: (id: string, vitals: NurseQueueEntry['vitals']) => void;
  /** Push a patient directly from the nurse with vitals already recorded (no prior frontdesk queue entry) */
  pushDirectToDoctor: (entry: NurseQueueEntry) => void;
  markConsultStatus: (id: string, status: NonNullable<NurseQueueEntry['consultStatus']>) => void;
  removeFromQueue: (id: string) => void;
  clearDone: () => void;
}

export const useNurseQueue = create<NurseQueueState>()(
  persist(
    (set) => ({
      queue: [],

      addToQueue: (entry) => set((s) => ({ queue: [entry, ...s.queue] })),

      markVitalsStatus: (id, status) =>
        set((s) => ({
          queue: s.queue.map((e) => (e.id === id ? { ...e, vitalsStatus: status } : e)),
        })),

      saveVitals: (id, vitals) => {
        set((s) => ({
          queue: s.queue.map((e) =>
            e.id === id ? { ...e, vitals, vitalsStatus: 'done', consultStatus: 'waiting' } : e,
          ),
        }));
        const user = useAuth.getState().user;
        if (user && user.role !== 'admin') {
          useAudit.getState().addLog({
            user: user.name,
            role: user.role,
            action: 'Recorded vitals',
            target: `Queue ID: ${id}`,
          });
        }
      },

      /** Create a brand-new queue entry that is already vitals-done and waiting for the doctor */
      pushDirectToDoctor: (entry) => {
        set((s) => ({ queue: [entry, ...s.queue] }));
        const user = useAuth.getState().user;
        if (user && user.role !== 'admin') {
          useAudit.getState().addLog({
            user: user.name,
            role: user.role,
            action: 'Recorded vitals & pushed to doctor',
            target: `${entry.patientName} → ${entry.doctorName}`,
          });
        }
      },

      markConsultStatus: (id, status) =>
        set((s) => ({
          queue: s.queue.map((e) => (e.id === id ? { ...e, consultStatus: status } : e)),
        })),

      removeFromQueue: (id) => set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),

      clearDone: () => set((s) => ({ queue: s.queue.filter((e) => e.vitalsStatus !== 'done') })),
    }),
    {
      name: 'medicore-nurse-queue',
      // Sync queue state across browser tabs via localStorage storage events
      onRehydrateStorage: () => () => {
        if (typeof window === 'undefined') return;
        window.addEventListener('storage', (e) => {
          if (e.key === 'medicore-nurse-queue') {
            useNurseQueue.persist.rehydrate();
          }
        });
      },
    },
  ),
);
