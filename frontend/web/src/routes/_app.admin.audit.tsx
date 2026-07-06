import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
import { auditLogs } from "@/lib/mock/data";
import type { AuditLog } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_app/admin/audit")({
  component: AdminAudit,
});

function AdminAudit() {
  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    { header: "User", accessorKey: "user" },
    { header: "Role", accessorKey: "role", cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip> },
    { header: "Action", accessorKey: "action" },
    { header: "Target", accessorKey: "target", cell: ({ getValue }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{String(getValue())}</code> },
    { header: "IP", accessorKey: "ip", cell: ({ getValue }) => <span className="font-mono text-xs">{String(getValue())}</span> },
    { header: "When", accessorKey: "at", cell: ({ getValue }) => formatDistanceToNow(new Date(String(getValue())), { addSuffix: true }) },
  ], []);

  return (
    <>
      <PageHeader eyebrow="System" title="Audit logs" description="Every privileged action across the platform." />
      <DataTable columns={columns} data={auditLogs} searchPlaceholder="Search by user, action…" pageSize={12} />
    </>
  );
}
