<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { CalendarDays, Users, ClipboardCheck, FlaskConical, ArrowRight } from "lucide-react";
import { appointments, doctors } from "@/lib/mock/data";
import { useAuth } from "@/lib/store/auth";
import { useNurseQueue } from "@/lib/store/nurseQueue";
import { usePatients } from "@/lib/store/patients";
import { useClinicalStore } from "@/lib/store/clinical";
import { format, isToday } from "date-fns";
=======
import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { AppointmentStatusChip } from '@/components/common/AppointmentStatusChip';
import {
  CalendarDays,
  Users,
  ClipboardCheck,
  FlaskConical,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { appointments, doctors } from '@/lib/mock/data';
import { useAuth } from '@/lib/store/auth';
import { useNurseQueue } from '@/lib/store/nurseQueue';
import { usePatients } from '@/lib/store/patients';
import { useClinicalStore } from '@/lib/store/clinical';
import { format, isToday } from 'date-fns';
>>>>>>> a821a0c (second update)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
<<<<<<< HEAD
} from "recharts";
import type { AppointmentStatus } from "@/lib/types";
=======
} from 'recharts';
import type { AppointmentStatus } from '@/lib/types';
import { useCurrentDoctorId } from '@/lib/store/doctors';
import { Button } from '@/components/ui/button';
import {
  PrescriptionPrintModal,
  getDoctorDetails,
  type PrescriptionPrintData,
} from './_app.doctor.patients.$id';
import { useStaffProfiles } from '@/lib/store/staffProfiles';
import { useState } from 'react';
import { toast } from 'sonner';
>>>>>>> a821a0c (second update)

export const Route = createFileRoute('/_app/doctor/')({
  component: DoctorOverview,
});

