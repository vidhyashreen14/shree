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
  FileText,
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

interface SimulatedOrder {
  id: string;
  itemsCount: number;
  totalAmount: number;
  status: 'draft' | 'placed' | 'shipped' | 'received';
  date: string;
}

const INITIAL_STOCKISTS: Stockist[] = [
  {
    id: 'st-1',
    name: 'MedPlus Distributors',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43221',
    email: 'rajesh@medplus.com',
    address: 'Industrial Area Phase 2, Hyderabad, Telangana',
    gstin: '36AAAAM8976C1Z3',
    status: 'Active',
  },
  {
    id: 'st-2',
    name: 'Apollo Wholesale',
    contactPerson: 'Amit Patel',
    phone: '+91 87654 32110',
    email: 'wholesale@apollo.com',
    address: 'Greams Road, Chennai, Tamil Nadu',
    gstin: '33AAACA1234D1Z2',
    status: 'Active',
  },
  {
    id: 'st-3',
    name: 'PharmEasy Bulk',
    contactPerson: 'Shalini Gupta',
    phone: '+91 76543 21098',
    email: 'bulk@pharmeasy.in',
    address: 'LBS Marg, Kurla West, Mumbai, Maharashtra',
    gstin: '27AAACP5678B2Z4',
    status: 'Active',
  },
  {
    id: 'st-4',
    name: 'Wellness Stockists',
    contactPerson: 'Vikram Singh',
    phone: '+91 99887 76655',
    email: 'orders@wellness.co.in',
    address: 'Okhla Phase 3, Delhi NCR',
    gstin: '07AAACW9988A1Z5',
    status: 'Active',
  },
  {
    id: 'st-5',
    name: 'HealthPlus Stockists',
    contactPerson: 'Neha Sharma',
    phone: '+91 91234 56789',
    email: 'neha@healthplus.com',
    address: 'Whitefield, Bengaluru, Karnataka',
    gstin: '29AAACH4321E3Z1',
    status: 'Active',
  },
  {
    id: 'st-6',
    name: 'Regional Pharma Stockists',
    contactPerson: 'K. R. Rao',
    phone: '+91 94400 12345',
    email: 'regional@pharma.org',
    address: 'Kadavanthra, Kochi, Kerala',
    gstin: '32AAACR2468F1Z9',
    status: 'Inactive',
  },
];

