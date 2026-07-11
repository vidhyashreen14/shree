import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Calendar,
  Download,
  Eye,
  X,
  FileText,
  TrendingUp,
  Package,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  DollarSign,
  Layers,
  Activity,
  Printer
} from "lucide-react";
import { toast } from "sonner";
import { medicines } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/pharmacy/reports")({
  component: PharmacyReports,
});

// ==========================================
// 1. Mock Data Generators & Helpers
// ==========================================

interface SaleItem {
  medicine: string;
  qty: number;
  price: number;
  gstPercent: number;
  costPrice: number;
}

interface SaleInvoice {
  id: string;
  date: string;
  patientName: string;
  mrn: string;
  items: SaleItem[];
  amount: number; // subtotal
  tax: number; // total GST
  grandTotal: number;
  status: "paid";
}

// Generate consistent mock sales over the last 60 days
const getMockSales = (): SaleInvoice[] => {
  const sales: SaleInvoice[] = [];
  const medList = [
    { name: "Amoxicillin 500mg", price: 15, gst: 12 },
    { name: "Azithromycin 250mg", price: 28, gst: 12 },
    { name: "Atorvastatin 20mg", price: 22, gst: 5 },
    { name: "Aspirin 75mg", price: 6, gst: 5 },
    { name: "Metformin 500mg", price: 10, gst: 5 },
    { name: "Paracetamol 650mg", price: 5, gst: 12 },
    { name: "Ibuprofen 400mg", price: 8, gst: 12 },
    { name: "Cetirizine 10mg", price: 7, gst: 18 },
    { name: "Omeprazole 20mg", price: 12, gst: 18 },
    { name: "Amlodipine 5mg", price: 14, gst: 5 }
  ];

  const patientList = [
    "Aarav Sharma", "Saanvi Patel", "Vihaan Iyer", "Diya Kapoor", "Arjun Mehta",
    "Anaya Reddy", "Reyansh Khanna", "Ishaani Rao", "Kabir Joshi", "Aadhya Nair"
  ];

  const baseDate = new Date("2026-07-10");
  for (let i = 1; i <= 45; i++) {
    const transactionDate = new Date(baseDate);
    transactionDate.setDate(baseDate.getDate() - (i % 60));
    const dateStr = transactionDate.toISOString().split("T")[0];

    const numItems = (i % 3) + 1;
    const items: SaleItem[] = [];
    let subtotal = 0;
    let taxTotal = 0;

    for (let j = 0; j < numItems; j++) {
      const medIndex = (i + j) % medList.length;
      const med = medList[medIndex]!;
      const qty = ((i * 2 + j) % 4) + 1;
      const itemPrice = med.price;
      const lineCost = itemPrice * qty;
      const lineTax = (lineCost * med.gst) / 100;

      items.push({
        medicine: med.name,
        qty,
        price: itemPrice,
        gstPercent: med.gst,
        costPrice: Number((itemPrice * 0.75).toFixed(2)),
      });

      subtotal += lineCost;
      taxTotal += lineTax;
    }

    sales.push({
      id: `INV-${9100 + i}`,
      date: dateStr,
      patientName: patientList[i % patientList.length]!,
      mrn: `MRN-${10200 + i}`,
      items,
      amount: subtotal,
      tax: Number(taxTotal.toFixed(2)),
      grandTotal: Number((subtotal + taxTotal).toFixed(2)),
      status: "paid"
    });
  }
  return sales;
};

// Audit logs mock datasets
const getMockDeletedOrders = () => [
  { date: "2026-07-08", id: "PO-5012", supplier: "MedPlus Distributors", amount: 15400, user: "Sister Joan", reason: "Ordered wrong batch size" },
  { date: "2026-07-02", id: "PO-5008", supplier: "Apollo Pharmacy", amount: 8900, user: "Rahul Verma", reason: "Supplier out of stock" },
  { date: "2026-06-25", id: "PO-5004", supplier: "Wellness Medical Suppliers", amount: 24500, user: "Sister Joan", reason: "Duplicate purchase order" },
  { date: "2026-06-12", id: "PO-5001", supplier: "Global Health Distributors", amount: 12000, user: "Rahul Verma", reason: "Items added directly to inventory instead" }
];

const getMockModifiedInvoices = () => [
  { date: "2026-07-09", id: "INV-9022", cashier: "Priya Menon", original: 850, modified: 650, reason: "Corrected quantity of Paracetamol 650mg" },
  { date: "2026-07-05", id: "INV-9018", cashier: "Mei Chen", original: 1450, modified: 1100, reason: "Applied senior citizen discount" },
  { date: "2026-06-28", id: "INV-9012", cashier: "Priya Menon", original: 600, modified: 720, reason: "Added missing Salbutamol Inhaler to invoice" },
  { date: "2026-06-18", id: "INV-9005", cashier: "Mei Chen", original: 2200, modified: 1950, reason: "Patient returned partial strips of Amlodipine" }
];

