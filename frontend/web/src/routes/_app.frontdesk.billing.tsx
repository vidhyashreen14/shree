import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBillingStore, type BillLineItem } from "@/lib/store/billing";
import { usePatients } from "@/lib/store/patients";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { doctors } from "@/lib/mock/data";
import {
  Search, Printer, Send, MessageSquare, Mail, Phone,
  IndianRupee, CheckSquare, Square, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/frontdesk/billing")({
  head: () => ({
    meta: [
      { title: "Optional Billing · MediCore Front Desk" },
      { name: "description", content: "Create and print additional bills for laboratory, radiology, procedures and more." },
    ],
  }),
  component: FrontDeskBilling,
});

// ─── Print Receipt Modal ──────────────────────────────────────────────────────

interface ReceiptData {
  billNo: string;
  date: string;
  patientName: string;
  uhid: string;
  age: string;
  gender: string;
  doctor: string;
  department: string;
  billType: string;
  items: { name: string; amount: number }[];
  total: number;
  paymentMethod: string;
  patientPhone: string;
  patientEmail: string;
}

function PrintReceipt({ data, onClose }: { data: ReceiptData; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const { logoUrl, name, phone, email, address } = useHospitalSettings();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) { toast.error("Pop-up blocked. Allow pop-ups and try again."); return; }
    win.document.write(`
      <html>
        <head>
          <title>Bill — ${data.billNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
            .bill { max-width: 700px; margin: 0 auto; padding: 32px; }
            .header { display: flex; flex-direction: column; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px; text-align: center; }
            .logo { font-size: 22px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; color: #555; margin-top: 2px; }
            .addr { font-size: 11px; color: #555; margin-top: 6px; }
            .bill-meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .meta-block { }
            .meta-block p { font-size: 12px; margin-bottom: 3px; color: #444; }
            .meta-block strong { color: #111; }
            .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 16px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; padding: 8px 10px; text-align: left; }
            td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .amount { text-align: right; }
            .total-row td { font-weight: 800; font-size: 14px; border-top: 2px solid #0d9488; padding-top: 10px; }
            .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ddd; padding-top: 12px; }
            .badge { display: inline-block; background: #f0fdfa; color: #0d9488; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="bill">${content}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleWhatsApp = () => {
    const phoneNum = data.patientPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `*${name} — ${data.billType}*\nBill No: ${data.billNo}\nPatient: ${data.patientName} (${data.uhid})\nDate: ${data.date}\nTotal Paid: ₹${data.total}\nPayment: ${data.paymentMethod}\n\nThank you for choosing ${name}!`
    );
    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${name} Bill — ${data.billNo} — ${data.patientName}`);
    const body = encodeURIComponent(
      `Dear ${data.patientName},\n\nYour ${data.billType} bill (No: ${data.billNo}) dated ${data.date} is ₹${data.total} (paid via ${data.paymentMethod}).\n\nFor queries, contact us at ${phone}.\n\n${name}`
    );
    window.location.href = `mailto:${data.patientEmail}?subject=${subject}&body=${body}`;
  };

  const handleSMS = () => {
    toast.info("SMS gateway integration required for live SMS dispatch.", { description: "In production, this connects to your SMS provider API." });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl flex flex-col max-h-[90vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-display font-bold">Bill Preview — {data.billNo}</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleWhatsApp} className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button size="sm" variant="outline" onClick={handleSMS} className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <Phone className="mr-1.5 h-3.5 w-3.5" /> SMS
            </Button>
            <Button size="sm" variant="outline" onClick={handleEmail} className="text-violet-600 border-violet-200 hover:bg-violet-50">
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bill content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef}>
            {/* Header */}
            <div className="header" style={{ display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "2px solid #0d9488", paddingBottom: 16, marginBottom: 20 }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ maxHeight: 50, maxWidth: 150, marginBottom: 8, objectFit: "contain" }} />
              ) : (
                <div className="logo" style={{ fontSize: 22, fontWeight: 800, color: "#0d9488", letterSpacing: "-0.5px" }}>🏥 {name}</div>
              )}
              {logoUrl && <div style={{ fontSize: 14, fontWeight: 800, color: "#0d9488", marginTop: 2 }}>{name}</div>}
              <div className="subtitle">Multispecialty Hospital · Compassionate Care</div>
              <div className="addr" style={{ textAlign: "center", fontSize: 11, color: "#555", marginTop: 6 }}>
                {address}<br />
                📞 {phone} · ✉ {email}
              </div>
            </div>

            {/* Bill type badge + number */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="badge">{data.billType}</span>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div><strong>Bill No:</strong> {data.billNo}</div>
                <div><strong>Date:</strong> {data.date}</div>
              </div>
            </div>

            {/* Patient info */}
            <div className="section-title">Patient Details</div>
            <div className="bill-meta">
              <div className="meta-block">
                <p><strong>Patient Name:</strong> {data.patientName}</p>
                <p><strong>Patient ID (UHID):</strong> {data.uhid}</p>
                <p><strong>Age / Gender:</strong> {data.age} / {data.gender}</p>
              </div>
              <div className="meta-block" style={{ textAlign: "right" }}>
                <p><strong>Assigned Consultant:</strong> {data.doctor}</p>
                <p><strong>Department:</strong> {data.department}</p>
              </div>
            </div>

            {/* Fee table */}
            <div className="section-title">Bill Details</div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th className="amount">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.name}</td>
                    <td className="amount">₹{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={2}>Total Paid</td>
                  <td className="amount">₹{data.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Payment method */}
            <div style={{ marginTop: 16, padding: "10px 0", borderTop: "1px solid #e2e8f0", fontSize: 12 }}>
              <strong>Payment Method:</strong> {data.paymentMethod.toUpperCase()}
            </div>

            {/* Footer */}
            <div className="footer">
              This is a computer generated bill and does not require a signature.<br />
              Thank you for choosing {name}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bill Item Row ────────────────────────────────────────────────────────────

function BillItemRow({ item, selected, qty, onToggle, onQtyChange }: {
  item: BillLineItem;
  selected: boolean;
  qty: number;
  onToggle: () => void;
  onQtyChange: (q: number) => void;
}) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer", selected ? "border-primary bg-primary/5" : "border-border hover:bg-accent/30")}
      onClick={onToggle}>
      {selected ? <CheckSquare className="h-4 w-4 text-primary shrink-0" /> : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
      <span className="flex-1 text-sm">{item.name}</span>
      {selected && (
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Label className="text-xs text-muted-foreground">Qty</Label>
          <Input
            type="number" min={1} value={qty}
            onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value)))}
            className="w-14 h-7 text-xs"
          />
        </div>
      )}
      <span className={cn("text-sm font-semibold shrink-0", selected ? "text-primary" : "text-muted-foreground")}>
        ₹{(item.amount * (selected ? qty : 1)).toLocaleString()}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface Selection { [itemId: string]: { selected: boolean; qty: number } }

