import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Medicine } from '@/lib/types';
import { usePharmacyStore } from '@/lib/store/pharmacy';
import {
  Plus,
  Pencil,
  Factory,
  PackageMinus,
  Trash,
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

const MANUFACTURERS_STORAGE_KEY = 'hms.pharmacy.manufacturers.v1';
const MEDICINES_STORAGE_KEY = 'hms.pharmacy.medicines.v1';

const loadStoredManufacturers = (): Manufacturer[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MANUFACTURERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const loadStoredMedicines = (): Medicine[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(MEDICINES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

function ManufactureMaster() {
  const medicinesList = usePharmacyStore((s) => s.inventory);
  const setMedicinesList = usePharmacyStore((s) => s.setInventory);
  const addInventoryItem = usePharmacyStore((s) => s.addInventoryItem);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() => loadStoredManufacturers());

  useEffect(() => {
    try {
      window.localStorage.setItem(MANUFACTURERS_STORAGE_KEY, JSON.stringify(manufacturers));
    } catch (e) {
      console.error('Failed to save manufacturers to localStorage', e);
    }
  }, [manufacturers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MEDICINES_STORAGE_KEY, JSON.stringify(medicinesList));
    } catch (e) {
      console.error('Failed to save medicines to localStorage', e);
    }
  }, [medicinesList]);

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewingMfgMedicines, setViewingMfgMedicines] = useState<string | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  // States for adding medicine inside viewing modal
  const [isAddingMedInModal, setIsAddingMedInModal] = useState(false);
  const [popupMedicines, setPopupMedicines] = useState<Array<{ name: string; category: string }>>([
    { name: '', category: 'Analgesic' },
  ]);

  useEffect(() => {
    if (viewingMfgMedicines) {
      setIsPopupLoading(true);
      const timer = setTimeout(() => {
        setIsPopupLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setIsAddingMedInModal(false);
      setPopupMedicines([{ name: '', category: 'Analgesic' }]);
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

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  }>({});

  const handleOpenAdd = () => {
    setEditingMfg(null);
    setMfgName('');
    setMfgPhone('');
    setMfgEmail('');
    setMfgAddress('');
    setFormErrors({});

    setAddMedicine(false);
    setMedName('');
    setMedCategory('Analgesic');

    setIsDialogOpen(true);
  };

  const handleOpenEdit = (mfg: Manufacturer) => {
    setEditingMfg(mfg);
    setMfgName(mfg.name);
    setMfgPhone(mfg.phone);
    setMfgEmail(mfg.email);
    setMfgAddress(mfg.address);
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const validateManufacturerForm = (): boolean => {
    const errs: { name?: string; phone?: string; email?: string; address?: string } = {};
    const name = mfgName.trim();
    const phone = mfgPhone.trim();
    const email = mfgEmail.trim();
    const address = mfgAddress.trim();

    if (!name) {
      errs.name = 'Manufacturer name is required.';
    }

    if (!phone) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\d{10}$/.test(phone)) {
      errs.phone = 'Enter a valid 10-digit phone number.';
    }

    if (!email) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address.';
    }

    if (!address) {
      errs.address = 'Address is required.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveManufacturer = () => {
    const name = mfgName.trim();
    const phone = mfgPhone.trim();
    const email = mfgEmail.trim();
    const address = mfgAddress.trim();

    if (!validateManufacturerForm()) {
      toast.error('Please complete all required manufacturer fields correctly.', { duration: 4000 });
      return;
    }

    if (!editingMfg && addMedicine) {
      if (!medName.trim()) {
        toast.error('Please enter a medicine name', { duration: 4000 });
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

        if (addMedicine && medName.trim()) {
          const existingNames = new Set(
            medicinesList
              .filter((m) => m.manufacturer.toLowerCase() === name.toLowerCase())
              .map((m) => m.name.toLowerCase().trim())
          );

          if (!existingNames.has(medName.trim().toLowerCase())) {
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);
            const newMed: Medicine = {
              id: `m-${5000 + medicinesList.length + (Date.now() % 1000)}`,
              name: medName.trim(),
              category: medCategory,
              manufacturer: name,
              pricePerUnit: 10,
              gst: 12,
              minStock: 20,
              stock: 100,
              batch: `B${2400 + medicinesList.length}`,
              expiry: nextYear.toISOString().split('T')[0] || '',
              ingredients: 'Active Pharmaceutical Ingredient, Excipients',
            };

            addInventoryItem(newMed);
            toast.success(`Added medicine "${medName.trim()}" under "${name}"`);
          }
        }
        toast.success(`Added "${name}" to manufacturers`);
      }
      setIsDialogOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleAddMedicineFromModal = () => {
    const validMeds = popupMedicines.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0 || !viewingMfgMedicines) {
      toast.error('Please enter at least one medicine name');
      return;
    }

    const existingNames = new Set(
      medicinesList
        .filter((m) => m.manufacturer === viewingMfgMedicines)
        .map((m) => m.name.toLowerCase().trim())
    );

    const newMedsToCreate = validMeds.filter(
      (m) => !existingNames.has(m.name.trim().toLowerCase())
    );

    if (newMedsToCreate.length === 0) {
      toast.error('Medicine with this name already exists under this manufacturer');
      return;
    }

    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const createdMeds: Medicine[] = newMedsToCreate.map((m, idx) => ({
      id: `m-${5000 + medicinesList.length + idx + (Date.now() % 1000)}`,
      name: m.name.trim(),
      category: m.category,
      manufacturer: viewingMfgMedicines,
      pricePerUnit: 10,
      gst: 12,
      minStock: 20,
      stock: 100,
      batch: `B${2400 + medicinesList.length + idx}`,
      expiry: nextYear.toISOString().split('T')[0] || '',
      ingredients: 'Active Pharmaceutical Ingredient, Excipients',
    }));

    createdMeds.forEach((m) => addInventoryItem(m));
    toast.success(`Added ${createdMeds.length} medicine(s) under "${viewingMfgMedicines}"`);
    setPopupMedicines([{ name: '', category: 'Analgesic' }]);
    setIsAddingMedInModal(false);
  };

  const handleDeleteManufacturer = (name: string) => {
    const medCount = medicinesList.filter((m) => m.manufacturer === name).length;

    let confirmMsg = `Are you sure you want to delete manufacturer "${name}"?`;
    if (medCount > 0) {
      confirmMsg = `Warning: This manufacturer has ${medCount} medicine(s) associated with them. Deleting "${name}" will also delete all of their medicines from the catalog. Proceed?`;
    }

    if (window.confirm(confirmMsg)) {
      setIsLoading(true);
      setTimeout(() => {
        setManufacturers((prev) => prev.filter((m) => m.name !== name));

        if (medCount > 0) {
          setMedicinesList(medicinesList.filter((m) => m.manufacturer !== name));
          toast.success(
            `Removed "${name}" and cascade deleted ${medCount} medicine(s)`
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
    const mList = medicinesList.filter((m) => m.manufacturer === manufacturer);
    const uniqueNames = new Set(mList.map((m) => m.name.toLowerCase().trim()));
    return uniqueNames.size;
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
                  <p className="text-2xl font-bold text-primary">{medicinesList.length}</p>
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
                      ? (medicinesList.length / manufacturers.length).toFixed(1)
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
                              <Trash className="h-3.5 w-3.5" />
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
            {manufacturers.length} manufacturer(s) · {medicinesList.length} medicine(s)
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMfg ? 'Edit Manufacturer' : 'Add New Manufacturer'}</DialogTitle>
            <DialogDescription>
              {editingMfg
                ? "Update the manufacturer's details below."
                : 'Fill in the details to register a new medicine manufacturer.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Manufacturer Details
            </h4>

            <div className="grid gap-1.5">
              <Label htmlFor="mfg-name" className="text-sm font-semibold">
                Manufacturer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mfg-name"
                value={mfgName}
                onChange={(e) => {
                  setMfgName(e.target.value);
                  setFormErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Cipla, Pfizer"
                disabled={isLoading}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive mt-0.5">{formErrors.name}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="mfg-phone" className="text-sm font-semibold">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mfg-phone"
                value={mfgPhone}
                onChange={(e) => {
                  handlePhoneChange(e);
                  setFormErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="e.g. 9876543210 (10 digits)"
                disabled={isLoading}
                maxLength={10}
                className="font-mono"
              />
              {formErrors.phone ? (
                <p className="text-xs text-destructive mt-0.5">{formErrors.phone}</p>
              ) : (
                mfgPhone && mfgPhone.length < 10 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Phone number must be exactly 10 digits</p>
                )
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="mfg-email" className="text-sm font-semibold">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mfg-email"
                type="email"
                value={mfgEmail}
                onChange={(e) => {
                  setMfgEmail(e.target.value);
                  setFormErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="e.g. contact@cipla.com"
                disabled={isLoading}
              />
              {formErrors.email && (
                <p className="text-xs text-destructive mt-0.5">{formErrors.email}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="mfg-address" className="text-sm font-semibold">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mfg-address"
                value={mfgAddress}
                onChange={(e) => {
                  setMfgAddress(e.target.value);
                  setFormErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="e.g. Mumbai, Maharashtra"
                disabled={isLoading}
              />
              {formErrors.address && (
                <p className="text-xs text-destructive mt-0.5">{formErrors.address}</p>
              )}
            </div>

            {!editingMfg && (
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <input
                  id="add-medicine-checkbox"
                  type="checkbox"
                  checked={addMedicine}
                  onChange={(e) => setAddMedicine(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
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

            {!editingMfg && addMedicine && (
              <div className="space-y-4 pt-3 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Associated Medicine Details
                </h4>

                <div className="grid gap-1.5">
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

                <div className="grid gap-1.5">
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
        onOpenChange={(open) => {
          if (!open) {
            setViewingMfgMedicines(null);
            setIsAddingMedInModal(false);
            setPopupMedicines([{ name: '', category: 'Analgesic' }]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Medicines by {viewingMfgMedicines}</DialogTitle>
            <DialogDescription>
              All medicines in inventory registered under this manufacturer.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {isAddingMedInModal && (
              <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                    Add Medicines for {viewingMfgMedicines}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setIsAddingMedInModal(false);
                      setPopupMedicines([{ name: '', category: 'Analgesic' }]);
                    }}
                  >
                    Back to List
                  </Button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {popupMedicines.map((med, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-border bg-background relative space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Medicine #{index + 1}
                        </span>
                        {popupMedicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setPopupMedicines((prev) => prev.filter((_, idx) => idx !== index))
                            }
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-1.5">
                        <Label
                          htmlFor={`popup-med-name-${index}`}
                          className="text-xs font-semibold"
                        >
                          Medicine Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`popup-med-name-${index}`}
                          value={med.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPopupMedicines((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, name: val } : item))
                            );
                          }}
                          placeholder="e.g. Paracetamol 650mg"
                          autoFocus={index === 0}
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label htmlFor={`popup-med-cat-${index}`} className="text-xs font-semibold">
                          Category <span className="text-destructive">*</span>
                        </Label>
                        <select
                          id={`popup-med-cat-${index}`}
                          value={med.category}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPopupMedicines((prev) =>
                              prev.map((item, idx) => (idx === index ? { ...item, category: val } : item))
                            );
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  onClick={() =>
                    setPopupMedicines((prev) => [
                      ...prev,
                      { name: '', category: 'Analgesic' },
                    ])
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Another Medicine Row
                </Button>
              </div>
            )}

            {viewingMfgMedicines && (
              <div className="overflow-x-auto rounded-lg border border-border max-h-[45vh] overflow-y-auto">
                {medicinesList.filter((m) => m.manufacturer === viewingMfgMedicines).length ===
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
                        : medicinesList
                            .filter((m) => m.manufacturer === viewingMfgMedicines)
                            .filter(
                              (med, index, self) =>
                                index ===
                                self.findIndex(
                                  (t) => t.name.toLowerCase().trim() === med.name.toLowerCase().trim()
                                )
                            )
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
            {isAddingMedInModal ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingMedInModal(false);
                    setPopupMedicines([{ name: '', category: 'Analgesic' }]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMedicineFromModal}
                  disabled={popupMedicines.filter((m) => m.name.trim()).length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Save Medicine(s)
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    setIsAddingMedInModal(true);
                    setPopupMedicines([{ name: '', category: 'Analgesic' }]);
                  }}
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Add Medicine
                </Button>
                <Button variant="outline" onClick={() => setViewingMfgMedicines(null)}>
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManufactureMaster;
