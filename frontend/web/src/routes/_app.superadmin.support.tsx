import { createFileRoute } from '@tanstack/react-router';
import {
  Search,
  Plus,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Send,
  Eye,
  MonitorSmartphone,
  Stethoscope,
  UserCog,
  UserCheck,
  FlaskConical,
  Pill,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

export const Route = createFileRoute('/_app/superadmin/support')({
  component: SupportManagement,
});

type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
type DashboardSource = 'Admin' | 'Front Desk' | 'Doctor' | 'Nurse' | 'Pharmacy' | 'Lab';

interface Ticket {
  id: string;
  source: DashboardSource;
  category: string;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  raisedBy: string;
  date: string;
  assignee: string;
}

const CATEGORY_OPTIONS = [
  'Login / Access Issue',
  'Data Entry Error',
  'Report Generation',
  'Billing Problem',
  'Patient Record',
  'Appointment Issue',
  'Prescription Error',
  'Inventory / Stock',
  'Lab Result Upload',
  'Performance Issue',
  'UI / Display Bug',
  'Other',
];

const SOURCE_ICONS: Record<DashboardSource, typeof Stethoscope> = {
  Admin: UserCog,
  'Front Desk': UserCheck,
  Doctor: Stethoscope,
  Nurse: MonitorSmartphone,
  Pharmacy: Pill,
  Lab: FlaskConical,
};

const SOURCE_COLORS: Record<DashboardSource, string> = {
  Admin: 'bg-indigo-100 text-indigo-700',
  'Front Desk': 'bg-blue-100 text-blue-700',
  Doctor: 'bg-emerald-100 text-emerald-700',
  Nurse: 'bg-pink-100 text-pink-700',
  Pharmacy: 'bg-amber-100 text-amber-700',
  Lab: 'bg-violet-100 text-violet-700',
};

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'T-1042',
    source: 'Admin',
    category: 'Billing Problem',
    subject: 'Unable to generate invoice for patient',
    priority: 'High',
    status: 'Open',
    raisedBy: 'Admin - Apollo Clinics',
    date: 'Today, 10:23 AM',
    assignee: 'Unassigned',
    description:
      'The invoice generation fails whenever we try to add a lab test charge. The system throws an error after clicking Generate.',
  },
  {
    id: 'T-1041',
    source: 'Front Desk',
    category: 'Appointment Issue',
    subject: 'Appointment slot duplication bug',
    priority: 'Medium',
    status: 'In Progress',
    raisedBy: 'Front Desk - City Care',
    date: 'Yesterday, 2:45 PM',
    assignee: 'System Admin',
    description:
      'When booking an appointment for an existing patient, the time slot sometimes gets double-booked. This is causing patient confusion.',
  },
  {
    id: 'T-1039',
    source: 'Doctor',
    category: 'Performance Issue',
    subject: 'Dashboard takes too long to load',
    priority: 'Critical',
    status: 'Open',
    raisedBy: 'Dr. C. Rao',
    date: '1 day ago',
    assignee: 'Super Admin',
    description:
      'The doctor dashboard is taking 15+ seconds to load the patient list. This is severely impacting patient consultations.',
  },
  {
    id: 'T-1035',
    source: 'Pharmacy',
    category: 'Inventory / Stock',
    subject: 'Stock count mismatch in inventory',
    priority: 'Medium',
    status: 'Resolved',
    raisedBy: 'Pharmacy - Metro General',
    date: '3 days ago',
    assignee: 'Support Lead',
    description:
      'The physical stock count and system stock count are showing different numbers for 3 medicines. Needs reconciliation.',
  },
  {
    id: 'T-1030',
    source: 'Nurse',
    category: 'Data Entry Error',
    subject: 'Vitals not saving for ICU patients',
    priority: 'High',
    status: 'Resolved',
    raisedBy: 'Nurse Team - Sunrise',
    date: '5 days ago',
    assignee: 'Support Lead',
    description:
      'Vitals recorded for ICU patients are not being saved after submission. The form submits but data does not persist.',
  },
  {
    id: 'T-1028',
    source: 'Lab',
    category: 'Lab Result Upload',
    subject: 'PDF upload fails for reports > 2MB',
    priority: 'Low',
    status: 'Open',
    raisedBy: 'Lab - Apollo Clinics',
    date: '1 week ago',
    assignee: 'Unassigned',
    description:
      'Lab result PDFs larger than 2MB fail to upload. The system shows a loading spinner but the file never gets uploaded.',
  },
];

