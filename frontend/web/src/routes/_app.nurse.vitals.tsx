import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { usePatients } from "@/lib/store/patients";
import { useState, useEffect } from "react";
import { HeartPulse, Activity, User, FileText, Scale } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/nurse/vitals")({
  validateSearch: (search: Record<string, unknown>): { queueId?: string; patientId?: string } => ({
    queueId: search.queueId as string | undefined,
    patientId: search.patientId as string | undefined,
  }),
  component: NurseVitals,
});

const CHIEF_COMPLAINT_TEMPLATES = [
  "Fever",
  "Headache",
  "Knee Pain",
  "Chest Pain",
  "Abdominal Pain",
  "Cough & Cold",
  "Shortness of Breath",
  "Dizziness",
  "High BP Check",
  "Regular Follow-up",
];

function NurseVitals() {
  const { queueId, patientId: queryPatientId } = Route.useSearch();
  const navigate = useNavigate();
  const { queue, saveVitals, markVitalsStatus } = useNurseQueue();
  const { patients } = usePatients();

  // Find selected patient / queue entry
  const initialQueueEntry = queue.find(
    (e) => e.id === queueId || (queryPatientId && e.patientId === queryPatientId)
  );

  const [selectedQueueId, setSelectedQueueId] = useState<string>(initialQueueEntry?.id || "none");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialQueueEntry?.patientId || queryPatientId || "none"
  );

  // Vitals form state
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bp, setBp] = useState("");
  const [pulse, setPulse] = useState("");
  const [tempF, setTempF] = useState("");
  const [spo2, setSpo2] = useState("");
  const [sugar, setSugar] = useState("");
  const [chiefComplaint, setChiefComplaint] = useState("");

  // Calculate BMI dynamically
  const hNum = Number(height);
  const wNum = Number(weight);
  const bmiVal = hNum && wNum ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : "";
  const bmiNum = Number(bmiVal);

  let bmiCategory = "";
  let bmiColor = "text-muted-foreground";
  if (bmiNum) {
    if (bmiNum < 18.5) {
      bmiCategory = "Underweight";
      bmiColor = "text-sky-600 bg-sky-50 dark:bg-sky-950/20";
    } else if (bmiNum < 25) {
      bmiCategory = "Normal weight";
      bmiColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20";
    } else if (bmiNum < 30) {
      bmiCategory = "Overweight";
      bmiColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/20";
    } else {
      bmiCategory = "Obese";
      bmiColor = "text-rose-600 bg-rose-50 dark:bg-rose-950/20";
    }
  }

  // Handle setting active queue entry fields
  const activeQueueEntry = queue.find((e) => e.id === selectedQueueId);
  const activePatient = patients.find(
    (p) => p.id === selectedPatientId || (activeQueueEntry && p.id === activeQueueEntry.patientId)
  );

  // Sync state if selected queue changes
  useEffect(() => {
    if (activeQueueEntry) {
      // Mark entry as in-progress when nurse starts recording
      if (activeQueueEntry.vitalsStatus === "pending") {
        markVitalsStatus(activeQueueEntry.id, "in-progress");
      }
      if (activeQueueEntry.vitals) {
        setHeight(activeQueueEntry.vitals.height);
        setWeight(activeQueueEntry.vitals.weight);
        setBp(activeQueueEntry.vitals.bp);
        setPulse(activeQueueEntry.vitals.pulse);
        setTempF(activeQueueEntry.vitals.tempF);
        setSpo2(activeQueueEntry.vitals.spo2);
        setSugar(activeQueueEntry.vitals.sugar || "");
        setChiefComplaint(activeQueueEntry.vitals.chiefComplaint);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQueueId]);

  const handleTemplateClick = (template: string) => {
    setChiefComplaint((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return template;
      if (trimmed.toLowerCase().includes(template.toLowerCase())) {
        // Toggle off
        return trimmed
          .split(", ")
          .filter((x) => x.toLowerCase() !== template.toLowerCase())
          .join(", ");
      }
      return `${trimmed}, ${template}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      toast.error("Please select a patient first.");
      return;
    }
    if (!height || !weight || !bp || !pulse || !tempF || !spo2 || !chiefComplaint) {
      toast.error("Please fill in all mandatory vitals and chief complaint.");
      return;
    }

    const vitalsData = {
      height,
      weight,
      bmi: bmiVal,
      bp,
      pulse,
      tempF,
      spo2,
      sugar: sugar || undefined,
      chiefComplaint,
    };

    if (activeQueueEntry) {
      saveVitals(activeQueueEntry.id, vitalsData);
      toast.success("Vitals saved!", {
        description: `Status marked: Ready for Consultation. Pushed to ${activeQueueEntry.doctorName}'s dashboard.`,
        duration: 5000,
      });
    } else {
      // If manually filled without queue entry, just log a success toast
      toast.success("Vitals saved successfully");
    }

    navigate({ to: "/nurse" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Triage Intake"
        title="Record Patient Vitals"
        description="Collect patient measurements, blood pressure, temperature and chief complaint."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Form */}
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
          {/* Patient Selection & Quick Info */}
          <div className="surface-elevated p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Intake Patient Select
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Select From Reception Queue</Label>
                <Select
                  value={selectedQueueId}
                  onValueChange={(v) => {
                    setSelectedQueueId(v);
                    if (v !== "none") {
                      const entry = queue.find((e) => e.id === v);
                      if (entry) setSelectedPatientId(entry.patientId);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose queued patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Select from live queue --</SelectItem>
                    {queue
                      .filter((e) => e.vitalsStatus !== "done")
                      .map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.patientName} ({entry.uhid})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Or Select All Registered Patients</Label>
                <Select
                  value={selectedPatientId}
                  onValueChange={(v) => {
                    setSelectedPatientId(v);
                    const matchedQueue = queue.find(
                      (e) => e.patientId === v && e.vitalsStatus !== "done"
                    );
                    if (matchedQueue) {
                      setSelectedQueueId(matchedQueue.id);
                    } else {
                      setSelectedQueueId("none");
                    }
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Choose registered patient..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Search all patients --</SelectItem>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activePatient && (
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="font-semibold text-sm">{activePatient.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {activePatient.mrn}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div>
                    Age / Gender:{" "}
                    <span className="font-semibold text-foreground">
                      {activePatient.age}y / {activePatient.gender}
                    </span>
                  </div>
                  <div>
                    Blood Group:{" "}
                    <span className="font-semibold text-foreground">
                      {activePatient.bloodGroup || "O+"}
                    </span>
                  </div>
                  {activeQueueEntry && (
                    <>
                      <div className="col-span-2">
                        Assigned Doctor:{" "}
                        <span className="font-semibold text-foreground">
                          {activeQueueEntry.doctorName} ({activeQueueEntry.department})
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vitals Form Fields */}
          <div className="surface-elevated p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Physical Vitals Measurements
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <VitalsInput
                label="Height (cm)"
                value={height}
                onChange={setHeight}
                placeholder="e.g. 170"
                required
              />
              <VitalsInput
                label="Weight (kg)"
                value={weight}
                onChange={setWeight}
                placeholder="e.g. 72"
                required
              />

              {/* BMI Card */}
              <div>
                <Label>BMI (calculated)</Label>
                <div
                  className={cn(
                    "mt-1.5 flex h-10 items-center justify-between rounded-md border px-3 text-sm font-semibold transition-all",
                    bmiVal ? bmiColor : "bg-muted/40 border-input"
                  )}
                >
                  <span>{bmiVal || "—"}</span>
                  {bmiCategory && (
                    <span className="text-xs uppercase tracking-wider font-bold">
                      {bmiCategory}
                    </span>
                  )}
                </div>
              </div>

              <VitalsInput
                label="Blood Pressure (mmHg)"
                value={bp}
                onChange={setBp}
                placeholder="e.g. 120/80"
                required
              />
              <VitalsInput
                label="Pulse Rate (bpm)"
                value={pulse}
                onChange={setPulse}
                placeholder="e.g. 78"
                required
              />
              <VitalsInput
                label="Temperature (°F)"
                value={tempF}
                onChange={setTempF}
                placeholder="e.g. 98.6"
                required
              />
              <VitalsInput
                label="SpO₂ (%)"
                value={spo2}
                onChange={setSpo2}
                placeholder="e.g. 99"
                required
              />
              <VitalsInput
                label="Blood Sugar (mg/dL) - Optional"
                value={sugar}
                onChange={setSugar}
                placeholder="e.g. 110"
              />
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="surface-elevated p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Chief Complaint
            </h3>

            <p className="text-xs italic text-muted-foreground">
              Nurse: "What brings you to the hospital today?"
            </p>

            {/* Complaint Templates */}
            <div className="flex flex-wrap gap-1.5">
              {CHIEF_COMPLAINT_TEMPLATES.map((tmpl) => {
                const isActive = chiefComplaint.toLowerCase().includes(tmpl.toLowerCase());
                return (
                  <button
                    key={tmpl}
                    type="button"
                    onClick={() => handleTemplateClick(tmpl)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {tmpl}
                  </button>
                );
              })}
            </div>

            <Textarea
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g. Fever for 3 days, mild headache, knee pain..."
              rows={4}
              required
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/nurse" })}>
              Cancel
            </Button>
            <Button type="submit" className="h-11 px-6 font-semibold" disabled={!activePatient}>
              <HeartPulse className="mr-2 h-4 w-4" />
              Save Vitals &amp; Ready for Consult
            </Button>
          </div>
        </form>

        {/* Right Side: Vitals Guide / Standards Card */}
        <div className="space-y-5 lg:col-span-1">
          <div className="surface-elevated p-5 space-y-4">
            <h4 className="font-display font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Vitals Guide References
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="border-b pb-2">
                <p className="font-semibold text-foreground">Blood Pressure (BP)</p>
                <p className="text-muted-foreground mt-0.5">
                  Normal: Systolic &lt; 120 and Diastolic &lt; 80 mmHg
                </p>
                <p className="text-amber-600 font-medium mt-0.5">Hypertension: &gt; 130/80 mmHg</p>
              </div>

              <div className="border-b pb-2">
                <p className="font-semibold text-foreground">Pulse Rate</p>
                <p className="text-muted-foreground mt-0.5">
                  Normal: 60 - 100 bpm (beats per minute)
                </p>
              </div>

              <div className="border-b pb-2">
                <p className="font-semibold text-foreground">Temperature</p>
                <p className="text-muted-foreground mt-0.5">Normal: 97.8°F - 99.1°F</p>
                <p className="text-rose-600 font-medium mt-0.5">Fever: &gt; 100.4°F</p>
              </div>

              <div>
                <p className="font-semibold text-foreground">SpO₂ (Oxygen Saturation)</p>
                <p className="text-muted-foreground mt-0.5">Normal: 95% - 100%</p>
                <p className="text-rose-600 font-medium mt-0.5">Hypoxia warning: &lt; 92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function VitalsInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label className="flex items-center gap-0.5">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        className="mt-1.5"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
