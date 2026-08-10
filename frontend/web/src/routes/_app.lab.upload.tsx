import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { labOrders, patients } from '@/lib/mock/data';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export const Route = createFileRoute('/_app/lab/upload')({
  component: LabUpload,
});

function LabUpload() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <>
      <PageHeader
        title="Upload lab report"
        description="Attach a finalised report to a patient's lab order."
      />

      <form
        className="surface-elevated grid grid-cols-1 gap-5 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success('Report uploaded');
        }}
      >
        <div>
          <Label>Lab order</Label>
          <Select defaultValue={labOrders[0]!.id}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {labOrders.map((o) => {
                const p = patients.find((x) => x.id === o.patientId);
                return (
                  <SelectItem key={o.id} value={o.id}>
                    {o.id} · {p?.name} · {o.tests.join(', ')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Report title</Label>
          <Input className="mt-1.5" placeholder="e.g. Lipid panel — final" />
        </div>
        <div className="sm:col-span-2">
          <Label>Findings & interpretation</Label>
          <Textarea
            className="mt-1.5"
            rows={5}
            placeholder="Cholesterol elevated. Recommend follow-up…"
          />
        </div>

        <label className="sm:col-span-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition-colors hover:bg-muted/50">
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-semibold">
            {file?.name ?? 'Drop PDF or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">PDF · max 10MB</p>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex justify-end sm:col-span-2">
          <Button type="submit">
            <UploadCloud className="mr-2 h-4 w-4" /> Upload report
          </Button>
        </div>
      </form>
    </>
  );
}
