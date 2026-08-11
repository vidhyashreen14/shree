import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Search,
  X,
  Plus,
  RefreshCw,
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
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  allLabVisits,
  LAB_TEST_POOL,
  VISIT_SBU_OPTIONS,
  VISIT_BRANCH_OPTIONS,
  VISIT_PHLEBO_OPTIONS,
  VISIT_STATUS_OPTIONS,
} from "@/lib/mock/data";
import type { HomeVisit, VisitStatus } from "@/lib/mock/data";


export const Route = createFileRoute("/_app/lab/visits")({
  component: LabVisits,
});

// Aliases — all data now comes from @/lib/mock/data
const SBU_OPTIONS = VISIT_SBU_OPTIONS;
const BRANCH_OPTIONS = VISIT_BRANCH_OPTIONS;
const PHLEBO_OPTIONS = VISIT_PHLEBO_OPTIONS;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STATUS_OPTIONS: VisitStatus[] = [...VISIT_STATUS_OPTIONS];
const TEST_POOL = LAB_TEST_POOL;

const ALL_VISITS = allLabVisits;

// Local helper used in form submission
function padTwo(n: number) {
  return String(n).padStart(2, "0");
}

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: VisitStatus }) {
  const cfg: Record<string, { bg: string; dot: string; icon: LucideIcon }> = {
    Pending: { bg: "bg-amber-500/10 text-amber-600 ring-amber-500/20", dot: "bg-amber-500", icon: Clock },
    Collected: { bg: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20", dot: "bg-emerald-500", icon: CheckCircle2 },
    "In Progress": { bg: "bg-blue-500/10 text-blue-600 ring-blue-500/20", dot: "bg-blue-500", icon: Loader2 },
    Received: { bg: "bg-blue-500/10 text-blue-600 ring-blue-500/20", dot: "bg-blue-500", icon: FlaskConical },
    Completed: { bg: "bg-teal-500/10 text-teal-600 ring-teal-500/20", dot: "bg-teal-500", icon: CheckCircle2 },
    Cancelled: { bg: "bg-rose-500/10 text-rose-600 ring-rose-500/20", dot: "bg-rose-500", icon: AlertCircle },
  };
  const badge = cfg[status] ?? { bg: "bg-muted text-muted-foreground ring-border", dot: "bg-muted-foreground", icon: Clock };
  const Icon = badge.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badge.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
      <Icon className="h-3 w-3" />
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
  onSave: (visit: HomeVisit) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testQuery, setTestQuery] = useState("");
  const [form, setForm] = useState({
    sbu: SBU_OPTIONS[0],
    branch: BRANCH_OPTIONS[0],
    patientName: "",
    mobile: "",
    gender: "Male" as "Male" | "Female" | "Other",
    age: "",
    phlebo: PHLEBO_OPTIONS[0],
    address: "",
    collDate: new Date().toISOString().split("T")[0],
    collTimeFrom: "07:00",
    collTimeTo: "09:00",
    remarks: "",
  });

  const toggleTest = (t: string) =>
    setSelectedTests(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const filteredTests = TEST_POOL.filter(t => t.toLowerCase().includes(testQuery.toLowerCase()));

  const handleSave = () => {
    if (!form.patientName.trim()) { toast.error("Patient Name is required"); return; }
    if (!form.mobile.trim()) { toast.error("Mobile number is required"); return; }
    if (!form.address.trim()) { toast.error("Address is required"); return; }
    if (selectedTests.length === 0) { toast.error("Select at least one test"); return; }

    setSaving(true);
    setTimeout(() => {
      const todayStr = new Date().toISOString().split("T")[0];
      const now = new Date();
      const timeStr = `${padTwo(now.getHours())}:${padTwo(now.getMinutes())}`;
      const generatedId = `HV-${Math.floor(10000 + Math.random() * 90000)}`;
      const newV: HomeVisit = {
        id: `hv-${Date.now()}`,
        visitId: generatedId,
        sbu: form.sbu,
        branch: form.branch,
        regDate: todayStr,
        regTime: timeStr,
        patientName: form.patientName,
        mobile: form.mobile,
        gender: form.gender,
        age: Number(form.age) || 30,
        phlebo: form.phlebo,
        address: form.address,
        collDate: form.collDate,
        collTimeFrom: form.collTimeFrom,
        collTimeTo: form.collTimeTo,
        status: "Pending",
        tests: selectedTests,
        remarks: form.remarks,
      };
      onSave(newV);
      toast.success(`Home visit created: ${newV.visitId}`);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-teal-500/5 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white shadow-xs">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">Schedule Home Visit</h2>
              <p className="text-xs text-muted-foreground">Register a new home sample collection visit</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Patient Info Section */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Patient Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Patient Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.patientName}
                  onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={form.mobile}
                  onChange={e => setForm(p => ({ ...p, mobile: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Gender</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value as HomeVisit['gender'] }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Age (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={form.age}
                  onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground mb-1 block">Collection Address *</label>
                <textarea
                  rows={2}
                  placeholder="House/Flat No., Street, Area, Landmark, Pincode"
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2.5 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Branch & Phlebotomist
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">SBU</label>
                <select
                  value={form.sbu}
                  onChange={e => setForm(p => ({ ...p, sbu: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {SBU_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Branch</label>
                <select
                  value={form.branch}
                  onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Phlebotomist</label>
                <select
                  value={form.phlebo}
                  onChange={e => setForm(p => ({ ...p, phlebo: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {PHLEBO_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Collection Schedule
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Collection Date</label>
                <input
                  type="date"
                  value={form.collDate}
                  onChange={e => setForm(p => ({ ...p, collDate: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Time Slot From</label>
                <input
                  type="time"
                  value={form.collTimeFrom}
                  onChange={e => setForm(p => ({ ...p, collTimeFrom: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Time Slot To</label>
                <input
                  type="time"
                  value={form.collTimeTo}
                  onChange={e => setForm(p => ({ ...p, collTimeTo: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Tests Section */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-teal-600 mb-2 flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5" /> Required Investigations *
            </p>
            <input
              type="text"
              placeholder="Filter test catalog..."
              value={testQuery}
              onChange={e => setTestQuery(e.target.value)}
              className="mb-2.5 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-border rounded-lg bg-muted/20">
              {filteredTests.map(t => {
                const active = selectedTests.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTest(t)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${active
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-background text-foreground hover:bg-muted ring-1 ring-border"
                      }`}
                  >
                    {active && "✓ "}
                    {t}
                  </button>
                );
              })}
            </div>
            {selectedTests.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                Selected ({selectedTests.length}): {selectedTests.join(", ")}
              </p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Special Instructions / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Patient requires fasting, call before arrival"
              value={form.remarks}
              onChange={e => setForm(p => ({ ...p, remarks: e.target.value }))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground ring-1 ring-border hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
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
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border bg-teal-500/5 px-6 py-4">
          <div>
            <p className="font-bold text-foreground">{visit.patientName}</p>
            <p className="text-xs text-muted-foreground font-mono">{visit.visitId}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={visit.status} />
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors ml-1">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          {field("Mobile", visit.mobile, <Phone className="h-3.5 w-3.5" />)}
          {field("Age / Gender", `${visit.age} Yrs / ${visit.gender}`, <User className="h-3.5 w-3.5" />)}
          {field("SBU", visit.sbu, <Layers className="h-3.5 w-3.5" />)}
          {field("Branch", visit.branch, <Building2 className="h-3.5 w-3.5" />)}
          {field("Phlebotomist", visit.phlebo, <UserCheck className="h-3.5 w-3.5" />)}
          {field("Registration", `${visit.regDate} ${visit.regTime}`, <Calendar className="h-3.5 w-3.5" />)}
          <div className="col-span-2">
            {field("Address", visit.address, <MapPin className="h-3.5 w-3.5" />)}
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Collection Window</p>
            <p className="text-sm font-medium text-foreground">{visit.collDate} &nbsp;·&nbsp; {visit.collTimeFrom} – {visit.collTimeTo}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Tests</p>
            <div className="flex flex-wrap gap-1.5">
              {visit.tests.map(t => (
                <span key={t} className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-500/20">{t}</span>
              ))}
            </div>
          </div>
          {visit.remarks && (
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Remarks</p>
              <p className="text-sm text-muted-foreground italic">{visit.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

function LabVisits() {
  // ── Filters ──
  const [filters, setFilters] = useState({
    sbu: "All SBU",
    branch: "All Branches",
    phlebo: "All Phlebotomists",
    mobile: "",
    visitId: "",
    ptName: "",
    status: "Pending" as VisitStatus | "All",
    regFrom: "",
    regTo: "",
    collFrom: "",
    collTo: "",
    collTimeFrom: "",
    collTimeTo: "",
  });
  const [applied, setApplied] = useState({ ...filters });
  const [hasSearched, setHasSearched] = useState(false);
  const [autoRefreshMin, setAutoRefreshMin] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewVisit, setViewVisit] = useState<HomeVisit | null>(null);
  const [visits, setVisits] = useState<HomeVisit[]>(ALL_VISITS);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleRefresh = useCallback((silent = false) => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (!silent) toast.success("Visit list refreshed");
    }, 700);
  }, []);

  // ── Auto Refresh ──
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    const mins = parseFloat(autoRefreshMin);
    if (!isNaN(mins) && mins > 0) {
      refreshTimer.current = setInterval(() => {
        handleRefresh(true);
      }, mins * 60 * 1000);
    }
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [autoRefreshMin, handleRefresh]);

  // ── Apply Filters ──
  function handleSearch() {
    setApplied({ ...filters });
    setPage(1);
    setHasSearched(true);
    toast.success("Filters applied");
  }

  function handleClear() {
    const reset = {
      sbu: "All SBU", branch: "All Branches", phlebo: "All Phlebotomists",
      mobile: "", visitId: "", ptName: "", status: "Pending" as const,
      regFrom: "", regTo: "", collFrom: "", collTo: "",
      collTimeFrom: "", collTimeTo: "",
    };
    setFilters(reset);
    setApplied(reset);
    setAutoRefreshMin("");
    setPage(1);
    setHasSearched(false);
    toast.info("Filters cleared");
  }

  // ── Derived Data ──
  const filtered = visits.filter(v => {
    if (applied.sbu !== "All SBU" && v.sbu !== applied.sbu) return false;
    if (applied.branch !== "All Branches" && v.branch !== applied.branch) return false;
    if (applied.phlebo !== "All Phlebotomists" && v.phlebo !== applied.phlebo) return false;
    if (applied.mobile && !v.mobile.includes(applied.mobile)) return false;
    if (applied.visitId && !v.visitId.toLowerCase().includes(applied.visitId.toLowerCase())) return false;
    if (applied.ptName && !v.patientName.toLowerCase().includes(applied.ptName.toLowerCase())) return false;
    if (applied.status !== "All" && v.status !== applied.status) return false;
    if (applied.regFrom && v.regDate < applied.regFrom) return false;
    if (applied.regTo && v.regDate > applied.regTo) return false;
    if (applied.collFrom && v.collDate < applied.collFrom) return false;
    if (applied.collTo && v.collDate > applied.collTo) return false;
    if (applied.collTimeFrom && v.collTimeFrom < applied.collTimeFrom) return false;
    if (applied.collTimeTo && v.collTimeTo > applied.collTimeTo) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageVisits = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, filtered.length);

  // Stats
  const pendingCount = visits.filter(v => v.status === "Pending").length;
  const collectedCount = visits.filter(v => v.status === "Collected").length;
  const inProgressCount = visits.filter(v => v.status === "In Progress").length;
  const todayCount = visits.filter(v => v.collDate === new Date().toISOString().split("T")[0]).length;

  const selectCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <>
      {/* ── Page Header ── */}
      <PageHeader
        title="Home Visit List"
        description="Monitor and manage all home collection requests. Filter by SBU, branch, phlebotomist, and timeline."
      />

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-5">
        {[
          { label: "Pending", value: pendingCount, color: "text-amber-600 bg-amber-500/10 ring-amber-500/20", icon: Clock },
          { label: "Collected", value: collectedCount, color: "text-emerald-600 bg-emerald-500/10 ring-emerald-500/20", icon: CheckCircle2 },
          { label: "In Progress", value: inProgressCount, color: "text-blue-600 bg-blue-500/10 ring-blue-500/20", icon: Loader2 },
          { label: "Today's Visits", value: todayCount, color: "text-teal-600 bg-teal-500/10 ring-teal-500/20", icon: Home },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="surface-elevated flex items-center gap-3 rounded-xl p-4 ring-1 ring-border">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-extrabold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Panel ── */}
      <div className="surface-elevated rounded-2xl ring-1 ring-border mb-5 overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search & Filter</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-teal-600">{filtered.length}</span> results
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Row 1 – Assignment */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className={labelCls}>SBU</label>
              <select className={selectCls} value={filters.sbu} onChange={e => setFilter("sbu", e.target.value)}>
                {SBU_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Branch</label>
              <select className={selectCls} value={filters.branch} onChange={e => setFilter("branch", e.target.value)}>
                {BRANCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Phlebotomist</label>
              <select className={selectCls} value={filters.phlebo} onChange={e => setFilter("phlebo", e.target.value)}>
                {PHLEBO_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={selectCls} value={filters.status} onChange={e => setFilter("status", e.target.value)}>
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Auto Refresh (mins)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number" min="1" max="60"
                  className={inputCls}
                  placeholder="e.g. 5"
                  value={autoRefreshMin}
                  onChange={e => setAutoRefreshMin(e.target.value)}
                />
                <button
                  onClick={() => handleRefresh()}
                  className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-border transition-colors hover:bg-muted ${isRefreshing ? "text-teal-600" : "text-muted-foreground"}`}
                  title="Refresh now"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-teal-600" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2 – Patient Identifiers */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Mobile No</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className={`${inputCls} pl-8`} placeholder="Search mobile..." value={filters.mobile} onChange={e => setFilter("mobile", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Visit ID</label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className={`${inputCls} pl-8`} placeholder="VIS-XXXXX" value={filters.visitId} onChange={e => setFilter("visitId", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Patient Name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input className={`${inputCls} pl-8`} placeholder="Search patient name..." value={filters.ptName} onChange={e => setFilter("ptName", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Row 3 – Timeline */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            <div>
              <label className={labelCls}>Reg. From</label>
              <input type="date" className={inputCls} value={filters.regFrom} onChange={e => setFilter("regFrom", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Reg. To</label>
              <input type="date" className={inputCls} value={filters.regTo} onChange={e => setFilter("regTo", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Coll. From</label>
              <input type="date" className={inputCls} value={filters.collFrom} onChange={e => setFilter("collFrom", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Coll. To</label>
              <input type="date" className={inputCls} value={filters.collTo} onChange={e => setFilter("collTo", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Coll. Time From</label>
              <input type="time" className={inputCls} value={filters.collTimeFrom} onChange={e => setFilter("collTimeFrom", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Coll. Time To</label>
              <input type="time" className={inputCls} value={filters.collTimeTo} onChange={e => setFilter("collTimeTo", e.target.value)} />
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
                className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center gap-1.5 rounded-lg bg-muted text-foreground border border-border px-5 py-2 text-sm font-bold hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
              >
                <Search className="h-3.5 w-3.5" /> Search
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
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Home Visit Records</span>
              <span className="ml-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-600">
                {filtered.length}
              </span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Visit
            </button>
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
                      <td className="px-4 py-3 text-xs text-muted-foreground">{startEntry + idx}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-teal-600">{visit.visitId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-600">
                            {visit.patientName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-xs">{visit.patientName}</p>
                            <p className="text-[10px] text-muted-foreground">{visit.age}y · {visit.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{visit.mobile}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{visit.sbu.replace("SBU - ", "")}</p>
                        <p className="text-[10px] text-muted-foreground">{visit.branch}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">{visit.phlebo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {visit.tests.slice(0, 2).map(t => (
                            <span key={t} className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground ring-1 ring-border">{t}</span>
                          ))}
                          {visit.tests.length > 2 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">+{visit.tests.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-foreground">{visit.collDate}</p>
                        <p className="text-[10px] text-muted-foreground">{visit.collTimeFrom} – {visit.collTimeTo}</p>
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
              Showing <span className="font-semibold">{startEntry}</span>–<span className="font-semibold">{endEntry}</span> of{" "}
              <span className="font-semibold">{filtered.length}</span> visits
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md ring-1 ring-border hover:bg-muted disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, page - 3), Math.min(totalPages, page + 2)
              ).map(pg => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${pg === page ? "bg-teal-600 text-white" : "hover:bg-muted text-muted-foreground ring-1 ring-border"
                    }`}
                >
                  {pg}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
          onSave={newVisit => setVisits(prev => [newVisit, ...prev])}
        />
      )}
      {viewVisit && <ViewVisitModal visit={viewVisit} onClose={() => setViewVisit(null)} />}
    </>
  );
}
