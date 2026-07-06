import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Pill, BarChart3, TrendingUp, IndianRupee } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_app/pharmacy/reports")({
  component: PharmacyReports,
});

const reportData = [
  { month: "Jan", sales: 45000, scripts: 540 },
  { month: "Feb", sales: 52000, scripts: 610 },
  { month: "Mar", sales: 49000, scripts: 580 },
  { month: "Apr", sales: 63000, scripts: 710 },
  { month: "May", sales: 58000, scripts: 670 },
  { month: "Jun", sales: 71000, scripts: 820 },
];

function PharmacyReports() {
  return (
    <>
      <PageHeader
        title="Pharmacy Reports"
        description="Analytics overview of sales performance, script counts, and inventory metrics."
      />
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-6">
        <StatCard label="Monthly sales average" value="₹56,333" icon={IndianRupee} tone="success" />
        <StatCard label="Average scripts filled" value="655" icon={Pill} tone="primary" />
        <StatCard label="Year-over-year growth" value="+18.4%" icon={TrendingUp} tone="warning" />
      </div>

      <div className="surface-elevated p-5 mt-6">
        <h3 className="font-display font-semibold">Sales Revenue & Scripts count (H1 2026)</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
