import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  IndianRupee,
  Activity,
  Flame,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "sonner";

import { z } from "zod";

const searchSchema = z.object({
  tab: z.enum(["sales", "registrations"]).catch("sales"),
});

export const Route = createFileRoute("/_app/lab/analytics")({
  validateSearch: (search) => searchSchema.parse(search),
  component: LabAnalytics,
});

// ─── Constants & Mock Data ───────────────────────────────────────────────────
const BRANCHES = ["Select Branch", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar"];

interface SalesItem {
  id: string;
  date: string;
  patientName: string;
  tests: string[];
  paymentMode: "Cash" | "UPI" | "Card" | "NetBanking";
  gross: number;
  discount: number;
  net: number;
}

const MOCK_SALES: Record<string, SalesItem[]> = {
  Koramangala: [
    {
      id: "S-001",
      date: "2026-07-11",
      patientName: "Aarav Sharma",
      tests: ["CBC", "Lipid Panel"],
      paymentMode: "UPI",
      gross: 1800,
      discount: 100,
      net: 1700,
    },
    {
      id: "S-002",
      date: "2026-07-11",
      patientName: "Arjun Mehta",
      tests: ["Thyroid Profile"],
      paymentMode: "Cash",
      gross: 1200,
      discount: 50,
      net: 1150,
    },
    {
      id: "S-003",
      date: "2026-07-11",
      patientName: "Liam Carter",
      tests: ["Vitamin D", "B12"],
      paymentMode: "Card",
      gross: 2400,
      discount: 200,
      net: 2200,
    },
  ],
  Indiranagar: [
    {
      id: "S-004",
      date: "2026-07-11",
      patientName: "Saanvi Patel",
      tests: ["HbA1c"],
      paymentMode: "UPI",
      gross: 800,
      discount: 0,
      net: 800,
    },
    {
      id: "S-005",
      date: "2026-07-11",
      patientName: "Apollo Hospital Group",
      tests: ["HbA1c", "TSH", "Urine R/M"],
      paymentMode: "NetBanking",
      gross: 4200,
      discount: 420,
      net: 3780,
    },
  ],
  Whitefield: [
    {
      id: "S-006",
      date: "2026-07-11",
      patientName: "Diya Kapoor",
      tests: ["Urinalysis"],
      paymentMode: "Card",
      gross: 600,
      discount: 0,
      net: 600,
    },
    {
      id: "S-007",
      date: "2026-07-11",
      patientName: "Manipal Group Partner",
      tests: ["Lipid Panel", "CBC"],
      paymentMode: "NetBanking",
      gross: 3600,
      discount: 360,
      net: 3240,
    },
  ],
  Jayanagar: [
    {
      id: "S-008",
      date: "2026-07-11",
      patientName: "Kabir Joshi",
      tests: ["CBC"],
      paymentMode: "Cash",
      gross: 500,
      discount: 0,
      net: 500,
    },
  ],
};

const MONTHLY_REGISTRATIONS = [
  { month: "Jan", b2c: 180, b2b: 240, total: 420 },
  { month: "Feb", b2c: 210, b2b: 290, total: 500 },
  { month: "Mar", b2c: 290, b2b: 340, total: 630 },
  { month: "Apr", b2c: 250, b2b: 310, total: 560 },
  { month: "May", b2c: 320, b2b: 410, total: 730 },
  { month: "Jun", b2c: 340, b2b: 450, total: 790 },
  { month: "Jul", b2c: 390, b2b: 480, total: 870 },
];

const PEAK_DAYS = [
  { day: "Wednesday", avgPatients: 68, description: "Mid-week corporate checkup camps" },
  { day: "Monday", avgPatients: 61, description: "Weekend backlog triage referrals" },
  { day: "Friday", avgPatients: 54, description: "Routine health screening flow" },
];

function LabAnalytics() {
  const { tab } = Route.useSearch();

  // Sales section states
  const [salesBranch, setSalesBranch] = useState("Select Branch");
  const [fromDate, setFromDate] = useState("2026-07-11");
  const [toDate, setToDate] = useState("2026-07-11");

  const salesData = useMemo(() => {
    if (salesBranch === "Select Branch") {
      // Flatten all branches
      return Object.values(MOCK_SALES).flat();
    }
    return MOCK_SALES[salesBranch] || [];
  }, [salesBranch]);

  const salesSummary = useMemo(() => {
    const gross = salesData.reduce((sum, item) => sum + item.gross, 0);
    const discount = salesData.reduce((sum, item) => sum + item.discount, 0);
    const net = salesData.reduce((sum, item) => sum + item.net, 0);
    return { gross, discount, net };
  }, [salesData]);

  // Actions
  const handleClearSalesFilters = () => {
    setSalesBranch("Select Branch");
    setFromDate("2026-07-11");
    setToDate("2026-07-11");
    toast.success("Sales filters cleared");
  };

  const handleExportCSV = () => {
    if (salesBranch === "Select Branch") {
      toast.warning("Please select a specific branch to export its daily sales report");
      return;
    }

    const headers = [
      "ID",
      "Patient / Client",
      "Diagnostics",
      "Gateway Mode",
      "Gross",
      "Discount",
      "Net Amount",
    ];
    const rows = salesData.map((item) => [
      item.id,
      item.patientName,
      item.tests.join("; "),
      item.paymentMode,
      item.gross,
      item.discount,
      item.net,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e) =>
        e
          .map(String)
          .map((s) => `"${s.replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `sales_report_${salesBranch.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported daily sales report for ${salesBranch} to CSV`);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Page Header */}
      <PageHeader
        eyebrow="Lab · Reports & Insights"
        title="Analytics Dashboard"
        description={
          tab === "sales"
            ? "Aggregated financial daily sales metrics by branch."
            : "Laboratory traffic volume and corporate B2B vs direct B2C patient flow trend metrics."
        }
      />

      {/* ─── SECTION 1: Branch Daily Sales Report ─────────────────────── */}
      {tab === "sales" && (
        <div className="surface-elevated p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-base">Branch Daily Sales Report</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generates billing aggregates and transactional summaries per branch location.
            </p>
          </div>

          {/* Filters & Controls */}
          <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-muted/20 p-4">
            {/* Branch */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                htmlFor="sales-branch-select"
              >
                Branch
              </label>
              <div className="relative">
                <select
                  id="sales-branch-select"
                  value={salesBranch}
                  onChange={(e) => setSalesBranch(e.target.value)}
                  className="appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-primary font-medium outline-none pr-8 min-w-[150px] h-9"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b === "Select Branch" ? "All Branches" : b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* From Date */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                htmlFor="sales-from-date"
              >
                From Date
              </label>
              <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9">
                <input
                  id="sales-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-xs text-primary font-medium outline-none w-28"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                htmlFor="sales-to-date"
              >
                To Date
              </label>
              <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9">
                <input
                  id="sales-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-xs text-primary font-medium outline-none w-28"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pb-0.5 ml-auto">
              <Button
                size="sm"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                id="btn-sales-export"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearSalesFilters}
                className="flex items-center gap-1.5"
                id="btn-sales-clear"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>

          {/* Aggregates Metrics Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Gross Billing",
                value: `₹${salesSummary.gross.toLocaleString("en-IN")}`,
                desc: "Calculated before discount reductions",
                color: "text-primary",
                bg: "bg-primary/5 border-primary/10",
              },
              {
                label: "Discount Deductible",
                value: `₹${salesSummary.discount.toLocaleString("en-IN")}`,
                desc: "Promotional & institutional offsets",
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
              },
              {
                label: "Net Revenue Sales",
                value: `₹${salesSummary.net.toLocaleString("en-IN")}`,
                desc: "Final captured liquid cash flow yield",
                color: "text-teal-600 dark:text-teal-400",
                bg: "bg-teal-50/50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30",
              },
            ].map((card) => (
              <div key={card.label} className={`rounded-xl border p-4 ${card.bg}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {card.label}
                </span>
                <p className={`font-display text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Transactional Records Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    ID
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    Patient / Client
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    Diagnostics
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                    Gateway Mode
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                    Gross
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                    Discount
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                    Net Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {salesData.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-muted-foreground">
                      {item.id}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-sm">{item.patientName}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {item.tests.join(", ")}
                    </td>
                    <td className="px-4 py-2.5 text-xs">{item.paymentMode}</td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      ₹{item.gross.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-rose-500">
                      -₹{item.discount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400">
                      ₹{item.net.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                {salesData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-xs text-muted-foreground"
                    >
                      No sales matching the parameters were found for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SECTION 2: Registration Analytics ───────────────────────── */}
      {tab === "registrations" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Trend plot */}
          <div className="surface-elevated p-5 lg:col-span-2 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-semibold text-base">Monthly Registrations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Flow trend comparative overview showing direct consumers (B2C) against corporate
                partners (B2B).
              </p>
            </div>
            <div className="h-64 flex-1 mt-2 min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={MONTHLY_REGISTRATIONS}
                  margin={{ top: 5, right: 10, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="b2cGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="b2bGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-info)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-info)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="b2c"
                    name="B2C Registrations"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#b2cGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="b2b"
                    name="B2B Registrations"
                    stroke="var(--color-info)"
                    strokeWidth={2}
                    fill="url(#b2bGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Flow Stats & Peak Days */}
          <div className="surface-elevated p-5 flex flex-col justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-base">Peak Registration Triage</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Identifies historical high-volume workflow days to optimize lab tech staffing.
              </p>
            </div>

            <div className="space-y-3.5 my-2 flex-1 flex flex-col justify-center">
              {PEAK_DAYS.map((day, idx) => (
                <div
                  key={day.day}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3.5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                    {idx === 0 ? (
                      <Flame className="h-4.5 w-4.5 animate-pulse" />
                    ) : (
                      <TrendingUp className="h-4.5 w-4.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm text-foreground">{day.day}</p>
                      <span className="text-xs text-muted-foreground font-medium">
                        ({day.avgPatients} patients/avg)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/10">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  Flow Insight
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Mid-week corporate checkups drive the highest test densities. Shift CBC/Thyroid
                processing loads to Wednesday mornings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
