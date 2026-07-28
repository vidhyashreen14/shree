import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePatients } from "@/lib/store/patients";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { useClinicalStore } from "@/lib/store/clinical";
import { useAuth } from "@/lib/store/auth";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { doctors, vitals, appointments } from "@/lib/mock/data";
import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Pill,
  FlaskConical,
  ClipboardPlus,
  HeartPulse,
  FileText,
  Activity,
  Calendar,
  Printer,
  Download,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Send,
  MessageSquare,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import type { Prescription, LabOrder, NurseVitals } from "@/lib/types";

export const Route = createFileRoute("/_app/doctor/patients/$id")({
  loader: ({ params }): { patient: import("@/lib/types").Patient } => {
    const patient = usePatients.getState().patients.find((p) => p.id === params.id);
    if (!patient) throw notFound();
    return { patient };
  },
  component: PatientProfile,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Patient not found.{" "}
      <Link to="/doctor/patients" className="text-primary underline">
        Back to list
      </Link>
    </div>
  ),
});

export const doctorCredentials: Record<string, { qualification: string; kmc: string }> = {
  "u-doc-1": { qualification: "MD, DM (Cardiology)", kmc: "KMC-12345" },
  "u-doc-2": { qualification: "MD, DNB (Neurology)", kmc: "KMC-23456" },
  "u-doc-3": { qualification: "MD, DCH (Pediatrics)", kmc: "KMC-34567" },
  "u-doc-4": { qualification: "MS, MCh (Orthopedics)", kmc: "KMC-45678" },
  "u-doc-5": { qualification: "MD, DGO (OB-GYN)", kmc: "KMC-56789" },
  "u-doc-6": { qualification: "MD, DVD (Dermatology)", kmc: "KMC-67890" },
  "u-doc-7": { qualification: "MBBS, MD (Emergency)", kmc: "KMC-78901" },
};

// ─── Prescription Print Pad Modal ─────────────────────────────────────────────

export interface PrescriptionPrintData {
  rxNo: string;
  date: string;
  patientName: string;
  uhid: string;
  age: number;
  gender: string;
  doctorName: string;
  specialization: string;
  qualification: string;
  kmcNo: string;
  vitals?: NurseVitals;
  diagnosis: string;
  medicines: { name: string; dose: string; frequency: string; duration: string; notes?: string }[];
  labTests: string[];
  followUp?: string;
  patientPhone: string;
  patientEmail: string;
}

