import { createFileRoute } from '@tanstack/react-router';
import {
  Search,
  Plus,
  MoreHorizontal,
  ShieldCheck,
  Mail,
  ShieldAlert,
  Eye,
  EyeOff,
  Save,
  Lock,
  User as UserIcon,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, sanitizeLettersOnly } from '@/lib/utils';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/_app/superadmin/users')({
  component: CompanyUsers,
});

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const INITIAL_USERS: AdminUser[] = [];

const EMPTY_FORM = { name: '', email: '', password: '' };

function CompanyUsers() {
  const [users, setUsers] = useState<AdminUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('company-users');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_USERS;
  });

  useEffect(() => {
    localStorage.setItem('company-users', JSON.stringify(users));
  }, [users]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  function validate() {
    const e: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim()) e.name = 'Admin name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleAddAdmin() {
    if (!validate()) return;
    if (users.some((u) => u.email === form.email)) {
      setErrors((e) => ({ ...e, email: 'This email is already registered.' }));
      return;
    }
    const newUser: AdminUser = {
      id: `U${Date.now()}`,
      name: form.name,
      email: form.email,
      role: 'Hospital Admin',
      status: 'Active',
      lastLogin: 'Never',
    };
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Admin "${form.name}" added successfully!`, {
      description: `Login credentials sent to ${form.email}`,
    });
    setForm(EMPTY_FORM);
    setErrors({});
    setDialogOpen(false);
  }

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u,
      ),
    );
    toast.success('Admin status updated.');
  }

  function removeUser(id: string) {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success('Admin removed.');
  }

  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground">
            Add and manage hospital administrators and internal staff.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setForm(EMPTY_FORM);
            setErrors({});
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Admin
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Admins', value: users.length, color: 'bg-primary/10 text-primary' },
          {
            label: 'Active',
            value: users.filter((u) => u.status === 'Active').length,
            color: 'bg-emerald-100 text-emerald-700',
          },
          {
            label: 'Inactive',
            value: users.filter((u) => u.status === 'Inactive').length,
            color: 'bg-rose-100 text-rose-700',
          },
          {
            label: 'Hospital Admins',
            value: users.filter((u) => u.role === 'Hospital Admin').length,
            color: 'bg-amber-100 text-amber-700',
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                <h2 className="text-2xl font-bold mt-1">{s.value}</h2>
              </div>
              <span
                className={cn(
                  'rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold',
                  s.color,
                )}
              >
                {s.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="flex-1">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle>All Administrators</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search admins..."
                className="pl-9 w-[250px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Admin</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last Login</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No admins found.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {u.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Mail className="h-3 w-3" />
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {u.role === 'Super Admin' ? (
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        ) : u.role === 'Hospital Admin' ? (
                          <UserCog className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{u.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700',
                        )}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{u.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStatus(u.id)}>
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'} Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onClick={() => removeUser(u.id)}
                          >
                            Remove Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <UserCog className="h-5 w-5 text-primary" />
              Add New Admin
            </DialogTitle>
            <DialogDescription>
              Create login credentials for a new hospital administrator. They will receive an email
              to activate their account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Admin Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-name">
                Admin Name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-name"
                  placeholder="e.g. Dr. Rajan Mehta"
                  className={cn(
                    'pl-9',
                    errors.name && 'border-rose-500 focus-visible:ring-rose-500',
                  )}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: sanitizeLettersOnly(e.target.value) }))
                  }
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">
                Email ID <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@hospital.com"
                  className={cn(
                    'pl-9',
                    errors.email && 'border-rose-500 focus-visible:ring-rose-500',
                  )}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="admin-password">
                Password <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className={cn(
                    'pl-9 pr-10',
                    errors.password && 'border-rose-500 focus-visible:ring-rose-500',
                  )}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-500">{errors.password}</p>}
            </div>

            {/* Role info badge */}
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
              <UserCog className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-muted-foreground">
                This account will be created with{' '}
                <span className="font-semibold text-primary">Hospital Admin</span> role.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={handleAddAdmin}>
              <Save className="h-4 w-4" />
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
