import type {
  Appointment,
  AuditLog,
  Department,
  Doctor,
  HomeVisit,
  LabOrder,
  Medicine,
  Patient,
  Prescription,
  VisitStatus,
  Vitals,
} from '../types';
export type { HomeVisit, VisitStatus } from '../types';
import { useStaffProfiles, DEMO_STAFF, type StaffProfile } from '../store/staffProfiles';
import { useDepartments } from '../store/departments';

const today = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};
const monthsFromNow = (n: number) => {
  const d = new Date(today);
  d.setMonth(d.getMonth() + n);
  return iso(d);
};

export const departments: Department[] = [];

export const doctors: Doctor[] = [];

export const vitals: Vitals[] = [];

export function mapProfileToDoctor(p: StaffProfile): Doctor {
  return {
    id: p.id,
    name: `Dr. ${p.firstName} ${p.lastName}`,
    specialization:
      p.department === 'Cardiology'
        ? 'Interventional Cardiologist'
        : p.department === 'Neurology'
          ? 'Neurologist'
          : p.department === 'Pediatrics'
            ? 'Pediatrician'
            : p.department === 'Orthopedics'
              ? 'Orthopedic Surgeon'
              : p.department === 'Gynecology'
                ? 'OB-GYN'
                : p.department === 'Dermatology'
                  ? 'Dermatologist'
                  : p.department === 'Emergency'
                    ? 'Emergency Physician'
                    : 'General Physician',
    department: p.department || 'Unassigned',
    email: p.email,
    phone: p.mobile,
    experienceYears: 10,
    fee: p.department === 'Emergency' ? 0 : 1000,
    rating: 4.8,
    available: p.status === 'active',
  };
}

function updateDoctorsAndDepartments() {
  const profiles = useStaffProfiles.getState().profiles;
  const docProfiles = (profiles && profiles.length > 0 ? profiles : DEMO_STAFF).filter(
    (p) => p.role === 'doctor',
  );
  const mapped = docProfiles.map(mapProfileToDoctor);

  doctors.length = 0;
  doctors.push(...mapped);

  const depts = useDepartments.getState().departments;
  departments.length = 0;
  departments.push(
    ...depts.map((dept) => {
      const count = doctors.filter((d) => d.department === dept.name).length;
      return { ...dept, doctorCount: count };
    }),
  );
}

// Initial sync
updateDoctorsAndDepartments();

// Subscribe to store updates
useStaffProfiles.subscribe(() => {
  updateDoctorsAndDepartments();
});

useDepartments.subscribe(() => {
  updateDoctorsAndDepartments();
});

const allergyPool = ['Penicillin', 'Peanuts', 'Latex', 'Sulfa', 'Aspirin', 'Shellfish', 'Dust'];
const meds = [
  'Atorvastatin 20mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Levothyroxine 50mcg',
  'Salbutamol inhaler',
  'Omeprazole 20mg',
];

const patientNames = [
  'Aarav Sharma',
  'Saanvi Patel',
  'Vihaan Iyer',
  'Diya Kapoor',
  'Arjun Mehta',
  'Anaya Reddy',
  'Reyansh Khanna',
  'Ishaani Rao',
  'Kabir Joshi',
  'Aadhya Nair',
  'Ayaan Bose',
  'Myra Sen',
  'Krishna Gupta',
  'Sara Williams',
  'Liam Carter',
  'Olivia Bennett',
  'Noah Kim',
  'Emma Zhang',
  'Ethan Wright',
  'Mia Hassan',
  'Yusuf Ahmed',
  'Zoya Khan',
  'Daniel Cohen',
  'Sofia Rossi',
  'Hiroshi Tanaka',
];

export const patients: Patient[] = patientNames.map((name, i) => ({
  id: `p-${1000 + i}`,
  mrn: `MRN-${10200 + i}`,
  name,
  age: 12 + ((i * 7) % 70),
  gender: i % 3 === 0 ? 'Male' : i % 3 === 1 ? 'Female' : 'Other',
  phone: `+91 90${String(10000000 + i * 13).slice(0, 8)}`,
  email: `${name.split(' ')[0]!.toLowerCase()}@mail.com`,
  bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-', 'A-'][i % 6]!,
  address: ['12 Maple Ave, Mumbai', '5 Lotus Rd, Bengaluru', '8 Oak St, Pune', '21 Rose Ln, Delhi'][
    i % 4
  ]!,
  emergencyContact: {
    name: `${name.split(' ')[0]} Family`,
    phone: '+91 99999 88888',
    relation: i % 2 ? 'Spouse' : 'Parent',
  },
  allergies: i % 4 === 0 ? [] : [allergyPool[i % allergyPool.length]!],
  medications: i % 3 === 0 ? [] : [meds[i % meds.length]!],
  insurance: i % 2 === 0 ? { provider: 'Star Health', policyNo: `SH-${5000 + i}` } : undefined,
  registeredOn: daysAgo(i * 9 + 5),
  assignedDoctorId: doctors[i % doctors.length]?.id || 'u-doc-1',
}));

