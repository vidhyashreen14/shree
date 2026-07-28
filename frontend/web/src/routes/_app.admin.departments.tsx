import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { departments } from "@/lib/mock/data";
import { Building2, Users, Stethoscope, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/departments")({
  component: AdminDepartments,
});

function AdminDepartments() {
  return (
    <>
      <PageHeader
        title="Departments"
        description="Specialty units and their on-duty headcount."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New department
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <div
            key={d.id}
            className="surface-elevated group relative overflow-hidden p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                Active
              </span>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{d.name}</h3>
            <p className="text-xs text-muted-foreground">Head: {d.head}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Stethoscope className="h-3 w-3" /> Doctors
                </p>
                <p className="font-display text-xl font-bold">{d.doctorCount}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> Today
                </p>
                <p className="font-display text-xl font-bold">{d.patientsToday}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