const getMockModifiedBills = () => [
  { date: "2026-07-10", id: "BILL-2041", cashier: "Priya Menon", action: "Item Removed", details: "Removed Ibuprofen 400mg x2" },
  { date: "2026-07-06", id: "BILL-2035", cashier: "Mei Chen", action: "Qty Reduced", details: "Reduced Glimepiride 2mg from 5 to 2 units" },
  { date: "2026-06-30", id: "BILL-2022", cashier: "Priya Menon", action: "Discount Changed", details: "Increased discount from 5% to 10%" },
  { date: "2026-06-15", id: "BILL-2010", cashier: "Mei Chen", action: "Item Added", details: "Added Cetirizine 10mg x10" }
];

const getMockReturns = () => [
  { date: "2026-07-09", id: "RET-4008", patient: "Saanvi Patel", medicine: "Atorvastatin 20mg", qty: 10, amount: 220, reason: "Doctor changed prescription" },
  { date: "2026-07-05", id: "RET-4005", patient: "Vihaan Iyer", medicine: "Budesonide 200mcg", qty: 1, amount: 24, reason: "Damaged packaging" },
  { date: "2026-06-27", id: "RET-4002", patient: "Arjun Mehta", medicine: "Cetirizine 10mg", qty: 20, amount: 140, reason: "Allergic reaction to medicine" },
  { date: "2026-06-14", id: "RET-4001", patient: "Anaya Reddy", medicine: "Amoxicillin 500mg", qty: 5, amount: 75, reason: "Patient was discharged early" }
];

// Summary block structure
interface SummaryStat {
  label: string;
  value: string;
  icon: any;
  tone: "success" | "primary" | "warning" | "danger";
}

// Generated report result
interface GeneratedReport {
  html: string;
  summary: SummaryStat[];
  csv: string;
}

// ==========================================
// 2. Report Generation Engine
// ==========================================

