import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreHorizontal, Mail } from "lucide-react";
import { doctors } from "@/lib/mock/data";
import { ROLES } from "@/lib/rbac";
import type { Role } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/users")({
  component: AdminUsers,
});

interface RowUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: "active" | "invited" | "suspended";
}

const seed: RowUser[] = [
  ...doctors.map((d) => ({
    id: d.id,
    name: d.name,
    email: d.email,
    role: "doctor" as Role,
    department: d.department,
    status: "active" as const,
  })),
  {
    id: "u-fd1",
    name: "Priya Menon",
    email: "priya@medicore.io",
    role: "frontdesk",
    department: "Reception",
    status: "active",
  },
  {
    id: "u-fd2",
    name: "Karan Singh",
    email: "karan@medicore.io",
    role: "frontdesk",
    department: "Reception",
    status: "active",
  },
  {
    id: "u-rn1",
    name: "Sister Joan Lewis",
    email: "joan@medicore.io",
    role: "nurse",
    department: "OPD",
    status: "active",
  },
  {
    id: "u-rn2",
    name: "Sister Tara Wu",
    email: "tara@medicore.io",
    role: "nurse",
    department: "ICU",
    status: "invited",
  },
  {
    id: "u-rx1",
    name: "Rahul Verma",
    email: "rahul@medicore.io",
    role: "pharmacy",
    department: "Pharmacy",
    status: "active",
  },
  {
    id: "u-lab1",
    name: "Mei Chen",
    email: "mei@medicore.io",
    role: "lab",
    department: "Pathology",
    status: "active",
  },
  {
    id: "u-lab2",
    name: "Diego Alvarez",
    email: "diego@medicore.io",
    role: "lab",
    department: "Radiology",
    status: "suspended",
  },
];

const statusTone = { active: "success", invited: "info", suspended: "danger" } as const;

function AdminUsers() {
  const [rows, setRows] = useState<RowUser[]>(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "doctor" as Role, department: "" });

  const columns = useMemo<ColumnDef<RowUser>[]>(
    () => [
      {
        header: "User",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {row.original.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                {row.original.email}
              </p>
            </div>
          </div>
        ),
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ getValue }) => <StatusChip tone="primary">{String(getValue())}</StatusChip>,
      },
      { header: "Department", accessorKey: "department" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const s = getValue() as RowUser["status"];
          return <StatusChip tone={statusTone[s]}>{s}</StatusChip>;
        },
      },
      {
        header: "",
        id: "actions",
        cell: () => (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="User management"
        description="Invite teammates, manage roles, and control access across the hospital."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Invite user
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a new user</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="n">Full name</Label>
                  <Input
                    id="n"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="e">Email</Label>
                  <Input
                    id="e"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v) => setForm({ ...form, role: v as Role })}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="d">Department</Label>
                    <Input
                      id="d"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!form.name || !form.email) {
                      toast.error("Name and email required");
                      return;
                    }
                    setRows([{ id: `u-${Date.now()}`, ...form, status: "invited" }, ...rows]);
                    toast.success(`Invitation sent to ${form.email}`);
                    setOpen(false);
                    setForm({ name: "", email: "", role: "doctor", department: "" });
                  }}
                >
                  Send invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable columns={columns} data={rows} searchPlaceholder="Search users…" />
    </>
  );
}
