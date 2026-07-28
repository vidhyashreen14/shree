import { createFileRoute } from '@tanstack/react-router';
import { Download, BarChart, PieChart, TrendingUp, Calendar, Table2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_app/superadmin/reports')({
  component: ReportsManagement,
});

const REPORT_TYPES = [
  {
    name: 'Hospital Growth Report',
    desc: 'Monthly tenant acquisition and churn.',
    icon: TrendingUp,
  },
  { name: 'Subscription Revenue', desc: 'Detailed revenue breakdown by tier.', icon: BarChart },
  { name: 'Module Usage Analytics', desc: 'Adoption rates for add-on modules.', icon: PieChart },
  { name: 'User Activity Summary', desc: 'Daily active users across all hospitals.', icon: Table2 },
];

function ReportsManagement() {
  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">System Reports</h1>
          <p className="text-muted-foreground">Generate and export global analytics and reports.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {REPORT_TYPES.map((r, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="rounded-lg bg-primary/10 text-primary p-3 w-fit mb-4 group-hover:scale-110 transition-transform">
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">{r.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="flex-1">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Select parameters to build a custom report.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option>Revenue Report</option>
                  <option>Hospital Activity Report</option>
                  <option>Subscription Report</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-muted-foreground"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Pick a date range
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    className="accent-primary"
                    defaultChecked
                  />{' '}
                  CSV
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="format" value="pdf" className="accent-primary" /> PDF
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="format" value="excel" className="accent-primary" />{' '}
                  Excel
                </label>
              </div>
            </div>

            <Button className="w-fit gap-2 mt-4">
              <Download className="h-4 w-4" />
              Generate & Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
