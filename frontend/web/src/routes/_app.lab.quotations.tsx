import { createFileRoute } from "@tanstack/react-router";
import { useState} from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PatientNameInput, MobileInput, EmailInput } from "@/components/common/ValidatedInputs";
import { patientNameSchema, mobileSchema, emailSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  SlidersHorizontal,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Search,
  X,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CalendarDays,
  ChevronDown,
  FileText,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Phone,
  Beaker,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  IndianRupee,
  Clock,
  CheckCircle2,
  CircleDot,
  Ban,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Maximize2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Minimize2,
  Info,
  Trash2,
  Mail,
  MessageSquare,
  Printer,
  FlaskConical,
} from "lucide-react";

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
  {
    id: "q-1",
    refNo: "QT-2026-001",
    branch: "Koramangala",
    type: "B2C",
    patientOrOrg: "Aarav Sharma",
    phone: "+91 90100 01234",
    tests: ["CBC", "Lipid Panel"],
    grossAmount: 1800,
    discount: 100,
    netAmount: 1700,
    date: d(0),
    status: "Draft",
  },
  {
    id: "q-2",
    refNo: "QT-2026-002",
    branch: "Indiranagar",
    type: "B2B",
    patientOrOrg: "Apollo Hospitals",
    phone: "+91 80200 56789",
    tests: ["HbA1c", "TSH", "Urine R/M"],
    grossAmount: 4200,
    discount: 420,
    netAmount: 3780,
    date: d(0),
    status: "Sent",
  },
  {
    id: "q-3",
    refNo: "QT-2026-003",
    branch: "Whitefield",
    type: "B2C",
    patientOrOrg: "Diya Kapoor",
    phone: "+91 97300 11111",
    tests: ["Urinalysis"],
    grossAmount: 600,
    discount: 0,
    netAmount: 600,
    date: d(1),
    status: "Approved",
  },
  {
    id: "q-4",
    refNo: "QT-2026-004",
    branch: "Koramangala",
    type: "B2B",
    patientOrOrg: "Fortis Healthcare",
    phone: "+91 98400 22222",
    tests: ["CBC", "LFT", "KFT"],
    grossAmount: 6800,
    discount: 680,
    netAmount: 6120,
    date: d(1),
    status: "Approved",
  },
  {
    id: "q-5",
    refNo: "QT-2026-005",
    branch: "Jayanagar",
    type: "B2C",
    patientOrOrg: "Arjun Mehta",
    phone: "+91 99500 33333",
    tests: ["Thyroid Profile"],
    grossAmount: 1200,
    discount: 50,
    netAmount: 1150,
    date: d(2),
    status: "Rejected",
  },
  {
    id: "q-6",
    refNo: "QT-2026-006",
    branch: "Indiranagar",
    type: "B2C",
    patientOrOrg: "Saanvi Patel",
    phone: "+91 91600 44444",
    tests: ["HbA1c"],
    grossAmount: 800,
    discount: 0,
    netAmount: 800,
    date: d(2),
    status: "Sent",
  },
  {
    id: "q-7",
    refNo: "QT-2026-007",
    branch: "Whitefield",
    type: "B2B",
    patientOrOrg: "Manipal Group",
    phone: "+91 92700 55555",
    tests: ["Lipid Panel", "CBC"],
    grossAmount: 3600,
    discount: 360,
    netAmount: 3240,
    date: d(3),
    status: "Draft",
  },
  {
    id: "q-8",
    refNo: "QT-2026-008",
    branch: "Koramangala",
    type: "B2C",
    patientOrOrg: "Liam Carter",
    phone: "+91 93800 66666",
    tests: ["Vitamin D", "B12"],
    grossAmount: 2400,
    discount: 200,
    netAmount: 2200,
    date: d(4),
    status: "Approved",
  },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<
  QuotationStatus,
  { label: string; icon: React.ElementType; bg: string; text: string; dot: string }
