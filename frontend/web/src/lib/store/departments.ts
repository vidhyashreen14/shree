import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Department } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'd-gen-med', name: 'General Medicine', head: 'TBD', doctorCount: 0, patientsToday: 15 },
  { id: 'd-gen-surg', name: 'General Surgery', head: 'TBD', doctorCount: 0, patientsToday: 12 },
  { id: 'd-card', name: 'Cardiology', head: 'Dr. Vikram Shah', doctorCount: 1, patientsToday: 42 },
  {
    id: 'd-ctvs',
    name: 'Cardiothoracic Surgery (CTVS)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 8,
  },
  { id: 'd-neu', name: 'Neurology', head: 'TBD', doctorCount: 0, patientsToday: 28 },
  { id: 'd-neuro-surg', name: 'Neurosurgery', head: 'TBD', doctorCount: 0, patientsToday: 10 },
  { id: 'd-ortho', name: 'Orthopedics', head: 'TBD', doctorCount: 0, patientsToday: 33 },
  { id: 'd-ped', name: 'Pediatrics', head: 'TBD', doctorCount: 0, patientsToday: 51 },
  { id: 'd-ped-surg', name: 'Pediatric Surgery', head: 'TBD', doctorCount: 0, patientsToday: 5 },
  {
    id: 'd-obg',
    name: 'Obstetrics & Gynecology (OBG)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 37,
  },
  { id: 'd-derm', name: 'Dermatology', head: 'TBD', doctorCount: 0, patientsToday: 22 },
  {
    id: 'd-ent',
    name: 'ENT (Otorhinolaryngology)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 18,
  },
  { id: 'd-ophth', name: 'Ophthalmology', head: 'TBD', doctorCount: 0, patientsToday: 14 },
  { id: 'd-uro', name: 'Urology', head: 'TBD', doctorCount: 0, patientsToday: 11 },
  { id: 'd-neph', name: 'Nephrology', head: 'TBD', doctorCount: 0, patientsToday: 16 },
  { id: 'd-gastro', name: 'Gastroenterology', head: 'TBD', doctorCount: 0, patientsToday: 20 },
  {
    id: 'd-surg-gastro',
    name: 'Surgical Gastroenterology',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 7,
  },
  { id: 'd-endo', name: 'Endocrinology', head: 'TBD', doctorCount: 0, patientsToday: 25 },
  {
    id: 'd-pulm',
    name: 'Pulmonology (Respiratory Medicine)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 19,
  },
  { id: 'd-psych', name: 'Psychiatry', head: 'TBD', doctorCount: 0, patientsToday: 13 },
  { id: 'd-med-onc', name: 'Medical Oncology', head: 'TBD', doctorCount: 0, patientsToday: 9 },
  { id: 'd-surg-onc', name: 'Surgical Oncology', head: 'TBD', doctorCount: 0, patientsToday: 6 },
  { id: 'd-rad-onc', name: 'Radiation Oncology', head: 'TBD', doctorCount: 0, patientsToday: 11 },
  { id: 'd-rheum', name: 'Rheumatology', head: 'TBD', doctorCount: 0, patientsToday: 8 },
  {
    id: 'd-plastic',
    name: 'Plastic & Reconstructive Surgery',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 12,
  },
  { id: 'd-anes', name: 'Anesthesiology', head: 'TBD', doctorCount: 0, patientsToday: 0 },
  {
    id: 'd-icu',
    name: 'Critical Care Medicine (ICU)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 30,
  },
  { id: 'd-er', name: 'Emergency Medicine', head: 'TBD', doctorCount: 0, patientsToday: 64 },
  {
    id: 'd-pmr',
    name: 'Physical Medicine & Rehabilitation (PMR)',
    head: 'TBD',
    doctorCount: 0,
    patientsToday: 15,
  },
  { id: 'd-dent', name: 'Dental Surgery', head: 'TBD', doctorCount: 0, patientsToday: 21 },
];

interface DepartmentState {
  departments: Department[];
  addDepartment: (name: string, headName: string) => void;
  removeDepartment: (id: string) => void;
}

export const useDepartments = create<DepartmentState>()(
  persist(
    (set) => ({
      departments: INITIAL_DEPARTMENTS,
      addDepartment: (name, headName) => {
        const newDept: Department = {
          id: `dept-${Date.now()}`,
          name,
          head: headName || 'TBD',
          doctorCount: 0,
          patientsToday: 0,
        };
        set((s) => ({ departments: [...s.departments, newDept] }));
      },
      removeDepartment: (id) => {
        set((s) => ({ departments: s.departments.filter((d) => d.id !== id) }));
      },
    }),
    { name: 'medicore-departments' },
  ),
);

// Ensure seeded if empty or stale
if (useDepartments.getState().departments.length < 30) {
  useDepartments.setState({ departments: INITIAL_DEPARTMENTS });
}
