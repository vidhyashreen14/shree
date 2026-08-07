import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { labOrders, patients, doctors } from "@/lib/mock/data";
import {
  FileText,
  FlaskConical,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  User,
  Activity,
  Beaker,
  CalendarDays,
  Stethoscope,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronDown,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChevronUp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Download,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Trash2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  RefreshCw,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { createPortal } from "react-dom";
import { allowOnlyResultChars, sanitizeText } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PatientNameInput, MobileInput } from "@/components/common/ValidatedInputs";



// ── Deterministic test results per test name ──────────────────────────────────
const TEST_DATA: Record<
  string,
  { parameter: string; result: string; unit: string; reference: string; flag?: "H" | "L" }[]
> = {
  "CBC (Complete Blood Count)": [
    { parameter: "Haemoglobin", result: "11.8", unit: "g/dL", reference: "12.0 – 17.5", flag: "L" },
    { parameter: "WBC", result: "7200", unit: "cells/µL", reference: "4000 – 11000" },
    { parameter: "Platelets", result: "210000", unit: "cells/µL", reference: "150000 – 400000" },
    { parameter: "RBC", result: "4.6", unit: "million/µL", reference: "4.5 – 5.9" },
    { parameter: "MCV", result: "82", unit: "fL", reference: "80 – 100" },
    { parameter: "MCH", result: "28", unit: "pg", reference: "27 – 33" },
    { parameter: "Neutrophils", result: "65", unit: "%", reference: "40 – 70" },
    { parameter: "Lymphocytes", result: "28", unit: "%", reference: "20 – 40" },
    { parameter: "ESR", result: "22", unit: "mm/hr", reference: "< 20", flag: "H" },
  ],
  "Lipid Panel": [
    { parameter: "Total Cholesterol", result: "214", unit: "mg/dL", reference: "< 200", flag: "H" },
    { parameter: "LDL Cholesterol", result: "138", unit: "mg/dL", reference: "< 100", flag: "H" },
    { parameter: "HDL Cholesterol", result: "42", unit: "mg/dL", reference: "> 40" },
    { parameter: "Triglycerides", result: "168", unit: "mg/dL", reference: "< 150", flag: "H" },
    { parameter: "VLDL", result: "33", unit: "mg/dL", reference: "< 30", flag: "H" },
    { parameter: "Non-HDL", result: "172", unit: "mg/dL", reference: "< 130", flag: "H" },
  ],
  HbA1c: [
    { parameter: "HbA1c", result: "7.4", unit: "%", reference: "4.0 – 5.6", flag: "H" },
    {
      parameter: "Mean Blood Glucose",
      result: "166",
      unit: "mg/dL",
      reference: "70 – 100",
      flag: "H",
    },
  ],
  TSH: [
    { parameter: "TSH", result: "4.8", unit: "mIU/L", reference: "0.4 – 4.0", flag: "H" },
    { parameter: "T3 (Total)", result: "1.1", unit: "nmol/L", reference: "0.9 – 2.5" },
    { parameter: "T4 (Total)", result: "88", unit: "nmol/L", reference: "70 – 150" },
  ],
  Urinalysis: [
    { parameter: "Colour", result: "Yellow", unit: "—", reference: "Yellow" },
    { parameter: "Clarity", result: "Clear", unit: "—", reference: "Clear" },
    { parameter: "pH", result: "6.2", unit: "—", reference: "4.5 – 8.5" },
    { parameter: "Protein", result: "Trace", unit: "—", reference: "Negative", flag: "H" },
    { parameter: "Glucose", result: "Nil", unit: "—", reference: "Negative" },
    { parameter: "Ketones", result: "Nil", unit: "—", reference: "Negative" },
    { parameter: "RBCs", result: "2-4", unit: "/HPF", reference: "0 – 2", flag: "H" },
  ],
  "Thyroid Profile": [],
  "Vitamin D": [],
  "Vitamin B12": [],
  LFT: [],
  KFT: [],
  "Urine R/M": [],
};

// Fallback for tests not in the dict above
function getTestRows(testName: string) {
  return (
    TEST_DATA[testName] ?? [
      { parameter: testName, result: "Within normal limits", unit: "—", reference: "—" },
    ]
  );
}