const reasons = [
  'Routine checkup',
  'Chest pain',
  'Follow-up',
  'Headache',
  'Fever & cough',
  'Back pain',
  'Skin rash',
  'Diabetes review',
];
const types: Appointment['type'][] = ['consultation', 'follow-up', 'walk-in', 'tele'];
const statuses: Appointment['status'][] = [
  'scheduled',
  'checked-in',
  'in-consultation',
  'completed',
  'cancelled',
  'no-show',
];

export const appointments: Appointment[] = Array.from({ length: 36 }).map((_, i) => {
  const d = new Date(today);
  const hour = 9 + (i % 8);
  const minute = (i * 15) % 60;
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() - 2 + (i % 5));

  return {
    id: `a-${2000 + i}`,
    patientId: patients[i % patients.length]!.id,
    doctorId: doctors[i % doctors.length]?.id || 'u-doc-1',
    date: iso(d),
    durationMin: 15,
    reason: reasons[i % reasons.length]!,
    type: types[i % types.length]!,
    status: statuses[i % statuses.length]!,
    token: (i % 20) + 1,
    notes: i % 4 === 0 ? 'Patient requested early morning slot.' : undefined,
  };
});

export const vitalsRecords: Vitals[] = patients.slice(0, 15).map((p, i) => ({
  id: `v-${p.id}`,
  patientId: p.id,
  recordedAt: daysAgo(i),
  bp: `${110 + (i % 30)}/${70 + (i % 20)}`,
  pulse: 68 + (i % 25),
  tempF: 98.4 + (i % 3) * 0.4,
  weightKg: 55 + ((i * 3) % 40),
  heightCm: 155 + (i % 30),
  bmi: Number((22 + (i % 6) * 1.1).toFixed(1)),
  spo2: 95 + (i % 5),
  bloodSugar: 85 + (i % 60),
  notes: i % 3 === 0 ? 'Patient appears stable.' : undefined,
}));

export const prescriptions: Prescription[] = patients.slice(0, 12).map((p, i) => ({
  id: `rx-${3000 + i}`,
  patientId: p.id,
  doctorId: p.assignedDoctorId || 'u-doc-1',
  date: daysAgo(i * 2 + 1),
  diagnosis: [
    'Hypertension',
    'Type 2 Diabetes',
    'Migraine',
    'URTI',
    'Lower back strain',
    'Anxiety',
  ][i % 6]!,
  medicines: [
    { name: 'Amlodipine 5mg', dose: '1 tab', frequency: 'OD', duration: '30 days' },
    {
      name: 'Metformin 500mg',
      dose: '1 tab',
      frequency: 'BD',
      duration: '30 days',
      notes: 'After meals',
    },
  ],
  advice: 'Adequate hydration. Low salt diet. Follow up in 4 weeks.',
}));

export const labOrders: LabOrder[] = patients.slice(0, 10).map((p, i) => ({
  id: `lo-${4000 + i}`,
  patientId: p.id,
  doctorId: p.assignedDoctorId || 'u-doc-1',
  tests: [['CBC', 'Lipid panel', 'HbA1c', 'TSH', 'Urinalysis'][i % 5]!],
  status: (['ordered', 'sample-collected', 'in-progress', 'completed'] as const)[i % 4]!,
  orderedOn: daysAgo(i),
}));

const medCats = ['Antibiotics', 'Cardiac', 'Diabetes', 'Analgesic', 'Respiratory', 'Dermatology'];
const medNames = [
  'Amoxicillin 500mg',
  'Azithromycin 250mg',
  'Atorvastatin 20mg',
  'Aspirin 75mg',
  'Metformin 500mg',
  'Glimepiride 2mg',
  'Paracetamol 650mg',
  'Ibuprofen 400mg',
  'Salbutamol Inhaler',
  'Budesonide 200mcg',
  'Hydrocortisone 1% cream',
  'Cetirizine 10mg',
  'Omeprazole 20mg',
  'Pantoprazole 40mg',
  'Amlodipine 5mg',
  'Losartan 50mg',
];

