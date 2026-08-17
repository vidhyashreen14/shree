import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Pencil,
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Truck,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Trash,
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

export const Route = createFileRoute('/_app/pharmacy/stockist')({
  component: StockistMaster,
});

interface Stockist {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  status: 'Active' | 'Inactive';
}

const STOCKISTS_STORAGE_KEY = 'hms.pharmacy.stockists.v1';

const loadStoredStockists = (): Stockist[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STOCKISTS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

function StockistMaster() {
  const [stockists, setStockists] = useState<Stockist[]>(() => loadStoredStockists());

  useEffect(() => {
    try {
      window.localStorage.setItem(STOCKISTS_STORAGE_KEY, JSON.stringify(stockists));
    } catch (e) {
      console.error('Failed to save stockists to localStorage', e);
    }
  }, [stockists]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Dialog form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStockist, setEditingStockist] = useState<Stockist | null>(null);
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');



  const [stockistErrors, setStockistErrors] = useState<{
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    gstin?: string;
  }>({});

  const handleOpenAdd = () => {
    setEditingStockist(null);
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormGstin('');
    setFormStatus('Active');
    setStockistErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (stockist: Stockist) => {
    setEditingStockist(stockist);
    setFormName(stockist.name);
    setFormContactPerson(stockist.contactPerson);
    // Strip non-digits so existing stored phone renders cleanly
    setFormPhone(stockist.phone.replace(/\D/g, '').slice(0, 10));
    setFormEmail(stockist.email);
    setFormAddress(stockist.address);
    setFormGstin(stockist.gstin);
    setFormStatus(stockist.status);
    setStockistErrors({});
    setIsFormOpen(true);
  };

  // Handle phone input — digits only, max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormPhone(digitsOnly);
    setStockistErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const validateStockistForm = (): boolean => {
    const errs: { name?: string; contactPerson?: string; phone?: string; email?: string; address?: string; gstin?: string } = {};
    const name = formName.trim();
    const contactPerson = formContactPerson.trim();
    const phone = formPhone.trim();
    const email = formEmail.trim();
    const address = formAddress.trim();
    const gstin = formGstin.trim();

    if (!name) {
      errs.name = 'Stockist name is required.';
    }
    if (!contactPerson) {
      errs.contactPerson = 'Contact person is required.';
    }
    if (!phone) {
      errs.phone = 'Phone number is required.';
    } else if (phone.length !== 10) {
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
    if (!gstin) {
      errs.gstin = 'GSTIN / License number is required.';
    }

    setStockistErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStockist = () => {
    const name = formName.trim();
    const contactPerson = formContactPerson.trim();
    const phone = formPhone.trim();
    const email = formEmail.trim();
    const address = formAddress.trim();
    const gstin = formGstin.trim().toUpperCase();

    if (!validateStockistForm()) {
      toast.error('Please complete all required stockist fields correctly.', { duration: 4000 });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingStockist) {
        // Edit mode
        setStockists((prev) =>
          prev
            .map((s) =>
              s.id === editingStockist.id
                ? { ...s, name, contactPerson, phone, email, address, gstin, status: formStatus }
                : s
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        toast.success(`Updated stockist "${name}"`);
      } else {
        // Add mode
        const newStockist: Stockist = {
          id: `st-${Date.now()}`,
          name,
          contactPerson,
          phone,
          email,
          address,
          gstin,
          status: formStatus,
        };
        setStockists((prev) => [...prev, newStockist].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success(`Added "${name}" as new stockist`);
      }
      setIsFormOpen(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteStockist = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove stockist "${name}"?`)) {
      setIsLoading(true);
      setTimeout(() => {
        setStockists((prev) => prev.filter((s) => s.id !== id));
        toast.success(`Removed stockist "${name}"`);
        setIsLoading(false);
      }, 500);
    }
  };

  const filteredStockists = stockists.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.gstin.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const totalItems = filteredStockists.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredStockists.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (stockists.length === 0) {
      toast.info('No stockists to export');
      return;
    }
    const csv =
      'Stockist ID,Stockist Name,Contact Person,Phone No,Email,Address,GSTIN,Status\n' +
      stockists
        .map(
          (s) =>
            `"${s.id}","${s.name}","${s.contactPerson}","${s.phone}","${s.email}","${s.address}","${s.gstin}","${s.status}"`
        )
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockists_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported stockists list to CSV');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stockist"
        description="Manage distributors and suppliers of pharmaceutical products."
      />

      <div className="surface-elevated rounded-2xl overflow-hidden border border-border">
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search stockists..."
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
                <Plus className="mr-2 h-4 w-4" /> Add Stockist
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Stockist Directory</h4>
            <span className="text-xs text-muted-foreground font-medium">
              {stockists.length} supplier(s) registered
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            {currentItems.length === 0 ? (
              <EmptyState
                icon={Truck}
                title={
                  searchQuery || statusFilter !== 'All' ? 'No suppliers match' : 'No suppliers'
                }
                description={
                  searchQuery || statusFilter !== 'All'
                    ? 'Try adjusting your search query or status filter.'
                    : 'Add your first pharmacy stockist above.'
                }
              />
            ) : (
              <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Stockist</th>
                    <th className="px-6 py-3">Contact Person</th>
                    <th className="px-6 py-3">Phone / Email</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">GSTIN</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentItems.map((st) => (
                    <tr key={st.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-foreground">{st.name}</td>
                      <td className="px-6 py-4 font-medium text-foreground/80">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{st.contactPerson}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-foreground/80">
                          <span>{st.phone}</span>
                          <span className="text-muted-foreground">{st.email}</span>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-foreground/80 max-w-[200px] truncate"
                        title={st.address}
                      >
                        {st.address || '—'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground/75">
                        {st.gstin || 'N/A'}
                      </td>


                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleOpenEdit(st)}
                            title="Edit supplier"
                            disabled={isLoading}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteStockist(st.id, st.name)}
                            title="Delete supplier"
                            disabled={isLoading}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end">
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

      {/* Dialog modal for Add/Edit Stockist */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingStockist ? 'Edit Stockist Details' : 'Register New Stockist'}
            </DialogTitle>
            <DialogDescription>
              Provide the details of the distributor or supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="st-name" className="text-sm font-semibold">
                Stockist Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-name"
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value);
                  setStockistErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. MedPlus Distributors"
                disabled={isLoading}
              />
              {stockistErrors.name && (
                <p className="text-xs text-destructive mt-0.5">{stockistErrors.name}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="st-contact" className="text-sm font-semibold">
                Contact Person <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-contact"
                value={formContactPerson}
                onChange={(e) => {
                  setFormContactPerson(e.target.value);
                  setStockistErrors((prev) => ({ ...prev, contactPerson: undefined }));
                }}
                placeholder="e.g. Rajesh Kumar"
                disabled={isLoading}
              />
              {stockistErrors.contactPerson && (
                <p className="text-xs text-destructive mt-0.5">{stockistErrors.contactPerson}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="st-phone" className="text-sm font-semibold">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="st-phone"
                  value={formPhone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210 (10 digits)"
                  disabled={isLoading}
                  maxLength={10}
                  className="font-mono"
                />
                {stockistErrors.phone ? (
                  <p className="text-xs text-destructive mt-0.5">{stockistErrors.phone}</p>
                ) : (
                  formPhone.length > 0 && formPhone.length < 10 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Phone number must be 10 digits</p>
                  )
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="st-email" className="text-sm font-semibold">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="st-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    setStockistErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="e.g. contact@domain.com"
                  disabled={isLoading}
                />
                {stockistErrors.email && (
                  <p className="text-xs text-destructive mt-0.5">{stockistErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="st-gstin" className="text-sm font-semibold">
                GSTIN / License No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-gstin"
                value={formGstin}
                onChange={(e) => {
                  setFormGstin(e.target.value);
                  setStockistErrors((prev) => ({ ...prev, gstin: undefined }));
                }}
                placeholder="e.g. 36AAAAM8976C1Z3"
                disabled={isLoading}
              />
              {stockistErrors.gstin && (
                <p className="text-xs text-destructive mt-0.5">{stockistErrors.gstin}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="st-address" className="text-sm font-semibold">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-address"
                value={formAddress}
                onChange={(e) => {
                  setFormAddress(e.target.value);
                  setStockistErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="e.g. Industrial Area Phase 2, Hyderabad"
                disabled={isLoading}
              />
              {stockistErrors.address && (
                <p className="text-xs text-destructive mt-0.5">{stockistErrors.address}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveStockist}
              disabled={isLoading}
              variant="default"
              className="text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default StockistMaster;