// ── All orders (mix of collected + pending for demo) ─────────────────────────
const allOrders = [
  ...labOrders,
  {
    id: "lo-9001",
    patientId: patients[0]?.id ?? "",
    doctorId: "u-doc-1",
    tests: ["CBC (Complete Blood Count)", "Lipid Panel"],
    status: "sample-collected" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9002",
    patientId: patients[2]?.id ?? "",
    doctorId: "u-doc-4",
    tests: ["HbA1c", "Urinalysis"],
    status: "sample-collected" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9003",
    patientId: patients[4]?.id ?? "",
    doctorId: "u-doc-2",
    tests: ["TSH", "CBC (Complete Blood Count)"],
    status: "sample-collected" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9004",
    patientId: patients[6]?.id ?? "",
    doctorId: "u-doc-5",
    tests: ["Lipid Panel"],
    status: "ordered" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9005",
    patientId: patients[8]?.id ?? "",
    doctorId: "u-doc-3",
    tests: ["HbA1c"],
    status: "in-progress" as const,
    orderedOn: new Date().toISOString(),
  },
];

const PAGE_SIZE = 7;

// ── Types ──────────────────────────────────────────────────────────────────────
type Order = (typeof allOrders)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Report Modal
// ─────────────────────────────────────────────────────────────────────────────
export function GenerateReportModal({ 
  orderId, 
  open, 
  onOpenChange,
  onGenerated
}: { 
  orderId: string | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onGenerated?: () => void;
}) {
  const selectedOrder = allOrders.find((o) => o.id === orderId);
  if (!orderId || !open || !selectedOrder) return null;

  const order = selectedOrder;
  const patient = patients.find((p) => p.id === order.patientId);
  const doctor = doctors.find((d) => d.id === order.doctorId);
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const initials = (patient?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const allRows = order.tests.flatMap((t) => getTestRows(t).map((r) => ({ ...r, test: t })));

  const rowsByTest = order.tests.map((testName) => {
    const rowsWithIndex = allRows
      .map((row, idx) => ({ ...row, globalIdx: idx }))
      .filter((row) => row.test === testName);
    return {
      testName,
      rows: rowsWithIndex,
    };
  });

  const [results, setResults] = useState<Record<number, string>>(
    () => Object.fromEntries(allRows.map((_, i) => [i, ""]))
  );

  const [interpretationText, setInterpretationText] = useState("");

  function setResult(idx: number, val: string) {
    setResults((prev) => ({ ...prev, [idx]: val }));
  }

  function handleConfirm() {
    toast.success(`Lab Report ${orderId} generated successfully!`);
    onGenerated?.();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-background">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials}
            </div>
            <div>
              <p className="font-bold text-foreground">{patient?.name ?? "Unknown Patient"}</p>
              <p className="text-xs text-muted-foreground">
                {patient?.mrn ?? "—"} &nbsp;·&nbsp; {patient?.age ?? "—"} yrs &nbsp;·&nbsp;{" "}
                {patient?.gender ?? "—"} &nbsp;·&nbsp; {patient?.bloodGroup ?? "—"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: FileText, label: "Order ID", value: order.id },
              { icon: CalendarDays, label: "Report Date", value: today },
              { icon: Stethoscope, label: "Referring Doctor", value: doctor?.name ?? "—" },
              { icon: User, label: "Phone", value: patient?.phone ?? "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/30 p-3 ring-1 ring-border">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground truncate">{value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {rowsByTest.map(({ testName, rows }) => (
              <div key={testName} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    {testName}
                  </h3>
                </div>

                <div className="overflow-hidden rounded-xl ring-1 ring-border bg-background">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-2.5 text-left">Parameter</th>
                        <th className="px-4 py-2.5 text-left">Result</th>
                        <th className="px-4 py-2.5 text-right">Unit</th>
                        <th className="px-4 py-2.5 text-right">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row) => (
                        <tr key={row.globalIdx} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2 font-medium text-foreground w-[40%]">
                            {row.parameter}
                          </td>
                          <td className="px-4 py-2 w-[25%]">
                            <input
                              type="text"
                              maxLength={50}
                              value={results[row.globalIdx] ?? ""}
                              onChange={(e) =>
                                setResult(row.globalIdx, allowOnlyResultChars(e.target.value))
                              }
                              placeholder="Enter value"
                              className="w-full rounded-md border border-border bg-background px-2.5 py-1 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 outline-none ring-0 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            />
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-muted-foreground">
                            {row.unit}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-muted-foreground">
                            {row.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-blue-500/5 p-4 ring-1 ring-blue-500/20">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
              Clinical Interpretation
            </p>
            <textarea
              maxLength={500}
              value={interpretationText}
              onChange={(e) => setInterpretationText(e.target.value)}
              onBlur={() => setInterpretationText(sanitizeText(interpretationText))}
              className="w-full mt-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none min-h-[5rem]"
              placeholder="Enter clinical interpretation here... (Max 500 characters)"
            />
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={handleConfirm}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm &amp; Save Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// New Patient Test Modal
// ─────────────────────────────────────────────────────────────────────────────
function NewPatientTestModal({
  onConfirm,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm: (data: any) => void;
  onClose: () => void;
}) {
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");

  const [testName, setTestName] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [collectionDate, setCollectionDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [referringDoctor, setReferringDoctor] = useState("");

  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  function handleGenerate() {
    setHasAttemptedSubmit(true);

    if (!patientName || !age || !gender || !mobile || !testName) {
      toast.error("Please fill in all required fields");
      return;
    }

    onConfirm({
      patientName,
      age,
      gender,
      mobile,
      testName,
      sampleType,
      collectionDate,
      referringDoctor,
    });
  }

  // Use Dialog for consistency
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-background">
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-foreground">New Patient Test</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-6">
          {/* Patient Details Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Patient Details
            </h3>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-name">Patient Name</label>
                <PatientNameInput
                  id="new-patient-name"
                  value={patientName}
                  onChange={setPatientName}
                  required
                  showValidation={hasAttemptedSubmit}
                  placeholder="Enter patient name"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-mobile">Mobile Number</label>
                <MobileInput
                  id="new-patient-mobile"
                  value={mobile}
                  onChange={setMobile}
                  required
                  showValidation={hasAttemptedSubmit}
                  placeholder="(+91) Mobile Number"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-age">Age</label>
                <Input
                  id="new-patient-age"
                  type="number"
                  min="0"
                  max="150"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Years"
                  className={cn("h-9 text-xs", hasAttemptedSubmit && !age && "border-destructive")}
                />
                {hasAttemptedSubmit && !age && (
                  <p className="mt-1 text-[11px] font-medium text-destructive animate-in slide-in-from-top-1">
                    Age is required
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-gender">Gender</label>
                <div className="relative">
                  <select
                    id="new-patient-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={cn(
                      "w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8 h-9 text-xs",
                      hasAttemptedSubmit && !gender && "border-destructive"
                    )}
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {hasAttemptedSubmit && !gender && (
                  <p className="mt-1 text-[11px] font-medium text-destructive animate-in slide-in-from-top-1">
                    Gender is required
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-border w-full" />

          {/* Test Details Section */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Test Details
            </h3>
            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-test">Test Name</label>
                <div className="relative">
                  <select
                    id="new-patient-test"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    className={cn(
                      "w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 pr-8 h-9 text-xs",
                      hasAttemptedSubmit && !testName && "border-destructive"
                    )}
                  >
                    <option value="" disabled>Select Service</option>
                    {Object.keys(TEST_DATA).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {hasAttemptedSubmit && !testName && (
                  <p className="mt-1 text-[11px] font-medium text-destructive animate-in slide-in-from-top-1">
                    Test Name is required
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-sample">Sample Type</label>
                <Input
                  id="new-patient-sample"
                  value={sampleType}
                  onChange={(e) => setSampleType(e.target.value)}
                  placeholder="e.g. Blood, Urine (Optional)"
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-date">Collection Date</label>
                <Input
                  id="new-patient-date"
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="new-patient-doc">Referring Doctor</label>
                <Input
                  id="new-patient-doc"
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  placeholder="Dr. Name (Optional)"
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleGenerate}>
            <FileText className="h-3.5 w-3.5" />
            Add Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