export const medicines: Medicine[] = medNames.map((name, i) => ({
  id: `m-${5000 + i}`,
  name,
  category: medCats[i % medCats.length]!,
  manufacturer: ['Cipla', 'Sun Pharma', "Dr. Reddy's", 'Pfizer', 'GSK'][i % 5]!,
  stock: [120, 15, 8, 240, 0, 56, 320, 12][i % 8]!,
  minStock: 20,
  expiry: i % 5 === 0 ? daysAgo(10) : monthsFromNow((i % 12) + 1),
  pricePerUnit: 4 + (i % 30),
  gst: [5, 12, 18][i % 3]!,
  batch: `B${2400 + i}`,
}));

export const auditLogs: AuditLog[] = Array.from({ length: 24 }).map((_, i) => ({
  id: `al-${i}`,
  user: [
    'Dr. Anika Rao',
    'Priya Menon',
    'Sister Joan',
    'Rahul Verma',
    'Mei Chen',
    'Dr. Vikram Shah',
  ][i % 6]!,
  role: (['doctor', 'frontdesk', 'nurse', 'pharmacy', 'lab', 'admin'] as const)[i % 6]!,
  action: [
    'Updated patient',
    'Created appointment',
    'Dispensed medicine',
    'Uploaded lab report',
    'Changed permissions',
    'Logged in',
  ][i % 6]!,
  target: ['MRN-10231', 'a-2034', 'Amoxicillin 500mg', 'lo-4002', 'Role: Nurse', '—'][i % 6]!,
  at: daysAgo(i / 3),
  ip: `10.0.${i % 256}.${(i * 7) % 256}`,
}));

// Charts helpers
export const monthlyRevenue = [
  { month: 'Jan', revenue: 480_000, opd: 320_000, pharmacy: 120_000, lab: 40_000 },
  { month: 'Feb', revenue: 520_000, opd: 350_000, pharmacy: 130_000, lab: 40_000 },
  { month: 'Mar', revenue: 610_000, opd: 410_000, pharmacy: 150_000, lab: 50_000 },
  { month: 'Apr', revenue: 580_000, opd: 380_000, pharmacy: 140_000, lab: 60_000 },
  { month: 'May', revenue: 690_000, opd: 460_000, pharmacy: 170_000, lab: 60_000 },
  { month: 'Jun', revenue: 720_000, opd: 470_000, pharmacy: 180_000, lab: 70_000 },
  { month: 'Jul', revenue: 760_000, opd: 500_000, pharmacy: 190_000, lab: 70_000 },
  { month: 'Aug', revenue: 740_000, opd: 490_000, pharmacy: 180_000, lab: 70_000 },
  { month: 'Sep', revenue: 810_000, opd: 540_000, pharmacy: 195_000, lab: 75_000 },
];

export const dailyVisits = Array.from({ length: 14 }).map((_, i) => ({
  day: `D-${14 - i}`,
  opd: 40 + ((i * 9) % 60),
  ipd: 6 + ((i * 3) % 12),
  emergency: 4 + ((i * 5) % 18),
}));

export const departmentLoad = departments.map((d) => ({ name: d.name, patients: d.patientsToday }));

// Lab Visits Mock Data & Constants
export const VISIT_SBU_OPTIONS = ['Diagnostics', 'Pathology', 'Radiology', 'Wellness'];
export const VISIT_BRANCH_OPTIONS = ['Main Branch', 'North Wing', 'East Center', 'South Clinic'];
export const VISIT_PHLEBO_OPTIONS = ['Ramesh Kumar', 'Suresh Sharma', 'Anita Roy', 'Vikram Singh'];
export const VISIT_STATUS_OPTIONS: VisitStatus[] = [
  'Pending',
  'Collected',
  'In Progress',
  'Received',
  'Completed',
  'Cancelled',
];
export const LAB_TEST_POOL = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Thyroid Profile (T3, T4, TSH)',
  'HbA1c',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Urine Routine',
  'Vitamin D3',
  'Vitamin B12',
];

