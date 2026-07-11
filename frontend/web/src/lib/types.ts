export type Role = 'admin' | 'doctor' | 'frontdesk' | 'nurse' | 'pharmacy' | 'lab';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  department?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  allergies: string[];
  medications: string[];
  insurance?: {
    provider: string;
    policyNo: string;
  };
  registeredOn: string;
  assignedDoctorId: string;
}

export type AppointmentStatus = 'scheduled' | 'checked-in' | 'in-consultation' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'consultation' | 'follow-up' | 'walk-in' | 'tele';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  durationMin: number;
  reason: string;
  type: AppointmentType;
  status: AppointmentStatus;
  token: number;
  notes?: string;
}

export interface Vitals {
  id: string;
  patientId: string;
  recordedAt: string;
  bp: string;
  pulse: number;
  tempF: number;
  weightKg: number;
  heightCm: number;
  bmi: number;
  spo2: number;
  bloodSugar: number;
  notes?: string;
}

export interface PrescriptionMedicine {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  advice: string;
}

export type LabOrderStatus = 'ordered' | 'sample-collected' | 'in-progress' | 'completed';

export interface LabOrder {
  id: string;
  patientId: string;
  doctorId: string;
  tests: string[];
  status: LabOrderStatus;
  orderedOn: string;
  reportUrl?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  stock: number;
  minStock: number;
  expiry: string;
  pricePerUnit: number;
  gst: number;
  batch: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  doctorCount: number;
  patientsToday: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  email: string;
  phone: string;
  experienceYears: number;
  fee: number;
  rating: number;
  available: boolean;
}

export interface AuditLog {
  id: string;
  user: string;
  role: Role;
  action: string;
  target: string;
  at: string;
  ip: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  at: string;
  kind: "info" | "success" | "warning" | "error";
  read: boolean;
}

export interface NurseVitals {
  height: string;
  weight: string;
  bmi: string;
  bp: string;
  pulse: string;
  tempF: string;
  spo2: string;
  sugar?: string;
  chiefComplaint: string;
}

export interface NurseQueueEntry {
  id: string;
  patientId: string;
  uhid: string;
  patientName: string;
  age: number;
  gender: string;
  doctorId: string;
  doctorName: string;
  department: string;
  isNewPatient: boolean;
  paymentMethod: string;
  totalPaid: number;
  arrivedAt: string;
  vitalsStatus: "pending" | "in-progress" | "done";
  vitals?: NurseVitals;
  consultStatus?: "waiting" | "in-consultation" | "completed" | "cancelled";
}


export interface VisitRecord {
  id: string;
  patientId: string;
  uhid: string;
  isNewPatient: boolean;
  doctorId: string;
  department: string;
  paymentMethod: string;
  registrationFee: number;
  consultationFee: number;
  totalPaid: number;
  receiptNo: string;
  visitedAt: string;
}
