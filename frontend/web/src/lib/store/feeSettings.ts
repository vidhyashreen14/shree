import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FeeSettings {
  registrationFee: number;
  consultationFee: number;
  setRegistrationFee: (fee: number) => void;
  setConsultationFee: (fee: number) => void;
  setFees: (reg: number, consult: number) => void;
}

export const useFeeSettings = create<FeeSettings>()(
  persist(
    (set) => ({
      registrationFee: 100,
      consultationFee: 500,
      setRegistrationFee: (fee) => set({ registrationFee: fee }),
      setConsultationFee: (fee) => set({ consultationFee: fee }),
      setFees: (reg, consult) => set({ registrationFee: reg, consultationFee: consult }),
    }),
    { name: "medicore-fee-settings" }
  )
);
