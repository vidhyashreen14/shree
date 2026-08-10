import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  Search,
  X,
  CalendarDays,
  FileCheck2,
  Printer,
  Download,
  Building2,
  User,
  Activity,
  Phone,
  UserCheck,
} from 'lucide-react';
import { labOrders, patients, doctors, SUPER_ADMIN_CONFIG } from '@/lib/mock/data';
import { getSuperAdminReportConfig } from '@/lib/services/superAdmin';
import { GenerateReportModal } from '@/components/lab/GenerateReportModal';
import { format } from 'date-fns';
import { StatusChip } from '@/components/common/StatusChip';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/lab/reports')({
  component: LabReports,
});

// ─── Filter Options ────────────────────────────────────────────────────────────
const BRANCH_OPTIONS = ['Select Branch', 'Koramangala', 'Indiranagar', 'Whitefield', 'Jayanagar'];
const STATUS_OPTIONS = [
  'Select Service Status',
  'ordered',
  'sample-collected',
  'in-progress',
  'completed',
];
const B2B_OPTIONS = [
  'Select B2B',
  'Apollo Hospitals',
  'Fortis Healthcare',
  'Manipal Group',
  'Narayana Health',
];

const toneFor: Record<string, 'info' | 'primary' | 'warning' | 'success' | 'danger' | 'neutral'> = {
  ordered: 'info',
  'sample-collected': 'primary',
  'in-progress': 'warning',
  completed: 'success',
};

