import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Patient } from "../types";
import { patients as mockPatients } from "../mock/data";

interface PatientState {
  patients: Patient[];
  addPatient: (patient: Patient) => Patient;
  getByUhid: (uhid: string) => Patient | undefined;
  getByPhone: (phone: string) => Patient | undefined;
  searchPatients: (query: string) => Patient[];
}

export const usePatients = create<PatientState>()(
  persist(
    (set, get) => ({
      patients: mockPatients,

      addPatient: (patient) => {
        set((s) => ({ patients: [patient, ...s.patients] }));
        return patient;
      },

      getByUhid: (uhid) => get().patients.find((p) => p.mrn === uhid),

      getByPhone: (phone) =>
        get().patients.find((p) => p.phone.replace(/\s/g, "").includes(phone.replace(/\s/g, ""))),

      searchPatients: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return get().patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.mrn.toLowerCase().includes(q) ||
            p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
        );
      },
    }),
    {
      name: "medicore-patients",
      // Don't persist mock seed — on first load use mock, then persist any newly added
      partialize: (s) => ({ patients: s.patients }),
    }
  )
);
