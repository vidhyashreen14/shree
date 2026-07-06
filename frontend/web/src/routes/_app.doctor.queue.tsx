import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { appointments, patients, doctors } from "@/lib/mock/data";
import { useAuth } from "@/lib/store/auth";
import { isToday, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ChevronRight, Play, X, Hourglass } from "lucide-react";
import type { AppointmentStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/doctor/queue")({
  component: DoctorQueue,
});

function DoctorQueue() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const initial = appointments
    .filter((a) => a.doctorId === doctorId && isToday(new Date(a.date)))
    .sort((a, b) => (a.token ?? 0) - (b.token ?? 0));

  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState<AppointmentStatus | "all">("all");

  const filtered = tab === "all" ? rows : rows.filter((r) => r.status === tab);

  const update = (id: string, status: AppointmentStatus) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(`Marked as ${status}`);
  };

  const counts: Record<string, number> = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        eyebrow="Live queue"
        title="Today's patient queue"
        description={`${rows.length} tokens · auto-refreshes as patients check in`}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as AppointmentStatus | "all")} className="mb-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="checked-in">Waiting ({counts["checked-in"] ?? 0})</TabsTrigger>
          <TabsTrigger value="in-consultation">In consult ({counts["in-consultation"] ?? 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts["completed"] ?? 0})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({counts["cancelled"] ?? 0})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <Hourglass className="mx-auto h-6 w-6 opacity-60" />
            No patients in this state.
          </div>
        )}
        {filtered.map((a) => {
          const p = patients.find((x) => x.id === a.patientId)!;
          return (
            <div key={a.id} className="surface-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">
                #{a.token}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to="/doctor/patients/$id"
                    params={{ id: p.id }}
                    className="font-display text-base font-semibold hover:text-primary hover:underline"
                  >
                    {p.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">{p.mrn}</span>
                  <AppointmentStatusChip status={a.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {p.age}y · {p.gender} · {a.reason} · {format(new Date(a.date), "p")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {a.status !== "in-consultation" && a.status !== "completed" && (
                  <Button size="sm" onClick={() => update(a.id, "in-consultation")}>
                    <Play className="mr-1 h-3.5 w-3.5" /> Start
                  </Button>
                )}
                {a.status === "in-consultation" && (
                  <Button size="sm" variant="default" onClick={() => update(a.id, "completed")}>
                    <Check className="mr-1 h-3.5 w-3.5" /> Complete
                  </Button>
                )}
                {a.status !== "completed" && a.status !== "cancelled" && (
                  <Button size="sm" variant="outline" onClick={() => update(a.id, "cancelled")}>
                    <X className="mr-1 h-3.5 w-3.5" /> Cancel
                  </Button>
                )}
                <Link to="/doctor/patients/$id" params={{ id: p.id }}>
                  <Button size="sm" variant="ghost">
                    Profile <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
