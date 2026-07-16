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
import {
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  X,
  Hourglass,
  Heart,
  CalendarDays,
  Clock,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  LayoutList,
  AlignJustify,
} from "lucide-react";
import type { AppointmentStatus } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/doctor/queue")({
  component: DoctorQueue,
});

// ─── Priority config per status ──────────────────────────────────────────────
const priorityOrder: Record<string, number> = {
  "in-consultation": 0,
  "checked-in": 1,
  scheduled: 2,
  completed: 3,
  cancelled: 4,
  "no-show": 5,
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function QueueStatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: "primary" | "amber" | "emerald" | "red";
}) {
  const colorMap = {
    primary: {
      bg: "bg-primary/8 dark:bg-primary/15",
      icon: "text-primary",
      value: "text-primary",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      icon: "text-amber-600 dark:text-amber-400",
      value: "text-amber-700 dark:text-amber-300",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      icon: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/30",
      icon: "text-red-600 dark:text-red-400",
      value: "text-red-700 dark:text-red-300",
    },
  };
  const c = colorMap[color];
  return (
    <div className={`surface-elevated flex items-center gap-4 p-4 ${c.bg} border-0`}>
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/60 dark:bg-white/5 ${c.icon}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className={`font-display text-2xl font-bold leading-none ${c.value}`}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ─── Personalization Toggle ───────────────────────────────────────────────────
function PersonalizationRow({
  compact,
  setCompact,
  showVitalsFirst,
  setShowVitalsFirst,
}: {
  compact: boolean;
  setCompact: (v: boolean) => void;
  showVitalsFirst: boolean;
  setShowVitalsFirst: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Customize View
      </span>
      <div className="ml-auto flex flex-wrap gap-2">
        <button
          onClick={() => setCompact(!compact)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            compact
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground border border-border hover:bg-muted"
          }`}
          aria-pressed={compact}
          id="btn-compact-mode"
        >
          {compact ? <AlignJustify className="h-3 w-3" /> : <LayoutList className="h-3 w-3" />}
          Compact
        </button>
        <button
          onClick={() => setShowVitalsFirst(!showVitalsFirst)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            showVitalsFirst
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground border border-border hover:bg-muted"
          }`}
          aria-pressed={showVitalsFirst}
          id="btn-vitals-first"
        >
          <Heart className="h-3 w-3" />
          Vitals first
        </button>
      </div>
    </div>
  );
}

// ─── Vitals Panel ─────────────────────────────────────────────────────────────
function VitalsPanel({ vitals }: { vitals: NonNullable<any> }) {
  return (
    <div className="mt-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/15 border border-teal-100/70 dark:border-teal-900/30 p-3.5 text-xs text-foreground">
      <div className="flex items-center gap-2 mb-2.5">
        <Heart className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
        <span className="font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider text-[10px]">
          Nurse Intake Summary
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-teal-100/50 dark:border-teal-900/20 pb-2.5">
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">BP &amp; Pulse</span>
          <span className="font-semibold">{vitals.bp} mmHg · {vitals.pulse} bpm</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">Temp &amp; SpO₂</span>
          <span className="font-semibold">{vitals.tempF}°F · {vitals.spo2}%</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">Height &amp; Weight</span>
          <span className="font-semibold">{vitals.height} cm · {vitals.weight} kg</span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">BMI</span>
          <span className="font-semibold">
            {vitals.bmi}{" "}
            <span className="text-muted-foreground font-normal">
              ({Number(vitals.bmi) < 18.5
                ? "Underweight"
                : Number(vitals.bmi) < 25
                ? "Normal"
                : Number(vitals.bmi) < 30
                ? "Overweight"
                : "Obese"})
            </span>
          </span>
        </div>
      </div>
      {vitals.sugar && (
        <div className="mt-2">
          <span className="text-muted-foreground">Blood Sugar: </span>
          <span className="font-semibold">{vitals.sugar} mg/dL</span>
        </div>
      )}
      <div className="mt-2 italic text-teal-800 dark:text-teal-200">
        "{vitals.chiefComplaint}"
      </div>
    </div>
  );
}

// ─── Patient Queue Card ───────────────────────────────────────────────────────
function PatientQueueCard({
  a,
  patient,
  compact,
  showVitalsFirst,
  onUpdate,
}: {
  a: any;
  patient: any;
  compact: boolean;
  showVitalsFirst: boolean;
  onUpdate: (id: string, status: AppointmentStatus) => void;
}) {
  const isActive = a.status === "in-consultation";
  const [expanded, setExpanded] = useState(isActive);

  const hasVitals = Boolean(a.vitals);
  const isLive = "isLive" in a && a.isLive;

  // Derive a "pending lab" demo flag for checked-in patients with vitals
  const showPendingLab = a.status === "checked-in" && hasVitals;

  const cardBorderClass =
    a.status === "in-consultation"
      ? "border-primary/50 ring-1 ring-primary/20"
      : a.status === "checked-in"
      ? "border-amber-300/60 dark:border-amber-700/40"
      : "border-border";

  return (
    <div
      className={`surface-elevated flex flex-col gap-0 overflow-hidden transition-shadow hover:shadow-md ${cardBorderClass}`}
      id={`patient-card-${a.id}`}
    >
      {/* ── Card Header (always visible) ─────────────────────────────── */}
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-center justify-between ${compact ? "p-3" : "p-5"}`}
      >
        {/* Left: token + name + badges */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className={`grid shrink-0 place-items-center rounded-xl bg-primary/10 font-display font-bold text-primary ${compact ? "h-10 w-10 text-sm" : "h-13 w-13 text-lg"}`}
          >
            #{a.token}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/doctor/patients/$id"
                params={{ id: patient.id }}
                className={`font-display font-bold hover:text-primary hover:underline transition-colors ${compact ? "text-sm" : "text-base"}`}
              >
                {patient.name}
              </Link>
              <span className="text-xs text-muted-foreground">{patient.mrn}</span>
              {/* Primary status badge */}
              <AppointmentStatusChip status={a.status} />
              {/* Pending Lab badge */}
              {showPendingLab && (
                <AppointmentStatusChip status="pending-lab" />
              )}
              {/* Live Triage badge */}
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
                  Live Triage
                </span>
              )}
            </div>
            {!compact && (
              <p className="mt-1 text-xs text-muted-foreground">
                {patient.age}y · {patient.gender} · {a.reason} ·{" "}
                <Clock className="inline h-3 w-3 -mt-px" />{" "}
                {format(new Date(a.date), "p")}
              </p>
            )}
          </div>
        </div>

        {/* Right: actions + expand toggle */}
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          {/* Quick actions */}
          {a.status !== "in-consultation" &&
            a.status !== "completed" &&
            a.status !== "cancelled" && (
              <Button
                size="sm"
                onClick={() => onUpdate(a.id, "in-consultation")}
                id={`btn-start-${a.id}`}
              >
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Start
              </Button>
            )}
          {a.status === "in-consultation" && (
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => onUpdate(a.id, "completed")}
              id={`btn-complete-${a.id}`}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Complete
            </Button>
          )}
          {a.status !== "completed" && a.status !== "cancelled" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Reschedule flow coming soon")}
              id={`btn-reschedule-${a.id}`}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reschedule
            </Button>
          )}
          <Link to="/doctor/patients/$id" params={{ id: patient.id }}>
            <Button
              size="sm"
              variant="ghost"
              id={`btn-report-${a.id}`}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              View Report
            </Button>
          </Link>
          {a.status !== "completed" && a.status !== "cancelled" && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onUpdate(a.id, "cancelled")}
              id={`btn-cancel-${a.id}`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Expand toggle */}
          {(hasVitals || compact) && (
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls={`expand-${a.id}`}
              className="ml-1 grid h-7 w-7 place-items-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted"
              id={`btn-expand-${a.id}`}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Expandable details ───────────────────────────────────────── */}
      {expanded && (
        <div
          id={`expand-${a.id}`}
          className={`border-t border-border ${compact ? "px-3 pb-3" : "px-5 pb-5"}`}
        >
          {/* Compact mode shows the detail row */}
          {compact && (
            <p className="mt-3 text-xs text-muted-foreground">
              {patient.age}y · {patient.gender} · {a.reason} ·{" "}
              <Clock className="inline h-3 w-3 -mt-px" />{" "}
              {format(new Date(a.date), "p")}
            </p>
          )}
          {/* Vitals (order depends on preference) */}
          {hasVitals && (
            <div className={showVitalsFirst ? "" : "mt-0"}>
              <VitalsPanel vitals={a.vitals} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function DoctorQueue() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const patients = usePatients((s) => s.patients);
  const queue = useNurseQueue((s) => s.queue);
  const markConsultStatus = useNurseQueue((s) => s.markConsultStatus);

  // Personalization state
  const [compact, setCompact] = useState(false);
  const [showVitalsFirst, setShowVitalsFirst] = useState(false);

  // Mock appointments
  const initialMock = appointments
    .filter((a) => a.doctorId === doctorId && isToday(new Date(a.date)))
    .sort((a, b) => (a.token ?? 0) - (b.token ?? 0));
  const [rows, setRows] = useState(initialMock);
  const [tab, setTab] = useState<AppointmentStatus | "all">("all");

  // Live nurse queue
  const liveQueue = queue.filter(
    (e) => e.doctorId === doctorId && e.vitalsStatus === "done"
  );
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
    ...liveRows,
  ].sort(
    (a, b) =>
      (priorityOrder[a.status] ?? 99) - (priorityOrder[b.status] ?? 99)
  );

  const filtered =
    tab === "all"
      ? combinedRows
      : combinedRows.filter((r) => r.status === tab);

  const update = (id: string, status: AppointmentStatus) => {
    if (id.startsWith("nq-")) {
      const statusMap: Record<
        string,
        "waiting" | "in-consultation" | "completed" | "cancelled"
      > = {
        "checked-in": "waiting",
        "in-consultation": "in-consultation",
        completed: "completed",
        cancelled: "cancelled",
      };
      markConsultStatus(id, statusMap[status] || "waiting");
    } else {
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    }
    toast.success(`Marked as ${status}`);
  };

  const counts: Record<string, number> = combinedRows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <>
      <PageHeader
        eyebrow="Live queue"
        title="Today's patient queue"
        description={`${combinedRows.length} tokens · auto-refreshes as patients check in`}
      />

      {/* ── Stat Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
        <QueueStatCard
          label="Total Today"
          value={combinedRows.length}
          icon={CalendarDays}
          color="primary"
        />
        <QueueStatCard
          label="Waiting"
          value={counts["checked-in"] ?? 0}
          icon={Hourglass}
          color="amber"
        />
        <QueueStatCard
          label="Completed"
          value={counts["completed"] ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <QueueStatCard
          label="Pending Labs"
          value={4}
          icon={FlaskConical}
          color="red"
        />
      </div>

      {/* ── Personalization ──────────────────────────────────────────── */}
      <PersonalizationRow
        compact={compact}
        setCompact={setCompact}
        showVitalsFirst={showVitalsFirst}
        setShowVitalsFirst={setShowVitalsFirst}
      />

      {/* ── Filter Tabs ──────────────────────────────────────────────── */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as AppointmentStatus | "all")}
        className="mt-4 mb-3"
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({combinedRows.length})</TabsTrigger>
          <TabsTrigger value="checked-in">
            ⏳ Waiting ({counts["checked-in"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="in-consultation">
            🩺 In consult ({counts["in-consultation"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            ✅ Completed ({counts["completed"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            🚫 Cancelled ({counts["cancelled"] ?? 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── Queue List ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            <Hourglass className="mx-auto h-7 w-7 opacity-50 mb-3" />
            <p className="font-medium">No patients in this state</p>
            <p className="text-xs mt-1 opacity-70">
              They'll appear here automatically when checked in.
            </p>
          </div>
        )}
        {filtered.map((a) => {
          const p = patients.find((x) => x.id === a.patientId);
          if (!p) return null;
          return (
            <PatientQueueCard
              key={a.id}
              a={a}
              patient={p}
              compact={compact}
              showVitalsFirst={showVitalsFirst}
              onUpdate={update}
            />
          );
        })}
      </div>
    </>
  );
}
