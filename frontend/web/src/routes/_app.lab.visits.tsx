import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  SlidersHorizontal,
  Search,
  X,
  CalendarDays,
  ChevronDown,
  Plus,
  User,
  Phone,
  RefreshCw,
  Grid2X2,
  ClipboardList,
  AlertTriangle,
  UserCheck,
  Building2,
  Hash,
  BadgeCheck,
  Eye,
  Printer,
  MoreHorizontal,
  Home,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { StatusChip } from "@/components/common/StatusChip";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lab/visits")({
  component: VisitListDashboard,
});

// ─── Constants ─────────────────────────────────────────────────────────────────
const TODAY = format(new Date(), "yyyy-MM-dd");

const SBU_OPTIONS = [
  "All SBU",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Mumbai",
  "Pune",
];

const BRANCH_OPTIONS = [
  "All Branches",
  "Koramangala",
  "Indiranagar",
  "Whitefield",
  "Jayanagar",
  "Marathahalli",
  "HSR Layout",
];

const PHLEBO_OPTIONS = [
  "All Phlebotomists",
  "Ravi Kumar",
  "Sunita Devi",
  "Mohan Lal",
  "Priya Singh",
  "Anil Sharma",
];

const STATUS_OPTIONS = [
  "All Status",
  "Pending",
  "Confirmed",
  "Sample Collected",
  "In Transit",
  "At Lab",
  "Completed",
  "Cancelled",
];

const CATEGORY_OPTIONS = [
  "All Categories",
  "Home Visit",
  "Walk-In",
  "B2B",
  "Corporate",
];

const INTEGRATION_OPTIONS = [
  "All",
  "Portea",
  "1mg",
  "PharmEasy",
  "Practo",
  "Internal",
];

const REFRESH_INTERVALS = ["Off", "1", "2", "5", "10", "15"];

// ─── Status tone mapping ───────────────────────────────────────────────────────
const statusTone: Record<
  string,
  "info" | "primary" | "warning" | "success" | "danger" | "neutral"
> = {
  Pending: "warning",
  Confirmed: "info",
  "Sample Collected": "primary",
  "In Transit": "info",
  "At Lab": "primary",
  Completed: "success",
  Cancelled: "danger",
};

