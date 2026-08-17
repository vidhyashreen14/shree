import { createFileRoute } from '@tanstack/react-router';
import { Save, ShieldCheck, CreditCard, Paintbrush, Globe, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/superadmin/settings')({
  component: SystemSettings,
});

function SystemSettings() {
  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure global platform parameters and integrations.
          </p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <nav className="flex flex-col gap-2">
          <Button variant="secondary" className="justify-start gap-2">
            <Globe className="h-4 w-4" /> General Settings
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Paintbrush className="h-4 w-4" /> Branding
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Mail className="h-4 w-4" /> Email Server (SMTP)
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <Smartphone className="h-4 w-4" /> SMS / WhatsApp
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <CreditCard className="h-4 w-4" /> Payment Gateways
          </Button>
          <Button variant="ghost" className="justify-start gap-2">
            <ShieldCheck className="h-4 w-4" /> Security
          </Button>
        </nav>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Details</CardTitle>
              <CardDescription>Basic information about your SaaS platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Platform Name</label>
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="MediCore Health Systems"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Support Email</label>
                  <input
                    type="email"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="support@medicore.io"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Timezone</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional & Compliance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Strict Data Localization</p>
                  <p className="text-sm text-muted-foreground">
                    Store tenant data strictly in their registered region.
                  </p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-medium">Force Multi-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require all Super Admins to use 2FA.
                  </p>
                </div>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
