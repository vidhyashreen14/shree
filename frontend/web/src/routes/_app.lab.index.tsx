import { createFileRoute} from "@tanstack/react-router";
import { useState} from "react";
import { PageHeader } from "@/components/common/PageHeader";

import { labOrders, patients } from "@/lib/mock/data";
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FilePlus2,
  FlaskConical,
  CheckCircle2,
  IndianRupee,
  TrendingDown,
  Wallet,
  CalendarDays,
  ChevronDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusChip } from "@/components/common/StatusChip";
import { format, subDays } from "date-fns";

export const Route = createFileRoute("/_app/lab/")({
  component: LabOverview,
});

// ─── Static KPI constants (reflect real lab snapshot values) ─────────────────
const KPI = {
  samplesRegistered: 312,
  b2c: 45,
  b2b: 267,
  testsInProgress: 128,
  reportsApproved: 174,
  grossAmount: 58420,
  discountAmount: 1200,
  netAmount: 57220,
};

// ─── Filter dropdowns ─────────────────────────────────────────────────────────
const SBU_OPTIONS = ["All SBU", "Diagnostics", "Pathology", "Radiology", "Microbiology"];
const BRANCH_OPTIONS = ["All Branches", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar"];

// ─── Sample count trend data ──────────────────────────────────────────────────
const dayLabels = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "EEE d"));
const dayWiseSamples = [38, 52, 47, 63, 70, 55, 61];
const DAY_AVG = Math.round(dayWiseSamples.reduce((a, b) => a + b, 0) / dayWiseSamples.length);
const dayWiseData = dayLabels.map((label, i) => ({
  label,
  samples: dayWiseSamples[i]!,
  avg: DAY_AVG,
}));

const weekWiseData = [
  { label: "Wk 22", samples: 310, avg: 320 },
  { label: "Wk 23", samples: 285, avg: 320 },
  { label: "Wk 24", samples: 340, avg: 320 },
  { label: "Wk 25", samples: 298, avg: 320 },
  { label: "Wk 26", samples: 372, avg: 320 },
  { label: "Wk 27", samples: 360, avg: 320 },
];

const monthWiseData = [
  { label: "Jan", samples: 1240, avg: 1400 },
  { label: "Feb", samples: 1110, avg: 1400 },
  { label: "Mar", samples: 1380, avg: 1400 },
  { label: "Apr", samples: 1290, avg: 1400 },
  { label: "May", samples: 1520, avg: 1400 },
  { label: "Jun", samples: 1480, avg: 1400 },
  { label: "Jul", samples: 1610, avg: 1400 },
];

// ─── Lab order status tones ────────────────────────────────────────────────────
const tone = {
  ordered: "info",
  "sample-collected": "warning",
  "in-progress": "primary",
  completed: "success",
} as const;

// ─── Helper: currency format ──────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

