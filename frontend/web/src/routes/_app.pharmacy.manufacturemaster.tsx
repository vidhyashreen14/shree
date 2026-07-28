import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { medicines as seedMedicines } from "@/lib/mock/data";
import {
  Plus,
  Pencil,
  Factory,
  PackageMinus,
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Building2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/pharmacy/manufacturemaster")({
  component: ManufactureMaster,
});

interface Manufacturer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

function ManufactureMaster() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() => {
    const unique = Array.from(new Set(seedMedicines.map((m) => m.manufacturer)));
    const mocks: Record<string, { phone: string; address: string; email: string }> = {
      Cipla: {
        phone: "+91 98765 43210",
        address: "Mumbai, Maharashtra",
        email: "contact@cipla.com",
      },
      "Dr. Reddy's": {
        phone: "+91 87654 32109",
        address: "Hyderabad, Telangana",
        email: "info@drreddys.com",
      },
      GSK: {
        phone: "+44 20 8990 9000",
        address: "London, United Kingdom",
        email: "gsk.support@gsk.com",
      },
      Pfizer: {
        phone: "+1 212-733-2323",
        address: "New York, USA",
        email: "corporate.affairs@pfizer.com",
      },
    };
    return unique
      .map((name) => ({
        name,
        phone: mocks[name]?.phone ?? "+91 99999 88888",
        address: mocks[name]?.address ?? "Industrial Area, Phase 1",
        email: mocks[name]?.email ?? `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMfg, setEditingMfg] = useState<Manufacturer | null>(null);
  const [mfgName, setMfgName] = useState("");
  const [mfgPhone, setMfgPhone] = useState("");
  const [mfgEmail, setMfgEmail] = useState("");
  const [mfgAddress, setMfgAddress] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleOpenAdd = () => {
    setEditingMfg(null);
    setMfgName("");
    setMfgPhone("");
    setMfgEmail("");
    setMfgAddress("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (mfg: Manufacturer) => {
    setEditingMfg(mfg);
    setMfgName(mfg.name);
    setMfgPhone(mfg.phone);
    setMfgEmail(mfg.email);
    setMfgAddress(mfg.address);
    setIsDialogOpen(true);
  };

  const handleSaveManufacturer = () => {
    const name = mfgName.trim();
    const phone = mfgPhone.trim();
    const email = mfgEmail.trim();
    const address = mfgAddress.trim();

    if (!name) {
      toast.error("Please enter a manufacturer name");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingMfg) {
        // Editing existing
        if (
          name.toLowerCase() !== editingMfg.name.toLowerCase() &&
          manufacturers.some((m) => m.name.toLowerCase() === name.toLowerCase())
        ) {
          toast.error("Manufacturer name already exists");
          setIsLoading(false);
          return;
        }
        setManufacturers((prev) =>
          prev
            .map((m) => (m.name === editingMfg.name ? { name, phone, email, address } : m))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success(`Updated manufacturer "${name}"`);
      } else {
        // Adding new
        if (manufacturers.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
          toast.error("Manufacturer name already exists");
          setIsLoading(false);
          return;
        }
        const newMfg: Manufacturer = { name, phone, email, address };
        setManufacturers((prev) => [...prev, newMfg].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Added "${name}" to manufacturers`);
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteManufacturer = (name: string) => {
    const medCount = seedMedicines.filter((m) => m.manufacturer === name).length;
    if (medCount > 0) {
      toast.warning(`Cannot delete "${name}" - ${medCount} medicine(s) use this manufacturer`);
      return;
    }
    if (window.confirm(`Delete manufacturer "${name}"?`)) {
      setIsLoading(true);
      setTimeout(() => {
        setManufacturers((prev) => prev.filter((m) => m.name !== name));
        setIsLoading(false);
        toast.success(`Removed "${name}" from manufacturers`);
      }, 500);
    }
  };

  const filteredManufacturers = searchQuery
    ? manufacturers.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : manufacturers;

  const totalItems = filteredManufacturers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredManufacturers.slice(startIndex, endIndex);

  const getMedicineCount = (manufacturer: string) => {
    return seedMedicines.filter((m) => m.manufacturer === manufacturer).length;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (manufacturers.length === 0) {
      toast.info("No manufacturers to export");
      return;
    }
    const csv =
      "Manufacturer Name,Phone No,Email,Address,Medicine Count\n" +
      manufacturers
        .map(
          (m) => `"${m.name}","${m.phone}","${m.email}","${m.address}",${getMedicineCount(m.name)}`
        )
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manufacturers_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported manufacturers list");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manufacture Master"
        description="Manage all medicine manufacturers in the system."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={exportToCSV} className="text-white">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <span className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
              {manufacturers.length} Total
            </span>
          </div>
        }
      />

      <div className="surface-elevated rounded-2xl overflow-hidden border border-border">
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search manufacturers..."
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleOpenAdd}
              disabled={isLoading}
              variant="default"
              className="text-white w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Manufacturer
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-600/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Manufacturers</p>
                  <p className="text-2xl font-bold text-emerald-700">{manufacturers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/10 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Medicines</p>
                  <p className="text-2xl font-bold text-blue-700">{seedMedicines.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-600/10 rounded-lg">
                  <Factory className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Avg Medicines/Manufacturer
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {manufacturers.length > 0
                      ? (seedMedicines.length / manufacturers.length).toFixed(1)
                      : "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Manufacturer List</h4>
            <span className="text-xs text-muted-foreground">
              Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems}
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            {currentItems.length === 0 ? (
              <EmptyState
                icon={Factory}
                title={searchQuery ? "No manufacturers match" : "No manufacturers"}
                description={
                  searchQuery
                    ? `No manufacturers found matching "${searchQuery}"`
                    : "Add your first manufacturer above."
                }
              />
            ) : (
              <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Manufacturer</th>
                    <th className="px-6 py-3">Phone No</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3 text-center">Medicines</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((mfg) => {
                    const medCount = getMedicineCount(mfg.name);
                    return (
                      <tr key={mfg.name} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-emerald-600" />
                            <span>{mfg.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-foreground/80">{mfg.phone || "—"}</td>
                        <td className="px-6 py-4 text-foreground/80">{mfg.email || "—"}</td>
                        <td
                          className="px-6 py-4 text-foreground/80 max-w-[200px] truncate"
                          title={mfg.address}
                        >
                          {mfg.address || "—"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block bg-primary/10 text-primary px-2.5 py-0.5 rounded text-xs font-semibold">
                            {medCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleOpenEdit(mfg)}
                              title="Edit manufacturer"
                              disabled={isLoading}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteManufacturer(mfg.name)}
                              title="Delete manufacturer"
                              disabled={medCount > 0 || isLoading}
                            >
                              <PackageMinus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Page {currentPage} of {totalPages || 1}
                </span>
                <span>·</span>
                <span>
                  Showing {startIndex + 1}–{endIndex} of {totalItems}
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="flex items-center px-2 text-xs font-medium">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {manufacturers.length} manufacturer(s) · {seedMedicines.length} medicine(s)
          </p>
          <div className="flex gap-2">
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                Clear Search
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                setItemsPerPage(10);
                setSearchQuery("");
                toast.info("Reset to default view");
              }}
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
            >
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog modal for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingMfg ? "Edit Manufacturer" : "Add New Manufacturer"}</DialogTitle>
            <DialogDescription>
              {editingMfg
                ? "Update the manufacturer's details below."
                : "Fill in the details to register a new medicine manufacturer."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mfg-name" className="text-sm font-semibold">
                Manufacturer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mfg-name"
                value={mfgName}
                onChange={(e) => setMfgName(e.target.value)}
                placeholder="e.g. Cipla, Pfizer"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mfg-phone" className="text-sm font-semibold">
                Phone Number
              </Label>
              <Input
                id="mfg-phone"
                value={mfgPhone}
                onChange={(e) => setMfgPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mfg-email" className="text-sm font-semibold">
                Email Address
              </Label>
              <Input
                id="mfg-email"
                type="email"
                value={mfgEmail}
                onChange={(e) => setMfgEmail(e.target.value)}
                placeholder="e.g. contact@cipla.com"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mfg-address" className="text-sm font-semibold">
                Address
              </Label>
              <Input
                id="mfg-address"
                value={mfgAddress}
                onChange={(e) => setMfgAddress(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveManufacturer}
              disabled={isLoading || !mfgName.trim()}
              variant="default"
              className="text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
