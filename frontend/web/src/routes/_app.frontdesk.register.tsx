import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useRef } from "react";
import {
  allowOnlyAlphabetsAndSpaces,
  allowOnlyNumbers,
  allowOnlyAddressChars,
} from "@/lib/validations";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PatientNameInput, MobileInput, EmailInput } from "@/components/common/ValidatedInputs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePatients } from "@/lib/store/patients";
import { useBillingStore } from "@/lib/store/billing";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { doctors, departments } from "@/lib/mock/data";
import type { Patient } from "@/lib/types";
import {
  Search,
  UserPlus,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Building2,
  IndianRupee,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Globe,
  Printer,
  MessageSquare,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/frontdesk/register")({
  head: () => ({
    meta: [
      { title: "Register Patient · MediCore Front Desk" },
      { name: "description", content: "Register new or returning patients at the reception desk." },
    ],
  }),
  component: RegisterPatient,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateUHID(): string {
  return `UHID-${100000 + Math.floor(Math.random() * 899999)}`;
}

function generateReceiptNo(): string {
  return `RCP-${Date.now().toString().slice(-8)}`;
}

const RELATIONSHIPS = ["Spouse", "Parent", "Sibling", "Child", "Friend", "Guardian", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "netbanking", label: "Net Banking", icon: Globe },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────

const STEPS = ["Patient Lookup", "Registration", "Doctor Selection", "Payment"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                i < current
                  ? "border-primary bg-primary text-primary-foreground"
                  : i === current
                    ? "border-primary bg-primary/10 text-primary shadow-md shadow-primary/20"
                    : "border-border bg-background text-muted-foreground"
              )}
            >
              {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "mt-1.5 w-20 text-center text-[10px] font-medium leading-tight",
                i === current ? "text-primary" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-1 mb-5 h-0.5 w-12 transition-all duration-300",
                i < current ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 0: Patient Lookup ──────────────────────────────────────────────────

function StepLookup({
  onNew,
  onExisting,
}: {
  onNew: () => void;
  onExisting: (p: Patient) => void;
}) {
  const { searchPatients } = usePatients();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"new" | "existing">("new");
  const results = useMemo(() => searchPatients(query), [query, searchPatients]);

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-1 text-xl font-display font-bold">Welcome to Reception</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Is this a new patient or an existing one?
      </p>

      {/* Toggle */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {[
          {
            id: "new" as const,
            label: "New Patient",
            icon: UserPlus,
            desc: "First time visit — needs registration",
          },
          {
            id: "existing" as const,
            label: "Existing Patient",
            icon: UserCheck,
            desc: "Has a UHID — search below",
          },
        ].map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all",
              mode === id
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-background hover:border-primary/40 hover:bg-accent/30"
            )}
          >
            <span
              className={cn(
                "grid h-10 w-10 place-items-center rounded-xl",
                mode === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {mode === "new" && (
        <Button className="w-full h-12 text-base" onClick={onNew} id="btn-proceed-new">
          <UserPlus className="mr-2 h-5 w-5" /> Proceed to Registration
          <ChevronRight className="ml-auto h-4 w-4" />
        </Button>
      )}

      {mode === "existing" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-patient"
              placeholder="Search by name, mobile number, or UHID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12"
              autoFocus
            />
          </div>

          {query.length >= 2 && (
            <div className="rounded-xl border bg-card shadow-sm divide-y">
              {results.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No patients found for "{query}"
                </p>
              ) : (
                results.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onExisting(p)}
                    className="flex w-full items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {p.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.mrn} · {p.gender} · {p.age}y · {p.phone}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Registration ────────────────────────────────────────────────────

interface RegForm {
  name: string;
  dob: string;
  age: string;
  gender: string;
  mobile: string;
  email: string;
  address: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
  allergies: string;
  diseases: string;
  medications: string;
  insuranceProvider: string;
  policyNumber: string;
}

const emptyRegForm: RegForm = {
  name: "",
  dob: "",
  age: "",
  gender: "Male",
  mobile: "",
  email: "",
  address: "",
  bloodGroup: "O+",
  emergencyName: "",
  emergencyPhone: "",
  emergencyRelation: "Parent",
  allergies: "",
  diseases: "",
  medications: "",
  insuranceProvider: "",
  policyNumber: "",
};

function StepRegistration({
  form,
  setForm,
  onNext,
  onBack,
}: {
  form: RegForm;
  setForm: React.Dispatch<React.SetStateAction<RegForm>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  const updateError = (k: string, hasError: boolean) =>
    setErrors((prev) => ({ ...prev, [k]: hasError }));

  const update = (k: keyof RegForm, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid =
    form.name.trim().length >= 2 &&
    form.mobile.trim().length === 10 &&
    form.gender &&
    form.address.trim().length >= 2 &&
    form.emergencyName.trim().length >= 2 &&
    form.emergencyPhone.trim().length === 10 &&
    !Object.values(errors).some(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Personal Details */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
            1
          </span>
          Personal Details
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name *" className="sm:col-span-2">
            <PatientNameInput
              id="reg-name"
              value={form.name}
              onChange={(v) => update("name", v)}
              onErrorChange={(err) => updateError("name", err)}
              required
            />
          </Field>
          <Field label="Date of Birth">
            <Input
              id="reg-dob"
              type="date"
              value={form.dob}
              onChange={(e) => update("dob", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </Field>
          <Field label="Age">
            <Input
              id="reg-age"
              type="number"
              min={0}
              max={120}
              value={form.age}
              onChange={(e) => update("age", allowOnlyNumbers(e.target.value))}
              placeholder="Years"
            />
          </Field>
          <Field label="Gender *">
            <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Male", "Female", "Other"].map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Blood Group">
            <Select value={form.bloodGroup} onValueChange={(v) => update("bloodGroup", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mobile Number *">
            <MobileInput
              id="reg-mobile"
              value={form.mobile}
              onChange={(v) => update("mobile", v)}
              onErrorChange={(err) => updateError("mobile", err)}
              required
            />
          </Field>
          <Field label="Email (optional)">
            <EmailInput
              id="reg-email"
              value={form.email}
              onChange={(v) => update("email", v)}
              onErrorChange={(err) => updateError("email", err)}
            />
          </Field>
          <Field label="Address *" className="sm:col-span-2">
            <Textarea
              id="reg-address"
              value={form.address}
              onChange={(e) => update("address", allowOnlyAddressChars(e.target.value))}
              rows={2}
              placeholder="Full address…"
            />
          </Field>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-500/10 text-amber-600 text-xs font-bold">
            2
          </span>
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact Person Name *">
            <PatientNameInput
              id="reg-emname"
              value={form.emergencyName}
              onChange={(v) => update("emergencyName", v)}
              onErrorChange={(err) => updateError("emergencyName", err)}
              required
              placeholder="Guardian / Relative name"
            />
          </Field>
          <Field label="Phone Number *">
            <MobileInput
              id="reg-emphone"
              value={form.emergencyPhone}
              onChange={(v) => update("emergencyPhone", v)}
              onErrorChange={(err) => updateError("emergencyPhone", err)}
              required
              placeholder="+91 …"
            />
          </Field>
          <Field label="Relationship">
            <Select
              value={form.emergencyRelation}
              onValueChange={(v) => update("emergencyRelation", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </section>

      {/* Medical Info */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
            3
          </span>
          Basic Medical Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Known Allergies">
            <Input
              id="reg-allergies"
              value={form.allergies}
              onChange={(e) => update("allergies", allowOnlyAlphabetsAndSpaces(e.target.value))}
              placeholder="e.g. Penicillin, Peanuts"
            />
          </Field>
          <Field label="Existing Diseases / Conditions">
            <Input
              id="reg-diseases"
              value={form.diseases}
              onChange={(e) => update("diseases", allowOnlyAlphabetsAndSpaces(e.target.value))}
              placeholder="e.g. Diabetes, Hypertension"
            />
          </Field>
          <Field label="Current Medications" className="sm:col-span-2">
            <Input
              id="reg-medications"
              value={form.medications}
              onChange={(e) =>
                update("medications", e.target.value.replace(/[^a-zA-Z0-9\s.,-]/g, ""))
              }
              placeholder="e.g. Metformin 500mg, Amlodipine 5mg"
            />
          </Field>
        </div>
      </section>

      {/* Insurance */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-500/10 text-blue-600 text-xs font-bold">
            4
          </span>
          Insurance Details
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Optional
          </span>
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Leave blank if patient doesn't have insurance.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Insurance Provider">
            <Input
              id="reg-ins-provider"
              value={form.insuranceProvider}
              onChange={(e) => update("insuranceProvider", e.target.value)}
              placeholder="e.g. Star Health, HDFC Ergo"
            />
          </Field>
          <Field label="Policy Number">
            <Input
              id="reg-ins-policy"
              value={form.policyNumber}
              onChange={(e) => update("policyNumber", e.target.value)}
              placeholder="e.g. SH-100245"
            />
          </Field>
        </div>
      </section>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} id="btn-reg-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={!valid} id="btn-reg-next">
          Continue to Doctor Selection <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2: Doctor Selection ─────────────────────────────────────────────────

function StepDoctorSelection({
  onNext,
  onBack,
  selectedDeptId,
  setSelectedDeptId,
  selectedDoctorId,
  setSelectedDoctorId,
}: {
  onNext: () => void;
  onBack: () => void;
  selectedDeptId: string;
  setSelectedDeptId: (v: string) => void;
  selectedDoctorId: string;
  setSelectedDoctorId: (v: string) => void;
}) {
  const deptDoctors = doctors.filter(
    (d) =>
      !selectedDeptId || d.department === departments.find((dep) => dep.id === selectedDeptId)?.name
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Department */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Select Department
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => {
                setSelectedDeptId(dept.id);
                setSelectedDoctorId("");
              }}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all",
                selectedDeptId === dept.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <p className="text-sm font-semibold leading-tight">{dept.name}</p>
              <p className="text-xs text-muted-foreground">{dept.doctorCount} doctors</p>
            </button>
          ))}
        </div>
      </section>

      {/* Doctor */}
      <section className="surface-elevated p-6">
        <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          Select Doctor
          {selectedDeptId && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              — {departments.find((d) => d.id === selectedDeptId)?.name}
            </span>
          )}
        </h3>
        {!selectedDeptId ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            ← Select a department first
          </p>
        ) : (
          <div className="divide-y divide-border">
            {deptDoctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoctorId(doc.id)}
                className={cn(
                  "flex w-full items-center gap-4 py-4 text-left transition-all rounded-xl px-2",
                  selectedDoctorId === doc.id ? "bg-primary/5" : "hover:bg-accent/30"
                )}
              >
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-all",
                    selectedDoctorId === doc.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {doc.name.split(" ").slice(-1)[0]?.[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-primary">₹{doc.fee}</p>
                  <span
                    className={cn(
                      "text-[10px] font-semibold rounded-full px-2 py-0.5",
                      doc.available
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {doc.available ? "Available" : "Busy"}
                  </span>
                </div>
              </button>
            ))}
            {deptDoctors.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No doctors in this department
              </p>
            )}
          </div>
        )}
      </section>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} id="btn-doctor-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedDeptId || !selectedDoctorId}
          id="btn-doctor-next"
        >
          Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Consultation Bill Modal ─────────────────────────────────────────────────

function ConsultationBillModal({
  patientName,
  uhid,
  patientAge,
  patientGender,
  doctorName,
  department,
  isNewPatient,
  registrationFee,
  consultationFee,
  total,
  paymentMethod,
  billNo,
  patientPhone,
  patientEmail,
  onClose,
}: {
  patientName: string;
  uhid: string;
  patientAge: number;
  patientGender: string;
  doctorName: string;
  department: string;
  isNewPatient: boolean;
  registrationFee: number;
  consultationFee: number;
  total: number;
  paymentMethod: string;
  billNo: string;
  patientPhone: string;
  patientEmail: string;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const billDate = format(new Date(), "dd MMM yyyy, hh:mm a");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { logoUrl, name, phone, email, address } = useHospitalSettings();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Pop-up blocked. Allow pop-ups and try again.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Consultation Bill — ${billNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
            .bill { max-width: 680px; margin: 0 auto; padding: 32px; }
            .header { display: flex; flex-direction: column; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px; text-align: center; }
            .logo { font-size: 22px; font-weight: 800; color: #0d9488; }
            .subtitle { font-size: 11px; color: #555; margin-top: 2px; }
            .addr { font-size: 11px; color: #555; margin-top: 6px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 16px; }
            .meta p { font-size: 12px; margin-bottom: 4px; }
            .section { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 14px 0 8px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 10px; text-align: left; }
            td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .amt { text-align: right; }
            .total-row td { font-weight: 800; font-size: 14px; border-top: 2px solid #0d9488; padding-top: 10px; }
            .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ddd; padding-top: 12px; }
            .badge { display: inline-block; background: #f0fdfa; color: #0d9488; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
          </style>
        </head>
        <body><div class="bill">${content}</div></body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleWhatsApp = () => {
    const phoneNum = patientPhone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `*${name} — Consultation Bill*\nBill No: ${billNo}\nPatient: ${patientName} (${uhid})\nDate: ${billDate}\nDoctor: ${doctorName}\nTotal Paid: ₹${total}\nPayment: ${paymentMethod}\n\n"Payment received. Please proceed to the vitals desk."\n\nThank you for choosing ${name}!`
    );
    window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${name} — Consultation Bill ${billNo}`);
    const body = encodeURIComponent(
      `Dear ${patientName},\n\nYour Consultation Bill (No: ${billNo}) dated ${billDate} for ₹${total} has been received (${paymentMethod}).\n\nPlease proceed to the vitals desk.\n\n${name}\n${phone}`
    );
    window.location.href = `mailto:${patientEmail}?subject=${subject}&body=${body}`;
  };

  const handleSMS = () => {
    toast.info("SMS gateway integration required.", {
      description: "Connect your SMS provider API in production.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-background shadow-2xl flex flex-col max-h-[90vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <h2 className="font-display font-bold">Consultation Bill — {billNo}</h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleWhatsApp}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSMS}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Phone className="mr-1.5 h-3.5 w-3.5" /> SMS
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleEmail}
              className="text-violet-600 border-violet-200 hover:bg-violet-50"
            >
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

        {/* Receipt message */}
        <div className="shrink-0 mx-6 mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Payment received!</p>
            <p className="text-xs text-emerald-700">Please proceed to the vitals desk. 🏥</p>
          </div>
        </div>

        {/* Bill content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef}>
            {/* Header */}
            <div
              className="header"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                borderBottom: "2px solid #0d9488",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ maxHeight: 50, maxWidth: 150, marginBottom: 8, objectFit: "contain" }}
                />
              ) : (
                <div className="logo" style={{ fontSize: 22, fontWeight: 800, color: "#0d9488" }}>
                  🏥 {name}
                </div>
              )}
              {logoUrl && (
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0d9488", marginTop: 2 }}>
                  {name}
                </div>
              )}
              <div className="subtitle" style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                Multispecialty Hospital · Compassionate Care
              </div>
              <div
                className="addr"
                style={{ fontSize: 11, color: "#555", marginTop: 6, textAlign: "center" }}
              >
                {address} · 📞 {phone}
              </div>
            </div>

            {/* Bill meta */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span
                className="badge"
                style={{
                  display: "inline-block",
                  background: "#f0fdfa",
                  color: "#0d9488",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Consultation Bill
              </span>
              <div style={{ textAlign: "right", fontSize: 12 }}>
                <div>
                  <strong>Bill No:</strong> {billNo}
                </div>
                <div>
                  <strong>Date:</strong> {billDate}
                </div>
              </div>
            </div>

            {/* Patient info */}
            <div
              className="section"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#0d9488",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 4,
                margin: "14px 0 8px",
              }}
            >
              Patient Details
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Patient Name:</strong> {patientName}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Patient ID (UHID):</strong> {uhid}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Age / Gender:</strong> {patientAge}y / {patientGender}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Assigned Consultant:</strong> {doctorName}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Department:</strong> {department}
                </p>
                <p style={{ fontSize: 12, marginBottom: 4 }}>
                  <strong>Type:</strong> {isNewPatient ? "New Patient" : "Returning Patient"}
                </p>
              </div>
            </div>

            {/* Fee table */}
            <div
              className="section"
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#0d9488",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: 4,
                margin: "14px 0 8px",
              }}
            >
              Fee Details
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      background: "#f0fdfa",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 10px",
                      textAlign: "left",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      background: "#f0fdfa",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 10px",
                      textAlign: "left",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      background: "#f0fdfa",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 10px",
                      textAlign: "right",
                    }}
                  >
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {isNewPatient && (
                  <tr>
                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      1
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      Hospital Registration Fee (New Patient)
                    </td>
                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                        textAlign: "right",
                      }}
                    >
                      ₹{registrationFee.toLocaleString()}
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    style={{ padding: "7px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}
                  >
                    {isNewPatient ? 2 : 1}
                  </td>
                  <td
                    style={{ padding: "7px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}
                  >
                    Doctor Consultation Fee — {doctorName}
                  </td>
                  <td
                    style={{
                      padding: "7px 10px",
                      borderBottom: "1px solid #f1f5f9",
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    ₹{consultationFee.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      borderTop: "2px solid #0d9488",
                      padding: "10px 10px 7px",
                    }}
                  >
                    Total Paid
                  </td>
                  <td
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      borderTop: "2px solid #0d9488",
                      padding: "10px 10px 7px",
                      textAlign: "right",
                    }}
                  >
                    ₹{total.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: 16,
                padding: "10px 0",
                borderTop: "1px solid #e2e8f0",
                fontSize: 12,
              }}
            >
              <strong>Payment Method:</strong> {paymentMethod.toUpperCase()}
            </div>

            <div
              style={{
                marginTop: 24,
                textAlign: "center",
                fontSize: 11,
                color: "#888",
                borderTop: "1px dashed #ddd",
                paddingTop: 12,
              }}
            >
              This is a computer generated bill and does not require a signature.
              <br />
              Thank you for choosing {name}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Payment ──────────────────────────────────────────────────────────

function StepPayment({
  isNewPatient,
  selectedDoctorId,
  selectedDeptId,
  patientName,
  uhid,
  patientId,
  patientAge,
  patientGender,
  patientPhone,
  patientEmail,
  onBack,
  onComplete,
}: {
  isNewPatient: boolean;
  selectedDoctorId: string;
  selectedDeptId: string;
  patientName: string;
  uhid: string;
  patientId: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientEmail: string;
  onBack: () => void;
  onComplete: () => void;
}) {
  const { registrationFee, consultationFee } = useBillingStore();
  const addToQueue = useNurseQueue((s) => s.addToQueue);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [billNo, setBillNo] = useState("");

  const regFee = isNewPatient ? registrationFee : 0;
  const total = regFee + consultationFee;

  const doctor = doctors.find((d) => d.id === selectedDoctorId);
  const dept = departments.find((d) => d.id === selectedDeptId);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1000));

    const receiptNo = generateReceiptNo();
    setBillNo(receiptNo);

    // Push to nurse queue
    addToQueue({
      id: `nq-${Date.now()}`,
      patientId,
      uhid,
      patientName,
      age: patientAge,
      gender: patientGender,
      doctorId: selectedDoctorId,
      doctorName: doctor?.name ?? "Unknown",
      department: dept?.name ?? "Unknown",
      isNewPatient,
      paymentMethod,
      totalPaid: total,
      arrivedAt: new Date().toISOString(),
      vitalsStatus: "pending",
    });

    setProcessing(false);
    setShowBill(true); // Show bill modal
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {showBill && (
        <ConsultationBillModal
          patientName={patientName}
          uhid={uhid}
          patientAge={patientAge}
          patientGender={patientGender}
          doctorName={doctor?.name ?? "—"}
          department={dept?.name ?? "—"}
          isNewPatient={isNewPatient}
          registrationFee={registrationFee}
          consultationFee={consultationFee}
          total={total}
          paymentMethod={paymentMethod}
          billNo={billNo}
          patientPhone={patientPhone}
          patientEmail={patientEmail}
          onClose={() => {
            setShowBill(false);
            onComplete();
          }}
        />
      )}

      {/* Patient Summary */}
      <div className="surface-elevated p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {patientName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </span>
          <div>
            <p className="font-semibold">{patientName}</p>
            <p className="text-xs text-muted-foreground">
              {uhid} · {patientAge}y · {patientGender}
            </p>
          </div>
          <span
            className={cn(
              "ml-auto rounded-full px-2.5 py-1 text-xs font-semibold",
              isNewPatient ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
            )}
          >
            {isNewPatient ? "New Patient" : "Returning Patient"}
          </span>
        </div>
        {doctor && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{doctor.name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{dept?.name}</span>
          </div>
        )}
      </div>

      {/* Fee Table */}
      <div className="surface-elevated p-5">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee className="h-4 w-4 text-primary" />
          <h3 className="font-display font-semibold">Fee Summary</h3>
        </div>
        <div className="space-y-2.5">
          {isNewPatient && (
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5">
              <span className="text-sm text-muted-foreground">
                Hospital Registration Fee{" "}
                <span className="text-[10px] ml-1 text-blue-500 font-semibold">(new patient)</span>
              </span>
              <span className="font-semibold">₹{registrationFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5">
            <span className="text-sm text-muted-foreground">Doctor Consultation Fee</span>
            <span className="font-semibold">₹{consultationFee.toLocaleString()}</span>
          </div>
          <div className="my-1 border-t border-dashed" />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="font-bold">Total</span>
            <span className="text-xl font-bold text-primary">₹{total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="surface-elevated p-5">
        <h3 className="font-display font-semibold mb-4">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPaymentMethod(id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all",
                paymentMethod === id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  paymentMethod === id ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn("text-sm font-medium", paymentMethod === id ? "text-primary" : "")}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={processing} id="btn-pay-back">
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handlePayment}
          disabled={!paymentMethod || processing}
          className="flex-1 h-12 text-base font-semibold"
          id="btn-pay-complete"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing…
            </span>
          ) : (
            <>
              <Printer className="mr-2 h-5 w-5" />
              Confirm Payment &amp; Print Bill
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  name,
  uhid,
  onRegisterAnother,
}: {
  name: string;
  uhid: string;
  onRegisterAnother: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-md text-center py-8">
      <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <h2 className="font-display text-2xl font-bold mb-2">Patient Ready!</h2>
      <p className="text-muted-foreground mb-1">
        <span className="font-semibold text-foreground">{name}</span> has been registered and sent
        to the Nurse Station for vitals.
      </p>
      <div className="my-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Patient ID
        </span>
        <span className="font-bold text-primary">{uhid}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        The nurse dashboard has been notified. Patient can proceed to the vitals desk.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row justify-center">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/frontdesk" })}
          id="btn-back-to-desk"
        >
          Back to Reception
        </Button>
        <Button onClick={onRegisterAnother} id="btn-register-another">
          <UserPlus className="mr-2 h-4 w-4" /> Register Another Patient
        </Button>
      </div>
    </div>
  );
}

// ─── Field Helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

function RegisterPatient() {
  const addPatient = usePatients((s) => s.addPatient);

  const [step, setStep] = useState(0);
  const [isNewPatient, setIsNewPatient] = useState(true);

  // Shared patient info
  const [patientId, setPatientId] = useState("");
  const [uhid, setUhid] = useState("");
  const [patientAge, setPatientAge] = useState(0);
  const [patientGender, setPatientGender] = useState("");

  // Step 1
  const [regForm, setRegForm] = useState<RegForm>(emptyRegForm);

  // Step 2
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  // Step 3
  const [finalName, setFinalName] = useState("");
  const [finalUhid, setFinalUhid] = useState("");

  // ── Step handlers ──────────────────────────────────────────────────────────

  const handleNewPatient = () => {
    setIsNewPatient(true);
    setStep(1);
  };

  const handleExistingPatient = (p: Patient) => {
    setIsNewPatient(false);
    setPatientId(p.id);
    setUhid(p.mrn);
    setPatientAge(p.age);
    setPatientGender(p.gender);
    setRegForm({
      ...emptyRegForm,
      name: p.name,
      age: String(p.age),
      gender: p.gender,
      mobile: p.phone,
      email: p.email,
      address: p.address,
      bloodGroup: p.bloodGroup,
      emergencyName: p.emergencyContact.name,
      emergencyPhone: p.emergencyContact.phone,
      emergencyRelation: p.emergencyContact.relation,
      allergies: p.allergies.join(", "),
      medications: p.medications.join(", "),
    });
    setStep(2); // Existing patients skip registration
  };

  const handleRegComplete = () => {
    // Create the patient and generate UHID
    const newUhid = generateUHID();
    const age = Number(regForm.age) || 0;
    const newPatient: Patient = {
      id: `p-${Date.now()}`,
      mrn: newUhid,
      name: regForm.name.trim(),
      age,
      gender: regForm.gender,
      phone: regForm.mobile.trim(),
      email: regForm.email.trim(),
      bloodGroup: regForm.bloodGroup,
      address: regForm.address.trim(),
      emergencyContact: {
        name: regForm.emergencyName.trim(),
        phone: regForm.emergencyPhone.trim(),
        relation: regForm.emergencyRelation,
      },
      allergies: regForm.allergies ? regForm.allergies.split(",").map((a) => a.trim()) : [],
      medications: regForm.medications ? regForm.medications.split(",").map((m) => m.trim()) : [],
      insurance: regForm.insuranceProvider.trim()
        ? { provider: regForm.insuranceProvider.trim(), policyNo: regForm.policyNumber.trim() }
        : undefined,
      registeredOn: new Date().toISOString(),
      assignedDoctorId: "",
    };
    const created = addPatient(newPatient);
    setPatientId(created.id);
    setUhid(newUhid);
    setPatientAge(age);
    setPatientGender(regForm.gender);
    toast.success(`Patient registered!`, { description: `UHID: ${newUhid}` });
    setStep(2);
  };

  const handlePaymentComplete = () => {
    setFinalName(isNewPatient ? regForm.name.trim() : regForm.name.trim());
    setFinalUhid(uhid);
    setStep(4);
  };

  const reset = () => {
    setStep(0);
    setIsNewPatient(true);
    setPatientId("");
    setUhid("");
    setPatientAge(0);
    setPatientGender("");
    setRegForm(emptyRegForm);
    setSelectedDeptId("");
    setSelectedDoctorId("");
    setFinalName("");
    setFinalUhid("");
  };

  const patientName = isNewPatient ? regForm.name.trim() : regForm.name.trim();

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Patient Registration"
        description="Complete the 4-step workflow to register and check-in a patient."
      />

      <div className="mx-auto max-w-4xl">
        {step < 4 && <StepIndicator current={step} />}

        {step === 0 && <StepLookup onNew={handleNewPatient} onExisting={handleExistingPatient} />}
        {step === 1 && (
          <StepRegistration
            form={regForm}
            setForm={setRegForm}
            onNext={handleRegComplete}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepDoctorSelection
            onNext={() => setStep(3)}
            onBack={() => setStep(isNewPatient ? 1 : 0)}
            selectedDeptId={selectedDeptId}
            setSelectedDeptId={setSelectedDeptId}
            selectedDoctorId={selectedDoctorId}
            setSelectedDoctorId={setSelectedDoctorId}
          />
        )}
        {step === 3 && (
          <StepPayment
            isNewPatient={isNewPatient}
            selectedDoctorId={selectedDoctorId}
            selectedDeptId={selectedDeptId}
            patientName={patientName}
            uhid={uhid}
            patientId={patientId}
            patientAge={patientAge}
            patientGender={patientGender}
            patientPhone={regForm.mobile}
            patientEmail={regForm.email}
            onBack={() => setStep(2)}
            onComplete={handlePaymentComplete}
          />
        )}
        {step === 4 && (
          <SuccessScreen name={finalName} uhid={finalUhid} onRegisterAnother={reset} />
        )}
      </div>
    </>
  );
}
