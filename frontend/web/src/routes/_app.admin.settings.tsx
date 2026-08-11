import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { useFeeSettings } from '@/lib/store/feeSettings';
import { useHospitalSettings } from '@/lib/store/hospitalSettings';
import { IndianRupee, Settings2, UploadCloud } from 'lucide-react';

export const Route = createFileRoute('/_app/admin/settings')({
  head: () => ({
    meta: [
      { title: 'Hospital Settings · MediCore Admin' },
      { name: 'description', content: 'Manage hospital profile, fees, and operational policies.' },
    ],
  }),
  component: HospitalSettings,
});

function HospitalSettings() {
  const { registrationFee, consultationFee, setFees } = useFeeSettings();
  const [regFee, setRegFee] = useState(String(registrationFee));
  const [consFee, setConsFee] = useState(String(consultationFee));

  const hospital = useHospitalSettings();
  const [logoUrl, setLogoUrl] = useState(hospital.logoUrl);
  const [name, setName] = useState(hospital.name);
  const [phone, setPhone] = useState(hospital.phone);
  const [email, setEmail] = useState(hospital.email);
  const [address, setAddress] = useState(hospital.address);
  const [gstNumber, setGstNumber] = useState(hospital.gstNumber);
  const [licenseNumber, setLicenseNumber] = useState(hospital.licenseNumber);

  const saveFees = () => {
    const r = Number(regFee);
    const c = Number(consFee);
    if (isNaN(r) || isNaN(c) || r < 0 || c < 0) {
      toast.error('Please enter valid fee amounts');
      return;
    }
    setFees(r, c);
    toast.success('Fee configuration saved', {
      description: `Registration ₹${r} · Consultation ₹${c}`,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
        toast.success('Logo preview updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    hospital.updateSettings({
      logoUrl,
      name,
      phone,
      email,
      address,
      gstNumber,
      licenseNumber,
    });
    toast.success('Hospital profile updated successfully!');
  };

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Hospital settings"
        description="Branding, fee structure, operational policy, and notifications."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hospital Profile */}
        <div className="surface-elevated p-6 lg:col-span-2">
          <h3 className="font-display font-semibold">Hospital profile</h3>
          <p className="text-xs text-muted-foreground">
            Information shown on prescriptions and reports.
          </p>
          <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
            {/* Hospital Logo Section */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 pb-6 mb-2 border-b border-border">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 overflow-hidden group hover:border-primary/50 transition-colors">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Hospital Logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mx-auto mb-1 text-lg">
                      🏥
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Default Brand
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2.5">
                <div>
                  <h4 className="text-sm font-semibold">Hospital Logo</h4>
                  <p className="text-xs text-muted-foreground">
                    This logo will appear on prescriptions, invoices, and the dashboard sidebar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setLogoUrl('');
                        toast.success('Logo removed from preview');
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="hosp-name">Hospital name</Label>
              <Input
                id="hosp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-phone">Phone</Label>
              <Input
                id="hosp-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-email">Email</Label>
              <Input
                id="hosp-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="hosp-address">Address</Label>
              <Textarea
                id="hosp-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-gst">GST number</Label>
              <Input
                id="hosp-gst"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-license">License number</Label>
              <Input
                id="hosp-license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2 mt-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>

        {/* Operational Policy */}
        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Operational policy</h3>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Allow walk-in patients', desc: 'Patients without appointment' },
              { label: 'SMS appointment reminders', desc: '24h before consultation' },
              { label: 'Auto-assign tokens', desc: 'On check-in' },
              { label: 'Two-factor for admins', desc: 'TOTP via authenticator app', on: true },
              { label: 'Public doctor directory', desc: 'Visible on hospital website' },
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

        {/* Fee Configuration */}
        <div className="surface-elevated p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <IndianRupee className="h-4 w-4 text-primary" />
            </span>
            <div>
              <h3 className="font-display font-semibold">Fee configuration</h3>
              <p className="text-xs text-muted-foreground">
                These amounts are shown on the front desk payment screen for every patient visit.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="reg-fee">Registration fee (₹)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Charged once for new patients only
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  id="reg-fee"
                  type="number"
                  min={0}
                  value={regFee}
                  onChange={(e) => setRegFee(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cons-fee">Consultation fee (₹)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Charged per visit for all patients
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                  ₹
                </span>
                <Input
                  id="cons-fee"
                  type="number"
                  min={0}
                  value={consFee}
                  onChange={(e) => setConsFee(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>

            {/* Fee Preview */}
            <div className="sm:col-span-2 rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Preview — New Patient Receipt
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration fee</span>
                  <span className="font-medium">₹{regFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation fee</span>
                  <span className="font-medium">₹{consFee || 0}</span>
                </div>
                <div className="my-2 border-t border-dashed" />
                <div className="flex justify-between font-bold">
                  <span>Total (new patient)</span>
                  <span className="text-primary">
                    ₹{(Number(regFee) || 0) + (Number(consFee) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Returning patient (consultation only)</span>
                  <span>₹{Number(consFee) || 0}</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRegFee(String(registrationFee));
                  setConsFee(String(consultationFee));
                }}
              >
                Reset
              </Button>
              <Button onClick={saveFees} id="btn-save-fees">
                <Settings2 className="mr-2 h-4 w-4" /> Save fee configuration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
