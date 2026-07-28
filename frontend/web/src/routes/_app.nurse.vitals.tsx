<<<<<<< HEAD
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
=======
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
>>>>>>> a821a0c (second update)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
<<<<<<< HEAD
} from "@/components/ui/select";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { usePatients } from "@/lib/store/patients";
import { useState, useEffect } from "react";
import { HeartPulse, Activity, User, FileText, Scale } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
=======
} from '@/components/ui/select';
import { useNurseQueue } from '@/lib/store/nurseQueue';
import { usePatients } from '@/lib/store/patients';
import { useState, useEffect } from 'react';
import { HeartPulse, Activity, User, FileText, Scale } from 'lucide-react';
import {
  sanitizeLettersOnly,
  sanitizePositiveInt,
  sanitizeBP,
  sanitizeDecimal,
  sanitizeAlphanumericId,
} from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { doctors } from '@/lib/mock/data';
>>>>>>> a821a0c (second update)

export const Route = createFileRoute('/_app/nurse/vitals')({
  validateSearch: (search: Record<string, unknown>): { queueId?: string; patientId?: string } => ({
    queueId: search.queueId as string | undefined,
    patientId: search.patientId as string | undefined,
  }),
  component: NurseVitals,
});

const CHIEF_COMPLAINT_TEMPLATES = [
<<<<<<< HEAD
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
=======
  'Fever',
  'Headache',
  'Knee Pain',
  'Chest Pain',
  'Abdominal Pain',
  'Cough & Cold',
  'Shortness of Breath',
  'Dizziness',
  'High BP Check',
  'Regular Follow-up',
>>>>>>> a821a0c (second update)
];

function NurseVitals() {
  const { queueId, patientId: queryPatientId } = Route.useSearch();
  const navigate = useNavigate();
  const { queue, saveVitals, markVitalsStatus, pushDirectToDoctor } = useNurseQueue();
  const { patients } = usePatients();

  // Find selected patient / queue entry
  const initialQueueEntry = queue.find(
<<<<<<< HEAD
    (e) => e.id === queueId || (queryPatientId && e.patientId === queryPatientId)
  );

  const [selectedQueueId, setSelectedQueueId] = useState<string>(initialQueueEntry?.id || "none");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialQueueEntry?.patientId || queryPatientId || "none"
=======
    (e) => e.id === queueId || (queryPatientId && e.patientId === queryPatientId),
  );
  const initialPatient = patients.find(
    (p) => p.id === queryPatientId || (initialQueueEntry && p.id === initialQueueEntry.patientId),
>>>>>>> a821a0c (second update)
  );

  // Vitals form state
  const [height, setHeight] = useState(initialQueueEntry?.vitals?.height || '');
  const [weight, setWeight] = useState(initialQueueEntry?.vitals?.weight || '');
  const [bp, setBp] = useState(initialQueueEntry?.vitals?.bp || '');
  const [pulse, setPulse] = useState(initialQueueEntry?.vitals?.pulse || '');
  const [tempF, setTempF] = useState(initialQueueEntry?.vitals?.tempF || '');
  const [spo2, setSpo2] = useState(initialQueueEntry?.vitals?.spo2 || '');
  const [sugar, setSugar] = useState(initialQueueEntry?.vitals?.sugar || '');
  const [chiefComplaint, setChiefComplaint] = useState(
    initialQueueEntry?.vitals?.chiefComplaint || '',
  );

  // Direct entry states
  const [directPatientId, setDirectPatientId] = useState(
    initialQueueEntry?.uhid || initialPatient?.mrn || '',
  );
  const [directPatientName, setDirectPatientName] = useState(
    initialQueueEntry?.patientName || initialPatient?.name || '',
  );
  const [directAge, setDirectAge] = useState(
    initialQueueEntry?.age?.toString() || initialPatient?.age?.toString() || '',
  );
  const [directGender, setDirectGender] = useState(
    initialQueueEntry?.gender || initialPatient?.gender || 'Male',
  );
  const [directDoctorId, setDirectDoctorId] = useState(
    initialQueueEntry?.doctorId || initialPatient?.assignedDoctorId || '',
  );

  // Calculate BMI dynamically
  const hNum = Number(height);
  const wNum = Number(weight);
  const bmiVal = hNum && wNum ? (wNum / Math.pow(hNum / 100, 2)).toFixed(1) : '';
  const bmiNum = Number(bmiVal);

  let bmiCategory = '';
  let bmiColor = 'text-muted-foreground';
  if (bmiNum) {
    if (bmiNum < 18.5) {
      bmiCategory = 'Underweight';
      bmiColor = 'text-sky-600 bg-sky-50 dark:bg-sky-950/20';
    } else if (bmiNum < 25) {
      bmiCategory = 'Normal weight';
      bmiColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20';
    } else if (bmiNum < 30) {
      bmiCategory = 'Overweight';
      bmiColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/20';
    } else {
      bmiCategory = 'Obese';
      bmiColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/20';
    }
  }

