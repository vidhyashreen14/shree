import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { HeartPulse, Hourglass, Users, ClipboardList } from "lucide-react";
import { appointments, patients, doctors, vitals } from "@/lib/mock/data";
import { isToday, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/nurse/")({
  component: NurseOverview,
});

const triageHourly = Array.from({ length: 9 }).map((_, i) => ({
  hour: `${9 + i}:00`,
  triaged: 2 + ((i * 5) % 9),
  pending: Math.max(1, 4 - (i % 4)),
}));

function NurseOverview() {
  const today = appointments.filter((a) => isToday(new Date(a.date)));
  const awaiting = today.filter((a) => a.status === "scheduled" || a.status === "checked-in");

  return (
    <>
      <PageHeader
        eyebrow="Nursing station"
        title="Triage & observation"
        description="Record vitals, flag risks and prep patients for consult."
        actions={<Link to="/nurse/vitals"><Button><HeartPulse className="mr-2 h-4 w-4" /> Record vitals</Button></Link>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Awaiting vitals" value={awaiting.length} icon={Hourglass} tone="warning" />
        <StatCard label="Today's patients" value={today.length} icon={Users} tone="primary" />
        <StatCard label="Vitals recorded" value={vitals.length} icon={HeartPulse} tone="success" />
        <StatCard label="Observation notes" value="14" icon={ClipboardList} tone="info" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Triage throughput today</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={triageHourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="triaged" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="pending" stroke="hsl(var(--warning))" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Awaiting vitals</h3>
            <Link to="/nurse/queue" className="text-xs font-semibold text-primary hover:underline">View queue</Link>
          </div>
          <div className="divide-y divide-border">
            {awaiting.slice(0, 6).map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              const d = doctors.find((x) => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">#{a.token}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.age}y · for {d?.name} · {format(new Date(a.date), "p")}</p>
                  </div>
                  <Link to="/nurse/vitals"><Button size="sm" variant="outline">Take</Button></Link>
                </div>
              );
            })}
            {awaiting.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No one in queue.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
