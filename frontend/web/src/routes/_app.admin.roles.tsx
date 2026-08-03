import { createFileRoute } from '@tanstack/react-router';
import { PageHeader } from '@/components/common/PageHeader';
import { Check, Shield } from 'lucide-react';
import { ROLES } from '@/lib/rbac';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/admin/roles')({
  component: AdminRoles,
});

const matrix: { permission: string; group: string; roles: Record<string, boolean> }[] = [
  {
    permission: 'View dashboard',
    group: 'General',
    roles: { admin: true, doctor: true, frontdesk: true, nurse: true, pharmacy: true, lab: true },
  },
  {
    permission: 'Manage users',
    group: 'Admin',
    roles: {
      admin: true,
      doctor: false,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'Manage departments',
    group: 'Admin',
    roles: {
      admin: true,
      doctor: false,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'Register patients',
    group: 'Patients',
    roles: {
      admin: true,
      doctor: false,
      frontdesk: true,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'View patient records',
    group: 'Patients',
    roles: { admin: true, doctor: true, frontdesk: true, nurse: true, pharmacy: false, lab: true },
  },
  {
    permission: 'Create prescriptions',
    group: 'Clinical',
    roles: {
      admin: false,
      doctor: true,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'Record vitals',
    group: 'Clinical',
    roles: {
      admin: false,
      doctor: true,
      frontdesk: false,
      nurse: true,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'Order lab tests',
    group: 'Clinical',
    roles: {
      admin: false,
      doctor: true,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
  {
    permission: 'Manage inventory',
    group: 'Pharmacy',
    roles: {
      admin: true,
      doctor: false,
      frontdesk: false,
      nurse: false,
      pharmacy: true,
      lab: false,
    },
  },
  {
    permission: 'Upload lab reports',
    group: 'Lab',
    roles: {
      admin: false,
      doctor: false,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: true,
    },
  },
  {
    permission: 'View audit logs',
    group: 'System',
    roles: {
      admin: true,
      doctor: false,
      frontdesk: false,
      nurse: false,
      pharmacy: false,
      lab: false,
    },
  },
];

function AdminRoles() {
  return (
    <>
      <PageHeader
        eyebrow="Access control"
        title="Roles & permissions"
        description="Granular, role-based access mirrored from the active backend policy."
      />
      <div className="surface-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Permission
                </th>
                {ROLES.map((r) => (
                  <th
                    key={r.value}
                    className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrix.map((row) => (
                <tr key={row.permission} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <p className="font-medium">{row.permission}</p>
                    <p className="text-xs text-muted-foreground">{row.group}</p>
                  </td>
                  {ROLES.map((r) => (
                    <td key={r.value} className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          'inline-grid h-7 w-7 place-items-center rounded-full',
                          row.roles[r.value]
                            ? 'bg-success/15 text-success'
                            : 'bg-muted text-muted-foreground/50',
                        )}
                      >
                        {row.roles[r.value] ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Shield className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
