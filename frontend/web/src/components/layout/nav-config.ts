import type { Role } from "@/lib/types";
import {
  LayoutDashboard, Users, Stethoscope, CalendarDays, Activity, FlaskConical,
  Pill, ClipboardList, Building2, Shield, Settings, Bell, FileText, UserCog,
  ScrollText, BadgeCheck, ListChecks, Search, Receipt, Truck, AlertTriangle,
  HeartPulse, Inbox, PackageSearch, FilePlus2, FileCheck2, ClipboardPlus, Beaker,
  Calendar, UserPlus, Hourglass, KeyRound, Monitor, IndianRupee,
} from "lucide-react";
import type { ComponentType } from "react";


export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  group?: string;
}

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard, group: "Main" },
    { to: "/admin/analytics", label: "Analytics", icon: Activity, group: "Main" },
    { to: "/admin/users", label: "Users", icon: Users, group: "Hospital" },
    { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, group: "Hospital" },
    { to: "/admin/departments", label: "Departments", icon: Building2, group: "Hospital" },
    { to: "/admin/roles", label: "Roles & permissions", icon: Shield, group: "Hospital" },
    { to: "/admin/access", label: "Access Management", icon: KeyRound, group: "Access" },
    { to: "/admin/monitor", label: "Monitor Dashboards", icon: Monitor, group: "Access" },
    { to: "/admin/audit", label: "Audit logs", icon: ScrollText, group: "System" },
    { to: "/admin/billing", label: "Billing Configuration", icon: IndianRupee, group: "System" },
    { to: "/admin/settings", label: "Hospital settings", icon: Settings, group: "System" },
  ],
  doctor: [
    { to: "/doctor", label: "Overview", icon: LayoutDashboard, group: "Practice" },
    { to: "/doctor/queue", label: "Patient queue", icon: Hourglass, group: "Practice" },
    { to: "/doctor/appointments", label: "Appointments", icon: CalendarDays, group: "Practice" },
    { to: "/doctor/patients", label: "My patients", icon: Users, group: "Practice" },
    { to: "/doctor/prescriptions", label: "Prescriptions", icon: ClipboardPlus, group: "Clinical" },
    { to: "/doctor/lab-orders", label: "Lab orders", icon: FlaskConical, group: "Clinical" },
    { to: "/doctor/schedule", label: "My schedule", icon: Calendar, group: "Practice" },
    { to: "/doctor/patient-history", label: "Patient history", icon: FileText, group: "Clinical" }
  ],
  frontdesk: [
    { to: "/frontdesk", label: "Overview", icon: LayoutDashboard },
    { to: "/frontdesk/register", label: "Register patient", icon: UserPlus },
    { to: "/frontdesk/billing", label: "Optional Billing", icon: IndianRupee },
    { to: "/frontdesk/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/frontdesk/queue", label: "Queue", icon: ListChecks },
  ],
  nurse: [
    { to: "/nurse", label: "Overview", icon: LayoutDashboard },
    { to: "/nurse/queue", label: "Patient queue", icon: Hourglass },
    { to: "/nurse/vitals", label: "Record vitals", icon: HeartPulse },
  ],
  pharmacy: [
    { to: "/pharmacy", label: "Overview", icon: LayoutDashboard },
    { to: "/pharmacy/inventory", label: "Inventory", icon: PackageSearch },
    { to: "/pharmacy/orders", label: "Purchase orders", icon: Truck },
    { to: "/pharmacy/billing", label: "Billing", icon: Receipt },
  ],
  lab: [
    { to: "/lab", label: "Overview", icon: LayoutDashboard },
    { to: "/lab/pending", label: "Pending tests", icon: Beaker },
    { to: "/lab/reports", label: "Reports", icon: FileCheck2 },
    { to: "/lab/upload", label: "Upload report", icon: FilePlus2 },

  ],
};

export const SHARED_NAV: NavItem[] = [
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: UserCog },
  { to: "/settings", label: "Settings", icon: Settings },
];

// silence unused symbol warnings from re-exports
export const _icons = { AlertTriangle, BadgeCheck, FileText, Inbox, Pill, Search, ClipboardList };
