import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { doctors } from "@/lib/mock/data";
import type { Doctor } from "@/lib/types";
import { StatusChip } from "@/components/common/StatusChip";
import { Star } from "lucide-react";

export const Route = createFileRoute("/_app/admin/doctors")({
  component: AdminDoctors,
});

function AdminDoctors() {
  const columns = useMemo<ColumnDef<Doctor>[]>(() => [
    {
      header: "Doctor",
      accessorKey: "name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.specialization}</p>
        </div>
      ),
    },
    { header: "Department", accessorKey: "department" },
    { header: "Experience", accessorKey: "experienceYears", cell: ({ getValue }) => `${getValue()} yrs` },
    { header: "Fee", accessorKey: "fee", cell: ({ getValue }) => `₹${getValue()}` },
    {
      header: "Rating",
      accessorKey: "rating",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1 text-sm font-semibold">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {String(getValue())}
        </span>
      ),
    },
    {
      header: "Availability",
      accessorKey: "available",
      cell: ({ getValue }) => (getValue() ? <StatusChip tone="success">Available</StatusChip> : <StatusChip tone="neutral">Off duty</StatusChip>),
    },
  ], []);

  return (
    <>
      <PageHeader title="Doctors" description="All physicians registered in the hospital." />
      <DataTable columns={columns} data={doctors} searchPlaceholder="Search by name, specialty…" />
    </>
  );
}