const generateReportData = (
  reportId: string,
  startDate: string,
  endDate: string
): GeneratedReport => {
  const sales = getMockSales().filter((s) => s.date >= startDate && s.date <= endDate);
  let html = "";
  let summary: SummaryStat[] = [];
  let csv = "";

  switch (reportId) {
    case "sales-tax-report": {
      let totalTaxable = 0;
      let totalTax = 0;
      let totalGrand = 0;

      let rows = "";
      csv = "Invoice ID,Date,Patient,Taxable Amount,CGST,SGST,Total GST,Grand Total\n";

      sales.forEach((sale) => {
        const cgst = sale.tax / 2;
        const sgst = sale.tax / 2;
        totalTaxable += sale.amount;
        totalTax += sale.tax;
        totalGrand += sale.grandTotal;

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-mono">${sale.id}</td>
            <td class="px-4 py-3 text-sm">${sale.date}</td>
            <td class="px-4 py-3 text-sm font-medium">${sale.patientName}</td>
            <td class="px-4 py-3 text-sm text-right">₹${sale.amount.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${cgst.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${sgst.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right font-semibold text-primary">₹${sale.tax.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right font-bold">₹${sale.grandTotal.toFixed(2)}</td>
          </tr>
        `;
        csv += `${sale.id},${sale.date},${sale.patientName},${sale.amount},${cgst},${sgst},${sale.tax},${sale.grandTotal}\n`;
      });

      if (sales.length === 0) {
        rows = `<tr><td colSpan="8" class="px-4 py-8 text-center text-muted-foreground italic">No sales found in selected date range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Invoice ID</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Patient</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Taxable Amt</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">CGST</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">SGST</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Total GST</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Grand Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Taxable Sales", value: `₹${totalTaxable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, tone: "primary" },
        { label: "CGST (Central)", value: `₹${(totalTax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Layers, tone: "warning" },
        { label: "SGST (State)", value: `₹${(totalTax / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Layers, tone: "warning" },
        { label: "Total GST Collected", value: `₹${totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, tone: "success" }
      ];
      break;
    }

    case "monthly-billing": {
      const monthsMap: Record<string, { count: number; amount: number; tax: number; total: number }> = {};
      sales.forEach((sale) => {
        const month = sale.date.slice(0, 7);
        if (!monthsMap[month]) {
          monthsMap[month] = { count: 0, amount: 0, tax: 0, total: 0 };
        }
        monthsMap[month].count += 1;
        monthsMap[month].amount += sale.amount;
        monthsMap[month].tax += sale.tax;
        monthsMap[month].total += sale.grandTotal;
      });

      let rows = "";
      let grandTotalBillings = 0;
      let grandInvoicesCount = 0;
      csv = "Month,Invoices Count,Taxable Sales,GST Amount,Grand Total\n";

      Object.entries(monthsMap).sort().forEach(([month, data]) => {
        grandTotalBillings += data.total;
        grandInvoicesCount += data.count;

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-semibold">${month}</td>
            <td class="px-4 py-3 text-sm">${data.count}</td>
            <td class="px-4 py-3 text-sm text-right">₹${data.amount.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${data.tax.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right font-bold text-primary">₹${data.total.toFixed(2)}</td>
          </tr>
        `;
        csv += `${month},${data.count},${data.amount},${data.tax},${data.total}\n`;
      });

      if (Object.keys(monthsMap).length === 0) {
        rows = `<tr><td colSpan="5" class="px-4 py-8 text-center text-muted-foreground italic">No monthly aggregates found in selected date range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Month</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Invoices Count</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Taxable Sales</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">GST Amount</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Grand Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Total Billings", value: `₹${grandTotalBillings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, tone: "success" },
        { label: "Total Invoices", value: String(grandInvoicesCount), icon: FileText, tone: "primary" },
        { label: "Avg Invoice Size", value: `₹${grandInvoicesCount > 0 ? (grandTotalBillings / grandInvoicesCount).toFixed(2) : "0.00"}`, icon: DollarSign, tone: "warning" }
      ];
      break;
    }

    case "sale-item-wise": {
      const itemsMap: Record<string, { qty: number; sales: number; cost: number; gst: number }> = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!itemsMap[item.medicine]) {
            itemsMap[item.medicine] = { qty: 0, sales: 0, cost: 0, gst: item.gstPercent };
          }
          itemsMap[item.medicine].qty += item.qty;
          itemsMap[item.medicine].sales += item.qty * item.price;
          itemsMap[item.medicine].cost += item.qty * item.costPrice;
        });
      });

      let rows = "";
      let totalQty = 0;
      let totalSales = 0;
      let totalCost = 0;
      let bestSelling = "N/A";
      let maxQty = 0;

      csv = "Medicine Name,GST %,Quantity Sold,Average Price,Total Sales,Total Cost,Gross Margin\n";

      Object.entries(itemsMap)
        .sort((a, b) => b[1].sales - a[1].sales)
        .forEach(([medName, data]) => {
          totalQty += data.qty;
          totalSales += data.sales;
          totalCost += data.cost;
          const avgPrice = data.sales / data.qty;
          const margin = data.sales - data.cost;

          if (data.qty > maxQty) {
            maxQty = data.qty;
            bestSelling = medName;
          }

          rows += `
            <tr class="hover:bg-muted/30 border-b border-border transition-colors">
              <td class="px-4 py-3 text-sm font-semibold text-slate-800">${medName}</td>
              <td class="px-4 py-3 text-sm font-mono text-center">${data.gst}%</td>
              <td class="px-4 py-3 text-sm text-center">${data.qty}</td>
              <td class="px-4 py-3 text-sm text-right">₹${avgPrice.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right font-medium">₹${data.sales.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${data.cost.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right font-bold text-primary">₹${margin.toFixed(2)}</td>
            </tr>
          `;
          csv += `${medName},${data.gst},${data.qty},${avgPrice.toFixed(2)},${data.sales.toFixed(2)},${data.cost.toFixed(2)},${margin.toFixed(2)}\n`;
        });

      if (Object.keys(itemsMap).length === 0) {
        rows = `<tr><td colSpan="7" class="px-4 py-8 text-center text-muted-foreground italic">No items sold in selected date range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine Name</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">GST %</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Quantity Sold</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Avg Price</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Total Sales</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Total Cost</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Gross Margin</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Items Dispensed", value: String(totalQty), icon: Package, tone: "primary" },
        { label: "Gross Margin", value: `₹${(totalSales - totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, tone: "success" },
        { label: "Best Seller", value: bestSelling, icon: Activity, tone: "warning" }
      ];
      break;
    }

    case "date-wise-margin": {
      const dateMap: Record<string, { sales: number; cost: number }> = {};
      sales.forEach((sale) => {
        if (!dateMap[sale.date]) {
          dateMap[sale.date] = { sales: 0, cost: 0 };
        }
        dateMap[sale.date].sales += sale.amount;
        sale.items.forEach((item) => {
          dateMap[sale.date]!.cost += item.qty * item.costPrice;
        });
      });

      let rows = "";
      let totalSales = 0;
      let totalCost = 0;
      csv = "Date,Total Sales,Cost of Goods Sold (COGS),Profit Margin,Margin %\n";

      Object.entries(dateMap)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .forEach(([date, data]) => {
          totalSales += data.sales;
          totalCost += data.cost;
          const profit = data.sales - data.cost;
          const pct = data.sales > 0 ? (profit / data.sales) * 100 : 0;

          rows += `
            <tr class="hover:bg-muted/30 border-b border-border transition-colors">
              <td class="px-4 py-3 text-sm font-semibold">${date}</td>
              <td class="px-4 py-3 text-sm text-right">₹${data.sales.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${data.cost.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right font-semibold text-primary">₹${profit.toFixed(2)}</td>
              <td class="px-4 py-3 text-sm text-right font-mono font-medium">${pct.toFixed(1)}%</td>
            </tr>
          `;
          csv += `${date},${data.sales.toFixed(2)},${data.cost.toFixed(2)},${profit.toFixed(2)},${pct.toFixed(1)}%\n`;
        });

      if (Object.keys(dateMap).length === 0) {
        rows = `<tr><td colSpan="5" class="px-4 py-8 text-center text-muted-foreground italic">No daily statistics found in selected date range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Total Sales</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">COGS</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Gross Profit</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Margin %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      const profit = totalSales - totalCost;
      summary = [
        { label: "Total Revenue", value: `₹${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, tone: "primary" },
        { label: "Total Cost", value: `₹${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Layers, tone: "warning" },
        { label: "Net Profit", value: `₹${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, tone: "success" },
        { label: "Profit Margin", value: `${totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : "0.0"}%`, icon: Activity, tone: "success" }
      ];
      break;
    }

    case "inventory-report": {
      let totalStockValue = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      let rows = "";
      csv = "Medicine Name,Category,Batch,Expiry Date,Stock Level,Min Stock,Price,Stock Value,Status\n";

      medicines.forEach((med) => {
        const val = med.stock * med.pricePerUnit;
        totalStockValue += val;

        let statusText = "In Stock";
        let badgeClass = "bg-emerald-100 text-emerald-800";
        if (med.stock === 0) {
          statusText = "Out of Stock";
          badgeClass = "bg-rose-100 text-rose-800";
          outOfStockCount++;
        } else if (med.stock < med.minStock) {
          statusText = "Low Stock";
          badgeClass = "bg-amber-100 text-amber-800";
          lowStockCount++;
        }

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-semibold text-slate-800">${med.name}</td>
            <td class="px-4 py-3 text-sm text-muted-foreground">${med.category}</td>
            <td class="px-4 py-3 text-sm font-mono text-xs">${med.batch}</td>
            <td class="px-4 py-3 text-sm font-mono text-xs">${new Date(med.expiry).toDateString()}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center">${med.stock}</td>
            <td class="px-4 py-3 text-sm text-center text-muted-foreground">${med.minStock}</td>
            <td class="px-4 py-3 text-sm text-right">₹${med.pricePerUnit.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right font-medium">₹${val.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-center">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
                ${statusText}
              </span>
            </td>
          </tr>
        `;
        csv += `${med.name},${med.category},${med.batch},${med.expiry},${med.stock},${med.minStock},${med.pricePerUnit},${val},${statusText}\n`;
      });

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine Name</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Category</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Batch</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Expiry Date</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Stock Level</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Min Stock</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Price</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Stock Value</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Total Stock Value", value: `₹${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, tone: "primary" },
        { label: "Low Stock Items", value: String(lowStockCount), icon: AlertCircle, tone: "warning" },
        { label: "Out of Stock", value: String(outOfStockCount), icon: TrendingDown, tone: "danger" }
      ];
      break;
    }

    case "product-margin": {
      let totalMarginPct = 0;
      let count = 0;
      let highestMarginName = "N/A";
      let highestMarginVal = -1;
      let lowestMarginName = "N/A";
      let lowestMarginVal = 101;

      let rows = "";
      csv = "Medicine Name,Category,Cost Price,Selling Price,GST,Markup Margin,Margin %\n";

      medicines.forEach((med) => {
        const cp = Number((med.pricePerUnit * 0.72).toFixed(2));
        const sp = med.pricePerUnit;
        const profit = sp - cp;
        const pct = (profit / sp) * 100;

        totalMarginPct += pct;
        count++;

        if (pct > highestMarginVal) {
          highestMarginVal = pct;
          highestMarginName = med.name;
        }
        if (pct < lowestMarginVal) {
          lowestMarginVal = pct;
          lowestMarginName = med.name;
        }

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-semibold text-slate-800">${med.name}</td>
            <td class="px-4 py-3 text-sm text-muted-foreground">${med.category}</td>
            <td class="px-4 py-3 text-sm text-right text-muted-foreground">₹${cp.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right">₹${sp.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm font-mono text-center">${med.gst}%</td>
            <td class="px-4 py-3 text-sm text-right font-medium text-emerald-600">₹${profit.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-right font-mono font-semibold">${pct.toFixed(1)}%</td>
          </tr>
        `;
        csv += `${med.name},${med.category},${cp},${sp},${med.gst},${profit.toFixed(2)},${pct.toFixed(1)}%\n`;
      });

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine Name</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Category</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Cost Price</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Selling Price</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">GST</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Markup Margin</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Margin %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Avg Profit Margin", value: `${count > 0 ? (totalMarginPct / count).toFixed(1) : "0.0"}%`, icon: TrendingUp, tone: "success" },
        { label: "Highest Margin", value: highestMarginName, icon: Activity, tone: "primary" },
        { label: "Lowest Margin", value: lowestMarginName, icon: AlertCircle, tone: "warning" }
      ];
      break;
    }

    case "moving-nonmoving": {
      const itemsMap: Record<string, number> = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!itemsMap[item.medicine]) {
            itemsMap[item.medicine] = 0;
          }
          itemsMap[item.medicine] += item.qty;
        });
      });

      let fastCount = 0;
      let slowCount = 0;
      let nonMovingCount = 0;

      let rows = "";
      csv = "Medicine Name,Category,Current Stock,Period Sales,Movement Status\n";

      medicines.forEach((med) => {
        const qtySold = itemsMap[med.name] || 0;
        let movementStatus = "Non-Moving";
        let badgeClass = "bg-rose-100 text-rose-800";

        if (qtySold > 12) {
          movementStatus = "Fast Moving";
          badgeClass = "bg-emerald-100 text-emerald-800";
          fastCount++;
        } else if (qtySold > 0) {
          movementStatus = "Slow Moving";
          badgeClass = "bg-amber-100 text-amber-800";
          slowCount++;
        } else {
          nonMovingCount++;
        }

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-semibold text-slate-800">${med.name}</td>
            <td class="px-4 py-3 text-sm text-muted-foreground">${med.category}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center">${med.stock}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center text-primary">${qtySold}</td>
            <td class="px-4 py-3 text-sm text-center">
              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
                ${movementStatus}
              </span>
            </td>
          </tr>
        `;
        csv += `${med.name},${med.category},${med.stock},${qtySold},${movementStatus}\n`;
      });

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine Name</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Category</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Current Stock</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Period Sales</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Movement Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Fast Moving Items", value: String(fastCount), icon: TrendingUp, tone: "success" },
        { label: "Slow Moving Items", value: String(slowCount), icon: Activity, tone: "warning" },
        { label: "Non-Moving Items", value: String(nonMovingCount), icon: AlertCircle, tone: "danger" }
      ];
      break;
    }

    case "schedule-drug": {
      const scheduleMeds = medicines.filter((m) => m.category === "Antibiotics" || m.name.includes("Amoxicillin") || m.name.includes("Azithromycin"));
      const itemsMap: Record<string, number> = {};
      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!itemsMap[item.medicine]) {
            itemsMap[item.medicine] = 0;
          }
          itemsMap[item.medicine] += item.qty;
        });
      });

      let totalSold = 0;
      let rows = "";
      csv = "Medicine Name,Schedule Category,Batch,Total Dispensed,Prescribing Doctor,Verification Status\n";

      scheduleMeds.forEach((med) => {
        const qtySold = itemsMap[med.name] || 0;
        totalSold += qtySold;
        const scheduleCat = med.name.includes("Amoxicillin") ? "Schedule H1" : "Schedule H";

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-semibold text-slate-800">${med.name}</td>
            <td class="px-4 py-3 text-sm text-center font-mono font-medium text-rose-700">${scheduleCat}</td>
            <td class="px-4 py-3 text-sm font-mono text-xs text-center">${med.batch}</td>
            <td class="px-4 py-3 text-sm font-semibold text-center text-primary">${qtySold}</td>
            <td class="px-4 py-3 text-sm">Dr. Vikram Shah</td>
            <td class="px-4 py-3 text-sm text-center">
              <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </td>
          </tr>
        `;
        csv += `${med.name},${scheduleCat},${med.batch},${qtySold},Dr. Vikram Shah,Verified\n`;
      });

      if (scheduleMeds.length === 0) {
        rows = `<tr><td colSpan="6" class="px-4 py-8 text-center text-muted-foreground italic">No schedule drugs cataloged.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine Name</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Schedule Category</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Batch</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Total Dispensed</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Prescribing Doctor</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Verification Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Schedule H/H1 Drugs Sold", value: String(totalSold), icon: Package, tone: "danger" },
        { label: "Verified Logs", value: `${scheduleMeds.length} Items`, icon: CheckCircle, tone: "success" }
      ];
      break;
    }

    case "orders-deleted": {
      const orders = getMockDeletedOrders().filter((o) => o.date >= startDate && o.date <= endDate);
      let rows = "";
      let totalVal = 0;
      csv = "Date,Order ID,Supplier,Amount,Deleted By,Reason\n";

      orders.forEach((o) => {
        totalVal += o.amount;
        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-mono">${o.date}</td>
            <td class="px-4 py-3 text-sm font-semibold">${o.id}</td>
            <td class="px-4 py-3 text-sm font-medium text-slate-800">${o.supplier}</td>
            <td class="px-4 py-3 text-sm text-right">₹${o.amount.toLocaleString()}</td>
            <td class="px-4 py-3 text-sm text-center font-semibold text-rose-700">${o.user}</td>
            <td class="px-4 py-3 text-sm text-muted-foreground">${o.reason}</td>
          </tr>
        `;
        csv += `${o.date},${o.id},${o.supplier},${o.amount},${o.user},${o.reason}\n`;
      });

      if (orders.length === 0) {
        rows = `<tr><td colSpan="6" class="px-4 py-8 text-center text-muted-foreground italic">No deleted purchase orders logged in this range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Order ID</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Supplier</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Amount</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Deleted By</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Reason</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Total Deletions", value: String(orders.length), icon: AlertCircle, tone: "danger" },
        { label: "Total Loss Value", value: `₹${totalVal.toLocaleString()}`, icon: TrendingDown, tone: "danger" }
      ];
      break;
    }

    case "invoices-modified": {
      const logs = getMockModifiedInvoices().filter((l) => l.date >= startDate && l.date <= endDate);
      let rows = "";
      let totalDiff = 0;
      csv = "Date,Invoice ID,Cashier,Original Amount,Modified Amount,Difference,Reason\n";

      logs.forEach((l) => {
        const diff = l.modified - l.original;
        totalDiff += diff;
        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-mono">${l.date}</td>
            <td class="px-4 py-3 text-sm font-semibold">${l.id}</td>
            <td class="px-4 py-3 text-sm font-medium text-slate-800">${l.cashier}</td>
            <td class="px-4 py-3 text-sm text-right">₹${l.original.toLocaleString()}</td>
            <td class="px-4 py-3 text-sm text-right">₹${l.modified.toLocaleString()}</td>
            <td class="px-4 py-3 text-sm text-right font-bold ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}">
              ${diff >= 0 ? "+" : ""}₹${diff.toLocaleString()}
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground">${l.reason}</td>
          </tr>
        `;
        csv += `${l.date},${l.id},${l.cashier},${l.original},${l.modified},${diff},${l.reason}\n`;
      });

      if (logs.length === 0) {
        rows = `<tr><td colSpan="7" class="px-4 py-8 text-center text-muted-foreground italic">No invoice modifications logged in this range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Invoice ID</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Cashier</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Original Amount</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Modified Amount</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Difference</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Reason</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Invoice Audits", value: String(logs.length), icon: Edit, tone: "warning" },
        { label: "Financial Impact", value: `${totalDiff >= 0 ? "+" : ""}₹${totalDiff.toLocaleString()}`, icon: DollarSign, tone: totalDiff >= 0 ? "success" : "danger" }
      ];
      break;
    }

    case "bill-modified": {
      const logs = getMockModifiedBills().filter((l) => l.date >= startDate && l.date <= endDate);
      let rows = "";
      csv = "Date,Bill ID,Cashier,Action Type,Details\n";

      logs.forEach((l) => {
        let actionBadgeColor = "bg-sky-100 text-sky-800";
        if (l.action === "Item Removed") actionBadgeColor = "bg-rose-100 text-rose-800";
        else if (l.action === "Qty Reduced") actionBadgeColor = "bg-amber-100 text-amber-800";

        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-mono">${l.date}</td>
            <td class="px-4 py-3 text-sm font-semibold">${l.id}</td>
            <td class="px-4 py-3 text-sm font-medium text-slate-800">${l.cashier}</td>
            <td class="px-4 py-3 text-sm text-center">
              <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold ${actionBadgeColor}">
                ${l.action}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground font-medium">${l.details}</td>
          </tr>
        `;
        csv += `${l.date},${l.id},${l.cashier},${l.action},${l.details}\n`;
      });

      if (logs.length === 0) {
        rows = `<tr><td colSpan="5" class="px-4 py-8 text-center text-muted-foreground italic">No bill modifications recorded.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Bill ID</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Cashier</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Action Type</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Total Modifications", value: String(logs.length), icon: Edit, tone: "warning" }
      ];
      break;
    }

    case "medicine-returns": {
      const returns = getMockReturns().filter((r) => r.date >= startDate && r.date <= endDate);
      let rows = "";
      let totalRefund = 0;
      csv = "Date,Return ID,Patient Name,Medicine,Returned Qty,Refund Amount,Reason\n";

      returns.forEach((r) => {
        totalRefund += r.amount;
        rows += `
          <tr class="hover:bg-muted/30 border-b border-border transition-colors">
            <td class="px-4 py-3 text-sm font-mono">${r.date}</td>
            <td class="px-4 py-3 text-sm font-semibold">${r.id}</td>
            <td class="px-4 py-3 text-sm font-medium text-slate-800">${r.patient}</td>
            <td class="px-4 py-3 text-sm font-semibold">${r.medicine}</td>
            <td class="px-4 py-3 text-sm text-center font-bold">${r.qty}</td>
            <td class="px-4 py-3 text-sm text-right font-bold text-rose-700">₹${r.amount.toFixed(2)}</td>
            <td class="px-4 py-3 text-sm text-muted-foreground font-medium">${r.reason}</td>
          </tr>
        `;
        csv += `${r.date},${r.id},${r.patient},${r.medicine},${r.qty},${r.amount},${r.reason}\n`;
      });

      if (returns.length === 0) {
        rows = `<tr><td colSpan="7" class="px-4 py-8 text-center text-muted-foreground italic">No medicine returns processed in this range.</td></tr>`;
      }

      html = `
        <table class="min-w-full divide-y divide-border text-sm">
          <thead>
            <tr class="bg-muted/40">
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Date</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Return ID</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Patient Name</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Medicine</th>
              <th class="px-4 py-3 text-center font-semibold text-xs text-muted-foreground uppercase">Qty</th>
              <th class="px-4 py-3 text-right font-semibold text-xs text-muted-foreground uppercase">Refund Amount</th>
              <th class="px-4 py-3 text-left font-semibold text-xs text-muted-foreground uppercase">Reason</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            ${rows}
          </tbody>
        </table>
      `;

      summary = [
        { label: "Returned Items", value: String(returns.length), icon: RefreshCw, tone: "warning" },
        { label: "Amount Refunded", value: `₹${totalRefund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingDown, tone: "danger" }
      ];
      break;
    }
  }

  return { html, summary, csv };
};

// ==========================================
// 3. Component Definition
// ==========================================

function PharmacyReports() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReportName, setSelectedReportName] = useState<string | null>(null);

  // Date Range state
  const [startDate, setStartDate] = useState("2026-06-10");
  const [endDate, setEndDate] = useState("2026-07-10");

  // Report generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportHTML, setReportHTML] = useState("");
  const [reportSummary, setReportSummary] = useState<SummaryStat[]>([]);
  const [reportCSV, setReportCSV] = useState("");

  const reportCategories = {
    sales: {
      title: "Sales & Revenue Reports",
      icon: <TrendingUp className="h-5 w-5" />,
      emoji: "📊",
      reports: [
        { id: "sales-tax-report", name: "Sales Tax Report", icon: "📈", desc: "View sales tax and GST data" },
        { id: "monthly-billing", name: "Monthly Billing Report", icon: "📅", desc: "Monthly billing summary" },
        { id: "sale-item-wise", name: "Sale Item Wise Report", icon: "📋", desc: "Sales analysis by item" },
        { id: "date-wise-margin", name: "Date Wise Margin Report", icon: "💰", desc: "Profit margins by date" }
      ]
    },
    inventory: {
      title: "Inventory & Stock Reports",
      icon: <Package className="h-5 w-5" />,
      emoji: "📦",
      reports: [
        { id: "inventory-report", name: "Inventory Report", icon: "📦", desc: "Current stock status" },
        { id: "product-margin", name: "Product Margin Report", icon: "📊", desc: "Margin analysis by product" },
        { id: "moving-nonmoving", name: "Moving & Non-Moving Medicines", icon: "🔄", desc: "Stock movement analysis" },
        { id: "schedule-drug", name: "Schedule Drug Report", icon: "💊", desc: "Schedule H/H1 drug list" }
      ]
    },
    modifications: {
      title: "Modification & Deletion Reports",
      icon: <Edit className="h-5 w-5" />,
      emoji: "📝",
      reports: [
        { id: "orders-deleted", name: "Orders Deleted Report", icon: "🗑️", desc: "Deleted order history" },
        { id: "invoices-modified", name: "Invoices Modified Report", icon: "✏️", desc: "Invoice modification history" },
        { id: "bill-modified", name: "Bill Modified Report", icon: "📝", desc: "Bill modification tracking" },
        { id: "medicine-returns", name: "Medicine Returns Report", icon: "↩️", desc: "Returned medicines log" }
      ]
    }
  };

  const handleOpenGenerator = (reportId: string, reportName: string) => {
    setSelectedReportId(reportId);
    setSelectedReportName(reportName);
    setReportGenerated(false);
    setIsGenerating(false);
    setReportHTML("");
    setReportSummary([]);
    setReportCSV("");
  };

  const handleCloseGenerator = () => {
    setSelectedReportId(null);
    setSelectedReportName(null);
  };

  const handleViewReport = () => {
    if (!startDate || !endDate) {
      toast.error("Please specify both Start Date and End Date!");
      return;
    }
    if (startDate > endDate) {
      toast.error("Start Date cannot be after End Date!");
      return;
    }

    setIsGenerating(true);

    // Simulate database querying with skeleton loading state
    setTimeout(() => {
      if (selectedReportId) {
        const { html, summary, csv } = generateReportData(selectedReportId, startDate, endDate);
        setReportHTML(html);
        setReportSummary(summary);
        setReportCSV(csv);
        setReportGenerated(true);
        toast.success(`${selectedReportName} loaded successfully!`);
      }
      setIsGenerating(false);
    }, 850);
  };

  const downloadCSVFile = () => {
    if (!reportCSV) return;
    const blob = new Blob([reportCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReportId || "report"}_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully!");
  };

  const printReportContent = () => {
    window.print();
  };

  const getTotalReports = () => {
    let total = 0;
    Object.values(reportCategories).forEach((category) => {
      total += category.reports.length;
    });
    return total;
  };

  const toneClasses = {
    success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    primary: "bg-primary/5 text-primary border-primary/10",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    danger: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reports Dashboard"
        description="Comprehensive dynamic pharmacy reporting suite"
        actions={
          <div className="flex items-center gap-2">
            <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
              📋 {getTotalReports()} Reports Available
            </span>
          </div>
        }
      />

      {/* Report Categories */}
      <div className="space-y-8">
        {Object.entries(reportCategories).map(([key, category]) => (
          <div key={key} className="surface-elevated rounded-2xl overflow-hidden shadow-xs border border-border">
            <div className="p-4 border-b border-border bg-muted/20 flex items-center gap-3">
              <span className="text-2xl">{category.emoji}</span>
              {category.icon}
              <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                {category.title}
                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {category.reports.length}
                </span>
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all hover:border-primary/40 group"
                  >
                    <div>
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200 inline-block">
                        {report.icon}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm tracking-tight">{report.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{report.desc}</p>
                    </div>
                    <div className="mt-4 pt-1">
                      <button
                        className="w-full px-3.5 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
                        onClick={() => handleOpenGenerator(report.id, report.name)}
                      >
                        <Eye className="h-3.5 w-3.5" /> View Report
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Date Range & Report Viewer Modal */}
      {selectedReportId && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in print:absolute print:inset-0 print:bg-white print:p-0">
          <div className="bg-white border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-up print:border-none print:shadow-none print:max-h-none print:w-full">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border bg-muted/20 print:hidden">
              <h3 className="font-display font-bold text-lg flex items-center gap-2 text-slate-800">
                <FileText className="h-5 w-5 text-primary" />
                {selectedReportName}
              </h3>
              <button
                onClick={handleCloseGenerator}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">

              {/* Date Input Box (Hidden when printing) */}
              <div className="surface-elevated p-4 rounded-xl border border-border flex flex-wrap items-end gap-4 justify-between print:hidden">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> Start Date (From)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> End Date (To)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleViewReport}
                  disabled={isGenerating}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 text-sm transition-all hover:shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-98"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" /> View Report
                    </>
                  )}
                </button>
              </div>

              {/* Loader Skeleton */}
              {isGenerating && (
                <div className="flex flex-col gap-5 flex-1 print:hidden">
                  {/* Shimmer Stat blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-border p-4 rounded-xl flex flex-col gap-2.5 animate-pulse bg-muted/10">
                        <div className="h-3 bg-muted rounded w-24"></div>
                        <div className="h-7 bg-muted rounded w-32"></div>
                      </div>
                    ))}
                  </div>

                  {/* Shimmer Table */}
                  <div className="border border-border rounded-xl overflow-hidden flex-1 flex flex-col">
                    <div className="h-10 bg-muted/30 border-b border-border flex items-center px-4 justify-between animate-pulse">
                      <div className="h-3 bg-muted rounded w-20"></div>
                      <div className="h-3 bg-muted rounded w-16"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-12"></div>
                    </div>
                    <div className="p-4 space-y-4 flex-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center animate-pulse">
                          <div className="h-4 bg-muted rounded w-28"></div>
                          <div className="h-4 bg-muted rounded w-14"></div>
                          <div className="h-4 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-10"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Report Output */}
              {reportGenerated && !isGenerating && (
                <div className="flex-1 flex flex-col gap-5">

                  {/* Printing Header Details (Visible only when printing) */}
                  <div className="hidden print:flex flex-col gap-2 border-b border-border pb-4 mb-4">
                    <h1 className="text-2xl font-bold text-slate-800">MediCore Pharmacy</h1>
                    <p className="text-sm font-semibold text-slate-600">Report: {selectedReportName}</p>
                    <p className="text-xs text-muted-foreground">Period: {startDate} to {endDate}</p>
                  </div>

                  {/* Dynamic Summary Cards */}
                  {reportSummary.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {reportSummary.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-xl border flex items-center gap-3.5 shadow-2xs ${toneClasses[stat.tone] || toneClasses.primary}`}
                          >
                            <div className="p-2.5 rounded-lg bg-white/60 dark:bg-black/10 border border-current/10">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                                {stat.label}
                              </span>
                              <span className="text-base font-extrabold tracking-tight mt-0.5">
                                {stat.value}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Scrollable Table Content */}
                  <div className="bg-background border border-border rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
                    <div className="report-content" dangerouslySetInnerHTML={{ __html: reportHTML }} />
                  </div>
                </div>
              )}

              {/* Initial Instructions */}
              {!reportGenerated && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl bg-muted/5 print:hidden">
                  <FileText className="h-16 w-16 text-primary/40 mb-3" />
                  <h4 className="font-semibold text-slate-700 text-base">Select Date Range</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mt-1">
                    Select a start and end date range above, then click <strong>View Report</strong> to see the pharmacy metrics.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 print:hidden">
              <div className="flex items-center gap-2">
                {reportGenerated && (
                  <button
                    onClick={() => setReportGenerated(false)}
                    className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/20 cursor-pointer"
                  >
                    Adjust Date Range
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {reportGenerated && (
                  <>
                    <button
                      onClick={downloadCSVFile}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98 select-none"
                    >
                      <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button
                      onClick={printReportContent}
                      className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-lg hover:shadow-sm border border-border transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 select-none"
                    >
                      <Printer className="h-4 w-4" /> Print
                    </button>
                  </>
                )}
                <button
                  onClick={handleCloseGenerator}
                  className="px-4 py-2 bg-muted text-muted-foreground text-xs font-semibold rounded-lg hover:bg-muted/80 transition-colors cursor-pointer border border-border"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default PharmacyReports;