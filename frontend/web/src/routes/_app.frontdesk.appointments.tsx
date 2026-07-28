import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { AppointmentStatusChip } from "@/components/common/AppointmentStatusChip";
import { appointments, patients, doctors } from "@/lib/mock/data";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/_app/frontdesk/appointments")({
  component: FdAppts,
});

function FdAppts() {
  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        header: "Token",
        accessorKey: "token",
        cell: ({ getValue }) => (
          <span className="font-mono font-semibold">#{String(getValue())}</span>
        ),
      },
      {
        header: "Patient",
        accessorKey: "patientId",
        cell: ({ getValue }) => patients.find((p) => p.id === getValue())?.name,
      },
      {
        header: "Doctor",
        accessorKey: "doctorId",
        cell: ({ getValue }) => doctors.find((d) => d.id === getValue())?.name,
      },
      { header: "Reason", accessorKey: "reason" },
      {
        header: "When",
        accessorKey: "date",
        cell: ({ getValue }) => format(new Date(String(getValue())), "MMM d, p"),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => (
          <AppointmentStatusChip status={getValue() as Appointment["status"]} />
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        title="Appointments"
        description="Book, reschedule and manage appointments."
        actions={
          <Button>
            <CalendarPlus className="mr-2 h-4 w-4" /> Book appointment
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="Search by patient, doctor…"
        pageSize={10}
      />
    </>
  );
}
