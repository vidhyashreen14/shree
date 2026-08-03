import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { toast } from "sonner";
import { useState} from "react";
import { createPortal } from "react-dom";
import { allowOnlyResultChars, sanitizeText } from "@/lib/validations";

export const Route = createFileRoute('/_app/lab/upload')({
  component: LabUpload,
});

// ── Deterministic test results per test name ──────────────────────────────────
const TEST_DATA: Record<
  string,
  { parameter: string; result: string; unit: string; reference: string; flag?: "H" | "L" }[]
> = {
  CBC: [
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
  "Lipid panel": [
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
  "Blood Sugar": [
    {
      parameter: "Fasting Blood Sugar",
      result: "128",
      unit: "mg/dL",
      reference: "70 – 100",
      flag: "H",
    },
    { parameter: "Post-Prandial", result: "196", unit: "mg/dL", reference: "< 140", flag: "H" },
    {
      parameter: "Random Blood Sugar",
      result: "154",
      unit: "mg/dL",
      reference: "70 – 140",
      flag: "H",
    },
  ],
};

// Fallback for tests not in the dict above
function getTestRows(testName: string) {
  return (
    TEST_DATA[testName] ?? [
      { parameter: testName, result: "Within normal limits", unit: "—", reference: "—" },
    ]
  );
}

// Deterministic interpretation sentences per test
const INTERPRETATION: Record<string, string> = {
  CBC: "Mild anaemia noted (Hb 11.8 g/dL). Elevated ESR suggests ongoing low-grade inflammation. All other parameters within acceptable range.",
  "Lipid panel":
    "Dyslipidaemia detected. Total cholesterol and LDL are above optimal levels. Lifestyle modification (diet, exercise) and statin therapy review recommended.",
  HbA1c:
    "Poor glycaemic control over the past 2–3 months (HbA1c 7.4%). Mean blood glucose significantly elevated. Intensification of diabetes management advised.",
  TSH: "Subclinical hypothyroidism suspected (TSH 4.8). Free thyroid indices normal. Clinical correlation and repeat testing in 6 weeks recommended.",
  Urinalysis:
    "Trace proteinuria and mild haematuria present. Repeat urinalysis and renal function tests advised to rule out early nephropathy.",
  "Blood Sugar":
    "Significantly elevated fasting and post-prandial blood glucose levels indicate poorly controlled diabetes. Medication review and dietary counselling recommended.",
};

function getInterpretation(tests: string[]) {
  return (
    tests
      .map((t) => INTERPRETATION[t])
      .filter(Boolean)
      .join(" ") || "Results reviewed. No critical values detected. Please correlate clinically."
  );
}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDynamicInterpretation(
  tests: string[],
  results: Record<number, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  allRows: any[]
) {
  // Check if any results are entered
  const hasAnyInput = Object.values(results).some((val) => val.trim() !== "");
  if (!hasAnyInput) {
    return getInterpretation(tests);
  }

  // Let's gather all entered parameters
  const enteredParams = allRows
    .map((row, idx) => ({
      ...row,
      value: parseFloat(results[idx] || "") || null,
      stringValue: results[idx]?.trim() || "",
    }))
    .filter((item) => item.stringValue !== "");

  // Generate interpretation based on the test type and entered values
  const interpretations: string[] = [];

  // Group by test name
  const testsIncluded = Array.from(new Set(enteredParams.map((p) => p.test)));

  for (const test of testsIncluded) {
    const params = enteredParams.filter((p) => p.test === test);

    if (test === "Lipid panel") {
      const tc = params.find((p) => p.parameter === "Total Cholesterol");
      const ldl = params.find((p) => p.parameter === "LDL Cholesterol");
      const hdl = params.find((p) => p.parameter === "HDL Cholesterol");
      const tg = params.find((p) => p.parameter === "Triglycerides");
      const vldl = params.find((p) => p.parameter === "VLDL");
      const nonHdl = params.find((p) => p.parameter === "Non-HDL");

      const highs: string[] = [];
      const lows: string[] = [];

      if (tc && tc.value !== null && tc.value >= 200) highs.push("Total Cholesterol");
      if (ldl && ldl.value !== null && ldl.value >= 100) highs.push("LDL Cholesterol");
      if (hdl && hdl.value !== null && hdl.value <= 40) lows.push("HDL Cholesterol");
      if (tg && tg.value !== null && tg.value >= 150) highs.push("Triglycerides");
      if (vldl && vldl.value !== null && vldl.value >= 30) highs.push("VLDL");
      if (nonHdl && nonHdl.value !== null && nonHdl.value >= 130) highs.push("Non-HDL");

      if (highs.length > 0 || lows.length > 0) {
        let sentence = "Dyslipidaemia detected.";
        if (highs.length > 0) {
          sentence += ` ${highs.join(" and ")} ${highs.length > 1 ? "are" : "is"} above optimal levels.`;
        }
        if (lows.length > 0) {
          sentence += ` ${lows.join(" and ")} ${lows.length > 1 ? "are" : "is"} below optimal levels.`;
        }
        sentence +=
          " Lifestyle modification (diet, exercise) and lipid-lowering therapy review recommended.";
        interpretations.push(sentence);
      } else {
        interpretations.push(
          "Lipid profile is within normal range. Maintain healthy diet and active lifestyle."
        );
      }
    } else if (test === "CBC") {
      const hb = params.find((p) => p.parameter === "Haemoglobin");
      const wbc = params.find((p) => p.parameter === "WBC");
      const plt = params.find((p) => p.parameter === "Platelets");
      const esr = params.find((p) => p.parameter === "ESR");

      const issues: string[] = [];

      if (hb && hb.value !== null) {
        if (hb.value < 12.0) issues.push(`mild anaemia (Hb: ${hb.stringValue} g/dL)`);
        else if (hb.value > 17.5) issues.push(`erythrocytosis (Hb: ${hb.stringValue} g/dL)`);
      }
      if (wbc && wbc.value !== null) {
        if (wbc.value < 4000) issues.push(`leukopenia (WBC: ${wbc.stringValue})`);
        else if (wbc.value > 11000) issues.push(`leukocytosis (WBC: ${wbc.stringValue})`);
      }
      if (plt && plt.value !== null) {
        if (plt.value < 150000) issues.push(`thrombocytopenia (Platelets: ${plt.stringValue})`);
        else if (plt.value > 400000) issues.push(`thrombocytosis (Platelets: ${plt.stringValue})`);
      }
      if (esr && esr.value !== null && esr.value >= 20) {
        issues.push(
          `elevated ESR (${esr.stringValue} mm/hr), suggesting possible inflammatory response`
        );
      }

      if (issues.length > 0) {
        interpretations.push(
          `CBC findings indicate: ${issues.join(", ")}. Clinical correlation advised.`
        );
      } else {
        interpretations.push("Complete Blood Count (CBC) parameters are within reference range.");
      }
    } else if (test === "HbA1c") {
      const hba1c = params.find((p) => p.parameter === "HbA1c");
      if (hba1c && hba1c.value !== null) {
        if (hba1c.value >= 6.5) {
          interpretations.push(
            `Elevated HbA1c (${hba1c.stringValue}%) indicates poor glycaemic control, consistent with diabetes mellitus. Intensification of treatment recommended.`
          );
        } else if (hba1c.value >= 5.7) {
          interpretations.push(
            `HbA1c value (${hba1c.stringValue}%) is in the pre-diabetic range. Dietary modifications and regular physical activity are advised.`
          );
        } else {
          interpretations.push(
            `HbA1c level (${hba1c.stringValue}%) is within the normal reference range, indicating adequate glycaemic control.`
          );
        }
      }
    } else if (test === "TSH") {
      const tsh = params.find((p) => p.parameter === "TSH");
      if (tsh && tsh.value !== null) {
        if (tsh.value > 4.0) {
          interpretations.push(
            `Elevated TSH level (${tsh.stringValue} mIU/L) suggests subclinical or clinical hypothyroidism. Thyroid hormone levels should be correlated.`
          );
        } else if (tsh.value < 0.4) {
          interpretations.push(
            `Low TSH level (${tsh.stringValue} mIU/L) suggests hyperthyroidism. Further clinical investigation is recommended.`
          );
        } else {
          interpretations.push(
            `Thyroid Stimulating Hormone (TSH) level (${tsh.stringValue} mIU/L) is within normal limits.`
          );
        }
      }
    } else if (test === "Urinalysis") {
      const protein = params.find((p) => p.parameter === "Protein");
      const glucose = params.find((p) => p.parameter === "Glucose");
      const rbc = params.find((p) => p.parameter === "RBCs");

      const urineIssues: string[] = [];
      if (
        protein &&
        protein.stringValue.toLowerCase() !== "negative" &&
        protein.stringValue.toLowerCase() !== "nil"
      ) {
        urineIssues.push(`proteinuria (${protein.stringValue})`);
      }
      if (
        glucose &&
        glucose.stringValue.toLowerCase() !== "negative" &&
        glucose.stringValue.toLowerCase() !== "nil"
      ) {
        urineIssues.push(`glucosuria (${glucose.stringValue})`);
      }
      if (
        rbc &&
        rbc.stringValue.toLowerCase() !== "negative" &&
        rbc.stringValue.toLowerCase() !== "nil" &&
        rbc.stringValue.toLowerCase() !== "0-2"
      ) {
        urineIssues.push(`haematuria (${rbc.stringValue} RBCs/HPF)`);
      }

      if (urineIssues.length > 0) {
        interpretations.push(
          `Urinalysis shows ${urineIssues.join(" and ")}. Further evaluation for renal function or urinary tract pathology is recommended.`
        );
      } else {
        interpretations.push("Urinalysis parameters are within normal reference range.");
      }
    } else if (test === "Blood Sugar") {
      const fbs = params.find((p) => p.parameter === "Fasting Blood Sugar");
      const pp = params.find((p) => p.parameter === "Post-Prandial");
      const rbs = params.find((p) => p.parameter === "Random Blood Sugar");

      const sugarHighs: string[] = [];
      if (fbs && fbs.value !== null && fbs.value >= 100)
        sugarHighs.push(`Fasting Blood Sugar (${fbs.stringValue} mg/dL)`);
      if (pp && pp.value !== null && pp.value >= 140)
        sugarHighs.push(`Post-Prandial Sugar (${pp.stringValue} mg/dL)`);
      if (rbs && rbs.value !== null && rbs.value >= 140)
        sugarHighs.push(`Random Blood Sugar (${rbs.stringValue} mg/dL)`);

      if (sugarHighs.length > 0) {
        interpretations.push(
          `Elevated blood glucose levels noted: ${sugarHighs.join(", ")}. Consistent with impaired glucose tolerance or diabetes mellitus.`
        );
      } else {
        interpretations.push("Blood glucose levels are within normal limits.");
      }
    }
  }

  return interpretations.join(" ") || "Results reviewed. No critical abnormalities detected.";
}

// ── All orders (mix of collected + pending for demo) ─────────────────────────
const allOrders = [
  ...labOrders,
  {
    id: "lo-9001",
    patientId: patients[0]?.id ?? "",
    doctorId: "u-doc-1",
    tests: ["CBC", "Lipid panel"],
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
    tests: ["TSH", "CBC"],
    status: "sample-collected" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9004",
    patientId: patients[6]?.id ?? "",
    doctorId: "u-doc-5",
    tests: ["Lipid panel"],
    status: "ordered" as const,
    orderedOn: new Date().toISOString(),
  },
  {
    id: "lo-9005",
    patientId: patients[8]?.id ?? "",
    doctorId: "u-doc-3",
    tests: ["Blood Sugar", "HbA1c"],
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
function ReportModal({
  order,
  initialResults,
  initialInterpretation,
  onConfirm,
  onClose,
}: {
  order: Order;
  initialResults?: Record<number, string>;
  initialInterpretation?: string;
  onConfirm: (results: Record<number, string>, interpretation: string) => void;
  onClose: () => void;
}) {
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

  // Group rows by test name while keeping original index for state binding
  const rowsByTest = order.tests.map((testName) => {
    const rowsWithIndex = allRows
      .map((row, idx) => ({ ...row, globalIdx: idx }))
      .filter((row) => row.test === testName);
    return {
      testName,
      rows: rowsWithIndex,
    };
  });

  // ── Editable result values (one per row, starts empty for manual entry) ──
  const [results, setResults] = useState<Record<number, string>>(
    () => initialResults ?? Object.fromEntries(allRows.map((_, i) => [i, ""]))
  );

  const [interpretationText, setInterpretationText] = useState(() => initialInterpretation ?? "");

  function setResult(idx: number, val: string) {
    setResults((prev) => ({ ...prev, [idx]: val }));
  }

  return createPortal(
    /* backdrop — rendered on document.body to escape the layout stacking context */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* panel */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
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
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Meta row */}
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

          {/* Tests ordered chips */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Beaker className="h-3.5 w-3.5" /> Tests Ordered
            </p>
            <div className="flex flex-wrap gap-2">
              {order.tests.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Test Sections */}
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
                          {/* Parameter */}
                          <td className="px-4 py-2 font-medium text-foreground w-[40%]">
                            {row.parameter}
                          </td>

                          {/* Editable Result */}
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

                          {/* Unit */}
                          <td className="px-4 py-2 text-right text-sm text-muted-foreground">
                            {row.unit}
                          </td>

                          {/* Reference */}
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

          {/* Interpretation */}
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
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onConfirm(results, interpretationText)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm &amp; Save Report
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
function LabUpload() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [reportOrder, setReportOrder] = useState<Order | null>(null);

  const totalPages = Math.ceil(allOrders.length / PAGE_SIZE);
  const pageOrders = allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startEntry = (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(page * PAGE_SIZE, allOrders.length);

  /** Step 1 – show spinner 1.2 s, then open modal */
  function handleGenerate(order: Order) {
    setGenerating(order.id);
    setTimeout(() => {
      setGenerating(null);
      setReportOrder(order);
    }, 1200);
  }

  /** Step 2 – user clicks "Confirm & Save" inside the modal */
  function handleConfirm() {
    if (!reportOrder) return;
    const patient = patients.find((p) => p.id === reportOrder.patientId);
    setGenerated((prev) => new Set(prev).add(reportOrder.id));
    setReportOrder(null);
    toast.success(`Report saved for ${patient?.name ?? "patient"}`, {
      description: `Lab order ${reportOrder.id} has been finalised and stored.`,
    });
  }

  return (
    <>
      <PageHeader
        title="Generate Lab Report"
        description="Review all lab orders. Generate reports for patients whose samples have been collected."
      />

      {/* ── Table card ── */}
      <div className="surface-elevated overflow-hidden rounded-2xl">
        {/* header bar */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-5 py-3">
          <FlaskConical className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Patient Lab Orders
          </span>
          <span className="ml-auto rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {allOrders.length} orders
          </span>
        </div>

        {/* table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left">Order ID</th>
                <th className="px-5 py-3 text-left">Patient Name</th>
                <th className="px-5 py-3 text-left">Samples / Tests</th>
                <th className="px-5 py-3 text-left">Sample Status</th>
                <th className="px-5 py-3 text-center">Generate Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageOrders.map((order) => {
                const patient = patients.find((p) => p.id === order.patientId);
                const isCollected = order.status === "sample-collected";
                const isGenerating = generating === order.id;
                const isDone = generated.has(order.id);

                const initials = (patient?.name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const statusLabel =
                  order.status === "sample-collected"
                    ? "Collected"
                    : order.status === "in-progress"
                      ? "In Progress"
                      : order.status === "completed"
                        ? "Completed"
                        : "Pending";

                return (
                  <tr key={order.id} className="group transition-colors hover:bg-muted/30">
                    {/* Order ID */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {order.id}
                      </span>
                    </td>

                    {/* Patient Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {patient?.name ?? "Unknown Patient"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            MRN: {patient?.mrn ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Samples / Tests */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {order.tests.map((test) => (
                          <span
                            key={test}
                            className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground ring-1 ring-inset ring-border"
                          >
                            {test}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {isCollected ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-500/20">
                          <Clock className="h-3.5 w-3.5" /> {statusLabel}
                        </span>
                      )}
                    </td>

                    {/* Generate Report */}
                    <td className="px-5 py-4 text-center">
                      {isDone ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-500/20">
                          <FileText className="h-3.5 w-3.5" /> Generated
                        </span>
                      ) : isCollected ? (
                        <Button
                          size="sm"
                          disabled={isGenerating}
                          onClick={() => handleGenerate(order)}
                          className="gap-1.5"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
                            </>
                          ) : (
                            <>
                              <FileText className="h-3.5 w-3.5" /> Generate Report
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled
                          variant="outline"
                          className="cursor-not-allowed gap-1.5 opacity-40"
                          title="Sample not yet collected"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Not Available
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Collected
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Showing {startEntry}–{endEntry} of {allOrders.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 w-7 p-0"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${pg === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                  aria-label={`Page ${pg}`}
                >
                  {pg}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-7 w-7 p-0"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Report Modal ── */}
      {reportOrder && (
        <ReportModal
          order={reportOrder}
          onConfirm={handleConfirm}
          onClose={() => setReportOrder(null)}
        />
      )}
    </>
  );
}
