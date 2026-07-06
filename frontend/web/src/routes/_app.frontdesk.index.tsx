import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { Users, CalendarDays, UserPlus, Hourglass } from "lucide-react";
import { appointments, patients, doctors } from "@/lib/mock/data";
import { isToday, format } from "date-fns";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/frontdesk/")({
  component: FrontDeskOverview,
});

function FrontDeskOverview() {
  const today = appointments.filter((a) => isToday(new Date(a.date)));
  const waiting = today.filter((a) => a.status === "checked-in").length;
  const inConsult = today.filter((a) => a.status === "in-consultation").length;

  return (
    <>
      <PageHeader
        eyebrow="Front desk"
        title="Reception command center"
        description="Today's footfall, walk-ins and live queue at a glance."
        actions={<Link to="/frontdesk/register"><Button><UserPlus className="mr-2 h-4 w-4" /> Register patient</Button></Link>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's appointments" value={today.length} icon={CalendarDays} tone="primary" />
        <StatCard label="Waiting" value={waiting} icon={Hourglass} tone="warning" />
        <StatCard label="In consultation" value={inConsult} icon={Users} tone="info" />
        <StatCard label="Registered today" value="14" icon={UserPlus} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Live queue</h3>
          <div className="mt-3 divide-y divide-border">
            {today.slice(0, 6).map((a) => {
              const p = patients.find((x) => x.id === a.patientId)!;
              const d = doctors.find((x) => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">#{a.token}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{d?.name} · {format(new Date(a.date), "p")}</p>
                  </div>
                  <AppointmentStatusChip status={a.status} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="surface-elevated p-5">
          <h3 className="font-display font-semibold">Doctor availability</h3>
          <div className="mt-3 divide-y divide-border">
            {doctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {d.name.split(" ").slice(-1)[0]?.[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{d.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{d.specialization}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${d.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {d.available ? "Available" : "Off"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