// ─── Category icon ─────────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const isHome = category === "Home Visit";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isHome
          ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
          : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
      }`}
    >
      {isHome ? <Home className="h-2.5 w-2.5" /> : <MapPin className="h-2.5 w-2.5" />}
      {category}
    </span>
  );
}

// ─── Mock Visit Data ───────────────────────────────────────────────────────────
interface Visit {
  id: string;
  visitId: string;
  patientName: string;
  mobile: string;
  sbu: string;
  branch: string;
  phlebo: string;
  status: string;
  category: string;
  regDate: string;
  collDate: string;
  tests: string[];
  grossAmount: number;
  netAmount: number;
  integration: string;
  attentionRequired: boolean;
  hasChildVisit: boolean;
  visitOrder: string;
}

const today = new Date();
const dOffset = (n: number, h = 8, m = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const MOCK_VISITS: Visit[] = [
  {
    id: "v-1",
    visitId: "VIS-2026-001",
    patientName: "Aarav Sharma",
    mobile: "+91 90100 01234",
    sbu: "Bangalore",
    branch: "Koramangala",
    phlebo: "Ravi Kumar",
    status: "Pending",
    category: "Home Visit",
    regDate: dOffset(0, 7, 15),
    collDate: dOffset(0, 9, 0),
    tests: ["CBC", "Lipid Panel"],
    grossAmount: 1800,
    netAmount: 1700,
    integration: "1mg",
    attentionRequired: true,
    hasChildVisit: false,
    visitOrder: "VO-001",
  },
  {
    id: "v-2",
    visitId: "VIS-2026-002",
    patientName: "Saanvi Patel",
    mobile: "+91 91600 44444",
    sbu: "Bangalore",
    branch: "Indiranagar",
    phlebo: "Sunita Devi",
    status: "Confirmed",
    category: "Home Visit",
    regDate: dOffset(0, 7, 45),
    collDate: dOffset(0, 10, 30),
    tests: ["HbA1c", "TSH"],
    grossAmount: 1400,
    netAmount: 1400,
    integration: "Portea",
    attentionRequired: false,
    hasChildVisit: true,
    visitOrder: "VO-002",
  },
  {
    id: "v-3",
    visitId: "VIS-2026-003",
    patientName: "Vihaan Iyer",
    mobile: "+91 97300 55555",
    sbu: "Bangalore",
    branch: "Whitefield",
    phlebo: "Mohan Lal",
    status: "Sample Collected",
    category: "Walk-In",
    regDate: dOffset(0, 8, 0),
    collDate: dOffset(0, 8, 30),
    tests: ["Urinalysis"],
    grossAmount: 600,
    netAmount: 600,
    integration: "Internal",
    attentionRequired: false,
    hasChildVisit: false,
    visitOrder: "VO-003",
  },
  {
    id: "v-4",
    visitId: "VIS-2026-004",
    patientName: "Diya Kapoor",
    mobile: "+91 98400 22222",
    sbu: "Chennai",
    branch: "Koramangala",
    phlebo: "Priya Singh",
    status: "In Transit",
    category: "Home Visit",
    regDate: dOffset(0, 6, 30),
    collDate: dOffset(0, 8, 45),
    tests: ["Thyroid Profile", "Vitamin D"],
    grossAmount: 2200,
    netAmount: 2000,
    integration: "PharmEasy",
    attentionRequired: true,
    hasChildVisit: false,
    visitOrder: "VO-004",
  },
  {
    id: "v-5",
    visitId: "VIS-2026-005",
    patientName: "Arjun Mehta",
    mobile: "+91 99500 33333",
    sbu: "Bangalore",
    branch: "Jayanagar",
    phlebo: "Anil Sharma",
    status: "At Lab",
    category: "B2B",
    regDate: dOffset(0, 9, 0),
    collDate: dOffset(0, 9, 30),
    tests: ["CBC", "LFT", "KFT"],
    grossAmount: 3600,
    netAmount: 3240,
    integration: "Practo",
    attentionRequired: false,
    hasChildVisit: true,
    visitOrder: "VO-005",
  },
  {
    id: "v-6",
    visitId: "VIS-2026-006",
    patientName: "Anaya Reddy",
    mobile: "+91 92700 66666",
    sbu: "Hyderabad",
    branch: "Marathahalli",
    phlebo: "Sunita Devi",
    status: "Completed",
    category: "Corporate",
    regDate: dOffset(1, 8, 0),
    collDate: dOffset(1, 9, 15),
    tests: ["Lipid Panel", "Blood Sugar"],
    grossAmount: 1600,
    netAmount: 1500,
    integration: "Internal",
    attentionRequired: false,
    hasChildVisit: false,
    visitOrder: "VO-006",
  },
  {
    id: "v-7",
    visitId: "VIS-2026-007",
    patientName: "Reyansh Khanna",
    mobile: "+91 93800 77777",
    sbu: "Bangalore",
    branch: "HSR Layout",
    phlebo: "Ravi Kumar",
    status: "Pending",
    category: "Home Visit",
    regDate: dOffset(0, 10, 0),
    collDate: dOffset(0, 11, 0),
    tests: ["TSH", "Iron Studies"],
    grossAmount: 1900,
    netAmount: 1710,
    integration: "1mg",
    attentionRequired: true,
    hasChildVisit: false,
    visitOrder: "VO-007",
  },
  {
    id: "v-8",
    visitId: "VIS-2026-008",
    patientName: "Ishaani Rao",
    mobile: "+91 94900 88888",
    sbu: "Mumbai",
    branch: "Koramangala",
    phlebo: "Mohan Lal",
    status: "Cancelled",
    category: "Home Visit",
    regDate: dOffset(0, 7, 0),
    collDate: dOffset(0, 8, 0),
    tests: ["HbA1c"],
    grossAmount: 800,
    netAmount: 800,
    integration: "Portea",
    attentionRequired: false,
    hasChildVisit: false,
    visitOrder: "VO-008",
  },
  {
    id: "v-9",
    visitId: "VIS-2026-009",
    patientName: "Kabir Joshi",
    mobile: "+91 95000 99999",
    sbu: "Pune",
    branch: "Whitefield",
    phlebo: "Priya Singh",
    status: "Confirmed",
    category: "Walk-In",
    regDate: dOffset(0, 11, 0),
    collDate: dOffset(0, 11, 30),
    tests: ["CBC", "Blood Sugar"],
    grossAmount: 900,
    netAmount: 810,
    integration: "Internal",
    attentionRequired: false,
    hasChildVisit: true,
    visitOrder: "VO-009",
  },
  {
    id: "v-10",
    visitId: "VIS-2026-010",
    patientName: "Aadhya Nair",
    mobile: "+91 96100 00000",
    sbu: "Bangalore",
    branch: "Indiranagar",
    phlebo: "Anil Sharma",
    status: "Sample Collected",
    category: "Home Visit",
    regDate: dOffset(0, 8, 30),
    collDate: dOffset(0, 9, 45),
    tests: ["Vitamin D", "Calcium", "Phosphorus"],
    grossAmount: 2800,
    netAmount: 2520,
    integration: "PharmEasy",
    attentionRequired: true,
    hasChildVisit: false,
    visitOrder: "VO-010",
  },
  {
    id: "v-11",
    visitId: "VIS-2026-011",
    patientName: "Ayaan Bose",
    mobile: "+91 97200 11111",
    sbu: "Chennai",
    branch: "Jayanagar",
    phlebo: "Ravi Kumar",
    status: "At Lab",
    category: "B2B",
    regDate: dOffset(1, 7, 0),
    collDate: dOffset(1, 8, 30),
    tests: ["CBC", "Urine R/M", "LFT"],
    grossAmount: 3200,
    netAmount: 2880,
    integration: "Practo",
    attentionRequired: false,
    hasChildVisit: true,
    visitOrder: "VO-011",
  },
  {
    id: "v-12",
    visitId: "VIS-2026-012",
    patientName: "Myra Sen",
    mobile: "+91 98300 22222",
    sbu: "Bangalore",
    branch: "HSR Layout",
    phlebo: "Sunita Devi",
    status: "Pending",
    category: "Home Visit",
    regDate: dOffset(0, 12, 0),
    collDate: dOffset(0, 13, 0),
    tests: ["Thyroid Profile"],
    grossAmount: 1200,
    netAmount: 1050,
    integration: "1mg",
    attentionRequired: true,
    hasChildVisit: false,
    visitOrder: "VO-012",
  },
];

// ─── Select Field helper ───────────────────────────────────────────────────────
function SelectField({
  label,
  value,
  onChange,
  options,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  id: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1.5" />
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs text-foreground outline-none"
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  id,
  icon: Icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  id: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {Icon && (
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1.5" />
        )}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="ml-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Phlebo Assignment Modal (lightweight) ────────────────────────────────────
function AssignModal({
  open,
  onClose,
  selectedCount,
}: {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
}) {
  const [phlebo, setPhlebo] = useState(PHLEBO_OPTIONS[1]!);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 surface-elevated w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-base">
            Assign Phlebotomist
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Assigning to{" "}
          <span className="font-semibold text-foreground">{selectedCount}</span>{" "}
          selected visit{selectedCount > 1 ? "s" : ""}.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Phlebotomist
          </label>
          <div className="relative">
            <select
              value={phlebo}
              onChange={(e) => setPhlebo(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
            >
              {PHLEBO_OPTIONS.slice(1).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast.success(`Assigned to ${phlebo}`);
              onClose();
            }}
          >
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Visit Modal ──────────────────────────────────────────────────────────
function AddVisitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 surface-elevated w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="font-display font-semibold text-base">
              New Visit / Home Collection
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a patient visit request manually
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Patient Name"
            placeholder="Full name"
            value=""
            onChange={() => {}}
            id="new-visit-name"
            icon={User}
          />
          <TextField
            label="Mobile"
            placeholder="+91 XXXXX XXXXX"
            value=""
            onChange={() => {}}
            id="new-visit-mobile"
            icon={Phone}
          />
          <SelectField
            label="SBU"
            value={SBU_OPTIONS[1]!}
            onChange={() => {}}
            options={SBU_OPTIONS.slice(1)}
            id="new-visit-sbu"
          />
          <SelectField
            label="Branch"
            value={BRANCH_OPTIONS[1]!}
            onChange={() => {}}
            options={BRANCH_OPTIONS.slice(1)}
            id="new-visit-branch"
          />
          <SelectField
            label="Category"
            value={CATEGORY_OPTIONS[1]!}
            onChange={() => {}}
            options={CATEGORY_OPTIONS.slice(1)}
            id="new-visit-category"
          />
          <SelectField
            label="Phlebotomist"
            value={PHLEBO_OPTIONS[1]!}
            onChange={() => {}}
            options={PHLEBO_OPTIONS.slice(1)}
            id="new-visit-phlebo"
          />
          <DateField
            label="Collection Date"
            value={TODAY}
            onChange={() => {}}
            id="new-visit-colldate"
          />
          <TextField
            label="Tests (comma-separated)"
            placeholder="CBC, TSH, HbA1c..."
            value=""
            onChange={() => {}}
            id="new-visit-tests"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              toast.success("Visit created successfully");
              onClose();
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Visit
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Auto-Refresh Hook ─────────────────────────────────────────────────────────
function useAutoRefresh(intervalMin: string, onRefresh: () => void) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const mins = parseInt(intervalMin);
    if (!isNaN(mins) && mins > 0) {
      timerRef.current = setInterval(() => {
        onRefresh();
      }, mins * 60 * 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [intervalMin, onRefresh]);
}

// ─── Main Component ────────────────────────────────────────────────────────────
function VisitListDashboard() {
  // ── Toolbar state
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // ── Filter state
  const [sbu, setSbu] = useState("All SBU");
  const [branch, setBranch] = useState("All Branches");
  const [phlebo, setPhlebo] = useState("All Phlebotomists");
  const [mobile, setMobile] = useState("");
  const [visitId, setVisitId] = useState("");
  const [status, setStatus] = useState("Pending");
  const [ptFirstName, setPtFirstName] = useState("");
  const [ptMiddleName, setPtMiddleName] = useState("");
  const [ptLastName, setPtLastName] = useState("");
  const [regDateFrom, setRegDateFrom] = useState("");
  const [regDateTo, setRegDateTo] = useState("");
  const [collDateFrom, setCollDateFrom] = useState(TODAY);
  const [collDateTo, setCollDateTo] = useState(TODAY);
  const [category, setCategory] = useState("Home Visit");
  const [integration, setIntegration] = useState("All");
  const [visitOrder, setVisitOrder] = useState("");
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [includeChild, setIncludeChild] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("Off");

  // ── Table state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  // ── Click-outside for actions menu
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Auto-refresh
  const handleRefresh = () => {
    setLastRefreshed(new Date());
    toast.success("Visit list refreshed");
  };
  useAutoRefresh(refreshInterval, handleRefresh);

  // ── Filter logic
  const filteredVisits = useMemo(() => {
    return MOCK_VISITS.filter((v) => {
      if (sbu !== "All SBU" && v.sbu !== sbu) return false;
      if (branch !== "All Branches" && v.branch !== branch) return false;
      if (phlebo !== "All Phlebotomists" && v.phlebo !== phlebo) return false;
      if (status !== "All Status" && v.status !== status) return false;
      if (category !== "All Categories" && v.category !== category) return false;
      if (integration !== "All" && v.integration !== integration) return false;
      if (mobile.trim() && !v.mobile.includes(mobile.trim())) return false;
      if (visitId.trim() && !v.visitId.toLowerCase().includes(visitId.toLowerCase())) return false;
      if (visitOrder.trim() && !v.visitOrder.toLowerCase().includes(visitOrder.toLowerCase())) return false;
      if (attentionOnly && !v.attentionRequired) return false;
      if (!includeChild && v.hasChildVisit) return false; // filter out child visit rows
      const ptName = v.patientName.toLowerCase();
      const nameParts = ptName.split(" ");
      if (ptFirstName.trim() && !nameParts[0]?.includes(ptFirstName.toLowerCase())) return false;
      if (ptLastName.trim() && !nameParts[nameParts.length - 1]?.includes(ptLastName.toLowerCase())) return false;
      if (ptMiddleName.trim() && !ptName.includes(ptMiddleName.toLowerCase())) return false;
      return true;
    });
  }, [
    sbu, branch, phlebo, status, category, integration,
    mobile, visitId, visitOrder, attentionOnly, includeChild,
    ptFirstName, ptMiddleName, ptLastName,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / PAGE_SIZE));
  const paginatedVisits = filteredVisits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => {
    setHasSearched(true);
    setPage(1);
    setSelectedIds(new Set());
    toast.success(`Found ${filteredVisits.length} visits`);
  };

  const handleClear = () => {
    setSbu("All SBU");
    setBranch("All Branches");
    setPhlebo("All Phlebotomists");
    setMobile("");
    setVisitId("");
    setStatus("Pending");
    setPtFirstName("");
    setPtMiddleName("");
    setPtLastName("");
    setRegDateFrom("");
    setRegDateTo("");
    setCollDateFrom(TODAY);
    setCollDateTo(TODAY);
    setCategory("Home Visit");
    setIntegration("All");
    setVisitOrder("");
    setAttentionOnly(false);
    setIncludeChild(false);
    setHasSearched(false);
    setSelectedIds(new Set());
    setPage(1);
    toast.info("Filters cleared");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedVisits.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedVisits.map((v) => v.id)));
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Laboratory"
        title="Visit List"
        description="Search, manage and assign home collection visits."
        actions={
          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <button
              id="btn-visit-filter-toggle"
              onClick={() => setShowFilterPanel((p) => !p)}
              title="Toggle filter panel"
              className={`grid h-9 w-9 place-items-center rounded-lg border transition-all ${
                showFilterPanel
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
              aria-label="Toggle filter panel"
              aria-pressed={showFilterPanel}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            {/* Phlebo Assignment */}
            <button
              id="btn-visit-assign"
              onClick={() => {
                if (selectedIds.size === 0) {
                  toast.warning("Select at least one visit to assign");
                  return;
                }
                setShowAssignModal(true);
              }}
              title="Assign phlebotomist"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              aria-label="Assign phlebotomist"
            >
              <User className="h-4 w-4" />
            </button>

            {/* Billing Grid */}
            <button
              id="btn-visit-billing-grid"
              onClick={() => toast.info("Opening billing grid…")}
              title="Billing grid"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              aria-label="Billing grid"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>

            {/* Dropdown actions */}
            <div className="relative" ref={actionsRef}>
              <button
                id="btn-visit-actions-dropdown"
                onClick={() => setShowActionsMenu((p) => !p)}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                aria-haspopup="true"
                aria-expanded={showActionsMenu}
              >
                Actions
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {showActionsMenu && (
                <div className="absolute right-0 mt-1 z-30 w-44 rounded-xl border border-border bg-popover py-1.5 shadow-lg text-xs">
                  {[
                    { label: "Export CSV", icon: ClipboardList },
                    { label: "Print Selected", icon: Printer },
                    { label: "Mark Urgent", icon: AlertTriangle },
                    { label: "Refresh Now", icon: RefreshCw },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => {
                        toast.info(label);
                        setShowActionsMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Visit */}
            <Button
              id="btn-visit-add"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Visit
            </Button>
          </div>
        }
      />

      {/* ── Filter Panel ─────────────────────────────────────────────────────── */}
      {showFilterPanel && (
        <div className="surface-elevated p-5 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Row 1: SBU, Branch, Phlebo, Mobile, Visit ID, Status */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <SelectField
              label="SBU"
              value={sbu}
              onChange={setSbu}
              options={SBU_OPTIONS}
              id="vl-sbu"
            />
            <SelectField
              label="Branch"
              value={branch}
              onChange={setBranch}
              options={BRANCH_OPTIONS}
              id="vl-branch"
            />
            <SelectField
              label="Phlebo"
              value={phlebo}
              onChange={setPhlebo}
              options={PHLEBO_OPTIONS}
              id="vl-phlebo"
            />
            <TextField
              label="Mobile"
              placeholder="Patient mobile"
              value={mobile}
              onChange={setMobile}
              id="vl-mobile"
              icon={Phone}
            />
            <TextField
              label="Visit ID"
              placeholder="VIS-2026-..."
              value={visitId}
              onChange={setVisitId}
              id="vl-visitid"
              icon={Hash}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              id="vl-status"
            />
          </div>

          {/* Row 2: Patient name (3 parts), Reg date range, Coll date range */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
            <TextField
              label="Pt First Name"
              placeholder="First name"
              value={ptFirstName}
              onChange={setPtFirstName}
              id="vl-firstname"
              icon={User}
            />
            <TextField
              label="Pt Middle Name"
              placeholder="Middle name"
              value={ptMiddleName}
              onChange={setPtMiddleName}
              id="vl-middlename"
              icon={User}
            />
            <TextField
              label="Pt Last Name"
              placeholder="Last name"
              value={ptLastName}
              onChange={setPtLastName}
              id="vl-lastname"
              icon={User}
            />
            <DateField
              label="Reg. Date From"
              value={regDateFrom}
              onChange={setRegDateFrom}
              id="vl-regdatefrom"
            />
            <DateField
              label="Reg. Date To"
              value={regDateTo}
              onChange={setRegDateTo}
              id="vl-regdateto"
            />
            <DateField
              label="Coll. Date"
              value={collDateFrom}
              onChange={setCollDateFrom}
              id="vl-colldatefrom"
            />
            <DateField
              label="Coll. Date To"
              value={collDateTo}
              onChange={setCollDateTo}
              id="vl-colldateto"
            />
          </div>

          {/* Row 3: Category, Integration, Visit Order, toggles, refresh */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px] max-w-[180px]">
              <SelectField
                label="Category"
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
                id="vl-category"
              />
            </div>
            <div className="flex-1 min-w-[140px] max-w-[180px]">
              <SelectField
                label="Integration Software"
                value={integration}
                onChange={setIntegration}
                options={INTEGRATION_OPTIONS}
                id="vl-integration"
              />
            </div>
            <div className="flex-1 min-w-[140px] max-w-[180px]">
              <TextField
                label="Visit Order"
                placeholder="VO-..."
                value={visitOrder}
                onChange={setVisitOrder}
                id="vl-visitorder"
                icon={Hash}
              />
            </div>

            {/* Attention Required */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Attention Required
              </span>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  id="vl-attention"
                  checked={attentionOnly}
                  onCheckedChange={setAttentionOnly}
                />
                <label
                  htmlFor="vl-attention"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  {attentionOnly ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      On
                    </span>
                  ) : (
                    "Off"
                  )}
                </label>
              </div>
            </div>

            {/* Include Child Visit */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Include Child Visit
              </span>
              <div className="flex items-center gap-2 h-9">
                <Switch
                  id="vl-childvisit"
                  checked={includeChild}
                  onCheckedChange={setIncludeChild}
                />
                <label
                  htmlFor="vl-childvisit"
                  className="text-xs text-muted-foreground cursor-pointer select-none"
                >
                  {includeChild ? (
                    <span className="text-primary font-semibold">On</span>
                  ) : (
                    "Off"
                  )}
                </label>
              </div>
            </div>

            {/* Auto Refresh */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Auto Refresh (min)
              </span>
              <div className="flex items-center gap-1 h-9">
                {REFRESH_INTERVALS.map((ri) => (
                  <button
                    key={ri}
                    onClick={() => setRefreshInterval(ri)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                      refreshInterval === ri
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                    id={`vl-refresh-${ri.toLowerCase()}`}
                  >
                    {ri}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Panel Actions ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last refreshed: {format(lastRefreshed, "HH:mm:ss")}
              {refreshInterval !== "Off" && (
                <span className="ml-1 text-primary">
                  · Auto every {refreshInterval}m
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                id="btn-vl-search"
                size="sm"
                onClick={handleSearch}
                className="flex items-center gap-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
              <Button
                id="btn-vl-clear"
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results Table ─────────────────────────────────────────────────────── */}
      {hasSearched && (
        <div className="surface-elevated overflow-hidden">
          {/* Table header bar */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-semibold">
                Visit Results
              </span>
              <span className="inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-[10px] font-bold text-primary">
                {filteredVisits.length}
              </span>
              {selectedIds.size > 0 && (
                <span className="inline-flex h-5 items-center rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {selectedIds.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5"
                  onClick={() => setShowAssignModal(true)}
                >
                  <UserCheck className="mr-1 h-3 w-3" />
                  Assign
                </Button>
              )}
              <button
                onClick={handleRefresh}
                title="Refresh now"
                className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {filteredVisits.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
              <BadgeCheck className="h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">No visits match your filters</p>
              <Button size="sm" variant="outline" onClick={handleClear}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === paginatedVisits.length &&
                            paginatedVisits.length > 0
                          }
                          onChange={toggleAll}
                          className="rounded accent-primary h-3.5 w-3.5"
                          id="vl-selectall"
                          aria-label="Select all"
                        />
                      </th>
                      {[
                        "Visit ID",
                        "Patient Name",
                        "Mobile",
                        "Branch",
                        "Phlebotomist",
                        "Category",
                        "Collection Time",
                        "Tests",
                        "Net Amt",
                        "Status",
                        "Flags",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedVisits.map((visit) => {
                      const isSelected = selectedIds.has(visit.id);
                      return (
                        <tr
                          key={visit.id}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-primary/5"
                              : "hover:bg-muted/20"
                          } ${
                            visit.attentionRequired
                              ? "border-l-2 border-l-amber-500"
                              : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(visit.id)}
                              className="rounded accent-primary h-3.5 w-3.5"
                              aria-label={`Select ${visit.visitId}`}
                            />
                          </td>

                          {/* Visit ID */}
                          <td className="px-4 py-3">
                            <code className="font-mono text-xs font-bold text-primary">
                              {visit.visitId}
                            </code>
                          </td>

                          {/* Patient Name */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm whitespace-nowrap">
                                {visit.patientName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {visit.sbu}
                              </span>
                            </div>
                          </td>

                          {/* Mobile */}
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              {visit.mobile}
                            </span>
                          </td>

                          {/* Branch */}
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Building2 className="h-3 w-3 shrink-0 text-primary/60" />
                              {visit.branch}
                            </span>
                          </td>

                          {/* Phlebotomist */}
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3 shrink-0 text-teal-500" />
                              {visit.phlebo}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3">
                            <CategoryBadge category={visit.category} />
                          </td>

                          {/* Collection Time */}
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {format(new Date(visit.collDate), "dd-MMM · HH:mm")}
                            </span>
                          </td>

                          {/* Tests */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {visit.tests.map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-foreground whitespace-nowrap"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Net Amount */}
                          <td className="px-4 py-3 text-xs font-semibold tabular-nums whitespace-nowrap">
                            ₹{visit.netAmount.toLocaleString("en-IN")}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <StatusChip tone={statusTone[visit.status] ?? "neutral"}>
                              {visit.status}
                            </StatusChip>
                          </td>

                          {/* Flags */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {visit.attentionRequired && (
                                <span
                                  title="Attention required"
                                  className="text-amber-500"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                </span>
                              )}
                              {visit.hasChildVisit && includeChild && (
                                <span
                                  title="Has child visit"
                                  className="text-violet-500"
                                >
                                  <ClipboardList className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  toast.info(`Viewing visit ${visit.visitId}`)
                                }
                                title="View details"
                                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  toast.info(`Printing ${visit.visitId}`)
                                }
                                title="Print"
                                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  toast.info(`More actions for ${visit.visitId}`)
                                }
                                title="More actions"
                                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────────────────────── */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min((page - 1) * PAGE_SIZE + 1, filteredVisits.length)}
                    –{Math.min(page * PAGE_SIZE, filteredVisits.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {filteredVisits.length}
                  </span>{" "}
                  visits
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`grid h-7 w-7 place-items-center rounded-md text-xs font-semibold transition-all ${
                          page === p
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-border text-muted-foreground hover:bg-muted"
                        }`}
                        aria-label={`Page ${p}`}
                        aria-current={page === p ? "page" : undefined}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Empty state before search ─────────────────────────────────────────── */}
      {!hasSearched && (
        <div className="surface-elevated flex flex-col items-center gap-4 py-24 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-display font-semibold text-base text-foreground">
              Ready to search
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Configure your filters above and click{" "}
              <span className="font-semibold text-primary">Search</span> to load
              the visit list.
            </p>
          </div>
          <Button id="btn-vl-search-cta" size="sm" onClick={handleSearch}>
            <Search className="mr-1.5 h-3.5 w-3.5" />
            Load All Visits
          </Button>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <AssignModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedCount={selectedIds.size}
      />
      <AddVisitModal open={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
        <p>Copyright &copy; 2026 Sufalam, All rights reserved.</p>
      </footer>
    </div>
  );
}
