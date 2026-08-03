import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Bill Line Item ───────────────────────────────────────────────────────────

export interface BillLineItem {
  id: string;
  name: string;
  amount: number;
  enabled: boolean;
}

// ─── Bill Category ────────────────────────────────────────────────────────────

export interface BillCategory {
  id: string;
  label: string;
  items: BillLineItem[];
}

// ─── Default Categories ───────────────────────────────────────────────────────

const defaultCategories: BillCategory[] = [
  {
    id: 'lab',
    label: 'Laboratory Bill',
    items: [
      { id: 'lab-cbc', name: 'Complete Blood Count (CBC)', amount: 250, enabled: true },
      { id: 'lab-urine', name: 'Urine Routine', amount: 150, enabled: true },
      { id: 'lab-stool', name: 'Stool Examination', amount: 100, enabled: true },
      { id: 'lab-hba1c', name: 'HbA1c', amount: 350, enabled: true },
      { id: 'lab-lipid', name: 'Lipid Panel', amount: 400, enabled: true },
      { id: 'lab-tsh', name: 'TSH (Thyroid)', amount: 300, enabled: true },
      { id: 'lab-culture', name: 'Culture & Sensitivity', amount: 500, enabled: true },
      { id: 'lab-covid', name: 'COVID RT-PCR', amount: 900, enabled: true },
      { id: 'lab-hormone', name: 'Hormone Panel', amount: 700, enabled: true },
      { id: 'lab-histo', name: 'Histopathology', amount: 1200, enabled: true },
    ],
  },
  {
    id: 'radiology',
    label: 'Radiology Bill',
    items: [
      { id: 'rad-xray', name: 'X-Ray', amount: 300, enabled: true },
      { id: 'rad-usg', name: 'Ultrasound (USG)', amount: 800, enabled: true },
      { id: 'rad-ct', name: 'CT Scan', amount: 3500, enabled: true },
      { id: 'rad-mri', name: 'MRI', amount: 7000, enabled: true },
      { id: 'rad-ecg', name: 'ECG', amount: 200, enabled: true },
      { id: 'rad-echo', name: 'Echo (Echocardiography)', amount: 1500, enabled: true },
      { id: 'rad-mammo', name: 'Mammography', amount: 1200, enabled: true },
      { id: 'rad-doppler', name: 'Doppler Study', amount: 1000, enabled: true },
      { id: 'rad-tmt', name: 'TMT (Treadmill Test)', amount: 900, enabled: true },
      { id: 'rad-eeg', name: 'EEG', amount: 800, enabled: true },
    ],
  },
  {
    id: 'procedure',
    label: 'Procedure Bill',
    items: [
      { id: 'proc-dressing', name: 'Wound Dressing', amount: 200, enabled: true },
      { id: 'proc-suture', name: 'Suturing', amount: 500, enabled: true },
      { id: 'proc-nebul', name: 'Nebulization', amount: 150, enabled: true },
      { id: 'proc-cath', name: 'Catheterization', amount: 400, enabled: true },
      { id: 'proc-iv', name: 'IV Cannulation', amount: 200, enabled: true },
      { id: 'proc-abscess', name: 'Abscess Drainage', amount: 600, enabled: true },
      { id: 'proc-biopsy', name: 'Biopsy', amount: 1500, enabled: true },
      { id: 'proc-inject', name: 'Injection Administration', amount: 100, enabled: true },
    ],
  },
  {
    id: 'treatment',
    label: 'Treatment Bill',
    items: [
      { id: 'treat-nursing', name: 'Nursing Charges (per day)', amount: 500, enabled: true },
      { id: 'treat-ivfluid', name: 'IV Fluid Administration', amount: 300, enabled: true },
      { id: 'treat-oxygen', name: 'Oxygen Therapy (per hour)', amount: 200, enabled: true },
      { id: 'treat-blood', name: 'Blood Transfusion', amount: 2000, enabled: true },
      { id: 'treat-monitor', name: 'Monitoring Charges', amount: 400, enabled: true },
    ],
  },
  {
    id: 'vaccination',
    label: 'Vaccination Bill',
    items: [
      { id: 'vacc-cost', name: 'Vaccine Cost', amount: 800, enabled: true },
      { id: 'vacc-admin', name: 'Vaccine Administration Charges', amount: 100, enabled: true },
      { id: 'vacc-consult', name: 'Vaccination Consultation', amount: 200, enabled: true },
      { id: 'vacc-card', name: 'Vaccination Card', amount: 50, enabled: true },
    ],
  },
  {
    id: 'physio',
    label: 'Physiotherapy Bill',
    items: [
      { id: 'physio-consult', name: 'Physiotherapy Consultation', amount: 400, enabled: true },
      { id: 'physio-exercise', name: 'Exercise Therapy (per session)', amount: 300, enabled: true },
      { id: 'physio-electro', name: 'Electrotherapy', amount: 250, enabled: true },
      { id: 'physio-manual', name: 'Manual Therapy', amount: 500, enabled: true },
      { id: 'physio-rehab', name: 'Rehabilitation Session', amount: 350, enabled: true },
    ],
  },
  {
    id: 'dialysis',
    label: 'Dialysis Bill',
    items: [
      { id: 'dial-session', name: 'Hemodialysis Session', amount: 3000, enabled: true },
      { id: 'dial-dialyzer', name: 'Dialyzer', amount: 1500, enabled: true },
      { id: 'dial-heparin', name: 'Heparin', amount: 200, enabled: true },
      { id: 'dial-nephro', name: 'Nephrologist Charges', amount: 800, enabled: true },
      { id: 'dial-nursing', name: 'Dialysis Nursing Charges', amount: 500, enabled: true },
    ],
  },
  {
    id: 'checkup',
    label: 'Health Checkup Package',
    items: [
      { id: 'chk-consult', name: 'Consultation', amount: 500, enabled: true },
      { id: 'chk-blood', name: 'Blood Tests', amount: 800, enabled: true },
      { id: 'chk-ecg', name: 'ECG', amount: 200, enabled: true },
      { id: 'chk-xray', name: 'X-Ray', amount: 300, enabled: true },
      { id: 'chk-usg', name: 'Ultrasound', amount: 800, enabled: true },
    ],
  },
  {
    id: 'admission',
    label: 'Admission Advance Receipt',
    items: [{ id: 'adm-advance', name: 'Advance Deposit', amount: 5000, enabled: true }],
  },
  {
    id: 'room',
    label: 'Room & Bed Charges',
    items: [
      { id: 'room-general', name: 'General Ward (per day)', amount: 800, enabled: true },
      { id: 'room-semi', name: 'Semi-Private Room (per day)', amount: 1500, enabled: true },
      { id: 'room-private', name: 'Private Room (per day)', amount: 3000, enabled: true },
      { id: 'room-deluxe', name: 'Deluxe/Suite (per day)', amount: 6000, enabled: true },
      { id: 'room-nursing', name: 'Nursing Charges', amount: 500, enabled: true },
    ],
  },
  {
    id: 'ot',
    label: 'OT / Surgery Bill',
    items: [
      { id: 'ot-surgeon', name: 'Surgeon Fees', amount: 15000, enabled: true },
      { id: 'ot-anesthesia', name: 'Anesthesia Charges', amount: 5000, enabled: true },
      { id: 'ot-theatre', name: 'Operation Theatre Charges', amount: 8000, enabled: true },
      { id: 'ot-consumable', name: 'Surgical Consumables', amount: 3000, enabled: true },
      { id: 'ot-recovery', name: 'Recovery Room Charges', amount: 1500, enabled: true },
    ],
  },
  {
    id: 'icu',
    label: 'ICU / CCU Bill',
    items: [
      { id: 'icu-bed', name: 'ICU Bed Charges (per day)', amount: 5000, enabled: true },
      { id: 'icu-ventilator', name: 'Ventilator Charges (per day)', amount: 3000, enabled: true },
      { id: 'icu-monitor', name: 'Multipara Monitor (per day)', amount: 1000, enabled: true },
      { id: 'icu-doctor', name: 'Intensivist Visit (per day)', amount: 1500, enabled: true },
      { id: 'icu-nursing', name: 'Special ICU Nursing (per day)', amount: 1000, enabled: true },
    ],
  },
  {
    id: 'dental',
    label: 'Dental Bill',
    items: [
      { id: 'den-consult', name: 'Dental Consultation', amount: 300, enabled: true },
      { id: 'den-scaling', name: 'Scaling & Polishing', amount: 1000, enabled: true },
      { id: 'den-filling', name: 'Tooth Filling (per tooth)', amount: 800, enabled: true },
      { id: 'den-rct', name: 'Root Canal Treatment (RCT)', amount: 3500, enabled: true },
      { id: 'den-extract', name: 'Tooth Extraction', amount: 700, enabled: true },
      { id: 'den-crown', name: 'Dental Crown', amount: 4000, enabled: true },
      { id: 'den-xray', name: 'Dental X-Ray (IOPA)', amount: 200, enabled: true },
    ],
  },
  {
    id: 'ophthalmology',
    label: 'Ophthalmology (Eye) Bill',
    items: [
      { id: 'eye-consult', name: 'Eye Examination / Consultation', amount: 400, enabled: true },
      { id: 'eye-refract', name: 'Refraction & Vision Testing', amount: 200, enabled: true },
      { id: 'eye-cataract', name: 'Cataract Surgery Package', amount: 20000, enabled: true },
      { id: 'eye-fundus', name: 'Fundus Examination', amount: 500, enabled: true },
      { id: 'eye-tonometry', name: 'Tonometry (IOP check)', amount: 300, enabled: true },
      { id: 'eye-oct', name: 'OCT Scan (Eye)', amount: 1500, enabled: true },
    ],
  },
  {
    id: 'ent',
    label: 'ENT Bill',
    items: [
      { id: 'ent-consult', name: 'ENT Consultation', amount: 400, enabled: true },
      { id: 'ent-audio', name: 'Pure Tone Audiometry (PTA)', amount: 600, enabled: true },
      { id: 'ent-endo', name: 'Diagnostic Nasal Endoscopy', amount: 1200, enabled: true },
      { id: 'ent-earclean', name: 'Ear Syringing / Wax Removal', amount: 300, enabled: true },
      { id: 'ent-laryngo', name: 'Indirect Laryngoscopy', amount: 500, enabled: true },
    ],
  },
  {
    id: 'dermatology',
    label: 'Dermatology / Skin Bill',
    items: [
      { id: 'der-consult', name: 'Skin Consultation', amount: 500, enabled: true },
      { id: 'der-cautery', name: 'Electrocautery / Wart Removal', amount: 1000, enabled: true },
      { id: 'der-peel', name: 'Chemical Peel Session', amount: 1500, enabled: true },
      { id: 'der-biopsy', name: 'Skin Biopsy', amount: 1200, enabled: true },
      { id: 'der-laser', name: 'Laser Treatment Session', amount: 2500, enabled: true },
    ],
  },
  {
    id: 'insurance',
    label: 'TPA / Insurance Bill',
    items: [
      { id: 'ins-claim', name: 'Insurance Claim Processing Fee', amount: 500, enabled: true },
      { id: 'ins-copay', name: 'Co-Payment Amount', amount: 0, enabled: true },
      { id: 'ins-deduct', name: 'Deductible Amount', amount: 0, enabled: true },
      { id: 'ins-nonmed', name: 'Non-Medical Expenses', amount: 0, enabled: true },
      { id: 'ins-approved', name: 'TPA Pre-Auth Approved Amount', amount: 0, enabled: true },
      { id: 'ins-payable', name: 'Patient Payable Amount', amount: 0, enabled: true },
    ],
  },
  {
    id: 'refund',
    label: 'Refund Receipt',
    items: [{ id: 'ref-amount', name: 'Refund Amount', amount: 0, enabled: true }],
  },
  {
    id: 'misc',
    label: 'Miscellaneous Charges',
    items: [
      { id: 'misc-ambulance', name: 'Ambulance Charges', amount: 1500, enabled: true },
      { id: 'misc-medcert', name: 'Medical Certificate Fees', amount: 200, enabled: true },
      { id: 'misc-reports', name: 'Duplicate Reports', amount: 100, enabled: true },
      { id: 'misc-birth', name: 'Birth Certificate', amount: 100, enabled: true },
      { id: 'misc-death', name: 'Death Certificate', amount: 100, enabled: true },
      { id: 'misc-food', name: 'Food Charges (per day)', amount: 300, enabled: true },
      { id: 'misc-home', name: 'Home Care Services', amount: 500, enabled: true },
    ],
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface BillingState {
  registrationFee: number;
  consultationFee: number;
  categories: BillCategory[];
  setRegistrationFee: (fee: number) => void;
  setConsultationFee: (fee: number) => void;
  updateItemAmount: (categoryId: string, itemId: string, amount: number) => void;
  toggleItem: (categoryId: string, itemId: string, enabled: boolean) => void;
  addItem: (categoryId: string, item: BillLineItem) => void;
  removeItem: (categoryId: string, itemId: string) => void;
  resetToDefaults: () => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      registrationFee: 100,
      consultationFee: 500,
      categories: defaultCategories,

      setRegistrationFee: (fee) => set({ registrationFee: fee }),
      setConsultationFee: (fee) => set({ consultationFee: fee }),

      updateItemAmount: (categoryId, itemId, amount) =>
        set((s) => ({
          categories: s.categories.map((cat) =>
            cat.id !== categoryId
              ? cat
              : {
                  ...cat,
                  items: cat.items.map((item) => (item.id !== itemId ? item : { ...item, amount })),
                },
          ),
        })),

      toggleItem: (categoryId, itemId, enabled) =>
        set((s) => ({
          categories: s.categories.map((cat) =>
            cat.id !== categoryId
              ? cat
              : {
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id !== itemId ? item : { ...item, enabled },
                  ),
                },
          ),
        })),

      addItem: (categoryId, item) =>
        set((s) => ({
          categories: s.categories.map((cat) =>
            cat.id !== categoryId
              ? cat
              : {
                  ...cat,
                  items: [...cat.items, item],
                },
          ),
        })),

      removeItem: (categoryId, itemId) =>
        set((s) => ({
          categories: s.categories.map((cat) =>
            cat.id !== categoryId
              ? cat
              : {
                  ...cat,
                  items: cat.items.filter((item) => item.id !== itemId),
                },
          ),
        })),

      resetToDefaults: () =>
        set({ categories: defaultCategories, registrationFee: 100, consultationFee: 500 }),
    }),
    { name: 'medicore-billing-config' },
  ),
);