const EMPTY_FORM = {
  source: '' as DashboardSource | '',
  category: '',
  subject: '',
  description: '',
  priority: '' as Priority | '',
};

interface FormErrors {
  source?: string;
  category?: string;
  subject?: string;
  description?: string;
  priority?: string;
}

function SupportManagement() {
  const [tickets, setTickets] = useState<Ticket[]>(DEMO_TICKETS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.source.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.raisedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function validateForm() {
    const e: FormErrors = {};
    if (!form.source) e.source = 'Select dashboard source.';
    if (!form.category) e.category = 'Select issue category.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.priority) e.priority = 'Select priority.';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleRaiseTicket() {
    if (!validateForm()) return;
    const newTicket: Ticket = {
      id: `T-${1050 + tickets.length}`,
      source: form.source as DashboardSource,
      category: form.category,
      subject: form.subject,
      description: form.description,
      priority: form.priority as Priority,
      status: 'Open',
      raisedBy: `${form.source} Dashboard`,
      date: 'Just now',
      assignee: 'Unassigned',
    };
    setTickets((prev) => [newTicket, ...prev]);
    toast.success('Support ticket raised successfully!', {
      description: `Ticket ${newTicket.id} is now Open and awaiting assignment.`,
    });
    setForm(EMPTY_FORM);
    setFormErrors({});
    setRaiseOpen(false);
  }

  function updateStatus(id: string, status: TicketStatus) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (viewTicket?.id === id) setViewTicket((t) => t && { ...t, status });
    toast.success(`Ticket updated to "${status}".`);
  }

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-6 flex flex-col h-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Support & Tickets</h1>
          <p className="text-muted-foreground">
            Monitor and resolve issues raised from all dashboards.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setForm(EMPTY_FORM);
            setFormErrors({});
            setRaiseOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Raise Ticket
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
              <h2 className="text-2xl font-bold mt-1">{openCount}</h2>
            </div>
            <div className="rounded-full bg-amber-100 p-3 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <h2 className="text-2xl font-bold mt-1">{inProgressCount}</h2>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <h2 className="text-2xl font-bold mt-1">{resolvedCount}</h2>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
              <h2 className="text-2xl font-bold mt-1">2.4 hrs</h2>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick filter by dashboard source */}
      <div className="flex flex-wrap gap-2">
        {(['All', 'Admin', 'Front Desk', 'Doctor', 'Nurse', 'Pharmacy', 'Lab'] as const).map(
          (src) => {
            const count =
              src === 'All' ? tickets.length : tickets.filter((t) => t.source === src).length;
            return (
              <button
                key={src}
                onClick={() => setFilterStatus('All')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  src === 'All'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border text-muted-foreground',
                )}
              >
                {src} <span className="font-bold">({count})</span>
              </button>
            );
          },
        )}
      </div>

      {/* Ticket Table */}
      <Card className="flex-1">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle>All Tickets</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9 w-[220px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as TicketStatus | 'All')}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Ticket ID</th>
                  <th className="px-6 py-3 font-medium">Source</th>
                  <th className="px-6 py-3 font-medium">Subject</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Raised By</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No tickets found.
                    </td>
                  </tr>
                )}
                {filtered.map((t) => {
                  const SrcIcon = SOURCE_ICONS[t.source];
                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-muted-foreground">{t.id}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            SOURCE_COLORS[t.source],
                          )}
                        >
                          <SrcIcon className="h-3 w-3" />
                          {t.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-[200px] truncate font-medium">{t.subject}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                            t.priority === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : t.priority === 'High'
                                ? 'bg-orange-100 text-orange-700'
                                : t.priority === 'Medium'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-700',
                          )}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded text-xs font-medium border',
                            t.status === 'Open'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : t.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200',
                          )}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">{t.raisedBy}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => setViewTicket(t)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Raise Ticket Sheet */}
      <Sheet open={raiseOpen} onOpenChange={setRaiseOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b mb-6">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-primary" />
              Raise a Support Ticket
            </SheetTitle>
            <SheetDescription>
              Select the dashboard where the issue occurred and provide full details.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Source Dashboard */}
            <div className="space-y-2">
              <Label>
                Source Dashboard <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: v as DashboardSource }))}
              >
                <SelectTrigger className={cn(formErrors.source && 'border-rose-500')}>
                  <SelectValue placeholder="Select dashboard..." />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      'Admin',
                      'Front Desk',
                      'Doctor',
                      'Nurse',
                      'Pharmacy',
                      'Lab',
                    ] as DashboardSource[]
                  ).map((src) => {
                    const Icon = SOURCE_ICONS[src];
                    return (
                      <SelectItem key={src} value={src}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {src} Dashboard
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {formErrors.source && <p className="text-xs text-rose-500">{formErrors.source}</p>}
            </div>

            {/* Issue Category */}
            <div className="space-y-2">
              <Label>
                Issue Category <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger className={cn(formErrors.category && 'border-rose-500')}>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.category && (
                <p className="text-xs text-rose-500">{formErrors.category}</p>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="ticket-subject">
                Subject <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="ticket-subject"
                placeholder="Brief summary of the issue"
                className={cn(formErrors.subject && 'border-rose-500')}
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
              {formErrors.subject && <p className="text-xs text-rose-500">{formErrors.subject}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="ticket-desc">
                Description <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="ticket-desc"
                placeholder="Describe the issue in detail — steps to reproduce, error messages, etc."
                className={cn(
                  'min-h-[120px] resize-none',
                  formErrors.description && 'border-rose-500',
                )}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              {formErrors.description && (
                <p className="text-xs text-rose-500">{formErrors.description}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>
                Priority <span className="text-rose-500">*</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Critical'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: p }))}
                    className={cn(
                      'rounded-lg border py-2 text-xs font-semibold transition-all',
                      form.priority === p
                        ? p === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : p === 'High'
                            ? 'bg-orange-500 text-white border-orange-500'
                            : p === 'Medium'
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-slate-500 text-white border-slate-500'
                        : 'hover:bg-muted',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {formErrors.priority && (
                <p className="text-xs text-rose-500">{formErrors.priority}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button className="flex-1 gap-2" onClick={handleRaiseTicket}>
                <Send className="h-4 w-4" />
                Raise Ticket
              </Button>
              <Button variant="outline" onClick={() => setRaiseOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* View Ticket Detail Sheet */}
      <Sheet open={!!viewTicket} onOpenChange={(o) => !o && setViewTicket(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {viewTicket && (
            <>
              <SheetHeader className="pb-4 border-b mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground mb-1">{viewTicket.id}</p>
                    <SheetTitle className="text-lg leading-tight">{viewTicket.subject}</SheetTitle>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0',
                      viewTicket.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : viewTicket.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : viewTicket.priority === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700',
                    )}
                  >
                    {viewTicket.priority}
                  </span>
                </div>
              </SheetHeader>

              <div className="space-y-5">
                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Source Dashboard', value: viewTicket.source },
                    { label: 'Category', value: viewTicket.category },
                    { label: 'Raised By', value: viewTicket.raisedBy },
                    { label: 'Date', value: viewTicket.date },
                    { label: 'Assignee', value: viewTicket.assignee },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <p className="font-semibold text-sm mt-0.5">{value}</p>
                    </div>
                  ))}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground font-medium">Status</p>
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-xs font-medium border mt-0.5',
                        viewTicket.status === 'Open'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : viewTicket.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      )}
                    >
                      {viewTicket.status}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Issue Description</p>
                  <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground leading-relaxed">
                    {viewTicket.description}
                  </div>
                </div>

                {/* Status update */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Update Status</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Open', 'In Progress', 'Resolved'] as TicketStatus[]).map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant={viewTicket.status === s ? 'default' : 'outline'}
                        className={cn(
                          'text-xs',
                          viewTicket.status === s &&
                            s === 'Open' &&
                            'bg-amber-500 hover:bg-amber-600 border-amber-500',
                          viewTicket.status === s &&
                            s === 'In Progress' &&
                            'bg-blue-500 hover:bg-blue-600 border-blue-500',
                          viewTicket.status === s &&
                            s === 'Resolved' &&
                            'bg-emerald-500 hover:bg-emerald-600 border-emerald-500',
                        )}
                        onClick={() => updateStatus(viewTicket.id, s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setViewTicket(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