export const SBU_OPTIONS = VISIT_SBU_OPTIONS;
export const BRANCH_OPTIONS = VISIT_BRANCH_OPTIONS;
export const PHLEBO_OPTIONS = VISIT_PHLEBO_OPTIONS;
export const STATUS_OPTIONS = VISIT_STATUS_OPTIONS;
export const TEST_POOL = LAB_TEST_POOL;

export const allLabVisits: HomeVisit[] = [
  {
    id: 'hv-1',
    visitId: 'HV-10021',
    patientName: 'Aarav Sharma',
    mobile: '+91 9010000000',
    age: 34,
    gender: 'Male',
    address: '12 Maple Ave, Mumbai',
    sbu: 'Diagnostics',
    branch: 'Main Branch',
    phlebo: 'Ramesh Kumar',
    tests: ['Complete Blood Count (CBC)', 'Lipid Profile'],
    regDate: '2026-08-07',
    regTime: '08:30',
    collDate: '2026-08-07',
    collTimeFrom: '07:00',
    collTimeTo: '09:00',
    status: 'Pending',
    remarks: 'Fasting sample required.',
  },
  {
    id: 'hv-2',
    visitId: 'HV-10022',
    patientName: 'Saanvi Patel',
    mobile: '+91 9010000013',
    age: 28,
    gender: 'Female',
    address: '5 Lotus Rd, Bengaluru',
    sbu: 'Pathology',
    branch: 'North Wing',
    phlebo: 'Anita Roy',
    tests: ['Thyroid Profile (T3, T4, TSH)', 'HbA1c'],
    regDate: '2026-08-06',
    regTime: '09:15',
    collDate: '2026-08-07',
    collTimeFrom: '09:00',
    collTimeTo: '11:00',
    status: 'Collected',
  },
];
export const ALL_VISITS = allLabVisits;
export function padTwo(n: number) {
  return String(n).padStart(2, '0');
}

// Report Configuration Mock Data & Types
export interface ReportConfig {
  hospitalName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  accreditation: string;
  reportHeader: string;
  reportFooter: string;
  authorizedSignatory: string;
}

export const SUPER_ADMIN_CONFIG: ReportConfig = {
  hospitalName: 'Love DOC Super Specialty Hospital & Research Center',
  address: '123 Medical Enclave, Health City, MH 400001',
  phone: '+91 22 5555 0100',
  email: 'info@lovedochospital.com',
  website: 'www.lovedochospital.com',
  accreditation: 'NABL Accredited & NABH Certified Laboratory',
  reportHeader: 'CONFIDENTIAL LABORATORY INVESTIGATION REPORT',
  reportFooter: 'This report is electronically generated and validated by Pathologist.',
  authorizedSignatory: 'Dr. Ananya Sharma (MD, Pathology) - Chief Pathologist',
};

export const STANDALONE_LAB_CONFIG: ReportConfig = {
  hospitalName: 'Love DOC Diagnostic & Clinical Laboratory',
  address: '45 Diagnostics Plaza, Central Avenue, KA 560001',
  phone: '+91 80 4444 0200',
  email: 'lab@lovedocdiagnostics.com',
  website: 'www.lovedocdiagnostics.com',
  accreditation: 'NABL Accredited Laboratory (ISO 15189)',
  reportHeader: 'DIAGNOSTIC TEST REPORT',
  reportFooter: 'End of Report. Please correlate with clinical findings.',
  authorizedSignatory: 'Dr. Rajesh Verma (MD, Biochemistry) - Lab Director',
};

// Lab KPI & Chart Mock Data
export const labKPI = {
  samplesRegistered: 142,
  b2c: 98,
  b2b: 44,
  testsInProgress: 24,
  reportsApproved: 118,
  grossAmount: 320000,
  discountAmount: 36000,
  netAmount: 284000,
  tatBreaches: 3,
  totalRevenue: 284000,
  outstandingDue: 35000,
};

export const LAB_SBU_OPTIONS = ['Diagnostics', 'Pathology', 'Radiology', 'Wellness'];
export const LAB_BRANCH_OPTIONS = ['Main Branch', 'North Wing', 'East Center', 'South Clinic'];

export const labDayWiseSamples = [120, 135, 150, 142, 160, 110, 80];
export const LAB_DAY_AVG = 128;

