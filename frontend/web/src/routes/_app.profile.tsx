import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { StatusChip } from '@/components/common/StatusChip';
import { allowOnlyAlphabets, passwordSchema } from '@/lib/validations';

export const Route = createFileRoute('/_app/profile')({
  component: Profile,
});

function Profile() {
  const user = useAuth((s) => s.user);
  const update = useAuth((s) => s.updateProfile);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    department: user?.department ?? '',
    specialization: user?.specialization ?? '',
    superSpecialization: user?.superSpecialization ?? '',
    qualification: user?.qualification ?? '',
    experience: user?.experience ?? '',
    registrationNumber: user?.registrationNumber ?? '',
    registrationCouncil: user?.registrationCouncil ?? '',
    registrationValidTill: user?.registrationValidTill ?? '',
    languagesSpoken: user?.languagesSpoken ?? '',
    biography: user?.biography ?? '',
  });

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });

  return (
    <>
      <PageHeader title="Your profile" description="Manage personal info and security." />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="surface-elevated p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {user?.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-1 flex gap-2">
                <StatusChip tone="primary">{user?.role}</StatusChip>
                <StatusChip tone="neutral">{user?.department}</StatusChip>
              </div>
            </div>
          </div>

          <form
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              update(form);
              toast.success('Profile updated');
            }}
          >
            <div>
              <Label>Full name</Label>
              <Input
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                className="mt-1.5"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1.5"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            {user?.role === 'doctor' && (
              <>
                <div className="sm:col-span-2 mt-4">
                  <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground border-b pb-1">
                    Professional & Medical Registration
                  </h4>
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    className="mt-1.5"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="e.g. Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="superSpecialization">Super Specialization</Label>
                  <Input
                    id="superSpecialization"
                    className="mt-1.5"
                    value={form.superSpecialization}
                    onChange={(e) => setForm({ ...form, superSpecialization: e.target.value })}
                    placeholder="e.g. Interventional Cardiology"
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    className="mt-1.5"
                    value={form.qualification}
                    onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                    placeholder="e.g. MD, DM"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    className="mt-1.5"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="e.g. 12"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Medical Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    className="mt-1.5"
                    value={form.registrationNumber}
                    onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                    placeholder="e.g. MCM-12345"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationCouncil">Registration Council</Label>
                  <Input
                    id="registrationCouncil"
                    className="mt-1.5"
                    value={form.registrationCouncil}
                    onChange={(e) => setForm({ ...form, registrationCouncil: e.target.value })}
                    placeholder="e.g. Medical Council of India"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationValidTill">Registration Valid Till</Label>
                  <Input
                    id="registrationValidTill"
                    type="date"
                    className="mt-1.5 bg-background"
                    value={form.registrationValidTill}
                    onChange={(e) => setForm({ ...form, registrationValidTill: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="languagesSpoken">Languages Spoken</Label>
                  <Input
                    id="languagesSpoken"
                    className="mt-1.5"
                    value={form.languagesSpoken}
                    onChange={(e) => setForm({ ...form, languagesSpoken: e.target.value })}
                    placeholder="e.g. English, Hindi"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="biography">Biography</Label>
                  <Textarea
                    id="biography"
                    className="mt-1.5 resize-none"
                    rows={4}
                    value={form.biography}
                    onChange={(e) => setForm({ ...form, biography: e.target.value })}
                    placeholder="A detailed biography for patients to see."
                  />
                </div>
              </>
            )}

            {user?.role !== 'doctor' && (
              <div className="sm:col-span-2">
                <Label>About</Label>
                <Textarea
                  className="mt-1.5"
                  placeholder="Brief intro shown on your patient-facing profile."
                />
              </div>
            )}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Change password</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!passwordSchema.safeParse(pwd.next).success) {
                return toast.error('Password should contain only alphabets.');
              }
              if (pwd.next !== pwd.confirm) return toast.error("Passwords don't match");
              toast.success('Password updated');
              setPwd({ current: '', next: '', confirm: '' });
            }}
          >
            <div>
              <Label>Current password</Label>
              <Input
                type="password"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: allowOnlyAlphabets(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>New password</Label>
              <Input
                type="password"
                placeholder="Alphabets only (A-Z, a-z)"
                value={pwd.next}
                onChange={(e) => setPwd({ ...pwd, next: allowOnlyAlphabets(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Confirm</Label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: allowOnlyAlphabets(e.target.value) })}
                className="mt-1.5"
              />
            </div>
            <Button type="submit" className="w-full">
              Update password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
