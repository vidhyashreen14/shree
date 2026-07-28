<<<<<<< HEAD
import type { AppointmentStatus } from "@/lib/types";
import {
  CalendarClock,
  CircleDot,
  Stethoscope,
  CheckCheck,
  Ban,
  UserX,
  FlaskConical,
} from "lucide-react";

const map: Record<
  AppointmentStatus | "pending-lab",
  {
    icon: React.ElementType;
    label: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  scheduled: {
    icon: CalendarClock,
    label: "Scheduled",
    bgClass: "bg-blue-50 dark:bg-blue-950/40",
    textClass: "text-blue-700 dark:text-blue-300",
    dotClass: "bg-blue-500",
  },
  "checked-in": {
    icon: CircleDot,
    label: "Waiting",
    bgClass: "bg-amber-50 dark:bg-amber-950/40",
    textClass: "text-amber-700 dark:text-amber-300",
    dotClass: "bg-amber-500",
  },
  "in-consultation": {
    icon: Stethoscope,
    label: "In Consult",
    bgClass: "bg-primary/10 dark:bg-primary/20",
    textClass: "text-primary dark:text-primary",
    dotClass: "bg-primary",
  },
  completed: {
    icon: CheckCheck,
    label: "Completed",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/40",
    textClass: "text-emerald-700 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
  },
  cancelled: {
    icon: Ban,
    label: "Cancelled",
    bgClass: "bg-muted dark:bg-muted/50",
    textClass: "text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
  "no-show": {
    icon: UserX,
    label: "No Show",
    bgClass: "bg-rose-50 dark:bg-rose-950/40",
    textClass: "text-rose-700 dark:text-rose-300",
    dotClass: "bg-rose-500",
  },
  "pending-lab": {
    icon: FlaskConical,
    label: "Pending Lab",
    bgClass: "bg-red-50 dark:bg-red-950/40",
    textClass: "text-red-700 dark:text-red-300",
    dotClass: "bg-red-500",
  },
=======
import type { AppointmentStatus } from '@/lib/types';
import { StatusChip } from './StatusChip';

const map: Record<
  AppointmentStatus,
  { tone: Parameters<typeof StatusChip>[0]['tone']; label: string }
> = {
  scheduled: { tone: 'info', label: 'Scheduled' },
  'checked-in': { tone: 'primary', label: 'Checked in' },
  'in-consultation': { tone: 'warning', label: 'In consultation' },
  completed: { tone: 'success', label: 'Completed' },
  cancelled: { tone: 'neutral', label: 'Cancelled' },
  'no-show': { tone: 'danger', label: 'No show' },
>>>>>>> a821a0c (second update)
};

interface AppointmentStatusChipProps {
  status: AppointmentStatus | "pending-lab";
  size?: "sm" | "md";
}

export function AppointmentStatusChip({ status, size = "sm" }: AppointmentStatusChipProps) {
  const config = map[status] ?? map["cancelled"];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${config.bgClass} ${config.textClass} ${size === "sm" ? "text-[11px]" : "text-xs"}`}
    >
      {/* Accessible dot indicator */}
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClass}`} aria-hidden="true" />
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {config.label}
    </span>
  );
}

// Export the map for reuse
export { map as statusBadgeMap };
