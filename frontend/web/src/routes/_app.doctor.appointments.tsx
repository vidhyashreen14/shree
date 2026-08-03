import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { AppointmentStatusChip } from '@/components/common/AppointmentStatusChip';
import { appointments, patients } from '@/lib/mock/data';
import type { Appointment } from '@/lib/types';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCurrentDoctorId } from '@/lib/store/doctors';

export const Route = createFileRoute('/_app/doctor/appointments')({
  component: DoctorAppts,
});

function DoctorAppts() {
  const doctorId = useCurrentDoctorId();
  const all = appointments.filter((a) => a.doctorId === doctorId);
  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [now] = useState(() => Date.now());
  const data = useMemo(() => {
    if (tab === 'completed') return all.filter((a) => a.status === 'completed');
    if (tab === 'cancelled') return all.filter((a) => a.status === 'cancelled');
    return all.filter(
      (a) =>
        new Date(a.date).getTime() >= now - 1000 * 60 * 60 * 24 &&
        a.status !== 'completed' &&
        a.status !== 'cancelled',
    );
  }, [tab, all, now]);

  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        header: 'Token',
        accessorKey: 'token',
        cell: ({ getValue }) => (
          <span className="font-mono font-semibold">#{String(getValue())}</span>
        ),
      },
      {
        header: 'Patient',
        accessorKey: 'patientId',
        cell: ({ getValue }) => {
          const p = patients.find((x) => x.id === getValue());
          return (
            <div>
              <p className="font-medium">{p?.name}</p>
              <p className="text-xs text-muted-foreground">{p?.mrn}</p>
            </div>
          );
        },
      },
      { header: 'Reason', accessorKey: 'reason' },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ getValue }) => <span className="capitalize">{String(getValue())}</span>,
      },
      {
        header: 'When',
        accessorKey: 'date',
        cell: ({ getValue }) => format(new Date(String(getValue())), 'MMM d, p'),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <AppointmentStatusChip status={getValue() as Appointment['status']} />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Your scheduled, completed and cancelled consultations."
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as 'upcoming' | 'completed' | 'cancelled')}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={data} searchPlaceholder="Search by reason, patient…" />
    </>
  );
}
