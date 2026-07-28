import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';

<<<<<<< HEAD
export const Route = createFileRoute("/_app/doctor/patient-history")({
=======
export const Route = createFileRoute('/_app/doctor/patient-history')({
>>>>>>> a821a0c (second update)
  component: PatientHistory,
});

function PatientHistory() {
  return (
    <>
      <PageHeader
        title="Patient History"
        description="View patient treatment timelines and histories."
      />
      <div className="surface-elevated p-6 mt-6 rounded-xl">
        <p className="text-sm text-muted-foreground">
          No patient selected. Scan or search for a patient history profile.
        </p>
      </div>
    </>
  );
}
