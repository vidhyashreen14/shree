import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { AppointmentStatusChip } from '@/components/common/AppointmentStatusChip';
import { appointments, doctors, patients } from '@/lib/mock/data';
import { useAuth } from '@/lib/store/auth';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Route = createFileRoute('/_app/doctor/schedule')({
  component: DoctorSchedule,
});

function DoctorSchedule() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === 'doctor' ? user.id : doctors[0]!.id;
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
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
