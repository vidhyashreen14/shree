import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { ChevronRight } from 'lucide-react';
import { usePatients } from '@/lib/store/patients';
import { useCurrentDoctorId } from '@/lib/store/doctors';
import type { Patient } from '@/lib/types';

export const Route = createFileRoute('/_app/doctor/patients/')({
  component: DoctorPatients,
});

function DoctorPatients() {
  const doctorId = useCurrentDoctorId();
  const patients = usePatients((s) => s.patients);
  const data = patients.filter((p) => p.assignedDoctorId === doctorId);

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
<<<<<<< HEAD
        header: "Patient",
        accessorKey: "name",
=======
        header: 'Patient',
        accessorKey: 'name',
>>>>>>> a821a0c (second update)
        cell: ({ row }) => (
          <Link
            to="/doctor/patients/$id"
            params={{ id: row.original.id }}
            className="group flex items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {row.original.name
<<<<<<< HEAD
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
=======
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
>>>>>>> a821a0c (second update)
            </span>
            <div>
              <p className="font-medium group-hover:text-primary group-hover:underline">
                {row.original.name}
              </p>
              <p className="text-xs text-muted-foreground">{row.original.mrn}</p>
            </div>
          </Link>
        ),
      },
<<<<<<< HEAD
      { header: "Age / Sex", cell: ({ row }) => `${row.original.age}y · ${row.original.gender}` },
      {
        header: "Blood",
        accessorKey: "bloodGroup",
        cell: ({ getValue }) => <StatusChip tone="danger">{String(getValue())}</StatusChip>,
      },
      { header: "Phone", accessorKey: "phone" },
      {
        header: "Allergies",
        accessorKey: "allergies",
        cell: ({ getValue }) => {
          const a = getValue() as string[];
          return a.length ? (
            <StatusChip tone="warning">{a.join(", ")}</StatusChip>
=======
      { header: 'Age / Sex', cell: ({ row }) => `${row.original.age}y · ${row.original.gender}` },
      {
        header: 'Blood',
        accessorKey: 'bloodGroup',
        cell: ({ getValue }) => <StatusChip tone="danger">{String(getValue())}</StatusChip>,
      },
      { header: 'Phone', accessorKey: 'phone' },
      {
        header: 'Allergies',
        accessorKey: 'allergies',
        cell: ({ getValue }) => {
          const a = getValue() as string[];
          return a.length ? (
            <StatusChip tone="warning">{a.join(', ')}</StatusChip>
>>>>>>> a821a0c (second update)
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          );
        },
      },
      {
<<<<<<< HEAD
        header: "",
        id: "a",
=======
        header: '',
        id: 'a',
>>>>>>> a821a0c (second update)
        cell: ({ row }) => (
          <Link
            to="/doctor/patients/$id"
            params={{ id: row.original.id }}
            className="inline-flex items-center text-xs font-semibold text-primary"
          >
            Open <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ),
      },
    ],
<<<<<<< HEAD
    []
=======
    [],
>>>>>>> a821a0c (second update)
  );

  return (
    <>
      <PageHeader title="My patients" description="All patients currently under your care." />
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search by patient name…"
      />
    </>
  );
}