export const labWeekWiseData = [
  { label: 'W1', samples: 850, avg: 880 },
  { label: 'W2', samples: 920, avg: 880 },
  { label: 'W3', samples: 880, avg: 880 },
  { label: 'W4', samples: 950, avg: 880 },
  { label: 'W5', samples: 910, avg: 880 },
  { label: 'W6', samples: 940, avg: 880 },
];

export const labMonthWiseData = [
  { label: 'Jan', samples: 3400, avg: 3700 },
  { label: 'Feb', samples: 3600, avg: 3700 },
  { label: 'Mar', samples: 3800, avg: 3700 },
  { label: 'Apr', samples: 3900, avg: 3700 },
  { label: 'May', samples: 3750, avg: 3700 },
  { label: 'Jun', samples: 3850, avg: 3700 },
  { label: 'Jul', samples: 4000, avg: 3700 },
];

// Lab Quotations Mock Data & Types
export type QuotationType = 'Walk-in / Patient' | 'B2B Client' | 'Home Visit' | 'B2B';
export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected';

export interface QuotationServiceRow {
  id: string;
  service: string;
  price: number;
  discount: number;
  net: number;
  code?: string;
  name?: string;
  category?: string;
}

export interface Quotation {
  id: string;
  refNo: string;
  patientOrOrg: string;
  phone: string;
  branch: string;
  type: QuotationType;
  tests: string[];
  total: number;
  netAmount: number;
  status: QuotationStatus;
  date: string;
  validUntil?: string;
  services?: QuotationServiceRow[];
  totalAmount?: number;
  discountAmount?: number;
  notes?: string;
}

export const QUOTATION_BRANCHES = ['Main Branch', 'North Wing', 'East Center', 'South Clinic'];
export const QUOTATION_B2B_OPTIONS = ['Apex Healthcare', 'City Life Clinic', 'Green Cross Diagnostics', 'Care First Hospital'];
export const QUOTATION_SERVICE_OPTIONS = [
  'Select test / package...',
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile (T3, T4, TSH)',
  'HbA1c',
  'Urine Routine & Microscopy',
  'Vitamin D3 Total',
  'Vitamin B12',
];

export const QUOTATION_SERVICE_PRICES: Record<string, number> = {
  'Complete Blood Count (CBC)': 350,
  'Lipid Profile': 800,
  'Liver Function Test (LFT)': 950,
  'Kidney Function Test (KFT)': 750,
  'Thyroid Profile (T3, T4, TSH)': 600,
  'HbA1c': 450,
  'Urine Routine & Microscopy': 200,
  'Vitamin D3 Total': 1200,
  'Vitamin B12': 900,
};

export const MOCK_QUOTATIONS: Quotation[] = [
  {
    id: 'q-1',
    refNo: 'QT-2026-001',
    type: 'Walk-in / Patient',
    patientOrOrg: 'Rahul Sharma',
    phone: '+91 98765 43210',
    branch: 'Main Branch',
    tests: ['Complete Blood Count (CBC)', 'Lipid Profile'],
    total: 1100,
    netAmount: 1100,
    status: 'Sent',
    date: '2026-08-05',
  },
  {
    id: 'q-2',
    refNo: 'QT-2026-002',
    type: 'B2B',
    patientOrOrg: 'Apex Healthcare',
    phone: '+91 91234 56789',
    branch: 'North Wing',
    tests: ['Thyroid Profile (T3, T4, TSH)', 'HbA1c'],
    total: 900,
    netAmount: 900,
    status: 'Approved',
    date: '2026-08-06',
  },
];

export const MOCK_VISIT_DETAILS: Record<string, { patientName: string; mobile: string; email: string }> = {
  'q-1': { patientName: 'Rahul Sharma', mobile: '9876543210', email: 'rahul.s@example.com' },
  'q-2': { patientName: 'Apex Healthcare', mobile: '9123456789', email: 'contact@apexhealth.com' },
};

// ── Lab Report Mock Test Data & Helpers ─────────────────────────────────────
export interface LabTestParameter {
  parameter: string;
  result: string;
  unit: string;
  reference: string;
  flag?: 'H' | 'L';
}

