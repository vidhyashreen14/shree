import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Search,
  X,
  Plus,
  Home,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Calendar,
  Building2,
  UserCheck,
  Layers,
  Hash,
  Filter,
  Eye,
  XCircle,
  RotateCcw,
  Timer,
  CheckCheck,
  Navigation,
  CalendarDays,
} from "lucide-react";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allowOnlyAlphabetsAndSpaces,
  allowOnlyNumbers,
  allowOnlyAddressChars,
  sanitizeText,
} from "@/lib/validations";
import {
  PatientNameInput,
  MobileInput,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SearchMobileInput,
  SearchPatientNameInput,
} from "@/components/common/ValidatedInputs";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lab/visits")({
  component: LabVisits,
});

// ── Types ────────────────────────────────────────────────────────────────────

type VisitStatus = "Pending" | "Collected" | "In Progress" | "Cancelled" | "Completed";

interface HomeVisit {
  id: string;
  visitId: string;
  patientName: string;
  mobile: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  sbu: string;
  branch: string;
  phlebo: string;
  tests: string[];
  regDate: string;
  regTime: string;
  collDate: string;
  collTimeFrom: string;
  collTimeTo: string;
  status: VisitStatus;
  remarks?: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────

const SBU_OPTIONS = [
  "All SBU",
  "SBU - Chitradurga",
  "SBU - Davangere",
  "SBU - Tumkur",
  "SBU - Shivamogga",
];
const BRANCH_OPTIONS = [
  "All Branches",
  "Main Branch",
  "North Branch",
  "South Branch",
  "East Branch",
];
const PHLEBO_OPTIONS = [
  "All Phlebotomists",
  "Ramesh Kumar",
  "Priya Menon",
  "Sister Joan",
  "Arjun Naik",
  "Meena Rao",
];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const STATUS_OPTIONS: VisitStatus[] = [
  "Pending",
  "Collected",
  "In Progress",
  "Cancelled",
  "Completed",
];
const TEST_POOL = [
  "CBC",
  "HbA1c",
  "Lipid Panel",
  "TSH",
  "Urinalysis",
  "Blood Sugar",
  "Liver Function",
  "Kidney Function",
  "Vitamin D",
  "Thyroid Profile",
];

function randBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

function generateMockVisits(): HomeVisit[] {
  const names = [
    "Aarav Sharma",
    "Saanvi Patel",
    "Vihaan Iyer",
    "Diya Kapoor",
    "Arjun Mehta",
    "Anaya Reddy",
    "Reyansh Khanna",
    "Ishaani Rao",
    "Kabir Joshi",
    "Aadhya Nair",
    "Ayaan Bose",
    "Myra Sen",
    "Krishna Gupta",
    "Sara Williams",
    "Liam Carter",
    "Olivia Bennett",
    "Noah Kim",
    "Emma Zhang",
    "Ethan Wright",
    "Mia Hassan",
    "Yusuf Ahmed",
    "Zoya Khan",
    "Daniel Cohen",
    "Sofia Rossi",
    "Hiroshi Tanaka",
    "Pooja Verma",
    "Rakesh Singh",
    "Sunita Gupta",
    "Manoj Kumar",
    "Divya Nair",
  ];
  const statuses: VisitStatus[] = [
    "Pending",
    "Pending",
    "Pending",
    "Collected",
    "In Progress",
    "Cancelled",
    "Completed",
  ];
  const addresses = [
    "12 Maple Ave, Chitradurga",
    "5 Lotus Rd, Davangere",
    "8 Oak St, Tumkur",
    "21 Rose Ln, Shivamogga",
    "34 MG Road, Chitradurga",
    "7 Park St, North Branch",
  ];

  const base = new Date("2026-07-10");
  return names.map((name, i) => {
    const regD = new Date(base);
    regD.setDate(base.getDate() - (i % 10));
    const collD = new Date(regD);
    collD.setDate(regD.getDate() + 1);
    const fromH = randBetween(7, 11);
    const toH = fromH + randBetween(1, 3);

    const testCount = randBetween(1, 3);
    const tests: string[] = [];
    for (let j = 0; j < testCount; j++) {
      tests.push(TEST_POOL[(i + j * 3) % TEST_POOL.length]);
    }

    return {
      id: `hv-${1000 + i}`,
      visitId: `VIS-${20000 + i}`,
      patientName: name,
      mobile: `+91 90${String(10000000 + i * 13).slice(0, 8)}`,
      age: 18 + ((i * 7) % 60),
      gender: (["Male", "Female", "Other"] as const)[i % 3],
      address: addresses[i % addresses.length],
      sbu: SBU_OPTIONS[1 + (i % (SBU_OPTIONS.length - 1))],
      branch: BRANCH_OPTIONS[1 + (i % (BRANCH_OPTIONS.length - 1))],
      phlebo: PHLEBO_OPTIONS[1 + (i % (PHLEBO_OPTIONS.length - 1))],
      tests,
      regDate: regD.toISOString().split("T")[0],
      regTime: `${padTwo(randBetween(8, 18))}:${padTwo(randBetween(0, 59))}`,
      collDate: collD.toISOString().split("T")[0],
      collTimeFrom: `${padTwo(fromH)}:00`,
      collTimeTo: `${padTwo(toH)}:00`,
      status: statuses[i % statuses.length],
      remarks: i % 5 === 0 ? "Patient requested morning slot" : undefined,
    };
  });
}

const ALL_VISITS = generateMockVisits();

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VisitStatus }) {
  const cfg = {
    Pending: {
      bg: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
      dot: "bg-amber-500",
      icon: Clock,
    },
    Collected: {
      bg: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    "In Progress": {
      bg: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
      dot: "bg-blue-500",
      icon: Loader2,
    },
    Cancelled: {
      bg: "bg-rose-500/10 text-rose-600 ring-rose-500/20",
      dot: "bg-rose-500",
      icon: XCircle,
    },
    Completed: {
      bg: "bg-teal-500/10 text-teal-600 ring-teal-500/20",
      dot: "bg-teal-500",
      icon: CheckCircle2,
    },
  }[status];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${cfg.bg}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Add Visit Modal ───────────────────────────────────────────────────────────
function AddVisitModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: HomeVisit) => void;
}) {
  const [form, setForm] = useState({
    patientName: "",
    mobile: "",
    age: "",
    gender: "Male",
    address: "",
    branch: BRANCH_OPTIONS[1],
    phlebo: PHLEBO_OPTIONS[1],
    tests: [] as string[],
    collDate: new Date().toISOString().split("T")[0],
    collTimeFrom: "08:00",
    collTimeTo: "10:00",
    remarks: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const updateError = (k: string, hasError: boolean) =>
    setErrors((prev) => ({ ...prev, [k]: hasError }));

  function toggleTest(t: string) {
    setForm((prev) => ({
      ...prev,
      tests: prev.tests.includes(t) ? prev.tests.filter((x) => x !== t) : [...prev.tests, t],
    }));
  }

  function handleSave() {
    if (Object.values(errors).some(Boolean)) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }
    if (!form.patientName || !form.mobile || form.tests.length === 0) {
      toast.warning("Please fill in Patient Name, Mobile, and at least one test.");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      const newVisit: HomeVisit = {
        id: `hv-new-${Date.now()}`,
        visitId: `VIS-${20000 + Math.floor(Math.random() * 9000)}`,
        patientName: form.patientName,
        mobile: form.mobile,
        age: parseInt(form.age) || 30,
        gender: form.gender as "Male" | "Female" | "Other",
        address: form.address,
        sbu: "",
        branch: form.branch,
        phlebo: form.phlebo,
        tests: form.tests,
        regDate: now.toISOString().split("T")[0],
        regTime: `${padTwo(now.getHours())}:${padTwo(now.getMinutes())}`,
        collDate: form.collDate,
        collTimeFrom: form.collTimeFrom,
        collTimeTo: form.collTimeTo,
        status: "Pending",
        remarks: form.remarks || undefined,
      };
      onSave(newVisit);
      toast.success(`Visit ${newVisit.visitId} registered successfully!`);
      setSaving(false);
      onClose();
    }, 800);
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border bg-teal-500/5 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10">
              <Home className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <p className="font-bold text-foreground">Add Home Visit</p>
              <p className="text-xs text-muted-foreground">
                Register a new home collection request
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Patient Info */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
              <User className="h-3.5 w-3.5" /> Patient Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Patient Name *</label>
                <PatientNameInput
                  className={inputCls}
                  value={form.patientName}
                  onChange={(v) => setForm((p) => ({ ...p, patientName: v }))}
                  onErrorChange={(e) => updateError("patientName", e)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Mobile No *</label>
                <MobileInput
                  className={inputCls}
                  value={form.mobile}
                  onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
                  onErrorChange={(e) => updateError("mobile", e)}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Age</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className={inputCls}
                  placeholder="Years"
                  value={form.age}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, age: allowOnlyNumbers(e.target.value) }))
                  }
                />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select
                  className={inputCls}
                  value={form.gender}
                  onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                >
                  {["Male", "Female", "Other"].map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Address</label>
                <input
                  className={inputCls}
                  maxLength={250}
                  placeholder="Full address for home collection"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: allowOnlyAddressChars(e.target.value) }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
              <Building2 className="h-3.5 w-3.5" /> Assignment
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Branch</label>
                <select
                  className={inputCls}
                  value={form.branch}
                  onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                >
                  {BRANCH_OPTIONS.slice(1).map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Phlebotomist</label>
                <select
                  className={inputCls}
                  value={form.phlebo}
                  onChange={(e) => setForm((p) => ({ ...p, phlebo: e.target.value }))}
                >
                  {PHLEBO_OPTIONS.slice(1).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tests */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
              <FlaskConical className="h-3.5 w-3.5" /> Tests Required *
            </p>
            <div className="flex flex-wrap gap-2">
              {TEST_POOL.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTest(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ring-1 ${
                    form.tests.includes(t)
                      ? "bg-teal-500 text-white ring-teal-500"
                      : "bg-muted text-muted-foreground ring-border hover:bg-muted/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Collection Schedule */}
          <div>
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-3">
              <Calendar className="h-3.5 w-3.5" /> Collection Schedule
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Collection Date *</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className={inputCls}
                  value={form.collDate}
                  onChange={(e) => setForm((p) => ({ ...p, collDate: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>From Time</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.collTimeFrom}
                  onChange={(e) => setForm((p) => ({ ...p, collTimeFrom: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>To Time</label>
                <input
                  type="time"
                  className={inputCls}
                  value={form.collTimeTo}
                  onChange={(e) => setForm((p) => ({ ...p, collTimeTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelCls}>Remarks (Optional)</label>
            <input
              className={inputCls}
              maxLength={500}
              placeholder="Any special instructions..."
              value={form.remarks}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              onBlur={() => setForm((p) => ({ ...p, remarks: sanitizeText(p.remarks) }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-end gap-3 border-t border-border bg-background px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || Object.values(errors).some(Boolean)}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : "Add Visit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── View Visit Modal ──────────────────────────────────────────────────────────
function ViewVisitModal({ visit, onClose }: { visit: HomeVisit; onClose: () => void }) {
  const field = (label: string, value: string | number, icon?: React.ReactNode) => (
    <div className="flex items-start gap-2.5">
      {icon && <div className="mt-0.5 text-teal-500">{icon}</div>}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
        <div className="shrink-0 flex items-center justify-between border-b border-border bg-teal-500/5 px-6 py-4">
          <div>
            <p className="font-bold text-foreground">{visit.patientName}</p>
            <p className="text-xs text-muted-foreground font-mono">{visit.visitId}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={visit.status} />
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-muted transition-colors ml-1"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 grid grid-cols-2 gap-4">
          {field("Mobile", visit.mobile, <Phone className="h-3.5 w-3.5" />)}
          {field(
            "Age / Gender",
            `${visit.age} Yrs / ${visit.gender}`,
            <User className="h-3.5 w-3.5" />
          )}
          {field("SBU", visit.sbu, <Layers className="h-3.5 w-3.5" />)}
          {field("Branch", visit.branch, <Building2 className="h-3.5 w-3.5" />)}
          {field("Phlebotomist", visit.phlebo, <UserCheck className="h-3.5 w-3.5" />)}
          {field(
            "Registration",
            `${visit.regDate} ${visit.regTime}`,
            <Calendar className="h-3.5 w-3.5" />
          )}
          <div className="col-span-2">
            {field("Address", visit.address, <MapPin className="h-3.5 w-3.5" />)}
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Collection Window
            </p>
            <p className="text-sm font-medium text-foreground">
              {visit.collDate} &nbsp;·&nbsp; {visit.collTimeFrom} – {visit.collTimeTo}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visit.tests.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          {visit.remarks && (
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Remarks
              </p>
              <p className="text-sm text-muted-foreground italic">{visit.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Registered Date & Time Picker ────────────────────────────────────────────
interface RegisteredDateTimePickerProps {
  value: string; // ISO-like: "YYYY-MM-DDTHH:MM:SS"
  onChange: (v: string) => void;
  inputCls: string;
}

function RegisteredDateTimePicker({ value, onChange, inputCls }: RegisteredDateTimePickerProps) {
  const [showCal, setShowCal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value
  const datePart = value ? value.split("T")[0] : ""; // YYYY-MM-DD
  const timePart = value ? (value.split("T")[1] ?? "") : "";
  const [hhRaw, mmRaw, ssRaw] = timePart ? timePart.split(":") : ["", "", ""];

  // Local editable state for each time unit (so they can be blank)
  const [hhLocal, setHhLocal] = useState(hhRaw ?? "");
  const [mmLocal, setMmLocal] = useState(mmRaw ?? "");
  const [ssLocal, setSsLocal] = useState(ssRaw ?? "");

  // Keep local state in sync when value prop changes externally (e.g. Clear)
  useEffect(() => {
    const tp = value ? (value.split("T")[1] ?? "") : "";
    const [h, m, s] = tp ? tp.split(":") : ["", "", ""];
    setHhLocal(h ?? "");
    setMmLocal(m ?? "");
    setSsLocal(s ?? "");
  }, [value]);

  const hh = hhLocal || "00";
  const mm = mmLocal || "00";
  const ss = ssLocal || "00";

  const displayDate = datePart
    ? datePart.split("-").reverse().join("/") // DD/MM/YYYY
    : "";

  function buildValue(date: string, hours: string, mins: string, secs: string) {
    const h = String(parseInt(hours || "0") || 0).padStart(2, "0");
    const m = String(parseInt(mins || "0") || 0).padStart(2, "0");
    const s = String(parseInt(secs || "0") || 0).padStart(2, "0");
    return date ? `${date}T${h}:${m}:${s}` : "";
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value; // YYYY-MM-DD
    onChange(buildValue(newDate, hh, mm, ss));
    setShowCal(false);
  }

  function handleTimeUnit(unit: "hh" | "mm" | "ss", raw: string) {
    const cleanDigits = allowOnlyNumbers(raw).slice(0, 2);
    if (!cleanDigits) {
      if (unit === "hh") {
        setHhLocal("");
        onChange(buildValue(datePart, "", mm, ss));
      } else if (unit === "mm") {
        setMmLocal("");
        onChange(buildValue(datePart, hh, "", ss));
      } else if (unit === "ss") {
        setSsLocal("");
        onChange(buildValue(datePart, hh, mm, ""));
      }
      return;
    }
    const maxVal = unit === "hh" ? 23 : 59;
    const n = parseInt(cleanDigits, 10);
    const clamped = String(Math.min(maxVal, Math.max(0, n)));
    if (unit === "hh") {
      setHhLocal(clamped);
      onChange(buildValue(datePart, clamped, mm, ss));
    } else if (unit === "mm") {
      setMmLocal(clamped);
      onChange(buildValue(datePart, hh, clamped, ss));
    } else if (unit === "ss") {
      setSsLocal(clamped);
      onChange(buildValue(datePart, hh, mm, clamped));
    }
  }

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  function handleClear() {
    onChange("");
    setHhLocal("");
    setMmLocal("");
    setSsLocal("");
    setShowCal(false);
  }

  // Close popover on outside click
  useEffect(() => {
    if (!showCal) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowCal(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCal]);

  return (
    <div ref={containerRef} className="relative">
      {/* Display input */}
      <div className="relative flex items-center">
        <input
          readOnly
          value={displayDate ? `${displayDate}  ${hh}:${mm}:${ss}` : ""}
          placeholder="DD/MM/YYYY  HH:MM:SS"
          className={`${inputCls} pr-8 cursor-pointer`}
          onClick={() => setShowCal((v) => !v)}
        />
        <button
          type="button"
          onClick={() => setShowCal((v) => !v)}
          className="absolute right-2 text-muted-foreground hover:text-teal-600 transition-colors"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Popover */}
      {showCal && (
        <div className="absolute z-50 mt-1 left-0 min-w-[280px] rounded-xl border border-border bg-background shadow-xl ring-1 ring-border p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Date picker */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Date (DD/MM/YYYY)
            </p>
            <input type="date" className={inputCls} value={datePart} onChange={handleDateChange} />
            {displayDate && (
              <p className="text-[10px] text-teal-600 font-semibold mt-1">{displayDate}</p>
            )}
          </div>

          {/* Time spinners */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Time (24-hour)
            </p>
            <div className="flex items-center gap-2">
              {/* HH */}
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 text-center">
                  HH
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={hhLocal}
                  placeholder="0"
                  onKeyDown={handleTimeKeyDown}
                  onChange={(e) => handleTimeUnit("hh", e.target.value)}
                  className={`${inputCls} text-center`}
                />
              </div>
              <span className="text-lg font-bold text-muted-foreground mt-4">:</span>
              {/* MM */}
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 text-center">
                  MM
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={mmLocal}
                  placeholder="0"
                  onKeyDown={handleTimeKeyDown}
                  onChange={(e) => handleTimeUnit("mm", e.target.value)}
                  className={`${inputCls} text-center`}
                />
              </div>
              <span className="text-lg font-bold text-muted-foreground mt-4">:</span>
              {/* SS */}
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase text-muted-foreground mb-0.5 text-center">
                  SS
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={ssLocal}
                  placeholder="0"
                  onKeyDown={handleTimeKeyDown}
                  onChange={(e) => handleTimeUnit("ss", e.target.value)}
                  className={`${inputCls} text-center`}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-rose-500 transition-colors font-semibold"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowCal(false)}
              className="rounded-lg bg-teal-600 px-3 py-1 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function LabVisits() {
  // ── Filters ──
  const [filters, setFilters] = useState({
    branch: "All Branches",
    phlebo: "All Phlebotomists",
    mobile: "",
    visitId: "",
    ptName: "",
    registered: "",
  });
  const [applied, setApplied] = useState({ ...filters });
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewVisit, setViewVisit] = useState<HomeVisit | null>(null);
  const [visits, setVisits] = useState<HomeVisit[]>(ALL_VISITS);

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // ── Apply Filters ──
  function handleSearch() {
    setApplied({ ...filters });
    setPage(1);
    setHasSearched(true);
    toast.success("Filters applied");
  }

  function handleClear() {
    const reset = {
      branch: "All Branches",
      phlebo: "All Phlebotomists",
      mobile: "",
      visitId: "",
      ptName: "",
      registered: "",
    };
    setFilters(reset);
    setApplied(reset);
    setPage(1);
    setHasSearched(false);
    toast.info("Filters cleared");
  }

  // ── Derived Data ──
  const filtered = visits.filter((v) => {
    if (applied.branch !== "All Branches" && v.branch !== applied.branch) return false;
    if (applied.phlebo !== "All Phlebotomists" && v.phlebo !== applied.phlebo) return false;
    if (applied.mobile && !v.mobile.includes(applied.mobile)) return false;
    if (applied.visitId && !v.visitId.toLowerCase().includes(applied.visitId.toLowerCase()))
      return false;
    if (applied.ptName && !v.patientName.toLowerCase().includes(applied.ptName.toLowerCase()))
      return false;
    if (applied.registered) {
      // Filter by registered date (YYYY-MM-DD extracted from the datetime value)
      const regDatePart = applied.registered.split("T")[0];
      if (regDatePart && v.regDate !== regDatePart) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageVisits = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, filtered.length);

  // Stats
  const pendingCount = visits.filter((v) => v.status === "Pending").length;
  const collectedCount = visits.filter((v) => v.status === "Collected").length;
  const inProgressCount = visits.filter((v) => v.status === "In Progress").length;
  const todayCount = visits.filter(
    (v) => v.collDate === new Date().toISOString().split("T")[0]
  ).length;

  const selectCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
  const labelCls =
    "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <>
      <PageHeader
        title="Visit List"
        description="Monitor and manage all home collection requests. Filter by SBU, branch, phlebotomist and timeline."
      />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
        {[
          {
            label: "Pending",
            value: pendingCount,
            color: "text-amber-600 bg-amber-500/10 ring-amber-500/20",
            icon: Timer,
          },
          {
            label: "Collected",
            value: collectedCount,
            color: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20",
            icon: CheckCheck,
          },
          {
            label: "In Progress",
            value: inProgressCount,
            color: "text-blue-600 bg-blue-500/10 ring-blue-500/20",
            icon: Navigation,
          },
          {
            label: "Today's Visits",
            value: todayCount,
            color: "text-teal-600 bg-teal-500/10 ring-teal-500/20",
            icon: CalendarDays,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="surface-elevated flex items-center justify-between gap-4 rounded-xl p-4 ring-1 ring-border"
          >
            <div>
              <p className="text-base font-semibold text-muted-foreground">{label}</p>
              <p className="text-2xl font-extrabold text-foreground">{value}</p>
            </div>
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1 ${color}`}
            >
              <Icon className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Panel ── */}
      <div className="surface-elevated rounded-2xl ring-1 ring-border mb-5">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Search & Filter
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-teal-600">{filtered.length}</span> results
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Row 1 – Assignment */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <label className={labelCls}>Branch</label>
              <select
                className={selectCls}
                value={filters.branch}
                onChange={(e) => setFilter("branch", e.target.value)}
              >
                {BRANCH_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Phlebotomist</label>
              <select
                className={selectCls}
                value={filters.phlebo}
                onChange={(e) => setFilter("phlebo", e.target.value)}
              >
                {PHLEBO_OPTIONS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 – Patient Identifiers */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Mobile No</label>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground shrink-0 shadow-xs">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span>+91</span>
                </div>
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    inputMode="numeric"
                    className={inputCls}
                    placeholder="Enter 10-digit mobile"
                    maxLength={10}
                    value={filters.mobile}
                    onChange={(e) =>
                      setFilter("mobile", allowOnlyNumbers(e.target.value).slice(0, 10))
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Visit ID</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  className={`${inputCls} pl-8`}
                  placeholder="VIS-XXXXX"
                  value={filters.visitId}
                  onChange={(e) => setFilter("visitId", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Patient Name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-[9px] h-3.5 w-3.5 text-muted-foreground z-10" />
                <SearchPatientNameInput
                  className={`${inputCls} pl-8`}
                  value={filters.ptName}
                  onChange={(v) => setFilter("ptName", v)}
                />
              </div>
            </div>
          </div>

          {/* Row 3 – Timeline */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Registered</label>
              <RegisteredDateTimePicker
                value={filters.registered}
                onChange={(v) => setFilter("registered", v)}
                inputCls={inputCls}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-teal-600">{filtered.length}</span> of{" "}
              <span className="font-semibold">{visits.length}</span> visits
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Search className="h-3.5 w-3.5" /> Search
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add Visit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Visit Table ── */}
      {hasSearched ? (
        <div className="surface-elevated overflow-hidden rounded-2xl ring-1 ring-border">
          {/* Table Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Home Visit Records
              </span>
              <span className="ml-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-600">
                {filtered.length}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Visit ID</th>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">SBU / Branch</th>
                  <th className="px-4 py-3 text-left">Phlebotomist</th>
                  <th className="px-4 py-3 text-left">Tests</th>
                  <th className="px-4 py-3 text-left">Collection Window</th>
                  <th className="px-4 py-3 text-left">Registered</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageVisits.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 opacity-30" />
                        <p className="text-sm font-medium">No visits found</p>
                        <p className="text-xs">Try adjusting your filters and search again</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageVisits.map((visit, idx) => (
                    <tr key={visit.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {startEntry + idx}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-teal-600">
                          {visit.visitId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-600">
                            {visit.patientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">
                              {visit.patientName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {visit.age}y · {visit.gender}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{visit.mobile}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">
                          {visit.sbu.replace("SBU - ", "")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{visit.branch}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {visit.phlebo}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {visit.tests.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground ring-1 ring-border"
                            >
                              {t}
                            </span>
                          ))}
                          {visit.tests.length > 2 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              +{visit.tests.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{visit.collDate}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {visit.collTimeFrom} – {visit.collTimeTo}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">{visit.regDate}</p>
                        <p className="text-[10px] text-muted-foreground">{visit.regTime}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={visit.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setViewVisit(visit)}
                          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold text-teal-600 ring-1 ring-teal-500/30 hover:bg-teal-500/10 transition-colors"
                        >
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/10 px-5 py-3">
            <span className="text-xs text-muted-foreground">
              Showing <span className="font-semibold">{startEntry}</span>–
              <span className="font-semibold">{endEntry}</span> of{" "}
              <span className="font-semibold">{filtered.length}</span> visits
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                .map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                      pg === page
                        ? "bg-teal-600 text-white"
                        : "hover:bg-muted text-muted-foreground ring-1 ring-border"
                    }`}
                  >
                    {pg}
                  </button>
                ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-muted-foreground bg-muted/5">
          <Search className="mb-4 h-12 w-12 opacity-20" />
          <p className="text-sm font-semibold text-foreground">No visits to display</p>
          <p className="text-xs mt-1">Select your desired filters above and click Search</p>
        </div>
      )}

      {/* ── Modals ── */}
      {showAddModal && (
        <AddVisitModal
          onClose={() => setShowAddModal(false)}
          onSave={(newVisit) => setVisits((prev) => [newVisit, ...prev])}
        />
      )}
      {viewVisit && <ViewVisitModal visit={viewVisit} onClose={() => setViewVisit(null)} />}
    </>
  );
}
