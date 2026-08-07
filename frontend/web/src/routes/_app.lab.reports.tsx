import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateReportModal } from "@/components/lab/GenerateReportModal";
import { jsPDF } from "jspdf";
import {
  LabIdInput,
  SearchMobileInput,
  SearchPatientNameInput,
} from "@/components/common/ValidatedInputs";
import {
  LayoutGrid,
  List,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Filter,
  ChevronDown,
  Search,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  X,
  CalendarDays,
  FileCheck2,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Printer,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Download,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Building2,
  User,
  Activity,
  Phone,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { labOrders, patients, doctors, SUPER_ADMIN_CONFIG } from "@/lib/mock/data";
import { getSuperAdminReportConfig } from "@/lib/services/superAdmin";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { StatusChip } from "@/components/common/StatusChip";
import { toast } from "sonner";

export const Route = createFileRoute('/_app/lab/reports')({
  component: LabReports,
});

// ─── Filter Options ────────────────────────────────────────────────────────────
const BRANCH_OPTIONS = ["Select Branch", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar"];
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
  const { data: fetchedConfig } = useQuery({
    queryKey: ["reportConfig"],
    queryFn: () => getSuperAdminReportConfig(false),
  });
  const config = fetchedConfig || SUPER_ADMIN_CONFIG;

  const [activeTab, setActiveTab] = useState("action-needed");
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  // Layout toggles
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("list");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Filters
  const [branch, setBranch] = useState("Select Branch");
  const [date, setDate] = useState("");
  const [labId, setLabId] = useState("");
  const [mobile, setMobile] = useState("");
  const [patientName, setPatientName] = useState("");
  const [consultingDoctor, setConsultingDoctor] = useState("Select Consulting Doctor");

  const [hasSearched, setHasSearched] = useState(false);

  // Action: Clear
  const handleClear = () => {
    setBranch("Select Branch");
    setDate("");
    setLabId("");
    setMobile("");
    setPatientName("");
    setConsultingDoctor("Select Consulting Doctor");
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
    let list = labOrders;
    
    if (activeTab === "action-needed") {
      list = list.filter((order) => order.status === "sample-collected" && !generated.has(order.id));
    }

    return list.filter((order) => {
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
      // Mobile filter
      if (mobile.trim()) {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p || !p.phone.includes(mobile.trim())) {
          return false;
        }
      }
      // Patient Name filter
      if (patientName.trim()) {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p || !p.name.toLowerCase().includes(patientName.trim().toLowerCase())) {
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
      return true;
    });
  }, [branch, labId, mobile, patientName, consultingDoctor]);

   
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const handlePrintReport = (report: any, p: any, doc: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print reports.");
      return;
    }


    const formattedDate = format(new Date(report.orderedOn), "dd-MMM-yyyy");
    const formattedTime = format(new Date(report.orderedOn), "h:mm a");

    const PDF_REMARKS: Record<string, string> = {
      "HbA1c": "A person's blood glucose levels normally move up and down depending on meals, Exercise, sickness, and stress.",
      "Lipid Panel": "Monitor treatment of gout,chemotherapeutic treatment of neoplasms to avoid renal urate deposition.\nFoods high in purines that can contribute to gout include caffeine-containing beverages, legumes, mushrooms, organ meats, spinach, gravies, and bakers and brewers yeast.",
      "Thyroid Profile": "Age specific reference intervals for Free T4 from TIETZ Textbook of CLINICAL CHEMISTRY & MOLECULAR DIAGNOSTICS- 5th Edition. Pregnancy Reference Ranges : First Trimester : 0.81 - 1.90, Second & third Trimester :: 1.00 - 2.60",
    };

    const testRowsHtml = report.tests
      .map((t: string) => {
        const rows = getTestRows(t);
        const remark = PDF_REMARKS[t];
        
        let sectionHtml = `
          <tr>
            <td colspan="4" class="section-header">${t.toUpperCase()}</td>
          </tr>
        `;
        
        rows.forEach((row) => {
           const methodTxt = "Method : Automated cell counter"; // Mock method to match PDF
           sectionHtml += `
             <tr class="test-row">
               <td class="col-test">
                 <div class="test-name">${row.parameter}</div>
                 <div class="test-method">${methodTxt}</div>
               </td>
               <td class="col-result">
                 ${row.result} ${row.flag ? '<span class="abnormal">*</span>' : ''}
               </td>
               <td class="col-unit">${row.unit !== "—" ? row.unit : ""}</td>
               <td class="col-ref">${row.reference !== "—" ? row.reference : ""}</td>
             </tr>
           `;
        });
        
        if (remark) {
          sectionHtml += `
            <tr>
              <td colspan="4">
                <div class="interpretation-box">
                  ${remark.replace(/\n/g, '<br/>')}
                </div>
              </td>
            </tr>
          `;
        }
        
        return sectionHtml;
      })
      .join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lab Report - ${report.id}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
              font-family: Arial, sans-serif; 
              color: #000; 
              line-height: 1.4; 
              margin: 0; 
              padding: 0; 
              background: #fff; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-wrapper { max-width: 210mm; margin: 0 auto; position: relative; min-height: 250mm; }
            
            /* HEADER */
            .hospital-header { 
              text-align: center; 
              margin-bottom: 10px; 
            }
            .hospital-name { 
              font-size: 24px; 
              font-weight: bold; 
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .hospital-detail { 
              font-size: 13px; 
              margin-top: 5px;
              font-weight: bold;
            }
            .hospital-phone {
              font-size: 13px;
              font-weight: bold;
              margin-top: 2px;
            }

            /* META GRID */
            .meta-section {
              border-top: 1px solid #000;
              border-bottom: 2px solid #000;
              padding: 10px 0;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 10px;
            }
            .meta-col { display: flex; flex-direction: column; gap: 8px; }
            .meta-row { display: flex; }
            .meta-label { width: 90px; }
            .meta-value { font-weight: bold; }
            
            /* BARCODE */
            .barcode {
              font-family: 'Courier New', monospace;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: -2px;
              line-height: 1;
              align-self: flex-start;
              margin-top: 2px;
            }

            /* TITLE */
            .report-title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 15px 0;
            }

            /* TABLE */
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              font-size: 13px; 
            }
            .items-table th { 
              text-align: left; 
              background-color: #d1d5db !important;
              padding: 6px 4px; 
              font-weight: bold; 
            }
            .items-table td { 
              padding: 6px 4px; 
              vertical-align: top;
            }
            .section-header {
              font-weight: bold;
              font-size: 15px;
              padding-top: 15px !important;
              padding-bottom: 5px !important;
              text-transform: uppercase;
            }
            .test-row {
              page-break-inside: avoid;
            }
            
            /* COLUMNS */
            .col-test { width: 45%; }
            .col-result { width: 20%; font-weight: bold; text-align: center;}
            .col-unit { width: 15%; text-align: center;}
            .col-ref { width: 20%; text-align: center;}

            .test-name { font-size: 14px; }
            .test-method { font-size: 10px; font-style: italic; margin-top: 2px; }
            .abnormal { font-size: 16px; margin-left: 2px; }

            /* INTERPRETATION BOX */
            .interpretation-box {
              border: 1px solid #000;
              padding: 4px 6px;
              font-size: 11px;
              margin-top: 4px;
              margin-bottom: 10px;
              page-break-inside: avoid;
            }

            /* FOOTER */
            .footer {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              font-size: 14px;
              font-weight: bold;
              margin-top: 30px;
            }
            .end-of-report {
              text-align: center;
              width: 100%;
              font-size: 13px;
              font-weight: bold;
              margin-top: 50px;
              margin-bottom: 20px;
            }
            .signature {
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- HEADER -->
            <div class="hospital-header">
              <div class="hospital-name">${config.hospitalName}</div>
              <div class="hospital-detail">${config.address}</div>
              <div class="hospital-phone">PH NO : ${config.phone}</div>
            </div>

            <!-- META SECTION -->
            <div class="meta-section">
              <div class="meta-col">
                <div class="meta-row">
                  <span class="meta-label">Report No</span>
                  <span class="meta-value">: ${report.id.toUpperCase()}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Name</span>
                  <span class="meta-value">: ${p?.name || "Unknown"}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Refered By</span>
                  <span class="meta-value">: ${doc?.name || "Self"}</span>
                </div>
              </div>

              <div class="barcode">|||||||||||||||||||||</div>

              <div class="meta-col">
                <div class="meta-row">
                  <span class="meta-label" style="width:70px;">Bill Date</span>
                  <span class="meta-value">: ${formattedDate} &nbsp;&nbsp;&nbsp; ${formattedTime}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label" style="width:70px;">Age / Sex</span>
                  <span class="meta-value">: ${p?.age || "N/A"}Years / ${p?.gender || "Unknown"}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label" style="width:70px;">Rep Date</span>
                  <span class="meta-value">: ${formattedDate} &nbsp;&nbsp;&nbsp; ${formattedTime}</span>
                </div>
              </div>
            </div>

            <!-- TITLE -->
            <div class="report-title">${config.reportHeader}</div>

            <!-- ITEMS TABLE -->
            <table class="items-table">
              <thead>
                <tr>
                  <th class="col-test" style="text-align: left;">Test Name</th>
                  <th class="col-result" style="text-align: center;">Result</th>
                  <th class="col-unit" style="text-align: center;">Unit</th>
                  <th class="col-ref" style="text-align: center;">Reference Range</th>
                </tr>
              </thead>
              <tbody>
                ${testRowsHtml}
              </tbody>
            </table>
            
            <div class="end-of-report">
              ---------------------- ${config.reportFooter} ----------------------
            </div>

            <div class="footer">
              <div class="signature">
                ${config.authorizedSignatory}
              </div>
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

   
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  const handleDownloadReport = (report: any, p: any, docInfo: any) => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text(config.reportHeader, 105, y, { align: "center" });
    y += 10;
    
    doc.setFontSize(14);
    doc.text(config.hospitalName, 105, y, { align: "center" });
    y += 6;
    doc.setFontSize(10);
    doc.text(`${config.address} | ${config.phone} | ${config.email}`, 105, y, { align: "center" });
    y += 15;
    
    doc.setFontSize(12);
    doc.text(`Lab ID: ${report.id}`, 14, y);
    doc.text(`Patient: ${p?.name || "Unknown Patient"}`, 105, y);
    y += 8;
    
    doc.text(`Phone: ${p?.phone || "N/A"}`, 14, y);
    doc.text(`Consulting Doctor: ${docInfo?.name || "Self Referral"}`, 105, y);
    y += 8;
    
    doc.text(`Ordered On: ${format(new Date(report.orderedOn), "dd-MMM-yyyy p")}`, 14, y);
    doc.text(`Status: ${report.status.replace("-", " ").toUpperCase()}`, 105, y);
    y += 15;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Parameter", 14, y);
    doc.text("Result", 80, y);
    doc.text("Unit", 130, y);
    doc.text("Reference Range", 160, y);
    doc.setFont("helvetica", "normal");
    y += 8;
    
    report.tests.forEach((t: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(t, 14, y);
      doc.setFont("helvetica", "normal");
      y += 8;
      
      const rows = getTestRows(t);
      rows.forEach((row) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(row.parameter, 14, y);
        doc.text(row.result, 80, y);
        doc.text(row.unit, 130, y);
        doc.text(row.reference, 160, y);
        y += 6;
      });
      y += 4;
    });

    y += 15;
    doc.setFontSize(10);
    doc.text(`---------------------- ${config.reportFooter} ----------------------`, 105, y, { align: "center" });
    y += 15;
    doc.text(config.authorizedSignatory, 180, y, { align: "right" });

    doc.save(`Lab_Report_${report.id}.pdf`);
    toast.success(`Lab Report ${report.id} downloaded as PDF!`);
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
                  {config.hospitalName}
                </div>
                <div className="text-sm text-slate-600">{config.accreditation}</div>
              </div>
            </div>
            <div className="text-right text-sm text-slate-700 leading-relaxed">
              <p>📍 {config.address}</p>
              <p>📞 {config.phone} &nbsp;•&nbsp; ✉️ {config.email}</p>
              <p className="font-bold text-black mt-1">Website: {config.website}</p>
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
              </div>
            }
          />
        </div>
          
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="mb-4">
              <TabsTrigger value="action-needed">Action Needed</TabsTrigger>
              <TabsTrigger value="all-reports">All Reports</TabsTrigger>
            </TabsList>

        {/* ─── Advanced Search Filter Grid ──────────────────────────────────── */}
        {showFilterPanel && (
          <div className="surface-elevated p-5 space-y-4 print:hidden">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

              {/* Mobile Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mobile Number
                </label>
                <SearchMobileInput
                  value={mobile}
                  onChange={setMobile}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all h-9"
                  placeholder="Enter 10-digit mobile"
                />
              </div>

              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Name
                </label>
                <SearchPatientNameInput
                  value={patientName}
                  onChange={setPatientName}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all h-9"
                  placeholder="Patient Name"
                />
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
        {hasSearched && (
          <div className="mt-4">
          {filteredReports.length === 0 ? (
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReports.map((report) => {
                    const p = patients.find((pat) => pat.id === report.patientId);
                    const doc = doctors.find((d) => d.id === report.doctorId);
                    const isDone = generated.has(report.id) || report.status === "completed";
                    const isCollected = report.status === "sample-collected" && !isDone;

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
                          <StatusChip tone={isDone ? "success" : toneFor[report.status] || "neutral"}>
                            {isDone ? "Completed" : report.status.replace("-", " ")}
                          </StatusChip>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isCollected ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" onClick={() => setReportOrderId(report.id)}>
                                Generate
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 opacity-60"
                                onClick={() => handleDownloadReport(report, p, doc)}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-teal-600 hover:text-teal-700 opacity-60"
                                onClick={() => handlePrintReport(report, p, doc)}
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : isDone ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                onClick={() => handleDownloadReport(report, p, doc)}
                                title="Download PDF"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 text-teal-600 hover:text-teal-700"
                                onClick={() => handlePrintReport(report, p, doc)}
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : null}
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
                const isDone = generated.has(report.id) || report.status === "completed";
                const isCollected = report.status === "sample-collected" && !isDone;
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
                        <StatusChip tone={isDone ? "success" : toneFor[report.status] || "neutral"}>
                          {isDone ? "Completed" : report.status.replace("-", " ")}
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
                      <div className="flex gap-2">
                        {isCollected ? (
                          <>
                            <Button size="sm" onClick={() => setReportOrderId(report.id)}>
                              Generate
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 opacity-60"
                              onClick={() => handleDownloadReport(report, p, doc)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-teal-600 hover:text-teal-700 opacity-60"
                              onClick={() => handlePrintReport(report, p, doc)}
                              title="Print"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </>
                        ) : isDone ? (
                          <>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                              onClick={() => handleDownloadReport(report, p, doc)}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 text-teal-600 hover:text-teal-700"
                              onClick={() => handlePrintReport(report, p, doc)}
                              title="Print"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        )}
        </Tabs>
      </div>

      {/* ─── Footer Attribution ───────────────────────────────────────────── */}
      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        <p>Copyright &copy; 2026 Sufalam, All rights reserved.</p>
      </footer>

      <GenerateReportModal 
        orderId={reportOrderId} 
        open={!!reportOrderId} 
        onOpenChange={(o) => { if (!o) setReportOrderId(null); }} 
        onGenerated={() => {
          if (reportOrderId) {
            setGenerated((prev) => new Set(prev).add(reportOrderId));
            setReportOrderId(null);
          }
        }} 
      />
    </div>
  );
}
