import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '../types';

// ─── ID generators ───────────────────────────────────────────────────────────

const ROLE_PREFIX: Partial<Record<Role, string>> = {
  doctor: 'DOC',
  nurse: 'NUR',
  lab: 'LAB',
  pharmacy: 'PHA',
  frontdesk: 'FD',
};

function generateStaffId(role: Role, existing: StaffProfile[]): string {
  const prefix = ROLE_PREFIX[role] ?? 'STF';
  const sameRole = existing.filter((p) => p.role === role);
  const next = sameRole.length + 1;
  return `${prefix}-${String(next).padStart(4, '0')}`;
}

// ─── Type ────────────────────────────────────────────────────────────────────

export interface StaffProfile {
  /** System-generated unique ID for internal reference */
  id: string;
  /** Auto-generated display ID, e.g. DOC-0001 */
  staffId: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string; // ISO date
  bloodGroup?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  mobile: string;
  email: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  /** Base64 data URL or URL string */
  profilePhoto?: string;
  role: Role;
  department?: string;
  specialization?: string;
  qualification?: string;
  registrationNumber?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export const DEMO_STAFF: StaffProfile[] = [
  {
    id: 'u-doc-1',
    staffId: 'DOC-0001',
    firstName: 'Vikram',
    lastName: 'Shah',
    gender: 'male',
    dateOfBirth: '1980-05-15',
    mobile: '+91 98200 11111',
    email: 'doctor@medicore.io',
    address: 'B-402 Shanti Nagar',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400001',
    emergencyContactPerson: 'Neha Shah',
    emergencyContactNumber: '+91 98200 00000',
    role: 'doctor',
    department: 'Cardiology',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-fd',
    staffId: 'FD-0001',
    firstName: 'Priya',
    lastName: 'Menon',
    gender: 'female',
    dateOfBirth: '1992-08-20',
    mobile: '+91 98200 22222',
    email: 'frontdesk@medicore.io',
    address: 'Flat 101, Oakwood Apts',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400002',
    emergencyContactPerson: 'Ravi Menon',
    emergencyContactNumber: '+91 98200 00001',
    role: 'frontdesk',
    department: 'Reception',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-rn',
    staffId: 'NUR-0001',
    firstName: 'Sister Joan',
    lastName: 'Lewis',
    gender: 'female',
    dateOfBirth: '1988-03-12',
    mobile: '+91 98200 33333',
    email: 'nurse@medicore.io',
    address: 'St. Jude Convent',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400003',
    emergencyContactPerson: 'Mother Superior',
    emergencyContactNumber: '+91 98200 00002',
    role: 'nurse',
    department: 'OPD',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-rx',
    staffId: 'PHA-0001',
    firstName: 'Rahul',
    lastName: 'Verma',
    gender: 'male',
    dateOfBirth: '1990-11-05',
    mobile: '+91 98200 44444',
    email: 'pharmacy@medicore.io',
    address: '12/A, Gandhi Nagar',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400004',
    emergencyContactPerson: 'Suman Verma',
    emergencyContactNumber: '+91 98200 00003',
    role: 'pharmacy',
    department: 'Pharmacy',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'u-lab',
    staffId: 'LAB-0001',
    firstName: 'Mei',
    lastName: 'Chen',
    gender: 'female',
    dateOfBirth: '1993-06-25',
    mobile: '+91 98200 55555',
    email: 'lab@medicore.io',
    address: 'Chinatown Lane',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pinCode: '400005',
    emergencyContactPerson: 'Lee Chen',
    emergencyContactNumber: '+91 98200 00004',
    role: 'lab',
    department: 'Pathology',
    status: 'active',
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────

interface StaffProfileState {
  profiles: StaffProfile[];
  addProfile: (
    data: Omit<StaffProfile, 'id' | 'staffId' | 'createdAt' | 'updatedAt' | 'status'>,
  ) => StaffProfile;
  updateProfile: (id: string, patch: Partial<StaffProfile>) => void;
  deleteProfile: (id: string) => void;
  getById: (id: string) => StaffProfile | undefined;
}

export const useStaffProfiles = create<StaffProfileState>()(
  persist(
    (set, get) => ({
      profiles: DEMO_STAFF,

      addProfile: (data) => {
        const profiles = get().profiles;
        const profile: StaffProfile = {
          ...data,
          id: `sp-${Date.now()}`,
          staffId: generateStaffId(data.role, profiles),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ profiles: [profile, ...s.profiles] }));
        return profile;
      },

      updateProfile: (id, patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      deleteProfile: (id) => set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id) })),

      getById: (id) => get().profiles.find((p) => p.id === id),
    }),
    {
      name: 'medicore-staff-profiles',
      onRehydrateStorage: () => () => {
        if (typeof window === 'undefined') return;
        window.addEventListener('storage', (e) => {
          if (e.key === 'medicore-staff-profiles') {
            useStaffProfiles.persist.rehydrate();
          }
        });
      },
    },
  ),
);

// Ensure store is seeded if empty (e.g. loaded empty from localStorage)
if (useStaffProfiles.getState().profiles.length === 0) {
  useStaffProfiles.setState({ profiles: DEMO_STAFF });
}
