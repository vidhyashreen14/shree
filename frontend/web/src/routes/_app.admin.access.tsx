import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  KeyRound,
  UserPlus,
  Monitor,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  Lock,
  Unlock,
  RefreshCw,
  Stethoscope,
  Users,
  HeartPulse,
  Pill,
  FlaskConical,
  Shield,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import { useCredentials, type StaffAccount } from '@/lib/store/credentials';
import { useAuth } from '@/lib/store/auth';
import { useAudit } from '@/lib/store/audit';
import { ROLE_HOME } from '@/lib/rbac';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';
import { departments } from '@/lib/mock/data';

export const Route = createFileRoute('/_app/admin/access')({
  head: () => ({
    meta: [
      { title: 'Access Management · MediCore Admin' },
      { name: 'description', content: 'Create login credentials and monitor staff dashboards.' },
    ],
  }),
  component: AccessManagement,
});

// ─── Constants ──────────────────────────────────────────────────────────────

const STAFF_ROLES: {
  value: Role;
  label: string;
  icon: typeof Shield;
  color: string;
  description: string;
}[] = [
  {
    value: 'frontdesk',
    label: 'Front Desk',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    description: 'Registration & appointments',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    description: 'Patient care & prescriptions',
  },
  {
    value: 'nurse',
    label: 'Nurse',
    icon: HeartPulse,
    color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    description: 'Vitals & observations',
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    description: 'Inventory & dispensing',
  },
  {
    value: 'lab',
    label: 'Laboratory',
    icon: FlaskConical,
    color: 'bg-violet-500/10 text-violet-600 border-violet-200',
    description: 'Test orders & reports',
  },
];

const ALL_MONITOR_ROLES: {
  value: Role;
  label: string;
  icon: typeof Shield;
  color: string;
  path: string;
  description: string;
  stats: { label: string; value: string }[];
}[] = [
  {
    value: 'frontdesk',
    label: 'Front Desk',
    icon: Users,
    color: 'from-blue-500 to-blue-700',
    path: '/frontdesk',
    description: 'Patient registration, appointments & queue management',
    stats: [
      { label: "Today's check-ins", value: '47' },
      { label: 'Queue', value: '12' },
    ],
  },
  {
    value: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    color: 'from-emerald-500 to-emerald-700',
    path: '/doctor',
    description: 'Patient consultations, prescriptions & lab orders',
    stats: [
      { label: 'In queue', value: '8' },
      { label: 'Completed', value: '23' },
    ],
  },
  {
    value: 'nurse',
    label: 'Nurse',
    icon: HeartPulse,
    color: 'from-pink-500 to-pink-700',
    path: '/nurse',
    description: 'Vitals recording, patient observations & triage',
    stats: [
      { label: 'Vitals recorded', value: '31' },
      { label: 'Pending', value: '5' },
    ],
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    color: 'from-amber-500 to-amber-700',
    path: '/pharmacy',
    description: 'Medicine dispensing, inventory & billing',
    stats: [
      { label: 'Orders today', value: '64' },
      { label: 'Low stock', value: '3' },
    ],
  },
  {
    value: 'lab',
    label: 'Laboratory',
    icon: FlaskConical,
    color: 'from-violet-500 to-violet-700',
    path: '/lab',
    description: 'Lab tests, reports upload & pending work',
    stats: [
      { label: 'Pending tests', value: '14' },
      { label: 'Completed', value: '36' },
    ],
  },
];

const statusTone = { active: 'success', suspended: 'danger' } as const;

// ─── Password Strength ───────────────────────────────────────────────────────

function getPasswordStrength(pwd: string): { score: number; label: string; color: string } {
  if (pwd.length === 0) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { score: 1, label: 'Weak', color: 'bg-red-500' },
    { score: 2, label: 'Fair', color: 'bg-amber-500' },
    { score: 3, label: 'Good', color: 'bg-blue-500' },
    { score: 4, label: 'Strong', color: 'bg-emerald-500' },
  ];
  return map[score - 1] ?? { score: 0, label: 'Very weak', color: 'bg-red-600' };
}

