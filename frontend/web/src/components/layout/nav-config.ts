import type { Role } from '@/lib/types';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
<<<<<<< HEAD
  Activity,
=======
>>>>>>> a821a0c (second update)
  FlaskConical,
  Pill,
  ClipboardList,
  Building2,
  Shield,
  Settings,
  Bell,
  FileText,
  UserCog,
  ScrollText,
  BadgeCheck,
  ListChecks,
  Search,
  Receipt,
  Truck,
  AlertTriangle,
  HeartPulse,
  Inbox,
  PackageSearch,
  FilePlus2,
  FileCheck2,
  ClipboardPlus,
<<<<<<< HEAD
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
=======
>>>>>>> a821a0c (second update)
  Beaker,
  Calendar,
  UserPlus,
  Hourglass,
  KeyRound,
  Monitor,
  IndianRupee,
<<<<<<< HEAD
  ClipboardPen,
  FileSpreadsheet,
  TrendingUp,
} from "lucide-react";
import type { ComponentType } from "react";

=======
  UserCheck,
} from 'lucide-react';

import type { ComponentType } from 'react';

>>>>>>> a821a0c (second update)
export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  group?: string;
}

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: '/admin/settings', label: 'Hospital settings', icon: Settings, group: 'Main' },
    { to: '/admin/users', label: 'Users', icon: Users, group: 'Hospital' },
    { to: '/admin/staff', label: 'Staff Profiles', icon: UserCheck, group: 'Hospital' },
    { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope, group: 'Hospital' },
    { to: '/admin/departments', label: 'Departments', icon: Building2, group: 'Hospital' },
    { to: '/admin/roles', label: 'Roles & permissions', icon: Shield, group: 'Hospital' },
    { to: '/admin/access', label: 'Access Management', icon: KeyRound, group: 'Access' },
    { to: '/admin/monitor', label: 'Monitor Dashboards', icon: Monitor, group: 'Access' },
    { to: '/admin/audit', label: 'Audit logs', icon: ScrollText, group: 'System' },
    { to: '/admin/billing', label: 'Billing Configuration', icon: IndianRupee, group: 'System' },
  ],
  doctor: [
<<<<<<< HEAD
    { to: "/doctor", label: "Overview", icon: LayoutDashboard, group: "Practice" },
    { to: "/doctor/queue", label: "Patient queue", icon: Hourglass, group: "Practice" },
    { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays, group: "Practice" },
    { to: "/doctor/patients", label: "My patients", icon: Users, group: "Practice" },
    { to: "/doctor/prescriptions", label: "Prescriptions", icon: ClipboardPlus, group: "Clinical" },
    { to: "/doctor/lab-orders", label: "Lab orders", icon: FlaskConical, group: "Clinical" },
    { to: "/doctor/schedule", label: "My schedule", icon: Calendar, group: "Practice" },
    { to: "/doctor/patient-history", label: "Patient history", icon: FileText, group: "Clinical" },
=======
    { to: '/doctor', label: 'Overview', icon: LayoutDashboard, group: 'Practice' },
    { to: '/doctor/queue', label: 'Patient queue', icon: Hourglass, group: 'Practice' },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays, group: 'Practice' },
    { to: '/doctor/patients', label: 'My patients', icon: Users, group: 'Practice' },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: ClipboardPlus, group: 'Clinical' },
    { to: '/doctor/lab-orders', label: 'Lab orders', icon: FlaskConical, group: 'Clinical' },
    { to: '/doctor/schedule', label: 'My schedule', icon: Calendar, group: 'Practice' },
    { to: '/doctor/patient-history', label: 'Patient history', icon: FileText, group: 'Clinical' },
>>>>>>> a821a0c (second update)
  ],
  frontdesk: [
    { to: '/frontdesk', label: 'Overview', icon: LayoutDashboard },
    { to: '/frontdesk/register', label: 'Register patient', icon: UserPlus },
    { to: '/frontdesk/billing', label: 'Optional Billing', icon: IndianRupee },
    { to: '/frontdesk/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/frontdesk/queue', label: 'Queue', icon: ListChecks },
  ],
  nurse: [
    { to: '/nurse', label: 'Overview', icon: LayoutDashboard },
    { to: '/nurse/queue', label: 'Patient queue', icon: Hourglass },
    { to: '/nurse/vitals', label: 'Record vitals', icon: HeartPulse },
  ],
  pharmacy: [
    { to: '/pharmacy', label: 'Overview', icon: LayoutDashboard },
    { to: '/pharmacy/inventory', label: 'Inventory', icon: PackageSearch },
    { to: '/pharmacy/orders', label: 'Purchase orders', icon: Truck },
    { to: '/pharmacy/billing', label: 'Billing', icon: Receipt },
  ],
  lab: [
<<<<<<< HEAD
    { to: "/lab", label: "Overview", icon: LayoutDashboard, group: "Main" },
    { to: "/lab/visits", label: "Visit List", icon: ClipboardList, group: "Main" },
    // { to: "/lab/pending", label: "Pending tests", icon: Beaker, group: "Main" },
    { to: "/lab/reports", label: "Reports", icon: FileCheck2, group: "Main" },
    { to: "/lab/upload", label: "Generate report", icon: FilePlus2, group: "Main" },
    { to: "/lab/quotations", label: "Quotations", icon: ClipboardPen, group: "Transaction" },
    {
      to: "/lab/analytics?tab=sales",
      label: "Branch Daily Sales Report",
      icon: FileSpreadsheet,
      group: "Analytics",
    },
    {
      to: "/lab/analytics?tab=registrations",
      label: "Monthly Registrations",
      icon: TrendingUp,
      group: "Analytics",
    },
=======
    { to: '/lab', label: 'Overview', icon: LayoutDashboard },
    { to: '/lab/pending', label: 'Pending tests', icon: Beaker },
    { to: '/lab/reports', label: 'Reports', icon: FileCheck2 },
    { to: '/lab/upload', label: 'Upload report', icon: FilePlus2 },
  ],
  superadmin: [
    {
      to: '/superadmin/hospitals',
      label: 'Hospital Management',
      icon: Building2,
      group: 'Hospitals',
    },
    {
      to: '/superadmin/subscriptions',
      label: 'Subscriptions',
      icon: BadgeCheck,
      group: 'Subscriptions',
    },
    { to: '/superadmin/modules', label: 'Modules', icon: PackageSearch, group: 'System' },
    { to: '/superadmin/users', label: 'Company Users', icon: Users, group: 'Users' },
    { to: '/superadmin/support', label: 'Support', icon: Inbox, group: 'Support' },
    { to: '/superadmin/reports', label: 'Reports', icon: FileText, group: 'Reports' },
    { to: '/superadmin/notifications', label: 'Notifications', icon: Bell, group: 'System' },
    { to: '/superadmin/settings', label: 'System Settings', icon: Settings, group: 'Settings' },
>>>>>>> a821a0c (second update)
  ],
};

export const SHARED_NAV: NavItem[] = [
<<<<<<< HEAD
  { to: "/profile", label: "Profile", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
=======
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserCog },
  { to: '/settings', label: 'Settings', icon: Settings },
>>>>>>> a821a0c (second update)
];

// silence unused symbol warnings from re-exports
export const _icons = { AlertTriangle, BadgeCheck, FileText, Inbox, Pill, Search, ClipboardList };
