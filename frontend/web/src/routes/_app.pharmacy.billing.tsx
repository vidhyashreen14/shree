import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { medicines } from "@/lib/mock/data";
import { useState, useEffect } from "react";
import { Plus, Trash2, Receipt, Calendar, RefreshCw, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/pharmacy/billing")({
  component: PharmacyBilling,
});

interface BillingItem {
  id: string;
  name: string;
  batch: string;
  price: number;
  qty: number;
  discountPercent: number; // Disc. %
  gst: number;
}

function PharmacyBilling() {
  const [billDate, setBillDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  });

  const [patientName, setPatientName] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referredDoctor, setReferredDoctor] = useState("");

  // Medicine select row states
  const [selectedMedId, setSelectedMedId] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number | "">("");
  const [lineTotal, setLineTotal] = useState<number>(0);

  // Added billing items list
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);

  // Right column financial inputs/calculations
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [reference, setReference] = useState("");
  const [paidAmount, setPaidAmount] = useState<number | "">("");

  // Update price and line total when medicine or quantity changes
  useEffect(() => {
    if (selectedMedId) {
      const med = medicines.find((m) => m.id === selectedMedId);
      if (med) {
        setPrice(med.pricePerUnit);
        if (qty && qty > 0) {
          setLineTotal(med.pricePerUnit * Number(qty));
        } else {
          setLineTotal(0);
        }
      }
    } else {
      setPrice(0);
      setLineTotal(0);
    }
  }, [selectedMedId, qty]);

  // Calculate totals
  const rawSubtotal = billingItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  
  // Calculate total discount from table
  const itemDiscounts = billingItems.reduce((acc, curr) => {
    const lineVal = curr.price * curr.qty;
    return acc + (lineVal * curr.discountPercent) / 100;
  }, 0);

  // Apply general discount from right panel
  const generalDiscount = ((rawSubtotal - itemDiscounts) * discountPercent) / 100;
  const totalDiscount = itemDiscounts + generalDiscount;

  // Calculate GST based on items in table (net of discount)
  const gstValue = billingItems.reduce((acc, curr) => {
    const lineVal = curr.price * curr.qty;
    const discountedLineVal = lineVal - (lineVal * curr.discountPercent) / 100;
    return acc + (discountedLineVal * curr.gst) / 100;
  }, 0);

  const netValue = rawSubtotal - totalDiscount + gstValue;
  const roundOff = Math.round(netValue) - netValue;
  const billAmount = Math.round(netValue);

  // Add Item to Bill
  const handleAddItem = () => {
    if (!selectedMedId) {
      toast.error("Please select a medicine.");
      return;
    }
    if (!qty || Number(qty) <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (med.stock < Number(qty)) {
      toast.warning(`Low Stock: Only ${med.stock} units available.`);
    }

    const newItem: BillingItem = {
      id: med.id,
      name: med.name,
      batch: med.batch,
      price: med.pricePerUnit,
      qty: Number(qty),
      discountPercent: 0, // default line discount is 0%
      gst: med.gst,
    };

    setBillingItems([...billingItems, newItem]);
    
    // Reset selection inputs
    setSelectedMedId("");
    setQty("");
    toast.success(`${med.name} added to bill.`);
  };

  // Remove Item
  const handleRemoveItem = (id: string, index: number) => {
    setBillingItems(billingItems.filter((_, idx) => idx !== index));
    toast.info("Item removed from bill.");
  };

  // Edit quantity directly in table
  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...billingItems];
    const item = updated[index]!;
    item.qty = newQty;
    setBillingItems(updated);
  };

  // Edit line discount directly in table
  const handleUpdateItemDiscount = (index: number, newDisc: number) => {
    if (newDisc < 0 || newDisc > 100) return;
    const updated = [...billingItems];
    const item = updated[index]!;
    item.discountPercent = newDisc;
    setBillingItems(updated);
  };

  // Reset entire bill form
  const handleClearBill = () => {
    setPatientName("");
    setPhone("");
    setEmail("");
    setReferredDoctor("");
    setBillingItems([]);
    setSelectedMedId("");
    setQty("");
    setDiscountPercent(0);
    setPaidAmount("");
    setReference("");
    toast.success("Bill cleared.");
  };

  const handleSaveAndPrint = () => {
    if (!patientName) {
      toast.error("Please enter patient name.");
      return;
    }
    if (billingItems.length === 0) {
      toast.error("Please add at least one medicine to generate a bill.");
      return;
    }

    toast.success(`Invoice for ${patientName} generated successfully!`);
    
    // Trigger standard browser print
    setTimeout(() => {
      window.print();
      handleClearBill();
    }, 500);
  };

  const handleHoldBill = () => {
    if (billingItems.length === 0) {
      toast.error("No items in bill to hold.");
      return;
    }
    toast.info("Bill placed on hold.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Pharmacy Billing Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Pharmacy Billing</h1>
        </div>

        {/* Date and Action Controls (Clear, Retrieve) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Bill Date *</span>
            <div className="relative">
              <Input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="h-9 w-40 bg-background py-1 text-xs"
              />
            </div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleClearBill}
            className="h-9 border-input text-foreground text-xs px-4"
          >
            Clear Bill
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleHoldBill}
            className="h-9 border-input text-foreground text-xs px-4"
          >
            Hold/Ret. Bill
          </Button>
        </div>
      </div>

      {/* Main Billing Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Left Column: Form & Item Table */}
        <div className="flex flex-col gap-6">
          
          {/* Patient Details Card */}
          <div className="surface-elevated p-5 rounded-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
              
              <div className="md:col-span-2">
                <Label htmlFor="patName" className="text-xs font-semibold">
                  Patient Name *
                </Label>
                <Input
                  id="patName"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1 bg-background h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="genderSelect" className="text-xs font-semibold">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="genderSelect" className="mt-1 bg-background h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="patPhone" className="text-xs font-semibold">
                  Phone
                </Label>
                <Input
                  id="patPhone"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 bg-background h-10 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="patEmail" className="text-xs font-semibold">
                  Email
                </Label>
                <Input
                  id="patEmail"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-background h-10 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="refDoctor" className="text-xs font-semibold">
                  Referred Doctor
                </Label>
                <Input
                  id="refDoctor"
                  placeholder="Referred Doctor"
                  value={referredDoctor}
                  onChange={(e) => setReferredDoctor(e.target.value)}
                  className="mt-1 bg-background h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Medicine Entry Row Card */}
          <div className="surface-elevated p-5 rounded-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
              
              <div className="md:col-span-5">
                <Label htmlFor="medSelect" className="text-xs font-semibold">
                  Medicine Name
                </Label>
                <Select value={selectedMedId} onValueChange={setSelectedMedId}>
                  <SelectTrigger id="medSelect" className="mt-1 bg-background h-10 text-sm">
                    <SelectValue placeholder="Select Medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} (Batch: {m.batch} · Stock: {m.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medPrice" className="text-xs font-semibold">
                  Price
                </Label>
                <Input
                  id="medPrice"
                  type="number"
                  value={price || ""}
                  readOnly
                  placeholder="0"
                  className="mt-1 bg-muted h-10 text-sm font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medQty" className="text-xs font-semibold">
                  Qty
                </Label>
                <Input
                  id="medQty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value ? Number(e.target.value) : "")}
                  placeholder="0"
                  className="mt-1 bg-background h-10 text-sm"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medTotal" className="text-xs font-semibold">
                  Total
                </Label>
                <Input
                  id="medTotal"
                  type="number"
                  value={lineTotal || ""}
                  readOnly
                  placeholder="0"
                  className="mt-1 bg-muted h-10 text-sm font-semibold text-primary"
                />
              </div>

              <div className="md:col-span-1">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-10 font-bold"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Table of Medicines in Bill */}
          <div className="surface-elevated overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">Medicine Name</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-28">Batch</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">Price</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">Quantity</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">Total</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">Disc. %</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-28">Amount</th>
                    <th className="px-4 py-3.5 text-center font-semibold uppercase text-xs w-20">Edit/Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {billingItems.length > 0 ? (
                    billingItems.map((item, index) => {
                      const baseLineValue = item.price * item.qty;
                      const discountedLineValue = baseLineValue - (baseLineValue * item.discountPercent) / 100;
                      return (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.batch}</td>
                          <td className="px-4 py-3">₹{item.price}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateItemQty(index, Number(e.target.value))}
                              className="h-8 w-16 bg-background p-1 text-center"
                            />
                          </td>
                          <td className="px-4 py-3">₹{baseLineValue.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => handleUpdateItemDiscount(index, Number(e.target.value))}
                              className="h-8 w-16 bg-background p-1 text-center"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            ₹{discountedLineValue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id, index)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground italic bg-muted/10">
                        No medicines added yet. Select a medicine and click add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Card (Summary) */}
        <div className="surface-elevated p-6 rounded-2xl flex flex-col gap-5 border border-border shadow-xs">
          <h3 className="font-display font-bold text-slate-800 text-lg">Summary</h3>

          <div className="space-y-3 text-sm">
            {/* Subtotal */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-slate-800">₹{rawSubtotal.toFixed(2)}</span>
            </div>

            {/* GST */}
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium text-slate-800">₹{gstValue.toFixed(2)}</span>
            </div>

            {/* Separator */}
            <div className="border-t border-border my-2" />

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-slate-800">Total</span>
              <span className="text-primary text-xl font-extrabold">₹{netValue.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleSaveAndPrint}
            className="w-full bg-[#0d9488] hover:bg-[#0b7e73] text-white font-bold h-11 text-sm shadow-md mt-2 flex items-center justify-center gap-2 rounded-lg"
          >
            <Receipt className="h-4 w-4" /> Generate invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
