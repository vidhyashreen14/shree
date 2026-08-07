import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { medicines as seedMedicines } from '@/lib/mock/data';
import type { Medicine } from '@/lib/types';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/_app/pharmacy/manufacturemaster')({
  component: ManufactureMaster,
});

const DEFAULT_CATEGORIES = [
  'Antibiotics',
  'Cardiac',
  'Diabetes',
  'Analgesic',
  'Respiratory',
  'Dermatology',
];

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
      Cipla: { phone: '9876543210', address: 'Mumbai, Maharashtra', email: 'contact@cipla.com' },
      "Dr. Reddy's": {
        phone: '8765432109',
        address: 'Hyderabad, Telangana',
        email: 'info@drreddys.com',
      },
      GSK: { phone: '8990990000', address: 'London, United Kingdom', email: 'gsk.support@gsk.com' },
      Pfizer: {
        phone: '2127332323',
        address: 'New York, USA',
        email: 'corporate.affairs@pfizer.com',
      },
    };
    return unique
      .map((name) => ({
        name,
        phone: mocks[name]?.phone ?? '9999988888',
        address: mocks[name]?.address ?? 'Industrial Area, Phase 1',
        email: mocks[name]?.email ?? `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMfg, setEditingMfg] = useState<Manufacturer | null>(null);
  const [mfgName, setMfgName] = useState('');
  const [mfgPhone, setMfgPhone] = useState('');
  const [mfgEmail, setMfgEmail] = useState('');
  const [mfgAddress, setMfgAddress] = useState('');

  // Form fields for associated medicine
  const [addMedicine, setAddMedicine] = useState(false);
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState('Analgesic');
  const [medIngredients, setMedIngredients] = useState('');
  const [medPrice, setMedPrice] = useState('10');
  const [medGst, setMedGst] = useState('12');
  const [medMinStock, setMedMinStock] = useState('20');
  const [medStock, setMedStock] = useState('100');
  const [medBatch, setMedBatch] = useState('');
  const [medExpiry, setMedExpiry] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewingMfgMedicines, setViewingMfgMedicines] = useState<string | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  useEffect(() => {
    if (viewingMfgMedicines) {
      setIsPopupLoading(true);
      const timer = setTimeout(() => {
        setIsPopupLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [viewingMfgMedicines]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Check if it's exactly 10 digits
    return digitsOnly.length === 10;
  };

  // Format phone number to only digits
  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10);
    setMfgPhone(limited);
  };

  const handleOpenAdd = () => {
    setEditingMfg(null);
    setMfgName('');
    setMfgPhone('');
    setMfgEmail('');
    setMfgAddress('');

    setAddMedicine(false);
    setMedName('');
    setMedCategory('Analgesic');
    setMedIngredients('');
    setMedPrice('10');
    setMedGst('12');
    setMedMinStock('20');
    setMedStock('100');
    setMedBatch(`B${2400 + seedMedicines.length}`);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setMedExpiry(nextYear.toISOString().split('T')[0] || '');

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
      toast.error('Please enter a manufacturer name');
      return;
    }

    // Validate phone number if provided
    if (phone && !validatePhoneNumber(phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!editingMfg && addMedicine) {
      if (!medName.trim()) {
        toast.error('Please enter a medicine name');
        return;
      }
      if (isNaN(parseFloat(medPrice)) || parseFloat(medPrice) < 0) {
        toast.error('Please enter a valid price');
        return;
      }
      if (isNaN(parseInt(medMinStock)) || parseInt(medMinStock) < 0) {
        toast.error('Please enter a valid low-stock threshold');
        return;
      }
      if (isNaN(parseInt(medStock)) || parseInt(medStock) < 0) {
        toast.error('Please enter a valid stock count');
        return;
      }
      if (!medBatch.trim()) {
        toast.error('Please enter a batch code');
        return;
      }
      if (!medExpiry.trim()) {
        toast.error('Please select an expiry date');
        return;
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingMfg) {
        if (
          name.toLowerCase() !== editingMfg.name.toLowerCase() &&
          manufacturers.some((m) => m.name.toLowerCase() === name.toLowerCase())
        ) {
          toast.error('Manufacturer name already exists');
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
        if (manufacturers.some((m) => m.name.toLowerCase() === name.toLowerCase())) {
          toast.error('Manufacturer name already exists');
          setIsLoading(false);
          return;
        }
        const newMfg: Manufacturer = { name, phone, email, address };
        setManufacturers((prev) => [...prev, newMfg].sort((a, b) => a.name.localeCompare(b.name)));

        if (addMedicine) {
          const newMed: Medicine = {
            id: `m-${5000 + seedMedicines.length + (Date.now() % 1000)}`,
            name: medName.trim(),
            category: medCategory,
            manufacturer: name,
            pricePerUnit: parseFloat(medPrice),
            gst: parseInt(medGst),
            minStock: parseInt(medMinStock),
            stock: parseInt(medStock),
            batch: medBatch.trim(),
            expiry: medExpiry,
            ingredients: medIngredients.trim() || 'Active Pharmaceutical Ingredient, Excipients',
          };
          seedMedicines.push(newMed);
          toast.success(`Added medicine "${medName.trim()}" under "${name}"`);
        }
        toast.success(`Added "${name}" to manufacturers`);
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteManufacturer = (name: string) => {
    const medCount = seedMedicines.filter((m) => m.manufacturer === name).length;

    let confirmMsg = `Are you sure you want to delete manufacturer "${name}"?`;
    if (medCount > 0) {
      confirmMsg = `Warning: This manufacturer has ${medCount} medicine(s) associated with them. Deleting "${name}" will also delete all of their medicines from the catalog. Proceed?`;
    }

    if (window.confirm(confirmMsg)) {
      setIsLoading(true);
      setTimeout(() => {
        setManufacturers((prev) => prev.filter((m) => m.name !== name));

        if (medCount > 0) {
          const initialLength = seedMedicines.length;
          for (let i = seedMedicines.length - 1; i >= 0; i--) {
            if (seedMedicines[i]!.manufacturer === name) {
              seedMedicines.splice(i, 1);
            }
          }
          toast.success(
            `Removed "${name}" and cascade deleted ${initialLength - seedMedicines.length} medicine(s)`
          );
        } else {
          toast.success(`Removed "${name}" from manufacturers`);
        }
        setIsLoading(false);
      }, 500);
    }
  };

  const filteredManufacturers = searchQuery
    ? manufacturers.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery) ||
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
      toast.info('No manufacturers to export');
      return;
    }
    const csv =
      'Manufacturer Name,Phone No,Email,Address,Medicine Count\n' +
      manufacturers
        .map(
          (m) => `"${m.name}","${m.phone}","${m.email}","${m.address}",${getMedicineCount(m.name)}`
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manufacturers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported manufacturers list');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manufacture Master"
        description="Manage all medicine manufacturers in the system."
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="default"
                onClick={exportToCSV}
                disabled={isLoading}
                className="text-white w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
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
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Manufacturers</p>
                  <p className="text-2xl font-bold text-primary">{manufacturers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Medicines</p>
                  <p className="text-2xl font-bold text-primary">{seedMedicines.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Factory className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Avg Medicines/Manufacturer
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {manufacturers.length > 0
                      ? (seedMedicines.length / manufacturers.length).toFixed(1)
                      : '0'}
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
                title={searchQuery ? 'No manufacturers match' : 'No manufacturers'}
                description={
                  searchQuery
                    ? `No manufacturers found matching "${searchQuery}"`
                    : 'Add your first manufacturer above.'
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
                        <td className="px-6 py-4 text-foreground/80 font-mono">
                          {mfg.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-foreground/80">{mfg.email || '—'}</td>
                        <td
                          className="px-6 py-4 text-foreground/80 max-w-[200px] truncate"
                          title={mfg.address}
                        >
                          {mfg.address || '—'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingMfgMedicines(mfg.name)}
                            className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground transition-colors min-w-[28px] h-7 px-2 rounded-full text-xs font-bold mx-auto shadow-sm"
                            title={`Click to view ${medCount} medicine(s)`}
                          >
                            {medCount}
                          </button>
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
                              disabled={isLoading}
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
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                Clear Search
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                setItemsPerPage(10);
                setSearchQuery('');
                toast.info('Reset to default view');
              }}
              className="text-white"
            >
              Reset View
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog modal for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={cn(
            'sm:max-w-[480px] transition-all duration-300',
            !editingMfg && addMedicine && 'sm:max-w-[800px]'
          )}
        >
          <DialogHeader>
            <DialogTitle>{editingMfg ? 'Edit Manufacturer' : 'Add New Manufacturer'}</DialogTitle>
            <DialogDescription>
              {editingMfg
                ? "Update the manufacturer's details below."
                : 'Fill in the details to register a new medicine manufacturer.'}
            </DialogDescription>
          </DialogHeader>

          <div className={cn('grid gap-4 py-4', !editingMfg && addMedicine && 'grid-cols-2')}>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Manufacturer Details
              </h4>

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
                  Phone Number{' '}
                  <span className="text-muted-foreground text-xs">(10 digits only)</span>
                </Label>
                <Input
                  id="mfg-phone"
                  value={mfgPhone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  disabled={isLoading}
                  maxLength={10}
                  className="font-mono"
                />
                {mfgPhone && mfgPhone.length < 10 && (
                  <p className="text-xs text-destructive">Phone number must be exactly 10 digits</p>
                )}
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

              {!editingMfg && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <input
                    id="add-medicine-checkbox"
                    type="checkbox"
                    checked={addMedicine}
                    onChange={(e) => setAddMedicine(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="add-medicine-checkbox"
                    className="text-sm font-semibold select-none cursor-pointer"
                  >
                    Add a medicine for this manufacturer
                  </Label>
                </div>
              )}
            </div>

            {!editingMfg && addMedicine && (
              <div className="space-y-4 border-l border-border pl-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Associated Medicine Details
                </h4>

                <div className="grid gap-2">
                  <Label htmlFor="med-name" className="text-sm font-semibold">
                    Medicine Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="med-name"
                    value={medName}
                    onChange={(e) => setMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="med-category" className="text-sm font-semibold">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="med-category"
                      value={medCategory}
                      onChange={(e) => setMedCategory(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-ingredients" className="text-sm font-semibold">
                      Ingredients
                    </Label>
                    <Input
                      id="med-ingredients"
                      value={medIngredients}
                      onChange={(e) => setMedIngredients(e.target.value)}
                      placeholder="e.g. Active Ingredient"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-price" className="text-sm font-semibold">
                      Price (INR) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-price"
                      type="number"
                      step="0.01"
                      value={medPrice}
                      onChange={(e) => setMedPrice(e.target.value)}
                      placeholder="e.g. 15.50"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-gst" className="text-sm font-semibold">
                      GST Rate % <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="med-gst"
                      value={medGst}
                      onChange={(e) => setMedGst(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-minstock" className="text-sm font-semibold">
                      Min Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-minstock"
                      type="number"
                      value={medMinStock}
                      onChange={(e) => setMedMinStock(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-stock" className="text-sm font-semibold">
                      Initial Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-stock"
                      type="number"
                      value={medStock}
                      onChange={(e) => setMedStock(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-batch" className="text-sm font-semibold">
                      Batch Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-batch"
                      value={medBatch}
                      onChange={(e) => setMedBatch(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="med-expiry" className="text-sm font-semibold">
                      Expiry Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="med-expiry"
                      type="date"
                      value={medExpiry}
                      onChange={(e) => setMedExpiry(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveManufacturer}
              disabled={
                isLoading || !mfgName.trim() || (mfgPhone.length > 0 && mfgPhone.length !== 10)
              }
              variant="default"
              className="text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog modal for viewing medicines list */}
      <Dialog
        open={viewingMfgMedicines !== null}
        onOpenChange={(open) => !open && setViewingMfgMedicines(null)}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Medicines by {viewingMfgMedicines}</DialogTitle>
            <DialogDescription>
              All medicines in inventory registered under this manufacturer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {viewingMfgMedicines && (
              <div className="overflow-x-auto rounded-lg border border-border max-h-[45vh] overflow-y-auto">
                {seedMedicines.filter((m) => m.manufacturer === viewingMfgMedicines).length ===
                0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No medicines found for this manufacturer.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                    <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5 w-1/2">Medicine Name</th>
                        <th className="px-4 py-2.5 w-1/2">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isPopupLoading
                        ? Array.from({ length: 7 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="animate-pulse">
                              <td className="px-4 py-3.5">
                                <Skeleton className="h-5 w-48 bg-muted-foreground/15 rounded-md" />
                              </td>
                              <td className="px-4 py-3.5">
                                <Skeleton className="h-5 w-28 bg-muted-foreground/15 rounded-md" />
                              </td>
                            </tr>
                          ))
                        : seedMedicines
                            .filter((m) => m.manufacturer === viewingMfgMedicines)
                            .map((med) => (
                              <tr key={med.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-3 font-semibold text-foreground">
                                  {med.name}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="inline-block bg-muted px-2 py-0.5 rounded text-xs font-medium border border-border">
                                    {med.category}
                                  </span>
                                </td>
                              </tr>
                            ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setViewingMfgMedicines(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManufactureMaster;
