import { createFileRoute } from '@tanstack/react-router';
import {
  BadgeCheck,
  CreditCard,
  Plus,
  IndianRupee,
  Edit2,
  Save,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Building2,
  TrendingUp,
  Zap,
  Crown,
  Star,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  useSubscriptions,
  computeStatus,
  DEFAULT_PLANS,
  type PlanKey,
  type AdminSubscription,
  type SubscriptionPlan,
} from '@/lib/store/subscriptions';
import { useSuperHospitals } from '@/lib/store/superHospitals';

export const Route = createFileRoute('/_app/superadmin/subscriptions')({
  component: SubscriptionsManagement,
});

type SubStatus = AdminSubscription['status'];

const PLAN_META: Record<
  PlanKey,
  { icon: typeof Crown; color: string; bgGradient: string }
> = {
  monthly: {
    icon: Zap,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-blue-100/50 border-blue-200',
  },
  sixMonth: {
    icon: Star,
    color: 'text-violet-600',
    bgGradient: 'from-violet-50 to-violet-100/50 border-violet-200',
  },
  yearly: {
    icon: Crown,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-amber-100/50 border-amber-200',
  },
};

const STATUS_STYLES: Record<SubStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Expiring Soon': 'bg-amber-100 text-amber-700 border-amber-200',
  Expired: 'bg-rose-100 text-rose-700 border-rose-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

function formatPrice(p: number) {
  return `₹${p.toLocaleString('en-IN')}`;
}