export function PrescriptionPrintModal({
  data,
  onClose,
}: {
  data: PrescriptionPrintData;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const { logoUrl, name, phone, email, address } = useHospitalSettings();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }
    win.document.write(`
      <html>
        <head>
          <title>Prescription — ${data.rxNo}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; line-height: 1.4; }
            .pad { max-width: 750px; margin: 0 auto; padding: 32px; border: 1px solid #eee; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; align-items: center; }
            .hospital-info { display: flex; gap: 12px; align-items: center; }
            .hospital-info h2 { font-size: 20px; font-weight: 800; color: #0d9488; margin-bottom: 2px; }
            .hospital-info p { font-size: 11px; color: #555; }
            .doctor-info { text-align: right; }
            .doctor-info h3 { font-size: 15px; font-weight: 700; color: #111; }
            .doctor-info p { font-size: 11px; color: #555; margin-bottom: 1px; }
            .patient-bar { display: grid; grid-cols: 1fr; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; }
            .patient-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .patient-grid div { margin-bottom: 2px; }
            .vitals-bar { display: flex; gap: 16px; flex-wrap: wrap; background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 6px; padding: 8px 12px; margin-bottom: 16px; font-size: 11px; }
            .vitals-bar span { font-weight: 500; }
            .rx-symbol { font-size: 24px; font-weight: 700; color: #0d9488; margin: 12px 0 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            th { border-bottom: 2px solid #e2e8f0; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 6px; text-align: left; }
            td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
            .follow-up-bar { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 10px; margin-top: 16px; font-size: 12px; }
            .footer { margin-top: 48px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px dashed #e2e8f0; padding-top: 16px; font-size: 11px; color: #666; }
            .signature { text-align: right; }
            .sig-line { width: 150px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <div class="pad">${content}</div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const generatePDFBlob = (): Blob => {
    const doc = new jsPDF();

    // Hospital Title block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(13, 148, 136); // #0d9488
    doc.text(name, 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(address, 20, 26);
    doc.text(`Phone: ${phone} | ${email}`, 20, 31);

    // Doctor block
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(data.doctorName, 190, 20, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(data.specialization, 190, 26, { align: "right" });
    doc.text(data.qualification, 190, 31, { align: "right" });
    doc.text(`KMC No: ${data.kmcNo}`, 190, 36, { align: "right" });

    // Divider
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(1);
    doc.line(20, 42, 190, 42);

    // Patient Details
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 48, 170, 26, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(20, 48, 170, 26, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(`Patient: ${data.patientName}`, 25, 54);
    doc.text(`UHID: ${data.uhid}`, 110, 54);
    doc.text(`Age/Gender: ${data.age}y / ${data.gender}`, 25, 60);
    doc.text(`Date: ${data.date}`, 110, 60);
    doc.text(`Phone: ${data.patientPhone}`, 25, 66);
    doc.text(`Email: ${data.patientEmail}`, 110, 66);

    let currentY = 82;
    // Triage Vitals
    if (data.vitals) {
      doc.setFillColor(240, 253, 250);
      doc.rect(20, 78, 170, 14, "F");
      doc.setDrawColor(204, 251, 241);
      doc.rect(20, 78, 170, 14, "S");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(13, 148, 136);
      doc.setFontSize(8);
      doc.text("TRIAGE VITALS", 25, 83);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 118, 110);
      doc.setFontSize(9);
      const vitalsText = `BP: ${data.vitals.bp}   Pulse: ${data.vitals.pulse} bpm   Temp: ${data.vitals.tempF}°F   Weight: ${data.vitals.weight} kg   SpO2: ${data.vitals.spo2}%`;
      doc.text(vitalsText, 25, 88);
      currentY = 98;
    }

    // Clinical Findings
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);

    if (data.vitals?.chiefComplaint) {
      doc.text("Chief Complaint:", 20, currentY);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(71, 85, 105);
      doc.text(`"${data.vitals.chiefComplaint}"`, 52, currentY);
      currentY += 8;
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text("Diagnosis:", 20, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(17, 24, 39);
    doc.text(data.diagnosis, 42, currentY);
    currentY += 14;

    // Rx symbol
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(13, 148, 136);
    doc.text("Rx", 20, currentY);
    currentY += 6;

    // Medicines list
    doc.setFontSize(9);
    doc.setTextColor(13, 148, 136);
    doc.text("Medicine Name", 20, currentY);
    doc.text("Dose", 100, currentY);
    doc.text("Frequency", 130, currentY);
    doc.text("Duration", 160, currentY);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(20, currentY + 2, 190, currentY + 2);
    currentY += 8;

    doc.setTextColor(17, 24, 39);
    data.medicines.forEach((m, idx) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${m.name}`, 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(m.dose, 100, currentY);
      doc.text(m.frequency, 130, currentY);
      doc.text(m.duration, 160, currentY);

      if (m.notes) {
        currentY += 4.5;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`   * Notes: ${m.notes}`, 20, currentY);
        doc.setFontSize(9);
        doc.setTextColor(17, 24, 39);
      }
      currentY += 7.5;
    });

    // Investigations
    if (data.labTests && data.labTests.length > 0) {
      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Recommended Lab / Radiology Investigations:", 20, currentY);
      doc.setFont("helvetica", "normal");
      data.labTests.forEach((test) => {
        currentY += 6;
        doc.text(`- ${test}`, 25, currentY);
      });
    }

    // Follow up date
    if (data.followUp) {
      currentY += 10;
      doc.setFillColor(255, 251, 235);
      doc.rect(20, currentY, 170, 10, "F");
      doc.setDrawColor(254, 243, 199);
      doc.rect(20, currentY, 170, 10, "S");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 83, 9);
      doc.setFontSize(9);
      doc.text(
        `📅 Follow-up: Please consult again on or before ${data.followUp}`,
        25,
        currentY + 6.5
      );
    }

    // Signature
    currentY = 250;
    doc.setDrawColor(148, 163, 184);
    doc.line(140, currentY, 190, currentY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(data.doctorName, 140, currentY + 4.5);
    doc.setFont("helvetica", "normal");
    doc.text("Authorized Signatory", 140, currentY + 8.5);

    return doc.output("blob");
  };

  const handleSharePDF = async (method: "whatsapp" | "email" | "sms" | "generic") => {
    try {
      const blob = generatePDFBlob();
      const fileName = `Rx_${data.uhid}_Prescription.pdf`;
      const file = new File([blob], fileName, { type: "application/pdf" });

      // 1. Check if browser supports direct file sharing (e.g. mobile/modern web share)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${name} Prescription - ${data.patientName}`,
          text: `Prescription PDF for ${data.patientName} (${data.uhid}) from ${name}.`,
        });
        toast.success("Prescription PDF sent successfully via system share!");
        return;
      }

      // 2. Otherwise download PDF first and then open native dispatch URLs
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (method === "whatsapp") {
        const phoneNum = data.patientPhone.replace(/\D/g, "");
        const medsText = data.medicines
          .map((m, i) => `${i + 1}. ${m.name} (${m.dose}) - ${m.frequency} for ${m.duration}`)
          .join("\n");
        const msg = encodeURIComponent(
          `*${name} — Rx Prescription*\n\nDoctor: ${data.doctorName}\nPatient: ${data.patientName} (${data.uhid})\nDiagnosis: ${data.diagnosis}\n\n*Medicines Prescribed:*\n${medsText}\n\n${data.followUp ? `*Follow-up Date:* ${data.followUp}\n` : ""}\nThank you for choosing ${name}! (Prescription PDF downloaded to your device)`
        );
        window.open(`https://wa.me/${phoneNum}?text=${msg}`, "_blank");
        toast.success("Prescription PDF Downloaded! WhatsApp chat opened to send notification.", {
          duration: 6000,
        });
      } else if (method === "email") {
        const subject = encodeURIComponent(`Prescription PDF — ${data.rxNo} — ${data.patientName}`);
        const body = encodeURIComponent(
          `Dear ${data.patientName},\n\nYour prescription PDF has been downloaded to your device. Please find it attached.\n\nDoctor: ${data.doctorName} (${data.specialization})\nDate: ${data.date}\nDiagnosis: ${data.diagnosis}\n\n${name}`
        );
        window.location.href = `mailto:${data.patientEmail}?subject=${subject}&body=${body}`;
        toast.success(
          "Prescription PDF Downloaded! Email client opened. Please attach the downloaded PDF file.",
          { duration: 6000 }
        );
      } else if (method === "sms") {
        toast.info(
          "Prescription PDF Downloaded! Please send/attach it to the patient via SMS gateway.",
          { duration: 5000 }
        );
      }
    } catch (err) {
      console.error("Failed to share PDF: ", err);
      toast.error("Failed to compile or share PDF.");
    }
  };

  const handleWhatsApp = () => handleSharePDF("whatsapp");
  const handleEmail = () => handleSharePDF("email");
  const handleSMS = () => handleSharePDF("sms");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-background shadow-2xl flex flex-col max-h-[90vh]">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <h2 className="font-display font-bold">Prescription Pad — {data.rxNo}</h2>
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
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print Pad
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Prescription View */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-900/10">
          <div
            ref={printRef}
            className="bg-background p-8 border rounded-xl shadow-sm text-foreground"
          >
            {/* Header */}
            <div
              className="header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid #0d9488",
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <div
                className="hospital-info"
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ maxHeight: 50, maxWidth: 80, objectFit: "contain" }}
                  />
                ) : (
                  <span style={{ fontSize: 28 }}>🏥</span>
                )}
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0d9488", marginBottom: 2 }}>
                    {name}
                  </h2>
                  <p style={{ fontSize: 11, color: "#555" }}>{address}</p>
                  <p style={{ fontSize: 11, color: "#555" }}>
                    Phone: {phone} · {email}
                  </p>
                </div>
              </div>
              <div className="doctor-info" style={{ textAlign: "right" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{data.doctorName}</h3>
                <p style={{ fontSize: 11, color: "#555" }}>{data.specialization}</p>
                <p style={{ fontSize: 11, color: "#555" }}>{data.qualification}</p>
                <p style={{ fontSize: 11, color: "#555" }}>
                  <strong>KMC No:</strong> {data.kmcNo}
                </p>
              </div>
            </div>

            {/* Patient bar */}
            <div
              className="patient-bar"
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 12,
              }}
            >
              <div
                className="patient-grid"
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}
              >
                <div>
                  <strong>Patient Name:</strong> {data.patientName}
                </div>
                <div>
                  <strong>Age / Gender:</strong> {data.age}y / {data.gender}
                </div>
                <div>
                  <strong>UHID:</strong> {data.uhid}
                </div>
                <div>
                  <strong>Date:</strong> {data.date}
                </div>
              </div>
            </div>

            {/* Vitals */}
            {data.vitals && (
              <div
                className="vitals-bar"
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  background: "#f0fdfa",
                  border: "1px solid #ccfbf1",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginBottom: 16,
                  fontSize: 11,
                }}
              >
                <span>
                  <strong>BP:</strong> {data.vitals.bp} mmHg
                </span>
                <span>
                  <strong>Pulse:</strong> {data.vitals.pulse} bpm
                </span>
                <span>
                  <strong>Temp:</strong> {data.vitals.tempF}°F
                </span>
                <span>
                  <strong>Weight:</strong> {data.vitals.weight} kg
                </span>
                <span>
                  <strong>SpO₂:</strong> {data.vitals.spo2}%
                </span>
                {data.vitals.sugar && (
                  <span>
                    <strong>Sugar:</strong> {data.vitals.sugar} mg/dL
                  </span>
                )}
              </div>
            )}

            {/* Chief Complaint */}
            {data.vitals?.chiefComplaint && (
              <div style={{ marginBottom: 12, fontSize: 12 }}>
                <strong>Chief Complaint:</strong>{" "}
                <span style={{ fontStyle: "italic" }}>"{data.vitals.chiefComplaint}"</span>
              </div>
            )}

            {/* Diagnosis */}
            <div style={{ marginBottom: 16, fontSize: 12 }}>
              <strong>Diagnosis:</strong>{" "}
              <span style={{ textDecoration: "underline", fontWeight: 600 }}>{data.diagnosis}</span>
            </div>

            {/* Rx Symbol */}
            <div
              className="rx-symbol"
              style={{ fontSize: 24, fontWeight: 700, color: "#0d9488", margin: "12px 0 6px" }}
            >
              Rₓ
            </div>

            {/* Treatment list */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 6px",
                      textAlign: "left",
                    }}
                  >
                    Medicine Name
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 6px",
                      textAlign: "left",
                    }}
                  >
                    Dose
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 6px",
                      textAlign: "left",
                    }}
                  >
                    Frequency
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #e2e8f0",
                      color: "#0d9488",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      padding: "8px 6px",
                      textAlign: "left",
                    }}
                  >
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.medicines.map((med, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {med.name}
                      {med.notes && (
                        <div style={{ fontSize: 10, color: "#666", fontWeight: "normal" }}>
                          {med.notes}
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      {med.dose}
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      {med.frequency}
                    </td>
                    <td
                      style={{
                        padding: "8px 6px",
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: 12,
                      }}
                    >
                      {med.duration}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Lab tests */}
            {data.labTests.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12 }}>
                <strong>Recommended Investigations (Lab/Radiology):</strong>
                <ul style={{ listStyleType: "square", paddingLeft: 20, marginTop: 4 }}>
                  {data.labTests.map((test, index) => (
                    <li key={index}>{test}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Follow-up date */}
            {data.followUp && (
              <div
                className="follow-up-bar"
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: 6,
                  padding: 10,
                  marginTop: 16,
                  fontSize: 12,
                }}
              >
                📅 <strong>Follow-up Consultation:</strong> Please return for a review on or before{" "}
                <strong>{data.followUp}</strong>.
              </div>
            )}

            {/* Footer */}
            <div
              className="footer"
              style={{
                marginTop: 48,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderTop: "1px dashed #e2e8f0",
                paddingTop: 16,
                fontSize: 11,
                color: "#666",
              }}
            >
              <div>
                <em>Please keep this prescription safe for future reference.</em>
              </div>
              <div className="signature" style={{ textAlign: "right" }}>
                <div
                  className="sig-line"
                  style={{ width: 150, borderBottom: "1px solid #94a3b8", marginBottom: 4 }}
                ></div>
                <strong>{data.doctorName}</strong>
                <div>Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PatientProfile() {
  const { patient } = Route.useLoaderData();
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);

  // Stores
  const queue = useNurseQueue((s) => s.queue);
  const markConsultStatus = useNurseQueue((s) => s.markConsultStatus);
  const { prescriptions, labOrders, addPrescription, addLabOrder } = useClinicalStore();

  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const currentDoctor = doctors.find((d) => d.id === doctorId);

  // Active nurse queue entry
  const activeConsult = queue.find(
    (entry) =>
      entry.patientId === patient.id &&
      entry.vitalsStatus === "done" &&
      entry.consultStatus !== "completed" &&
      entry.consultStatus !== "cancelled"
  );

  // Local consult panel toggle
  const [showConsultPanel, setShowConsultPanel] = useState(!!activeConsult);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [printData, setPrintData] = useState<PrescriptionPrintData | null>(null);

  // Diagnosis, Prescription and Labs forms
  const [diagnosis, setDiagnosis] = useState("");
  const [medsList, setMedsList] = useState<
    { name: string; dose: string; frequency: string; duration: string; notes: string }[]
  >([{ name: "", dose: "1 tab", frequency: "1-0-1", duration: "5 days", notes: "After food" }]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState("");

  const myRx = prescriptions.filter((r) => r.patientId === patient.id);
  const myLabs = labOrders.filter((l) => l.patientId === patient.id);

  // Extract vitals list dynamically (mock + live)
  const [myVitals, setMyVitals] = useState<any[]>([]);

  useEffect(() => {
    // Combine static mock vitals with live queue entries vitals
    const mockV = vitals.filter((v: any) => v.patientId === patient.id);
    const liveV = queue
      .filter((e) => e.patientId === patient.id && e.vitalsStatus === "done" && e.vitals)
      .map((e) => ({
        id: `v-live-${e.id}`,
        patientId: e.patientId,
        recordedAt: e.arrivedAt,
        bp: e.vitals!.bp,
        pulse: Number(e.vitals!.pulse) || 72,
        tempF: Number(e.vitals!.tempF) || 98.6,
        weightKg: Number(e.vitals!.weight) || 70,
        heightCm: Number(e.vitals!.height) || 170,
        bmi: Number(e.vitals!.bmi) || 24.2,
        spo2: Number(e.vitals!.spo2) || 98,
        bloodSugar: Number(e.vitals!.sugar) || 100,
        notes: `Chief Complaint: ${e.vitals!.chiefComplaint}`,
      }));

    setMyVitals([...liveV, ...mockV]);
  }, [queue, patient.id]);

  const myAppts = appointments.filter((a: any) => a.patientId === patient.id);

  const credentials = doctorCredentials[doctorId] ?? {
    qualification: "MBBS, MD",
    kmc: "KMC-99999",
  };

  const handleAddMedRow = () => {
    setMedsList((prev) => [
      ...prev,
      { name: "", dose: "1 tab", frequency: "1-0-1", duration: "5 days", notes: "After food" },
    ]);
  };

  const handleRemoveMedRow = (index: number) => {
    setMedsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedChange = (index: number, field: string, value: string) => {
    setMedsList((prev) => prev.map((med, i) => (i === index ? { ...med, [field]: value } : med)));
  };

  const handleLabToggle = (test: string) => {
    setSelectedLabs((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleCompleteConsultation = () => {
    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis to complete consultation.");
      return;
    }
    const filledMeds = medsList.filter((m) => m.name.trim() !== "");
    if (filledMeds.length === 0) {
      toast.error("Please prescribe at least one medicine.");
      return;
    }

    const rxId = `rx-${Date.now()}`;
    const dateStr = new Date().toISOString();

    const newPrescription: Prescription = {
      id: rxId,
      patientId: patient.id,
      doctorId,
      date: dateStr,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      advice: `Follow up: ${followUpDate ? format(new Date(followUpDate), "dd MMM yyyy") : "None"}.`,
    };

    addPrescription(newPrescription);

    if (selectedLabs.length > 0) {
      const newLabOrder: LabOrder = {
        id: `lab-${Date.now()}`,
        patientId: patient.id,
        doctorId,
        tests: selectedLabs,
        status: "ordered",
        orderedOn: dateStr,
      };
      addLabOrder(newLabOrder);
    }

    // Complete active queue entry
    if (activeConsult) {
      markConsultStatus(activeConsult.id, "completed");
    }

    // Assemble print payload
    setPrintData({
      rxNo: `RX-${Date.now().toString().slice(-6)}`,
      date: format(new Date(), "dd MMM yyyy, hh:mm a"),
      patientName: patient.name,
      uhid: patient.mrn,
      age: patient.age,
      gender: patient.gender,
      doctorName: currentDoctor?.name ?? "Doctor",
      specialization: currentDoctor?.specialization ?? "General Physician",
      qualification: credentials.qualification,
      kmcNo: credentials.kmc,
      vitals: activeConsult?.vitals,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      labTests: selectedLabs,
      followUp: followUpDate ? format(new Date(followUpDate), "dd MMM yyyy") : undefined,
      patientPhone: patient.phone,
      patientEmail: patient.email,
    });

    setShowPrescriptionModal(true);
    setShowConsultPanel(false);

    toast.success("Consultation Completed!", {
      description: "Prescription successfully recorded and ready to print.",
      duration: 6000,
    });
  };

  return (
    <>
      {printData && showPrescriptionModal && (
        <PrescriptionPrintModal
          data={printData}
          onClose={() => {
            setShowPrescriptionModal(false);
            setPrintData(null);
            navigate({ to: "/doctor/queue" });
          }}
        />
      )}

      <Link
        to="/doctor/queue"
        className="mb-4 inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to Live Queue
      </Link>

      {/* active consult alert */}
      {activeConsult && !showConsultPanel && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-teal-500/10">
              <ClipboardPlus className="h-4 w-4 text-teal-600" />
            </span>
            <div>
              <p className="text-sm font-semibold text-teal-900">Live Consultation Available</p>
              <p className="text-xs text-teal-700">
                Patient has completed vitals and is awaiting your consult.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setShowConsultPanel(true)}>
            Start Consultation
          </Button>
        </div>
      )}

      {/* active consult panel form */}
      {showConsultPanel && (
        <div className="surface-elevated border-2 border-primary/30 p-6 mb-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <ClipboardPlus className="h-5 w-5 text-primary" />
              Active OPD Consultation Portal
            </h3>
            {activeConsult && (
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                Live Queue Entry
              </span>
            )}
          </div>

          {/* Vitals Summary */}
          {activeConsult?.vitals && (
            <div className="rounded-xl border bg-teal-50/30 dark:bg-teal-950/10 p-4 space-y-3">
              <h4 className="font-semibold text-sm text-teal-900 dark:text-teal-300 flex items-center gap-2">
                <Heart className="h-4 w-4 text-teal-600" />
                Patient Vitals Triage Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs text-foreground">
                <div>
                  BP: <span className="font-bold">{activeConsult.vitals.bp} mmHg</span>
                </div>
                <div>
                  Pulse: <span className="font-bold">{activeConsult.vitals.pulse} bpm</span>
                </div>
                <div>
                  Temp: <span className="font-bold">{activeConsult.vitals.tempF}°F</span>
                </div>
                <div>
                  SpO₂: <span className="font-bold">{activeConsult.vitals.spo2}%</span>
                </div>
                <div>
                  BMI:{" "}
                  <span className="font-bold">
                    {activeConsult.vitals.bmi} ({activeConsult.vitals.weight}kg /{" "}
                    {activeConsult.vitals.height}cm)
                  </span>
                </div>
              </div>
              <div className="text-xs pt-1 border-t border-teal-100/50">
                <strong className="text-teal-900">Chief Complaint: </strong>
                <span className="italic font-medium">"{activeConsult.vitals.chiefComplaint}"</span>
              </div>
            </div>
          )}

          {/* Diagnosis & Examination */}
          <div className="space-y-4">
            <div>
              <Label className="font-semibold text-sm">
                Diagnosis / Clinical Findings <span className="text-destructive">*</span>
              </Label>
              <Input
                className="mt-1.5"
                placeholder="e.g. Acute Viral Gastroenteritis, Essential Hypertension..."
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            {/* Prescriptions medicines builder */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm flex items-center gap-1.5">
                  <Pill className="h-4 w-4 text-primary" />
                  Prescribe Treatment Plan <span className="text-destructive">*</span>
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddMedRow}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Drug
                </Button>
              </div>

              <div className="space-y-2">
                {medsList.map((med, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row gap-2 border p-3 rounded-lg bg-muted/20"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder="Drug name (e.g. Paracetamol 650mg)"
                        value={med.name}
                        onChange={(e) => handleMedChange(index, "name", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <Input
                        placeholder="Dose (1 tab)"
                        value={med.dose}
                        onChange={(e) => handleMedChange(index, "dose", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="w-full sm:w-32">
                      <Input
                        placeholder="Frequency (1-0-1)"
                        value={med.frequency}
                        onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="w-full sm:w-28">
                      <Input
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedChange(index, "duration", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Notes (e.g. after food)"
                        value={med.notes}
                        onChange={(e) => handleMedChange(index, "notes", e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    {medsList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMedRow(index)}
                        className="text-destructive hover:bg-destructive/10 h-9 w-9 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Investigations and Follow-up */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Lab tests recommendations */}
              <div>
                <Label className="font-semibold text-sm">Recommended Labs / Radiology</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-lg border p-3 bg-muted/10">
                  {[
                    "CBC Test",
                    "Urine Profile",
                    "Thyroid TSH",
                    "Lipid Panel",
                    "Chest X-Ray",
                    "Ultrasound USG",
                    "ECG Monitor",
                  ].map((test) => {
                    const isChecked = selectedLabs.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() => handleLabToggle(test)}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs transition-all",
                          isChecked
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-border hover:bg-accent/40 text-muted-foreground"
                        )}
                      >
                        {test}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Follow-up date */}
              <div className="flex flex-col justify-between">
                <div>
                  <Label className="font-semibold text-sm">Follow-up Review Date</Label>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Select date for clinical review appointment
                  </p>
                  <div className="relative">
                    <Input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 sm:mt-0">
                  <Button variant="outline" onClick={() => setShowConsultPanel(false)}>
                    Save Draft / Close
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCompleteConsultation}
                    className="font-semibold px-5"
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                    Complete Consultation &amp; Print
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Header Bio */}
      <div className="surface-elevated mb-6 p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {patient.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {patient.mrn}
              </p>
              <h1 className="truncate font-display text-2xl font-bold tracking-tight">
                {patient.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {patient.age}y · {patient.gender} · Blood {patient.bloodGroup}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {patient.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {patient.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {patient.address}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="mr-1 h-4 w-4" /> Print bio summary
            </Button>
            {!showConsultPanel && (
              <Button size="sm" onClick={() => setShowConsultPanel(true)}>
                <ClipboardPlus className="mr-1 h-4 w-4" /> New prescription / Consult
              </Button>
            )}
          </div>
        </div>

        {patient.allergies.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-warning-foreground" />
            <div>
              <p className="font-semibold text-warning-foreground">Known allergies</p>
              <p className="text-muted-foreground">{patient.allergies.join(", ")}</p>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions ({myRx.length})</TabsTrigger>
          <TabsTrigger value="vitals">Vitals ({myVitals.length})</TabsTrigger>
          <TabsTrigger value="labs">Lab reports ({myLabs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="surface-elevated p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold">
              <Activity className="h-4 w-4 text-primary" /> Active medications
            </h3>
            {patient.medications.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No active medications.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {patient.medications.map((m: string) => (
                  <li key={m} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2">
                    <Pill className="h-3.5 w-3.5 text-primary" />
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Emergency contact</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">{patient.emergencyContact.name}</p>
              <p className="text-muted-foreground">{patient.emergencyContact.relation}</p>
              <p className="inline-flex items-center gap-1 text-muted-foreground">
                <Phone className="h-3 w-3" />
                {patient.emergencyContact.phone}
              </p>
            </div>
            <h3 className="mt-5 font-display font-semibold">Insurance</h3>
            {patient.insurance ? (
              <div className="mt-2 text-sm">
                <p className="font-medium">{patient.insurance.provider}</p>
                <p className="text-muted-foreground">Policy {patient.insurance.policyNo}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No insurance on file.</p>
            )}
          </div>

          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Care team</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {doctors[0]?.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{doctors[0]?.name}</p>
                <p className="text-xs text-muted-foreground">{doctors[0]?.specialization}</p>
              </div>
            </div>
            <h3 className="mt-5 font-display font-semibold">Registered</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(new Date(patient.registeredOn), "MMM d, yyyy")}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Visit timeline</h3>
            <ol className="relative mt-6 border-l-2 border-border pl-6">
              {myAppts.slice(0, 8).map((a: any) => (
                <li key={a.id} className="mb-6 last:mb-0">
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{a.reason}</p>
                    <StatusChip tone="primary">{a.type}</StatusChip>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {format(new Date(a.date), "MMM d, yyyy · p")}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          {myRx.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <Pill className="mx-auto h-6 w-6 opacity-60" /> No prescriptions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myRx.map((r) => (
                <div key={r.id} className="surface-elevated p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <p className="font-display font-semibold text-base text-primary">
                        {r.diagnosis}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(r.date), "dd MMM yyyy, hh:mm a")} · {r.id}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const dr = doctors.find((d) => d.id === r.doctorId) || doctors[0];
                        const creds = doctorCredentials[dr!.id] || {
                          qualification: "MBBS, MD",
                          kmc: "KMC-99999",
                        };
                        setPrintData({
                          rxNo: `RX-${r.id.slice(-6)}`,
                          date: format(new Date(r.date), "dd MMM yyyy, hh:mm a"),
                          patientName: patient.name,
                          uhid: patient.mrn,
                          age: patient.age,
                          gender: patient.gender,
                          doctorName: dr!.name,
                          specialization: dr!.specialization,
                          qualification: creds.qualification,
                          kmcNo: creds.kmc,
                          diagnosis: r.diagnosis,
                          medicines: r.medicines,
                          labTests: [],
                          followUp: r.advice.includes("Follow up: ")
                            ? r.advice.replace("Follow up: ", "").replace(".", "")
                            : undefined,
                          patientPhone: patient.phone,
                          patientEmail: patient.email,
                        });
                        setShowPrescriptionModal(true);
                      }}
                    >
                      <Printer className="mr-1 h-4 w-4" /> Print Prescription Pad
                    </Button>
                  </div>
                  <table className="mt-4 w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <th className="pb-2 text-left">Medicine</th>
                        <th className="pb-2 text-left">Dose</th>
                        <th className="pb-2 text-left">Frequency</th>
                        <th className="pb-2 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {r.medicines.map((m, i: number) => (
                        <tr key={i}>
                          <td className="py-2.5 font-medium text-foreground">
                            {m.name}
                            {m.notes && (
                              <div className="text-[10px] text-muted-foreground font-normal">
                                {m.notes}
                              </div>
                            )}
                          </td>
                          <td>{m.dose}</td>
                          <td>{m.frequency}</td>
                          <td>{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.advice && (
                    <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Advice: </span>
                      {r.advice}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vitals">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myVitals.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground lg:col-span-3">
                <HeartPulse className="mx-auto h-6 w-6 opacity-60" /> No vitals recorded.
              </div>
            )}
            {myVitals.map((v) => (
              <div key={v.id} className="surface-elevated p-5">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(v.recordedAt), "dd MMM yyyy, hh:mm a")}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Vital label="BP" value={v.bp} />
                  <Vital label="Pulse" value={`${v.pulse} bpm`} />
                  <Vital label="Temp" value={`${v.tempF}°F`} />
                  <Vital label="SpO₂" value={`${v.spo2}%`} />
                  <Vital label="BMI" value={String(v.bmi)} />
                  <Vital label="Weight" value={`${v.weightKg} kg`} />
                </div>
                {v.notes && (
                  <p className="text-[11px] text-muted-foreground mt-3 border-t pt-2 italic">
                    {v.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="labs">
          {myLabs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              <FlaskConical className="mx-auto h-6 w-6 opacity-60" /> No lab orders.
            </div>
          ) : (
            <div className="space-y-2">
              {myLabs.map((l) => (
                <div
                  key={l.id}
                  className="surface-elevated flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-semibold">{l.tests.join(", ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.id} · {format(new Date(l.orderedOn), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip tone={l.status === "completed" ? "success" : "warning"}>
                      {l.status}
                    </StatusChip>
                    {l.status === "completed" && (
                      <Button size="sm" variant="outline">
                        <Download className="mr-1 h-4 w-4" /> Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}
