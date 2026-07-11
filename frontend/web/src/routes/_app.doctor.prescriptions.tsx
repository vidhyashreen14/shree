import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { doctors } from "@/lib/mock/data";
import { usePatients } from "@/lib/store/patients";
import { useClinicalStore } from "@/lib/store/clinical";
import type { Prescription } from "@/lib/types";
import { format } from "date-fns";
import { useAuth } from "@/lib/store/auth";
import { ClipboardPlus, Printer, Plus, Trash2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PrescriptionPrintModal, doctorCredentials, type PrescriptionPrintData } from "./_app.doctor.patients.$id";

export const Route = createFileRoute("/_app/doctor/prescriptions")({
  component: DoctorRx,
});

function DoctorRx() {
  const user = useAuth((s) => s.user);
  const patients = usePatients((s) => s.patients);
  const prescriptions = useClinicalStore((s) => s.prescriptions);

  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const myRx = prescriptions.filter((r) => r.doctorId === doctorId);
  const [open, setOpen] = useState(false);
  const [meds, setMeds] = useState([{ name: "", dose: "", frequency: "OD", duration: "" }]);
  const [printData, setPrintData] = useState<PrescriptionPrintData | null>(null);

  const columns = useMemo<ColumnDef<Prescription>[]>(() => [
    { header: "ID", accessorKey: "id", cell: ({ getValue }) => <code className="font-mono text-xs">{String(getValue())}</code> },
    {
      header: "Patient",
      accessorKey: "patientId",
      cell: ({ getValue }) => {
        const p = patients.find((x) => x.id === getValue());
        return <span className="font-medium">{p?.name}</span>;
      },
    },
    { header: "Diagnosis", accessorKey: "diagnosis" },
    { header: "Medicines", accessorKey: "medicines", cell: ({ getValue }) => (getValue() as Prescription["medicines"]).length },
    { header: "Date", accessorKey: "date", cell: ({ getValue }) => format(new Date(String(getValue())), "MMM d, yyyy") },
    {
      header: "",
      id: "a",
      cell: ({ row }) => {
        const r = row.original;
        const p = patients.find((x) => x.id === r.patientId);
        const dr = doctors.find((d) => d.id === r.doctorId) || doctors[0]!;
        const creds = doctorCredentials[dr.id] || { qualification: "MBBS, MD", kmc: "KMC-99999" };
        
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (!p) { toast.error("Patient details not found"); return; }
              setPrintData({
                rxNo: `RX-${r.id.slice(-6)}`,
                date: format(new Date(r.date), "dd MMM yyyy, hh:mm a"),
                patientName: p.name,
                uhid: p.mrn,
                age: p.age,
                gender: p.gender,
                doctorName: dr.name,
                specialization: dr.specialization,
                qualification: creds.qualification,
                kmcNo: creds.kmc,
                diagnosis: r.diagnosis,
                medicines: r.medicines,
                labTests: [],
                followUp: r.advice.includes("Follow up: ") ? r.advice.replace("Follow up: ", "").replace(".", "") : undefined,
                patientPhone: p.phone,
                patientEmail: p.email,
              });
            }}
          >
            <Printer className="h-3.5 w-3.5" />
          </Button>
        );
      },
    },
  ], [patients]);

  return (
    <>
      <PageHeader
        title="Prescriptions"
        description="All prescriptions you've issued."
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button><ClipboardPlus className="mr-2 h-4 w-4" /> New prescription</Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-xl">
              <SheetHeader>
                <SheetTitle>Create prescription</SheetTitle>
                <SheetDescription>Issue a new prescription for a patient.</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <div>
                  <Label>Patient</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.slice(0, 12).map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} · {p.mrn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Diagnosis</Label>
                  <Input placeholder="e.g. Hypertension stage 1" className="mt-1.5" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Medicines</Label>
                    <Button type="button" size="sm" variant="outline" onClick={() => setMeds([...meds, { name: "", dose: "", frequency: "OD", duration: "" }])}>
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {meds.map((m, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2">
                        <Input placeholder="Medicine" className="col-span-5" value={m.name} onChange={(e) => setMeds(meds.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                        <Input placeholder="Dose" className="col-span-2" />
                        <Input placeholder="Freq" className="col-span-2" defaultValue={m.frequency} />
                        <Input placeholder="Days" className="col-span-2" />
                        <Button type="button" variant="ghost" size="icon" className="col-span-1" onClick={() => setMeds(meds.filter((_, j) => j !== i))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Advice / notes</Label>
                  <Textarea placeholder="Diet, exercise, follow-up…" className="mt-1.5" />
                </div>
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => { toast.success("Prescription issued"); setOpen(false); }}>Issue prescription</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />
      <DataTable columns={columns} data={myRx} searchPlaceholder="Search by diagnosis…" />
      {printData && (
        <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />
      )}
    </>
  );
}
