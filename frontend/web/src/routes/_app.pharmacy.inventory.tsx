import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { medicines as seedMedicines } from "@/lib/mock/data";
import type { Medicine } from "@/lib/types";
import {
  Plus,
  AlertTriangle,
  PackageX,
  PackagePlus,
  PackageMinus,
  Pencil,
  History,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  Boxes,
  Download,
  Undo2,
  SlidersHorizontal,
  RotateCcw,
  Gauge,
  Factory,
} from "lucide-react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { toast } from "sonner";

const stockFilters = ["all", "ok", "low", "out", "expired"] as const;
const sortableIds = [
  "name",
  "category",
  "stock",
  "expiry",
  "batch",
  "gst",
  "pricePerUnit",
] as const;

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  cat: fallback(z.string(), "all").default("all"),
  stock: fallback(z.enum(stockFilters), "all").default("all"),
  sort: fallback(z.enum(sortableIds), "name").default("name"),
  desc: fallback(z.boolean(), false).default(false),
  page: fallback(z.number().int().min(1), 1).default(1),
  size: fallback(z.number().int().min(1), 8).default(8),
});

export const Route = createFileRoute("/_app/pharmacy/inventory")({
  validateSearch: zodValidator(searchSchema),
  component: PharmacyInventory,
});

type StockAction = "add" | "remove" | "set";

interface StockHistoryEntry {
  id: string;
  medicineId: string;
  at: string;
  action: StockAction | "bulk-restock" | "bulk-undo";
  delta: number;
  before: number;
  after: number;
  by: string;
  note?: string;
  batchId?: string;
}

const THRESHOLD_KEY = "hms.pharmacy.thresholds.v1";

interface ThresholdConfig {
  categories: Record<string, number>;
  overrides: Record<string, number>;
}

const loadThresholds = (): ThresholdConfig => {
  if (typeof window === "undefined") return { categories: {}, overrides: {} };
  try {
    const raw = window.localStorage.getItem(THRESHOLD_KEY);
    if (!raw) return { categories: {}, overrides: {} };
    const parsed = JSON.parse(raw);
    return {
      categories: parsed.categories ?? {},
      overrides: parsed.overrides ?? {},
    };
  } catch {
    return { categories: {}, overrides: {} };
  }
};

function highlight(text: string, term: string) {
  if (!term) return text;
  const lower = text.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  let idx = lower.indexOf(term);
  let key = 0;
  while (idx !== -1) {
    if (idx > i) out.push(text.slice(i, idx));
    out.push(
      <mark key={key++} className="rounded bg-primary/20 px-0.5 text-foreground">
        {text.slice(idx, idx + term.length)}
      </mark>
    );
    i = idx + term.length;
    idx = lower.indexOf(term, i);
  }
  if (i < text.length) out.push(text.slice(i));
  return <>{out}</>;
}

const seedHistory = (): StockHistoryEntry[] => {
  const now = Date.now();
  const users = ["Priya Menon", "Rahul Verma", "Mei Chen"];
  const entries: StockHistoryEntry[] = [];
  seedMedicines.forEach((m, i) => {
    for (let k = 0; k < 3; k++) {
      const delta = ((i + k) % 2 === 0 ? 1 : -1) * (5 + ((i * 3 + k * 7) % 25));
      const before = Math.max(0, m.stock - delta * (k + 1));
      entries.push({
        id: `h-${m.id}-${k}`,
        medicineId: m.id,
        at: new Date(now - (i * 3 + k) * 6 * 3600 * 1000).toISOString(),
        action: delta > 0 ? "add" : "remove",
        delta,
        before,
        after: before + delta,
        by: users[(i + k) % users.length]!,
        note: delta > 0 ? "Restocked from PO" : "Dispensed to OPD",
      });
    }
  });
  return entries.sort((a, b) => +new Date(b.at) - +new Date(a.at));
};

