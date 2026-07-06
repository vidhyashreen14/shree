import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { CalendarDays, Users, ClipboardCheck, FlaskConical, ArrowRight } from "lucide-react";
import { appointments, patients, doctors, prescriptions } from "@/lib/mock/data";
import { useAuth } from "@/lib/store/auth";
import { format, isToday } from "date-fns";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/doctor/")({
  component: DoctorOverview,
});

function DoctorOverview() {
  const user = useAuth((s) => s.user);
  const doctorId = user?.role === "doctor" ? user.id : doctors[0]!.id;
  const myAppts = appointments.filter((a) => a.doctorId === doctorId);
  const today = myAppts.filter((a) => isToday(new Date(a.date)));
  const myPatients = patients.filter((p) => p.assignedDoctorId === doctorId);
  const myRx = prescriptions.filter((p) => p.doctorId === doctorId);

  const weekly = Array.from({ length: 7 }).map((_, i) => ({
    day: ["M", "T", "W", "T", "F", "S", "S"][i],
    consults: 6 + ((i * 7) % 10),
  }));

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${user?.name.split(" ").slice(-1)[0]}`}
        title="Your practice today"
        description={`${today.length} appointments scheduled · ${myPatients.length} patients under your care`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's appointments" value={today.length} icon={CalendarDays} tone="primary" />
        <StatCard label="Active patients" value={myPatients.length} icon={Users} tone="info" />
        <StatCard label="Prescriptions issued" value={myRx.length} icon={ClipboardCheck} tone="success" />
        <StatCard label="Pending lab results" value="4" icon={FlaskConical} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="surface-elevated p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">Today's queue</h3>
              <p className="text-xs text-muted-foreground">Patients in order of arrival</p>
            </div>
            <Link to="/doctor/queue" className="text-xs font-semibold text-primary hover:underline">View all <ArrowRight className="ml-0.5 inline h-3 w-3" /></Link>
          </div>
          <div className="divide-y divide-border">
            {today.slice(0, 6).map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{a.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.reason} · {format(new Date(a.date), "p")}</p>
                  </div>
                  <AppointmentStatusChip status={a.status} />
                </div>
              );
            })}
            {today.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No appointments today.</p>}
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
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="consults" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 rounded-lg bg-primary/5 p-3 text-xs">
            <p className="font-semibold text-primary">Tip</p>
            <p className="text-muted-foreground">Block follow-up slots after 4pm to improve adherence.</p>
          </div>
        </div>
      </div>
    </>
  );
}
