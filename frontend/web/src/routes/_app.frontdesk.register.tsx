import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/frontdesk/register")({
  component: RegisterPatient,
});

const schema = z.object({
  name: z.string().min(2),
  age: z.coerce.number().int().min(0).max(130),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().min(1),
  address: z.string().min(2),
  emergencyName: z.string().min(2),
  emergencyPhone: z.string().min(7),
});

type FormValues = z.infer<typeof schema>;

function RegisterPatient() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "Male", bloodGroup: "O+" },
  });

  const onSubmit = (v: FormValues) => {
    toast.success(`Patient ${v.name} registered (MRN-${Math.floor(Math.random() * 90000) + 10000})`);
    form.reset();
  };

  return (
    <>
      <PageHeader eyebrow="Front desk" title="Register new patient" description="Quick onboarding for walk-in and scheduled patients." />

      <form onSubmit={form.handleSubmit(onSubmit)} className="surface-elevated grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
        <Field label="Full name" error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} placeholder="e.g. Aarav Sharma" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age" error={form.formState.errors.age?.message}>
            <Input type="number" {...form.register("age")} />
          </Field>
          <Field label="Gender">
            <Select value={form.watch("gender")} onValueChange={(v) => form.setValue("gender", v as FormValues["gender"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} placeholder="+91 …" />
        </Field>
        <Field label="Email (optional)">
          <Input type="email" {...form.register("email")} />
        </Field>
        <Field label="Blood group">
          <Select value={form.watch("bloodGroup")} onValueChange={(v) => form.setValue("bloodGroup", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Address" error={form.formState.errors.address?.message} className="sm:col-span-2">
          <Textarea {...form.register("address")} />
        </Field>
        <Field label="Emergency contact name" error={form.formState.errors.emergencyName?.message}>
          <Input {...form.register("emergencyName")} />
        </Field>
        <Field label="Emergency contact phone" error={form.formState.errors.emergencyPhone?.message}>
          <Input {...form.register("emergencyPhone")} />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <UserPlus className="mr-2 h-4 w-4" /> Register patient
          </Button>
        </div>
      </form>
    </>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
