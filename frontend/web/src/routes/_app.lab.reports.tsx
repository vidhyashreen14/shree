import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { labOrders, patients } from "@/lib/mock/data";
import type { LabOrder } from "@/lib/types";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/lab/reports")({
  component: LabReports,
});

function LabReports() {
  const completed = labOrders.filter((l) => l.status === "completed");
  const columns = useMemo<ColumnDef<LabOrder>[]>(() => [
    { header: "Report", accessorKey: "id", cell: ({ getValue }) => <code className="font-mono text-xs">{String(getValue())}</code> },
    { header: "Patient", accessorKey: "patientId", cell: ({ getValue }) => patients.find((p) => p.id === getValue())?.name },
    { header: "Tests", accessorKey: "tests", cell: ({ getValue }) => (getValue() as string[]).join(", ") },
    { header: "Date", accessorKey: "orderedOn", cell: ({ getValue }) => format(new Date(String(getValue())), "MMM d, yyyy") },
    {
      header: "",
      id: "a",
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 h-3.5 w-3.5" /> PDF</Button>
          <Button size="sm" variant="ghost"><Printer className="h-3.5 w-3.5" /></Button>
        </div>
      ),
    },
  ], []);
  return (
    <>
      <PageHeader title="Completed reports" description="All finalised investigations." />
      <DataTable columns={columns} data={completed} searchPlaceholder="Search reports…" />
    </>
  );
}
