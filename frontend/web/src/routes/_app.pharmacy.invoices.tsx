import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Receipt, FilePlus } from "lucide-react";
import { patients } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/pharmacy/invoices")({
  component: PharmacyInvoices,
});

const invoices = Array.from({ length: 10 }).map((_, i) => ({
  id: `INV-${9000 + i}`,
  patient: patients[i % patients.length]!.name,
  mrn: patients[i % patients.length]!.mrn,
  amount: 850 + (i * 240) % 2500,
  tax: 42 + (i * 12) % 150,
  status: (["paid", "pending", "refunded"] as const)[i % 3],
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
}));

const tone = { paid: "success", pending: "warning", refunded: "danger" } as const;

function PharmacyInvoices() {
  return (
    <>
      <PageHeader
        title="GST Invoices"
        description="View and manage pharmaceutical billing records and customer receipts."
        actions={
          <Link to="/pharmacy/billing">
            <Button>
              <FilePlus className="mr-2 h-4 w-4" /> New Bill
            </Button>
          </Link>
        }
      />
      <div className="surface-elevated overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr>
                {["Invoice ID", "Patient", "MRN", "Amount", "GST", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                  <td className="px-4 py-3 font-medium">{inv.patient}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.mrn}</td>
                  <td className="px-4 py-3">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{inv.tax}</td>
                  <td className="px-4 py-3"><StatusChip tone={tone[inv.status]}>{inv.status}</StatusChip></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.date).toDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
