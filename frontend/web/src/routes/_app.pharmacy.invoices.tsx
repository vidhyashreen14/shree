<<<<<<< HEAD
import { createFileRoute} from "@tanstack/react-router";

import { StatusChip } from "@/components/common/StatusChip";

import {
  FilePlus,
  Plus,
  X,
  Save,
  Printer,
  Download,
  Trash2,
  Edit2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Eye,
  ChevronDown,
  ChevronUp,
  Pill,
  PackageOpen,
} from "lucide-react";

import { useState, ChangeEvent } from "react";
import { toast } from "sonner";
=======
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { FilePlus } from 'lucide-react';
import { patients } from '@/lib/mock/data';
>>>>>>> a821a0c (second update)

export const Route = createFileRoute('/_app/pharmacy/invoices')({
  component: PharmacyInvoices,
});

<<<<<<< HEAD
export interface InvoiceMedicineItem {
  id: number;
  medicine: string;
  batch: string;
  batchExpiry: string;
  unitsPerStrip: string;
  noOfStrips: string;
  freeStrips: string;
  gstTotal: string;
  mrpPerStrip: string;
  discount: string;
  hsnCode: string;
  rackNo: string;
  boxNo: string;
  netPrice: number;
  totalUnits: number;
}

export interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  stockist: string;
  date: string;
  items: InvoiceMedicineItem[];
  totalAmount: number;
  totalGST: number;
  grandTotal: number;
  status: "paid" | "pending" | "refunded";
  patientName?: string;
  patientMRN?: string;
}

const stockistOptions = [
  "-- Select Pharmacy Stockist --",
  "Apollo Pharmacy",
  "MedPlus Health Services",
  "Pharma Distributors India",
  "MediCare Suppliers Pvt Ltd",
  "HealthPlus Stockists",
  "City Pharmacy Distributors",
  "National Medical Suppliers",
  "Regional Pharma Stockists",
  "Global Health Distributors",
  "LifeCare Pharmaceuticals",
  "Wellness Medical Suppliers",
];
=======
const invoices = Array.from({ length: 10 }).map((_, i) => ({
  id: `INV-${9000 + i}`,
  patient: patients[i % patients.length]!.name,
  mrn: patients[i % patients.length]!.mrn,
  amount: 850 + ((i * 240) % 2500),
  tax: 42 + ((i * 12) % 150),
  status: (['paid', 'pending', 'refunded'] as const)[i % 3],
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
}));
>>>>>>> a821a0c (second update)

const tone = { paid: 'success', pending: 'warning', refunded: 'danger' } as const;

