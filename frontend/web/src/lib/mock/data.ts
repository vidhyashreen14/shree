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
} from "../types";

const today = new Date();
const iso = (d: Date) => d.toISOString();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const at = (h: number, m = 0) => {
  const d = new Date(today);
  d.setHours(h, m, 0, 0);
  return iso(d);
};
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

export const departments: Department[] = [
  { id: "d-card", name: "Cardiology", head: "Dr. Vikram Shah", doctorCount: 6, patientsToday: 42 },
  { id: "d-neu", name: "Neurology", head: "Dr. Lin Park", doctorCount: 4, patientsToday: 28 },
  { id: "d-ped", name: "Pediatrics", head: "Dr. Sara Iqbal", doctorCount: 5, patientsToday: 51 },
  {
    id: "d-ortho",
    name: "Orthopedics",
    head: "Dr. Marco Bellini",
    doctorCount: 7,
    patientsToday: 33,
  },
  { id: "d-gyn", name: "Gynecology", head: "Dr. Hannah Cole", doctorCount: 5, patientsToday: 37 },
  { id: "d-derm", name: "Dermatology", head: "Dr. Aman Gill", doctorCount: 3, patientsToday: 22 },
  { id: "d-er", name: "Emergency", head: "Dr. Owen Reyes", doctorCount: 9, patientsToday: 64 },
];

export const doctors: Doctor[] = [
  {
    id: "u-doc-1",
    name: "Dr. Vikram Shah",
    specialization: "Interventional Cardiologist",
    department: "Cardiology",
    email: "vikram@medicore.io",
    phone: "+91 98200 11111",
    experienceYears: 18,
    fee: 1500,
    rating: 4.9,
    available: true,
  },
  {
    id: "u-doc-2",
    name: "Dr. Lin Park",
    specialization: "Neurologist",
    department: "Neurology",
    email: "lin@medicore.io",
    phone: "+91 98200 22222",
    experienceYears: 12,
    fee: 1300,
    rating: 4.7,
    available: true,
  },
  {
    id: "u-doc-3",
    name: "Dr. Sara Iqbal",
    specialization: "Pediatrician",
    department: "Pediatrics",
    email: "sara@medicore.io",
    phone: "+91 98200 33333",
    experienceYears: 9,
    fee: 900,
    rating: 4.8,
    available: false,
  },
  {
    id: "u-doc-4",
    name: "Dr. Marco Bellini",
    specialization: "Orthopedic Surgeon",
    department: "Orthopedics",
    email: "marco@medicore.io",
    phone: "+91 98200 44444",
    experienceYears: 22,
    fee: 1700,
    rating: 4.6,
    available: true,
  },
  {
    id: "u-doc-5",
    name: "Dr. Hannah Cole",
    specialization: "OB-GYN",
    department: "Gynecology",
    email: "hannah@medicore.io",
    phone: "+91 98200 55555",
    experienceYears: 14,
    fee: 1200,
    rating: 4.9,
    available: true,
  },
  {
    id: "u-doc-6",
    name: "Dr. Aman Gill",
    specialization: "Dermatologist",
    department: "Dermatology",
    email: "aman@medicore.io",
    phone: "+91 98200 66666",
    experienceYears: 7,
    fee: 800,
    rating: 4.5,
    available: true,
  },
  {
    id: "u-doc-7",
    name: "Dr. Owen Reyes",
    specialization: "Emergency Physician",
    department: "Emergency",
    email: "owen@medicore.io",
    phone: "+91 98200 77777",
    experienceYears: 11,
    fee: 0,
    rating: 4.8,
    available: true,
  },
];

const allergyPool = ["Penicillin", "Peanuts", "Latex", "Sulfa", "Aspirin", "Shellfish", "Dust"];
const meds = [
  "Atorvastatin 20mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Levothyroxine 50mcg",
  "Salbutamol inhaler",
  "Omeprazole 20mg",
];

