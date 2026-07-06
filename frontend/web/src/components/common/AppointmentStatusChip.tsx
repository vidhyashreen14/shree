import type { AppointmentStatus } from "@/lib/types";
import { StatusChip } from "./StatusChip";

const map: Record<AppointmentStatus, { tone: Parameters<typeof StatusChip>[0]["tone"]; label: string }> = {
  scheduled: { tone: "info", label: "Scheduled" },
  "checked-in": { tone: "primary", label: "Checked in" },
  "in-consultation": { tone: "warning", label: "In consultation" },
  completed: { tone: "success", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  "no-show": { tone: "danger", label: "No show" },
};

export function AppointmentStatusChip({ status }: { status: AppointmentStatus }) {
  const { tone, label } = map[status];
  return <StatusChip tone={tone}>{label}</StatusChip>;
}
