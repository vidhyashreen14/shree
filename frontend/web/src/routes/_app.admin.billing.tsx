import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useBillingStore, type BillCategory } from "@/lib/store/billing";
import {
  IndianRupee,
  Plus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Scan,
  Scissors,
  Pill,
  Syringe,
  Dumbbell,
  HeartPulse,
  Shield,
  Building2,
  BedDouble,
  Stethoscope,
  Monitor,
  ClipboardList,
  FileText,
  CreditCard,
  Receipt,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin/billing")({
  head: () => ({
    meta: [
      { title: "Billing Configuration · MediCore Admin" },
      { name: "description", content: "Configure billing amounts for all hospital bill types." },
    ],
  }),
  component: BillingConfiguration,
});

// ─── Icon map ─────────────────────────────────────────────────────────────────

const categoryIcons: Record<string, typeof IndianRupee> = {
  lab: FlaskConical,
  radiology: Scan,
  procedure: Scissors,
  treatment: Pill,
  vaccination: Syringe,
  physio: Dumbbell,
  dialysis: HeartPulse,
  checkup: Shield,
  admission: Building2,
  room: BedDouble,
  ot: Stethoscope,
  icu: Monitor,
  inpatient: ClipboardList,
  discharge: FileText,
  insurance: CreditCard,
  refund: Receipt,
  misc: Package,
};

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ category }: { category: BillCategory }) {
  const { updateItemAmount, toggleItem, addItem, removeItem } = useBillingStore();
  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const Icon = categoryIcons[category.id] ?? IndianRupee;

  const total = category.items.filter((i) => i.enabled).reduce((sum, i) => sum + i.amount, 0);

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error("Enter item name");
      return;
    }
    const amount = Number(newAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Enter valid amount");
      return;
    }
    addItem(category.id, {
      id: `${category.id}-${Date.now()}`,
      name: newName.trim(),
      amount,
      enabled: true,
    });
    setNewName("");
    setNewAmount("");
    toast.success("Item added");
  };

  return (
    <div className="surface-elevated overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 p-5 text-left hover:bg-accent/30 transition-colors"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{category.label}</p>
          <p className="text-xs text-muted-foreground">
            {category.items.filter((i) => i.enabled).length} active items · Default total ₹
            {total.toLocaleString()}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-5 pb-5 pt-4 space-y-3">
          {category.items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
                !item.enabled && "opacity-50"
              )}
            >
              <Switch
                checked={item.enabled}
                onCheckedChange={(v) => toggleItem(category.id, item.id, v)}
                className="shrink-0"
              />
              <span className="flex-1 text-sm truncate">{item.name}</span>
              <div className="relative shrink-0">
                <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  value={item.amount}
                  onChange={(e) => updateItemAmount(category.id, item.id, Number(e.target.value))}
                  className="w-28 pl-6 h-8 text-sm"
                  disabled={!item.enabled}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => removeItem(category.id, item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}

          {/* Add new item */}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
            <Input
              placeholder="New item name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 h-8 text-sm"
            />
            <div className="relative shrink-0">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-24 pl-6 h-8 text-sm"
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={handleAdd}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function BillingConfiguration() {
  const {
    registrationFee,
    consultationFee,
    setRegistrationFee,
    setConsultationFee,
    categories,
    resetToDefaults,
  } = useBillingStore();
  const [regFee, setRegFee] = useState(String(registrationFee));
  const [consFee, setConsFee] = useState(String(consultationFee));

  const saveFees = () => {
    const r = Number(regFee);
    const c = Number(consFee);
    if (isNaN(r) || isNaN(c) || r < 0 || c < 0) {
      toast.error("Enter valid amounts");
      return;
    }
    setRegistrationFee(r);
    setConsultationFee(c);
    toast.success("OPD fees saved", { description: `Registration ₹${r} · Consultation ₹${c}` });
  };

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Billing Configuration"
        description="Set the rates for OPD fees and all 18 bill types used across the hospital."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              resetToDefaults();
              setRegFee("100");
              setConsFee("500");
              toast.success("Reset to defaults");
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Defaults
          </Button>
        }
      />

      {/* OPD Base Fees */}
      <div className="surface-elevated p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10">
            <IndianRupee className="h-4 w-4 text-primary" />
          </span>
          <div>
            <h3 className="font-display font-semibold">OPD Base Fees</h3>
            <p className="text-xs text-muted-foreground">Charged during front desk registration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="admin-reg-fee">Registration Fee (₹)</Label>
            <p className="text-xs text-muted-foreground mb-1.5">One-time charge for new patients</p>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="admin-reg-fee"
                type="number"
                min={0}
                value={regFee}
                onChange={(e) => setRegFee(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="admin-cons-fee">Consultation Fee (₹)</Label>
            <p className="text-xs text-muted-foreground mb-1.5">Charged per visit</p>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="admin-cons-fee"
                type="number"
                min={0}
                value={consFee}
                onChange={(e) => setConsFee(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="sm:col-span-2 rounded-xl border bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Receipt Preview
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registration Fee</span>
                <span className="font-medium">₹{regFee || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-medium">₹{consFee || 0}</span>
              </div>
              <div className="border-t border-dashed my-2" />
              <div className="flex justify-between font-bold">
                <span>Total (new patient)</span>
                <span className="text-primary">
                  ₹{(Number(regFee) || 0) + (Number(consFee) || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Returning patient</span>
                <span>₹{Number(consFee) || 0}</span>
              </div>
            </div>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={saveFees} id="btn-save-opd-fees">
              Save OPD Fees
            </Button>
          </div>
        </div>
      </div>

      {/* Bill Categories */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold">Bill Type Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Expand a category to edit item rates. Toggle to enable/disable items per bill.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {categories.length} bill types
        </span>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </>
  );
}
