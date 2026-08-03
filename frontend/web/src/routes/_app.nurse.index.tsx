import { createFileRoute, Link } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import {
  HeartPulse,
  Hourglass,
  Users,
  ClipboardList,
  CheckCircle2,
  Clock,
  Printer,
} from 'lucide-react';
import { appointments, patients as mockPatients, doctors } from '@/lib/mock/data';
import { useNurseQueue } from '@/lib/store/nurseQueue';
import { isToday, format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHospitalSettings } from '@/lib/store/hospitalSettings';
import type { NurseQueueEntry, NurseVitals } from '@/lib/types';

export const Route = createFileRoute('/_app/nurse/')({
  head: () => ({
    meta: [
      { title: 'Nurse Dashboard · MediCore' },
      { name: 'description', content: 'Record vitals, flag risks and prep patients for consult.' },
    ],
  }),
  component: NurseOverview,
});

const triageHourly = Array.from({ length: 9 }).map((_, i) => ({
  hour: `${9 + i}:00`,
  triaged: 2 + ((i * 5) % 9),
  pending: Math.max(1, 4 - (i % 4)),
}));

function printVitalsSlip(entry: NurseQueueEntry) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this website.');
    return;
  }
  const dateStr = format(new Date(entry.arrivedAt), 'dd MMM yyyy, hh:mm a');
  const vitals = (entry.vitals || {}) as Partial<NurseVitals>;
  const { name, phone, address, logoUrl } = useHospitalSettings.getState();

  win.document.write(`
    <html>
      <head>
        <title>Patient Vitals Slip — ${entry.uhid}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; background: #fff; }
          .bill { max-width: 680px; margin: 0 auto; padding: 32px; }
          .header { display: flex; flex-direction: column; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 20px; text-align: center; }
          .logo { font-size: 22px; font-weight: 800; color: #0d9488; }
          .subtitle { font-size: 11px; color: #555; margin-top: 2px; }
          .addr { font-size: 11px; color: #555; margin-top: 6px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 16px; }
          .meta p { font-size: 12px; margin-bottom: 4px; }
          .section { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 14px 0 8px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 10px; text-align: left; }
          td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
          .val { text-align: right; }
          .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #888; border-top: 1px dashed #ddd; padding-top: 12px; }
          .badge { display: inline-block; background: #f0fdfa; color: #0d9488; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="bill">
          <!-- Header -->
          <div class="header">
            ${
              logoUrl
                ? `
              <img src="${logoUrl}" alt="Logo" style="max-height: 50px; max-width: 150px; margin-bottom: 8px; object-fit: contain;" />
            `
                : `
              <div class="logo">🏥 ${name}</div>
            `
            }
            ${logoUrl ? `<div style="font-size: 14px; font-weight: 800; color: #0d9488; margin-top: 2px;">${name}</div>` : ''}
            <div class="subtitle">Multispecialty Hospital · Compassionate Care</div>
            <div class="addr">
              ${address} · 📞 ${phone}
            </div>
          </div>

          <!-- Bill meta -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <span class="badge">Patient Vitals Slip</span>
            <div style="text-align: right; font-size: 12px;">
              <div><strong>Slip No:</strong> VT-${entry.id.slice(-6).toUpperCase()}</div>
              <div><strong>Date:</strong> ${dateStr}</div>
            </div>
          </div>

          <!-- Patient info -->
          <div class="section">Patient Details</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Patient Name:</strong> ${entry.patientName}</p>
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Patient ID (UHID):</strong> ${entry.uhid}</p>
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Age / Gender:</strong> ${entry.age}y / ${entry.gender}</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Assigned Consultant:</strong> ${entry.doctorName || 'Dr. Assigned'}</p>
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Department:</strong> ${entry.department || 'General Medicine'}</p>
              <p style="font-size: 12px; margin-bottom: 4px;"><strong>Type:</strong> ${entry.isNewPatient ? 'New Patient' : 'Returning Patient'}</p>
            </div>
          </div>

          <!-- Vitals table -->
          <div class="section">Clinical Parameters</div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="width: 10; background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 10px; text-align: left;">#</th>
                <th style="width: 50; background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 10px; text-align: left;">Clinical Parameter</th>
                <th style="text-align: right; width: 40; background: #f0fdfa; color: #0d9488; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 8px 10px;">Recorded Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">1</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Height</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.height ? vitals.height + ' cm' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">2</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Weight</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.weight ? vitals.weight + ' kg' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">3</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">BMI (Body Mass Index)</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.bmi || '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">4</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Blood Pressure</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.bp ? vitals.bp + ' mmHg' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">5</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Pulse Rate / Heart Rate</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.pulse ? vitals.pulse + ' bpm' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">6</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Body Temperature</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.tempF ? vitals.tempF + ' °F' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">7</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Oxygen Saturation (SpO₂)</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.spo2 ? vitals.spo2 + ' %' : '—'}</td>
              </tr>
              <tr>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">8</td>
                <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px;">Blood Sugar Level</td>
                <td class="val" style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; text-align: right; font-weight: bold; color: #0d9488;">${vitals.sugar ? vitals.sugar + ' mg/dL' : '— (Optional)'}</td>
              </tr>
            </tbody>
          </table>

          <!-- Chief Complaint -->
          <div class="section">Chief Complaint / Notes</div>
          <div style="font-size: 12px; padding: 12px; background: #fafafa; border-radius: 4px; border: 1px dashed #cbd5e1; min-height: 40px; line-height: 1.5; color: #333; margin-top: 6px;">
            ${vitals.chiefComplaint || 'No active complaints specified.'}
          </div>

          <!-- Footer -->
          <div class="footer">
            This is a computer generated vitals slip and does not require a signature.<br />
            Thank you for choosing ${name}.
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
    </html>
  `);
  win.document.close();
}

