import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { medicines } from "@/lib/mock/data";
import {
  Truck,
  Plus,
  X,
  Save,
  Printer,
  Download,
  Trash2,
  Calendar,
  History,
  ShoppingCart,
  Pill,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/pharmacy/orders")({
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
  status: "draft" | "placed" | "shipped" | "received";
  date: string;
}

const initialOrders: PurchaseOrderHistory[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `PO-${5000 + i}`,
  supplier: ["MedPlus Distributors", "Apollo Wholesale", "PharmEasy Bulk", "Wellness Stockists"][i % 4]!,
  items: 8 + (i % 14),
  total: 12000 + i * 4500,
  status: (["draft", "placed", "shipped", "received"] as const)[i % 4]!,
  date: new Date(Date.now() - i * 1000 * 60 * 60 * 36).toISOString(),
}));

const tone = { draft: "neutral", placed: "info", shipped: "warning", received: "success" } as const;

function PharmacyOrders() {
  const [isCreating, setIsCreating] = useState(true);
  const [orderHistory, setOrderHistory] = useState<PurchaseOrderHistory[]>(initialOrders);

  // Form states
  const [stockist, setStockist] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [selectedMed, setSelectedMed] = useState("");
  const [unitsPerStrip, setUnitsPerStrip] = useState<number | "">("");
  const [noOfStrips, setNoOfStrips] = useState<number | "">("");
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
      toast.error("Please select a medicine.");
      return;
    }
    if (!unitsPerStrip || unitsPerStrip <= 0) {
      toast.error("Please enter a valid Units/Strip.");
      return;
    }
    if (!noOfStrips || noOfStrips <= 0) {
      toast.error("Please enter a valid number of strips.");
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

    setSelectedMed("");
    setUnitsPerStrip("");
    setNoOfStrips("");
    toast.success("Medicine added to order.");
  };

  const handleRemoveItem = (id: string) => {
    setAddedItems(addedItems.filter((item) => item.id !== id));
    toast.info("Item removed.");
  };

  const handleClearItemRow = () => {
    setSelectedMed("");
    setUnitsPerStrip("");
    setNoOfStrips("");
  };

  const handleSaveOrder = () => {
    if (!stockist) {
      toast.error("Please select a stockist.");
      return;
    }
    if (!orderDate) {
      toast.error("Please select an order date.");
      return;
    }
    if (addedItems.length === 0) {
      toast.error("Please add at least one medicine to the purchase order.");
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
      status: "placed",
      date: new Date(orderDate).toISOString(),
    };

    setOrderHistory([newOrder, ...orderHistory]);
    toast.success(`Purchase Order ${newOrder.id} saved successfully!`);

    setStockist("");
    setOrderDate("");
    setAddedItems([]);
    setIsCreating(false);
  };

  const handlePrint = () => {
    if (addedItems.length === 0) {
      toast.error("No items in order to print.");
      return;
    }
    toast.success("Sending Purchase Order to printer...");
    window.print();
  };

  const handleDownload = () => {
    if (addedItems.length === 0) {
      toast.error("No items in order to download.");
      return;
    }
    toast.success("Downloading Purchase Order PDF...");
  };

  const handleCancel = () => {
    setStockist("");
    setOrderDate("");
    setAddedItems([]);
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isCreating ? "Create Purchase Order" : "Purchase orders"}
        description={
          isCreating
            ? "Generate and draft restock requests for pharmaceutical suppliers."
            : "Restock requests sent to stockists and suppliers."
        }
        actions={
          isCreating ? (
            <Button variant="outline" onClick={() => setIsCreating(false)}>
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
              <h2 className="font-display text-lg font-bold text-foreground">Create Purchase Order</h2>
            </div>

            {/* All fields in one grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onChange={(e) => setUnitsPerStrip(e.target.value ? Number(e.target.value) : "")}
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
                  onChange={(e) => setNoOfStrips(e.target.value ? Number(e.target.value) : "")}
                  className="mt-1.5 bg-background"
                  min="1"
                />
              </div>
            </div>

            {/* Action Buttons for Add/Clear */}
            <div className="flex gap-2 justify-start mt-2">
              <Button
                type="button"
                onClick={handleAddItem}
                className="bg-success text-success-foreground hover:bg-success/90 px-5"
              >
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleClearItemRow}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-5"
              >
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
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">Medicine</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">Units/Strip</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">No. Of Strips</th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">Total Units</th>
                    <th className="px-4 py-3.5 text-center font-semibold uppercase text-xs w-28">Action</th>
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
                      <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground italic bg-muted/10">
                        No items added yet. Add medicines using the form above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-start mt-2">
            <Button
              type="button"
              onClick={handleSaveOrder}
              className="bg-success text-success-foreground hover:bg-success/90 px-6 font-semibold"
            >
              <Save className="mr-2 h-4 w-4" /> Save Order
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-info text-info-foreground hover:bg-info/90 px-6 font-semibold"
            >
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 font-semibold"
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 font-semibold"
            >
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
                  {["Order ID", "Supplier", "Items Count", "Total Value", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
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