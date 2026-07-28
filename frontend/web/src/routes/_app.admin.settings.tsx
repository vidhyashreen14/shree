<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  allowOnlyHospitalNameChars,
  allowOnlyNumbers,
  allowOnlyAddressChars,
} from "@/lib/validations";
import { useState } from "react";
import { useFeeSettings } from "@/lib/store/feeSettings";
import { useHospitalSettings } from "@/lib/store/hospitalSettings";
import { IndianRupee, Settings2, UploadCloud } from "lucide-react";
=======
import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/common/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { useFeeSettings } from '@/lib/store/feeSettings';
import { useHospitalSettings } from '@/lib/store/hospitalSettings';
import { useAuth } from '@/lib/store/auth';
import {
  useSubscriptions,
  computeStatus,
  daysRemaining,
  planDurationDays,
  type SubscriptionPlan,
} from '@/lib/store/subscriptions';
import { cn } from '@/lib/utils';
import {
  IndianRupee,
  Settings2,
  UploadCloud,
  Shield,
  Users,
  Stethoscope,
  CalendarDays,
  TrendingUp,
  BedDouble,
  Clock,
  RefreshCw,
  Activity,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  Star,
  Crown,
  Calendar,
  Mail,
  PhoneCall,
} from 'lucide-react';
>>>>>>> a821a0c (second update)

import { sanitizePhone, sanitizeGSTIN, sanitizeAlphanumericId, sanitizeOrgName } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import {
  monthlyRevenue,
  dailyVisits,
  departments,
  doctors,
  patients,
  appointments,
} from '@/lib/mock/data';

export const Route = createFileRoute('/_app/admin/settings')({
  head: () => ({
    meta: [
      { title: 'Hospital Settings & Analytics · MediCore Admin' },
      {
        name: 'description',
        content:
          'Manage hospital profile, fees, operational policies, and view deep operational analytics.',
      },
    ],
  }),
  component: HospitalSettings,
});

// ─── Subscription Panel ───────────────────────────────────────────────────────

const PLAN_META: Record<
  string,
  { icon: typeof Crown; color: string; gradientClass: string }
> = {
  monthly: {
    icon: Zap,
    color: 'text-blue-600',
    gradientClass: 'from-blue-50 to-blue-100/60 border-blue-200',
  },
  sixMonth: {
    icon: Star,
    color: 'text-violet-600',
    gradientClass: 'from-violet-50 to-violet-100/60 border-violet-200',
  },
  yearly: {
    icon: Crown,
    color: 'text-amber-600',
    gradientClass: 'from-amber-50 to-amber-100/60 border-amber-200',
  },
};