function DoctorOverview() {
  const user = useAuth((s) => s.user);
  const staffProfiles = useStaffProfiles((s) => s.profiles);
  const doctorId = useCurrentDoctorId();
  const patients = usePatients((s) => s.patients);
  const queue = useNurseQueue((s) => s.queue);
  const prescriptions = useClinicalStore((s) => s.prescriptions);

  const [printData, setPrintData] = useState<PrescriptionPrintData | null>(null);
  // Load static mock appointments
  const myAppts = appointments.filter((a) => a.doctorId === doctorId);
  const todayMock = myAppts.filter((a) => isToday(new Date(a.date)));

<<<<<<< HEAD
  // Load nurse queue entries for this doctor that are ready for consultation
  const liveQueue = queue.filter((e) => e.doctorId === doctorId && e.vitalsStatus === "done");
=======
  // Load nurse queue entries for this doctor (either vitals pending, in-progress, or done)
  const liveQueue = queue.filter((e) => e.doctorId === doctorId);
>>>>>>> a821a0c (second update)

  // Map live queue entries — embed patient info so rows are never silently dropped
  const liveRows = liveQueue.map((e) => ({
    id: e.id,
    patientId: e.patientId,
    patientName: e.patientName,
    patientAge: e.age,
    patientGender: e.gender,
    patientUhid: e.uhid,
    doctorId: e.doctorId,
    date: e.arrivedAt,
    durationMin: 15,
    reason: e.vitals?.chiefComplaint || 'OPD Consultation',
    type: e.isNewPatient ? ('walk-in' as const) : ('consultation' as const),
    status: (e.consultStatus === 'waiting' || !e.consultStatus
      ? 'checked-in'
      : e.consultStatus) as AppointmentStatus,
    token: 100 + Number(e.id.slice(-3)) || 101,
    isLive: true,
    vitals: e.vitals,
    vitalsStatus: e.vitalsStatus,
  }));

<<<<<<< HEAD
  const combinedToday = [...todayMock, ...liveRows];
  const myPatients = patients.filter(
    (p) => p.assignedDoctorId === doctorId || liveQueue.some((e) => e.patientId === p.id)
=======
  const combinedToday = [
    ...todayMock.map((r) => ({
      ...r,
      isLive: false,
      vitals: undefined,
      patientName: undefined as string | undefined,
      patientAge: undefined as number | undefined,
      patientGender: undefined as string | undefined,
      patientUhid: undefined as string | undefined,
      vitalsStatus: undefined as string | undefined,
    })),
    ...liveRows,
  ];

  const myPatients = patients.filter(
    (p) => p.assignedDoctorId === doctorId || liveQueue.some((e) => e.patientId === p.id),
>>>>>>> a821a0c (second update)
  );
  const myRx = prescriptions.filter((p) => p.doctorId === doctorId);

  const weekly = Array.from({ length: 7 }).map((_, i) => ({
    day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
    consults: 6 + ((i * 7) % 10),
  }));

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${user?.name.split(' ').slice(-1)[0]}`}
        title="Your practice today"
        description={`${combinedToday.length} appointments & queue entries today · ${myPatients.length} patients under your care`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's appointments"
          value={combinedToday.length}
          icon={CalendarDays}
          tone="primary"
        />
        <StatCard label="Active patients" value={myPatients.length} icon={Users} tone="info" />
        <StatCard
          label="Prescriptions issued"
          value={myRx.length}
          icon={ClipboardCheck}
          tone="success"
        />
        <StatCard label="Pending lab results" value="4" icon={FlaskConical} tone="warning" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Prescriptions Issued Section */}
        <div className="surface-elevated p-5 xl:col-span-3 border-l-4 border-l-emerald-500">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-emerald-600 dark:text-emerald-400">
                Recent Prescriptions
              </h3>
              <p className="text-xs text-muted-foreground">
                List of prescriptions you've recently issued
              </p>
            </div>
            <Link
              to="/doctor/prescriptions"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all <ArrowRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {myRx.slice(0, 5).map((rx) => {
              const p = patients.find((x) => x.id === rx.patientId);
              const displayName = p ? p.name : 'Unknown Patient';
              const displayUhid = p ? p.mrn : '—';
              const docDetails = getDoctorDetails(rx.doctorId, user, staffProfiles);

              return (
                <div key={rx.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                        {displayUhid}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      Diagnosis: <span className="font-medium text-foreground">{rx.diagnosis}</span>{' '}
                      · {rx.medicines.length} medicine(s)
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Issued: {format(new Date(rx.date), 'dd MMM yyyy, hh:mm a')}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      if (!p) {
                        toast.error('Patient details not found');
                        return;
                      }
                      setPrintData({
                        rxNo: `RX-${rx.id.slice(-6)}`,
                        date: format(new Date(rx.date), 'dd MMM yyyy, hh:mm a'),
                        patientName: p.name,
                        uhid: p.mrn,
                        age: p.age,
                        gender: p.gender,
                        doctorName: docDetails.name,
                        specialization: docDetails.specialization,
                        qualification: docDetails.qualification,
                        kmcNo: docDetails.kmcNo,
                        diagnosis: rx.diagnosis,
                        medicines: rx.medicines,
                        labTests: [],
                        followUp: rx.advice.includes('Follow up: ')
                          ? rx.advice.replace('Follow up: ', '').replace('.', '')
                          : undefined,
                        patientPhone: p.phone,
                        patientEmail: p.email,
                      });
                    }}
                  >
                    <Printer className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                </div>
              );
            })}
            {myRx.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No prescriptions issued yet.
              </p>
            )}
          </div>
        </div>

        <div className="surface-elevated p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Today's queue</h3>
              <p className="text-xs text-muted-foreground">Patients in order of arrival</p>
            </div>
            <Link to="/doctor/queue" className="text-xs font-semibold text-primary hover:underline">
              View all <ArrowRight className="ml-0.5 inline h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {combinedToday.slice(0, 6).map((a) => {
              // Try patients store first; fall back to embedded queue entry data
              const storePatient = patients.find((x) => x.id === a.patientId);
              const displayName = storePatient?.name ?? a.patientName ?? 'Unknown Patient';
              const displayReason = a.reason;

              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{a.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{displayName}</p>
                      {a.isLive && (
                        <>
                          {a.vitalsStatus === 'pending' && (
                            <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                              Awaiting Vitals
                            </span>
                          )}
                          {a.vitalsStatus === 'in-progress' && (
                            <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400">
                              Triage
                            </span>
                          )}
                          {a.vitalsStatus === 'done' && (
                            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Ready
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
<<<<<<< HEAD
                      {a.reason} · {format(new Date(a.date), "p")}
=======
                      {displayReason} · {format(new Date(a.date), 'p')}
>>>>>>> a821a0c (second update)
                    </p>
                  </div>
                  <AppointmentStatusChip status={a.status} />
                </div>
              );
            })}
            {combinedToday.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No appointments today.
              </p>
            )}
          </div>
        </div>

        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Weekly consultations</h3>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
<<<<<<< HEAD
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
=======
                    background: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
>>>>>>> a821a0c (second update)
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="consults"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg bg-primary/5 p-3 text-xs">
            <p className="font-semibold text-primary">Tip</p>
            <p className="text-muted-foreground">
              Block follow-up slots after 4pm to improve adherence.
            </p>
          </div>
        </div>
      </div>
      {printData && <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />}
    </>
  );
}
