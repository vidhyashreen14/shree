import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { AppointmentStatusChip } from '@/components/common/AppointmentStatusChip';
import { Users, CalendarDays, UserPlus, Hourglass, HeartPulse } from 'lucide-react';
import { appointments, doctors } from '@/lib/mock/data';
import { usePatients } from '@/lib/store/patients';
import { useNurseQueue } from '@/lib/store/nurseQueue';
import { isToday, format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/frontdesk/')({
  head: () => ({
    meta: [
      { title: 'Reception · MediCore Front Desk' },
      { name: 'description', content: "Today's footfall, walk-ins and live queue at a glance." },
    ],
  }),
  component: FrontDeskOverview,
});

const vitalsStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending vitals', color: 'bg-amber-500/10 text-amber-600' },
  'in-progress': { label: 'In progress', color: 'bg-blue-500/10 text-blue-600' },
  done: { label: 'Done', color: 'bg-emerald-500/10 text-emerald-600' },
};

function FrontDeskOverview() {
  const today = appointments.filter((a) => isToday(new Date(a.date)));
  const waiting = today.filter((a) => a.status === 'checked-in').length;
  const inConsult = today.filter((a) => a.status === 'in-consultation').length;

  const patients = usePatients((s) => s.patients);
  const registeredToday = patients.filter((p) => isToday(new Date(p.registeredOn))).length;

  const queue = useNurseQueue((s) => s.queue);
  const pendingQueue = queue.filter((e) => e.vitalsStatus !== 'done');

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Reception command center"
        description="Today's footfall, walk-ins and live queue at a glance."
        actions={
          <Link to="/frontdesk/register">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Register patient
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's appointments"
          value={today.length}
          icon={CalendarDays}
          tone="primary"
        />
        <StatCard label="Waiting" value={waiting} icon={Hourglass} tone="warning" />
        <StatCard label="In consultation" value={inConsult} icon={Users} tone="info" />
        <StatCard label="Registered today" value={registeredToday} icon={UserPlus} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Live Queue */}
        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Live queue</h3>
          <div className="mt-3 divide-y divide-border">
            {today.slice(0, 6).map((a) => {
              const p = patients.find((x) => x.id === a.patientId);
              const d = doctors.find((x) => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{a.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p?.name ?? '—'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {d?.name} · {format(new Date(a.date), 'p')}
                    </p>
                  </div>
                  <AppointmentStatusChip status={a.status} />
                </div>
              );
            })}
            {today.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No appointments today.
              </p>
            )}
          </div>
        </div>

        {/* Sent to Nurse */}
        <div className="surface-elevated p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-pink-500" />
              Sent to Nurse Station
            </h3>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {pendingQueue.length} pending
            </span>
          </div>
          <div className="divide-y divide-border">
            {pendingQueue.slice(0, 6).map((entry) => {
              const vStatus = vitalsStatusMap[entry.vitalsStatus] ?? vitalsStatusMap.pending;
              return (
                <div key={entry.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {entry.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{entry.patientName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.uhid} · {entry.doctorName} ·{' '}
                      {formatDistanceToNow(new Date(entry.arrivedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      vStatus.color
                    )}
                  >
                    {vStatus.label}
                  </span>
                </div>
              );
            })}
            {pendingQueue.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No patients sent to nurse yet.
              </p>
            )}
          </div>
        </div>

        {/* Doctor Availability */}
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Doctor availability</h3>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {doctors.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-xl border bg-background/60 px-3 py-2.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {d.name.split(' ').slice(-1)[0]?.[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.specialization}</p>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    d.available
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {d.available ? 'Available' : 'Off'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
