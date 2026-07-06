import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/lib/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { StatusChip } from "@/components/common/StatusChip";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

function Profile() {
  const user = useAuth((s) => s.user);
  const update = useAuth((s) => s.updateProfile);
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    department: user?.department ?? "",
  });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  return (
    <>
      <PageHeader title="Your profile" description="Manage personal info and security." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-elevated p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-1 flex gap-2"><StatusChip tone="primary">{user?.role}</StatusChip><StatusChip tone="neutral">{user?.department}</StatusChip></div>
            </div>
          </div>

          <form
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); update(form); toast.success("Profile updated"); }}
          >
            <div><Label>Full name</Label><Input className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input className="mt-1.5" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input className="mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Department</Label><Input className="mt-1.5" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>About</Label><Textarea className="mt-1.5" placeholder="Brief intro shown on your patient-facing profile." /></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit">Save changes</Button></div>
          </form>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Change password</h3>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (pwd.next !== pwd.confirm) return toast.error("Passwords don't match");
              toast.success("Password updated");
              setPwd({ current: "", next: "", confirm: "" });
            }}
          >
            <div><Label>Current password</Label><Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} className="mt-1.5" /></div>
            <div><Label>New password</Label><Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} className="mt-1.5" /></div>
            <div><Label>Confirm</Label><Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} className="mt-1.5" /></div>
            <Button type="submit" className="w-full">Update password</Button>
          </form>
        </div>
      </div>
    </>
  );
}
