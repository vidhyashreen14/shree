<<<<<<< HEAD
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
=======
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { doctors } from '@/lib/mock/data';
import { usePatients } from '@/lib/store/patients';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardPlus, Plus, Trash2 } from 'lucide-react';
import { useCurrentDoctorId } from '@/lib/store/doctors';
import type { Prescription, Patient } from '@/lib/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicalStore } from '@/lib/store/clinical';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  PrescriptionPrintModal,
  getDoctorDetails,
  type PrescriptionPrintData,
} from './_app.doctor.patients.$id';
import { useAuth } from '@/lib/store/auth';
import { useStaffProfiles } from '@/lib/store/staffProfiles';
>>>>>>> a821a0c (second update)

export const Route = createFileRoute('/_app/doctor/queue')({
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
        <p className={`font-display text-2xl font-bold leading-none ${c.value}`}>{value}</p>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">
            BP &amp; Pulse
          </span>
          <span className="font-semibold">
            {vitals.bp} mmHg · {vitals.pulse} bpm
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">
            Temp &amp; SpO₂
          </span>
          <span className="font-semibold">
            {vitals.tempF}°F · {vitals.spo2}%
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">
            Height &amp; Weight
          </span>
          <span className="font-semibold">
            {vitals.height} cm · {vitals.weight} kg
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[10px] uppercase tracking-wide mb-0.5">
            BMI
          </span>
          <span className="font-semibold">
            {vitals.bmi}{" "}
            <span className="text-muted-foreground font-normal">
              (
              {Number(vitals.bmi) < 18.5
                ? "Underweight"
                : Number(vitals.bmi) < 25
                  ? "Normal"
                  : Number(vitals.bmi) < 30
                    ? "Overweight"
                    : "Obese"}
              )
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
      <div className="mt-2 italic text-teal-800 dark:text-teal-200">"{vitals.chiefComplaint}"</div>
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              {showPendingLab && <AppointmentStatusChip status="pending-lab" />}
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
                <Clock className="inline h-3 w-3 -mt-px" /> {format(new Date(a.date), "p")}
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
            <Button size="sm" variant="ghost" id={`btn-report-${a.id}`}>
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
              <Clock className="inline h-3 w-3 -mt-px" /> {format(new Date(a.date), "p")}
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
  const staffProfiles = useStaffProfiles((s) => s.profiles);
  const doctorId = useCurrentDoctorId();
  const patients = usePatients((s) => s.patients);
  const addPatient = usePatients((s) => s.addPatient);
  const addPrescription = useClinicalStore((s) => s.addPrescription);

<<<<<<< HEAD
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
  const liveQueue = queue.filter((e) => e.doctorId === doctorId && e.vitalsStatus === "done");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...rows.map((r) => ({ ...r, vitals: undefined as any, isLive: false })),
    ...liveRows,
  ].sort((a, b) => (priorityOrder[a.status] ?? 99) - (priorityOrder[b.status] ?? 99));

  const filtered = tab === "all" ? combinedRows : combinedRows.filter((r) => r.status === tab);

  const update = (id: string, status: AppointmentStatus) => {
    if (id.startsWith("nq-")) {
      const statusMap: Record<string, "waiting" | "in-consultation" | "completed" | "cancelled"> = {
        "checked-in": "waiting",
        "in-consultation": "in-consultation",
        completed: "completed",
        cancelled: "cancelled",
      };
      markConsultStatus(id, statusMap[status] || "waiting");
    } else {
      setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
=======
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientAgeInput, setPatientAgeInput] = useState('');
  const [patientGenderInput, setPatientGenderInput] = useState('Male');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [meds, setMeds] = useState([
    { name: '', dose: '1 tab', frequency: '1-0-1', duration: '5 days', notes: 'After food' },
  ]);
  const [printData, setPrintData] = useState<PrescriptionPrintData | null>(null);

  const handleIssueDetailedPrescription = () => {
    if (!patientNameInput.trim()) {
      toast.error('Please enter patient name.');
      return;
    }
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis.');
      return;
>>>>>>> a821a0c (second update)
    }

<<<<<<< HEAD
  const counts: Record<string, number> = combinedRows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
=======
    const filledMeds = meds.filter((m) => m.name.trim() !== '');
    if (filledMeds.length === 0) {
      toast.error('Please prescribe at least one medicine.');
      return;
    }

    let p: Patient | undefined;
    let pId: string;

    const generatedUhid = patientIdInput.trim() || `UHID-${Date.now().toString().slice(-6)}`;
    const match = patients.find((x) => x.mrn.toUpperCase() === generatedUhid.toUpperCase());
    if (match) {
      p = match;
      pId = match.id;
    } else {
      const newPId = `p-${Date.now()}`;
      const newPatient = addPatient({
        id: newPId,
        mrn: generatedUhid,
        name: patientNameInput.trim(),
        age: Number(patientAgeInput) || 30,
        gender: patientGenderInput || 'Male',
        phone: '+91 99999 99999',
        email: 'patient@medicore.io',
        bloodGroup: 'O+',
        address: 'Address Not Provided',
        emergencyContact: { name: 'N/A', phone: 'N/A', relation: 'N/A' },
        allergies: [],
        medications: [],
        registeredOn: new Date().toISOString(),
        assignedDoctorId: doctorId || '',
      });
      p = newPatient;
      pId = newPId;
    }

    const rxId = `rx-${Date.now()}`;
    const dateStr = new Date().toISOString();

    const newPrescription: Prescription = {
      id: rxId,
      patientId: pId,
      doctorId: doctorId || '',
      date: dateStr,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      advice: advice.trim(),
    };

    addPrescription(newPrescription);

    const docDetails = getDoctorDetails(doctorId || '', user, staffProfiles);

    setPrintData({
      rxNo: `RX-${rxId.slice(-6)}`,
      date: format(new Date(), 'dd MMM yyyy, hh:mm a'),
      patientName: p?.name || patientNameInput.trim(),
      uhid: p?.mrn || patientIdInput.trim() || rxId.slice(-6),
      age: p?.age || Number(patientAgeInput) || 30,
      gender: p?.gender || patientGenderInput || 'M',
      doctorName: docDetails.name,
      specialization: docDetails.specialization,
      qualification: docDetails.qualification,
      kmcNo: docDetails.kmcNo,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      labTests: [],
      followUp: advice.includes('Follow up: ')
        ? advice.replace('Follow up: ', '').replace('.', '')
        : undefined,
      patientPhone: p?.phone || '',
      patientEmail: p?.email || '',
    });

    toast.success('Prescription issued successfully!');

    // Reset fields
    setPatientIdInput('');
    setPatientNameInput('');
    setPatientAgeInput('');
    setPatientGenderInput('Male');
    setDiagnosis('');
    setAdvice('');
    setMeds([
      { name: '', dose: '1 tab', frequency: '1-0-1', duration: '5 days', notes: 'After food' },
    ]);
    setDetailedOpen(false);
  };
>>>>>>> a821a0c (second update)

  return (
    <>
      <PageHeader
        eyebrow="Prescriptions"
        title="Prescription Entry"
        description="Issue detailed prescriptions manually"
      />

<<<<<<< HEAD
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
        <QueueStatCard label="Pending Labs" value={4} icon={FlaskConical} color="red" />
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
        <TabsList className="cir-tabs flex-wrap h-auto p-1.5 border border-border bg-card">
          <TabsTrigger value="all" className="cir-tabs__t">All ({combinedRows.length})</TabsTrigger>
          <TabsTrigger value="checked-in" className="cir-tabs__t">
            ⏳ Waiting ({counts["checked-in"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="in-consultation" className="cir-tabs__t">
            🩺 In consult ({counts["in-consultation"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="completed" className="cir-tabs__t">
            ✅ Completed ({counts["completed"] ?? 0})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="cir-tabs__t">
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
=======
      {/* Prescription Entry Section */}
      <div className="surface-elevated p-5 mb-6 border-l-4 border-l-emerald-500 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-emerald-600 dark:text-emerald-400">
              Prescription Entry
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Generate detailed prescriptions directly. Click the button to issue a new
              prescription.
            </p>
          </div>
          <Dialog open={detailedOpen} onOpenChange={setDetailedOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <ClipboardPlus className="mr-1.5 h-4 w-4" /> New Detailed Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create prescription</DialogTitle>
                <DialogDescription>
                  Issue a new detailed prescription for a patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-4 mt-4 text-left">
                <div className="grid grid-cols-2 gap-3 border p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Patient Demographics
                    </span>
                  </div>
                  <div>
                    <Label>Patient ID / UHID</Label>
                    <Input
                      placeholder="e.g. UHID-12345"
                      value={patientIdInput}
                      onChange={(e) => setPatientIdInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={patientNameInput}
                      onChange={(e) => setPatientNameInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 28"
                      value={patientAgeInput}
                      onChange={(e) => setPatientAgeInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={patientGenderInput} onValueChange={setPatientGenderInput}>
                      <SelectTrigger className="mt-1.5 bg-background">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="e.g. Hypertension stage 1"
                    className="mt-1.5"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Medicines</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setMeds([
                          ...meds,
                          {
                            name: '',
                            dose: '1 tab',
                            frequency: '1-0-1',
                            duration: '5 days',
                            notes: 'After food',
                          },
                        ])
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {meds.map((m, i) => (
                      <div
                        key={i}
                        className="space-y-2 p-3 border border-dashed rounded-lg relative bg-slate-50/50 dark:bg-slate-900/20"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Medicine #{i + 1}
                          </span>
                          {meds.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => setMeds(meds.filter((_, j) => j !== i))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <Input
                              placeholder="Medicine"
                              value={m.name}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, name: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Dose (e.g. 1 tab)"
                              value={m.dose}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, dose: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Freq (e.g. 1-0-1)"
                              value={m.frequency}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, frequency: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-4">
                            <Input
                              placeholder="Duration (e.g. 5 days)"
                              value={m.duration}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, duration: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-8">
                            <Select
                              value={m.notes || 'After food'}
                              onValueChange={(val) =>
                                setMeds(meds.map((x, j) => (j === i ? { ...x, notes: val } : x)))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Instruction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="After food">After food</SelectItem>
                                <SelectItem value="Before food">Before food</SelectItem>
                                <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Advice / notes</Label>
                  <Textarea
                    placeholder="Diet, exercise, follow-up…"
                    className="mt-1.5"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 px-4">
                <Button variant="outline" onClick={() => setDetailedOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleIssueDetailedPrescription}>Issue prescription</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
>>>>>>> a821a0c (second update)
      </div>
      {printData && <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />}
    </>
  );
}
