<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { medicines } from "@/lib/mock/data";
=======
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { medicines } from '@/lib/mock/data';
>>>>>>> a821a0c (second update)
import {
  Truck,
  Plus,
  X,
  Save,
  Printer,
  Download,
  Trash2,
<<<<<<< HEAD
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Calendar,
=======
>>>>>>> a821a0c (second update)
  History,
  ShoppingCart,
  Pill,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const Route = createFileRoute('/_app/pharmacy/orders')({
  component: PharmacyOrders,
});

interface AddedItem {
  id: string;
  medicineName: string;
  unitsPerStrip: number;
  noOfStrips: number;
  totalUnits: number;
}

interface PurchaseOrderHistory {
  id: string;
  supplier: string;
  items: number;
  total: number;
  status: 'draft' | 'placed' | 'shipped' | 'received';
  date: string;
}

const initialOrders: PurchaseOrderHistory[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `PO-${5000 + i}`,
<<<<<<< HEAD
  supplier: ["MedPlus Distributors", "Apollo Wholesale", "PharmEasy Bulk", "Wellness Stockists"][
=======
  supplier: ['MedPlus Distributors', 'Apollo Wholesale', 'PharmEasy Bulk', 'Wellness Stockists'][
>>>>>>> a821a0c (second update)
    i % 4
  ]!,
  items: 8 + (i % 14),
  total: 12000 + i * 4500,
  status: (['draft', 'placed', 'shipped', 'received'] as const)[i % 4]!,
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 36).toISOString(),
}));

const tone = { draft: 'neutral', placed: 'info', shipped: 'warning', received: 'success' } as const;