export const LAB_TEST_DATA: Record<string, LabTestParameter[]> = {
  'CBC (Complete Blood Count)': [
    { parameter: 'Haemoglobin', result: '11.8', unit: 'g/dL', reference: '12.0 – 17.5', flag: 'L' },
    { parameter: 'WBC', result: '7200', unit: 'cells/µL', reference: '4000 – 11000' },
    { parameter: 'Platelets', result: '210000', unit: 'cells/µL', reference: '150000 – 400000' },
    { parameter: 'RBC', result: '4.6', unit: 'million/µL', reference: '4.5 – 5.9' },
    { parameter: 'MCV', result: '82', unit: 'fL', reference: '80 – 100' },
    { parameter: 'MCH', result: '28', unit: 'pg', reference: '27 – 33' },
    { parameter: 'Neutrophils', result: '65', unit: '%', reference: '40 – 70' },
    { parameter: 'Lymphocytes', result: '28', unit: '%', reference: '20 – 40' },
    { parameter: 'ESR', result: '22', unit: 'mm/hr', reference: '< 20', flag: 'H' },
  ],
  CBC: [
    { parameter: 'Haemoglobin', result: '11.8', unit: 'g/dL', reference: '12.0 – 17.5', flag: 'L' },
    { parameter: 'WBC', result: '7200', unit: 'cells/µL', reference: '4000 – 11000' },
    { parameter: 'Platelets', result: '210000', unit: 'cells/µL', reference: '150000 – 400000' },
    { parameter: 'RBC', result: '4.6', unit: 'million/µL', reference: '4.5 – 5.9' },
    { parameter: 'MCV', result: '82', unit: 'fL', reference: '80 – 100' },
    { parameter: 'MCH', result: '28', unit: 'pg', reference: '27 – 33' },
    { parameter: 'Neutrophils', result: '65', unit: '%', reference: '40 – 70' },
    { parameter: 'Lymphocytes', result: '28', unit: '%', reference: '20 – 40' },
    { parameter: 'ESR', result: '22', unit: 'mm/hr', reference: '< 20', flag: 'H' },
  ],
  'Lipid Panel': [
    { parameter: 'Total Cholesterol', result: '214', unit: 'mg/dL', reference: '< 200', flag: 'H' },
    { parameter: 'LDL Cholesterol', result: '138', unit: 'mg/dL', reference: '< 100', flag: 'H' },
    { parameter: 'HDL Cholesterol', result: '42', unit: 'mg/dL', reference: '> 40' },
    { parameter: 'Triglycerides', result: '168', unit: 'mg/dL', reference: '< 150', flag: 'H' },
    { parameter: 'VLDL', result: '33', unit: 'mg/dL', reference: '< 30', flag: 'H' },
    { parameter: 'Non-HDL', result: '172', unit: 'mg/dL', reference: '< 130', flag: 'H' },
  ],
  'Lipid panel': [
    { parameter: 'Total Cholesterol', result: '214', unit: 'mg/dL', reference: '< 200', flag: 'H' },
    { parameter: 'LDL Cholesterol', result: '138', unit: 'mg/dL', reference: '< 100', flag: 'H' },
    { parameter: 'HDL Cholesterol', result: '42', unit: 'mg/dL', reference: '> 40' },
    { parameter: 'Triglycerides', result: '168', unit: 'mg/dL', reference: '< 150', flag: 'H' },
    { parameter: 'VLDL', result: '33', unit: 'mg/dL', reference: '< 30', flag: 'H' },
    { parameter: 'Non-HDL', result: '172', unit: 'mg/dL', reference: '< 130', flag: 'H' },
  ],
  HbA1c: [
    { parameter: 'HbA1c', result: '7.4', unit: '%', reference: '4.0 – 5.6', flag: 'H' },
    {
      parameter: 'Mean Blood Glucose',
      result: '166',
      unit: 'mg/dL',
      reference: '70 – 100',
      flag: 'H',
    },
  ],
  TSH: [
    { parameter: 'TSH', result: '4.8', unit: 'mIU/L', reference: '0.4 – 4.0', flag: 'H' },
    { parameter: 'T3 (Total)', result: '1.1', unit: 'nmol/L', reference: '0.9 – 2.5' },
    { parameter: 'T4 (Total)', result: '88', unit: 'nmol/L', reference: '70 – 150' },
  ],
  Urinalysis: [
    { parameter: 'Colour', result: 'Yellow', unit: '—', reference: 'Yellow' },
    { parameter: 'Clarity', result: 'Clear', unit: '—', reference: 'Clear' },
    { parameter: 'pH', result: '6.2', unit: '—', reference: '4.5 – 8.5' },
    { parameter: 'Protein', result: 'Trace', unit: '—', reference: 'Negative', flag: 'H' },
    { parameter: 'Glucose', result: 'Nil', unit: '—', reference: 'Negative' },
    { parameter: 'Ketones', result: 'Nil', unit: '—', reference: 'Negative' },
    { parameter: 'RBCs', result: '2-4', unit: '/HPF', reference: '0 – 2', flag: 'H' },
  ],
  'Blood Sugar': [
    {
      parameter: 'Fasting Blood Sugar',
      result: '128',
      unit: 'mg/dL',
      reference: '70 – 100',
      flag: 'H',
    },
    { parameter: 'Post-Prandial', result: '196', unit: 'mg/dL', reference: '< 140', flag: 'H' },
    {
      parameter: 'Random Blood Sugar',
      result: '154',
      unit: 'mg/dL',
      reference: '70 – 140',
      flag: 'H',
    },
  ],
  'Thyroid Profile': [],
  'Vitamin D': [],
  'Vitamin B12': [],
  LFT: [],
  KFT: [],
  'Urine R/M': [],
};

