import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { appointments, patients, doctors } from "@/lib/mock/data";
import { isToday, format } from "date-fns";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";

export const Route = createFileRoute("/_app/nurse/queue")({
  component: NurseQueue,
});

function NurseQueue() {
  const today = appointments.filter((a) => isToday(new Date(a.date)));
  return (
    <>
      <PageHeader title="Patient queue" description="All patients in today's OPD pipeline." />
      <div className="grid grid-cols-1 gap-3">
        {today.map((a) => {
          const p = patients.find((x) => x.id === a.patientId)!;
          const d = doctors.find((x) => x.id === a.doctorId);
          return (
            <div key={a.id} className="surface-elevated flex flex-wrap items-center gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 font-display font-bold text-primary">
                #{a.token}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.age}y · {d?.name} · {format(new Date(a.date), "p")}
                </p>
              </div>
              <AppointmentStatusChip status={a.status} />
            </div>
          );
        })}
      </div>
    </>
  );
}