// ─── Top Filter Bar ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
function TopFilters({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  sbu,
  setSbu,
  branch,
  setBranch,
}: {
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  sbu: string;
  setSbu: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {/* Date Range */}
      <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-28 bg-transparent text-xs outline-none text-foreground"
          aria-label="From date"
          id="lab-filter-from"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-28 bg-transparent text-xs outline-none text-foreground"
          aria-label="To date"
          id="lab-filter-to"
        />
      </div>

      {/* SBU */}
      <div className="relative flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
        <select
          value={sbu}
          onChange={(e) => setSbu(e.target.value)}
          className="bg-transparent text-xs text-foreground outline-none cursor-pointer pr-5 appearance-none"
          aria-label="SBU filter"
          id="lab-filter-sbu"
        >
          {SBU_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
      </div>

      {/* Branch */}
      <div className="relative flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="bg-transparent text-xs text-foreground outline-none cursor-pointer pr-5 appearance-none"
          aria-label="Branch filter"
          id="lab-filter-branch"
        >
          {BRANCH_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-muted-foreground" />
      </div>

      <button
        onClick={() => {
          setDateFrom("");
          setDateTo("");
          setSbu(SBU_OPTIONS[0]!);
          setBranch(BRANCH_OPTIONS[0]!);
        }}
        className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-sm hover:bg-muted transition-colors"
        id="lab-filter-clear"
      >
        Clear
      </button>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  iconBg,
  valueSuffix,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  icon: React.ElementType;
  accent: string; // text colour class
  iconBg: string; // icon container bg class
  valueSuffix?: string;
}) {
  return (
    <div className="surface-elevated flex flex-col gap-3 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground leading-snug">
          {label}
        </p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconBg} ${accent}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div>
        <p className={`font-display text-2xl font-bold leading-none ${accent}`}>
          {value}
          {valueSuffix && (
            <span className="ml-0.5 text-sm font-medium text-muted-foreground">{valueSuffix}</span>
          )}
        </p>
        {sub && <div className="mt-1.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Sample Analytics Chart ────────────────────────────────────────────────────
function SampleAnalytics() {
  const [gran, setGran] = useState<"day" | "week" | "month">("week");

  const data = gran === "day" ? dayWiseData : gran === "week" ? weekWiseData : monthWiseData;

  const peak = Math.max(...data.map((d) => d.samples));
  const avg = data[0]!.avg;
  const latest = data[data.length - 1]!.samples;
  const prev = data[data.length - 2]?.samples ?? latest;
  const delta = latest - prev;

  return (
    <div className="surface-elevated p-5 h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold">Sample Count</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trend vs average baseline ·{" "}
            {gran === "day" ? "Last 7 days" : gran === "week" ? "Last 6 weeks" : "Last 7 months"}
          </p>
        </div>

        {/* Granularity toggle */}
        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
          {(["day", "week", "month"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGran(g)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                gran === g
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              id={`btn-gran-${g}`}
            >
              {g === "day" ? "Day" : g === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Mini stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[
          { label: "Peak", value: peak, icon: TrendingUp, color: "text-primary" },
          { label: "Avg", value: avg, icon: Minus, color: "text-amber-600 dark:text-amber-400" },
          {
            label: "Latest vs prev",
            value: `${delta >= 0 ? "+" : ""}${delta}`,
            icon: delta >= 0 ? TrendingUp : TrendingDown,
            color:
              delta >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
          },
        ].map(({ label, value, icon: I, color }) => (
          <div key={label} className="rounded-xl bg-muted/30 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <div className={`flex items-center gap-1 mt-0.5 font-bold text-base ${color}`}>
              <I className="h-3.5 w-3.5" />
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="sampleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis
              dataKey="label"
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
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [v, name === "samples" ? "Samples" : "Avg"]}
            />
            {/* Average baseline reference line */}
            <ReferenceLine
              y={avg}
              stroke="var(--color-warning)"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              label={{
                value: `Avg ${avg}`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "var(--color-warning)",
              }}
            />
            <Area
              type="monotone"
              dataKey="samples"
              stroke="var(--color-primary)"
              strokeWidth={2.5}
              fill="url(#sampleGrad)"
              dot={{ r: 3.5, fill: "var(--color-primary)", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Pending Pipeline ──────────────────────────────────────────────────────────
function PendingPipeline() {
  const pending = labOrders.filter((l) => l.status !== "completed");
  return (
    <div className="surface-elevated p-5 flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">Pending pipeline</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pending.length} orders awaiting completion
          </p>
        </div>
      </div>
      <div className="divide-y divide-border flex-1">
        {pending.slice(0, 6).map((l) => {
          const p = patients.find((x) => x.id === l.patientId);
          return (
            <div key={l.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {l.tests.join(", ")} · {format(new Date(l.orderedOn), "MMM d")}
                </p>
              </div>
              <StatusChip tone={tone[l.status]}>{l.status.replace(/-/g, " ")}</StatusChip>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">All orders complete 🎉</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function LabOverview() {
  return (
    <>
      <PageHeader
        eyebrow="Laboratory"
        title="Investigations Control Room"
        description="Daily operational and financial snapshot across all branches."
      />
      {/* ── 6 KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {/* 1. Samples Registered */}
        <KpiCard
          label="Samples Registered"
          value={KPI.samplesRegistered}
          icon={FlaskConical}
          accent="text-primary"
          iconBg="bg-primary/10"
          sub={
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">B2C</span>
                <span className="font-bold text-foreground">{KPI.b2c}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-info" />
                <span className="text-muted-foreground">B2B</span>
                <span className="font-bold text-foreground">{KPI.b2b}</span>
              </span>
            </div>
          }
        />

        {/* 2. Tests in Progress */}
        <KpiCard
          label="Tests in Progress"
          value={KPI.testsInProgress}
          valueSuffix={` | ${KPI.samplesRegistered}`}
          icon={FlaskConical}
          accent="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          sub={
            <div className="w-full rounded-full bg-muted h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{
                  width: `${Math.round((KPI.testsInProgress / KPI.samplesRegistered) * 100)}%`,
                }}
              />
            </div>
          }
        />

        {/* 3. Reports Approved */}
        <KpiCard
          label="Reports Approved"
          value={KPI.reportsApproved}
          icon={CheckCircle2}
          accent="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          sub={
            <p className="text-[11px] text-muted-foreground">
              {Math.round((KPI.reportsApproved / KPI.samplesRegistered) * 100)}% of registered
            </p>
          }
        />

        {/* 4. Gross Amount */}
        <KpiCard
          label="Gross Amount"
          value={`₹${fmt(KPI.grossAmount)}`}
          icon={IndianRupee}
          accent="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-50 dark:bg-violet-950/40"
          sub={<p className="text-[11px] text-muted-foreground">Before deductions</p>}
        />

        {/* 5. Discount Amount */}
        <KpiCard
          label="Discount Amount"
          value={`₹${fmt(KPI.discountAmount)}`}
          icon={TrendingDown}
          accent="text-rose-600 dark:text-rose-400"
          iconBg="bg-rose-50 dark:bg-rose-950/40"
          sub={
            <p className="text-[11px] text-muted-foreground">
              {((KPI.discountAmount / KPI.grossAmount) * 100).toFixed(1)}% of gross
            </p>
          }
        />

        {/* 6. Net Amount */}
        <KpiCard
          label="Net Amount"
          value={`₹${fmt(KPI.netAmount)}`}
          icon={Wallet}
          accent="text-teal-600 dark:text-teal-400"
          iconBg="bg-teal-50 dark:bg-teal-950/40"
          sub={
            <p className="text-[11px] text-muted-foreground">
              After ₹{fmt(KPI.discountAmount)} discount
            </p>
          }
        />
      </div>

      {/* ── Bottom Section: Chart + Pending Pipeline ─────────────────────── */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sample Analytics — spans 2 cols */}
        <div className="lg:col-span-2">
          <SampleAnalytics />
        </div>

        {/* Pending Pipeline */}
        <PendingPipeline />
      </div>
    </>
  );
}