function NurseOverview() {
  const today = appointments.filter((a) => isToday(new Date(a.date)));
  const awaiting = today.filter((a) => a.status === 'scheduled' || a.status === 'checked-in');

  const { queue } = useNurseQueue();
  const pendingQueue = queue.filter((e) => e.vitalsStatus === 'pending');
  const inProgressQueue = queue.filter((e) => e.vitalsStatus === 'in-progress');
  const freshQueue = [...inProgressQueue, ...pendingQueue]; // in-progress first
  const recordedQueue = queue.filter((e) => e.vitalsStatus === 'done');

  return (
    <>
      <PageHeader
        eyebrow="Nursing station"
        title="Triage & observation"
        description="Record vitals, flag risks and prep patients for consult."
        actions={
          <Link to="/nurse/vitals" search={{}}>
            <Button>
              <HeartPulse className="mr-2 h-4 w-4" /> Record vitals
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting vitals (reception)"
          value={freshQueue.length}
          icon={Hourglass}
          tone="warning"
        />
        <StatCard label="Today's patients" value={today.length} icon={Users} tone="primary" />
        <StatCard label="Vitals recorded" value={recordedQueue.length} icon={HeartPulse} tone="success" />
        <StatCard label="Observation notes" value="14" icon={ClipboardList} tone="info" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick Vitals Entry Section */}
        <div className="surface-elevated p-5 lg:col-span-3 border-l-4 border-l-primary">
          <h3 className="font-display font-semibold mb-4 text-primary">Quick Vitals Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" placeholder="e.g. PT-1234" />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="patientName">Patient Name</Label>
              <Input id="patientName" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bp">Blood Pressure</Label>
              <Input id="bp" placeholder="120/80" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="temp">Temperature</Label>
              <Input id="temp" placeholder="98.6 °F" />
            </div>
            <div className="w-full">
              <Button className="w-full" onClick={() => alert('Vitals saved successfully!')}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Save Vitals
              </Button>
            </div>
          </div>
        </div>

        {/* Triage chart */}
        <div className="surface-elevated p-5 lg:col-span-2">
          <h3 className="font-display font-semibold">Triage throughput today</h3>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={triageHourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="triaged"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reception queue — pushed by front desk */}
        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">From Reception</h3>
            {freshQueue.length > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                {freshQueue.length} waiting
              </span>
            )}
          </div>
          <div className="divide-y divide-border">
            {freshQueue.slice(0, 8).map((entry) => (
              <div key={entry.id} className="py-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {entry.patientName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{entry.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.uhid} · {entry.age}y · {entry.gender}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.doctorName} · {entry.department}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(entry.arrivedAt), { addSuffix: true })}
                      <span
                        className={cn(
                          'ml-1 rounded-full px-1.5 py-0.5 font-semibold',
                          entry.isNewPatient
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {entry.isNewPatient ? 'New' : 'Return'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {entry.vitalsStatus === 'pending' && (
                    <Link to="/nurse/vitals" search={{ queueId: entry.id }} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full h-7 text-xs">
                        Start vitals
                      </Button>
                    </Link>
                  )}
                  {entry.vitalsStatus === 'in-progress' && (
                    <>
                      <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <HeartPulse className="h-3 w-3" /> In progress
                      </span>
                      <Link to="/nurse/vitals" search={{ queueId: entry.id }} className="flex-1">
                        <Button size="sm" className="w-full h-7 text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Enter vitals
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
            {freshQueue.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No patients from reception yet.
              </p>
            )}
          </div>
          {freshQueue.length > 0 && (
            <Link
              to="/nurse/queue"
              className="mt-2 block text-center text-xs font-semibold text-primary hover:underline"
            >
              View full queue
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Panels Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Existing awaiting vitals panel */}
        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Scheduled — Awaiting vitals</h3>
            <Link to="/nurse/queue" className="text-xs font-semibold text-primary hover:underline">
              View queue
            </Link>
          </div>
          <div className="divide-y divide-border">
            {awaiting.slice(0, 6).map((a) => {
              const p = mockPatients.find((x) => x.id === a.patientId)!;
              const d = doctors.find((x) => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    #{a.token}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.age}y · for {d?.name} · {format(new Date(a.date), 'p')}
                    </p>
                  </div>
                  <Link to="/nurse/vitals" search={{ patientId: p.id }}>
                    <Button size="sm" variant="outline">
                      Take
                    </Button>
                  </Link>
                </div>
              );
            })}
            {awaiting.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">No one in queue.</p>
            )}
          </div>
        </div>

        {/* Vitals Print Station */}
        <div className="surface-elevated p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display font-semibold">Vitals Print Station</h3>
            <span className="text-xs text-muted-foreground">Recorded today</span>
          </div>
          <div className="divide-y divide-border">
            {recordedQueue.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {e.uhid} · {e.age}y · BP: {e.vitals?.bp} · Temp: {e.vitals?.tempF}°F
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => printVitalsSlip(e)}>
                  <Printer className="mr-1 h-3.5 w-3.5 text-primary" /> Print Slip
                </Button>
              </div>
            ))}
            {recordedQueue.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No vitals recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
