import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/settings")({
  component: HospitalSettings,
});

function HospitalSettings() {
  return (
    <>
      <PageHeader eyebrow="Configuration" title="Hospital settings" description="Branding, operational policy, and notifications." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="surface-elevated p-6 lg:col-span-2">
          <h3 className="font-display font-semibold">Hospital profile</h3>
          <p className="text-xs text-muted-foreground">Information shown on prescriptions and reports.</p>
          <form
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }}
          >
            <div className="sm:col-span-2">
              <Label>Hospital name</Label>
              <Input defaultValue="MediCore Multispecialty Hospital" className="mt-1.5" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 22 4000 0000" className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input defaultValue="contact@medicore.io" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Textarea defaultValue="2nd Floor, Health Plaza, Bandra Kurla Complex, Mumbai 400051" className="mt-1.5" />
            </div>
            <div>
              <Label>GST number</Label>
              <Input defaultValue="27AABCM1234L1ZP" className="mt-1.5" />
            </div>
            <div>
              <Label>License number</Label>
              <Input defaultValue="HOSP-MH-887421" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2 mt-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>

        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Operational policy</h3>
          <div className="mt-4 space-y-4">
            {[
              { label: "Allow walk-in patients", desc: "Patients without appointment" },
              { label: "SMS appointment reminders", desc: "24h before consultation" },
              { label: "Auto-assign tokens", desc: "On check-in" },
              { label: "Two-factor for admins", desc: "TOTP via authenticator app", on: true },
              { label: "Public doctor directory", desc: "Visible on hospital website" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                <Switch defaultChecked={s.on ?? i % 2 === 0} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
