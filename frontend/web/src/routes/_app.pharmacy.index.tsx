import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
import { medicines } from "@/lib/mock/data";
import { Pill, PackageSearch, AlertTriangle, Receipt, Truck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/pharmacy/")({
  component: PharmacyOverview,
});

const sales = Array.from({ length: 14 }).map((_, i) => ({
  day: `D-${14 - i}`,
  revenue: 8000 + ((i * 1700) % 14000) + (i % 3) * 2000,
  scripts: 22 + ((i * 5) % 30),
}));

function PharmacyOverview() {
  const lowStock = medicines.filter((m) => m.stock <= m.minStock);
  const expired = medicines.filter((m) => new Date(m.expiry) < new Date());
  const inventoryValue = medicines.reduce((s, m) => s + m.stock * m.pricePerUnit, 0);

  return (
    <>
      <PageHeader
        eyebrow="Pharmacy"
        title="Dispensing & inventory"
        description="Live stock, expiries and today's billing throughput."
        actions={
          <div className="flex gap-2">
            <Link to="/pharmacy/orders">
              <Button variant="outline">
                <Truck className="mr-2 h-4 w-4" /> New PO
              </Button>
            </Link>
            <Link to="/pharmacy/billing">
              <Button>
                <Receipt className="mr-2 h-4 w-4" /> New bill
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="SKUs in catalog" value={medicines.length} icon={Pill} tone="primary" />
        <StatCard label="Low stock" value={lowStock.length} icon={AlertTriangle} tone="warning" />
        <StatCard
          label="Expired batches"
          value={expired.length}
          icon={AlertTriangle}
          tone="danger"
        />
        <StatCard
          label="Inventory value"
          value={`₹${(inventoryValue / 1000).toFixed(1)}k`}
          icon={PackageSearch}
          tone="success"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Dispensing — last 14 days</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales}>
                <defs>
                  <linearGradient id="rx" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="url(#rx)"
                  strokeWidth={2}
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
              className="text-xs font-semibold text-primary hover:underline"
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
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning-foreground">
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
