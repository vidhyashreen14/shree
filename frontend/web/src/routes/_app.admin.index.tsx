<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import {
  Activity,
  Users,
  CalendarDays,
  Stethoscope,
  Pill,
  FlaskConical,
  TrendingUp,
  BedDouble,
  HeartPulse,
  Monitor,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  monthlyRevenue,
  dailyVisits,
  departmentLoad,
  departments,
  doctors,
  patients,
  appointments,
  medicines,
} from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin/")({
  component: AdminOverview,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "oklch(0.7 0.13 50)",
  "oklch(0.6 0.18 280)",
];

function AdminOverview() {
  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b.revenue, 0);
  const lowStock = medicines.filter((m) => m.stock < m.minStock).length;
  const todays = appointments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Admin · Hospital overview"
        title="Hospital command center"
        description="Live snapshot of operations across all departments."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active patients"
          value={patients.length.toLocaleString()}
          icon={Users}
          tone="primary"
          trend={4.2}
          hint="vs last week"
        />
        <StatCard
          label="Today's appointments"
          value={todays}
          icon={CalendarDays}
          tone="info"
          trend={1.8}
          hint="vs yesterday"
        />
        <StatCard
          label="Doctors on duty"
          value={`${doctors.filter((d) => d.available).length}/${doctors.length}`}
          icon={Stethoscope}
          tone="success"
        />
        <StatCard
          label="Monthly revenue"
          value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
          icon={TrendingUp}
          tone="primary"
          trend={6.4}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="surface-elevated p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Revenue trend</h3>
              <p className="text-xs text-muted-foreground">
                OPD, pharmacy & lab over the last 9 months
              </p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
              +12.4%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Department load</h3>
          <p className="text-xs text-muted-foreground">Patients today</p>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={departmentLoad}
                  dataKey="patients"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {departmentLoad.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="surface-elevated p-5 xl:col-span-2">
          <h3 className="font-display font-semibold">Daily visits (last 14 days)</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={dailyVisits} barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="opd" stackId="a" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ipd" stackId="a" fill="var(--color-chart-2)" />
                <Bar
                  dataKey="emergency"
                  stackId="a"
                  fill="var(--color-chart-4)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <StatCard
            label="Pharmacy SKUs"
            value={medicines.length}
            icon={Pill}
            tone="info"
            hint={`${lowStock} low stock`}
          />
          <StatCard
            label="Lab tests today"
            value="36"
            icon={FlaskConical}
            tone="warning"
            trend={-3.1}
            hint="vs yesterday"
          />
          <StatCard label="IPD bed occupancy" value="82%" icon={BedDouble} tone="success" />
          <StatCard label="System uptime" value="99.98%" icon={Activity} tone="primary" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Top departments</h3>
          <div className="mt-4 space-y-3">
            {departments.slice(0, 5).map((d) => {
              const pct = Math.min(100, (d.patientsToday / 70) * 100);
              return (
                <div key={d.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{d.name}</span>
                    <span className="text-muted-foreground">{d.patientsToday} pts</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Patient growth</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <LineChart
                data={monthlyRevenue.map((m, i) => ({
                  month: m.month,
                  patients: 800 + i * 90 + (i % 2) * 40,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Monitor strip */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              Quick Monitor
            </h3>
            <p className="text-xs text-muted-foreground">
              Open any staff dashboard for real-time monitoring
            </p>
          </div>
          <Link
            to="/admin/access"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Manage access <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            {
              role: "frontdesk",
              label: "Front Desk",
              icon: Users,
              color: "from-blue-500 to-blue-700",
              stat: "47 check-ins",
            },
            {
              role: "doctor",
              label: "Doctor",
              icon: Stethoscope,
              color: "from-emerald-500 to-emerald-700",
              stat: "8 in queue",
            },
            {
              role: "nurse",
              label: "Nurse",
              icon: HeartPulse,
              color: "from-pink-500 to-pink-700",
              stat: "31 vitals",
            },
            {
              role: "pharmacy",
              label: "Pharmacy",
              icon: Pill,
              color: "from-amber-500 to-amber-700",
              stat: "64 orders",
            },
            {
              role: "lab",
              label: "Laboratory",
              icon: FlaskConical,
              color: "from-violet-500 to-violet-700",
              stat: "14 pending",
            },
          ].map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.role}
                to="/admin/access"
                id={`quick-monitor-${d.role}`}
                className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", d.color)} />
                <div
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white mb-3",
                    d.color
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-sm">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.stat} today</p>
                <div className="mt-2 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Monitor <ArrowRight className="ml-1 h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
=======
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/admin/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/settings' });
  },
  component: () => null,
});
>>>>>>> a821a0c (second update)