function LabReports() {
  const { data: fetchedConfig } = useQuery({
    queryKey: ["reportConfig"],
    queryFn: () => getSuperAdminReportConfig(false),
  });
  const config = fetchedConfig || SUPER_ADMIN_CONFIG;

  const [activeTab, setActiveTab] = useState("action-needed");
  const [reportOrderId, setReportOrderId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());

  // Layout toggles
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list');
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Row 1 Filters
  const [branch, setBranch] = useState('Select Branch');
  const [fromDate, setFromDate] = useState('2026-07-11');
  const [toDate, setToDate] = useState('2026-07-11');
  const [serviceStatus, setServiceStatus] = useState('Select Service Status');
  const [labId, setLabId] = useState('');
  const [specimenId, setSpecimenId] = useState('');
  const [mobile, setMobile] = useState('');

  // Row 2 Filters
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [b2b, setB2b] = useState('Select B2B');
  const [consultingDoctor, setConsultingDoctor] = useState('Select Consulting Doctor');

  const [hasSearched, setHasSearched] = useState(false);

  // Action: Clear
  const handleClear = () => {
    setBranch('Select Branch');
    setFromDate('2026-07-11');
    setToDate('2026-07-11');
    setServiceStatus('Select Service Status');
    setLabId('');
    setSpecimenId('');
    setMobile('');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setB2b('Select B2B');
    setConsultingDoctor('Select Consulting Doctor');
    setHasSearched(false);
    toast.success('Filters cleared');
  };

  // Action: Search
  const handleSearch = () => {
    setHasSearched(true);
    toast.success('Searching for reports...');
  };

  // Filtered reports logic
  const filteredReports = useMemo(() => {
    let list = labOrders;

    if (activeTab === "action-needed") {
      list = list.filter((order) => order.status === "sample-collected" && !generated.has(order.id));
    }

    return list.filter((order) => {
      // Branch filter
      if (branch !== 'Select Branch') {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p) return false;
        if (branch === 'Koramangala' && !p.address.includes('Mumbai')) return false;
        if (branch === 'Indiranagar' && !p.address.includes('Bengaluru')) return false;
      }
      // Status filter
      if (serviceStatus !== 'Select Service Status' && order.status !== serviceStatus) {
        return false;
      }
      // Lab ID filter
      if (labId.trim() && !order.id.toLowerCase().includes(labId.toLowerCase())) {
        return false;
      }
      // Mobile filter
      if (mobile.trim()) {
        const p = patients.find((pat) => pat.id === order.patientId);
        if (!p || !p.phone.includes(mobile.trim())) {
          return false;
        }
      }
      // Doctor filter
      if (consultingDoctor !== 'Select Consulting Doctor') {
        const doc = doctors.find((d) => d.name === consultingDoctor);
        if (!doc || order.doctorId !== doc.id) {
          return false;
        }
      }
      return true;
    });
  }, [branch, serviceStatus, labId, mobile, consultingDoctor]);

  return (
    <div className="flex flex-col min-h-screen justify-between pb-4">
      <div className="space-y-4">
        {/* ─── Header & Top Controls ────────────────────────────────────────── */}
        <PageHeader
          eyebrow="Lab · Diagnostics"
          title="Report Dashboard"
          actions={
            <div className="flex items-center gap-2">
              {/* Grid/List Layout Toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`grid h-7 w-7 place-items-center rounded-md transition-all ${layoutMode === 'list'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                    }`}
                  aria-label="List layout"
                  aria-pressed={layoutMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`grid h-7 w-7 place-items-center rounded-md transition-all ${layoutMode === 'grid'
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                    }`}
                  aria-label="Grid layout"
                  aria-pressed={layoutMode === 'grid'}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${showFilterPanel
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                  }`}
                aria-label="Toggle advanced search"
                aria-pressed={showFilterPanel}
              >
                <Filter className="h-4 w-4" />
              </button>

              {/* Dropdown Action Button */}
              <div className="relative group">
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  Actions
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <div className="absolute right-0 mt-1 hidden group-hover:block w-40 rounded-lg border border-border bg-popover py-1.5 shadow-md z-20 text-xs">
                  <button
                    onClick={() => toast.info('Exporting all visible reports')}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted"
                  >
                    Export All
                  </button>
                  <button
                    onClick={() => toast.info('Printing selected reports')}
                    className="w-full text-left px-3 py-1.5 hover:bg-muted"
                  >
                    Print Selected
                  </button>
                </div>
              </div>
            </div>
          }
        />

        {/* ─── Advanced Search Filter Grid ──────────────────────────────────── */}
        {showFilterPanel && (
          <div className="surface-elevated p-5 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {/* Branch */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Branch
                </label>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {BRANCH_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* From Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  From Date
                </label>
                <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1.5" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              {/* To Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  To Date
                </label>
                <div className="relative flex items-center rounded-lg border border-border bg-background px-3 h-9">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0 mr-1.5" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-transparent text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              {/* Service Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Service Status
                </label>
                <div className="relative">
                  <select
                    value={serviceStatus}
                    onChange={(e) => setServiceStatus(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o === 'Select Service Status' ? o : o.replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Lab ID / Specimen ID */}
              <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Lab ID / Specimen ID
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Lab ID"
                    value={labId}
                    onChange={(e) => setLabId(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Input
                    placeholder="Specimen ID"
                    value={specimenId}
                    onChange={(e) => setSpecimenId(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Mobile
                </label>
                <Input
                  placeholder="Mobile No."
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  First Name
                </label>
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Middle Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Middle Name
                </label>
                <Input
                  placeholder="Middle Name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Last Name
                </label>
                <Input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* B2B Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  B2B Partner
                </label>
                <div className="relative">
                  <select
                    value={b2b}
                    onChange={(e) => setB2b(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    {B2B_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {/* Consulting Doctor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Consulting Doctor
                </label>
                <div className="relative">
                  <select
                    value={consultingDoctor}
                    onChange={(e) => setConsultingDoctor(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none pr-8 h-9"
                  >
                    <option value="Select Consulting Doctor">Select Consulting Doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Panel Actions */}
            <div className="flex justify-end gap-2 border-t border-border pt-3">
              <Button size="sm" onClick={handleSearch} className="flex items-center gap-1.5 pr-2">
                <Search className="h-3.5 w-3.5" />
                Search
                <ChevronDown className="h-3 w-3 border-l border-primary-foreground/35 pl-1 ml-0.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClear}
                className="flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* ─── Main Results Display ────────────────────────────────────────── */}
        {hasSearched && (
          <div className="mt-4">
            {filteredReports.length === 0 ? (
              <div className="surface-elevated p-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
                <FileCheck2 className="h-10 w-10 opacity-30" />
                <p className="font-medium">No reports match your current filter query</p>
                <Button size="sm" variant="outline" onClick={handleClear}>
                  Reset Filters
                </Button>
              </div>
            ) : layoutMode === 'list' ? (
              /* List/Table view */
              <div className="surface-elevated overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Lab ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Patient Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Tests
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Ordered On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredReports.map((report) => {
                      const p = patients.find((pat) => pat.id === report.patientId);
                      const doc = doctors.find((d) => d.id === report.doctorId);
                      const isDone = generated.has(report.id) || report.status === "completed";
                      const isCollected = report.status === "sample-collected" && !isDone;

                      return (
                        <tr key={report.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                            {report.id}
                          </td>
                          <td className="px-4 py-3 font-medium text-sm">
                            {p?.name || 'Unknown Patient'}
                          </td>
                          <td className="px-4 py-3 text-xs">{report.tests.join(', ')}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {format(new Date(report.orderedOn), 'dd-MMM-yyyy, p')}
                          </td>
                          <td className="px-4 py-3">
                            <StatusChip tone={toneFor[report.status] || 'neutral'}>
                              {report.status.replace('-', ' ')}
                            </StatusChip>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Print Report"
                              >
                                <Printer className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredReports.map((report) => {
                  const p = patients.find((pat) => pat.id === report.patientId);
                  const doc = doctors.find((d) => d.id === report.doctorId);
                  const isDone = generated.has(report.id) || report.status === "completed";
                  const isCollected = report.status === "sample-collected" && !isDone;
                  return (
                    <div
                      key={report.id}
                      className="surface-elevated p-4 flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <code className="font-mono text-xs font-bold text-primary">
                            {report.id}
                          </code>
                          <StatusChip tone={toneFor[report.status] || 'neutral'}>
                            {report.status.replace('-', ' ')}
                          </StatusChip>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                              {p?.name || 'Unknown Patient'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{report.tests.join(', ')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{p?.phone || 'No Mobile'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Ref: {doc?.name || 'Self'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-2.5">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(report.orderedOn), 'dd-MMM-yyyy')}
                        </span>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                            <Printer className="mr-1 h-3 w-3" /> Print
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                            <Download className="mr-1 h-3 w-3" /> PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Footer Attribution ───────────────────────────────────────────── */ }
      <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        <p>Copyright &copy; 2026 Sufalam, All rights reserved.</p>
      </footer>

      <GenerateReportModal 
        orderId={reportOrderId} 
        open={!!reportOrderId} 
        onOpenChange={(o) => { if (!o) setReportOrderId(null); }} 
        onGenerated={() => {
          if (reportOrderId) {
            setGenerated((prev) => new Set(prev).add(reportOrderId));
            setReportOrderId(null);
          }
        }} 
      />
    </div >
  );
}
