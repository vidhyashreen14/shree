import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Building2, Users, Stethoscope, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDepartments } from '@/lib/store/departments';
import { useStaffProfiles } from '@/lib/store/staffProfiles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/admin/departments')({
  component: AdminDepartments,
});

function AdminDepartments() {
  const { addDepartment, removeDepartment } = useDepartments();

  const departments = useDepartments((s) => s.departments);
  const staff = useStaffProfiles((s) => s.profiles);
  const docProfiles = useMemo(() => staff.filter((p) => p.role === 'doctor'), [staff]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Department name is required');
      return;
    }
    const headDoc = docProfiles.find((d) => d.id === headId);
    const headName = headDoc ? `Dr. ${headDoc.firstName} ${headDoc.lastName}` : 'TBD';

    addDepartment(name.trim(), headName);
    toast.success(`Department "${name.trim()}" created successfully`);
    setOpen(false);
    setName('');
    setHeadId('');
  };

  return (
    <>
      <PageHeader
        title="Departments"
        description="Specialty units and their on-duty headcount."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="dept-name">Department Name</Label>
                  <Input
                    id="dept-name"
                    placeholder="e.g. Cardiology"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dept-head">Assign Head Doctor</Label>
                  <Select value={headId} onValueChange={setHeadId}>
                    <SelectTrigger id="dept-head" className="mt-1.5">
                      <SelectValue placeholder="Select doctor…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / TBD</SelectItem>
                      {docProfiles.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          Dr. {doc.firstName} {doc.lastName} — {doc.department || 'Unassigned'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const liveCount = docProfiles.filter((p) => p.department === d.name).length;
          return (
            <div
              key={d.id}
              className="surface-elevated group relative overflow-hidden p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                    Active
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    onClick={() => {
                      removeDepartment(d.id);
                      toast.success(`Department "${d.name}" deleted`);
                    }}
                    title="Delete Department"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{d.name}</h3>
              <p className="text-xs text-muted-foreground">Head: {d.head}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Stethoscope className="h-3 w-3" /> Doctors
                  </p>
                  <p className="font-display text-xl font-bold">{liveCount}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> Today
                  </p>
                  <p className="font-display text-xl font-bold">{d.patientsToday}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
