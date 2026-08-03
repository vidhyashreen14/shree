import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreHorizontal, Mail } from 'lucide-react';
import { ROLES } from '@/lib/rbac';
import type { Role } from '@/lib/types';
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

import { useStaffProfiles } from '@/lib/store/staffProfiles';
import { useDepartments } from '@/lib/store/departments';

export const Route = createFileRoute('/_app/admin/users')({
  component: AdminUsers,
});

interface RowUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: 'active' | 'invited' | 'suspended';
}

const statusTone = { active: 'success', invited: 'info', suspended: 'danger' } as const;

function AdminUsers() {
  const { profiles, addProfile } = useStaffProfiles();
  const deptsList = useDepartments((s) => s.departments);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'doctor' as Role, department: '' });

  const rows = useMemo<RowUser[]>(() => {
    return profiles.map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      email: p.email,
      role: p.role,
      department: p.department || 'Unassigned',
      status: p.status === 'active' ? ('active' as const) : ('suspended' as const),
    }));
  }, [profiles]);

  const columns = useMemo<ColumnDef<RowUser>[]>(
    () => [
      {
        header: 'User',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {row.original.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip>,
      },
      { header: 'Department', accessorKey: 'department' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const s = getValue() as RowUser['status'];
          return <StatusChip tone={statusTone[s]}>{s}</StatusChip>;
        },
      },
      {
        header: '',
        id: 'actions',
        cell: () => (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="User management"
        description="Invite teammates, manage roles, and control access across the hospital."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Invite user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a new user</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="n">Full name</Label>
                  <Input
                    id="n"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="e">Email</Label>
                  <Input
                    id="e"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v as Role })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="d">Department</Label>
                    <Select
                      value={form.department}
                      onValueChange={(v) => setForm({ ...form, department: v })}
                    >
                      <SelectTrigger id="d" className="mt-1.5">
                        <SelectValue placeholder="Select dept…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / General</SelectItem>
                        {deptsList.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!form.name || !form.email) {
                      toast.error('Name and email required');
                      return;
                    }
                    const parts = form.name.trim().split(' ');
                    const firstName = parts[0] || 'Staff';
                    const lastName = parts.slice(1).join(' ') || 'Member';
                    addProfile({
                      firstName,
                      lastName,
                      email: form.email,
                      role: form.role,
                      department:
                        form.department && form.department !== 'none' ? form.department : undefined,
                      gender: 'male',
                      dateOfBirth: '1990-01-01',
                      mobile: '+91 99999 99999',
                      address: 'Hospital Premises',
                      city: 'Mumbai',
                      state: 'Maharashtra',
                      country: 'India',
                      pinCode: '400001',
                      emergencyContactPerson: 'HR Manager',
                      emergencyContactNumber: '+91 99999 99999',
                    });
                    toast.success(`Invitation sent to ${form.email}`);
                    setOpen(false);
                    setForm({ name: '', email: '', role: 'doctor', department: '' });
                  }}
                >
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable columns={columns} data={rows} searchPlaceholder="Search users…" />
    </>
  );
}