function SubscriptionPanel({ email }: { email: string }) {
  const { getForEmail, plans } = useSubscriptions();
  const raw = useMemo(() => getForEmail(email), [getForEmail, email]);

  const sub = raw ? { ...raw, status: computeStatus(raw.expiryDate) } : null;
  const planInfo: SubscriptionPlan | undefined = plans.find((p) => p.key === sub?.plan);
  const meta = sub ? PLAN_META[sub.plan] : null;
  const Icon = meta?.icon ?? BadgeCheck;

  const days = sub ? daysRemaining(sub.expiryDate) : 0;
  const totalDays = sub ? planDurationDays(sub.plan) : 1;
  const elapsed = totalDays - (days > 0 ? days : 0);
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="rounded-2xl bg-muted/60 p-6">
          <BadgeCheck className="h-12 w-12 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No Subscription Assigned</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Your super admin has not yet assigned a subscription plan to your account. Please
            contact support to get started.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg px-4 py-2">
            <Mail className="h-4 w-4" />
            superadmin@medicore.io
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-lg px-4 py-2">
            <PhoneCall className="h-4 w-4" />
            +91 98200 00000
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {sub.status === 'Expiring Soon' && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-amber-800">
          <Clock className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Your subscription expires in <strong>{days} day{days !== 1 ? 's' : ''}</strong>.
            Contact your super admin to renew.
          </p>
        </div>
      )}
      {sub.status === 'Expired' && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-300 bg-rose-50 px-5 py-3 text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Your subscription has <strong>expired</strong>. Please contact your super admin to
            renew access.
          </p>
        </div>
      )}
      {sub.status === 'Active' && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Your subscription is <strong>active</strong> and valid until{' '}
            <strong>{sub.expiryDate}</strong>.
          </p>
        </div>
      )}

      {/* Plan Card */}
      <Card className={cn('border bg-gradient-to-br', meta?.gradientClass)}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center',
                  sub.plan === 'monthly'
                    ? 'bg-blue-200'
                    : sub.plan === 'sixMonth'
                      ? 'bg-violet-200'
                      : 'bg-amber-200',
                )}
              >
                <Icon className={cn('h-6 w-6', meta?.color)} />
              </div>
              <div>
                <CardTitle className="text-xl">{planInfo?.name ?? sub.plan}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {planInfo?.duration} validity
                </p>
              </div>
            </div>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border',
                sub.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : sub.status === 'Expiring Soon'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-rose-100 text-rose-700 border-rose-200',
              )}
            >
              {sub.status === 'Active' && <CheckCircle2 className="h-3 w-3" />}
              {sub.status === 'Expiring Soon' && <Clock className="h-3 w-3" />}
              {sub.status === 'Expired' && <AlertCircle className="h-3 w-3" />}
              {sub.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/60 border px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Start Date</p>
              <p className="font-semibold font-mono">{sub.startDate}</p>
            </div>
            <div className="rounded-xl bg-white/60 border px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">Expiry Date</p>
              <p className="font-semibold font-mono">{sub.expiryDate}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Plan usage</span>
              <span>{days > 0 ? `${days} day${days !== 1 ? 's' : ''} remaining` : 'Expired'}</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70 border overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  sub.status === 'Active'
                    ? 'bg-emerald-500'
                    : sub.status === 'Expiring Soon'
                      ? 'bg-amber-500'
                      : 'bg-rose-500',
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Features */}
          {planInfo?.features && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Included Features
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {planInfo.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <BadgeCheck className={cn('h-4 w-4 shrink-0', meta?.color)} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Admin & Clinic info */}
          <div className="rounded-xl bg-white/60 border px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {sub.adminName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{sub.adminName}</p>
              <p className="text-xs text-muted-foreground truncate">{sub.clinic}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HospitalSettings() {
  const { registrationFee, consultationFee, setFees } = useFeeSettings();
  const user = useAuth((s) => s.user);
  const [regFee, setRegFee] = useState(String(registrationFee));
  const [consFee, setConsFee] = useState(String(consultationFee));


  const hospital = useHospitalSettings();
  const [logoUrl, setLogoUrl] = useState(hospital.logoUrl);
  const [name, setName] = useState(hospital.name);
  const [phone, setPhone] = useState(hospital.phone);
  const [email, setEmail] = useState(hospital.email);
  const [address, setAddress] = useState(hospital.address);
  const [gstNumber, setGstNumber] = useState(hospital.gstNumber);
  const [licenseNumber, setLicenseNumber] = useState(hospital.licenseNumber);

  // Analytics states
  const [activeTab, setActiveTab] = useState('analytics');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      toast.success('Operational analytics updated successfully!', {
        description: 'Recalculated patient traffic, waiting time, and billing trends.',
      });
    }, 800);
  };

  const totalRevenue = monthlyRevenue.reduce((a, b) => a + b.revenue, 0);
  const todays = appointments.filter(
    (a) => new Date(a.date).toDateString() === new Date().toDateString(),
  ).length;

  const kpis = [
    { name: 'Capacity', value: 78, fill: 'var(--color-chart-1)' },
    { name: 'Satisfaction', value: 92, fill: 'var(--color-chart-3)' },
    { name: 'On-time', value: 86, fill: 'var(--color-chart-2)' },
  ];

  const saveFees = () => {
    const r = Number(regFee);
    const c = Number(consFee);
    if (isNaN(r) || isNaN(c) || r < 0 || c < 0) {
      toast.error('Please enter valid fee amounts');
      return;
    }
    setFees(r, c);
    toast.success('Fee configuration saved', {
      description: `Registration ₹${r} · Consultation ₹${c}`,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogoUrl(event.target.result as string);
        toast.success('Logo preview updated');
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    hospital.updateSettings({
      logoUrl,
      name,
      phone,
      email,
      address,
      gstNumber,
      licenseNumber,
    });
    toast.success('Hospital profile updated successfully!');
  };

  return (
    <>
<<<<<<< HEAD
      <PageHeader
        eyebrow="Configuration"
        title="Hospital settings"
        description="Branding, fee structure, operational policy, and notifications."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Hospital Profile */}
        <div className="surface-elevated p-6 lg:col-span-2">
          <h3 className="font-display font-semibold">Hospital profile</h3>
          <p className="text-xs text-muted-foreground">
            Information shown on prescriptions and reports.
          </p>
          <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
            {/* Hospital Logo Section */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 pb-6 mb-2 border-b border-border">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 overflow-hidden group hover:border-primary/50 transition-colors">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Hospital Logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mx-auto mb-1 text-lg">
                      🏥
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Default Brand
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2.5">
                <div>
                  <h4 className="text-sm font-semibold">Hospital Logo</h4>
                  <p className="text-xs text-muted-foreground">
                    This logo will appear on prescriptions, invoices, and the dashboard sidebar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                  {logoUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setLogoUrl("");
                        toast.success("Logo removed from preview");
=======
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageHeader
          eyebrow="Configuration & Insights"
          title="Hospital Control Panel"
          description="View hospital metrics and configure profile details, policy toggles, and OPD fee structures."
        />
        {activeTab === 'analytics' && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1 text-xs text-muted-foreground font-mono shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sync: {lastUpdated}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 transition-all text-xs font-medium hover:bg-muted"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              Sync Now
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="analytics" onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full flex justify-start gap-1 overflow-x-auto bg-muted/65 p-1 h-auto rounded-xl scrollbar-none border shadow-sm">
          <TabsTrigger
            value="analytics"
            className="rounded-lg py-2.5 px-4 md:px-5 gap-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4 text-primary" />
            Operational Analytics
          </TabsTrigger>
          <TabsTrigger
            value="profile"
            className="rounded-lg py-2.5 px-4 md:px-5 gap-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Settings2 className="h-4 w-4" />
            Branding & Profile
          </TabsTrigger>
          <TabsTrigger
            value="policy"
            className="rounded-lg py-2.5 px-4 md:px-5 gap-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Operational Policy
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="rounded-lg py-2.5 px-4 md:px-5 gap-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <IndianRupee className="h-4 w-4" />
            Fee Configuration
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="rounded-lg py-2.5 px-4 md:px-5 gap-2 text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <BadgeCheck className="h-4 w-4" />
            My Subscription
          </TabsTrigger>
        </TabsList>

        {/* ── Operational Analytics Tab ── */}
        <TabsContent
          value="analytics"
          className="outline-none space-y-6 animate-in fade-in-50 duration-200"
        >
          {/* Main Key Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active patients"
              value={patients.length.toLocaleString()}
              icon={Users}
              tone="primary"
              trend={4.2}
              hint="vs last week"
            />
            <StatCard
              label="Avg wait time"
              value="12m"
              icon={Clock}
              tone="warning"
              trend={-8.3}
              hint="vs yesterday"
            />
            <StatCard
              label="Today's appointments"
              value={todays}
              icon={CalendarDays}
              tone="info"
              trend={1.8}
              hint="vs yesterday"
            />
            <StatCard
              label="Doctors on duty"
              value={`${doctors.filter((d) => d.available).length}/${doctors.length}`}
              icon={Stethoscope}
              tone="success"
            />
            <StatCard
              label="Monthly revenue"
              value={`₹${(totalRevenue / 100000).toFixed(1)}L`}
              icon={TrendingUp}
              tone="primary"
              trend={6.4}
            />
            <StatCard
              label="Revenue per visit"
              value="₹1,840"
              icon={IndianRupee}
              tone="success"
              trend={2.1}
            />
            <StatCard label="IPD bed occupancy" value="82%" icon={BedDouble} tone="success" />
            <StatCard label="System health" value="99.98%" icon={Activity} tone="info" />
          </div>

          {/* Primary Charts Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Revenue Trend Area Chart */}
            <div className="surface-elevated p-5 lg:col-span-2 shadow-sm rounded-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-sm md:text-base">
                    Revenue Segments
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    OPD, pharmacy & lab monthly distribution
                  </p>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                  +12.4% MoM
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="opdG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="pharmG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="labG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={11}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
>>>>>>> a821a0c (second update)
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="opd"
                      name="OPD Revenue"
                      stackId="r"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      fill="url(#opdG)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pharmacy"
                      name="Pharmacy Revenue"
                      stackId="r"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2}
                      fill="url(#pharmG)"
                    />
                    <Area
                      type="monotone"
                      dataKey="lab"
                      name="Lab Revenue"
                      stackId="r"
                      stroke="var(--color-chart-3)"
                      strokeWidth={2}
                      fill="url(#labG)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quality Gauges Radial Chart */}
            <div className="surface-elevated p-5 shadow-sm rounded-xl flex flex-col justify-between">
              <div>
                <h3 className="font-display font-semibold text-sm md:text-base">
                  Operational KPIs
                </h3>
                <p className="text-xs text-muted-foreground">
                  Target capacities and satisfaction gauges
                </p>
              </div>
              <div className="h-60 relative flex items-center justify-center">
                <ResponsiveContainer>
                  <RadialBarChart
                    innerRadius="35%"
                    outerRadius="100%"
                    data={kpis}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={8} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 text-xs border-t pt-3">
                {kpis.map((k) => (
                  <div key={k.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.fill }} />
                      <span className="font-medium text-muted-foreground">{k.name}</span>
                    </span>
                    <span className="font-semibold text-foreground">{k.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secondary Charts Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Daily Visits Bar Chart */}
            <div className="surface-elevated p-5 shadow-sm rounded-xl">
              <h3 className="font-display font-semibold text-sm md:text-base mb-1">
                Daily Visits (Last 14 days)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Traffic load split by outpatient, inpatient, and emergency categories
              </p>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={dailyVisits} barCategoryGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="opd"
                      name="OPD"
                      stackId="a"
                      fill="var(--color-chart-1)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar dataKey="ipd" name="IPD" stackId="a" fill="var(--color-chart-2)" />
                    <Bar
                      dataKey="emergency"
                      name="Emergency"
                      stackId="a"
                      fill="var(--color-chart-4)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tertiary Row: Department list progress & Patient Growth */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Top Departments */}
            <div className="surface-elevated p-5 shadow-sm rounded-xl">
              <h3 className="font-display font-semibold text-sm md:text-base mb-1">
                Top Departments
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Patient throughput versus max daily target capacity
              </p>
              <div className="space-y-4">
                {departments.slice(0, 5).map((d) => {
                  const pct = Math.min(100, (d.patientsToday / 70) * 100);
                  return (
                    <div key={d.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-muted-foreground font-mono font-semibold">
                          {d.patientsToday} pts
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted shadow-inner">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient Growth Line Chart */}
            <div className="surface-elevated p-5 shadow-sm rounded-xl lg:col-span-2">
              <h3 className="font-display font-semibold text-sm md:text-base mb-1">
                Patient Admissions Trend
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Quarterly growth trajectory showing continuous registry additions
              </p>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart
                    data={monthlyRevenue.map((m, i) => ({
                      month: m.month,
                      patients: 800 + i * 90 + (i % 2) * 40,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-popover)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="patients"
                      name="Admitted Patients"
                      stroke="var(--color-chart-2)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Branding & Profile Tab ── */}
        <TabsContent value="profile" className="outline-none animate-in fade-in-50 duration-200">
          <div className="surface-elevated p-6 shadow-sm rounded-xl max-w-4xl mx-auto">
            <h3 className="font-display font-semibold text-base md:text-lg">Hospital Profile</h3>
            <p className="text-xs text-muted-foreground">
              Information printed on patient reports, pharmacy receipts, and clinical prescriptions.
            </p>
            <form className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2" onSubmit={saveProfile}>
              {/* Logo Upload Section */}
              <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-border">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 overflow-hidden group hover:border-primary/50 transition-all shadow-inner">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Hospital Logo"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary mx-auto mb-1 text-lg">
                        🏥
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">Default</span>
                    </div>
                  )}
                </div>

<<<<<<< HEAD
            <div className="sm:col-span-2">
              <Label htmlFor="hosp-name">Hospital name</Label>
              <Input
                id="hosp-name"
                value={name}
                maxLength={150}
                onChange={(e) => setName(allowOnlyHospitalNameChars(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-phone">Phone</Label>
              <Input
                id="hosp-phone"
                value={phone}
                maxLength={10}
                onChange={(e) => setPhone(allowOnlyNumbers(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-email">Email</Label>
              <Input
                id="hosp-email"
                value={email}
                maxLength={100}
                onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="hosp-address">Address</Label>
              <Textarea
                id="hosp-address"
                value={address}
                maxLength={250}
                onChange={(e) => setAddress(allowOnlyAddressChars(e.target.value))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-gst">GST number</Label>
              <Input
                id="hosp-gst"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="hosp-license">License number</Label>
              <Input
                id="hosp-license"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2 mt-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </div>

        {/* Operational Policy */}
        <div className="surface-elevated p-6">
          <h3 className="font-display font-semibold">Operational policy</h3>
          <div className="mt-4 space-y-4">
            {[
              { label: "Allow walk-in patients", desc: "Patients without appointment" },
              { label: "SMS appointment reminders", desc: "24h before consultation" },
              { label: "Auto-assign tokens", desc: "On check-in" },
              { label: "Two-factor for admins", desc: "TOTP via authenticator app", on: true },
              { label: "Public doctor directory", desc: "Visible on hospital website" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
=======
                <div className="flex-1 text-center sm:text-left space-y-2.5">
                  <div>
                    <h4 className="text-sm font-semibold">Hospital Brand Logo</h4>
                    <p className="text-xs text-muted-foreground">
                      Accepts JPEG/PNG files up to 2MB. Logo appears in PDF printouts and layouts.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
                      <UploadCloud className="h-3.5 w-3.5" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                        onClick={() => {
                          setLogoUrl('');
                          toast.success('Logo removed from preview');
                        }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
>>>>>>> a821a0c (second update)
                </div>
              </div>

<<<<<<< HEAD
        {/* Fee Configuration */}
        <div className="surface-elevated p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <IndianRupee className="h-4 w-4 text-primary" />
            </span>
            <div>
              <h3 className="font-display font-semibold">Fee configuration</h3>
              <p className="text-xs text-muted-foreground">
                These amounts are shown on the front desk payment screen for every patient visit.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="reg-fee">Registration fee (₹)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Charged once for new patients only
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                  ₹
                </span>
=======
              <div className="sm:col-span-2">
                <Label
                  htmlFor="hosp-name"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Hospital Name
                </Label>
>>>>>>> a821a0c (second update)
                <Input
                  id="hosp-name"
                  value={name}
                  onChange={(e) => setName(sanitizeOrgName(e.target.value))}
                  className="mt-1.5 h-10 rounded-lg shadow-sm"
                />
              </div>
<<<<<<< HEAD
            </div>

            <div>
              <Label htmlFor="cons-fee">Consultation fee (₹)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Charged per visit for all patients
              </p>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm">
                  ₹
                </span>
=======
              <div>
                <Label
                  htmlFor="hosp-phone"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Contact Phone
                </Label>
>>>>>>> a821a0c (second update)
                <Input
                  id="hosp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                  maxLength={15}
                  className="mt-1.5 h-10 rounded-lg shadow-sm"
                  placeholder="e.g. 9800001111"
                />
              </div>
              <div>
                <Label
                  htmlFor="hosp-email"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Admin Email
                </Label>
                <Input
                  id="hosp-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-10 rounded-lg shadow-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <Label
                  htmlFor="hosp-address"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Physical Address
                </Label>
                <Textarea
                  id="hosp-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1.5 rounded-lg shadow-sm min-h-20"
                />
              </div>
              <div>
                <Label
                  htmlFor="hosp-gst"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  GST Identification Number (GSTIN)
                </Label>
                <Input
                  id="hosp-gst"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(sanitizeGSTIN(e.target.value))}
                  maxLength={15}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  className="mt-1.5 h-10 rounded-lg shadow-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="hosp-license"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  State License Number
                </Label>
                <Input
                  id="hosp-license"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(sanitizeAlphanumericId(e.target.value))}
                  maxLength={25}
                  placeholder="e.g. MH-HOSP-2024-001"
                  className="mt-1.5 h-10 rounded-lg shadow-sm"
                />
              </div>
              <div className="sm:col-span-2 mt-4 flex justify-end">
                <Button type="submit" className="h-10 rounded-lg px-6 font-semibold shadow-sm">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

<<<<<<< HEAD
            {/* Fee Preview */}
            <div className="sm:col-span-2 rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Preview — New Patient Receipt
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration fee</span>
                  <span className="font-medium">₹{regFee || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation fee</span>
                  <span className="font-medium">₹{consFee || 0}</span>
                </div>
                <div className="my-2 border-t border-dashed" />
                <div className="flex justify-between font-bold">
                  <span>Total (new patient)</span>
                  <span className="text-primary">
                    ₹{(Number(regFee) || 0) + (Number(consFee) || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Returning patient (consultation only)</span>
                  <span>₹{Number(consFee) || 0}</span>
=======
        {/* ── Operational Policy Tab ── */}
        <TabsContent value="policy" className="outline-none animate-in fade-in-50 duration-200">
          <div className="surface-elevated p-6 shadow-sm rounded-xl max-w-2xl mx-auto">
            <h3 className="font-display font-semibold text-base md:text-lg">Operational Policy</h3>
            <p className="text-xs text-muted-foreground mb-6">
              Manage global behavioral controls, automatic triggers, and authentication standards.
            </p>
            <div className="space-y-6">
              {[
                {
                  label: 'Allow walk-in patients',
                  desc: 'Enable self-service registration at the reception desk without active appointment slots',
                },
                {
                  label: 'SMS appointment reminders',
                  desc: 'Auto-dispatch text alerts 24 hours prior to appointment bookings',
                },
                {
                  label: 'Auto-assign tokens',
                  desc: 'Generate sequential queue tokens immediately upon check-in validation',
                },
                {
                  label: 'Two-factor for admins',
                  desc: 'Require TOTP verification for all users belonging to the Admin security role',
                  on: true,
                },
                {
                  label: 'Public doctor directory',
                  desc: 'Allow doctor scheduling pages and availability profiles to be listed on public domains',
                },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl border bg-muted/15 shadow-sm transition-all hover:bg-muted/30"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground max-w-md">{s.desc}</p>
                  </div>
                  <Switch defaultChecked={s.on ?? i % 2 === 0} />
>>>>>>> a821a0c (second update)
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── Fee Configuration Tab ── */}
        <TabsContent value="fees" className="outline-none animate-in fade-in-50 duration-200">
          <div className="surface-elevated p-6 shadow-sm rounded-xl max-w-4xl mx-auto">
            <div className="flex items-center gap-3 pb-4 border-b">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <IndianRupee className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-base md:text-lg">Fee Structure</h3>
                <p className="text-xs text-muted-foreground">
                  Adjust universal consultation and registry prices displayed in the Front Desk
                  billing interface.
                </p>
              </div>
            </div>

<<<<<<< HEAD
            <div className="sm:col-span-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRegFee(String(registrationFee));
                  setConsFee(String(consultationFee));
                }}
              >
                Reset
              </Button>
              <Button onClick={saveFees} id="btn-save-fees">
                <Settings2 className="mr-2 h-4 w-4" /> Save fee configuration
              </Button>
=======
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="reg-fee"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Registration Fee (₹)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Charged once upon initial patient registry creation
                </p>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm font-semibold">
                    ₹
                  </span>
                  <Input
                    id="reg-fee"
                    type="number"
                    min={0}
                    value={regFee}
                    onChange={(e) => setRegFee(e.target.value)}
                    className="pl-8 h-10 rounded-lg shadow-sm"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="cons-fee"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  OPD Consultation Fee (₹)
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Charged standard per visit for physician consultation
                </p>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground text-sm font-semibold">
                    ₹
                  </span>
                  <Input
                    id="cons-fee"
                    type="number"
                    min={0}
                    value={consFee}
                    onChange={(e) => setConsFee(e.target.value)}
                    className="pl-8 h-10 rounded-lg shadow-sm"
                  />
                </div>
              </div>

              {/* Live Preview Receipt */}
              <div className="sm:col-span-2 rounded-xl border bg-muted/20 p-5 shadow-inner">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                  Live Preview — New Patient Invoice
                </p>
                <div className="space-y-2 text-xs md:text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registration fee</span>
                    <span className="font-semibold text-foreground">₹{regFee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OPD Consultation fee</span>
                    <span className="font-semibold text-foreground">₹{consFee || 0}</span>
                  </div>
                  <div className="my-2 border-t border-dashed border-border" />
                  <div className="flex justify-between text-sm font-bold">
                    <span>Total (New Patient)</span>
                    <span className="text-primary font-bold">
                      ₹{(Number(regFee) || 0) + (Number(consFee) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground/75 italic pt-1 font-sans">
                    <span>Returning patient (consultation only):</span>
                    <span>₹{Number(consFee) || 0}</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 mt-4 border-t pt-4">
                <Button
                  variant="outline"
                  className="h-10 rounded-lg px-5 font-semibold"
                  onClick={() => {
                    setRegFee(String(registrationFee));
                    setConsFee(String(consultationFee));
                  }}
                >
                  Reset Form
                </Button>
                <Button
                  className="h-10 rounded-lg px-6 font-semibold shadow-sm"
                  onClick={saveFees}
                  id="btn-save-fees"
                >
                  <Settings2 className="mr-2 h-4 w-4" /> Save fee configuration
                </Button>
              </div>
>>>>>>> a821a0c (second update)
            </div>
          </div>
        </TabsContent>

        {/* ── My Subscription Tab ── */}
        <TabsContent
          value="subscription"
          className="outline-none space-y-6 animate-in fade-in-50 duration-200"
        >
          <div className="mb-2">
            <h2 className="text-xl font-display font-bold">My Subscription</h2>
            <p className="text-sm text-muted-foreground">
              View the subscription plan assigned to your account by the super admin.
            </p>
          </div>
          <SubscriptionPanel email={user?.email ?? ''} />
        </TabsContent>
      </Tabs>
    </>
  );
}