// ─── Create Account Modal ────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateAccountModal({ open, onClose }: CreateModalProps) {
  const addAccount = useCredentials((s) => s.addAccount);
  const addLog = useAudit((s) => s.addLog);
  const adminUser = useAuth((s) => s.user);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'frontdesk' as Role,
    department: '',
    password: '',
    confirm: '',
  });

  const strength = getPasswordStrength(form.password);
  const valid =
    form.name.trim() !== '' &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.password.length >= 6 &&
    form.password === form.confirm &&
    (form.role === 'doctor' ? form.department.trim() !== '' : true);

  const handleCreate = () => {
    if (!valid) {
      toast.error('Please fill all fields correctly');
      return;
    }
    addAccount({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      department: form.role === 'doctor' ? form.department.trim() : '',
      passwordHash: btoa(form.password),
    });
    addLog({
      user: adminUser?.name || 'System Admin',
      role: adminUser?.role || 'admin',
      action: 'Created login access',
      target: `${form.name.trim()} (${form.role})`,
    });
    toast.success(`Login access created for ${form.name}`, {
      description: `${form.email} can now sign in as ${STAFF_ROLES.find((r) => r.value === form.role)?.label}.`,
    });
    setForm({ name: '', email: '', role: 'frontdesk', department: '', password: '', confirm: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <KeyRound className="h-4 w-4 text-primary" />
            </span>
            Create Login Access
          </DialogTitle>
          <DialogDescription>
            Create email & password credentials for a staff member to access their dashboard.
          </DialogDescription>
        </DialogHeader>

        {/* Role Selector */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Select Role
          </Label>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {STAFF_ROLES.map((r) => {
              const Icon = r.icon;
              const active = form.role === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value, department: '' })}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all text-xs font-medium',
                    active
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40 text-primary'
                      : 'border-border bg-background hover:border-primary/40 hover:bg-accent/40 text-muted-foreground'
                  )}
                >
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-lg',
                      active ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-tight">{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {STAFF_ROLES.find((r) => r.value === form.role)?.description}
          </p>
        </div>

        <div className="grid gap-4">
          {/* Name + Department row */}
          <div className={cn('grid gap-3', form.role === 'doctor' ? 'grid-cols-2' : 'grid-cols-1')}>
            <div>
              <Label htmlFor="ac-name">Full name</Label>
              <Input
                id="ac-name"
                placeholder={form.role === 'doctor' ? 'e.g. Dr. Arjun Nair' : 'e.g. Arjun Nair'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            {form.role === 'doctor' && (
              <div>
                <Label htmlFor="ac-dept">Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(val) => setForm({ ...form, department: val })}
                >
                  <SelectTrigger id="ac-dept" className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="ac-email">Work email</Label>
            <Input
              id="ac-email"
              type="email"
              placeholder="staff@hospital.io"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="ac-pwd">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="ac-pwd"
                type={showPwd ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all',
                        n <= strength.score ? strength.color : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    strength.score >= 3 ? 'text-emerald-600' : 'text-amber-600'
                  )}
                >
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="ac-confirm">Confirm password</Label>
            <div className="relative mt-1.5">
              <Input
                id="ac-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className={cn(
                  form.confirm && form.confirm !== form.password ? 'border-destructive' : ''
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.confirm && form.confirm !== form.password && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!valid} id="btn-create-access">
            <KeyRound className="mr-2 h-4 w-4" /> Create Login Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reset Password Modal ────────────────────────────────────────────────────

function ResetPasswordModal({
  account,
  onClose,
}: {
  account: StaffAccount | null;
  onClose: () => void;
}) {
  const resetPassword = useCredentials((s) => s.resetPassword);
  const addLog = useAudit((s) => s.addLog);
  const adminUser = useAuth((s) => s.user);
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const strength = getPasswordStrength(pwd);
  const valid = pwd.length >= 6 && pwd === confirm;

  const handle = () => {
    if (!valid || !account) return;
    resetPassword(account.id, pwd);
    addLog({
      user: adminUser?.name || 'System Admin',
      role: adminUser?.role || 'admin',
      action: 'Reset password',
      target: `${account.name} (${account.role})`,
    });
    toast.success(`Password reset for ${account.name}`);
    setPwd('');
    setConfirm('');
    onClose();
  };

  return (
    <Dialog open={!!account} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>Set a new password for {account?.name}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label htmlFor="rp-pwd">New password</Label>
            <div className="relative mt-1.5">
              <Input
                id="rp-pwd"
                type={show ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwd && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={cn(
                        'h-1 flex-1 rounded-full',
                        n <= strength.score ? strength.color : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">{strength.label}</span>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="rp-confirm">Confirm password</Label>
            <Input
              id="rp-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5"
            />
            {confirm && confirm !== pwd && (
              <p className="mt-1 text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handle} disabled={!valid}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Staff Accounts Tab ──────────────────────────────────────────────────────

function StaffAccountsTab({ onCreateClick }: { onCreateClick: () => void }) {
  const accounts = useCredentials((s) => s.accounts);
  const suspendAccount = useCredentials((s) => s.suspendAccount);
  const reactivateAccount = useCredentials((s) => s.reactivateAccount);
  const addLog = useAudit((s) => s.addLog);
  const adminUser = useAuth((s) => s.user);
  const [resetTarget, setResetTarget] = useState<StaffAccount | null>(null);

  const columns = useMemo<ColumnDef<StaffAccount>[]>(
    () => [
      {
        header: 'Staff Member',
        accessorKey: 'name',
        cell: ({ row }) => {
          const r = row.original;
          const roleInfo = STAFF_ROLES.find((x) => x.value === r.role);
          return (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold',
                  roleInfo?.color ?? 'bg-muted text-muted-foreground'
                )}
              >
                {r.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ getValue }) => {
          const r = getValue() as Role;
          const info = STAFF_ROLES.find((x) => x.value === r);
          return <StatusChip tone="primary">{info?.label ?? r}</StatusChip>;
        },
      },
      { header: 'Department', accessorKey: 'department' },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const s = getValue() as StaffAccount['status'];
          return (
            <StatusChip tone={statusTone[s]}>{s === 'suspended' ? 'deactivated' : s}</StatusChip>
          );
        },
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {new Date(getValue() as string).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => {
          const a = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(`Email: ${a.email}\nPassword: [Set by admin]`);
                    toast.success('Credentials info copied');
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setResetTarget(a)}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset password
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {a.status === 'active' ? (
                  <DropdownMenuItem
                    className="text-amber-600"
                    onClick={() => {
                      suspendAccount(a.id);
                      addLog({
                        user: adminUser?.name || 'System Admin',
                        role: adminUser?.role || 'admin',
                        action: 'Deactivated access',
                        target: `${a.name} (${a.role})`,
                      });
                      toast.success(`${a.name} deactivated`);
                    }}
                  >
                    <Lock className="mr-2 h-4 w-4" /> Deactivate
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-emerald-600"
                    onClick={() => {
                      reactivateAccount(a.id);
                      addLog({
                        user: adminUser?.name || 'System Admin',
                        role: adminUser?.role || 'admin',
                        action: 'Reactivated access',
                        target: `${a.name} (${a.role})`,
                      });
                      toast.success(`${a.name} reactivated`);
                    }}
                  >
                    <Unlock className="mr-2 h-4 w-4" /> Reactivate access
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [suspendAccount, reactivateAccount]
  );

  return (
    <>
      <ResetPasswordModal account={resetTarget} onClose={() => setResetTarget(null)} />

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted py-16 text-center">
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">No staff accounts yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create login credentials for your front desk, doctors, nurses, pharmacy, and lab staff.
          </p>
          <Button className="mt-6" onClick={onCreateClick} id="btn-empty-create">
            <UserPlus className="mr-2 h-4 w-4" /> Create first account
          </Button>
        </div>
      ) : (
        <DataTable columns={columns} data={accounts} searchPlaceholder="Search staff accounts…" />
      )}
    </>
  );
}
// ─── Main Page ───────────────────────────────────────────────────────────────

function AccessManagement() {
  const [createOpen, setCreateOpen] = useState(false);
  const accounts = useCredentials((s) => s.accounts);
  const activeCount = accounts.filter((a) => a.status === 'active').length;

  return (
    <>
      <CreateAccountModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <PageHeader
        eyebrow="Administration"
        title="Access Management"
        description="Create login credentials for staff members to access their dashboard."
        actions={
          <Button onClick={() => setCreateOpen(true)} id="btn-create-login-access">
            <UserPlus className="mr-2 h-4 w-4" /> Create Login Access
          </Button>
        }
      />

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total accounts', value: accounts.length, color: 'text-primary' },
          { label: 'Active', value: activeCount, color: 'text-emerald-600' },
          { label: 'Deactivated', value: accounts.length - activeCount, color: 'text-amber-600' },
          {
            label: 'Roles covered',
            value: new Set(accounts.map((a) => a.role)).size,
            color: 'text-blue-600',
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border bg-card px-4 py-3">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <StaffAccountsTab onCreateClick={() => setCreateOpen(true)} />
    </>
  );
}