> = {
  Draft: {
    label: "Draft",
    icon: CircleDot,
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  Sent: {
    label: "Sent",
    icon: Clock,
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Approved: {
    label: "Approved",
    icon: CheckCircle2,
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  Rejected: {
    label: "Rejected",
    icon: Ban,
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};

function StatusBadge({ status }: { status: QuotationStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} aria-hidden="true" />
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: QuotationType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
        type === "B2B"
          ? "bg-primary/10 text-primary"
          : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
      }`}
    >
      {type}
    </span>
  );
}

// ─── Branch Details toast placeholder ───────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleBranchDetails() {
  toast.info("Branch details panel coming soon");
}

// ─── Add Quotation Modal ───────────────────────────────────────────────────────
const B2B_OPTIONS = [
  "Select B2B",
  "Apollo Hospitals",
  "Fortis Healthcare",
  "Manipal Group",
  "Narayana Health",
];
const SERVICE_OPTIONS = [
  "Select Service",
  "CBC (Complete Blood Count)",
  "Lipid Panel",
  "HbA1c",
  "TSH",
  "Urinalysis",
  "Thyroid Profile",
  "Vitamin D",
  "Vitamin B12",
  "LFT",
  "KFT",
  "Urine R/M",
];

const MOCK_PRICES: Record<string, number> = {
  "CBC (Complete Blood Count)": 400,
  "Lipid Panel": 800,
  HbA1c: 500,
  TSH: 450,
  Urinalysis: 200,
  "Thyroid Profile": 1200,
  "Vitamin D": 1500,
  "Vitamin B12": 1100,
  LFT: 750,
  KFT: 850,
  "Urine R/M": 250,
};

interface ServiceRow {
  id: string;
  service: string;
  price: number;
  discount: number;
  net: number;
}

// ─── Mock visit detail lookup (per quotation) ─────────────────────────────────
const MOCK_VISIT_DETAILS: Record<string, { patientName: string; mobile: string; email: string }> = {
  "q-1": { patientName: "Aarav Sharma", mobile: "9010001234", email: "aarav.sharma@email.com" },
  "q-2": { patientName: "Apollo Hospitals", mobile: "8020056789", email: "billing@apollo.com" },
  "q-3": { patientName: "Diya Kapoor", mobile: "9730011111", email: "diya.kapoor@email.com" },
  "q-4": { patientName: "Fortis Healthcare", mobile: "9840022222", email: "billing@fortis.com" },
  "q-5": { patientName: "Arjun Mehta", mobile: "9950033333", email: "arjun.mehta@email.com" },
  "q-6": { patientName: "Saanvi Patel", mobile: "9160044444", email: "saanvi.patel@email.com" },
  "q-7": { patientName: "Manipal Group", mobile: "9270055555", email: "billing@manipal.com" },
  "q-8": { patientName: "Liam Carter", mobile: "9380066666", email: "liam.carter@email.com" },
};

function LabQuotations() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [infoService, setInfoService] = useState("");
  const [loadedRefNo, setLoadedRefNo] = useState<string | null>(null);

  // Section 2 — Branch & Client
  const [modalBranch, setModalBranch] = useState(BRANCHES[0]!);
  const [b2b, setB2b] = useState(B2B_OPTIONS[0]!);
  const [sampleCollectedNow, setSampleCollectedNow] = useState(true);

  // Section 3 — Services
  const [selectedService, setSelectedService] = useState(SERVICE_OPTIONS[0]!);
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleServiceInfo = (serviceName?: string | any) => {
    const target = typeof serviceName === "string" ? serviceName : selectedService;
    if (!target || target === SERVICE_OPTIONS[0]) {
      if (serviceRows.length > 0) {
        setInfoService(serviceRows[serviceRows.length - 1].service);
        setInfoOpen(true);
      } else {
        toast.warning("Please select a service first to view its info.");
      }
      return;
    }
    setInfoService(target);
    setInfoOpen(true);
  };

  const addServiceRow = () => {
    if (selectedService === SERVICE_OPTIONS[0]) {
      toast.warning("Please select a service first");
      return;
    }
    const price = MOCK_PRICES[selectedService] || 500;
    setServiceRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        service: selectedService,
        price,
        discount: 0,
        net: price,
      },
    ]);
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
    setModalBranch(BRANCHES[0]!);
    setB2b(B2B_OPTIONS[0]!);
    setSampleCollectedNow(true);
    setSelectedService(SERVICE_OPTIONS[0]!);
    setServiceRows([]);
    setRemarks("");
    setPatientName("");
    setMobile("");
    setEmail("");
    setPrintOn(false);
    setSmsOn(false);
    setEmailOn(false);
    setLoadedRefNo(null);
  };

  // Auto-fetch visit details from history and populate the form
  const handleLoadFromHistory = (q: Quotation) => {
    const detail = MOCK_VISIT_DETAILS[q.id];
    // Branch
    const matchBranch = BRANCHES.find((b) => b === q.branch);
    setModalBranch(matchBranch ?? BRANCHES[0]!);
    // B2B
    const matchB2b = B2B_OPTIONS.find((o) => o === q.patientOrOrg);
    setB2b(matchB2b ?? B2B_OPTIONS[0]!);
    // Services — map short names back to full SERVICE_OPTIONS labels
    const mapped: ServiceRow[] = q.tests.map((t) => {
      const fullName = SERVICE_OPTIONS.find((s) => s.includes(t)) ?? t;
      const price = MOCK_PRICES[fullName] ?? MOCK_PRICES[t] ?? 500;
      return { id: crypto.randomUUID(), service: fullName, price, discount: 0, net: price };
    });
    setServiceRows(mapped);
    setSelectedService(SERVICE_OPTIONS[0]!);
    // Patient info
    if (detail) {
      setPatientName(detail.patientName);
      setMobile(detail.mobile);
      setEmail(detail.email);
    } else {
      setPatientName(q.patientOrOrg);
      setMobile(q.phone.replace(/[^0-9]/g, "").slice(-10));
      setEmail("");
    }
    setRemarks("");
    setLoadedRefNo(q.refNo);
    setHistoryOpen(false);
    toast.success(`Visit ${q.refNo} loaded — review and save.`);
  };

  const handleSave = () => {
    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    const nameRes = patientNameSchema.safeParse(patientName);
    if (!nameRes.success) {
      toast.error("Patient name should contain only alphabets.");
      return;
    }
    if (!mobile.trim()) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    const mobileRes = mobileSchema.safeParse(mobile);
    if (!mobileRes.success) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!email.trim()) {
      toast.error("Enter a valid email address.");
      return;
    }
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (serviceRows.length === 0) {
      toast.error("Add at least one service");
      return;
    }
    toast.success(`Quotation saved for ${patientName}`);
    resetForm();
  };

  return (
    <>
      <PageHeader
        eyebrow="Lab · Transaction"
        title="Create Quotation"
        description="Create and manage a new lab service quotation."
        actions={
          <div className="flex items-center gap-2">
            {loadedRefNo && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
                <FlaskConical className="h-3 w-3" />
                Loaded: {loadedRefNo}
                <button
                  onClick={resetForm}
                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                  aria-label="Clear loaded quotation"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(true)}
              id="btn-view-history"
              className="flex items-center gap-1.5"
            >
              <Clock className="h-4 w-4 text-muted-foreground" />
              View History
            </Button>
          </div>
        }
      />

      <div className="max-w-5xl space-y-5 mt-4">
        {/* Section 2: Branch & Client */}
        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Branch &amp; Client
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Branch */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="modal-branch">
                Branch
              </label>
              <div className="relative">
                <select
                  id="modal-branch"
                  value={modalBranch}
                  onChange={(e) => setModalBranch(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            {/* B2B */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-foreground" htmlFor="modal-b2b">
                B2B
              </label>
              <div className="relative">
                <select
                  id="modal-b2b"
                  value={b2b}
                  onChange={(e) => setB2b(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  {B2B_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Service &amp; Testing
          </p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                id="modal-service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8"
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
              onClick={handleServiceInfo}
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
              <div className="flex items-center justify-between bg-muted/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <div className="flex-1">Service</div>
                <div className="w-14 text-right">Price</div>
                <div className="w-14 text-right">Disc %</div>
                <div className="w-20 text-right">Net</div>
                <div className="w-8"></div>
              </div>
              {serviceRows.map((row, idx) => (
                <div
                  key={row.id}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 ${
                    idx !== serviceRows.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex flex-1 items-center gap-2">
                    <Beaker className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{row.service}</span>
                  </div>
                  <div className="w-14 text-right text-xs">₹{row.price}</div>
                  <div className="w-14 text-right text-xs">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.discount === 0 ? "" : row.discount}
                      onChange={(e) => {
                        const d = Number(e.target.value) || 0;
                        setServiceRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id
                              ? { ...r, discount: d, net: r.price * (1 - d / 100) }
                              : r
                          )
                        );
                      }}
                      placeholder="0"
                      className="w-full bg-background border border-border rounded px-1 py-0.5 outline-none text-right placeholder:text-muted-foreground/40 focus:ring-1 focus:ring-primary/50"
                    />
                  </div>
                  <div className="w-20 text-right text-xs font-semibold">₹{row.net.toFixed(2)}</div>
                  <button
                    onClick={() => removeServiceRow(row.id)}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label="Remove service"
                    id={`btn-remove-service-${row.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between bg-muted/10 px-3 py-2 border-t border-border">
                <span className="text-xs font-bold text-muted-foreground">Total</span>
                <span className="text-sm font-bold text-foreground">
                  ₹{serviceRows.reduce((sum, r) => sum + r.net, 0).toFixed(2)}
                </span>
              </div>
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
          <label className="text-xs font-semibold text-foreground" htmlFor="modal-remarks">
            Remarks
          </label>
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Patient Profile
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Left: fields */}
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-foreground"
                  htmlFor="modal-patient-name"
                >
                  Patient Name <span className="text-destructive">*</span>
                </label>
                <PatientNameInput
                  id="modal-patient-name"
                  value={patientName}
                  onChange={setPatientName}
                  required
                  placeholder="Enter patient name"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground" htmlFor="modal-mobile">
                  Mobile <span className="text-destructive">*</span>
                </label>
                <MobileInput
                  id="modal-mobile"
                  value={mobile}
                  onChange={setMobile}
                  required
                  placeholder="(+91) Mobile Number"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground" htmlFor="modal-email">
                  Email <span className="text-destructive">*</span>
                </label>
                <EmailInput
                  id="modal-email"
                  value={email}
                  onChange={setEmail}
                  required
                  placeholder="example@domain.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Right: communication toggles */}
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Communication
              </p>
              {[
                {
                  label: "Print",
                  icon: Printer,
                  val: printOn,
                  set: setPrintOn,
                  id: "modal-toggle-print",
                },
                {
                  label: "SMS",
                  icon: MessageSquare,
                  val: smsOn,
                  set: setSmsOn,
                  id: "modal-toggle-sms",
                },
                {
                  label: "Email",
                  icon: Mail,
                  val: emailOn,
                  set: setEmailOn,
                  id: "modal-toggle-email",
                },
              ].map(({ label, icon: Icon, val, set, id }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${val ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {val ? "ON" : "OFF"}
                    </span>
                    <Switch id={id} checked={val} onCheckedChange={set} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border mt-4">
          <Button size="default" onClick={handleSave} id="btn-save-quotation">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Save Quotation
          </Button>
        </div>
      </div>

      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-w-md w-full p-0 overflow-hidden">
          <DialogHeader className="border-b border-border px-5 py-3.5 bg-muted/20">
            <DialogTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-primary" />
              Service Information
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 py-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Service Name
              </p>
              <p className="text-sm font-medium text-foreground">{infoService}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-muted/20 rounded-lg p-3 border border-border">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Base Price
                </p>
                <p className="text-sm font-semibold text-primary">
                  ₹{MOCK_PRICES[infoService] || 500}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Sample Type
                </p>
                <p className="text-sm font-medium text-foreground">Blood / Serum</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Turnaround Time
                </p>
                <p className="text-sm font-medium text-foreground">24 Hours</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Pre-requisites
                </p>
                <p className="text-sm font-medium text-foreground">Fasting required</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This test evaluates the levels of{" "}
                <span className="font-medium text-foreground">{infoService}</span> to help in
                diagnosing related health conditions. Standard clinical protocols are followed.
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-border px-5 py-3.5 bg-muted/20">
            <Button size="sm" onClick={() => setInfoOpen(false)} id="btn-close-service-info">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl w-full p-0 overflow-hidden flex flex-col max-h-[85vh]">
          <DialogHeader className="border-b border-border px-5 py-3.5 bg-muted/20 shrink-0">
            <DialogTitle className="font-display text-base font-semibold flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-primary" />
              Saved Quotations History
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 bg-muted/5">
            {MOCK_QUOTATIONS.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-10">
                No saved quotations found.
              </p>
            ) : (
              <div className="space-y-3">
                {MOCK_QUOTATIONS.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {/* Clickable Ref No — auto-fetches the visit */}
                          <button
                            id={`btn-load-visit-${q.id}`}
                            onClick={() => handleLoadFromHistory(q)}
                            title="Click to load this quotation into the form"
                            className="font-semibold text-primary text-sm underline underline-offset-2 decoration-dotted hover:decoration-solid hover:text-primary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded cursor-pointer"
                          >
                            {q.refNo}
                          </button>
                          <TypeBadge type={q.type} />
                          <StatusBadge status={q.status} />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {q.patientOrOrg} • {q.phone}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-sm">
                          Tests: {q.tests.join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <p className="text-sm font-bold text-foreground">₹{q.netAmount.toFixed(2)}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {q.branch}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(q.date).toLocaleDateString()}
                      </p>
                      <button
                        id={`btn-load-visit-action-${q.id}`}
                        onClick={() => handleLoadFromHistory(q)}
                        className="mt-1 text-[10px] font-semibold text-primary/70 hover:text-primary underline underline-offset-1 decoration-dotted hover:decoration-solid transition-colors"
                      >
                        Load into form ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end border-t border-border px-5 py-3.5 bg-background shrink-0">
            <Button size="sm" onClick={() => setHistoryOpen(false)} id="btn-close-history">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
