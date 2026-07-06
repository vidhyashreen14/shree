import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { patients, doctors } from "@/lib/mock/data";
import type { Patient } from "@/lib/types";
import { useAuth } from "@/lib/store/auth";
import { StatusChip } from "@/components/common/StatusChip";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/_app/doctor/patients/")({
  component: DoctorPatients,
});

function DoctorPatients() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const data = patients.filter((p) => p.assignedDoctorId === doctorId);

  const columns = useMemo<ColumnDef<Patient>[]>(() => [
    {
      header: "Patient",
      accessorKey: "name",
      cell: ({ row }) => (
        <Link to="/doctor/patients/$id" params={{ id: row.original.id }} className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {row.original.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-medium group-hover:text-primary group-hover:underline">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.mrn}</p>
          </div>
        </Link>
      ),
    },
    { header: "Age / Sex", cell: ({ row }) => `${row.original.age}y · ${row.original.gender}` },
    { header: "Blood", accessorKey: "bloodGroup", cell: ({ getValue }) => <StatusChip tone="danger">{String(getValue())}</StatusChip> },
    { header: "Phone", accessorKey: "phone" },
    {
      header: "Allergies",
      accessorKey: "allergies",
      cell: ({ getValue }) => {
        const a = getValue() as string[];
        return a.length ? <StatusChip tone="warning">{a.join(", ")}</StatusChip> : <span className="text-xs text-muted-foreground">None</span>;
      },
    },
    {
      header: "",
      id: "a",
      cell: ({ row }) => (
        <Link to="/doctor/patients/$id" params={{ id: row.original.id }} className="inline-flex items-center text-xs font-semibold text-primary">
          Open <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ),
    },
  ], []);

  return (
    <>
      <PageHeader title="My patients" description="All patients currently under your care." />
      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search by patient name…" />
    </>
  );
}
