import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { labOrders, patients, doctors } from '@/lib/mock/data';
import type { LabOrder } from '@/lib/types';
import { format } from 'date-fns';
import { useAuth } from '@/lib/store/auth';
import { FlaskConical, Download } from 'lucide-react';

const toneFor: Record<LabOrder['status'], Parameters<typeof StatusChip>[0]['tone']> = {
  ordered: 'info',
  'sample-collected': 'primary',
  'in-progress': 'warning',
  completed: 'success',
};

export const Route = createFileRoute('/_app/doctor/lab-orders')({
  component: DoctorLabs,
});

function DoctorLabs() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === 'doctor' ? user.id : doctors[0]!.id;
  const data = labOrders.filter((l) => l.doctorId === doctorId);

  const columns = useMemo<ColumnDef<LabOrder>[]>(
    () => [
      {
        header: 'Order',
        accessorKey: 'id',
        cell: ({ getValue }) => <code className="font-mono text-xs">{String(getValue())}</code>,
      },
      {
        header: 'Patient',
        accessorKey: 'patientId',
        cell: ({ getValue }) => patients.find((p) => p.id === getValue())?.name,
      },
      {
        header: 'Tests',
        accessorKey: 'tests',
        cell: ({ getValue }) => (getValue() as string[]).join(', '),
      },
      {
        header: 'Ordered',
        accessorKey: 'orderedOn',
        cell: ({ getValue }) => format(new Date(String(getValue())), 'MMM d, yyyy'),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <StatusChip tone={toneFor[getValue() as LabOrder['status']]}>
            {String(getValue())}
          </StatusChip>
        ),
      },
      {
        header: '',
        id: 'a',
        cell: ({ row }) =>
          row.original.status === 'completed' ? (
            <Button size="sm" variant="outline">
              <Download className="mr-1 h-3.5 w-3.5" /> Report
            </Button>
          ) : null,
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Lab orders"
        description="Investigations you've ordered and their current status."
        actions={
          <Button>
            <FlaskConical className="mr-2 h-4 w-4" /> Order new test
          </Button>
        }
      />
      <DataTable columns={columns} data={data} searchPlaceholder="Search by test…" />
    </>
  );
}
