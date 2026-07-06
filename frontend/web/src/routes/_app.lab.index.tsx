import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { labOrders, patients } from "@/lib/mock/data";
import { Beaker, FileCheck2, FilePlus2, FlaskConical, Hourglass } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusChip } from "@/components/common/StatusChip";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/lab/")({
  component: LabOverview,
});

const throughput = [
  { day: "Mon", samples: 38, reports: 31 },
  { day: "Tue", samples: 42, reports: 36 },
  { day: "Wed", samples: 55, reports: 49 },
  { day: "Thu", samples: 47, reports: 44 },
  { day: "Fri", samples: 61, reports: 52 },
  { day: "Sat", samples: 33, reports: 30 },
  { day: "Sun", samples: 22, reports: 19 },
];

const tone = {
  ordered: "info",
  "sample-collected": "warning",
  "in-progress": "primary",
  completed: "success",
} as const;

function LabOverview() {
  const pending = labOrders.filter((l) => l.status !== "completed");
  const completed = labOrders.filter((l) => l.status === "completed");

  return (
    <>
      <PageHeader
        eyebrow="Laboratory"
        title="Investigations control room"
        description="Sample pipeline, turnaround time and report uploads."
        actions={
          <Link to="/lab/upload"><Button><FilePlus2 className="mr-2 h-4 w-4" /> Upload report</Button></Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending samples" value={pending.length} icon={Hourglass} tone="warning" />
        <StatCard label="In progress" value={labOrders.filter((l) => l.status === "in-progress").length} icon={FlaskConical} tone="info" />
        <StatCard label="Reports today" value={completed.length} icon={FileCheck2} tone="success" />
        <StatCard label="Avg TAT" value="3.2h" icon={Beaker} tone="primary" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Sample throughput</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughput}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="samples" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reports" fill="hsl(var(--info))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Pending pipeline</h3>
            <Link to="/lab/pending" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {pending.slice(0, 6).map((l) => {
              const p = patients.find((x) => x.id === l.patientId);
              return (
                <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p?.name}</p>
                    <p className="text-xs text-muted-foreground">{l.tests.join(", ")} · {format(new Date(l.orderedOn), "MMM d")}</p>
                  </div>
                  <StatusChip tone={tone[l.status]}>{l.status.replace("-", " ")}</StatusChip>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