<<<<<<< HEAD
  // Handle setting active queue entry fields
  const activeQueueEntry = queue.find((e) => e.id === selectedQueueId);
  const activePatient = patients.find(
    (p) => p.id === selectedPatientId || (activeQueueEntry && p.id === activeQueueEntry.patientId)
  );

  // Sync state if selected queue changes
=======
  // Sync vitals fields when queue entry changes
>>>>>>> a821a0c (second update)
  useEffect(() => {
    if (initialQueueEntry && initialQueueEntry.vitalsStatus === 'pending') {
      markVitalsStatus(initialQueueEntry.id, 'in-progress');
    }
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQueueId]);
=======
  }, [queueId, initialQueueEntry, markVitalsStatus]);
>>>>>>> a821a0c (second update)

  const handleTemplateClick = (template: string) => {
    setChiefComplaint((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return template;
      if (trimmed.toLowerCase().includes(template.toLowerCase())) {
<<<<<<< HEAD
        // Toggle off
        return trimmed
          .split(", ")
          .filter((x) => x.toLowerCase() !== template.toLowerCase())
          .join(", ");
=======
        return trimmed
          .split(', ')
          .filter((x) => x.toLowerCase() !== template.toLowerCase())
          .join(', ');
>>>>>>> a821a0c (second update)
      }
      return `${trimmed}, ${template}`;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!directPatientId || !directPatientName || !directDoctorId || !directAge || !directGender) {
      toast.error('Please fill in all patient details.');
      return;
    }
    if (!height || !weight || !bp || !pulse || !tempF || !spo2 || !chiefComplaint) {
      toast.error('Please fill in all mandatory vitals and chief complaint.');
      return;
    }

    const selectedDoc = doctors.find((d) => d.id === directDoctorId);

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

    if (initialQueueEntry) {
      saveVitals(initialQueueEntry.id, vitalsData);
      toast.success('Vitals saved!', {
        description: `Ready for Consultation. Pushed to ${selectedDoc?.name || initialQueueEntry.doctorName}'s queue.`,
        duration: 5000,
      });
    } else {
      pushDirectToDoctor({
        id: `nq-${Date.now()}`,
        patientId: `p-${Date.now()}`,
        uhid: directPatientId,
        patientName: directPatientName,
        age: Number(directAge) || 30,
        gender: directGender,
        doctorId: directDoctorId,
        doctorName: selectedDoc?.name || 'Unknown Doctor',
        department: selectedDoc?.department || 'General',
        isNewPatient: false,
        paymentMethod: 'cash',
        totalPaid: 0,
        arrivedAt: new Date().toISOString(),
        vitalsStatus: 'done',
        vitals: vitalsData,
        consultStatus: 'waiting',
      });

      toast.success('Vitals saved!', {
        description: `Patient ${directPatientName} pushed directly to ${selectedDoc?.name || 'Doctor'}'s queue.`,
        duration: 5000,
      });
    }

    navigate({ to: '/nurse' });
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
          {/* Patient Details */}
          <div className="surface-elevated p-6 space-y-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Patient Information
            </h3>

<<<<<<< HEAD
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
=======
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="directPatientId">Patient ID (UHID) *</Label>
                <Input
                  id="directPatientId"
                  value={directPatientId}
                  onChange={(e) => setDirectPatientId(sanitizeAlphanumericId(e.target.value))}
                  placeholder="e.g. PAT-001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="directPatientName">Patient Name *</Label>
                <Input
                  id="directPatientName"
                  value={directPatientName}
                  onChange={(e) => setDirectPatientName(sanitizeLettersOnly(e.target.value))}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="directAge">Age *</Label>
                <Input
                  id="directAge"
                  type="number"
                  min={0}
                  max={130}
                  value={directAge}
                  onChange={(e) => setDirectAge(sanitizePositiveInt(e.target.value))}
                  placeholder="Years"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender *</Label>
                <Select value={directGender} onValueChange={setDirectGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Male', 'Female', 'Other'].map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Assigned Doctor *</Label>
                <Select value={directDoctorId} onValueChange={setDirectDoctorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose doctor..." />
>>>>>>> a821a0c (second update)
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} ({doc.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
<<<<<<< HEAD

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
=======
>>>>>>> a821a0c (second update)
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
                sanitize={sanitizeDecimal}
              />
              <VitalsInput
                label="Weight (kg)"
                value={weight}
                onChange={setWeight}
                placeholder="e.g. 72"
                required
                sanitize={sanitizeDecimal}
              />

              {/* BMI Card */}
              <div>
                <Label>BMI (calculated)</Label>
                <div
                  className={cn(
<<<<<<< HEAD
                    "mt-1.5 flex h-10 items-center justify-between rounded-md border px-3 text-sm font-semibold transition-all",
                    bmiVal ? bmiColor : "bg-muted/40 border-input"
                  )}
                >
                  <span>{bmiVal || "—"}</span>
=======
                    'mt-1.5 flex h-10 items-center justify-between rounded-md border px-3 text-sm font-semibold transition-all',
                    bmiVal ? bmiColor : 'bg-muted/40 border-input',
                  )}
                >
                  <span>{bmiVal || '—'}</span>
>>>>>>> a821a0c (second update)
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
                sanitize={sanitizeBP}
              />
              <VitalsInput
                label="Pulse Rate (bpm)"
                value={pulse}
                onChange={setPulse}
                placeholder="e.g. 78"
                required
                sanitize={sanitizePositiveInt}
              />
              <VitalsInput
                label="Temperature (°F)"
                value={tempF}
                onChange={setTempF}
                placeholder="e.g. 98.6"
                required
                sanitize={sanitizeDecimal}
              />
              <VitalsInput
                label="SpO₂ (%)"
                value={spo2}
                onChange={setSpo2}
                placeholder="e.g. 99"
                required
                sanitize={sanitizePositiveInt}
              />
              <VitalsInput
                label="Blood Sugar (mg/dL) - Optional"
                value={sugar}
                onChange={setSugar}
                placeholder="e.g. 110"
                sanitize={sanitizePositiveInt}
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
                      'rounded-full px-3 py-1 text-xs transition-all',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground',
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
<<<<<<< HEAD
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/nurse" })}>
=======
            <Button type="button" variant="outline" onClick={() => navigate({ to: '/nurse' })}>
>>>>>>> a821a0c (second update)
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 px-6 font-semibold"
              disabled={!directPatientId || !directPatientName || !directDoctorId}
            >
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

          {/* Flow guide */}
          <div className="surface-elevated p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm">Patient Flow</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  1
                </span>
                <span>Front Desk registers &amp; assigns doctor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  2
                </span>
                <span>Nurse records vitals from reception queue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600">
                  3
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Patient appears in Doctor's queue
                </span>
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
<<<<<<< HEAD
=======
  sanitize,
>>>>>>> a821a0c (second update)
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  sanitize?: (v: string) => string;
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
        onChange={(e) => onChange(sanitize ? sanitize(e.target.value) : e.target.value)}
        required={required}
      />
    </div>
  );
}
