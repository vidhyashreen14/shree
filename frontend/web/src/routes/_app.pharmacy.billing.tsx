import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { medicines, patients, doctors } from '@/lib/mock/data';
import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export const Route = createFileRoute('/_app/pharmacy/billing')({
  component: PharmacyBilling,
});

interface BillingItem {
  id: string;
  name: string;
  batch: string;
  price: number;
  qty: number;
  discountPercent: number;
  gst: number;
  expiry?: string;
}

function PharmacyBilling() {
  const [billDate, setBillDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referredDoctor, setReferredDoctor] = useState('');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+61', country: 'Australia' },
    { code: '+81', country: 'Japan' },
    { code: '+86', country: 'China' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+39', country: 'Italy' },
    { code: '+55', country: 'Brazil' },
    { code: '+7', country: 'Russia' },
    { code: '+82', country: 'South Korea' },
    { code: '+31', country: 'Netherlands' },
    { code: '+46', country: 'Sweden' },
    { code: '+41', country: 'Switzerland' },
    { code: '+34', country: 'Spain' },
    { code: '+52', country: 'Mexico' },
    { code: '+65', country: 'Singapore' },
    { code: '+971', country: 'UAE' },
    { code: '+966', country: 'Saudi Arabia' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredPatients =
    patientName.trim() === ''
      ? []
      : patients.filter(
          (p) =>
            p.name.toLowerCase().includes(patientName.toLowerCase()) ||
            p.id.toLowerCase().includes(patientName.toLowerCase()) ||
            p.phone.toLowerCase().includes(patientName.toLowerCase())
        );

  const selectPatient = (p: (typeof patients)[0]) => {
    setPatientName(p.name);
    setPatientId(p.id);
    // Extract country code and phone number if available
    const phoneMatch = p.phone.match(/^(\+\d+)(\d+)$/);
    if (phoneMatch) {
      setCountryCode(phoneMatch[1] || '+91');
      setPhone(phoneMatch[2] || '');
    } else {
      setCountryCode('+91');
      setPhone(p.phone);
    }
    setEmail(p.email || '');
    const doc = doctors.find((d) => d.id === p.assignedDoctorId);
    setReferredDoctor(doc ? doc.name : 'Not Assigned');
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  // Validation functions
  const validatePatientName = (value: string) => {
    const nameRegex = /^[A-Za-z\s\.\-']*$/;
    return nameRegex.test(value);
  };

  const validatePhone = (value: string) => {
    // Allow only digits and max 15 digits (international)
    const phoneRegex = /^\d{0,15}$/;
    return phoneRegex.test(value);
  };

  const validateEmail = (value: string) => {
    // Allow empty or valid email format
    if (value === '') return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleNameChange = (val: string) => {
    if (validatePatientName(val) || val === '') {
      setPatientName(val);
      setPatientId('');
      setShowSuggestions(true);
      setActiveIndex(-1);
    } else {
      toast.error('Patient name can only contain letters, spaces, dots, hyphens, and apostrophes.');
    }
  };

  const handlePhoneChange = (val: string) => {
    if (validatePhone(val) || val === '') {
      setPhone(val);
    } else {
      toast.error('Phone number can only contain digits.');
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    // Don't show error on every keystroke, only on blur
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      toast.error('Please enter a valid email address.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredPatients.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredPatients.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredPatients.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < filteredPatients.length) {
        e.preventDefault();
        selectPatient(filteredPatients[activeIndex]!);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const [selectedMedId, setSelectedMedId] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [qty, setQty] = useState<number | ''>('');
  const [lineTotal, setLineTotal] = useState<number>(0);
  const [billingItems, setBillingItems] = useState<BillingItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [reference, setReference] = useState('');
  const [paidAmount, setPaidAmount] = useState<number | ''>('');

  useEffect(() => {
    if (selectedMedId) {
      const med = medicines.find((m) => m.id === selectedMedId);
      if (med) {
        setPrice(med.pricePerUnit);
        if (qty && qty > 0) {
          setLineTotal(med.pricePerUnit * Number(qty));
        } else {
          setLineTotal(0);
        }
      }
    } else {
      setPrice(0);
      setLineTotal(0);
    }
  }, [selectedMedId, qty]);

  const rawSubtotal = billingItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0);
  const itemDiscounts = billingItems.reduce((acc, curr) => {
    const lineVal = curr.price * curr.qty;
    return acc + (lineVal * curr.discountPercent) / 100;
  }, 0);
  const generalDiscount = ((rawSubtotal - itemDiscounts) * discountPercent) / 100;
  const totalDiscount = itemDiscounts + generalDiscount;
  const gstValue = billingItems.reduce((acc, curr) => {
    const lineVal = curr.price * curr.qty;
    const discountedLineVal = lineVal - (lineVal * curr.discountPercent) / 100;
    return acc + (discountedLineVal * curr.gst) / 100;
  }, 0);
  const netValue = rawSubtotal - totalDiscount + gstValue;
  const billAmount = Math.round(netValue);

  const handleAddItem = () => {
    if (!selectedMedId) {
      toast.error('Please select a medicine.');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;

    if (med.stock < Number(qty)) {
      toast.warning(`Low Stock: Only ${med.stock} units available.`);
    }

    const newItem: BillingItem = {
      id: med.id,
      name: med.name,
      batch: med.batch,
      price: med.pricePerUnit,
      qty: Number(qty),
      discountPercent: 0,
      gst: med.gst,
      expiry: med.expiry,
    };

    setBillingItems([...billingItems, newItem]);
    setSelectedMedId('');
    setQty('');
    toast.success(`${med.name} added to bill.`);
  };

  const handleRemoveItem = (id: string, index: number) => {
    setBillingItems(billingItems.filter((_, idx) => idx !== index));
    toast.info('Item removed from bill.');
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) return;
    const updated = [...billingItems];
    const item = updated[index];
    if (item) {
      item.qty = newQty;
      setBillingItems(updated);
    }
  };

  const handleUpdateItemDiscount = (index: number, newDisc: number) => {
    if (newDisc < 0 || newDisc > 100) return;
    const updated = [...billingItems];
    const item = updated[index];
    if (item) {
      item.discountPercent = newDisc;
      setBillingItems(updated);
    }
  };

  const handleClearBill = () => {
    setPatientName('');
    setPatientId('');
    setCountryCode('+91');
    setPhone('');
    setEmail('');
    setReferredDoctor('');
    setBillingItems([]);
    setSelectedMedId('');
    setQty('');
    setDiscountPercent(0);
    setPaidAmount('');
    setReference('');
    toast.success('Bill cleared.');
  };

  const handleSaveAndPrint = () => {
    if (!patientName) {
      toast.error('Please enter patient name.');
      return;
    }
    if (!phone) {
      toast.error('Please enter patient phone number.');
      return;
    }
    // Check phone number length based on country code
    const minLength = countryCode === '+91' ? 10 : 7;
    const maxLength = countryCode === '+91' ? 10 : 15;
    if (phone.length < minLength || phone.length > maxLength) {
      toast.error(`Phone number must be between ${minLength} and ${maxLength} digits.`);
      return;
    }
    if (email && !validateEmail(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (billingItems.length === 0) {
      toast.error('Please add at least one medicine to generate a bill.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      toast.error('Please allow popups to print.');
      return;
    }

    const invoiceNumber = Math.floor(100000 + Math.random() * 900000);
    const formattedDate = new Date(billDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const fullPhoneNumber = `${countryCode}${phone}`;

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: white;
              padding: 0.4in;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            }
            .invoice-wrapper {
              max-width: 100%;
              margin: 0 auto;
            }
            .hospital-header {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 28px;
              border-bottom: 2px solid #1f2937;
              padding-bottom: 20px;
            }
            .logo-area {
              display: flex;
              align-items: center;
              gap: 14px;
            }
            .logo-placeholder {
              background: #0b3b5c;
              color: white;
              font-weight: 700;
              font-size: 1.2rem;
              width: 52px;
              height: 52px;
              border-radius: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              letter-spacing: 0.5px;
            }
            .hospital-name {
              font-size: 1.6rem;
              font-weight: 700;
              letter-spacing: -0.5px;
              color: #0b2a3c;
            }
            .hospital-detail {
              text-align: right;
              line-height: 1.5;
            }
            .hospital-detail p {
              font-size: 0.9rem;
              color: #1f2a3f;
            }
            .invoice-meta {
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              background: #f8fafc;
              padding: 16px 18px;
              border-radius: 14px;
              margin-bottom: 28px;
            }
            .meta-block {
              display: flex;
              flex-direction: column;
            }
            .meta-block .label {
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.3px;
              color: #4b5563;
            }
            .meta-block .value {
              font-weight: 600;
              font-size: 1rem;
              color: #0b1e2e;
            }
            .info-grid {
              display: flex;
              flex-wrap: wrap;
              gap: 24px 40px;
              margin-bottom: 30px;
              padding: 6px 0 12px;
              border-bottom: 1px solid #e2e8f0;
            }
            .info-item {
              flex: 1 0 180px;
            }
            .info-item .label {
              font-size: 0.7rem;
              text-transform: uppercase;
              color: #4b5563;
              letter-spacing: 0.2px;
            }
            .info-item .value {
              font-weight: 500;
              font-size: 1rem;
              margin-top: 3px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.9rem;
              margin: 14px 0 20px;
            }
            .items-table th {
              text-align: left;
              background: #f1f5f9;
              padding: 10px 8px;
              font-weight: 600;
              color: #1e293b;
              border-bottom: 2px solid #cbd5e1;
            }
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #e9edf2;
              vertical-align: middle;
            }
            .items-table .text-right {
              text-align: right;
            }
            .items-table .text-center {
              text-align: center;
            }
            .items-table tfoot tr:first-child td {
              border-top: 2px solid #94a3b8;
              padding-top: 14px;
            }
            .items-table tfoot td {
              padding: 6px 8px;
              font-weight: 500;
            }
            .grand-total {
              font-size: 1.1rem;
              font-weight: 700;
              color: #0b2a3c;
            }
            .fw-600 { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- HEADER -->
            <div class="hospital-header">
              <div class="logo-area">
                <div class="logo-placeholder">🏥</div>
                <div>
                  <div class="hospital-name">Palm Health</div>
                  <div style="font-size:0.8rem; color:#2c3e50;">Multispecialty Hospital</div>
                </div>
              </div>
              <div class="hospital-detail">
                <p>📍 12, Health Avenue, Metro City · 560001</p>
                <p>📞 +91 80 4123 4567 · ✉ billing@palmhealth.in</p>
                <p><span style="font-weight:500;">GST: 22AABCP1234D1Z5</span></p>
              </div>
            </div>

            <!-- INVOICE META -->
            <div class="invoice-meta">
              <div class="meta-block">
                <span class="label">Invoice Number</span>
                <span class="value">#${invoiceNumber}</span>
              </div>
              <div class="meta-block">
                <span class="label">Billing Date</span>
                <span class="value">${formattedDate}</span>
              </div>
            </div>

            <!-- CLIENT INFO -->
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Patient Name</div>
                <div class="value">${patientName}</div>
              </div>
              <div class="info-item">
                <div class="label">Patient ID</div>
                <div class="value">${patientId || 'New Patient'}</div>
              </div>
              <div class="info-item">
                <div class="label">Patient Phone No</div>
                <div class="value">${fullPhoneNumber || '—'}</div>
              </div>
              <div class="info-item">
                <div class="label">Patient Email</div>
                <div class="value">${email || '—'}</div>
              </div>
              <div class="info-item">
                <div class="label">Referred Doctor</div>
                <div class="value">${referredDoctor || '—'}</div>
              </div>
            </div>

            <!-- ITEMS TABLE -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width:30%;">Medicine</th>
                  <th style="width:10%;" class="text-center">Batch</th>
                  <th style="width:12%;" class="text-center">Expiry</th>
                  <th style="width:10%;" class="text-center">Qty</th>
                  <th style="width:15%;" class="text-right">MRP (₹)</th>
                  <th style="width:10%;" class="text-right">GST%</th>
                  <th style="width:13%;" class="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${billingItems
                  .map((item) => {
                    const baseLineValue = item.price * item.qty;
                    const discountedLineValue =
                      baseLineValue - (baseLineValue * item.discountPercent) / 100;
                    return `
                    <tr>
                      <td><span class="fw-600">${item.name}</span></td>
                      <td class="text-center">${item.batch}</td>
                      <td class="text-center">${item.expiry || '—'}</td>
                      <td class="text-center">${item.qty}</td>
                      <td class="text-right">₹${item.price.toFixed(2)}</td>
                      <td class="text-right">${item.gst}%</td>
                      <td class="text-right">₹${discountedLineValue.toFixed(2)}</td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-right fw-600">Subtotal</td>
                  <td class="text-right">₹${rawSubtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="6" class="text-right">Tax (GST)</td>
                  <td class="text-right">₹${gstValue.toFixed(2)}</td>
                </tr>
                ${
                  totalDiscount > 0
                    ? `
                  <tr>
                    <td colspan="6" class="text-right">Total Discount</td>
                    <td class="text-right">-₹${totalDiscount.toFixed(2)}</td>
                  </tr>
                `
                    : ''
                }
                <tr>
                  <td colspan="6" class="text-right grand-total" style="font-size:1.2rem;">Grand Total</td>
                  <td class="text-right grand-total" style="font-size:1.2rem;">₹${billAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    toast.success('Invoice sent to printer.');
    handleClearBill();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Pharmacy Billing Main Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Pharmacy Billing</h1>
        </div>

        {/* Date and Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Bill Date *</span>
            <div className="relative">
              <Input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="h-9 w-40 bg-background py-1 text-xs"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="default"
            onClick={handleClearBill}
            className="h-9 text-white text-xs px-4 flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Search className="h-4 w-4" />
            Clear Bill
          </Button>
        </div>
      </div>

      {/* Main Billing Workspace Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left Column: Form & Item Table */}
        <div className="flex flex-col gap-6">
          {/* Patient Details Card */}
          <div className="surface-elevated p-5 rounded-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Patient Name - takes less space */}
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Label htmlFor="patName" className="text-xs font-semibold">
                  Patient Name *
                </Label>
                <Input
                  id="patName"
                  placeholder="Enter patient name"
                  value={patientName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={showSuggestions && filteredPatients.length > 0}
                  aria-autocomplete="list"
                  aria-controls="patient-suggestions"
                  aria-activedescendant={
                    activeIndex >= 0 ? `suggestion-item-${activeIndex}` : undefined
                  }
                  className="mt-1 bg-background h-10 text-sm"
                />
                {showSuggestions && filteredPatients.length > 0 && (
                  <div
                    id="patient-suggestions"
                    role="listbox"
                    className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md z-50 divide-y divide-border"
                  >
                    {filteredPatients.map((p, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <div
                          key={p.id}
                          id={`suggestion-item-${idx}`}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => selectPatient(p)}
                          className={`flex flex-col px-3 py-2 cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{p.name}</span>
                            <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                              {p.id}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground mt-0.5">
                            <span>{p.phone}</span>
                            <span>{p.email}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Phone Number - Split into two fields */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="patPhone" className="text-xs font-semibold">
                  Mobile *
                </Label>
                <div className="flex mt-1 gap-1.5">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[100px] h-10 bg-background text-sm flex-shrink-0">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} ({country.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="patPhone"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    onBlur={() => {
                      const minLength = countryCode === '+91' ? 10 : 7;
                      const maxLength = countryCode === '+91' ? 10 : 15;
                      if (phone && (phone.length < minLength || phone.length > maxLength)) {
                        toast.error(`Phone number must be between ${minLength} and ${maxLength} digits.`);
                      }
                    }}
                    className="bg-background h-10 text-sm flex-1"
                    pattern="\d+"
                    title="Please enter valid digits"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter valid phone number with country code
                </p>
              </div>

              {/* Email */}
              <div className="sm:col-span-2 lg:col-span-1">
                <Label htmlFor="patEmail" className="text-xs font-semibold">
                  Email *
                </Label>
                <Input
                  id="patEmail"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="mt-1 bg-background h-10 text-sm"
                  type="email"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter a valid email address.</p>
              </div>

              {/* Referred Doctor - Full width */}
              <div className="sm:col-span-2 lg:col-span-3">
                <Label htmlFor="refDoctor" className="text-xs font-semibold">
                  Referred Doctor
                </Label>
                <Input
                  id="refDoctor"
                  placeholder="Enter referred doctor name"
                  value={referredDoctor}
                  onChange={(e) => setReferredDoctor(e.target.value)}
                  className="mt-1 bg-background h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Medicine Entry Row Card */}
          <div className="surface-elevated p-5 rounded-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <Label htmlFor="medSelect" className="text-xs font-semibold">
                  Medicine Name
                </Label>
                <Select value={selectedMedId} onValueChange={setSelectedMedId}>
                  <SelectTrigger id="medSelect" className="mt-1 bg-background h-10 text-sm">
                    <SelectValue placeholder="Select Medicine" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} (Batch: {m.batch} · Stock: {m.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medPrice" className="text-xs font-semibold">
                  Price
                </Label>
                <Input
                  id="medPrice"
                  type="number"
                  value={price || ''}
                  readOnly
                  placeholder="0"
                  className="mt-1 bg-muted h-10 text-sm font-semibold w-full"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medQty" className="text-xs font-semibold">
                  Qty
                </Label>
                <Input
                  id="medQty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="mt-1 bg-background h-10 text-sm w-full"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medTotal" className="text-xs font-semibold">
                  Total
                </Label>
                <Input
                  id="medTotal"
                  type="number"
                  value={lineTotal || ''}
                  readOnly
                  placeholder="0"
                  className="mt-1 bg-muted h-10 text-sm font-semibold text-primary w-full"
                />
              </div>

              <div className="md:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full h-10 text-sm font-semibold"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* Table of Medicines in Bill */}
          <div className="surface-elevated overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs">
                      Medicine Name
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-28">
                      Batch
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">
                      Price
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">
                      Quantity
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">
                      Total
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-24">
                      Disc. %
                    </th>
                    <th className="px-4 py-3.5 text-left font-semibold uppercase text-xs w-28">
                      Amount
                    </th>
                    <th className="px-4 py-3.5 text-center font-semibold uppercase text-xs w-20">
                      Edit/Delete
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {billingItems.length > 0 ? (
                    billingItems.map((item, index) => {
                      const baseLineValue = item.price * item.qty;
                      const discountedLineValue =
                        baseLineValue - (baseLineValue * item.discountPercent) / 100;
                      return (
                        <tr key={index} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {item.batch}
                          </td>
                          <td className="px-4 py-3">₹{item.price}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateItemQty(index, Number(e.target.value))}
                              className="h-8 w-16 bg-background p-1 text-center"
                            />
                          </td>
                          <td className="px-4 py-3">₹{baseLineValue.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) =>
                                handleUpdateItemDiscount(index, Number(e.target.value))
                              }
                              className="h-8 w-16 bg-background p-1 text-center"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            ₹{discountedLineValue.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id, index)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-16 text-center text-muted-foreground italic bg-muted/10"
                      >
                        No medicines added yet. Select a medicine and click add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Card (Summary) */}
        <div className="surface-elevated p-6 rounded-2xl flex flex-col gap-5 border border-border shadow-xs">
          <h3 className="font-display font-bold text-slate-800 text-lg">Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-slate-800">₹{rawSubtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium text-slate-800">₹{gstValue.toFixed(2)}</span>
            </div>

            <div className="border-t border-border my-2" />

            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-slate-800">Total</span>
              <span className="text-primary text-xl font-extrabold">₹{netValue.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={handleSaveAndPrint}
            className="w-full bg-[#0d9488] hover:bg-[#0b7e73] text-white font-bold h-11 text-sm shadow-md mt-2 flex items-center justify-center gap-2 rounded-lg"
          >
            <FileText className="h-4 w-4" /> Generate Bill
          </Button>
        </div>
      </div>
    </div>
  );
}