import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { usePatients } from '@/lib/store/patients';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardPlus, Plus, Trash2 } from 'lucide-react';
import { useCurrentDoctorId } from '@/lib/store/doctors';
import type { Prescription, Patient } from '@/lib/types';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClinicalStore } from '@/lib/store/clinical';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  PrescriptionPrintModal,
  getDoctorDetails,
  type PrescriptionPrintData,
} from './_app.doctor.patients.$id';
import { useAuth } from '@/lib/store/auth';
import { useStaffProfiles } from '@/lib/store/staffProfiles';

export const Route = createFileRoute('/_app/doctor/queue')({
  component: DoctorQueue,
});

// ─── Main Component ────────────────────────────────────────────────────────────
function DoctorQueue() {
  const user = useAuth((s) => s.user);
  const staffProfiles = useStaffProfiles((s) => s.profiles);
  const doctorId = useCurrentDoctorId();
  const patients = usePatients((s) => s.patients);
  const addPatient = usePatients((s) => s.addPatient);
  const addPrescription = useClinicalStore((s) => s.addPrescription);

  const [detailedOpen, setDetailedOpen] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [patientNameInput, setPatientNameInput] = useState('');
  const [patientAgeInput, setPatientAgeInput] = useState('');
  const [patientGenderInput, setPatientGenderInput] = useState('Male');
  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [meds, setMeds] = useState([
    { name: '', dose: '1 tab', frequency: '1-0-1', duration: '5 days', notes: 'After food' },
  ]);
  const [printData, setPrintData] = useState<PrescriptionPrintData | null>(null);

  const handleIssueDetailedPrescription = () => {
    if (!patientNameInput.trim()) {
      toast.error('Please enter patient name.');
      return;
    }
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis.');
      return;
    }

    const filledMeds = meds.filter((m) => m.name.trim() !== '');
    if (filledMeds.length === 0) {
      toast.error('Please prescribe at least one medicine.');
      return;
    }

    let p: Patient | undefined;
    let pId: string;

    const generatedUhid = patientIdInput.trim() || `UHID-${Date.now().toString().slice(-6)}`;
    const match = patients.find((x) => x.mrn.toUpperCase() === generatedUhid.toUpperCase());
    if (match) {
      p = match;
      pId = match.id;
    } else {
      const newPId = `p-${Date.now()}`;
      const newPatient = addPatient({
        id: newPId,
        mrn: generatedUhid,
        name: patientNameInput.trim(),
        age: Number(patientAgeInput) || 30,
        gender: patientGenderInput || 'Male',
        phone: '+91 99999 99999',
        email: 'patient@medicore.io',
        bloodGroup: 'O+',
        address: 'Address Not Provided',
        emergencyContact: { name: 'N/A', phone: 'N/A', relation: 'N/A' },
        allergies: [],
        medications: [],
        registeredOn: new Date().toISOString(),
        assignedDoctorId: doctorId || '',
      });
      p = newPatient;
      pId = newPId;
    }

    const rxId = `rx-${Date.now()}`;
    const dateStr = new Date().toISOString();

    const newPrescription: Prescription = {
      id: rxId,
      patientId: pId,
      doctorId: doctorId || '',
      date: dateStr,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      advice: advice.trim(),
    };

    addPrescription(newPrescription);

    const docDetails = getDoctorDetails(doctorId || '', user, staffProfiles);

    setPrintData({
      rxNo: `RX-${rxId.slice(-6)}`,
      date: format(new Date(), 'dd MMM yyyy, hh:mm a'),
      patientName: p?.name || patientNameInput.trim(),
      uhid: p?.mrn || patientIdInput.trim() || rxId.slice(-6),
      age: p?.age || Number(patientAgeInput) || 30,
      gender: p?.gender || patientGenderInput || 'M',
      doctorName: docDetails.name,
      specialization: docDetails.specialization,
      qualification: docDetails.qualification,
      kmcNo: docDetails.kmcNo,
      diagnosis: diagnosis.trim(),
      medicines: filledMeds,
      labTests: [],
      followUp: advice.includes('Follow up: ')
        ? advice.replace('Follow up: ', '').replace('.', '')
        : undefined,
      patientPhone: p?.phone || '',
      patientEmail: p?.email || '',
    });

    toast.success('Prescription issued successfully!');

    // Reset fields
    setPatientIdInput('');
    setPatientNameInput('');
    setPatientAgeInput('');
    setPatientGenderInput('Male');
    setDiagnosis('');
    setAdvice('');
    setMeds([
      { name: '', dose: '1 tab', frequency: '1-0-1', duration: '5 days', notes: 'After food' },
    ]);
    setDetailedOpen(false);
  };

  return (
    <>
      <PageHeader
        eyebrow="Prescriptions"
        title="Prescription Entry"
        description="Issue detailed prescriptions manually"
      />

      {/* Prescription Entry Section */}
      <div className="surface-elevated p-5 mb-6 border-l-4 border-l-emerald-500 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-emerald-600 dark:text-emerald-400">
              Prescription Entry
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Generate detailed prescriptions directly. Click the button to issue a new
              prescription.
            </p>
          </div>
          <Dialog open={detailedOpen} onOpenChange={setDetailedOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                <ClipboardPlus className="mr-1.5 h-4 w-4" /> New Detailed Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create prescription</DialogTitle>
                <DialogDescription>
                  Issue a new detailed prescription for a patient.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 px-4 mt-4 text-left">
                <div className="grid grid-cols-2 gap-3 border p-3 rounded-lg bg-slate-50/50 dark:bg-slate-900/10">
                  <div className="col-span-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Patient Demographics
                    </span>
                  </div>
                  <div>
                    <Label>Patient ID / UHID</Label>
                    <Input
                      placeholder="e.g. UHID-12345"
                      value={patientIdInput}
                      onChange={(e) => setPatientIdInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="e.g. John Doe"
                      value={patientNameInput}
                      onChange={(e) => setPatientNameInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 28"
                      value={patientAgeInput}
                      onChange={(e) => setPatientAgeInput(e.target.value)}
                      className="mt-1.5 bg-background"
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select value={patientGenderInput} onValueChange={setPatientGenderInput}>
                      <SelectTrigger className="mt-1.5 bg-background">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Diagnosis</Label>
                  <Input
                    placeholder="e.g. Hypertension stage 1"
                    className="mt-1.5"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <Label>Medicines</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setMeds([
                          ...meds,
                          {
                            name: '',
                            dose: '1 tab',
                            frequency: '1-0-1',
                            duration: '5 days',
                            notes: 'After food',
                          },
                        ])
                      }
                    >
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {meds.map((m, i) => (
                      <div
                        key={i}
                        className="space-y-2 p-3 border border-dashed rounded-lg relative bg-slate-50/50 dark:bg-slate-900/20"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Medicine #{i + 1}
                          </span>
                          {meds.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => setMeds(meds.filter((_, j) => j !== i))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-6">
                            <Input
                              placeholder="Medicine"
                              value={m.name}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, name: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Dose (e.g. 1 tab)"
                              value={m.dose}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, dose: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              placeholder="Freq (e.g. 1-0-1)"
                              value={m.frequency}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, frequency: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-4">
                            <Input
                              placeholder="Duration (e.g. 5 days)"
                              value={m.duration}
                              onChange={(e) =>
                                setMeds(
                                  meds.map((x, j) =>
                                    j === i ? { ...x, duration: e.target.value } : x,
                                  ),
                                )
                              }
                            />
                          </div>
                          <div className="col-span-8">
                            <Select
                              value={m.notes || 'After food'}
                              onValueChange={(val) =>
                                setMeds(meds.map((x, j) => (j === i ? { ...x, notes: val } : x)))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Instruction" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="After food">After food</SelectItem>
                                <SelectItem value="Before food">Before food</SelectItem>
                                <SelectItem value="Empty stomach">Empty stomach</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Advice / notes</Label>
                  <Textarea
                    placeholder="Diet, exercise, follow-up…"
                    className="mt-1.5"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 px-4">
                <Button variant="outline" onClick={() => setDetailedOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleIssueDetailedPrescription}>Issue prescription</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {printData && <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />}
    </>
  );
}