export const TEST_DATA = LAB_TEST_DATA;

export function getTestRows(testName: string): LabTestParameter[] {
  return (
    LAB_TEST_DATA[testName] ?? [
      { parameter: testName, result: 'Within normal limits', unit: '—', reference: '—' },
    ]
  );
}

export const LAB_INTERPRETATIONS: Record<string, string> = {
  CBC: 'Mild anaemia noted (Hb 11.8 g/dL). Elevated ESR suggests ongoing low-grade inflammation. All other parameters within acceptable range.',
  'CBC (Complete Blood Count)':
    'Mild anaemia noted (Hb 11.8 g/dL). Elevated ESR suggests ongoing low-grade inflammation. All other parameters within acceptable range.',
  'Lipid panel':
    'Dyslipidaemia detected. Total cholesterol and LDL are above optimal levels. Lifestyle modification (diet, exercise) and statin therapy review recommended.',
  'Lipid Panel':
    'Dyslipidaemia detected. Total cholesterol and LDL are above optimal levels. Lifestyle modification (diet, exercise) and statin therapy review recommended.',
  HbA1c:
    'Poor glycaemic control over the past 2–3 months (HbA1c 7.4%). Mean blood glucose significantly elevated. Intensification of diabetes management advised.',
  TSH: 'Subclinical hypothyroidism suspected (TSH 4.8). Free thyroid indices normal. Clinical correlation and repeat testing in 6 weeks recommended.',
  Urinalysis:
    'Trace proteinuria and mild haematuria present. Repeat urinalysis and renal function tests advised to rule out early nephropathy.',
  'Blood Sugar':
    'Significantly elevated fasting and post-prandial blood glucose levels indicate poorly controlled diabetes. Medication review and dietary counselling recommended.',
};

export function getInterpretation(tests: string[]): string {
  return (
    tests
      .map((t) => LAB_INTERPRETATIONS[t])
      .filter(Boolean)
      .join(' ') || 'Results reviewed. No critical values detected. Please correlate clinically.'
  );
}

export const allOrders: LabOrder[] = [
  ...labOrders,
  {
    id: 'lo-9001',
    patientId: patients[0]?.id ?? '',
    doctorId: 'u-doc-1',
    tests: ['CBC (Complete Blood Count)', 'Lipid Panel'],
    status: 'sample-collected',
    orderedOn: new Date().toISOString(),
  },
  {
    id: 'lo-9002',
    patientId: patients[2]?.id ?? '',
    doctorId: 'u-doc-4',
    tests: ['HbA1c', 'Urinalysis'],
    status: 'sample-collected',
    orderedOn: new Date().toISOString(),
  },
  {
    id: 'lo-9003',
    patientId: patients[4]?.id ?? '',
    doctorId: 'u-doc-2',
    tests: ['TSH', 'CBC (Complete Blood Count)'],
    status: 'sample-collected',
    orderedOn: new Date().toISOString(),
  },
  {
    id: 'lo-9004',
    patientId: patients[6]?.id ?? '',
    doctorId: 'u-doc-5',
    tests: ['Lipid Panel'],
    status: 'ordered',
    orderedOn: new Date().toISOString(),
  },
  {
    id: 'lo-9005',
    patientId: patients[8]?.id ?? '',
    doctorId: 'u-doc-3',
    tests: ['HbA1c'],
    status: 'in-progress',
    orderedOn: new Date().toISOString(),
  },
];

export const allLabReportOrders = allOrders;




