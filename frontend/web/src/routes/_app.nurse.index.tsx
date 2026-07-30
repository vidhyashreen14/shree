import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { HeartPulse, Hourglass, Users, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { appointments, patients as mockPatients, doctors, vitals } from "@/lib/mock/data";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { isToday, format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/nurse/")({
  head: () => ({
    meta: [
      { title: "Nurse Dashboard · MediCore" },
      { name: "description", content: "Record vitals, flag risks and prep patients for consult." },
    ],
  }),
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { queue, markVitalsStatus } = useNurseQueue();
  const pendingQueue = queue.filter((e) => e.vitalsStatus === "pending");
  const inProgressQueue = queue.filter((e) => e.vitalsStatus === "in-progress");
  const freshQueue = [...inProgressQueue, ...pendingQueue]; // in-progress first

  return (
    <>
      <PageHeader
        eyebrow="Nursing station"
        title="Triage & observation"
        description="Record vitals, flag risks and prep patients for consult."
        actions={
          <Link to="/nurse/vitals" search={{}}>
            <Button>
              <HeartPulse className="mr-2 h-4 w-4" /> Record vitals
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting vitals (reception)"
          value={freshQueue.length}
          icon={Hourglass}
          tone="warning"
        />
        <StatCard label="Today's patients" value={today.length} icon={Users} tone="primary" />
        <StatCard label="Vitals recorded" value={vitals.length} icon={HeartPulse} tone="success" />
        <StatCard label="Observation notes" value="14" icon={ClipboardList} tone="info" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Triage chart */}
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Triage throughput today</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={triageHourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="triaged"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reception queue — pushed by front desk */}
        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">From Reception</h3>
            {freshQueue.length > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                {freshQueue.length} waiting
              </span>
            )}
          </div>
          <div className="divide-y divide-border">
            {freshQueue.slice(0, 8).map((entry) => (
              <div key={entry.id} className="py-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {entry.patientName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{entry.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.uhid} · {entry.age}y · {entry.gender}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.doctorName} · {entry.department}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(entry.arrivedAt), { addSuffix: true })}
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.5 font-semibold",
                          entry.isNewPatient
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {entry.isNewPatient ? "New" : "Return"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {entry.vitalsStatus === "pending" && (
                    <Link to="/nurse/vitals" search={{ queueId: entry.id }} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                        Start vitals
                      </Button>
                    </Link>
                  )}
                  {entry.vitalsStatus === "in-progress" && (
                    <>
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <HeartPulse className="h-3 w-3" /> In progress
                      </span>
                      <Link to="/nurse/vitals" search={{ queueId: entry.id }} className="flex-1">
                        <Button size="sm" className="w-full h-7 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Enter vitals
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
            {freshQueue.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No patients from reception yet.
              </p>
            )}
          </div>
          {freshQueue.length > 0 && (
            <Link
              to="/nurse/queue"
              className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
            >
              View full queue
            </Link>
          )}
        </div>
      </div>

      {/* Existing awaiting vitals panel */}
      <div className="mt-4 surface-elevated p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display font-semibold">Scheduled — Awaiting vitals</h3>
          <Link to="/nurse/queue" className="text-xs font-semibold text-primary hover:underline">
            View queue
          </Link>
        </div>
        <div className="divide-y divide-border">
          {awaiting.slice(0, 6).map((a) => {
            const p = mockPatients.find((x) => x.id === a.patientId)!;
            const d = doctors.find((x) => x.id === a.doctorId);
            return (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  #{a.token}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.age}y · for {d?.name} · {format(new Date(a.date), "p")}
                  </p>
                </div>
                <Link to="/nurse/vitals" search={{ patientId: p.id }}>
                  <Button size="sm" variant="outline">
                    Take
                  </Button>
                </Link>
              </div>
            );
          })}
          {awaiting.length === 0 && (
            <p className="py-6 text-center text-xs text-muted-foreground">No one in queue.</p>
          )}
        </div>
      </div>
    </>
  );
}
