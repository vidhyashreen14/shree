import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patients, prescriptions, vitals, labOrders, appointments, doctors } from "@/lib/mock/data";
import { format } from "date-fns";
import {
  ArrowLeft, Phone, Mail, MapPin, AlertTriangle, Pill, FlaskConical, ClipboardPlus,
  HeartPulse, FileText, Activity, Calendar, Printer, Download,
} from "lucide-react";

export const Route = createFileRoute("/_app/doctor/patients/$id")({
  loader: ({ params }): { patient: import("@/lib/types").Patient } => {
    const patient = patients.find((p) => p.id === params.id);
    if (!patient) throw notFound();
    return { patient };
  },
  component: PatientProfile,
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">
      Patient not found. <Link to="/doctor/patients" className="text-primary underline">Back to list</Link>
    </div>
  ),
});

function PatientProfile() {
  const { patient } = Route.useLoaderData();
  const myRx = prescriptions.filter((r) => r.patientId === patient.id);
  const myVitals = vitals.filter((v) => v.patientId === patient.id);
  const myLabs = labOrders.filter((l) => l.patientId === patient.id);
  const myAppts = appointments.filter((a) => a.patientId === patient.id);
  const doctor = doctors.find((d) => d.id === patient.assignedDoctorId);

  return (
    <>
      <Link to="/doctor/patients" className="mb-4 inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-3 w-3" /> Back to patients
      </Link>

      <div className="surface-elevated mb-6 p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {patient.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{patient.mrn}</p>
              <h1 className="truncate font-display text-2xl font-bold tracking-tight">{patient.name}</h1>
              <p className="text-sm text-muted-foreground">{patient.age}y · {patient.gender} · Blood {patient.bloodGroup}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.phone}</span>
                <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {patient.email}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {patient.address}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="outline" size="sm"><Printer className="mr-1 h-4 w-4" /> Print summary</Button>
            <Button size="sm"><ClipboardPlus className="mr-1 h-4 w-4" /> New prescription</Button>
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
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="labs">Lab reports</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="surface-elevated p-5">
            <h3 className="flex items-center gap-2 font-display font-semibold"><Activity className="h-4 w-4 text-primary" /> Active medications</h3>
            {patient.medications.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No active medications.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {patient.medications.map((m: string) => (
                  <li key={m} className="flex items-center gap-2 rounded-lg bg-muted/40 p-2"><Pill className="h-3.5 w-3.5 text-primary" />{m}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Emergency contact</h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">{patient.emergencyContact.name}</p>
              <p className="text-muted-foreground">{patient.emergencyContact.relation}</p>
              <p className="inline-flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" />{patient.emergencyContact.phone}</p>
            </div>
            <h3 className="mt-5 font-display font-semibold">Insurance</h3>
            {patient.insurance ? (
              <div className="mt-2 text-sm">
                <p className="font-medium">{patient.insurance.provider}</p>
                <p className="text-muted-foreground">Policy {patient.insurance.policyNo}</p>
              </div>
            ) : <p className="mt-2 text-sm text-muted-foreground">No insurance on file.</p>}
          </div>

          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Care team</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {doctor?.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </span>
              <div>
                <p className="text-sm font-semibold">{doctor?.name}</p>
                <p className="text-xs text-muted-foreground">{doctor?.specialization}</p>
              </div>
            </div>
            <h3 className="mt-5 font-display font-semibold">Registered</h3>
            <p className="mt-1 text-sm text-muted-foreground">{format(new Date(patient.registeredOn), "MMM d, yyyy")}</p>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="surface-elevated p-5">
            <h3 className="font-display font-semibold">Visit timeline</h3>
            <ol className="relative mt-6 border-l-2 border-border pl-6">
              {myAppts.slice(0, 8).map((a) => (
                <li key={a.id} className="mb-6 last:mb-0">
                  <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{a.reason}</p>
                    <StatusChip tone="primary">{a.type}</StatusChip>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" />{format(new Date(a.date), "MMM d, yyyy · p")}
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
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold">{r.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(r.date), "MMM d, yyyy")} · {r.id}</p>
                    </div>
                    <Button size="sm" variant="outline"><Printer className="mr-1 h-4 w-4" /> Print</Button>
                  </div>
                  <table className="mt-4 w-full text-sm">
                    <thead className="text-xs text-muted-foreground">
                      <tr><th className="pb-2 text-left">Medicine</th><th className="pb-2 text-left">Dose</th><th className="pb-2 text-left">Frequency</th><th className="pb-2 text-left">Duration</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {r.medicines.map((m: { name: string; dose: string; frequency: string; duration: string; notes?: string }, i: number) => (
                        <tr key={i}><td className="py-2 font-medium">{m.name}</td><td>{m.dose}</td><td>{m.frequency}</td><td>{m.duration}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  {r.advice && <p className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Advice: </span>{r.advice}</p>}
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
                <p className="text-xs text-muted-foreground">{format(new Date(v.recordedAt), "MMM d, yyyy")}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Vital label="BP" value={v.bp} />
                  <Vital label="Pulse" value={`${v.pulse} bpm`} />
                  <Vital label="Temp" value={`${v.tempF}°F`} />
                  <Vital label="SpO₂" value={`${v.spo2}%`} />
                  <Vital label="BMI" value={String(v.bmi)} />
                  <Vital label="Weight" value={`${v.weightKg} kg`} />
                </div>
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
                <div key={l.id} className="surface-elevated flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{l.tests.join(", ")}</p>
                    <p className="text-xs text-muted-foreground">{l.id} · {format(new Date(l.orderedOn), "MMM d, yyyy")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip tone={l.status === "completed" ? "success" : "warning"}>{l.status}</StatusChip>
                    {l.status === "completed" && <Button size="sm" variant="outline"><Download className="mr-1 h-4 w-4" /> Download</Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            <FileText className="mx-auto h-6 w-6 opacity-60" />
            <p className="mt-2">No documents uploaded yet.</p>
            <Button size="sm" variant="outline" className="mt-3">Upload document</Button>
          </div>
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
