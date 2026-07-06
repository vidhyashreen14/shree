import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { appointments, patients, doctors } from "@/lib/mock/data";
import { isToday, format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/frontdesk/queue")({
  component: FdQueue,
});

function FdQueue() {
  const initial = appointments.filter((a) => isToday(new Date(a.date))).sort((a, b) => (a.token ?? 0) - (b.token ?? 0));
  const [rows, setRows] = useState(initial);

  return (
    <>
      <PageHeader title="Live queue" description="Check in patients and manage tokens." />

      <div className="grid grid-cols-1 gap-3">
        {rows.map((a) => {
          const p = patients.find((x) => x.id === a.patientId)!;
          const d = doctors.find((x) => x.id === a.doctorId);
          return (
            <div key={a.id} className="surface-elevated flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">#{a.token}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name} <span className="text-xs text-muted-foreground">· {p.mrn}</span></p>
                <p className="text-xs text-muted-foreground">{d?.name} · {format(new Date(a.date), "p")}</p>
              </div>
              <AppointmentStatusChip status={a.status} />
              {a.status === "scheduled" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setRows((r) => r.map((x) => (x.id === a.id ? { ...x, status: "checked-in" } : x)));
                    toast.success(`${p.name} checked in`);
                  }}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Check in
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
