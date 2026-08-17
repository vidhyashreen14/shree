import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { TrendingUp, Activity, Users, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { monthlyRevenue } from '@/lib/mock/data';

export const Route = createFileRoute('/_app/admin/analytics')({
  component: AdminAnalytics,
});

const kpis = [
  { name: 'Capacity', value: 78, fill: 'var(--color-chart-1)' },
  { name: 'Satisfaction', value: 92, fill: 'var(--color-chart-3)' },
  { name: 'On-time', value: 86, fill: 'var(--color-chart-2)' },
];

function AdminAnalytics() {
  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Operational analytics"
        description="Deep performance metrics across the hospital."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg wait time" value="12m" icon={Clock} tone="warning" trend={-8.3} />
        <StatCard
          label="Patient throughput"
          value="312/day"
          icon={Users}
          tone="primary"
          trend={4.6}
        />
        <StatCard
          label="Revenue per visit"
          value="₹1,840"
          icon={TrendingUp}
          tone="success"
          trend={2.1}
        />
        <StatCard label="System health" value="99.98%" icon={Activity} tone="info" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Revenue by segment</h3>
          <div className="mt-3 h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="opd"
                  stackId="r"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="pharmacy"
                  stackId="r"
                  stroke="var(--color-chart-2)"
                  fill="var(--color-chart-2)"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="lab"
                  stackId="r"
                  stroke="var(--color-chart-3)"
                  fill="var(--color-chart-3)"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">KPIs</h3>
          <div className="mt-2 h-72">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                data={kpis}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={8} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            {kpis.map((k) => (
              <div key={k.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: k.fill }} /> {k.name}
                </span>
                <span className="font-semibold">{k.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
