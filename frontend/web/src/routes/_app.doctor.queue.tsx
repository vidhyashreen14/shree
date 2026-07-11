import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { appointments, doctors } from "@/lib/mock/data";
import { useAuth } from "@/lib/store/auth";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { usePatients } from "@/lib/store/patients";
import { isToday, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ChevronRight, Play, X, Hourglass, Heart } from "lucide-react";
import type { AppointmentStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/doctor/queue")({
  component: DoctorQueue,
});

function DoctorQueue() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const patients = usePatients((s) => s.patients);
  const queue = useNurseQueue((s) => s.queue);
  const markConsultStatus = useNurseQueue((s) => s.markConsultStatus);

  // Load static mock appointments for this doctor
  const initialMock = appointments
    .filter((a) => a.doctorId === doctorId && isToday(new Date(a.date)))
    .sort((a, b) => (a.token ?? 0) - (b.token ?? 0));

  const [rows, setRows] = useState(initialMock);
  const [tab, setTab] = useState<AppointmentStatus | "all">("all");

  // Load nurse queue entries for this doctor that are ready for consultation
  const liveQueue = queue.filter(
    (e) => e.doctorId === doctorId && e.vitalsStatus === "done"
  );

  // Map live queue entries to appointments structure
  const liveRows = liveQueue.map((e) => ({
    id: e.id,
    patientId: e.patientId,
    doctorId: e.doctorId,
    date: e.arrivedAt,
    durationMin: 15,
    reason: e.vitals?.chiefComplaint || "OPD Consultation",
    type: e.isNewPatient ? ("walk-in" as const) : ("consultation" as const),
    status: (e.consultStatus === "waiting" || !e.consultStatus
      ? "checked-in"
      : e.consultStatus) as AppointmentStatus,
    token: 100 + Number(e.id.slice(-3)) || 101,
    isLive: true,
    vitals: e.vitals,
  }));

  const combinedRows = [
    ...rows.map((r) => ({ ...r, vitals: undefined as any, isLive: false })),
    ...liveRows
  ];
  const filtered = tab === "all" ? combinedRows : combinedRows.filter((r) => r.status === tab);

  const update = (id: string, status: AppointmentStatus) => {
    if (id.startsWith("nq-")) {
      // Live queue entry
      const statusMap: Record<string, "waiting" | "in-consultation" | "completed" | "cancelled"> = {
        "checked-in": "waiting",
        "in-consultation": "in-consultation",
        "completed": "completed",
        "cancelled": "cancelled",
      };
      markConsultStatus(id, statusMap[status] || "waiting");
    } else {
      // Mock appointment
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    }
    toast.success(`Marked as ${status}`);
  };

  const counts: Record<string, number> = combinedRows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <PageHeader
        eyebrow="Live queue"
        title="Today's patient queue"
        description={`${combinedRows.length} tokens · auto-refreshes as patients check in`}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as AppointmentStatus | "all")} className="mb-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({combinedRows.length})</TabsTrigger>
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
          const p = patients.find((x) => x.id === a.patientId);
          if (!p) return null;
          return (
            <div key={a.id} className="surface-elevated flex flex-col gap-3 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
                <div className="flex items-center gap-3">
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
                      {"isLive" in a && (
                        <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                          Live Triage
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.age}y · {p.gender} · {a.reason} · {format(new Date(a.date), "p")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 self-end sm:self-center">
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

              {/* Recorded Vitals Section */}
              {a.vitals && (
                <div className="mt-1 rounded-xl bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100/70 dark:border-teal-900/30 p-3.5 text-xs text-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider text-[10px]">
                      Nurse Intake Summary
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-teal-100/50 pb-2">
                    <div>
                      <span className="text-muted-foreground block">BP &amp; Pulse</span>
                      <span className="font-semibold">{a.vitals.bp} mmHg · {a.vitals.pulse} bpm</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Temp &amp; SpO₂</span>
                      <span className="font-semibold">{a.vitals.tempF}°F · {a.vitals.spo2}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Height &amp; Weight</span>
                      <span className="font-semibold">{a.vitals.height} cm · {a.vitals.weight} kg</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">BMI</span>
                      <span className="font-semibold">{a.vitals.bmi} ({
                        Number(a.vitals.bmi) < 18.5 ? "Underweight" :
                        Number(a.vitals.bmi) < 25 ? "Normal" :
                        Number(a.vitals.bmi) < 30 ? "Overweight" : "Obese"
                      })</span>
                    </div>
                  </div>

                  {a.vitals.sugar && (
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Blood Sugar: </span>
                      <span className="font-semibold">{a.vitals.sugar} mg/dL</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs">
                    <span className="text-muted-foreground font-semibold">Chief Complaint: </span>
                    <span className="italic font-medium text-teal-950 dark:text-teal-200">
                      "{a.vitals.chiefComplaint}"
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
