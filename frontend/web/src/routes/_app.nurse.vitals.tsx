import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { patients } from "@/lib/mock/data";
import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/nurse/vitals")({
  component: NurseVitals,
});

function NurseVitals() {
  const [patientId, setPatientId] = useState(patients[0]!.id);
  const [v, setV] = useState({
    bp: "", pulse: "", tempF: "", weight: "", height: "", spo2: "", sugar: "", notes: "",
  });
  const bmi = v.weight && v.height ? (Number(v.weight) / Math.pow(Number(v.height) / 100, 2)).toFixed(1) : "";

  return (
    <>
      <PageHeader eyebrow="Nursing" title="Record patient vitals" description="Quick triage form for OPD intake." />

      <form
        className="surface-elevated grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => { e.preventDefault(); toast.success("Vitals recorded"); }}
      >
        <div className="sm:col-span-2 lg:col-span-3">
          <Label>Patient</Label>
          <Select value={patientId} onValueChange={setPatientId}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {patients.slice(0, 12).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} · {p.mrn}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Item label="Blood pressure (mmHg)" value={v.bp} onChange={(x) => setV({ ...v, bp: x })} placeholder="120/80" />
        <Item label="Pulse (bpm)" value={v.pulse} onChange={(x) => setV({ ...v, pulse: x })} placeholder="72" />
        <Item label="Temperature (°F)" value={v.tempF} onChange={(x) => setV({ ...v, tempF: x })} placeholder="98.6" />
        <Item label="Weight (kg)" value={v.weight} onChange={(x) => setV({ ...v, weight: x })} placeholder="68" />
        <Item label="Height (cm)" value={v.height} onChange={(x) => setV({ ...v, height: x })} placeholder="172" />
        <Item label="BMI (auto)" value={bmi} onChange={() => {}} disabled />
        <Item label="SpO₂ (%)" value={v.spo2} onChange={(x) => setV({ ...v, spo2: x })} placeholder="98" />
        <Item label="Blood sugar (mg/dL)" value={v.sugar} onChange={(x) => setV({ ...v, sugar: x })} placeholder="105" />

        <div className="sm:col-span-2 lg:col-span-3">
          <Label>Observation notes</Label>
          <Textarea className="mt-1.5" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="Patient looks pale; complains of mild dizziness…" />
        </div>

        <div className="flex justify-end gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="button" variant="outline" onClick={() => setV({ bp: "", pulse: "", tempF: "", weight: "", height: "", spo2: "", sugar: "", notes: "" })}>Clear</Button>
          <Button type="submit"><HeartPulse className="mr-2 h-4 w-4" /> Save vitals</Button>
        </div>
      </form>
    </>
  );
}

function Item({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input className="mt-1.5" value={value} disabled={disabled} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
