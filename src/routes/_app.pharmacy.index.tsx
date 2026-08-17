import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/ui/button';
import { medicines } from '@/lib/mock/data';
import { Pill, PackageSearch, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const Route = createFileRoute('/_app/pharmacy/')({
  component: PharmacyOverview,
});

const dayWiseData = [
  { label: 'D-7', sales: 38, avg: 48 },
  { label: 'D-6', sales: 52, avg: 48 },
  { label: 'D-5', sales: 47, avg: 48 },
  { label: 'D-4', sales: 63, avg: 48 },
  { label: 'D-3', sales: 70, avg: 48 },
  { label: 'D-2', sales: 55, avg: 48 },
  { label: 'D-1', sales: 61, avg: 48 },
];

const weekWiseData = [
  { label: 'Wk 22', sales: 310, avg: 320 },
  { label: 'Wk 23', sales: 285, avg: 320 },
  { label: 'Wk 24', sales: 340, avg: 320 },
  { label: 'Wk 25', sales: 298, avg: 320 },
  { label: 'Wk 26', sales: 372, avg: 320 },
  { label: 'Wk 27', sales: 360, avg: 320 },
];
const monthWiseData = [
  { label: 'Jan', sales: 1240, avg: 1400 },
  { label: 'Feb', sales: 1110, avg: 1400 },
  { label: 'Mar', sales: 1380, avg: 1400 },
  { label: 'Apr', sales: 1290, avg: 1400 },
  { label: 'May', sales: 1520, avg: 1400 },
  { label: 'Jun', sales: 1480, avg: 1400 },
  { label: 'Jul', sales: 1610, avg: 1400 },
];

function PharmacyOverview() {
  const [gran, setGran] = useState<'day' | 'week' | 'month'>('week');

  const lowStock = medicines.filter((m) => m.stock <= m.minStock);
  const expired = medicines.filter((m) => new Date(m.expiry) < new Date());
  const inventoryValue = medicines.reduce((s, m) => s + m.stock * m.pricePerUnit, 0);

  const chartData = gran === 'day' ? dayWiseData : gran === 'week' ? weekWiseData : monthWiseData;

  const peak = Math.max(...chartData.map((d) => d.sales));
  const avg = chartData[0]!.avg;
  const latest = chartData[chartData.length - 1]!.sales;
  const prev = chartData[chartData.length - 2]?.sales ?? latest;
  const delta = latest - prev;

  return (
    <>
      <PageHeader
        eyebrow="Pharmacy"
        title="Overview"
        description="Live stock, expiries and today's billing throughput."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="SKUs in catalog" value={medicines.length} icon={Pill} tone="primary" />
        <StatCard label="Low stock" value={lowStock.length} icon={AlertTriangle} tone="primary" />
        <StatCard
          label="Expired batches"
          value={expired.length}
          icon={AlertTriangle}
          tone="primary"
        />
        <StatCard
          label="Inventory value"
          value={`₹${(inventoryValue / 1000).toFixed(1)}k`}
          icon={PackageSearch}
          tone="primary"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-elevated p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold">Dispensing Count</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trend vs average baseline ·{' '}
                {gran === 'day'
                  ? 'Last 7 days'
                  : gran === 'week'
                    ? 'Last 6 weeks'
                    : 'Last 7 months'}
              </p>
            </div>

            {/* Granularity toggle */}
            <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {(['day', 'week', 'month'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGran(g)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                    gran === g
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  id={`btn-pharmacy-gran-${g}`}
                >
                  {g === 'day' ? 'Day' : g === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Mini stats */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { label: 'PEAK', value: peak, icon: TrendingUp, color: 'text-primary' },
              {
                label: 'AVG',
                value: avg,
                icon: Minus,
                color: 'text-amber-600 dark:text-amber-400',
              },
              {
                label: 'LATEST VS PREV',
                value: `${delta >= 0 ? '+' : ''}${delta}`,
                icon: delta >= 0 ? TrendingUp : TrendingDown,
                color:
                  delta >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400',
              },
            ].map(({ label, value, icon: I, color }) => (
              <div key={label} className="rounded-xl bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                  {label}
                </p>
                <div className={`flex items-center gap-1 mt-0.5 font-bold text-base ${color}`}>
                  <I className="h-3.5 w-3.5" />
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-64 flex-1 min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="sampleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
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
                    background: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v: number, name: string) => [
                    v,
                    name === 'sales' ? 'Dispensed' : 'Avg',
                  ]}
                />
                {/* Average baseline reference line */}
                <ReferenceLine
                  y={avg}
                  stroke="var(--color-warning)"
                  strokeDasharray="5 3"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg ${avg}`,
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: 'var(--color-warning)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#sampleGrad)"
                  dot={{ r: 3.5, fill: 'var(--color-primary)', strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Low-stock items</h3>
            <Link
              to="/pharmacy/inventory"
              className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {lowStock.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.category} · batch {m.batch}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
                    m.stock === 0
                      ? 'bg-rose-500/10 text-rose-700 border-rose-300/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
                      : 'bg-amber-500/10 text-amber-800 border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50'
                  }`}
                >
                  {m.stock} left
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">All stocked up.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