function PharmacyInventory() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [items, setItems] = useState<Medicine[]>(seedMedicines);
  const [history, setHistory] = useState<StockHistoryEntry[]>(() => seedHistory());
  const [thresholds, setThresholds] = useState<ThresholdConfig>(() => loadThresholds());

  useEffect(() => {
    try {
      window.localStorage.setItem(THRESHOLD_KEY, JSON.stringify(thresholds));
    } catch {
      /* ignore quota errors */
    }
  }, [thresholds]);

  type SearchParams = z.infer<typeof searchSchema>;
  const updateSearch = (patch: Partial<SearchParams>) => {
    navigate({
      search: (prev: SearchParams) => {
        const next = { ...prev, ...patch };
        const defaults: Record<string, unknown> = {
          q: "",
          cat: "all",
          stock: "all",
          sort: "name",
          desc: false,
          page: 1,
          size: 8,
        };
        const cleaned: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(next)) {
          if (v !== defaults[k]) cleaned[k] = v;
        }
        return cleaned as SearchParams;
      },
      replace: true,
    });
  };

  const [searchInput, setSearchInput] = useState(search.q);
  useEffect(() => {
    setSearchInput(search.q);
  }, [search.q]);
  useEffect(() => {
    if (searchInput === search.q) return;
    const t = window.setTimeout(() => {
      updateSearch({ q: searchInput, page: 1 });
      setIsFetching(true);
      window.setTimeout(() => setIsFetching(false), 220);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const sorting: SortingState = useMemo(
    () => [{ id: search.sort, desc: search.desc }],
    [search.sort, search.desc]
  );
  const pagination: PaginationState = useMemo(
    () => ({ pageIndex: search.page - 1, pageSize: search.size }),
    [search.page, search.size]
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isFetching, setIsFetching] = useState(false);

  const [editing, setEditing] = useState<Medicine | null>(null);
  const [action, setAction] = useState<StockAction>("add");
  const [qty, setQty] = useState<string>("");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQty, setBulkQty] = useState<string>("50");

  const [historyFor, setHistoryFor] = useState<Medicine | null>(null);
  const [thresholdsOpen, setThresholdsOpen] = useState(false);
  const [thresholdEditing, setThresholdEditing] = useState<Medicine | null>(null);
  const [thresholdInput, setThresholdInput] = useState<string>("");

  const categories = useMemo(
    () => Array.from(new Set(items.map((m) => m.category))).sort(),
    [items]
  );

  const effectiveMin = (m: Medicine): number => {
    if (thresholds.overrides[m.id] != null) return thresholds.overrides[m.id]!;
    if (thresholds.categories[m.category] != null) return thresholds.categories[m.category]!;
    return m.minStock;
  };

  const filtered = useMemo(() => {
    const q = search.q.trim().toLowerCase();
    return items.filter((m) => {
      if (search.cat !== "all" && m.category !== search.cat) return false;
      const expired = new Date(m.expiry) < new Date();
      const min = effectiveMin(m);
      if (search.stock === "low" && !(m.stock > 0 && m.stock <= min)) return false;
      if (search.stock === "out" && m.stock !== 0) return false;
      if (search.stock === "expired" && !expired) return false;
      if (search.stock === "ok" && (m.stock <= min || expired)) return false;
      if (q) {
        const hay = `${m.name} ${m.manufacturer} ${m.batch} ${m.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search.cat, search.stock, search.q, thresholds]);

  const sorted = useMemo(() => {
    const s = sorting[0];
    if (!s) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[s.id as keyof Medicine] as string | number;
      const bv = b[s.id as keyof Medicine] as string | number;
      if (av === bv) return 0;
      const dir = s.desc ? -1 : 1;
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return copy;
  }, [filtered, sorting]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pagination.pageSize));
  const pageRows = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sorted.slice(start, start + pagination.pageSize);
  }, [sorted, pagination]);

  const simulateFetch = () => {
    setIsFetching(true);
    window.setTimeout(() => setIsFetching(false), 280);
  };

  const lowStock = items.filter((m) => {
    const min = effectiveMin(m);
    return m.stock > 0 && m.stock <= min;
  });
  const outOfStock = items.filter((m) => m.stock === 0);
  const expired = items.filter((m) => new Date(m.expiry) < new Date());

  const openStockDialog = (m: Medicine, a: StockAction) => {
    setEditing(m);
    setAction(a);
    setQty(a === "set" ? String(m.stock) : "");
  };

  const recordHistory = (entry: Omit<StockHistoryEntry, "id" | "at">) => {
    setHistory((prev) => [
      {
        ...entry,
        id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const applyStockChange = () => {
    if (!editing) return;
    const n = Number(qty);
    if (!Number.isFinite(n) || n < 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    const before = editing.stock;
    let after = before;
    if (action === "add") after = before + n;
    else if (action === "remove") after = Math.max(0, before - n);
    else after = n;

    setItems((prev) => prev.map((m) => (m.id === editing.id ? { ...m, stock: after } : m)));
    recordHistory({
      medicineId: editing.id,
      action,
      delta: after - before,
      before,
      after,
      by: "You",
      note:
        action === "add"
          ? "Manual restock"
          : action === "remove"
            ? "Manual deduction"
            : "Stock recount",
    });
    toast.success(
      action === "set"
        ? `Stock set to ${n} for ${editing.name}`
        : `${action === "add" ? "Added" : "Removed"} ${n} units · ${editing.name}`
    );
    setEditing(null);
    setQty("");
  };

  const openThresholdDialog = (m: Medicine) => {
    const current = thresholds.overrides[m.id];
    setThresholdEditing(m);
    setThresholdInput(current != null ? String(current) : "");
  };

  const applyThresholdOverride = () => {
    if (!thresholdEditing) return;
    const trimmed = thresholdInput.trim();
    setThresholds((prev) => {
      const next = { ...prev.overrides };
      if (trimmed === "") {
        delete next[thresholdEditing.id];
      } else {
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0) return prev;
        next[thresholdEditing.id] = Math.floor(n);
      }
      return { ...prev, overrides: next };
    });
    toast.success(
      trimmed === ""
        ? `Cleared override for ${thresholdEditing.name}`
        : `Low-stock threshold for ${thresholdEditing.name} set to ${trimmed}`
    );
    setThresholdEditing(null);
    setThresholdInput("");
  };

  const columns = useMemo<ColumnDef<Medicine>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all on page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={`Select ${row.original.name}`}
          />
        ),
      },
      {
        header: "Medicine",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{highlight(row.original.name, search.q.toLowerCase())}</p>
            <p className="text-xs text-muted-foreground">
              {highlight(row.original.manufacturer, search.q.toLowerCase())}
            </p>
          </div>
        ),
      },
      {
        header: "Category",
        accessorKey: "category",
        cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip>,
      },
      {
        header: "Stock",
        accessorKey: "stock",
        cell: ({ row }) => {
          const s = row.original.stock;
          const min = effectiveMin(row.original);
          const tone = s === 0 ? "danger" : s <= min ? "warning" : "success";
          const overridden = thresholds.overrides[row.original.id] != null;
          const catSet = thresholds.categories[row.original.category] != null;
          const source = overridden
            ? "Per-medicine override"
            : catSet
              ? "Category threshold"
              : "Default minimum";
          const tooltipLabel = overridden
            ? `Per-medicine override: ${min} units`
            : catSet
              ? `${row.original.category} category threshold: ${min} units`
              : `Default minimum for this medicine: ${min} units`;
          return (
            <div className="flex items-center gap-2">
              <StatusChip tone={tone}>{s}</StatusChip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2">
                    min {min}
                    {overridden ? "*" : catSet ? "ᶜ" : ""}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{tooltipLabel}</p>
                  <p className="opacity-80">Source: {source}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          );
        },
      },
      {
        header: "Expiry",
        accessorKey: "expiry",
        cell: ({ getValue }) => {
          const d = new Date(String(getValue()));
          const days = differenceInDays(d, new Date());
          return (
            <span
              className={days < 0 ? "text-destructive" : days < 60 ? "text-warning-foreground" : ""}
            >
              {format(d, "MMM yyyy")}
            </span>
          );
        },
      },
      {
        header: "Batch",
        accessorKey: "batch",
        cell: ({ getValue }) => (
          <code className="font-mono text-xs">
            {highlight(String(getValue()), search.q.toLowerCase())}
          </code>
        ),
      },
      { header: "GST", accessorKey: "gst", cell: ({ getValue }) => `${getValue()}%` },
      {
        header: "Price",
        accessorKey: "pricePerUnit",
        cell: ({ getValue }) => `₹${getValue()}`,
      },
      {
        id: "actions",
        enableSorting: false,
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              title="History"
              onClick={() => setHistoryFor(row.original)}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Set low-stock threshold"
              onClick={() => openThresholdDialog(row.original)}
            >
              <Gauge className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Add stock"
              onClick={() => openStockDialog(row.original, "add")}
            >
              <PackagePlus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Remove stock"
              onClick={() => openStockDialog(row.original, "remove")}
            >
              <PackageMinus className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              title="Set stock"
              onClick={() => openStockDialog(row.original, "set")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search.q, thresholds]
  );

  const table = useReactTable({
    data: pageRows,
    columns,
    state: { sorting, pagination, rowSelection },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      const s = next[0];
      updateSearch({
        sort: (s?.id as (typeof sortableIds)[number]) ?? "name",
        desc: !!s?.desc,
        page: 1,
      });
      simulateFetch();
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      updateSearch({ page: next.pageIndex + 1, size: next.pageSize });
      simulateFetch();
    },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  const selectedItems = items.filter((m) => selectedIds.includes(m.id));

  const undoBulkRestock = (batchId: string, snapshot: { id: string; stock: number }[]) => {
    const map = new Map(snapshot.map((s) => [s.id, s.stock]));
    setItems((prev) => prev.map((m) => (map.has(m.id) ? { ...m, stock: map.get(m.id)! } : m)));
    setHistory((prev) => {
      const reversed = prev
        .filter((h) => h.batchId === batchId)
        .map<StockHistoryEntry>((h) => ({
          id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${h.medicineId}`,
          medicineId: h.medicineId,
          at: new Date().toISOString(),
          action: "bulk-undo",
          delta: -h.delta,
          before: h.after,
          after: h.before,
          by: "You",
          note: "Undid bulk restock",
        }));
      return [...reversed, ...prev.filter((h) => h.batchId !== batchId)];
    });
    toast.success(`Reverted bulk restock for ${snapshot.length} medicine(s)`);
  };

  const applyBulkRestock = () => {
    const n = Number(bulkQty);
    if (!Number.isFinite(n) || n <= 0) {
      toast.error("Enter a quantity greater than zero");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Select at least one medicine");
      return;
    }
    const snapshot = selectedItems.map((m) => ({ id: m.id, stock: m.stock }));
    const batchId = `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) =>
      prev.map((m) => (selectedIds.includes(m.id) ? { ...m, stock: m.stock + n } : m))
    );
    selectedItems.forEach((m) =>
      recordHistory({
        medicineId: m.id,
        action: "bulk-restock",
        delta: n,
        before: m.stock,
        after: m.stock + n,
        by: "You",
        note: `Bulk restock (+${n})`,
        batchId,
      })
    );
    toast.success(`Restocked ${selectedItems.length} medicine(s) by ${n} units`, {
      action: {
        label: "Undo",
        onClick: () => undoBulkRestock(batchId, snapshot),
      },
      duration: 8000,
    });
    setBulkOpen(false);
    setRowSelection({});
  };

  const exportCsv = () => {
    if (sorted.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    const headers = [
      "Name",
      "Manufacturer",
      "Category",
      "Stock",
      "Min stock",
      "Batch",
      "Expiry",
      "GST %",
      "Price (INR)",
    ];
    const esc = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = sorted.map((m) =>
      [
        m.name,
        m.manufacturer,
        m.category,
        m.stock,
        effectiveMin(m),
        m.batch,
        format(new Date(m.expiry), "yyyy-MM-dd"),
        m.gst,
        m.pricePerUnit,
      ]
        .map(esc)
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${format(new Date(), "yyyyMMdd-HHmm")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sorted.length} medicine(s) to CSV`);
  };

  const alerts = [...outOfStock, ...lowStock, ...expired].slice(0, 6);

  const historyEntries = historyFor ? history.filter((h) => h.medicineId === historyFor.id) : [];

  const hasActiveFilters = search.cat !== "all" || search.stock !== "all" || search.q !== "";

  return (
    <TooltipProvider delayDuration={150}>
      <PageHeader
        title="Inventory"
        description="All medicines, batches, GST and live stock levels."
        actions={
          <>
            <Button variant="default" onClick={() => setThresholdsOpen(true)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" /> Thresholds
            </Button>
            <Button variant="default" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button
              variant="default"
              onClick={() => navigate({ to: "/pharmacy/manufacturemaster" })}
            >
              <Factory className="mr-2 h-4 w-4" /> Manufacture Master
            </Button>
          </>
        }
      />

      {(lowStock.length > 0 || outOfStock.length > 0 || expired.length > 0) && (
        <div className="surface-elevated mb-5 border-l-4 border-warning p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-warning/15 p-2 text-warning-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-sm font-semibold">Inventory needs attention</p>
                <p className="text-xs text-muted-foreground">
                  {outOfStock.length} out of stock · {lowStock.length} low stock · {expired.length}{" "}
                  expired batch(es)
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {alerts.map((m) => {
                    const isExpired = new Date(m.expiry) < new Date();
                    const tone = m.stock === 0 || isExpired ? "danger" : ("warning" as const);
                    const min = effectiveMin(m);
                    const overridden = thresholds.overrides[m.id] != null;
                    const catSet = thresholds.categories[m.category] != null;
                    const source = overridden
                      ? "Per-medicine override"
                      : catSet
                        ? `${m.category} category threshold`
                        : "Default minimum";
                    const tip = isExpired
                      ? `Expired · stock ${m.stock}`
                      : `Stock ${m.stock} · threshold ${min} (${source})`;
                    return (
                      <Tooltip key={m.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openStockDialog(m, "add")}
                            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium hover:border-primary hover:text-primary"
                          >
                            <span className="mr-1.5 inline-block">
                              <StatusChip tone={tone}>
                                {isExpired ? "EXP" : m.stock === 0 ? "OUT" : "LOW"}
                              </StatusChip>
                            </span>
                            {m.name}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{tip}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
            <Button size="sm" onClick={() => updateSearch({ stock: "low", page: 1 })}>
              <PackageX className="mr-2 h-4 w-4" /> Review low stock
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, manufacturer, batch…"
            className="pl-9 pr-9"
          />
          {searchInput !== search.q && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Select
          value={search.cat}
          onValueChange={(v) => {
            updateSearch({ cat: v, page: 1 });
            simulateFetch();
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={search.stock}
          onValueChange={(v) => {
            updateSearch({ stock: v as (typeof stockFilters)[number], page: 1 });
            simulateFetch();
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="ok">In stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              updateSearch({ q: "", cat: "all", stock: "all", page: 1 });
            }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{sorted.length} record(s)</span>
      </div>

      {selectedItems.length > 0 && (
        <div className="surface-elevated mb-3 flex flex-wrap items-center justify-between gap-3 border-l-4 border-primary p-3">
          <div className="flex items-center gap-2 text-sm">
            <Boxes className="h-4 w-4 text-primary" />
            <span className="font-medium">{selectedItems.length} selected</span>
            <span className="text-muted-foreground">
              across {new Set(selectedItems.map((m) => m.category)).size} categor(ies)
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setRowSelection({})}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setBulkOpen(true)}>
              <PackagePlus className="mr-2 h-4 w-4" /> Bulk restock
            </Button>
          </div>
        </div>
      )}

      <div className="surface-elevated overflow-hidden">
        <div className="relative overflow-x-auto">
          {isFetching && (
            <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading…
            </div>
          )}
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const canSort = h.column.getCanSort();
                    const dir = h.column.getIsSorted();
                    return (
                      <th
                        key={h.id}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground ${
                          canSort ? "cursor-pointer select-none hover:text-foreground" : ""
                        }`}
                        onClick={canSort ? h.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {canSort && (
                            <>
                              {dir === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : dir === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              )}
                            </>
                          )}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10">
                    <EmptyState
                      icon={Boxes}
                      title="No medicines match"
                      description="Adjust your filters or clear the search."
                    />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-3 text-sm">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Page {pagination.pageIndex + 1} of {pageCount}
            </span>
            <span>·</span>
            <span>
              Showing {pageRows.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}–
              {pagination.pageIndex * pagination.pageSize + pageRows.length} of {sorted.length}
            </span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(v) => {
                updateSearch({ size: Number(v), page: 1 });
                simulateFetch();
              }}
            >
              <SelectTrigger className="h-7 w-[90px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 8, 10, 20, 50].map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Single-row stock dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "add"
                ? "Add stock"
                : action === "remove"
                  ? "Remove stock"
                  : "Set stock level"}
            </DialogTitle>
            <DialogDescription>
              {editing?.name} · batch {editing?.batch} · current stock{" "}
              <span className="font-semibold text-foreground">{editing?.stock}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="qty">{action === "set" ? "New stock level" : "Quantity"}</Label>
            <Input
              id="qty"
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={applyStockChange}>Save change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk restock dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk restock</DialogTitle>
            <DialogDescription>
              Add the same quantity to every selected medicine. This action is logged in stock
              history.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Label htmlFor="bulkQty">Units to add per medicine</Label>
            <Input
              id="bulkQty"
              type="number"
              min={1}
              value={bulkQty}
              onChange={(e) => setBulkQty(e.target.value)}
              autoFocus
            />
            <div className="surface-elevated max-h-56 overflow-y-auto p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Selected ({selectedItems.length})
              </p>
              <ul className="space-y-1.5 text-sm">
                {selectedItems.map((m) => {
                  const n = Number(bulkQty) || 0;
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 rounded-md bg-muted/40 px-2.5 py-1.5"
                    >
                      <span className="truncate">{m.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {m.stock} <span className="mx-1">→</span>
                        <span className="font-semibold text-foreground">{m.stock + n}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyBulkRestock}>
              <PackagePlus className="mr-2 h-4 w-4" /> Confirm restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock history drawer */}
      <Sheet open={!!historyFor} onOpenChange={(o) => !o && setHistoryFor(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Stock history</SheetTitle>
            <SheetDescription>
              {historyFor?.name} · batch {historyFor?.batch}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {historyEntries.length === 0 && (
              <EmptyState
                icon={History}
                title="No history yet"
                description="Quantity changes will appear here."
              />
            )}
            {historyEntries.map((h) => {
              const positive = h.delta > 0;
              return (
                <div key={h.id} className="surface-elevated p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          positive
                            ? "bg-success/15 text-success-foreground"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {h.action === "bulk-undo" ? (
                          <Undo2 className="h-4 w-4" />
                        ) : positive ? (
                          <PackagePlus className="h-4 w-4" />
                        ) : (
                          <PackageMinus className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {h.action.replace("-", " ")}
                          <span
                            className={`ml-2 text-xs font-bold ${
                              positive ? "text-success-foreground" : "text-destructive"
                            }`}
                          >
                            {positive ? "+" : ""}
                            {h.delta}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {h.before} → <span className="font-semibold">{h.after}</span> · by {h.by}
                        </p>
                        {h.note && <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>}
                      </div>
                    </div>
                    <span
                      className="shrink-0 text-[11px] text-muted-foreground"
                      title={format(new Date(h.at), "PPpp")}
                    >
                      {formatDistanceToNow(new Date(h.at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Low-stock thresholds drawer */}
      <ThresholdsDrawer
        open={thresholdsOpen}
        onOpenChange={setThresholdsOpen}
        categories={categories}
        items={items}
        thresholds={thresholds}
        setThresholds={setThresholds}
        effectiveMin={effectiveMin}
      />

      {/* Per-medicine threshold override dialog */}
      <Dialog
        open={!!thresholdEditing}
        onOpenChange={(o) => {
          if (!o) {
            setThresholdEditing(null);
            setThresholdInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set low-stock threshold</DialogTitle>
            <DialogDescription>
              {thresholdEditing?.name} · current stock{" "}
              <span className="font-semibold text-foreground">{thresholdEditing?.stock}</span>.
              Leave empty to fall back to the category or default minimum.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            {thresholdEditing && (
              <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <div>
                  Category threshold:{" "}
                  <span className="font-medium text-foreground">
                    {thresholds.categories[thresholdEditing.category] ?? "—"}
                  </span>
                </div>
                <div>
                  Default minimum:{" "}
                  <span className="font-medium text-foreground">{thresholdEditing.minStock}</span>
                </div>
                <div>
                  Current effective:{" "}
                  <span className="font-medium text-foreground">
                    {effectiveMin(thresholdEditing)}
                  </span>
                </div>
              </div>
            )}
            <Label htmlFor="thr">Override threshold (units)</Label>
            <Input
              id="thr"
              type="number"
              min={0}
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              placeholder="—"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setThresholdInput("")}
              disabled={thresholdInput === ""}
            >
              Clear override
            </Button>
            <Button variant="outline" onClick={() => setThresholdEditing(null)}>
              Cancel
            </Button>
            <Button onClick={applyThresholdOverride}>
              <Gauge className="mr-2 h-4 w-4" /> Save threshold
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

interface ThresholdsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  items: Medicine[];
  thresholds: ThresholdConfig;
  setThresholds: React.Dispatch<React.SetStateAction<ThresholdConfig>>;
  effectiveMin: (m: Medicine) => number;
}

function ThresholdsDrawer({
  open,
  onOpenChange,
  categories,
  items,
  thresholds,
  setThresholds,
  effectiveMin,
}: ThresholdsDrawerProps) {
  const [overrideQuery, setOverrideQuery] = useState("");
  const [bulkTarget, setBulkTarget] = useState<{
    category: string;
    value: number;
    replaceExisting: boolean;
  } | null>(null);
  const [bulkValueInput, setBulkValueInput] = useState<Record<string, string>>({});
  const [bulkReplace, setBulkReplace] = useState<Record<string, boolean>>({});

  const openBulkConfirm = (cat: string) => {
    const raw = bulkValueInput[cat] ?? String(thresholds.categories[cat] ?? "");
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || raw.trim() === "") {
      toast.error("Enter a threshold value first");
      return;
    }
    setBulkTarget({
      category: cat,
      value: Math.floor(n),
      replaceExisting: !!bulkReplace[cat],
    });
  };

  const applyBulkCategory = () => {
    if (!bulkTarget) return;
    const { category, value, replaceExisting } = bulkTarget;
    const catItems = items.filter((m) => m.category === category);
    let touched = 0;
    setThresholds((prev) => {
      const next = { ...prev.overrides };
      for (const m of catItems) {
        if (!replaceExisting && next[m.id] != null) continue;
        next[m.id] = value;
        touched++;
      }
      return { ...prev, overrides: next };
    });
    toast.success(`Applied threshold ${value} to ${touched} medicine(s) in ${category}`);
    setBulkTarget(null);
  };

  const setCategory = (cat: string, valueRaw: string) => {
    const trimmed = valueRaw.trim();
    setThresholds((prev) => {
      const next = { ...prev.categories };
      if (trimmed === "") {
        delete next[cat];
      } else {
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0) return prev;
        next[cat] = Math.floor(n);
      }
      return { ...prev, categories: next };
    });
  };

  const setOverride = (id: string, valueRaw: string) => {
    const trimmed = valueRaw.trim();
    setThresholds((prev) => {
      const next = { ...prev.overrides };
      if (trimmed === "") {
        delete next[id];
      } else {
        const n = Number(trimmed);
        if (!Number.isFinite(n) || n < 0) return prev;
        next[id] = Math.floor(n);
      }
      return { ...prev, overrides: next };
    });
  };

  const resetAll = () => {
    setThresholds({ categories: {}, overrides: {} });
    toast.success("All thresholds reset to defaults");
  };

  const filteredItems = useMemo(() => {
    const q = overrideQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
    );
  }, [items, overrideQuery]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Low-stock thresholds</SheetTitle>
          <SheetDescription>
            Override the default minimum stock per category, or pin a specific value to an
            individual medicine. Per-medicine overrides win over category thresholds.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="categories" className="mt-5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">By category</TabsTrigger>
            <TabsTrigger value="overrides">Per-medicine</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4 space-y-2">
            {categories.length === 0 && (
              <EmptyState
                icon={SlidersHorizontal}
                title="No categories"
                description="Add medicines to manage category thresholds."
              />
            )}
            {categories.map((cat) => {
              const value = thresholds.categories[cat];
              const catItems = items.filter((m) => m.category === cat);
              const overriddenInCat = catItems.filter(
                (m) => thresholds.overrides[m.id] != null
              ).length;
              const bulkVal = bulkValueInput[cat] ?? (value != null ? String(value) : "");
              const replace = !!bulkReplace[cat];
              return (
                <div
                  key={cat}
                  className="space-y-2 rounded-md border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{cat}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {catItems.length} medicine(s) · {overriddenInCat} with override
                        {value == null && " · using per-item defaults"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={value ?? ""}
                        onChange={(e) => setCategory(cat, e.target.value)}
                        placeholder="—"
                        className="h-8 w-24 text-sm"
                      />
                      {value != null && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Clear category threshold"
                          onClick={() => setCategory(cat, "")}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Bulk apply
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={bulkVal}
                      onChange={(e) =>
                        setBulkValueInput((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      placeholder="Threshold"
                      className="h-7 w-20 text-xs"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Checkbox
                        checked={replace}
                        onCheckedChange={(v) => setBulkReplace((prev) => ({ ...prev, [cat]: !!v }))}
                      />
                      Overwrite existing
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto h-7 text-xs"
                      onClick={() => openBulkConfirm(cat)}
                    >
                      <Gauge className="mr-1.5 h-3.5 w-3.5" /> Apply to {catItems.length}
                    </Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="overrides" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={overrideQuery}
                onChange={(e) => setOverrideQuery(e.target.value)}
                placeholder="Find a medicine to override…"
                className="pl-9"
              />
            </div>
            <div className="max-h-[55vh] space-y-1.5 overflow-y-auto pr-1">
              {filteredItems.map((m) => {
                const override = thresholds.overrides[m.id];
                const eff = effectiveMin(m);
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {m.category} · stock {m.stock} · effective min {eff}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={override ?? ""}
                        onChange={(e) => setOverride(m.id, e.target.value)}
                        placeholder="—"
                        className="h-8 w-24 text-sm"
                      />
                      {override != null && (
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Clear override"
                          onClick={() => setOverride(m.id, "")}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No medicines match “{overrideQuery}”.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {Object.keys(thresholds.categories).length} category rule(s) ·{" "}
            {Object.keys(thresholds.overrides).length} override(s)
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={resetAll}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset all
            </Button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </SheetContent>

      <AlertDialog open={!!bulkTarget} onOpenChange={(o) => !o && setBulkTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply bulk threshold?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulkTarget && (
                <>
                  This will set an override low-stock threshold of{" "}
                  <span className="font-semibold text-foreground">{bulkTarget.value}</span> on{" "}
                  <span className="font-semibold text-foreground">
                    {
                      items.filter((m) => {
                        if (m.category !== bulkTarget.category) return false;
                        if (!bulkTarget.replaceExisting && thresholds.overrides[m.id] != null)
                          return false;
                        return true;
                      }).length
                    }
                  </span>{" "}
                  medicine(s) in{" "}
                  <span className="font-semibold text-foreground">{bulkTarget.category}</span>.{" "}
                  {bulkTarget.replaceExisting
                    ? "Existing overrides will be replaced."
                    : "Medicines that already have an override are skipped."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyBulkCategory}>Apply thresholds</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
