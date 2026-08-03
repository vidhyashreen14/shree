import { createFileRoute } from '@tanstack/react-router';
import React, { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppointmentStatusChip } from '@/components/common/AppointmentStatusChip';
import { appointments, patients } from '@/lib/mock/data';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Stethoscope, UserPlus, RefreshCw, Video } from 'lucide-react';

import { useCurrentDoctorId } from '@/lib/store/doctors';

export const Route = createFileRoute('/_app/doctor/schedule')({
  component: DoctorSchedule,
});

// ─── Appointment-type styling ──────────────────────────────────────────────────
const typeConfig: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
    label: string;
  }
> = {
  consultation: {
    bg: "bg-primary/8 dark:bg-primary/15",
    border: "border-primary/40",
    text: "text-primary",
    icon: Stethoscope,
    label: "Consult",
  },
  "walk-in": {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300/60 dark:border-amber-700/40",
    text: "text-amber-700 dark:text-amber-400",
    icon: UserPlus,
    label: "Walk-in",
  },
  "follow-up": {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-300/50 dark:border-indigo-700/40",
    text: "text-indigo-700 dark:text-indigo-400",
    icon: RefreshCw,
    label: "Follow-up",
  },
  tele: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-300/50 dark:border-violet-700/40",
    text: "text-violet-700 dark:text-violet-400",
    icon: Video,
    label: "Tele",
  },
};

function DoctorSchedule() {
  const doctorId = useCurrentDoctorId();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const hours = Array.from({ length: 10 }).map((_, i) => 9 + i); // 9 → 18

  const slot = (day: Date, hour: number) =>
    appointments.find(
      (a) =>
        a.doctorId === doctorId &&
        isSameDay(new Date(a.date), day) &&
        new Date(a.date).getHours() === hour
    );

  return (
    <>
      <PageHeader
        title="My schedule"
        description={`Week of ${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            >
              This week
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekStart(addDays(weekStart, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        }
      />

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="mb-3 flex flex-wrap gap-3">
        {Object.entries(typeConfig).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}
            >
              <Icon className="h-3 w-3" />
              {cfg.label}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300/50 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
          <span className="h-2 w-0.5 rounded-full bg-red-500" />
          Now
        </span>
      </div>

      {/* ── Grid ──────────────────────────────────────────────────────── */}
      <div className="surface-elevated overflow-x-auto">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="w-16 px-2 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                Time
              </th>
              {days.map((d) => (
                <th
                  key={d.toISOString()}
                  className="px-2 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                >
                  <div>{format(d, 'EEE')}</div>
                  <div className={isSameDay(d, new Date()) ? 'text-primary' : ''}>
                    {format(d, 'MMM d')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h} className="border-t border-border">
                <td className="px-2 py-3 align-top text-xs text-muted-foreground">
                  {format(new Date().setHours(h, 0, 0, 0), 'p')}
                </td>
                {days.map((d) => {
                  const a = slot(d, h);
                  if (!a)
                    return (
                      <td key={d.toISOString()} className="h-16 border-l border-border p-1">
                        <div className="h-full rounded-md border border-dashed border-transparent hover:border-border" />
                      </td>
                    );
                  const p = patients.find((x) => x.id === a.patientId);
                  return (
                    <td key={d.toISOString()} className="h-16 border-l border-border p-1 align-top">
                      <div className="h-full rounded-md border border-primary/30 bg-primary/5 p-1.5">
                        <p className="truncate text-xs font-semibold">{p?.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{a.reason}</p>
                        <AppointmentStatusChip status={a.status} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
