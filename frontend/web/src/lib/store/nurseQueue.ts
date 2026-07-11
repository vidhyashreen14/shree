import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NurseQueueEntry } from "../types";

interface NurseQueueState {
  queue: NurseQueueEntry[];
  addToQueue: (entry: NurseQueueEntry) => void;
  markVitalsStatus: (id: string, status: NurseQueueEntry["vitalsStatus"]) => void;
  saveVitals: (id: string, vitals: NurseQueueEntry["vitals"]) => void;
  markConsultStatus: (id: string, status: NonNullable<NurseQueueEntry["consultStatus"]>) => void;
  removeFromQueue: (id: string) => void;
  clearDone: () => void;
}

export const useNurseQueue = create<NurseQueueState>()(
  persist(
    (set) => ({
      queue: [],

      addToQueue: (entry) =>
        set((s) => ({ queue: [entry, ...s.queue] })),

      markVitalsStatus: (id, status) =>
        set((s) => ({
          queue: s.queue.map((e) => (e.id === id ? { ...e, vitalsStatus: status } : e)),
        })),

      saveVitals: (id, vitals) =>
        set((s) => ({
          queue: s.queue.map((e) => (e.id === id ? { ...e, vitals, vitalsStatus: "done", consultStatus: "waiting" } : e)),
        })),

      markConsultStatus: (id, status) =>
        set((s) => ({
          queue: s.queue.map((e) => (e.id === id ? { ...e, consultStatus: status } : e)),
        })),

      removeFromQueue: (id) =>
        set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),

      clearDone: () =>
        set((s) => ({ queue: s.queue.filter((e) => e.vitalsStatus !== "done") })),
    }),
    { name: "medicore-nurse-queue" }
  )
);