const patientNames = [
  "Aarav Sharma",
  "Saanvi Patel",
  "Vihaan Iyer",
  "Diya Kapoor",
  "Arjun Mehta",
  "Anaya Reddy",
  "Reyansh Khanna",
  "Ishaani Rao",
  "Kabir Joshi",
  "Aadhya Nair",
  "Ayaan Bose",
  "Myra Sen",
  "Krishna Gupta",
  "Sara Williams",
  "Liam Carter",
  "Olivia Bennett",
  "Noah Kim",
  "Emma Zhang",
  "Ethan Wright",
  "Mia Hassan",
  "Yusuf Ahmed",
  "Zoya Khan",
  "Daniel Cohen",
  "Sofia Rossi",
  "Hiroshi Tanaka",
];

export const patients: Patient[] = patientNames.map((name, i) => ({
  id: `p-${1000 + i}`,
  mrn: `MRN-${10200 + i}`,
  name,
  age: 12 + ((i * 7) % 70),
  gender: i % 3 === 0 ? "Male" : i % 3 === 1 ? "Female" : "Other",
  phone: `+91 90${String(10000000 + i * 13).slice(0, 8)}`,
  email: `${name.split(" ")[0]!.toLowerCase()}@mail.com`,
  bloodGroup: ["A+", "B+", "O+", "AB+", "O-", "A-"][i % 6]!,
  address: ["12 Maple Ave, Mumbai", "5 Lotus Rd, Bengaluru", "8 Oak St, Pune", "21 Rose Ln, Delhi"][
    i % 4
  ]!,
  emergencyContact: {
    name: `${name.split(" ")[0]} Family`,
    phone: "+91 99999 88888",
    relation: i % 2 ? "Spouse" : "Parent",
  },
  allergies: i % 4 === 0 ? [] : [allergyPool[i % allergyPool.length]!],
  medications: i % 3 === 0 ? [] : [meds[i % meds.length]!],
  insurance: i % 2 === 0 ? { provider: "Star Health", policyNo: `SH-${5000 + i}` } : undefined,
  registeredOn: daysAgo(i * 9 + 5),
  assignedDoctorId: doctors[i % doctors.length]!.id,
}));

const reasons = [
  "Routine checkup",
  "Chest pain",
  "Follow-up",
  "Headache",
  "Fever & cough",
  "Back pain",
  "Skin rash",
  "Diabetes review",
];
const types: Appointment["type"][] = ["consultation", "follow-up", "walk-in", "tele"];
const statuses: Appointment["status"][] = [
  "scheduled",
  "checked-in",
  "in-consultation",
  "completed",
  "cancelled",
  "no-show",
];

export const appointments: Appointment[] = Array.from({ length: 48 }).map((_, i) => {
  const hour = 9 + (i % 9);
  const minute = (i % 4) * 15;
  const dayOffset = (i % 5) - 2;
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return {
    id: `a-${2000 + i}`,
    patientId: patients[i % patients.length]!.id,
    doctorId: doctors[i % doctors.length]!.id,
    date: iso(d),
    durationMin: 15 + (i % 3) * 15,
    reason: reasons[i % reasons.length]!,
    type: types[i % types.length]!,
    status: dayOffset < 0 ? "completed" : statuses[i % statuses.length]!,
    token: (i % 30) + 1,
  };
});

export const todaysAppointments = (doctorId?: string) =>
  appointments.filter((a) => {
    const d = new Date(a.date);
    const sameDay = d.toDateString() === today.toDateString();
    return sameDay && (!doctorId || a.doctorId === doctorId);
  });

export const vitals: Vitals[] = patients.slice(0, 15).map((p, i) => ({
  id: `v-${i}`,
  patientId: p.id,
  recordedAt: daysAgo(i),
  bp: `${110 + (i % 30)}/${70 + (i % 15)}`,
  pulse: 64 + (i % 30),
  tempF: 97 + (i % 4),
  weightKg: 55 + (i % 35),
  heightCm: 150 + (i % 35),
  bmi: +(20 + (i % 8) + Math.random()).toFixed(1),
  spo2: 95 + (i % 5),
  bloodSugar: 85 + (i % 60),
  notes: i % 3 === 0 ? "Patient appears stable." : undefined,
}));

