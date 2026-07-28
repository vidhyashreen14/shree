/**
 * useDoctors — reactive hook that derives the live doctor list from
 * the staffProfiles store. Any component using this hook will
 * automatically re-render whenever the admin creates, edits, or
 * deletes a doctor profile.
 */
import { useMemo } from 'react';
import { useStaffProfiles, type StaffProfile } from './staffProfiles';
import type { Doctor } from '../types';
import { useAuth } from './auth';

export function useCurrentDoctorId(): string {
  const user = useAuth((s) => s.user);
  const profiles = useStaffProfiles((s) => s.profiles);
  return useMemo(() => {
    if (user?.role === 'doctor') {
      const matched = profiles.find(
        (p) =>
          p.role === 'doctor' &&
          (p.id === user.id || p.email.toLowerCase() === user.email.toLowerCase()),
      );
      if (matched) return matched.id;
      return user.id;
    }
    const firstDoc = profiles.find((p) => p.role === 'doctor');
    return firstDoc?.id || 'u-doc-1';
  }, [user, profiles]);
}

function specialization(department?: string): string {
  switch (department) {
    case 'Cardiology':
      return 'Interventional Cardiologist';
    case 'Neurology':
      return 'Neurologist';
    case 'Pediatrics':
      return 'Pediatrician';
    case 'Orthopedics':
      return 'Orthopedic Surgeon';
    case 'Gynecology':
      return 'OB-GYN';
    case 'Dermatology':
      return 'Dermatologist';
    case 'Emergency':
      return 'Emergency Physician';
    default:
      return 'General Physician';
  }
}

export function profileToDoctor(p: StaffProfile): Doctor {
  return {
    id: p.id,
    name: `Dr. ${p.firstName} ${p.lastName}`,
    specialization: specialization(p.department),
    department: p.department ?? 'Unassigned',
    email: p.email,
    phone: p.mobile,
    experienceYears: 10,
    fee: p.department === 'Emergency' ? 0 : 1000,
    rating: 4.8,
    available: p.status === 'active',
  };
}

/**
 * Returns the list of active doctor profiles as Doctor objects.
 * Components subscribed to this hook will re-render in real-time
 * when the admin adds / edits / deletes any doctor.
 */
export function useDoctors(): Doctor[] {
  const profiles = useStaffProfiles((s) => s.profiles);
  return useMemo(
    () => profiles.filter((p) => p.role === 'doctor').map(profileToDoctor),
    [profiles],
  );
}

/**
 * Snapshot getter — use outside React (e.g. in event handlers).
 */
export function getDoctors(): Doctor[] {
  return useStaffProfiles
    .getState()
    .profiles.filter((p) => p.role === 'doctor')
    .map(profileToDoctor);
}