function FrontDeskBilling() {
  const { categories, registrationFee, consultationFee } = useBillingStore();
  const { searchPatients } = usePatients();
  const queue = useNurseQueue((s) => s.queue);

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<ReturnType<typeof searchPatients>[0] | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selections, setSelections] = useState<Selection>({});
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  const searchResults = patientSearch.length >= 2 ? searchPatients(patientSearch) : [];

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const selectedItems = selectedCategory
    ? selectedCategory.items.filter((i) => i.enabled && selections[i.id]?.selected)
    : [];

  const total = selectedItems.reduce((sum, item) => sum + item.amount * (selections[item.id]?.qty ?? 1), 0);

  const toggleItem = (itemId: string) => {
    setSelections((prev) => ({
      ...prev,
      [itemId]: { selected: !prev[itemId]?.selected, qty: prev[itemId]?.qty ?? 1 },
    }));
  };

  const setQty = (itemId: string, qty: number) => {
    setSelections((prev) => ({ ...prev, [itemId]: { ...prev[itemId], selected: true, qty } }));
  };

  const handleGenerateBill = () => {
    if (!selectedPatient) { toast.error("Select a patient first"); return; }
    if (!selectedCategoryId) { toast.error("Select a bill type"); return; }
    if (selectedItems.length === 0) { toast.error("Select at least one item"); return; }

    const doctor = doctors.find((d) => d.id === selectedDoctorId);
    const category = categories.find((c) => c.id === selectedCategoryId);

    setReceipt({
      billNo: `BILL-${Date.now().toString().slice(-8)}`,
      date: format(new Date(), "dd MMM yyyy, hh:mm a"),
      patientName: selectedPatient.name,
      uhid: selectedPatient.mrn,
      age: String(selectedPatient.age),
      gender: selectedPatient.gender,
      doctor: doctor?.name ?? "—",
      department: doctor?.department ?? "—",
      billType: category?.label ?? "Bill",
      items: selectedItems.map((item) => ({
        name: item.name,
        amount: item.amount * (selections[item.id]?.qty ?? 1),
      })),
      total,
      paymentMethod,
      patientPhone: selectedPatient.phone,
      patientEmail: selectedPatient.email,
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Optional Billing"
        description="Generate Laboratory, Radiology, Procedure and other bills for patients."
      />

      {receipt && (
        <PrintReceipt
          data={receipt}
          onClose={() => { setReceipt(null); toast.success("Bill closed. Ready for next patient."); }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Patient + Bill Type */}
        <div className="space-y-5 lg:col-span-1">
          {/* Patient Search */}
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold mb-3">Patient</h3>
            {selectedPatient ? (
              <div className="flex items-center gap-3 rounded-xl border bg-primary/5 border-primary/30 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {selectedPatient.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{selectedPatient.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedPatient.mrn} · {selectedPatient.age}y</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedPatient(null); setPatientSearch(""); }}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name / UHID / mobile…"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="rounded-xl border bg-card divide-y max-h-52 overflow-y-auto">
                    {searchResults.slice(0, 6).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPatient(p); setPatientSearch(""); }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-accent/40 text-left text-sm"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.mrn} · {p.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {patientSearch.length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs text-center text-muted-foreground py-3">No results for "{patientSearch}"</p>
                )}
              </div>
            )}
          </div>

          {/* Doctor */}
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold mb-3">Assigned Doctor</h3>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
              <SelectTrigger><SelectValue placeholder="Select doctor…" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name} — {d.department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bill Type */}
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold mb-3">Bill Type</h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setSelectedCategoryId(cat.id); setSelections({}); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-all",
                    selectedCategoryId === cat.id
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-border hover:border-primary/40 hover:bg-accent/30"
                  )}
                >
                  <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold mb-3">Payment Method</h3>
            <div className="grid grid-cols-2 gap-2">
              {["Cash", "UPI", "Card", "Net Banking"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    paymentMethod === m
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-accent/30 text-muted-foreground"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Item Selection + Summary */}
        <div className="space-y-5 lg:col-span-2">
          {!selectedCategoryId ? (
            <div className="surface-elevated flex flex-col items-center justify-center py-20 text-center">
              <IndianRupee className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-semibold">Select a bill type</p>
              <p className="text-sm text-muted-foreground mt-1">Choose from the list on the left to see available items</p>
            </div>
          ) : (
            <div className="surface-elevated p-5">
              <h3 className="font-display font-semibold mb-4">{selectedCategory?.label} — Select Items</h3>
              <div className="space-y-2">
                {selectedCategory?.items.filter((i) => i.enabled).map((item) => (
                  <BillItemRow
                    key={item.id}
                    item={item}
                    selected={!!selections[item.id]?.selected}
                    qty={selections[item.id]?.qty ?? 1}
                    onToggle={() => toggleItem(item.id)}
                    onQtyChange={(q) => setQty(item.id, q)}
                  />
                ))}
                {selectedCategory?.items.filter((i) => i.enabled).length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No active items in this category.</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedItems.length > 0 && (
            <div className="surface-elevated p-5">
              <h3 className="font-display font-semibold mb-4">Bill Summary</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.name} {(selections[item.id]?.qty ?? 1) > 1 && `× ${selections[item.id]?.qty}`}</span>
                    <span className="font-medium">₹{(item.amount * (selections[item.id]?.qty ?? 1)).toLocaleString()}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-dashed" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">Payment: {paymentMethod}</p>
              </div>

              <Button
                className="mt-5 w-full h-12 text-base font-semibold"
                disabled={!selectedPatient}
                onClick={handleGenerateBill}
                id="btn-generate-bill"
              >
                <Printer className="mr-2 h-5 w-5" />
                Generate &amp; Print Bill
              </Button>
              {!selectedPatient && (
                <p className="mt-2 text-center text-xs text-muted-foreground">Select a patient to generate the bill</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