export const prescriptions: Prescription[] = patients.slice(0, 12).map((p, i) => ({
  id: `rx-${3000 + i}`,
  patientId: p.id,
  doctorId: p.assignedDoctorId!,
  date: daysAgo(i * 2 + 1),
  diagnosis: [
    "Hypertension",
    "Type 2 Diabetes",
    "Migraine",
    "URTI",
    "Lower back strain",
    "Anxiety",
  ][i % 6]!,
  medicines: [
    { name: "Amlodipine 5mg", dose: "1 tab", frequency: "OD", duration: "30 days" },
    {
      name: "Metformin 500mg",
      dose: "1 tab",
      frequency: "BD",
      duration: "30 days",
      notes: "After meals",
    },
  ],
  advice: "Adequate hydration. Low salt diet. Follow up in 4 weeks.",
}));

export const labOrders: LabOrder[] = patients.slice(0, 10).map((p, i) => ({
  id: `lo-${4000 + i}`,
  patientId: p.id,
  doctorId: p.assignedDoctorId!,
  tests: [["CBC", "Lipid panel", "HbA1c", "TSH", "Urinalysis"][i % 5]!],
  status: (["ordered", "sample-collected", "in-progress", "completed"] as const)[i % 4]!,
  orderedOn: daysAgo(i),
}));

const medCats = ["Antibiotics", "Cardiac", "Diabetes", "Analgesic", "Respiratory", "Dermatology"];
const medNames = [
  "Amoxicillin 500mg",
  "Azithromycin 250mg",
  "Atorvastatin 20mg",
  "Aspirin 75mg",
  "Metformin 500mg",
  "Glimepiride 2mg",
  "Paracetamol 650mg",
  "Ibuprofen 400mg",
  "Salbutamol Inhaler",
  "Budesonide 200mcg",
  "Hydrocortisone 1% cream",
  "Cetirizine 10mg",
  "Omeprazole 20mg",
  "Pantoprazole 40mg",
  "Amlodipine 5mg",
  "Losartan 50mg",
];

export const medicines: Medicine[] = medNames.map((name, i) => ({
  id: `m-${5000 + i}`,
  name,
  category: medCats[i % medCats.length]!,
  manufacturer: ["Cipla", "Sun Pharma", "Dr. Reddy's", "Pfizer", "GSK"][i % 5]!,
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
    "Dr. Anika Rao",
    "Priya Menon",
    "Sister Joan",
    "Rahul Verma",
    "Mei Chen",
    "Dr. Vikram Shah",
  ][i % 6]!,
  role: (["doctor", "frontdesk", "nurse", "pharmacy", "lab", "admin"] as const)[i % 6]!,
  action: [
    "Updated patient",
    "Created appointment",
    "Dispensed medicine",
    "Uploaded lab report",
    "Changed permissions",
    "Logged in",
  ][i % 6]!,
  target: ["MRN-10231", "a-2034", "Amoxicillin 500mg", "lo-4002", "Role: Nurse", "—"][i % 6]!,
  at: daysAgo(i / 3),
  ip: `10.0.${i % 256}.${(i * 7) % 256}`,
}));

// Charts helpers
export const monthlyRevenue = [
  { month: "Jan", revenue: 480_000, opd: 320_000, pharmacy: 120_000, lab: 40_000 },
  { month: "Feb", revenue: 520_000, opd: 350_000, pharmacy: 130_000, lab: 40_000 },
  { month: "Mar", revenue: 610_000, opd: 410_000, pharmacy: 150_000, lab: 50_000 },
  { month: "Apr", revenue: 580_000, opd: 380_000, pharmacy: 140_000, lab: 60_000 },
  { month: "May", revenue: 690_000, opd: 460_000, pharmacy: 170_000, lab: 60_000 },
  { month: "Jun", revenue: 720_000, opd: 470_000, pharmacy: 180_000, lab: 70_000 },
  { month: "Jul", revenue: 760_000, opd: 500_000, pharmacy: 190_000, lab: 70_000 },
  { month: "Aug", revenue: 740_000, opd: 490_000, pharmacy: 180_000, lab: 70_000 },
  { month: "Sep", revenue: 810_000, opd: 540_000, pharmacy: 195_000, lab: 75_000 },
];

export const dailyVisits = Array.from({ length: 14 }).map((_, i) => ({
  day: `D-${14 - i}`,
  opd: 40 + ((i * 9) % 60),
  ipd: 6 + ((i * 3) % 12),
  emergency: 4 + ((i * 5) % 18),
}));

