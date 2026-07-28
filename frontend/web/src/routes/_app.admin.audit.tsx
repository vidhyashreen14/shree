<<<<<<< HEAD
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
=======
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
>>>>>>> a821a0c (second update)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
<<<<<<< HEAD
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { useAudit } from "@/lib/store/audit";
import type { AuditLog } from "@/lib/types";
import { formatDistanceToNow, differenceInDays } from "date-fns";
=======
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { useAudit } from '@/lib/store/audit';
import type { AuditLog } from '@/lib/types';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
>>>>>>> a821a0c (second update)

export const Route = createFileRoute('/_app/admin/audit')({
  component: AdminAudit,
});

function AdminAudit() {
  const auditLogs = useAudit((s) => s.logs);
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [timeframeFilter, setTimeframeFilter] = useState('all');

  const uniqueActions = useMemo(() => {
    const actions = new Set(auditLogs.map((log) => log.action));
    return Array.from(actions);
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      // Role filter
      if (roleFilter !== 'all' && item.role !== roleFilter) {
        return false;
      }
      // Action filter
      if (actionFilter !== 'all' && item.action !== actionFilter) {
        return false;
      }
      // Timeframe filter
      if (timeframeFilter !== 'all') {
        const date = new Date(item.at);
        const now = new Date();
        const diffDays = differenceInDays(now, date);
        if (timeframeFilter === 'today' && diffDays !== 0) {
          return false;
        }
        if (timeframeFilter === 'last-3-days' && diffDays > 3) {
          return false;
        }
        if (timeframeFilter === 'last-7-days' && diffDays > 7) {
          return false;
        }
        if (timeframeFilter === 'last-30-days' && diffDays > 30) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, roleFilter, actionFilter, timeframeFilter]);

  const hasActiveFilters =
<<<<<<< HEAD
    roleFilter !== "all" || actionFilter !== "all" || timeframeFilter !== "all";
=======
    roleFilter !== 'all' || actionFilter !== 'all' || timeframeFilter !== 'all';
>>>>>>> a821a0c (second update)

  const resetFilters = () => {
    setRoleFilter('all');
    setActionFilter('all');
    setTimeframeFilter('all');
  };

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
<<<<<<< HEAD
      { header: "User", accessorKey: "user" },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip>,
      },
      { header: "Action", accessorKey: "action" },
      {
        header: "When",
        accessorKey: "at",
=======
      { header: 'User', accessorKey: 'user' },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip>,
      },
      { header: 'Action', accessorKey: 'action' },
      {
        header: 'When',
        accessorKey: 'at',
>>>>>>> a821a0c (second update)
        cell: ({ getValue }) =>
          formatDistanceToNow(new Date(String(getValue())), { addSuffix: true }),
      },
    ],
<<<<<<< HEAD
    []
=======
    [],
>>>>>>> a821a0c (second update)
  );

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Audit logs"
        description="Every privileged action across the platform."
      />

      {/* Filters Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mr-2">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>

        {/* Role Filter */}
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="nurse">Nurse</SelectItem>
            <SelectItem value="lab">Laboratory</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
            <SelectItem value="frontdesk">Front Desk</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Filter */}
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Filter by Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map((action) => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Timeframe Filter */}
        <Select value={timeframeFilter} onValueChange={setTimeframeFilter}>
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Filter by Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last-3-days">Last 3 days</SelectItem>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground h-10 px-3 ml-auto sm:ml-0"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filteredLogs}
        searchPlaceholder="Search by user, action…"
        pageSize={12}
      />
    </>
  );
}