function PlanCard({
  plan,
  onPriceUpdate,
}: {
  plan: SubscriptionPlan;
  onPriceUpdate: (key: PlanKey, price: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(String(plan.price));
  const meta = PLAN_META[plan.key];
  const Icon = meta.icon;

  function handleSave() {
    const newPrice = parseInt(draftPrice.replace(/[^0-9]/g, ''), 10);
    if (isNaN(newPrice) || newPrice <= 0) {
      toast.error('Enter a valid price amount.');
      return;
    }
    onPriceUpdate(plan.key, newPrice);
    setEditing(false);
  }

  return (
    <Card className={cn('relative border bg-gradient-to-br', meta.bgGradient)}>
      {plan.key === 'yearly' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow">
            <Crown className="h-3 w-3" /> Best Value
          </span>
        </div>
      )}
      <CardHeader className="pt-8 pb-4">
        <div
          className={cn(
            'h-12 w-12 rounded-2xl flex items-center justify-center mb-3',
            meta.bgGradient.includes('blue')
              ? 'bg-blue-200'
              : meta.bgGradient.includes('violet')
                ? 'bg-violet-200'
                : 'bg-amber-200',
          )}
        >
          <Icon className={cn('h-6 w-6', meta.color)} />
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> {plan.duration} validity
        </CardDescription>

        {/* Price display / edit */}
        {editing ? (
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 font-bold text-lg"
                value={draftPrice}
                autoFocus
                onChange={(e) => setDraftPrice(e.target.value.replace(/[^0-9]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            <Button size="icon" variant="default" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setDraftPrice(String(plan.price));
                setEditing(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
              <span className="text-muted-foreground text-sm">/ {plan.duration.toLowerCase()}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs"
              onClick={() => {
                setDraftPrice(String(plan.price));
                setEditing(true);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Price
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <BadgeCheck className={cn('h-4 w-4 shrink-0', meta.color)} />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SubscriptionsManagement() {
  const { subscriptions, plans, addSubscription, updatePlanPrice } = useSubscriptions();
  const hospitals = useSuperHospitals((s) => s.hospitals);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    adminName: '',
    adminEmail: '',
    clinic: '',
    plan: '' as PlanKey | '',
  });
  const [assignErrors, setAssignErrors] = useState<{
    adminName?: string;
    adminEmail?: string;
    clinic?: string;
    plan?: string;
  }>({});

  // Build admin list from real hospital data + fallback demo list
  const hospitalAdmins = hospitals
    .filter((h) => h.admin && h.status !== 'Inactive')
    .map((h) => ({ name: h.admin, clinic: h.name, email: '' }));

  // Merge with any plans from stored subscriptions so previously assigned admins appear
  const knownAdmins =
    hospitalAdmins.length > 0
      ? hospitalAdmins
      : [
          { name: 'Dr. A. Sharma', clinic: 'Apollo Clinics', email: 'admin@medicore.io' },
          { name: 'Dr. B. Singh', clinic: 'City Care Hospital', email: 'admin2@medicore.io' },
          { name: 'Dr. C. Rao', clinic: 'Sunrise Medical Center', email: 'admin3@medicore.io' },
          { name: 'Dr. D. Nair', clinic: 'Metro General', email: 'admin4@medicore.io' },
        ];

  // Use plans from store (which includes price edits)
  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;

  function handlePriceUpdate(key: PlanKey, price: number) {
    updatePlanPrice(key, price);
    const planName = displayPlans.find((p) => p.key === key)?.name ?? key;
    toast.success(`${planName} price updated to ${formatPrice(price)}!`);
  }

  function validateAssign() {
    const errors: typeof assignErrors = {};
    if (!assignForm.adminName.trim()) errors.adminName = 'Admin name is required.';
    if (!assignForm.adminEmail.trim()) errors.adminEmail = 'Admin email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assignForm.adminEmail))
      errors.adminEmail = 'Enter a valid email address.';
    if (!assignForm.clinic.trim()) errors.clinic = 'Clinic name is required.';
    if (!assignForm.plan) errors.plan = 'Select a plan.';
    setAssignErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleAssign() {
    if (!validateAssign()) return;

    const plan = displayPlans.find((p) => p.key === assignForm.plan)!;
    const today = new Date();
    const expiry = new Date(today);
    if (assignForm.plan === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else if (assignForm.plan === 'sixMonth') expiry.setMonth(expiry.getMonth() + 6);
    else expiry.setFullYear(expiry.getFullYear() + 1);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    addSubscription({
      adminEmail: assignForm.adminEmail.trim().toLowerCase(),
      adminName: assignForm.adminName.trim(),
      clinic: assignForm.clinic.trim(),
      plan: assignForm.plan as PlanKey,
      startDate: fmt(today),
      expiryDate: fmt(expiry),
      status: 'Active',
    });

    toast.success(`${plan.name} assigned to ${assignForm.adminName}!`, {
      description: `Valid from ${fmt(today)} to ${fmt(expiry)}.`,
    });
    setAssignForm({ adminName: '', adminEmail: '', clinic: '', plan: '' });
    setAssignErrors({});
    setAssignOpen(false);
  }

  // Compute live statuses
  const liveSubscriptions = subscriptions.map((sub) => ({
    ...sub,
    status: computeStatus(sub.expiryDate),
  }));

  const activeCount = liveSubscriptions.filter((s) => s.status === 'Active').length;
  const expiringCount = liveSubscriptions.filter((s) => s.status === 'Expiring Soon').length;
  const expiredCount = liveSubscriptions.filter((s) => s.status === 'Expired').length;

  return (
    <div className="space-y-8 flex flex-col h-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage pricing, assign plans to admins, and monitor subscription status.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setAssignForm({ adminName: '', adminEmail: '', clinic: '', plan: '' });
            setAssignErrors({});
            setAssignOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Assign Plan
        </Button>
      </div>

      {/* Plan Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Available Plans &amp; Pricing
          <span className="text-xs text-muted-foreground font-normal">
            (Super Admin can edit amounts)
          </span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {displayPlans.map((plan) => (
            <PlanCard key={plan.key} plan={plan} onPriceUpdate={handlePriceUpdate} />
          ))}
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Subscriptions',
            value: liveSubscriptions.length,
            color: 'bg-primary/10 text-primary',
            icon: TrendingUp,
          },
          {
            label: 'Active',
            value: activeCount,
            color: 'bg-emerald-100 text-emerald-700',
            icon: CheckCircle2,
          },
          {
            label: 'Expiring Soon',
            value: expiringCount,
            color: 'bg-amber-100 text-amber-700',
            icon: Clock,
          },
          {
            label: 'Expired',
            value: expiredCount,
            color: 'bg-rose-100 text-rose-700',
            icon: AlertCircle,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <h2 className="text-2xl font-bold mt-1">{value}</h2>
              </div>
              <div className={cn('rounded-full p-3', color)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Subscription Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Subscription Status</CardTitle>
          <CardDescription>
            Track which admins have active, expiring, or expired subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Admin</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Clinic</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Start Date</th>
                  <th className="px-6 py-3 font-medium">Expiry Date</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {liveSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No subscriptions assigned yet. Click &quot;Assign Plan&quot; to get started.
                    </td>
                  </tr>
                )}
                {liveSubscriptions.map((sub) => {
                  const planInfo = displayPlans.find((p) => p.key === sub.plan);
                  const planMeta = PLAN_META[sub.plan];
                  const PlanIcon = planMeta.icon;
                  return (
                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {sub.adminName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </div>
                          <span className="font-semibold">{sub.adminName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          {sub.adminEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          {sub.clinic}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PlanIcon className={cn('h-4 w-4', planMeta.color)} />
                          <span className="font-medium">{planInfo?.name ?? sub.plan}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {sub.startDate}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold">
                        {sub.expiryDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                            STATUS_STYLES[sub.status],
                          )}
                        >
                          {sub.status === 'Active' && <CheckCircle2 className="h-3 w-3" />}
                          {sub.status === 'Expiring Soon' && <Clock className="h-3 w-3" />}
                          {sub.status === 'Expired' && <AlertCircle className="h-3 w-3" />}
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Plan Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <BadgeCheck className="h-5 w-5 text-primary" />
              Assign Subscription Plan
            </DialogTitle>
            <DialogDescription>
              Enter the hospital admin&apos;s details and choose a subscription plan. The admin will
              see their plan in their dashboard after logging in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Quick-fill from existing hospitals */}
            {knownAdmins.length > 0 && (
              <div className="space-y-2">
                <Label>Quick-fill from Hospital Record</Label>
                <Select
                  onValueChange={(v) => {
                    const found = knownAdmins.find((a) => a.name === v);
                    if (found) {
                      setAssignForm((f) => ({
                        ...f,
                        adminName: found.name,
                        clinic: found.clinic,
                        adminEmail: found.email || f.adminEmail,
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from registered hospitals..." />
                  </SelectTrigger>
                  <SelectContent>
                    {knownAdmins.map((a, idx) => (
                      <SelectItem key={idx} value={a.name}>
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {a.name} — {a.clinic}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Admin Name */}
              <div className="space-y-2">
                <Label>
                  Admin Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="Dr. Anika Rao"
                  value={assignForm.adminName}
                  onChange={(e) => setAssignForm((f) => ({ ...f, adminName: e.target.value }))}
                  className={cn(assignErrors.adminName && 'border-rose-500')}
                />
                {assignErrors.adminName && (
                  <p className="text-xs text-rose-500">{assignErrors.adminName}</p>
                )}
              </div>

              {/* Clinic Name */}
              <div className="space-y-2">
                <Label>
                  Clinic / Hospital <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="MediCore Hospital"
                  value={assignForm.clinic}
                  onChange={(e) => setAssignForm((f) => ({ ...f, clinic: e.target.value }))}
                  className={cn(assignErrors.clinic && 'border-rose-500')}
                />
                {assignErrors.clinic && (
                  <p className="text-xs text-rose-500">{assignErrors.clinic}</p>
                )}
              </div>
            </div>

            {/* Admin Email */}
            <div className="space-y-2">
              <Label>
                Admin Login Email <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="admin@hospital.io"
                  type="email"
                  className={cn('pl-9', assignErrors.adminEmail && 'border-rose-500')}
                  value={assignForm.adminEmail}
                  onChange={(e) => setAssignForm((f) => ({ ...f, adminEmail: e.target.value }))}
                />
              </div>
              {assignErrors.adminEmail && (
                <p className="text-xs text-rose-500">{assignErrors.adminEmail}</p>
              )}
              <p className="text-xs text-muted-foreground">
                This must match the email the admin uses to log in.
              </p>
            </div>

            {/* Plan select */}
            <div className="space-y-2">
              <Label>
                Subscription Plan <span className="text-rose-500">*</span>
              </Label>
              <div className="grid gap-2">
                {displayPlans.map((plan) => {
                  const planMeta = PLAN_META[plan.key];
                  const Icon = planMeta.icon;
                  return (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => setAssignForm((f) => ({ ...f, plan: plan.key }))}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-4 text-left transition-all',
                        assignForm.plan === plan.key
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'hover:bg-muted',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn('rounded-lg p-2', planMeta.bgGradient.split(' ')[0])}>
                          <Icon className={cn('h-5 w-5', planMeta.color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.duration} validity</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(plan.price)}</p>
                        {assignForm.plan === plan.key && (
                          <CheckCircle2 className="h-4 w-4 text-primary ml-auto mt-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              {assignErrors.plan && <p className="text-xs text-rose-500">{assignErrors.plan}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={handleAssign}>
              <BadgeCheck className="h-4 w-4" />
              Assign Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
