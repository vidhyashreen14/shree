import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { allowOnlyAlphabetsAndSpaces, allowOnlyNumbers } from "@/lib/validations";
import {
  LabIdInput,
  SearchMobileInput,
  SearchPatientNameInput,
} from "@/components/common/ValidatedInputs";
import {
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Search,
  X,
  CalendarDays,
  FileCheck2,
  Printer,
  Download,
  Building2,
  User,
  Activity,
  Phone,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { labOrders, patients, doctors } from "@/lib/mock/data";
import { format } from "date-fns";
import { StatusChip } from "@/components/common/StatusChip";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/lab/reports")({
  component: LabReports,
});

// ─── Filter Options ────────────────────────────────────────────────────────────
const BRANCH_OPTIONS = ["Select Branch", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar"];
const B2B_OPTIONS = [
  "Select B2B",
  "Apollo Hospitals",
  "Fortis Healthcare",
  "Manipal Group",
  "Narayana Health",
];
const TEST_FILTER_OPTIONS = [
  "Select Service",
  "CBC (Complete Blood Count)",
  "Lipid Panel",
  "HbA1c",
  "TSH",
  "Urinalysis",
  "Thyroid Profile",
  "Vitamin D",
  "Vitamin B12",
  "LFT",
  "KFT",
  "Urine R/M",
];

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

function getTestRows(testName: string) {
  return (
    TEST_DATA[testName] ?? [
      { parameter: testName, result: "Within normal limits", unit: "—", reference: "—" },
    ]
  );
}

const toneFor: Record<string, "info" | "primary" | "warning" | "success" | "danger" | "neutral"> = {
  ordered: "info",
  "sample-collected": "primary",
  "in-progress": "warning",
  completed: "success",
};

function LabReports() {
  // Layout toggles
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("list");
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Row 1 Filters
  const [branch, setBranch] = useState("Select Branch");
  const [date, setDate] = useState("");
  const [labId, setLabId] = useState("");
  const [specimenId, setSpecimenId] = useState("");
  const [mobile, setMobile] = useState("");

  // Row 2 Filters
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [b2b, setB2b] = useState("Select B2B");
  const [consultingDoctor, setConsultingDoctor] = useState("Select Consulting Doctor");
  const [testFilter, setTestFilter] = useState("Select Service");

  const [hasSearched, setHasSearched] = useState(false);

  // Action: Clear
  const handleClear = () => {
    setBranch("Select Branch");
    setDate("");
    setLabId("");
    setSpecimenId("");
    setMobile("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setB2b("Select B2B");
    setConsultingDoctor("Select Consulting Doctor");
    setTestFilter("Select Service");
    setHasSearched(false);
    toast.success("Filters cleared");
  };

  // Action: Search
  const handleSearch = () => {
    setHasSearched(true);
    toast.success("Searching for reports...");
  };

  // Filtered reports logic
  const filteredReports = useMemo(() => {
    return labOrders.filter((order) => {
      // Branch filter
      if (branch !== "Select Branch") {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p) return false;
        if (branch === "Koramangala" && !p.address.includes("Mumbai")) return false;
        if (branch === "Indiranagar" && !p.address.includes("Bengaluru")) return false;
      }
      // Lab ID filter
      if (labId.trim() && !order.id.toLowerCase().includes(labId.toLowerCase())) {
        return false;
      }
      // Specimen ID filter
      if (specimenId.trim() && !order.id.toLowerCase().includes(specimenId.toLowerCase())) {
        return false;
      }
      // Mobile filter
      if (mobile.trim()) {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p || !p.phone.includes(mobile.trim())) {
          return false;
        }
      }
      // Doctor filter
      if (consultingDoctor !== "Select Consulting Doctor") {
        const doc = doctors.find((d) => d.name === consultingDoctor);
        if (!doc || order.doctorId !== doc.id) {
          return false;
        }
      }
      // Test filter
      if (testFilter !== "Select Service") {
        const testName = testFilter.replace(" (Complete Blood Count)", "");
        const match = order.tests.some((t: string) =>
          t.toLowerCase().includes(testName.toLowerCase())
        );
        if (!match) return false;
      }
      return true;
    });
  }, [branch, labId, specimenId, mobile, consultingDoctor, testFilter]);

  const handlePrintReport = (report: any, p: any, doc: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print reports.");
      return;
    }

    const formattedDate = format(new Date(report.orderedOn), "dd-MMM-yyyy, p");

    const testRowsHtml = report.tests
      .map((t: string) => {
        const rows = getTestRows(t);
        return rows
          .map(
            (row) => `
        <tr>
          <td><span class="fw-600">${row.parameter}</span></td>
          <td style="${row.flag ? "color: #dc2626; font-weight: 700;" : ""}">${row.result} ${row.unit}</td>
          <td>${row.reference}</td>
        </tr>
      `
          )
          .join("");
      })
      .join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Report - ${report.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 40px; background: #fff; }
            .invoice-wrapper { max-width: 800px; margin: 0 auto; }
            .hospital-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .logo-area { display: flex; align-items: center; gap: 12px; }
            .logo-placeholder { background: transparent; color: inherit; font-size: 2rem; width: auto; height: auto; }
            .hospital-name { font-size: 1.7rem; color: #002b49; font-weight: 800; letter-spacing: -0.5px; }
            .hospital-detail { text-align: right; color: #334155; line-height: 1.6; font-size: 0.9rem; }
            .invoice-meta { display: flex; flex-wrap: wrap; justify-content: space-between; background: #f8fafc; padding: 16px 18px; border-radius: 14px; margin-bottom: 28px; }
            .meta-block { display: flex; flex-direction: column; }
            .meta-block .label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.3px; color: #4b5563; }
            .meta-block .value { font-weight: 600; font-size: 1rem; color: #0b1e2e; }
            .info-grid { display: flex; flex-wrap: wrap; gap: 24px 40px; margin-bottom: 30px; padding: 6px 0 12px; border-bottom: 1px solid #e2e8f0; }
            .info-item { flex: 1 0 180px; }
            .info-item .label { font-size: 0.7rem; text-transform: uppercase; color: #4b5563; letter-spacing: 0.2px; }
            .info-item .value { font-weight: 500; font-size: 1rem; margin-top: 3px; }
            .items-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 14px 0 20px; }
            .items-table th { text-align: left; background: #f1f5f9; padding: 10px 8px; font-weight: 600; color: #1e293b; border-bottom: 2px solid #cbd5e1; }
            .items-table td { padding: 10px 8px; border-bottom: 1px solid #e9edf2; vertical-align: middle; }
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
                  <div class="hospital-name">Palm Health</div>
                  <div style="font-size: 0.9rem; color: #475569;">Multispecialty Hospital</div>
                </div>
              </div>
              <div class="hospital-detail">
                <p>📍 12, Health Avenue, Metro City - 560001</p>
                <p>📞 +91 80 4123 4567 &nbsp;•&nbsp; ✉️ billing@palmhealth.in</p>
                <p style="font-weight: 700; color: #000; margin-top: 4px; font-size: 0.95rem;">GST: 22AABCP1234D1Z5</p>
              </div>
            </div>

            <!-- INVOICE META -->
            <div class="invoice-meta">
              <div class="meta-block">
                <span class="label">Lab ID</span>
                <span class="value">${report.id}</span>
              </div>
              <div class="meta-block">
                <span class="label">Report Date</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="meta-block">
                <span class="label">Status</span>
                <span class="value" style="text-transform: capitalize;">${report.status.replace("-", " ")}</span>
              </div>
            </div>

            <!-- PATIENT INFO -->
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Patient Name</div>
                <div class="value">${p?.name || "Unknown Patient"}</div>
              </div>
              <div class="info-item">
                <div class="label">Phone Number</div>
                <div class="value">${p?.phone || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="label">Consulting Doctor</div>
                <div class="value">${doc?.name || "Self Referral"}</div>
              </div>
            </div>

            <!-- ITEMS TABLE -->
            <h3 style="margin-top: 10px; margin-bottom: 15px; color: #0b1e2e;">Tests Conducted</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:50%;">Test Name</th>
                  <th style="width:25%;">Result</th>
                  <th style="width:25%;">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                ${testRowsHtml}
              </tbody>
            </table>
            
            <div style="margin-top: 40px; font-size: 0.85rem; color: #64748b; text-align: center;">
              This is a computer-generated report and does not require a physical signature.
            </div>
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

    toast.success("Report sent to printer.");
  };

  const handleDownloadReport = (report: any, p: any, doc: any) => {
    let csv = "Lab Report Details\n";
    csv += `Lab ID,${report.id}\n`;
    csv += `Patient Name,${p?.name || "Unknown Patient"}\n`;
    csv += `Phone,${p?.phone || "N/A"}\n`;
    csv += `Consulting Doctor,${doc?.name || "Self Referral"}\n`;
    csv += `Ordered On,${format(new Date(report.orderedOn), "dd-MMM-yyyy p")}\n`;
    csv += `Status,${report.status.replace("-", " ")}\n\n`;
    csv += "Parameter,Result,Unit,Reference Range\n";
    report.tests.forEach((t: string) => {
      const rows = getTestRows(t);
      rows.forEach((row) => {
        csv += `"${row.parameter}","${row.result}","${row.unit}","${row.reference}"\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lab_Report_${report.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Lab Report ${report.id} downloaded!`);
  };

  return (
    <div className="flex flex-col min-h-screen justify-between pb-4">
      <div className="space-y-4">
        {/* ─── Print-Only Header ───────────────────────────────────────────── */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-6 mt-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏥</div>
              <div>
                <div className="text-2xl font-extrabold text-[#002b49] tracking-tight">
                  Palm Health
                </div>
                <div className="text-sm text-slate-600">Multispecialty Hospital</div>
              </div>
            </div>
            <div className="text-right text-sm text-slate-700 leading-relaxed">
              <p>📍 12, Health Avenue, Metro City - 560001</p>
              <p>📞 +91 80 4123 4567 &nbsp;•&nbsp; ✉️ billing@palmhealth.in</p>
              <p className="font-bold text-black mt-1">GST: 22AABCP1234D1Z5</p>
            </div>
          </div>
          <h2 className="text-center text-xl font-bold mt-6 text-[#002b49]">
            Laboratory Reports Dashboard
          </h2>
        </div>

        {/* ─── Header & Top Controls ────────────────────────────────────────── */}
        <div className="print:hidden">
          <PageHeader
            eyebrow="Lab · Diagnostics"
            title="Report Dashboard"
            actions={
              <div className="flex items-center gap-2">
                {/* Grid/List Layout Toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
                  <button
                    onClick={() => setLayoutMode("list")}
                    className={`grid h-7 w-7 place-items-center rounded-md transition-all ${
                      layoutMode === "list"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    aria-label="List layout"
                    aria-pressed={layoutMode === "list"}
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode("grid")}
                    className={`grid h-7 w-7 place-items-center rounded-md transition-all ${
                      layoutMode === "grid"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    aria-label="Grid layout"
                    aria-pressed={layoutMode === "grid"}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                    showFilterPanel
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted"
                  }`}
                  aria-label="Toggle advanced search"
                  aria-pressed={showFilterPanel}
                >
                  <Filter className="h-4 w-4" />
                </button>

                {/* Dropdown Action Button */}
                <div className="relative group">
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    Actions
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <div className="absolute right-0 mt-1 hidden group-hover:block w-40 rounded-lg border border-border bg-popover py-1.5 shadow-md z-20 text-xs">
                    <button
                      onClick={() => toast.info("Exporting all visible reports")}
                      className="w-full text-left px-3 py-1.5 hover:bg-muted"
                    >
                      Export All
                    </button>
                    <button
                      onClick={() => toast.info("Printing selected reports")}
                      className="w-full text-left px-3 py-1.5 hover:bg-muted"
                    >
                      Print Selected
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </div>

        {/* ─── Advanced Search Filter Grid ──────────────────────────────────── */}
        {showFilterPanel && (
          <div className="surface-elevated p-5 space-y-4 print:hidden">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {/* Branch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Branch
                </label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {BRANCH_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </label>
                <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1.5" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              {/* Lab ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lab ID
                </label>
                <LabIdInput value={labId} onChange={setLabId} className="h-9 text-xs" />
              </div>

              {/* Specimen ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Specimen ID
                </label>
                <LabIdInput value={specimenId} onChange={setSpecimenId} className="h-9 text-xs" />
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mobile
                </label>
                <SearchMobileInput value={mobile} onChange={setMobile} className="h-9 text-xs" />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <SearchPatientNameInput
                  value={firstName}
                  onChange={setFirstName}
                  className="h-9 text-xs"
                  placeholder="First Name"
                />
              </div>

              {/* Middle Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Middle Name
                </label>
                <SearchPatientNameInput
                  value={middleName}
                  onChange={setMiddleName}
                  className="h-9 text-xs"
                  placeholder="Middle Name"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <SearchPatientNameInput
                  value={lastName}
                  onChange={setLastName}
                  className="h-9 text-xs"
                  placeholder="Last Name"
                />
              </div>

              {/* B2B Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  B2B Partner
                </label>
                <div className="relative">
                  <select
                    value={b2b}
                    onChange={(e) => setB2b(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {B2B_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Consulting Doctor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Consulting Doctor
                </label>
                <div className="relative">
                  <select
                    value={consultingDoctor}
                    onChange={(e) => setConsultingDoctor(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    <option value="Select Consulting Doctor">Select Consulting Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Add Test */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Add Test
                </label>
                <div className="relative">
                  <select
                    value={testFilter}
                    onChange={(e) => setTestFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {TEST_FILTER_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Panel Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button size="sm" onClick={handleSearch} className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                Search
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* ─── Main Results Display ────────────────────────────────────────── */}
        {hasSearched &&
          (filteredReports.length === 0 ? (
            <div className="surface-elevated p-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
              <FileCheck2 className="h-10 w-10 opacity-30" />
              <p className="font-medium">No reports match your current filter query</p>
              <Button size="sm" variant="outline" onClick={handleClear}>
                Reset Filters
              </Button>
            </div>
          ) : layoutMode === "list" ? (
            /* List/Table view */
            <div className="surface-elevated overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Lab ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Patient Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Tests
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Ordered On
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground print:hidden">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReports.map((report) => {
                    const p = patients.find((pat) => pat.id === report.patientId);
                    return (
                      <tr key={report.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                          {report.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-sm">
                          {p?.name || "Unknown Patient"}
                        </td>
                        <td className="px-4 py-3 text-xs">{report.tests.join(", ")}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {format(new Date(report.orderedOn), "dd-MMM-yyyy, p")}
                        </td>
                        <td className="px-4 py-3">
                          <StatusChip tone={toneFor[report.status] || "neutral"}>
                            {report.status.replace("-", " ")}
                          </StatusChip>
                        </td>
                        <td className="px-4 py-3 print:hidden">
                          {report.status === "completed" ? (
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Print Report"
                                onClick={() =>
                                  handlePrintReport(
                                    report,
                                    p,
                                    doctors.find((d) => d.id === report.doctorId)
                                  )
                                }
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Download CSV"
                                onClick={() =>
                                  handleDownloadReport(
                                    report,
                                    p,
                                    doctors.find((d) => d.id === report.doctorId)
                                  )
                                }
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="text-xs text-muted-foreground block text-center"
                              title="Available when completed"
                            >
                              -
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => {
                const p = patients.find((pat) => pat.id === report.patientId);
                const doc = doctors.find((d) => d.id === report.doctorId);
                return (
                  <div
                    key={report.id}
                    className="surface-elevated p-4 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <code className="font-mono text-xs font-bold text-primary">
                          {report.id}
                        </code>
                        <StatusChip tone={toneFor[report.status] || "neutral"}>
                          {report.status.replace("-", " ")}
                        </StatusChip>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {p?.name || "Unknown Patient"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Activity className="h-3.5 w-3.5" />
                          <span>{report.tests.join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{p?.phone || "No Mobile"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Ref: {doc?.name || "Self"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-2.5">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(report.orderedOn), "dd-MMM-yyyy")}
                      </span>
                      <div className="flex gap-1.5 print:hidden">
                        {report.status === "completed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => handlePrintReport(report, p, doc)}
                            >
                              <Printer className="mr-1 h-3 w-3" /> Print
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs"
                              onClick={() => handleDownloadReport(report, p, doc)}
                            >
                              <Download className="mr-1 h-3 w-3" /> CSV
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>

      {/* ─── Footer Attribution ───────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        <p>Copyright &copy; 2026 Sufalam, All rights reserved.</p>
      </footer>
    </div>
  );
}
