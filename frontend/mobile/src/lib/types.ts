"use client";

import { Role } from './shared/types';

// Mobile-specific types with React Native considerations

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  lastLoginAt?: Date;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phone: string;
  email: string;
  address: string;
  emergencyContact: Contact;
  primaryCareDoctor?: string;
  allergies: string[];
  medications: Medication[];
  chronicConditions: string[];
  lastVisit: Date;
  nextAppointment?: Date;
}

export interface Contact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy?: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  npi: string;
  name: string;
  specialty: string;
  qualification: string[];
  contactInfo: Contact;
  hospitalAffiliation: string[];
  schedule: DoctorSchedule;
  ratings: DoctorRating[];
}

export interface DoctorSchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface DoctorRating {
  patientId: string;
  patientName: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  headDoctor: string;
  capacity: number;
  currentOccupancy: number;
  services: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number; // minutes
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  RESCHEDULED = 'rescheduled'
}

export enum AppointmentType {
  INITIAL = 'initial',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  PROCEDURE = 'procedure',
  CONSULTATION = 'consultation'
}

export interface Vitals {
  id: string;
  patientId: string;
  patientName: string;
  recordedBy: string;
  recordedAt: Date;
  temperature: number; // Celsius
  heartRate: number; // bpm
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  respiratoryRate: number; // breaths per minute
  oxygenSaturation: number; // SpO2
  weight: number; // kg
  height: number; // cm
  bmi: number;
  glucoseLevel: number; // mg/dL
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  medication: Medication;
  quantity: number;
  refills: number;
  expirationDate: Date;
  status: PrescriptionStatus;
  filledAt?: Date;
  filledBy?: string;
  notes?: string;
}

export enum PrescriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  orderedBy: string;
  orderedAt: Date;
  lab: string;
  tests: LabTest[];
  status: LabOrderStatus;
  sampleCollectedAt?: Date;
  resultReadyAt?: Date;
  results?: LabResult[];
  notes?: string;
}

export interface LabTest {
  name: string;
  code: string;
  description?: string;
}

export interface LabResult {
  testId: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: {
    low: number;
    high: number;
  };
  isAbnormal: boolean;
  notes?: string;
}

export enum LabOrderStatus {
  ORDERED = 'ordered',
  SAMPLE_COLLECTED = 'sample_collected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  brand: string;
  dosage: string;
  form: MedicineForm;
  quantity: number;
  unitPrice: number;
  manufacturer: string;
  expirationDate: Date;
  lotNumber: string;
  status: MedicineStatus;
  storage: StorageLocation;
  reorderLevel: number;
}

export enum MedicineForm {
  TABLET = 'tablet',
  CAPSULE = 'capsule',
  LIQUID = 'liquid',
  INHALER = 'inhaler',
  CREAM = 'cream',
  INJECTION = 'injection',
  OINTMENT = 'ointment',
  OTHER = 'other'
}

export enum MedicineStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  EXPIRING_SOON = 'expiring_soon'
}

export interface StorageLocation {
  cabinet: string;
  shelf: string;
  bin: string;
  temperature: 'room' | 'refrigerated' | 'frozen';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: Date;
  details: string;
  ipAddress: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  VITALS = 'vitals',
  PRESCRIPTION = 'prescription',
  LAB_RESULT = 'lab_result',
  SYSTEM = 'system',
  ANNOUNCEMENT = 'announcement'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface RevenueData {
  date: Date;
  dailyTotal: number;
  byDepartment: DepartmentRevenue[];
  byDoctor: DoctorRevenue[];
  visitCount: number;
  billingCount: number;
}

export interface DepartmentRevenue {
  departmentId: string;
  departmentName: string;
  revenue: number;
  visitCount: number;
}

export interface DoctorRevenue {
  doctorId: string;
  doctorName: string;
  revenue: number;
  visitCount: number;
}

export interface VisitData {
  date: Date;
  visitCount: number;
  byDepartment: Record<string, number>;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  name: string;
  isAuthenticated: boolean;
}