export const departmentLoad = departments.map((d) => ({ name: d.name, patients: d.patientsToday }));

// ── Home Visits Mock Data ───────────────────────────────────────────────────

export const SBU_OPTIONS = ["All SBU", "SBU - Chitradurga", "SBU - Davangere", "SBU - Tumkur", "SBU - Shivamogga"];
export const BRANCH_OPTIONS = ["All Branches", "Main Branch", "North Branch", "South Branch", "East Branch"];
export const PHLEBO_OPTIONS = ["All Phlebotomists", "Ramesh Kumar", "Priya Menon", "Sister Joan", "Arjun Naik", "Meena Rao"];
export const STATUS_OPTIONS: VisitStatus[] = ["Pending", "Collected", "In Progress", "Cancelled", "Completed"];
export const TEST_POOL = ["CBC", "HbA1c", "Lipid Panel", "TSH", "Urinalysis", "Blood Sugar", "Liver Function", "Kidney Function", "Vitamin D", "Thyroid Profile"];

function randBetween(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function padTwo(n: number) { return String(n).padStart(2, "0"); }

export function generateMockVisits(): HomeVisit[] {
  const names = [
    "Aarav Sharma", "Saanvi Patel", "Vihaan Iyer", "Diya Kapoor", "Arjun Mehta",
    "Anaya Reddy", "Reyansh Khanna", "Ishaani Rao", "Kabir Joshi", "Aadhya Nair",
    "Ayaan Bose", "Myra Sen", "Krishna Gupta", "Sara Williams", "Liam Carter",
    "Olivia Bennett", "Noah Kim", "Emma Zhang", "Ethan Wright", "Mia Hassan",
    "Yusuf Ahmed", "Zoya Khan", "Daniel Cohen", "Sofia Rossi", "Hiroshi Tanaka",
    "Pooja Verma", "Rakesh Singh", "Sunita Gupta", "Manoj Kumar", "Divya Nair",
  ];
  const statusesList: VisitStatus[] = ["Pending", "Pending", "Pending", "Collected", "In Progress", "Cancelled", "Completed"];
  const addresses = [
    "12 Maple Ave, Chitradurga", "5 Lotus Rd, Davangere", "8 Oak St, Tumkur",
    "21 Rose Ln, Shivamogga", "34 MG Road, Chitradurga", "7 Park St, North Branch",
  ];

  const base = new Date("2026-07-10");
  return names.map((name, i) => {
    const regD = new Date(base);
    regD.setDate(base.getDate() - (i % 10));
    const collD = new Date(regD);
    collD.setDate(regD.getDate() + 1);
    const fromH = randBetween(7, 11);
    const toH = fromH + randBetween(1, 3);

    const testCount = randBetween(1, 3);
    const tests: string[] = [];
    for (let j = 0; j < testCount; j++) {
      tests.push(TEST_POOL[(i + j * 3) % TEST_POOL.length]!);
    }

    return {
      id: `hv-${1000 + i}`,
      visitId: `VIS-${20000 + i}`,
      patientName: name,
      mobile: `+91 90${String(10000000 + i * 13).slice(0, 8)}`,
      age: 18 + ((i * 7) % 60),
      gender: (["Male", "Female", "Other"] as const)[i % 3]!,
      address: addresses[i % addresses.length]!,
      sbu: SBU_OPTIONS[1 + (i % (SBU_OPTIONS.length - 1))]!,
      branch: BRANCH_OPTIONS[1 + (i % (BRANCH_OPTIONS.length - 1))]!,
      phlebo: PHLEBO_OPTIONS[1 + (i % (PHLEBO_OPTIONS.length - 1))]!,
      tests,
      regDate: regD.toISOString().split("T")[0]!,
      regTime: `${padTwo(randBetween(8, 18))}:${padTwo(randBetween(0, 59))}`,
      collDate: collD.toISOString().split("T")[0]!,
      collTimeFrom: `${padTwo(fromH)}:00`,
      collTimeTo: `${padTwo(toH)}:00`,
      status: statusesList[i % statusesList.length]!,
      remarks: i % 5 === 0 ? "Patient requested morning slot" : undefined,
    };
  });
}

export const ALL_VISITS = generateMockVisits();