function StockistMaster() {
  const [stockists, setStockists] = useState<Stockist[]>(INITIAL_STOCKISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isLoading, setIsLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Associated orders view states
  const [viewingStockistOrders, setViewingStockistOrders] = useState<Stockist | null>(null);
  const [simulatedOrders, setSimulatedOrders] = useState<SimulatedOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  useEffect(() => {
    if (viewingStockistOrders) {
      setIsOrdersLoading(true);
      const timer = setTimeout(() => {
        // Generate simulated orders for demonstration
        const orders: SimulatedOrder[] = [
          {
            id: `PO-${1000 + Math.floor(Math.random() * 9000)}`,
            itemsCount: 8 + Math.floor(Math.random() * 15),
            totalAmount: 15000 + Math.floor(Math.random() * 35000),
            status: 'received',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
          },
          {
            id: `PO-${1000 + Math.floor(Math.random() * 9000)}`,
            itemsCount: 5 + Math.floor(Math.random() * 10),
            totalAmount: 8000 + Math.floor(Math.random() * 12000),
            status: 'shipped',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!,
          },
          {
            id: `PO-${1000 + Math.floor(Math.random() * 9000)}`,
            itemsCount: 15 + Math.floor(Math.random() * 20),
            totalAmount: 45000 + Math.floor(Math.random() * 60000),
            status: 'placed',
            date: new Date().toISOString().split('T')[0]!,
          },
        ];
        setSimulatedOrders(orders);
        setIsOrdersLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [viewingStockistOrders]);

  const handleOpenAdd = () => {
    setEditingStockist(null);
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormGstin('');
    setFormStatus('Active');
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
    setIsFormOpen(true);
  };

  // Handle phone input — digits only, max 10
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormPhone(digitsOnly);
  };

  const handleSaveStockist = () => {
    const name = formName.trim();
    const contactPerson = formContactPerson.trim();
    const phone = formPhone.trim();
    const email = formEmail.trim();
    const address = formAddress.trim();
    const gstin = formGstin.trim().toUpperCase();

    if (!name) {
      toast.error('Please enter a stockist name');
      return;
    }
    if (!contactPerson) {
      toast.error('Please enter a contact person');
      return;
    }
    if (!phone) {
      toast.error('Please enter a phone number');
      return;
    }
    if (phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
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
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Suppliers</p>
                  <p className="text-2xl font-bold text-primary">{stockists.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Stockist Directory</h4>
            <span className="text-xs text-muted-foreground">
              Showing {totalItems > 0 ? startIndex + 1 : 0}–{endIndex} of {totalItems}
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

                    <th className="px-6 py-3 text-center">Orders</th>
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

                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingStockistOrders(st)}
                          className="inline-flex items-center justify-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary transition-colors px-2 py-1 rounded text-xs font-semibold mx-auto"
                          title="View recent orders"
                        >
                          <FileText className="h-3 w-3" />
                          <span>View</span>
                        </button>
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
          <p className="text-xs text-muted-foreground">{stockists.length} supplier(s) registered</p>
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
            <div className="grid gap-2">
              <Label htmlFor="st-name" className="text-sm font-semibold">
                Stockist Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. MedPlus Distributors"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="st-contact" className="text-sm font-semibold">
                Contact Person <span className="text-destructive">*</span>
              </Label>
              <Input
                id="st-contact"
                value={formContactPerson}
                onChange={(e) => setFormContactPerson(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="st-phone" className="text-sm font-semibold">
                  Phone Number <span className="text-destructive">*</span>{' '}
                  <span className="text-muted-foreground text-xs">(10 digits only)</span>
                </Label>
                <Input
                  id="st-phone"
                  value={formPhone}
                  onChange={handlePhoneChange}
                  placeholder="e.g. 9876543210"
                  disabled={isLoading}
                  maxLength={10}
                  className="font-mono"
                />
                {formPhone.length > 0 && formPhone.length < 10 && (
                  <p className="text-xs text-destructive">Phone number must be exactly 10 digits</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="st-email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <Input
                  id="st-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="e.g. contact@domain.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="st-gstin" className="text-sm font-semibold">
                GSTIN (Optional)
              </Label>
              <Input
                id="st-gstin"
                value={formGstin}
                onChange={(e) => setFormGstin(e.target.value)}
                placeholder="e.g. 36AAAAM8976C1Z3"
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="st-address" className="text-sm font-semibold">
                Address
              </Label>
              <Input
                id="st-address"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="e.g. Industrial Area Phase 2, Hyderabad"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveStockist}
              disabled={
                isLoading ||
                !formName.trim() ||
                !formContactPerson.trim() ||
                formPhone.length !== 10
              }
              variant="default"
              className="text-white"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog modal for viewing associated orders */}
      <Dialog
        open={viewingStockistOrders !== null}
        onOpenChange={(open) => !open && setViewingStockistOrders(null)}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Orders with {viewingStockistOrders?.name}</DialogTitle>
            <DialogDescription>Recent purchase orders issued to this stockist.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {viewingStockistOrders && (
              <div className="overflow-x-auto rounded-lg border border-border max-h-[40vh] overflow-y-auto">
                {isOrdersLoading ? (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2 animate-pulse">
                        <Skeleton className="h-5 w-1/3 bg-muted-foreground/15 rounded" />
                        <Skeleton className="h-4 w-full bg-muted-foreground/15 rounded" />
                      </div>
                    ))}
                  </div>
                ) : simulatedOrders.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No recent orders found for this supplier.
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm text-muted-foreground">
                    <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5">Order ID</th>
                        <th className="px-4 py-2.5 text-center">Items</th>
                        <th className="px-4 py-2.5 text-right">Total (INR)</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {simulatedOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <div className="flex flex-col">
                              <span>{ord.id}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {ord.date}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-foreground/80">
                            {ord.itemsCount}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-foreground">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={cn(
                                'inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border uppercase',
                                ord.status === 'received'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : ord.status === 'shipped'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : ord.status === 'placed'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-slate-50 text-slate-700 border-slate-200'
                              )}
                            >
                              {ord.status}
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
            <Button onClick={() => setViewingStockistOrders(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StockistMaster;
