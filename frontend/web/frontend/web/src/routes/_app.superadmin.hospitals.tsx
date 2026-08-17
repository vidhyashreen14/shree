import { createFileRoute } from '@tanstack/react-router';
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  Activity,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Hash,
  Save,
  MapPinned,
  CalendarClock,
  Copy,
  RefreshCw,
  Shield,
  ShieldAlert,
  KeyRound,
  Server,
  Lock,
  Check,
  UserCog,
  Users,
  ShieldCheck,
  Mail,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  cn,
  sanitizePhone,
  sanitizeLettersOnly,
  sanitizeOrgName,
  sanitizePincode,
} from '@/lib/utils';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSuperHospitals, type ClinicEntry } from '@/lib/store/superHospitals';

export const Route = createFileRoute('/_app/superadmin/hospitals')({
  component: HospitalsManagement,
});

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const EMPTY_FORM_USERS = { name: '', email: '', password: '' };

function CompanyUsersTab() {
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
    return [];
  });

  useEffect(() => {
    localStorage.setItem('company-users', JSON.stringify(users));
  }, [users]);

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM_USERS);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM_USERS>>({});

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  function validate() {
    const e: Partial<typeof EMPTY_FORM_USERS> = {};
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
    setForm(EMPTY_FORM_USERS);
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
          <h2 className="text-2xl font-bold tracking-tight">Admin Management</h2>
          <p className="text-muted-foreground text-sm">
            Add and manage hospital administrators and internal staff.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setForm(EMPTY_FORM_USERS);
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
            <CardTitle className="text-lg">All Administrators</CardTitle>
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

const EMPTY_FORM = {
  name: '',
  contact: '',
  address: '',
  branch: '',
  pincode: '',
  openingTime: '09:00',
  closingTime: '21:00',
};

function HospitalsManagement() {
  const { hospitals, addHospital, updateHospital, deleteHospital } = useSuperHospitals();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [viewEntry, setViewEntry] = useState<ClinicEntry | null>(null);

  // Access Management states
  const [accessEntry, setAccessEntry] = useState<ClinicEntry | null>(null);
  const [activeAccessTab, setActiveAccessTab] = useState('admin');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // New Admin Creation inside Access state variables
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminsList, setAdminsList] = useState([
    { name: 'Dr. A. Sharma', clinic: 'Apollo Clinics' },
    { name: 'Dr. B. Singh', clinic: 'City Care Hospital' },
    { name: 'Dr. C. Rao', clinic: 'Sunrise Medical Center' },
    { name: 'Dr. D. Nair', clinic: 'Metro General' },
  ]);

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.branch.toLowerCase().includes(search.toLowerCase()) ||
      h.pincode.includes(search),
  );

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }

  function openEdit(h: ClinicEntry) {
    setEditingId(h.id);
    setForm({
      name: h.name,
      contact: h.contact,
      address: h.address,
      branch: h.branch,
      pincode: h.pincode,
      openingTime: h.openingTime,
      closingTime: h.closingTime,
    });
    setSheetOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.contact || !form.address || !form.branch || !form.pincode) {
      toast.error('Please fill all required fields.');
      return;
    }
    if (editingId) {
      updateHospital(editingId, form);
      toast.success('Clinic details updated successfully!');
    } else {
      addHospital({
        ...form,
        status: 'Active',
        admin: 'Unassigned',
      });
      toast.success('New clinic added successfully!');
    }
    setSheetOpen(false);
  }

  function handleDelete(id: string) {
    deleteHospital(id);
    toast.success('Clinic removed.');
  }

  function handleCreateAndAssignAdmin() {
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      toast.error('Please fill in name, email, and password to create the admin.');
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Add to dynamic list of admins
    const newAdmin = {
      name: newAdminName.trim(),
      clinic: accessEntry ? accessEntry.name : 'System',
    };
    setAdminsList((prev) => [...prev, newAdmin]);

    // Assign as primary admin to current access clinic
    if (accessEntry) {
      updateHospital(accessEntry.id, { admin: newAdmin.name });
      setAccessEntry((curr) => (curr ? { ...curr, admin: newAdmin.name } : null));
    }

    toast.success(`Admin user "${newAdminName}" created and assigned successfully!`, {
      description: `Credentials set for ${newAdminEmail}`,
    });

    // Reset form
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setShowCreateAdminForm(false);
  }

  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Clinic & Branch Setup</h1>
          <p className="text-muted-foreground">
            Manage clinic profiles, branches, and operational hours.
          </p>
        </div>
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add New Clinic
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="setup" className="w-full space-y-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b pb-1">
          <TabsList className="bg-muted/80">
            <TabsTrigger value="setup" className="gap-2 data-[state=active]:bg-background">
              <Building2 className="h-4 w-4" />
              Clinic Setup & Profiles
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2 data-[state=active]:bg-background">
              <KeyRound className="h-4 w-4 text-amber-500" />
              Access Controls & Integrations
            </TabsTrigger>
            <TabsTrigger value="company-users" className="gap-2 data-[state=active]:bg-background">
              <Users className="h-4 w-4 text-primary" />
              Company Users
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="setup" className="space-y-6 flex-1 flex flex-col m-0">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Clinics',
                value: hospitals.length,
                color: 'bg-blue-100 text-blue-700',
              },
              {
                label: 'Active',
                value: hospitals.filter((h) => h.status === 'Active').length,
                color: 'bg-emerald-100 text-emerald-700',
              },
              {
                label: 'Trial',
                value: hospitals.filter((h) => h.status === 'Trial').length,
                color: 'bg-amber-100 text-amber-700',
              },
              {
                label: 'Inactive',
                value: hospitals.filter((h) => h.status === 'Inactive').length,
                color: 'bg-rose-100 text-rose-700',
              },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                    <h2 className="text-2xl font-bold mt-1">{s.value}</h2>
                  </div>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-bold', s.color)}>
                    {s.value}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Card */}
          <Card className="flex-1">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle>All Clinics & Branches</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search clinics..."
                      className="pl-9 w-[250px]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3 font-medium">Clinic Name</th>
                      <th className="px-6 py-3 font-medium">Branch</th>
                      <th className="px-6 py-3 font-medium">Contact</th>
                      <th className="px-6 py-3 font-medium">Pincode</th>
                      <th className="px-6 py-3 font-medium">Hours</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                          No clinics found.
                        </td>
                      </tr>
                    )}
                    {filtered.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{h.name}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate max-w-[160px]">{h.address}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded-full">
                            <Hash className="h-3 w-3" />
                            {h.branch}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{h.contact}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">{h.pincode}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {h.openingTime} – {h.closingTime}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                              h.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700'
                                : h.status === 'Trial'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-rose-100 text-rose-700',
                            )}
                          >
                            {h.status === 'Active' && <CheckCircle className="h-3.5 w-3.5" />}
                            {h.status === 'Trial' && <Activity className="h-3.5 w-3.5" />}
                            {h.status === 'Inactive' && <XCircle className="h-3.5 w-3.5" />}
                            {h.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Details"
                              onClick={() => setViewEntry(h)}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Access Control"
                              onClick={() => {
                                setAccessEntry(h);
                                setActiveAccessTab('admin');
                              }}
                            >
                              <KeyRound className="h-4 w-4 text-amber-500 hover:text-amber-600 hover:bg-amber-50/50 rounded" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit Clinic"
                              onClick={() => openEdit(h)}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDelete(h.id)}
                            >
                              <Trash2 className="h-4 w-4 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6 flex-1 flex flex-col m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((h) => {
              const moduleMap: Record<string, { label: string; color: string }> = {
                opd: { label: 'OPD', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                ipd: { label: 'IPD', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                pharmacy: {
                  label: 'Pharmacy & Inventory',
                  color: 'bg-amber-100 text-amber-800 border-amber-200',
                },
                lab: {
                  label: 'Laboratory',
                  color: 'bg-violet-100 text-violet-800 border-violet-200',
                },
                billing: { label: 'Billing', color: 'bg-rose-100 text-rose-800 border-rose-200' },
              };

              return (
                <Card
                  key={h.id}
                  className="relative overflow-hidden border border-border/80 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                  <CardHeader className="flex flex-row items-center justify-between pb-3 pl-6">
                    <div>
                      <CardTitle className="text-lg font-semibold">{h.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {h.branch} — ID: {h.id}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                        h.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : h.status === 'Trial'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200',
                      )}
                    >
                      {h.status}
                    </span>
                  </CardHeader>

                  <CardContent className="space-y-4 pl-6">
                    {/* Admin Details */}
                    <div className="flex items-center justify-between border-b border-muted pb-3">
                      <div className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Assigned Admin
                        </span>
                      </div>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          h.admin === 'Unassigned'
                            ? 'text-muted-foreground italic'
                            : 'text-foreground',
                        )}
                      >
                        {h.admin}
                      </span>
                    </div>

                    {/* Active Modules */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Enabled Modules
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {h.enabledModules.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            No modules enabled
                          </span>
                        ) : (
                          h.enabledModules.map((m) => {
                            const meta = moduleMap[m] || {
                              label: m,
                              color: 'bg-muted text-muted-foreground',
                            };
                            return (
                              <span
                                key={m}
                                className={cn(
                                  'text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border',
                                  meta.color,
                                )}
                              >
                                {meta.label}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Security & Sessions */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-muted">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Security Policy</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              h.mfaEnforced ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                            )}
                          />
                          <span className="text-xs font-medium">
                            {h.mfaEnforced ? 'MFA Enforced' : 'MFA Optional'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground block">Session Status</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Server className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-semibold">
                            {h.activeSessions} active{' '}
                            {h.activeSessions === 1 ? 'session' : 'sessions'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* API credentials & IP */}
                    <div className="bg-muted/40 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono">CLIENT_ID:</span>
                        <span className="font-mono text-foreground font-semibold select-all">
                          {h.clientId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground font-mono">IP_RESTRICTION:</span>
                        <span
                          className={cn(
                            'font-mono text-foreground font-semibold',
                            !h.ipRestriction && 'italic text-muted-foreground',
                          )}
                        >
                          {h.ipRestriction || 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Configure Button */}
                    <Button
                      variant="outline"
                      className="w-full gap-2 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-colors"
                      onClick={() => {
                        setAccessEntry(h);
                        setActiveAccessTab('admin');
                      }}
                    >
                      <KeyRound className="h-4 w-4 text-amber-500" />
                      Configure Access & Keys
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="company-users" className="space-y-6 flex-1 flex flex-col m-0">
          <CompanyUsersTab />
        </TabsContent>
      </Tabs>

      {/* Add / Edit Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Clinic Details' : 'Add New Clinic'}
            </SheetTitle>
            <SheetDescription>
              Fill in the clinic and branch information below. All fields marked * are required.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Clinic Name */}
            <div className="space-y-2">
              <Label htmlFor="clinic-name">
                Clinic Name <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinic-name"
                  placeholder="e.g. Apollo Clinics"
                  className="pl-9"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: sanitizeOrgName(e.target.value) }))
                  }
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="clinic-contact">
                Contact Number <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="clinic-contact"
                  placeholder="e.g. 9800001111"
                  type="tel"
                  className="pl-9"
                  maxLength={15}
                  value={form.contact}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contact: sanitizePhone(e.target.value) }))
                  }
                />
              </div>
            </div>

            {/* Clinic Address */}
            <div className="space-y-2">
              <Label htmlFor="clinic-address">
                Clinic Address <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <MapPinned className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="clinic-address"
                  placeholder="Full address including street, area, city"
                  className="pl-9 min-h-[80px] resize-none"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
            </div>

            {/* Branch & Pincode side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-branch">
                  Branch <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinic-branch"
                    placeholder="e.g. Main Branch"
                    className="pl-9"
                    value={form.branch}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, branch: sanitizeOrgName(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-pincode">
                  Pincode <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinic-pincode"
                    placeholder="e.g. 400053"
                    className="pl-9"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, pincode: sanitizePincode(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Opening & Closing Time side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-opening">
                  Opening Time <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinic-opening"
                    type="time"
                    className="pl-9"
                    value={form.openingTime}
                    onChange={(e) => setForm((f) => ({ ...f, openingTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-closing">
                  Closing Time <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="clinic-closing"
                    type="time"
                    className="pl-9"
                    value={form.closingTime}
                    onChange={(e) => setForm((f) => ({ ...f, closingTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1 gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" />
                {editingId ? 'Update Clinic' : 'Save Clinic'}
              </Button>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Detail Sheet */}
      <Sheet open={!!viewEntry} onOpenChange={(o) => !o && setViewEntry(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader className="pb-4 border-b mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Clinic Details
            </SheetTitle>
          </SheetHeader>
          {viewEntry && (
            <div className="space-y-4">
              {[
                { label: 'Clinic Name', value: viewEntry.name, icon: Building2 },
                { label: 'Contact Number', value: viewEntry.contact, icon: Phone },
                { label: 'Clinic Address', value: viewEntry.address, icon: MapPinned },
                { label: 'Branch', value: viewEntry.branch, icon: Hash },
                { label: 'Pincode', value: viewEntry.pincode, icon: MapPin },
                { label: 'Opening Time', value: viewEntry.openingTime, icon: Clock },
                { label: 'Closing Time', value: viewEntry.closingTime, icon: CalendarClock },
                { label: 'Admin', value: viewEntry.admin, icon: Key },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                  <div className="rounded-md bg-primary/10 text-primary p-2 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className="font-semibold text-sm mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setViewEntry(null);
                  openEdit(viewEntry);
                }}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit This Clinic
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Access Settings Sheet */}
      <Sheet open={!!accessEntry} onOpenChange={(o) => !o && setAccessEntry(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="h-5 w-5 text-amber-500" />
              Access Configuration
            </SheetTitle>
            <SheetDescription>
              Configure admin, active modules, API keys, security rules, and active logins for{' '}
              {accessEntry?.name}.
            </SheetDescription>
          </SheetHeader>

          {accessEntry && (
            <Tabs
              value={activeAccessTab}
              onValueChange={setActiveAccessTab}
              className="w-full space-y-4"
            >
              <TabsList className="grid grid-cols-5 w-full bg-muted/65 p-1 h-auto text-xs">
                <TabsTrigger value="admin" className="text-[11px] py-1 px-2">
                  Admin
                </TabsTrigger>
                <TabsTrigger value="modules" className="text-[11px] py-1 px-2">
                  Modules
                </TabsTrigger>
                <TabsTrigger value="api" className="text-[11px] py-1 px-2">
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="security" className="text-[11px] py-1 px-2">
                  Security
                </TabsTrigger>
                <TabsTrigger value="sessions" className="text-[11px] py-1 px-2">
                  Sessions
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Primary Administrator Assignment */}
              <TabsContent value="admin" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Primary Clinic Administrator</Label>
                  <p className="text-xs text-muted-foreground">
                    Select the administrator responsible for managing this clinic profile.
                  </p>

                  <Select
                    value={accessEntry.admin}
                    onValueChange={(val) => {
                      updateHospital(accessEntry.id, { admin: val });
                      setAccessEntry((curr) => (curr ? { ...curr, admin: val } : null));
                      toast.success(`Admin assigned to ${val}`);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Admin" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminsList.map((a) => (
                        <SelectItem key={a.name} value={a.name}>
                          {a.name} ({a.clinic})
                        </SelectItem>
                      ))}
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Create New Admin Credentials Option */}
                <div className="pt-4 border-t border-dashed mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Create Admin Credential
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-primary"
                      onClick={() => setShowCreateAdminForm(!showCreateAdminForm)}
                    >
                      {showCreateAdminForm ? 'Cancel' : '+ Create New Admin'}
                    </Button>
                  </div>

                  {showCreateAdminForm && (
                    <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                      <div className="space-y-1">
                        <Label htmlFor="new-admin-name" className="text-xs">
                          Admin Name
                        </Label>
                        <Input
                          id="new-admin-name"
                          placeholder="e.g. Dr. K. Patel"
                          className="h-8 text-xs bg-background"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(sanitizeLettersOnly(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-admin-email" className="text-xs">
                          Email ID
                        </Label>
                        <Input
                          id="new-admin-email"
                          type="email"
                          placeholder="k.patel@hospital.com"
                          className="h-8 text-xs bg-background"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-admin-password" className="text-xs">
                          Password
                        </Label>
                        <Input
                          id="new-admin-password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          className="h-8 text-xs bg-background"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs gap-1 mt-1"
                        onClick={handleCreateAndAssignAdmin}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create & Assign to {accessEntry.name}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-amber-50/50 border border-amber-200/50 p-3 mt-4">
                  <div className="flex gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-800">
                        Administrator Credentials
                      </p>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        To manage all global / hospital admin users, go to the{' '}
                        <span className="font-semibold">Company Users</span> dashboard page.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Feature & Modules Toggle */}
              <TabsContent value="modules" className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Enable Hospital Modules</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable access to core functional modules for this tenant.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    {
                      key: 'opd',
                      name: 'OPD Management',
                      desc: 'Outpatient registration, vitals & patient queue.',
                    },
                    {
                      key: 'ipd',
                      name: 'IPD Management',
                      desc: 'Inpatient admission, beds, and discharge tracker.',
                    },
                    {
                      key: 'pharmacy',
                      name: 'Pharmacy & Inventory',
                      desc: 'Purchase order logs, medicine stock & billing.',
                    },
                    {
                      key: 'lab',
                      name: 'Laboratory System',
                      desc: 'Laboratory orders, sample status & uploads.',
                    },
                    {
                      key: 'billing',
                      name: 'Advanced Billing',
                      desc: 'Tax configurations, insurance claims & ledger.',
                    },
                  ].map((m) => {
                    const isEnabled = accessEntry.enabledModules.includes(m.key);
                    return (
                      <div
                        key={m.key}
                        className="flex items-start justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/10 transition-colors"
                      >
                        <div className="space-y-0.5 pr-4">
                          <span className="text-xs font-semibold text-foreground">{m.name}</span>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            {m.desc}
                          </p>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            let nextModules = [...accessEntry.enabledModules];
                            if (checked) {
                              nextModules.push(m.key);
                            } else {
                              nextModules = nextModules.filter((x) => x !== m.key);
                            }
                            updateHospital(accessEntry.id, { enabledModules: nextModules });
                            setAccessEntry((curr) =>
                              curr ? { ...curr, enabledModules: nextModules } : null,
                            );
                            toast.success(`${m.name} module state updated.`);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Tab 3: API Integration Credentials */}
              <TabsContent value="api" className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Developer API Access</Label>
                  <p className="text-xs text-muted-foreground">
                    Use these credentials to authenticate external integrations with this clinic
                    branch.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Client ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={accessEntry.clientId}
                        readOnly
                        className="font-mono text-xs bg-muted/30"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(accessEntry.clientId);
                          setCopiedField('client');
                          toast.success('Client ID copied to clipboard.');
                          setTimeout(() => setCopiedField(null), 2000);
                        }}
                      >
                        {copiedField === 'client' ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">API Access Key</Label>
                    <div className="flex gap-2">
                      <Input
                        value={accessEntry.apiKey}
                        readOnly
                        type="password"
                        className="font-mono text-xs bg-muted/30"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(accessEntry.apiKey);
                          setCopiedField('key');
                          toast.success('API Key copied to clipboard.');
                          setTimeout(() => setCopiedField(null), 2000);
                        }}
                      >
                        {copiedField === 'key' ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full gap-2 mt-2"
                    onClick={() => {
                      const randHex = () => Math.floor(Math.random() * 16777215).toString(16);
                      const nextKey = `mc_live_${randHex()}${randHex()}`;
                      updateHospital(accessEntry.id, { apiKey: nextKey });
                      setAccessEntry((curr) => (curr ? { ...curr, apiKey: nextKey } : null));
                      toast.success('API Access Key rotated successfully!', {
                        description: 'External clients must be updated with the new key.',
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 text-amber-500" />
                    Rotate API Access Key
                  </Button>
                </div>
              </TabsContent>

              {/* Tab 4: Security Rules */}
              <TabsContent value="security" className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Security Settings</Label>
                  <p className="text-xs text-muted-foreground">
                    Enforce authentication guardrails for all staff working in this clinic.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        Enforce Multi-Factor Auth (MFA)
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Mandatory 2FA setup for all doctors, nurses and front desk staff.
                      </p>
                    </div>
                    <Switch
                      checked={accessEntry.mfaEnforced}
                      onCheckedChange={(checked) => {
                        updateHospital(accessEntry.id, { mfaEnforced: checked });
                        setAccessEntry((curr) => (curr ? { ...curr, mfaEnforced: checked } : null));
                        toast.success(
                          checked ? 'MFA is now enforced.' : 'MFA enforcement removed.',
                        );
                      }}
                    />
                  </div>

                  <div className="space-y-2 p-3 rounded-lg border border-border bg-card">
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        IP Address Whitelist
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        Restrict staff dashboard access to verified corporate network CIDR block.
                      </p>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Input
                        placeholder="e.g. 192.168.1.0/24"
                        value={accessEntry.ipRestriction}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAccessEntry((curr) => (curr ? { ...curr, ipRestriction: val } : null));
                        }}
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          updateHospital(accessEntry.id, {
                            ipRestriction: accessEntry.ipRestriction,
                          });
                          toast.success('IP whitelist restriction settings updated successfully.');
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Active Sessions Control */}
              <TabsContent value="sessions" className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-sm font-semibold">Active Staff Sessions</Label>
                  <p className="text-xs text-muted-foreground">
                    View or revoke active login sessions across all clinic dashboards.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <Server className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">
                          {accessEntry.activeSessions} Active Connections
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Currently authenticated doctor, nurse, or pharmacy logs.
                        </p>
                      </div>
                    </div>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      disabled={accessEntry.activeSessions === 0}
                      onClick={() => {
                        updateHospital(accessEntry.id, { activeSessions: 0 });
                        setAccessEntry((curr) => (curr ? { ...curr, activeSessions: 0 } : null));
                        toast.success('All active credentials sessions revoked.', {
                          description:
                            'Staff will be forced to log in again on their next page load.',
                        });
                      }}
                    >
                      <Lock className="h-4 w-4" />
                      Revoke & Kill All Active Sessions
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Revoking sessions will instantly log out all active browsers for this clinic
                      branch.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex mt-6 pt-4 border-t justify-end">
            <Button className="w-full sm:w-auto" onClick={() => setAccessEntry(null)}>
              Close Access Configuration
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
