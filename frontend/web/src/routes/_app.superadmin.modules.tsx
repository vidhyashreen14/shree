import { createFileRoute } from '@tanstack/react-router';
import { PackageSearch, Settings2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/superadmin/modules')({
  component: ModulesManagement,
});

const DEMO_MODULES = [
  {
    id: 'mod_opd',
    name: 'OPD Management',
    description: 'Outpatient registration, queue, and vitals.',
    enabled: true,
    usage: '128 Hospitals',
  },
  {
    id: 'mod_ipd',
    name: 'IPD Management',
    description: 'Inpatient admission, bed tracking, and discharge.',
    enabled: true,
    usage: '94 Hospitals',
  },
  {
    id: 'mod_pharmacy',
    name: 'Pharmacy & Inventory',
    description: 'Medicine stock, purchase orders, and billing.',
    enabled: true,
    usage: '112 Hospitals',
  },
  {
    id: 'mod_lab',
    name: 'Laboratory System',
    description: 'Test orders, sample collection, and reporting.',
    enabled: true,
    usage: '85 Hospitals',
  },
  {
    id: 'mod_billing',
    name: 'Advanced Billing',
    description: 'Insurance claims, tax configurations, and invoices.',
    enabled: false,
    usage: '0 Hospitals',
  },
];

function ModulesManagement() {
  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Module Management</h1>
          <p className="text-muted-foreground">
            Enable, disable, and configure global platform modules.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {DEMO_MODULES.map((mod) => (
          <Card key={mod.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PackageSearch className="h-5 w-5 text-primary" />
                  {mod.name}
                </CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </div>
              <Switch checked={mod.enabled} />
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Active in <span className="font-medium text-foreground">{mod.usage}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Shield className="h-3.5 w-3.5" />
                    Permissions
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Settings2 className="h-3.5 w-3.5" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