function PharmacyOrders() {
  const [isCreating, setIsCreating] = useState(true);
  const [orderHistory, setOrderHistory] = useState<PurchaseOrderHistory[]>(initialOrders);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const printContentRef = useRef<HTMLDivElement>(null);

  // Form states
<<<<<<< HEAD
  const [stockist, setStockist] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [selectedMed, setSelectedMed] = useState("");
  const [unitsPerStrip, setUnitsPerStrip] = useState<number | "">("");
  const [noOfStrips, setNoOfStrips] = useState<number | "">("");
=======
  const [stockist, setStockist] = useState('');
  const [orderDate, setOrderDate] = useState('');

  // Current item row states
  const [selectedMed, setSelectedMed] = useState('');
  const [unitsPerStrip, setUnitsPerStrip] = useState<number | ''>('');
  const [noOfStrips, setNoOfStrips] = useState<number | ''>('');

  // Added items table state
>>>>>>> a821a0c (second update)
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);

  const handleAddItem = () => {
    if (!stockist) {
      toast.error("Please select a stockist.");
      return;
    }
    if (!orderDate) {
      toast.error("Please select an order date.");
      return;
    }
    if (!selectedMed) {
      toast.error('Please select a medicine.');
      return;
    }
    if (!unitsPerStrip || unitsPerStrip <= 0) {
      toast.error('Please enter a valid Units/Strip.');
      return;
    }
    if (!noOfStrips || noOfStrips <= 0) {
      toast.error('Please enter a valid number of strips.');
      return;
    }

    const medInfo = medicines.find((m) => m.id === selectedMed);
    if (!medInfo) return;

    const existingIndex = addedItems.findIndex((item) => item.id === selectedMed);
    if (existingIndex > -1) {
      const updated = [...addedItems];
      const item = updated[existingIndex]!;
      item.noOfStrips = Number(item.noOfStrips) + Number(noOfStrips);
      item.totalUnits = item.unitsPerStrip * item.noOfStrips;
      setAddedItems(updated);
    } else {
      setAddedItems([
        ...addedItems,
        {
          id: selectedMed,
          medicineName: medInfo.name,
          unitsPerStrip: Number(unitsPerStrip),
          noOfStrips: Number(noOfStrips),
          totalUnits: Number(unitsPerStrip) * Number(noOfStrips),
        },
      ]);
    }

<<<<<<< HEAD
    setSelectedMed("");
    setUnitsPerStrip("");
    setNoOfStrips("");
    toast.success("Medicine added to order.");
=======
    // Reset item inputs
    setSelectedMed('');
    setUnitsPerStrip('');
    setNoOfStrips('');
    toast.success('Medicine added to order.');
>>>>>>> a821a0c (second update)
  };

  const handleRemoveItem = (id: string) => {
    setAddedItems(addedItems.filter((item) => item.id !== id));
    toast.info('Item removed.');
  };

  const handleClearItemRow = () => {
    setSelectedMed('');
    setUnitsPerStrip('');
    setNoOfStrips('');
  };

  const handleSaveOrder = () => {
    if (!stockist) {
      toast.error('Please select a stockist.');
      return;
    }
    if (!orderDate) {
      toast.error('Please select an order date.');
      return;
    }
    if (addedItems.length === 0) {
      toast.error('Please add at least one medicine to the purchase order.');
      return;
    }

    const newOrder: PurchaseOrderHistory = {
      id: `PO-${5000 + orderHistory.length}`,
      supplier: stockist,
      items: addedItems.reduce((acc, curr) => acc + curr.noOfStrips, 0),
      total: addedItems.reduce((acc, curr) => {
        const price = medicines.find((m) => m.id === curr.id)?.pricePerUnit || 10;
        return acc + curr.totalUnits * price;
      }, 0),
      status: 'placed',
      date: new Date(orderDate).toISOString(),
    };

    setOrderHistory([newOrder, ...orderHistory]);
    toast.success(`Purchase Order ${newOrder.id} saved successfully!`);

<<<<<<< HEAD
    setStockist("");
    setOrderDate("");
=======
    // Reset full form
    setStockist('');
    setOrderDate('');
>>>>>>> a821a0c (second update)
    setAddedItems([]);
    setIsCreating(false);
  };

  const handlePrint = () => {
    if (addedItems.length === 0) {
      toast.error('No items in order to print.');
      return;
    }
<<<<<<< HEAD

    // Generate the print content
    const printWindow = window.open("", "_blank", "width=1200,height=800");
    if (!printWindow) {
      toast.error("Please allow popups to print.");
      return;
    }

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const formattedDate = new Date(orderDate).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const expectedDelivery = new Date(
      new Date(orderDate).setDate(new Date(orderDate).getDate() + 7)
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Calculate totals
    let subtotal = 0;
    const itemsWithPrices = addedItems.map((item) => {
      const medInfo = medicines.find((m) => m.id === item.id);
      const unitPrice = medInfo?.pricePerUnit || 10;
      const total = item.totalUnits * unitPrice;
      subtotal += total;
      return { ...item, unitPrice, total };
    });

    const discount = 0.05; // 5% bulk discount
    const discountAmount = subtotal * discount;
    const taxRate = 0.05; // 5% GST
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const grandTotal = subtotal - discountAmount + taxAmount;

    // Build the HTML content - Removed all footer, signature, and extra sections
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Purchase Order - ${poNumber}</title>
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
            <div class="hospital-header">
              <div class="logo-area">
                <div class="logo-placeholder">🏥</div>
                <div>
                  <div class="hospital-name">SRI MANJUNATHA HOSPITAL</div>
                  <div style="font-size:0.8rem; color:#2c3e50;">C.K.PURA, KELAGOTE, BESIDE SBI BANK, CHITRADURGA</div>
                </div>
              </div>
              <div class="hospital-detail">
                <p>PH NO: 9108453470</p>
              </div>
            </div>

            <!-- PO META -->
            <div class="invoice-meta">
              <div class="meta-block">
                <span class="label">Purchase Order #</span>
                <span class="value">${poNumber}</span>
              </div>
              <div class="meta-block">
                <span class="label">Order Date</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="meta-block">
                <span class="label">Expected Delivery</span>
                <span class="value">${expectedDelivery}</span>
              </div>
            </div>

            <!-- SUPPLIER INFO -->
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Stockist / Supplier</div>
                <div class="value">${stockist}</div>
              </div>
              <div class="info-item">
                <div class="label">Order Type</div>
                <div class="value">Pharmacy Restock</div>
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
                  <th style="width:40%;">Medicine / Item</th>
                  <th style="width:12%;" class="text-center">Units/Strip</th>
                  <th style="width:12%;" class="text-center">No. of Strips</th>
                  <th style="width:18%;" class="text-right">Unit Price (₹)</th>
                  <th style="width:18%;" class="text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsWithPrices
                  .map(
                    (item) => `
                  <tr>
                    <td><span class="fw-600">${item.medicineName}</span> – strip</td>
                    <td class="text-center">${item.unitsPerStrip}</td>
                    <td class="text-center">${item.noOfStrips}</td>
                    <td class="text-right">₹${item.unitPrice.toFixed(2)}</td>
                    <td class="text-right">₹${item.total.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right fw-600">Subtotal</td>
                  <td class="text-right">₹${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-right">Discount (5% bulk)</td>
                  <td class="text-right">- ₹${discountAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-right">Tax (GST 5%)</td>
                  <td class="text-right">₹${taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" class="text-right grand-total" style="font-size:1.2rem;">Grand Total</td>
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

    toast.success("Purchase Order sent to printer.");
=======
    toast.success('Sending Purchase Order to printer...');
    window.print();
>>>>>>> a821a0c (second update)
  };

  const handleDownload = () => {
    if (addedItems.length === 0) {
      toast.error('No items in order to download.');
      return;
    }
    toast.success('Downloading Purchase Order PDF...');
  };

  const handleCancel = () => {
    setStockist('');
    setOrderDate('');
    setAddedItems([]);
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isCreating ? 'Create Purchase Order' : 'Purchase orders'}
        description={
          isCreating
            ? 'Generate and draft restock requests for pharmaceutical suppliers.'
            : 'Restock requests sent to stockists and suppliers.'
        }
        actions={
          isCreating ? (
            <Button onClick={() => setIsCreating(false)}>
              <History className="mr-2 h-4 w-4" /> View History
            </Button>
          ) : (
            <Button onClick={() => setIsCreating(true)}>
              <Truck className="mr-2 h-4 w-4" /> New PO
            </Button>
          )
        }
      />

      {isCreating ? (
        <div className="flex flex-col gap-6">
          {/* Single Card with all fields */}
          <div className="surface-elevated p-6 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">
                Create Purchase Order
              </h2>
            </div>

<<<<<<< HEAD
            {/* All fields in one grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
=======
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
>>>>>>> a821a0c (second update)
              <div>
                <Label htmlFor="stockist" className="flex items-center gap-1">
                  Stockist Name <span className="text-destructive">*</span>
                </Label>
                <Select value={stockist} onValueChange={setStockist}>
                  <SelectTrigger id="stockist" className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select Stockist" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MedPlus Distributors">MedPlus Distributors</SelectItem>
                    <SelectItem value="Apollo Wholesale">Apollo Wholesale</SelectItem>
                    <SelectItem value="PharmEasy Bulk">PharmEasy Bulk</SelectItem>
                    <SelectItem value="Wellness Stockists">Wellness Stockists</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="orderDate" className="flex items-center gap-1">
                  Order Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="bg-background"
                  />
                </div>
              </div>

<<<<<<< HEAD
=======
            <div className="flex justify-start">
              <Button
                type="button"
                onClick={() =>
                  toast.success('Feature to register custom stockist medicine is coming soon')
                }
                className="bg-success text-success-foreground hover:bg-success/90 rounded-full px-5"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add New Medicine
              </Button>
            </div>
          </div>

          {/* Mockup Card 2: Medicine selection row */}
          <div className="surface-elevated p-6 rounded-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
>>>>>>> a821a0c (second update)
              <div>
                <Label htmlFor="medicine" className="flex items-center gap-1">
                  Medicine <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedMed} onValueChange={setSelectedMed}>
                  <SelectTrigger id="medicine" className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select Medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} (Batch: {m.batch})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second row for Units/Strip and No. of Strips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitsPerStrip" className="flex items-center gap-1">
                  Units/Strip <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unitsPerStrip"
                  type="number"
                  placeholder="Enter units per strip"
                  value={unitsPerStrip}
                  onChange={(e) => setUnitsPerStrip(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1.5 bg-background"
                  min="1"
                />
              </div>

              <div>
                <Label htmlFor="noOfStrips" className="flex items-center gap-1">
                  No. Of Strips <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="noOfStrips"
                  type="number"
                  placeholder="Enter number of strips"
                  value={noOfStrips}
                  onChange={(e) => setNoOfStrips(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1.5 bg-background"
                  min="1"
                />
              </div>
            </div>

            {/* Action Buttons for Add/Clear */}
            <div className="flex gap-2 justify-start mt-2">
              <Button type="button" onClick={handleAddItem} className="px-5">
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
              <Button type="button" onClick={handleClearItemRow} className="px-5">
                <X className="mr-1 h-4 w-4" /> Clear
              </Button>
            </div>
          </div>

          {/* Added Items Table */}
          <div className="surface-elevated overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">
                      Medicine
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">
                      Units/Strip
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">
                      No. Of Strips
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">
                      Total Units
                    </th>
                    <th className="px-4 py-3.5 text-center font-semibold uppercase text-xs w-28">
<<<<<<< HEAD
                      Action
=======
                      Edit/Delete
>>>>>>> a821a0c (second update)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {addedItems.length > 0 ? (
                    addedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium flex items-center gap-2">
                          <Pill className="h-3.5 w-3.5 text-primary/70" />
                          {item.medicineName}
                        </td>
                        <td className="px-4 py-3">{item.unitsPerStrip}</td>
                        <td className="px-4 py-3">{item.noOfStrips}</td>
                        <td className="px-4 py-3 font-semibold text-primary">{item.totalUnits}</td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-muted-foreground italic bg-muted/10"
                      >
                        No items added yet. Add medicines using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons — consistent with theme */}
          <div className="flex flex-wrap gap-3 justify-start mt-2">
            <Button type="button" onClick={handleSaveOrder} className="px-6 font-semibold">
              <Save className="mr-2 h-4 w-4" /> Save Order
            </Button>
            <Button type="button" onClick={handlePrint} className="px-6 font-semibold">
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button type="button" onClick={handleDownload} className="px-6 font-semibold">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button type="button" onClick={handleCancel} className="px-6 font-semibold">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      ) : (
        /* History list view */
        <div className="surface-elevated overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/40">
                <tr>
<<<<<<< HEAD
                  {["Order ID", "Supplier", "Items Count", "Total Value", "Status", "Date"].map(
=======
                  {['Order ID', 'Supplier', 'Items Count', 'Total Value', 'Status', 'Date'].map(
>>>>>>> a821a0c (second update)
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-muted-foreground"
                      >
                        {h}
                      </th>
<<<<<<< HEAD
                    )
=======
                    ),
>>>>>>> a821a0c (second update)
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orderHistory.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3 font-medium">{o.supplier}</td>
                    <td className="px-4 py-3">{o.items} strips</td>
                    <td className="px-4 py-3">₹{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <StatusChip tone={tone[o.status]}>{o.status}</StatusChip>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.date).toDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
