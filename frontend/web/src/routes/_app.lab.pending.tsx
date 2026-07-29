import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
import { labOrders, patients } from "@/lib/mock/data";
import type { LabOrder } from "@/lib/types";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Beaker } from "lucide-react";

const toneFor: Record<LabOrder["status"], Parameters<typeof StatusChip>[0]["tone"]> = {
  ordered: "info",
  "sample-collected": "primary",
  "in-progress": "warning",
  completed: "success",
};

export const Route = createFileRoute("/_app/lab/pending")({
  component: LabPending,
});

function LabPending() {
  const [tab, setTab] = useState<LabOrder["status"] | "all">("all");
  const filtered = useMemo(
    () =>
      tab === "all"
        ? labOrders.filter((l) => l.status !== "completed")
        : labOrders.filter((l) => l.status === tab),
    [tab]
  );

  const columns = useMemo<ColumnDef<LabOrder>[]>(
    () => [
      {
        header: "Order",
        accessorKey: "id",
        cell: ({ getValue }) => <code className="font-mono text-xs">{String(getValue())}</code>,
      },
      {
        header: "Patient",
        accessorKey: "patientId",
        cell: ({ getValue }) => patients.find((p) => p.id === getValue())?.name,
      },
      {
        header: "Tests",
        accessorKey: "tests",
        cell: ({ getValue }) => (getValue() as string[]).join(", "),
      },
      {
        header: "Ordered",
        accessorKey: "orderedOn",
        cell: ({ getValue }) => format(new Date(String(getValue())), "MMM d, p"),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => (
          <StatusChip tone={toneFor[getValue() as LabOrder["status"]]}>
            {String(getValue())}
          </StatusChip>
        ),
      },
      {
        header: "",
        id: "a",
        cell: () => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.success("Marked sample collected")}
          >
            <Beaker className="mr-1 h-3.5 w-3.5" /> Collect sample
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader title="Pending tests" description="Sample collection and in-progress investigations." />
      <Tabs value={tab} onValueChange={(v) => setTab(v as LabOrder["status"] | "all")} className="mb-4">
        <TabsList className="cir-tabs h-auto p-1.5 border border-border bg-card">
          <TabsTrigger value="all" className="cir-tabs__t">All pending</TabsTrigger>
          <TabsTrigger value="ordered" className="cir-tabs__t">Ordered</TabsTrigger>
          <TabsTrigger value="sample-collected" className="cir-tabs__t">Sample collected</TabsTrigger>
          <TabsTrigger value="in-progress" className="cir-tabs__t">In progress</TabsTrigger>
        </TabsList>
      </Tabs>
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search by patient, test…" />
    </>
  );
}