function PharmacyInvoices() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedStockist, setSelectedStockist] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);

  // Medicine fields
  const [medicineFields, setMedicineFields] = useState({
    medicine: "",
    batch: "",
    batchExpiry: "",
    unitsPerStrip: "",
    noOfStrips: "",
    freeStrips: "",
    gstTotal: "",
    mrpPerStrip: "",
    discount: "",
    hsnCode: "",
    rackNo: "",
    boxNo: "",
    netPrice: "",
  });

  const [medicineList, setMedicineList] = useState<InvoiceMedicineItem[]>([]);
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<InvoiceMedicineItem>>({});
  const [viewInvoice, setViewInvoice] = useState<SavedInvoice | null>(null);

  const handleMedicineFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMedicineFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = () => {
    if (!medicineFields.medicine || !medicineFields.batch || !medicineFields.batchExpiry) {
      toast.warning("Please fill in Medicine, Batch, and Expiry!");
      return;
    }

    const totalUnits =
      parseInt(medicineFields.unitsPerStrip) * parseInt(medicineFields.noOfStrips) || 0;
    const netPrice = parseFloat(medicineFields.netPrice) || 0;

    setMedicineList((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...medicineFields,
        totalUnits,
        netPrice,
      },
    ]);

    toast.success("Medicine added successfully!");
    setMedicineFields({
      medicine: "",
      batch: "",
      batchExpiry: "",
      unitsPerStrip: "",
      noOfStrips: "",
      freeStrips: "",
      gstTotal: "",
      mrpPerStrip: "",
      discount: "",
      hsnCode: "",
      rackNo: "",
      boxNo: "",
      netPrice: "",
    });
    setShowMedicineForm(false);
  };

  const handleDeleteMedicine = (id: number) => {
    const item = medicineList.find((i) => i.id === id);
    toast("Delete medicine?", {
      description: item?.medicine
        ? `"${item.medicine}" will be removed from the list.`
        : "This medicine will be removed.",
      action: {
        label: "Delete",
        onClick: () => {
          setMedicineList((prev) => prev.filter((m) => m.id !== id));
          if (editingMedicineId === id) {
            setEditingMedicineId(null);
            setEditFormData({});
          }
          toast.success("Medicine removed.");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleEditMedicine = (id: number) => {
    const item = medicineList.find((i) => i.id === id);
    if (item) {
      setEditingMedicineId(id);
      setEditFormData({ ...item });
    }
  };

  const handleSaveEditMedicine = () => {
    if (!editFormData.medicine || !editFormData.batch || !editFormData.batchExpiry) {
      toast.warning("Please fill in all required fields!");
      return;
    }
    setMedicineList((prev) =>
      prev.map((item) => (item.id === editingMedicineId ? { ...item, ...editFormData } : item))
    );
    setEditingMedicineId(null);
    setEditFormData({});
    toast.success("Medicine updated successfully!");
  };

  const handleCancelEditMedicine = () => {
    setEditingMedicineId(null);
    setEditFormData({});
  };

  const handleClearFields = () => {
    setMedicineFields({
      medicine: "",
      batch: "",
      batchExpiry: "",
      unitsPerStrip: "",
      noOfStrips: "",
      freeStrips: "",
      gstTotal: "",
      mrpPerStrip: "",
      discount: "",
      hsnCode: "",
      rackNo: "",
      boxNo: "",
      netPrice: "",
    });
  };

  const handleSaveInvoice = () => {
    if (!invoiceNumber) {
      toast.warning("Please enter Invoice Number!");
      return;
    }
    if (!selectedStockist || selectedStockist === "-- Select Pharmacy Stockist --") {
      toast.warning("Please select a Pharmacy Stockist!");
      return;
    }
    if (!invoiceDate) {
      toast.warning("Please select a Date!");
      return;
    }
    if (medicineList.length === 0) {
      toast.warning("Please add at least one medicine!");
      return;
    }

    // Calculate totals
    const totalAmount = medicineList.reduce((sum, item) => sum + (item.netPrice || 0), 0);
    const totalGST = medicineList.reduce((sum, item) => sum + (parseFloat(item.gstTotal) || 0), 0);
    const grandTotal = totalAmount + totalGST;

    const newInvoice: SavedInvoice = {
      id: `INV-${9000 + savedInvoices.length}`,
      invoiceNumber: invoiceNumber,
      stockist: selectedStockist,
      date: invoiceDate,
      items: [...medicineList],
      totalAmount: totalAmount,
      totalGST: totalGST,
      grandTotal: grandTotal,
      status: "pending",
      patientName: "Walk-in Customer",
      patientMRN: `MRN-${10000 + savedInvoices.length}`,
    };

    setSavedInvoices((prev) => [newInvoice, ...prev]);
    toast.success("Invoice saved successfully!", {
      description: `Invoice #${invoiceNumber} · Grand Total ₹${grandTotal.toFixed(2)}`,
    });

    // Reset form
    setInvoiceNumber("");
    setSelectedStockist("");
    setInvoiceDate("");
    setMedicineList([]);
  };

  const handlePrintInvoice = () => {
    if (medicineList.length === 0) {
      toast.error("No items to print. Add at least one medicine first.");
      return;
    }

    // Generate the print content
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      toast.error("Please allow popups to print.");
      return;
    }

    const formattedDate = new Date(invoiceDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Calculate totals
    let subtotal = 0;
    const itemsWithPrices = medicineList.map((item) => {
      const total = item.netPrice || 0;
      subtotal += total;
      return { ...item, total };
    });

    const totalGST = medicineList.reduce((sum, item) => sum + (parseFloat(item.gstTotal) || 0), 0);
    const grandTotal = subtotal + totalGST;

    // Build the HTML content - Removed all footer, signature, and extra sections
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: white;
              padding: 0.4in;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            }
            .invoice-wrapper {
              max-width: 100%;
              margin: 0 auto;
            }
            .hospital-header {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 28px;
              border-bottom: 2px solid #1f2937;
              padding-bottom: 20px;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo-placeholder {
              background: #0b3b5c;
              color: white;
              font-weight: 700;
              font-size: 1.2rem;
              width: 52px;
              height: 52px;
              border-radius: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              letter-spacing: 0.5px;
            }
            .hospital-name {
              font-size: 1.6rem;
              font-weight: 700;
              letter-spacing: -0.5px;
              color: #0b2a3c;
            }
            .hospital-detail {
              text-align: right;
              line-height: 1.5;
            }
            .hospital-detail p {
              font-size: 0.9rem;
              color: #1f2a3f;
            }
            .invoice-meta {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              background: #f8fafc;
              padding: 16px 18px;
              border-radius: 14px;
              margin-bottom: 28px;
            }
            .meta-block {
              display: flex;
              flex-direction: column;
            }
            .meta-block .label {
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              color: #4b5563;
            }
            .meta-block .value {
              font-weight: 600;
              font-size: 1rem;
              color: #0b1e2e;
            }
            .info-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 24px 40px;
              margin-bottom: 30px;
              padding: 6px 0 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-item {
              flex: 1 0 180px;
            }
            .info-item .label {
              font-size: 0.7rem;
              text-transform: uppercase;
              color: #4b5563;
              letter-spacing: 0.2px;
            }
            .info-item .value {
              font-weight: 500;
              font-size: 1rem;
              margin-top: 3px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
              margin: 14px 0 20px;
            }
            .items-table th {
              text-align: left;
              background: #f1f5f9;
              padding: 10px 8px;
              font-weight: 600;
              color: #1e293b;
              border-bottom: 2px solid #cbd5e1;
            }
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e9edf2;
              vertical-align: middle;
            }
            .items-table .text-right {
              text-align: right;
            }
            .items-table .text-center {
              text-align: center;
            }
            .items-table tfoot tr:first-child td {
              border-top: 2px solid #94a3b8;
              padding-top: 14px;
            }
            .items-table tfoot td {
              padding: 6px 8px;
              font-weight: 500;
            }
            .grand-total {
              font-size: 1.1rem;
              font-weight: 700;
              color: #0b2a3c;
            }
            .fw-600 { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- HEADER -->
            <div class="hospital-header" style="align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 20px;">
              <div class="logo-area" style="gap: 12px;">
                <div class="logo-placeholder" style="background: transparent; color: inherit; font-size: 2rem; width: auto; height: auto;">🏥</div>
                <div>
                  <div class="hospital-name" style="font-size: 1.7rem; color: #002b49;">Palm Health</div>
                  <div style="font-size: 0.9rem; color: #475569;">Multispecialty Hospital</div>
                </div>
              </div>
              <div class="hospital-detail" style="text-align: right; color: #334155; line-height: 1.6; font-size: 0.9rem;">
                <p>📍 12, Health Avenue, Metro City - 560001</p>
                <p>📞 +91 80 4123 4567 &nbsp;•&nbsp; ✉️ billing@palmhealth.in</p>
                <p style="font-weight: 700; color: #000; margin-top: 4px; font-size: 0.95rem;">GST: 22AABCP1234D1Z5</p>
              </div>
            </div>

            <!-- INVOICE META -->
            <div class="invoice-meta">
              <div class="meta-block">
                <span class="label">Invoice Number</span>
                <span class="value">#${invoiceNumber}</span>
              </div>
              <div class="meta-block">
                <span class="label">Billing Date</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="meta-block">
                <span class="label">Due Date</span>
                <span class="value">${new Date(new Date(invoiceDate).setDate(new Date(invoiceDate).getDate() + 15)).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>

            <!-- STOCKIST INFO -->
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Stockist</div>
                <div class="value">${selectedStockist}</div>
              </div>
              <div class="info-item">
                <div class="label">Invoice Type</div>
                <div class="value">Pharmacy Invoice</div>
              </div>
              <div class="info-item">
                <div class="label">Prepared By</div>
                <div class="value">Pharmacy Dept.</div>
              </div>
            </div>

            <!-- ITEMS TABLE -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:30%;">Medicine</th>
                  <th style="width:10%;" class="text-center">Batch</th>
                  <th style="width:12%;" class="text-center">Expiry</th>
                  <th style="width:10%;" class="text-center">Qty</th>
                  <th style="width:15%;" class="text-right">MRP (₹)</th>
                  <th style="width:10%;" class="text-right">GST%</th>
                  <th style="width:13%;" class="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsWithPrices
                  .map(
                    (item) => `
                  <tr>
                    <td><span class="fw-600">${item.medicine}</span></td>
                    <td class="text-center">${item.batch}</td>
                    <td class="text-center">${item.batchExpiry}</td>
                    <td class="text-center">${item.totalUnits || 0}</td>
                    <td class="text-right">₹${parseFloat(item.mrpPerStrip || "0").toFixed(2)}</td>
                    <td class="text-right">${item.gstTotal || 0}%</td>
                    <td class="text-right">₹${(item.netPrice || 0).toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right fw-600">Subtotal</td>
                  <td class="text-right">₹${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-right">Tax (GST)</td>
                  <td class="text-right">₹${totalGST.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-right grand-total" style="font-size:1.2rem;">Grand Total</td>
                  <td class="text-right grand-total" style="font-size:1.2rem;">₹${grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    toast.success("Invoice sent to printer.");
  };

  const handleDownloadInvoice = () => {
    if (medicineList.length === 0) {
      toast.error("No items to download. Add at least one medicine first.");
      return;
    }
    let csv = "Invoice Details\n";
    csv += `Invoice #,${invoiceNumber}\n`;
    csv += `Stockist,${selectedStockist}\n`;
    csv += `Date,${invoiceDate}\n\n`;
    csv += "Medicine,Batch,Expiry,GST%,Units/Strip,Total Units,MRP/Strip,Discount,Net Price\n";
    medicineList.forEach((item) => {
      csv += `${item.medicine},${item.batch},${item.batchExpiry},${item.gstTotal || 0},${item.unitsPerStrip || 0},${item.totalUnits || 0},${item.mrpPerStrip || 0},${item.discount || 0},${item.netPrice || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invoiceNumber || "New"}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded as CSV!");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleViewInvoice = (invoice: SavedInvoice) => {
    setViewInvoice(invoice);
  };

  const handleCloseViewInvoice = () => {
    setViewInvoice(null);
  };

  const toggleMedicineForm = () => {
    setShowMedicineForm(!showMedicineForm);
    if (!showMedicineForm) {
      // Reset form when opening
      setMedicineFields({
        medicine: "",
        batch: "",
        batchExpiry: "",
        unitsPerStrip: "",
        noOfStrips: "",
        freeStrips: "",
        gstTotal: "",
        mrpPerStrip: "",
        discount: "",
        hsnCode: "",
        rackNo: "",
        boxNo: "",
        netPrice: "",
      });
    }
  };

  return (
    <>
<<<<<<< HEAD
      {/* Add Invoice Form - Displayed directly on the page */}
      <div className="surface-elevated overflow-hidden mt-2">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <FilePlus className="h-5 w-5" /> Add Invoice
          </h3>
          <p className="text-sm text-muted-foreground">Create a new pharmaceutical invoice</p>
        </div>

        <div className="p-6">
          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-foreground/85 mb-1">
                Invoice # <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number"
                className="w-full px-4 py-2.5 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/85 mb-1">
                Pharmacy Stockist <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedStockist}
                onChange={(e) => setSelectedStockist(e.target.value)}
                className="w-full px-4 py-2.5 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              >
                {stockistOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground/85 mb-1">
                Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Add New Medicine Button - Matches Add Invoice Button Color */}
          <div className="flex justify-center my-4">
            <button
              onClick={toggleMedicineForm}
              className={`
                relative group px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 
                flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105
                bg-primary text-primary-foreground hover:bg-primary/90
              `}
            >
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary animate-pulse">
                {medicineList.length}
              </span>
              <div className="p-1.5 bg-white/20 rounded-full">
                {showMedicineForm ? <X className="h-4 w-4" /> : <PackageOpen className="h-4 w-4" />}
              </div>
              <span>{showMedicineForm ? "Close Medicine Form" : "Add New Medicine"}</span>
              {showMedicineForm ? (
                <ChevronUp className="h-4 w-4 transition-transform duration-300" />
              ) : (
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              )}
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>

          {/* Medicine Count Badge */}
          {medicineList.length > 0 && (
            <div className="flex justify-center mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                <Pill className="h-4 w-4" />
                {medicineList.length} medicine{medicineList.length > 1 ? "s" : ""} added
              </span>
            </div>
          )}

          {/* Add New Medicine Section - Collapsible */}
          {showMedicineForm && (
            <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-2xl p-6 border-2 border-primary/20 mb-6 animate-in slide-in-from-top-3 duration-300 shadow-inner">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary">Medicine Details</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                  Fill all required fields *
                </span>
              </div>

              {/* Medicine Fields Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Medicine <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="medicine"
                    value={medicineFields.medicine}
                    onChange={handleMedicineFieldChange}
                    placeholder="Enter medicine"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Batch <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={medicineFields.batch}
                    onChange={handleMedicineFieldChange}
                    placeholder="Batch"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Batch Expiry <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    name="batchExpiry"
                    value={medicineFields.batchExpiry}
                    onChange={handleMedicineFieldChange}
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Units/Strip
                  </label>
                  <input
                    type="number"
                    name="unitsPerStrip"
                    value={medicineFields.unitsPerStrip}
                    onChange={handleMedicineFieldChange}
                    placeholder="Units"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    No. of Strips
                  </label>
                  <input
                    type="number"
                    name="noOfStrips"
                    value={medicineFields.noOfStrips}
                    onChange={handleMedicineFieldChange}
                    placeholder="Strips"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Free Strips
                  </label>
                  <input
                    type="number"
                    name="freeStrips"
                    value={medicineFields.freeStrips}
                    onChange={handleMedicineFieldChange}
                    placeholder="Free"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    GST Total %
                  </label>
                  <input
                    type="number"
                    name="gstTotal"
                    value={medicineFields.gstTotal}
                    onChange={handleMedicineFieldChange}
                    placeholder="GST %"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    MRP/Strip
                  </label>
                  <input
                    type="number"
                    name="mrpPerStrip"
                    value={medicineFields.mrpPerStrip}
                    onChange={handleMedicineFieldChange}
                    placeholder="MRP"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={medicineFields.discount}
                    onChange={handleMedicineFieldChange}
                    placeholder="Disc %"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    HSN Code
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={medicineFields.hsnCode}
                    onChange={handleMedicineFieldChange}
                    placeholder="HSN"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Rack No
                  </label>
                  <input
                    type="text"
                    name="rackNo"
                    value={medicineFields.rackNo}
                    onChange={handleMedicineFieldChange}
                    placeholder="Rack"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Box No
                  </label>
                  <input
                    type="text"
                    name="boxNo"
                    value={medicineFields.boxNo}
                    onChange={handleMedicineFieldChange}
                    placeholder="Box"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground/85 mb-1">
                    Net Price
                  </label>
                  <input
                    type="number"
                    name="netPrice"
                    value={medicineFields.netPrice}
                    onChange={handleMedicineFieldChange}
                    placeholder="Price"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-border/50">
                <button
                  onClick={handleAddMedicine}
                  className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm shadow-md"
                >
                  <Plus className="h-4 w-4" /> Add Medicine
                </button>
                <button
                  onClick={handleClearFields}
                  className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm shadow-md"
                >
                  <X className="h-4 w-4" /> Clear Fields
                </button>
                <button
                  onClick={() => setShowMedicineForm(false)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm shadow-md"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          )}

          {/* Medicine List Table */}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Medicine
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Batch</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Expiry
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">GST %</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Units/Strip
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Total Units
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    MRP/Strip
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Discount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    Action
                  </th>
=======
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
                {['Invoice ID', 'Patient', 'MRN', 'Amount', 'GST', 'Status', 'Date'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground"
                  >
                    {h}
                  </th>
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
                  <td className="px-4 py-3">
                    <StatusChip tone={tone[inv.status]}>{inv.status}</StatusChip>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inv.date).toDateString()}
                  </td>
>>>>>>> a821a0c (second update)
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {medicineList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <PackageOpen className="h-12 w-12 text-muted-foreground/30" />
                        <p>No medicines added yet</p>
                        <p className="text-xs">
                          Click the{" "}
                          <span className="font-semibold text-primary">"Add New Medicine"</span>{" "}
                          button above to get started
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  medicineList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      {editingMedicineId === item.id ? (
                        // Edit Mode
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="medicine"
                              value={editFormData.medicine || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              name="batch"
                              value={editFormData.batch || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="date"
                              name="batchExpiry"
                              value={editFormData.batchExpiry || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              name="gstTotal"
                              value={editFormData.gstTotal || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              name="unitsPerStrip"
                              value={editFormData.unitsPerStrip || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              name="totalUnits"
                              value={editFormData.totalUnits || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              name="mrpPerStrip"
                              value={editFormData.mrpPerStrip || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              name="discount"
                              value={editFormData.discount || ""}
                              onChange={handleEditFormChange}
                              className="w-full px-2 py-1 bg-background text-foreground border border-warning rounded focus:ring-2 focus:ring-primary text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={handleSaveEditMedicine}
                                className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs hover:bg-primary/90"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditMedicine}
                                className="px-3 py-1 bg-muted text-muted-foreground rounded text-xs hover:bg-muted/80"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View Mode
                        <>
                          <td className="px-4 py-3 font-medium">{item.medicine}</td>
                          <td className="px-4 py-3">{item.batch}</td>
                          <td className="px-4 py-3">{item.batchExpiry}</td>
                          <td className="px-4 py-3">{item.gstTotal || 0}%</td>
                          <td className="px-4 py-3">{item.unitsPerStrip || 0}</td>
                          <td className="px-4 py-3">{item.totalUnits || 0}</td>
                          <td className="px-4 py-3">₹{item.mrpPerStrip || 0}</td>
                          <td className="px-4 py-3">{item.discount || 0}%</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMedicine(item.id)}
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedicine(item.id)}
                                className="text-destructive hover:text-destructive/80 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            <button
              onClick={handleSaveInvoice}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm"
            >
              <Save className="h-4 w-4" /> Save Invoice
            </button>
            <button
              onClick={handlePrintInvoice}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm hover:bg-primary/90"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 text-sm hover:bg-primary/90"
            >
              <Download className="h-4 w-4" /> Download
            </button>
          </div>
        </div>
      </div>

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 rounded-t-2xl z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Invoice Details</h2>
                  <p className="text-primary-foreground/80 text-sm">{viewInvoice.invoiceNumber}</p>
                </div>
                <button
                  onClick={handleCloseViewInvoice}
                  className="hover:bg-primary-foreground/10 rounded-full p-2 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{viewInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stockist</p>
                  <p className="font-semibold">{viewInvoice.stockist}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{viewInvoice.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusChip tone={tone[viewInvoice.status]}>{viewInvoice.status}</StatusChip>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        Medicine
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        Batch
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        Expiry
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        MRP
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                        Net Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {viewInvoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{item.medicine}</td>
                        <td className="px-4 py-3">{item.batch}</td>
                        <td className="px-4 py-3">{item.batchExpiry}</td>
                        <td className="px-4 py-3">{item.totalUnits || 0}</td>
                        <td className="px-4 py-3">₹{item.mrpPerStrip || 0}</td>
                        <td className="px-4 py-3">₹{item.netPrice || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-lg">₹{viewInvoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-semibold">Total GST:</span>
                  <span className="font-bold text-lg">₹{viewInvoice.totalGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <span className="font-bold text-lg">Grand Total:</span>
                  <span className="font-bold text-xl text-primary">
                    ₹{viewInvoice.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PharmacyInvoices;
