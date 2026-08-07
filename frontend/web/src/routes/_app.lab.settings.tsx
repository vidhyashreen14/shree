import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { STANDALONE_LAB_CONFIG, ReportConfig } from "@/lib/mock/data";

export const Route = createFileRoute("/_app/lab/settings")({
  component: LabSettings,
});

function LabSettings() {
  const [config, setConfig] = useState<ReportConfig>(STANDALONE_LAB_CONFIG);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    toast.success("Laboratory report configuration saved successfully.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Laboratory · Standalone"
        title="Laboratory Settings"
        description="Manage the report template and details for your laboratory."
        actions={
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Configuration
          </Button>
        }
      />
      
      <div className="mx-auto mt-6 max-w-4xl space-y-6 pb-12">
        <div className="surface-elevated p-6">
          <h2 className="font-display text-lg font-bold mb-1">Laboratory Details</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These details will appear in the header of your printed laboratory reports.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Laboratory Name</label>
              <input
                type="text"
                name="hospitalName"
                value={config.hospitalName}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Address</label>
              <input
                type="text"
                name="address"
                value={config.address}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={config.phone}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Email Address</label>
              <input
                type="text"
                name="email"
                value={config.email}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Website</label>
              <input
                type="text"
                name="website"
                value={config.website}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Accreditation Details</label>
              <input
                type="text"
                name="accreditation"
                value={config.accreditation}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="surface-elevated p-6">
          <h2 className="font-display text-lg font-bold mb-1">Report Layout & Signatures</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Customize the report headers, footers, and authorization.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Report Header Title</label>
              <input
                type="text"
                name="reportHeader"
                value={config.reportHeader}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Report Footer Text</label>
              <input
                type="text"
                name="reportFooter"
                value={config.reportFooter}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-foreground">Authorized Signatory Name/Title</label>
              <input
                type="text"
                name="authorizedSignatory"
                value={config.authorizedSignatory}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex flex-col gap-3 mt-2">
              <label className="text-xs font-semibold text-foreground">Laboratory Logo</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted/50 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                </div>
                <Button variant="outline" size="sm">Upload Logo</Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <label className="text-xs font-semibold text-foreground">Digital Signature</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-32 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted/50 text-muted-foreground">
                  <Upload className="h-5 w-5" />
                </div>
                <Button variant="outline" size="sm">Upload Signature</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
