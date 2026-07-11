import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Building2,
  SlidersHorizontal,
  Search,
  X,
  CalendarDays,
  ChevronDown,
  FileText,
  User,
  Phone,
  Beaker,
  IndianRupee,
  Clock,
  CheckCircle2,
  CircleDot,
  Ban,
  Maximize2,
  Minimize2,
  Info,
  Trash2,
  Mail,
  MessageSquare,
  Printer,
  FlaskConical,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lab/quotations")({
  component: LabQuotations,
});

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const BRANCHES = ["Select Branch", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar"];

type QuotationType = "B2C" | "B2B";
type QuotationStatus = "Draft" | "Sent" | "Approved" | "Rejected";

interface Quotation {
  id: string;
  refNo: string;
  branch: string;
  type: QuotationType;
  patientOrOrg: string;
  phone: string;
  tests: string[];
  grossAmount: number;
  discount: number;
  netAmount: number;
  date: string;
  status: QuotationStatus;
}

const today = new Date();
const d = (n: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() - n);
  return dt.toISOString();
};

const MOCK_QUOTATIONS: Quotation[] = [
  { id: "q-1", refNo: "QT-2026-001", branch: "Koramangala", type: "B2C", patientOrOrg: "Aarav Sharma", phone: "+91 90100 01234", tests: ["CBC", "Lipid Panel"], grossAmount: 1800, discount: 100, netAmount: 1700, date: d(0), status: "Draft" },
  { id: "q-2", refNo: "QT-2026-002", branch: "Indiranagar", type: "B2B", patientOrOrg: "Apollo Hospitals", phone: "+91 80200 56789", tests: ["HbA1c", "TSH", "Urine R/M"], grossAmount: 4200, discount: 420, netAmount: 3780, date: d(0), status: "Sent" },
  { id: "q-3", refNo: "QT-2026-003", branch: "Whitefield", type: "B2C", patientOrOrg: "Diya Kapoor", phone: "+91 97300 11111", tests: ["Urinalysis"], grossAmount: 600, discount: 0, netAmount: 600, date: d(1), status: "Approved" },
  { id: "q-4", refNo: "QT-2026-004", branch: "Koramangala", type: "B2B", patientOrOrg: "Fortis Healthcare", phone: "+91 98400 22222", tests: ["CBC", "LFT", "KFT"], grossAmount: 6800, discount: 680, netAmount: 6120, date: d(1), status: "Approved" },
  { id: "q-5", refNo: "QT-2026-005", branch: "Jayanagar", type: "B2C", patientOrOrg: "Arjun Mehta", phone: "+91 99500 33333", tests: ["Thyroid Profile"], grossAmount: 1200, discount: 50, netAmount: 1150, date: d(2), status: "Rejected" },
  { id: "q-6", refNo: "QT-2026-006", branch: "Indiranagar", type: "B2C", patientOrOrg: "Saanvi Patel", phone: "+91 91600 44444", tests: ["HbA1c"], grossAmount: 800, discount: 0, netAmount: 800, date: d(2), status: "Sent" },
  { id: "q-7", refNo: "QT-2026-007", branch: "Whitefield", type: "B2B", patientOrOrg: "Manipal Group", phone: "+91 92700 55555", tests: ["Lipid Panel", "CBC"], grossAmount: 3600, discount: 360, netAmount: 3240, date: d(3), status: "Draft" },
  { id: "q-8", refNo: "QT-2026-008", branch: "Koramangala", type: "B2C", patientOrOrg: "Liam Carter", phone: "+91 93800 66666", tests: ["Vitamin D", "B12"], grossAmount: 2400, discount: 200, netAmount: 2200, date: d(4), status: "Approved" },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<QuotationStatus, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  Draft: { label: "Draft", icon: CircleDot, bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
  Sent: { label: "Sent", icon: Clock, bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  Approved: { label: "Approved", icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  Rejected: { label: "Rejected", icon: Ban, bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

function StatusBadge({ status }: { status: QuotationStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: QuotationType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${type === "B2B"
      ? "bg-primary/10 text-primary"
      : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
      }`}>
      {type}
    </span>
  );
}

// ─── Branch Details toast placeholder ───────────────────────────────────────
function handleBranchDetails() {
  toast.info("Branch details panel coming soon");
}

// ─── Add Quotation Modal ───────────────────────────────────────────────────────
const B2B_OPTIONS = ["Select B2B", "Apollo Hospitals", "Fortis Healthcare", "Manipal Group", "Narayana Health"];
const SERVICE_OPTIONS = ["Select Service", "CBC (Complete Blood Count)", "Lipid Panel", "HbA1c", "TSH", "Urinalysis", "Thyroid Profile", "Vitamin D", "Vitamin B12", "LFT", "KFT", "Urine R/M"];

interface ServiceRow {
  id: string;
  service: string;
}

function AddQuotationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [maximized, setMaximized] = useState(false);

  // Section 2 — Branch & Client
  const [modalBranch, setModalBranch] = useState(BRANCHES[0]!);
  const [b2b, setB2b] = useState(B2B_OPTIONS[0]!);
  const [sampleCollectedNow, setSampleCollectedNow] = useState(true);

  // Section 3 — Services
  const [selectedService, setSelectedService] = useState(SERVICE_OPTIONS[0]!);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);

  const addServiceRow = () => {
    if (selectedService === SERVICE_OPTIONS[0]) {
      toast.warning("Please select a service first");
      return;
    }
    setServiceRows((prev) => [...prev, { id: crypto.randomUUID(), service: selectedService }]);
    setSelectedService(SERVICE_OPTIONS[0]!);
  };

  const removeServiceRow = (id: string) =>
    setServiceRows((prev) => prev.filter((r) => r.id !== id));

  // Section 4 — Remarks
  const [remarks, setRemarks] = useState("");

  // Section 5 — Patient
  const [patientName, setPatientName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [printOn, setPrintOn] = useState(false);
  const [smsOn, setSmsOn] = useState(false);
  const [emailOn, setEmailOn] = useState(false);

  const resetForm = () => {
    setModalBranch(BRANCHES[0]!); setB2b(B2B_OPTIONS[0]!); setSampleCollectedNow(true);
    setSelectedService(SERVICE_OPTIONS[0]!); setServiceRows([]);
    setRemarks(""); setPatientName(""); setMobile(""); setEmail("");
    setPrintOn(false); setSmsOn(false); setEmailOn(false);
    setMaximized(false);
  };

  const handleSave = () => {
    if (!patientName.trim()) { toast.error("Patient name is required"); return; }
    if (serviceRows.length === 0) { toast.error("Add at least one service"); return; }
    toast.success(`Quotation saved for ${patientName}`);
    resetForm();
    onClose();
  };

  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className={`flex flex-col gap-0 p-0 transition-all duration-200 ${maximized
          ? "!max-w-none !w-screen !h-screen !rounded-none m-0"
          : "max-w-2xl w-full max-h-[90vh]"
          }`}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* ── Modal Header ──────────────────────────────────────────── */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4.5 w-4.5 text-primary" />
            <DialogTitle className="font-display text-base font-semibold">Quotation</DialogTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMaximized(!maximized)}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted transition-colors"
              aria-label={maximized ? "Minimize" : "Maximize"}
              id="btn-modal-maximize"
            >
              {maximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleClose}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Close"
              id="btn-modal-close-top"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </DialogHeader>

        {/* ── Scrollable Body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Section 2: Branch & Client */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Branch &amp; Client</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Branch */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground" htmlFor="modal-branch">Branch</label>
                <div className="relative">
                  <select
                    id="modal-branch"
                    value={modalBranch}
                    onChange={(e) => setModalBranch(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                  >
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              {/* B2B */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground" htmlFor="modal-b2b">B2B</label>
                <div className="relative">
                  <select
                    id="modal-b2b"
                    value={b2b}
                    onChange={(e) => setB2b(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                  >
                    {B2B_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>
            {/* TAT toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Is sample collected now?</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">For TAT calculation</p>
              </div>
              <Switch
                id="modal-tat-toggle"
                checked={sampleCollectedNow}
                onCheckedChange={setSampleCollectedNow}
              />
            </div>
          </div>

          {/* Section 3: Service Selection */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Service &amp; Testing</p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  id="modal-service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {SERVICE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <button
                onClick={addServiceRow}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                aria-label="Add service"
                id="btn-add-service"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => toast.info("Service info panel coming soon")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted transition-colors"
                aria-label="Service info"
                id="btn-service-info"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            {/* Added services list */}
            {serviceRows.length > 0 && (
              <div className="rounded-lg border border-border overflow-hidden">
                {serviceRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className={`flex items-center justify-between gap-3 px-3 py-2.5 ${idx !== serviceRows.length - 1 ? "border-b border-border" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Beaker className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-sm font-medium">{row.service}</span>
                    </div>
                    <button
                      onClick={() => removeServiceRow(row.id)}
                      className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Remove service"
                      id={`btn-remove-service-${row.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {serviceRows.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-3 rounded-lg border border-dashed border-border">
                No services added yet — select and click +
              </p>
            )}
          </div>

          {/* Section 4: Remarks */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-foreground" htmlFor="modal-remarks">Remarks</label>
            <textarea
              id="modal-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Add any notes or instructions for this quotation…"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Section 5: Patient Profile + Communication Prefs */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Patient Profile</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Left: fields */}
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground" htmlFor="modal-patient-name">
                    Patient Name <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      id="modal-patient-name"
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground" htmlFor="modal-mobile">Mobile</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      id="modal-mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-foreground" htmlFor="modal-email">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      id="modal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@email.com"
                      className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* Right: communication toggles */}
              <div className="flex flex-col justify-center gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Communication</p>
                {[
                  { label: "Print", icon: Printer, val: printOn, set: setPrintOn, id: "modal-toggle-print" },
                  { label: "SMS", icon: MessageSquare, val: smsOn, set: setSmsOn, id: "modal-toggle-sms" },
                  { label: "Email", icon: Mail, val: emailOn, set: setEmailOn, id: "modal-toggle-email" },
                ].map(({ label, icon: Icon, val, set, id }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${val ? "text-primary" : "text-muted-foreground"}`}>
                        {val ? "ON" : "OFF"}
                      </span>
                      <Switch id={id} checked={val} onCheckedChange={set} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 shrink-0 bg-muted/20">
          <Button variant="outline" size="sm" onClick={handleClose} id="btn-modal-form-close">
            <X className="mr-1.5 h-3.5 w-3.5" />
            Close
          </Button>
          <Button size="sm" onClick={handleSave} id="btn-modal-save">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function LabQuotations() {
  const [addOpen, setAddOpen] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(true);
  const [branch, setBranch] = useState(BRANCHES[0]!);
  const [from, setFrom] = useState(format(today, "yyyy-MM-dd"));
  const [to, setTo] = useState(format(today, "yyyy-MM-dd"));
  const [typeFilter, setTypeFilter] = useState<"ALL" | "B2B" | "B2C">("ALL");

  // Applied filters (only applied on Search click)
  const [applied, setApplied] = useState<{
    branch: string; from: string; to: string; type: "ALL" | "B2B" | "B2C";
  }>({ branch: BRANCHES[0]!, from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd"), type: "ALL" });

  const handleSearch = () => setApplied({ branch, from, to, type: typeFilter });
  const handleClear = () => {
    setBranch(BRANCHES[0]!);
    setFrom(format(today, "yyyy-MM-dd"));
    setTo(format(today, "yyyy-MM-dd"));
    setTypeFilter("ALL");
    setApplied({ branch: BRANCHES[0]!, from: format(today, "yyyy-MM-dd"), to: format(today, "yyyy-MM-dd"), type: "ALL" });
  };

  // Filtered data
  const filtered = useMemo(() => {
    return MOCK_QUOTATIONS.filter((q) => {
      if (applied.branch !== "Select Branch" && q.branch !== applied.branch) return false;
      if (applied.type !== "ALL" && q.type !== applied.type) return false;
      const qDate = new Date(q.date).toISOString().split("T")[0]!;
      if (applied.from && qDate < applied.from) return false;
      if (applied.to && qDate > applied.to) return false;
      return true;
    });
  }, [applied]);

  // Summary stats
  const totalGross = filtered.reduce((s, q) => s + q.grossAmount, 0);
  const totalDiscount = filtered.reduce((s, q) => s + q.discount, 0);
  const totalNet = filtered.reduce((s, q) => s + q.netAmount, 0);
  const b2bCount = filtered.filter((q) => q.type === "B2B").length;
  const b2cCount = filtered.filter((q) => q.type === "B2C").length;

  return (
    <>
      <PageHeader
        eyebrow="Lab · Transaction"
        title="Quotation List"
        description="Manage and track all lab service quotations across branches."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBranchDetails}
              id="btn-branch-details"
            >
              <Building2 className="mr-1.5 h-4 w-4" />
              Branch Details
            </Button>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              id="btn-add-quotation"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add
            </Button>
            <AddQuotationModal open={addOpen} onClose={() => setAddOpen(false)} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${showFilters
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              aria-label="Toggle filters"
              aria-pressed={showFilters}
              id="btn-toggle-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        }
      />

      {/* ── Filter Panel ──────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-5 surface-elevated p-4">
          <div className="flex flex-wrap items-end gap-4">
            {/* Branch */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Branch
              </label>
              <div className="relative flex items-center rounded-lg border border-border bg-background px-3 py-2">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-transparent text-sm text-foreground outline-none cursor-pointer pr-6 appearance-none min-w-[160px]"
                  id="filter-branch-select"
                >
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Date Range
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-32 bg-transparent text-sm outline-none text-foreground"
                    id="filter-from"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">to</span>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-32 bg-transparent text-sm outline-none text-foreground"
                    id="filter-to"
                  />
                </div>
              </div>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Type
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 h-[42px]">
                {(["ALL", "B2B", "B2C"] as const).map((t) => (
                  <label key={t} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="quotation-type"
                      value={t}
                      checked={typeFilter === t}
                      onChange={() => setTypeFilter(t)}
                      className="accent-primary"
                      id={`filter-type-${t.toLowerCase()}`}
                    />
                    <span className="text-sm font-medium text-foreground">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-0.5">
              <Button size="sm" onClick={handleSearch} id="btn-search">
                <Search className="mr-1.5 h-3.5 w-3.5" />
                Search
              </Button>
              <Button size="sm" variant="outline" onClick={handleClear} id="btn-clear">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
