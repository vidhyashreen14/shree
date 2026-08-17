import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/common/StatusChip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Users,
  Stethoscope,
  HeartPulse,
  Pill,
  FlaskConical,
  Shield,
  Monitor,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCredentials } from '@/lib/store/credentials';
import { useAuth } from '@/lib/store/auth';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

const ALL_MONITOR_ROLES: {
  value: Role;
  label: string;
  icon: typeof Shield;
  color: string;
  path: string;
  description: string;
  stats: { label: string; value: string }[];
}[] = [
  {
    value: 'frontdesk',
    label: 'Front Desk',
    icon: Users,
    color: 'from-blue-500 to-blue-700',
    path: '/frontdesk',
    description: 'Patient registration, appointments & queue management',
    stats: [
      { label: "Today's check-ins", value: '47' },
      { label: 'Queue', value: '12' },
    ],
  },
  {
    value: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    color: 'from-emerald-500 to-emerald-700',
    path: '/doctor',
    description: 'Patient consultations, prescriptions & lab orders',
    stats: [
      { label: 'In queue', value: '8' },
      { label: 'Completed', value: '23' },
    ],
  },
  {
    value: 'nurse',
    label: 'Nurse',
    icon: HeartPulse,
    color: 'from-pink-500 to-pink-700',
    path: '/nurse',
    description: 'Vitals recording, patient observations & triage',
    stats: [
      { label: 'Vitals recorded', value: '31' },
      { label: 'Pending', value: '5' },
    ],
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    color: 'from-amber-500 to-amber-700',
    path: '/pharmacy',
    description: 'Medicine dispensing, inventory & billing',
    stats: [
      { label: 'Orders today', value: '64' },
      { label: 'Low stock', value: '3' },
    ],
  },
  {
    value: 'lab',
    label: 'Laboratory',
    icon: FlaskConical,
    color: 'from-violet-500 to-violet-700',
    path: '/lab',
    description: 'Lab tests, reports upload & pending work',
    stats: [
      { label: 'Pending tests', value: '14' },
      { label: 'Completed', value: '36' },
    ],
  },
];

export const Route = createFileRoute('/_app/admin/monitor')({
  head: () => ({
    meta: [
      { title: 'Monitor Dashboards · MediCore Admin' },
      { name: 'description', content: 'Observe staff dashboards in real time.' },
    ],
  }),
  component: MonitorDashboardsPage,
});

function MonitorModal({
  role,
  onClose,
}: {
  role: (typeof ALL_MONITOR_ROLES)[0] | null;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);

  if (!role) return null;
  const Icon = role.icon;

  const openDashboard = () => {
    navigate({ to: role.path as '/' });
    onClose();
  };

  return (
    <Dialog open={!!role} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br text-white',
                role.color
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            {role.label} Dashboard
          </DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3">
          {role.stats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-muted/30 p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Info about admin monitor access */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
          <p className="font-semibold">Admin Monitor Mode</p>
          <p className="mt-0.5 text-xs opacity-80">
            As <span className="font-semibold">{user?.name}</span> (Admin), you have read access to
            all dashboards. Click "Open Dashboard" to navigate and inspect the full {role.label}{' '}
            view.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={openDashboard} id={`btn-monitor-${role.value}`}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MonitorDashboardsPage() {
  const [monitorRole, setMonitorRole] = useState<(typeof ALL_MONITOR_ROLES)[0] | null>(null);
  const accounts = useCredentials((s) => s.accounts);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Monitor Dashboards"
        description="Observe and inspect staff dashboards in real time with admin monitoring rights."
      />

      <MonitorModal role={monitorRole} onClose={() => setMonitorRole(null)} />

      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
        <strong>Admin Monitor Mode</strong> — As admin, you can open any staff dashboard to observe
        their workflow in real time. Your admin session remains active.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ALL_MONITOR_ROLES.map((role) => {
          const Icon = role.icon;
          const staffCount = accounts.filter(
            (a) => a.role === role.value && a.status === 'active'
          ).length;
          return (
            <div
              key={role.value}
              className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
            >
              {/* gradient accent */}
              <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', role.color)} />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm',
                      role.color
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold">{role.label}</h3>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {role.stats.map((s) => (
                  <div key={s.label} className="rounded-lg bg-muted/50 px-3 py-2">
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Staff count badge */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {staffCount > 0 ? (
                    <span className="font-medium text-emerald-600">{staffCount} active staff</span>
                  ) : (
                    <span className="text-amber-600">No accounts created yet</span>
                  )}
                </span>
                <StatusChip tone="success">Live</StatusChip>
              </div>

              <Button
                className="mt-4 w-full gap-2"
                variant="outline"
                id={`btn-open-monitor-${role.value}`}
                onClick={() => setMonitorRole(role)}
              >
                <Monitor className="h-4 w-4" />
                Open Monitor
                <ArrowRight className="ml-auto h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
