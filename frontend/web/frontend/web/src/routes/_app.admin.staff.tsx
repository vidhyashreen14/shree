import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  UserPlus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  Users,
  HeartPulse,
  Pill,
  FlaskConical,
  UserCheck,
  Camera,
  BadgeCheck,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { useStaffProfiles, type StaffProfile } from '@/lib/store/staffProfiles';
import {
  cn,
  sanitizeLettersOnly,
  sanitizePhone,
  sanitizePincode,
  sanitizeAadhaar,
  sanitizePAN,
} from '@/lib/utils';
import type { Role } from '@/lib/types';

export const Route = createFileRoute('/_app/admin/staff')({
  head: () => ({
    meta: [
      { title: 'Staff Profiles · MediCore Admin' },
      { name: 'description', content: 'Manage staff profiles for all roles.' },
    ],
  }),
  component: AdminStaff,
});

// ─── Constants ───────────────────────────────────────────────────────────────

const STAFF_ROLES: {
  value: Role;
  label: string;
  icon: typeof Stethoscope;
  color: string;
  idPrefix: string;
}[] = [
  {
    value: 'doctor',
    label: 'Doctor',
    icon: Stethoscope,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    idPrefix: 'DOC',
  },
  {
    value: 'nurse',
    label: 'Nurse',
    icon: HeartPulse,
    color: 'bg-pink-500/10 text-pink-600 border-pink-200',
    idPrefix: 'NUR',
  },
  {
    value: 'lab',
    label: 'Laboratory',
    icon: FlaskConical,
    color: 'bg-violet-500/10 text-violet-600 border-violet-200',
    idPrefix: 'LAB',
  },
  {
    value: 'pharmacy',
    label: 'Pharmacy',
    icon: Pill,
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
    idPrefix: 'PHA',
  },
  {
    value: 'frontdesk',
    label: 'Front Desk',
    icon: Users,
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
    idPrefix: 'FD',
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CLINICAL_DEPARTMENTS = [
  'General Medicine',
  'General Surgery',
  'Cardiology',
  'Cardiothoracic Surgery (CTVS)',
  'Neurology',
  'Neurosurgery',
  'Orthopedics',
  'Pediatrics',
  'Pediatric Surgery',
  'Obstetrics & Gynecology (OBG)',
  'Dermatology',
  'ENT (Otorhinolaryngology)',
  'Ophthalmology',
  'Urology',
  'Nephrology',
  'Gastroenterology',
  'Surgical Gastroenterology',
  'Endocrinology',
  'Pulmonology (Respiratory Medicine)',
  'Psychiatry',
  'Medical Oncology',
  'Surgical Oncology',
  'Radiation Oncology',
  'Rheumatology',
  'Plastic & Reconstructive Surgery',
  'Anesthesiology',
  'Critical Care Medicine (ICU)',
  'Emergency Medicine',
  'Physical Medicine & Rehabilitation (PMR)',
  'Dental Surgery',
];

const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];
const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRoleInfo(role: Role) {
  return STAFF_ROLES.find((r) => r.value === role);
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Empty Form State ─────────────────────────────────────────────────────────

type FormState = {
  role: Role;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other' | '';
  dateOfBirth: string;
  bloodGroup: string;
  maritalStatus: string;
  mobile: string;
  email: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  emergencyContactPerson: string;
  emergencyContactNumber: string;
  profilePhoto: string;
  department: string;
};

const emptyForm: FormState = {
  role: 'doctor',
  firstName: '',
  lastName: '',
  gender: '',
  dateOfBirth: '',
  bloodGroup: '',
  maritalStatus: '',
  mobile: '',
  email: '',
  aadhaarNumber: '',
  panNumber: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pinCode: '',
  emergencyContactPerson: '',
  emergencyContactNumber: '',
  profilePhoto: '',
  department: 'none',
};

// ─── Profile Photo Upload ─────────────────────────────────────────────────────

function PhotoUpload({
  value,
  onChange,
  initials,
}: {
  value: string;
  onChange: (v: string) => void;
  initials: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be smaller than 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-20 w-20 cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img
            src={value}
            alt="Profile"
            className="h-20 w-20 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 grid place-items-center text-xl font-bold text-primary">
            {initials || '?'}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
          <Camera className="h-5 w-5 text-white" />
        </div>
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-xs text-primary hover:underline"
      >
        {value ? 'Change photo' : 'Upload photo'} (optional)
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── Staff ID Badge ───────────────────────────────────────────────────────────

function StaffIdBadge({ staffId }: { staffId: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          System-generated Staff ID
        </p>
        <p className="text-base font-bold text-primary font-mono tracking-wider">{staffId}</p>
      </div>
    </div>
  );
}

// ─── Create / Edit Form Dialog ────────────────────────────────────────────────

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  editProfile?: StaffProfile | null;
}

function ProfileFormDialog({ open, onClose, editProfile }: FormDialogProps) {
  const addProfile = useStaffProfiles((s) => s.addProfile);
  const updateProfile = useStaffProfiles((s) => s.updateProfile);
  const profiles = useStaffProfiles((s) => s.profiles);

  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    department: 'none',
  });

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setForm(
          editProfile
            ? {
                role: editProfile.role,
                firstName: editProfile.firstName,
                lastName: editProfile.lastName,
                gender: editProfile.gender,
                dateOfBirth: editProfile.dateOfBirth,
                bloodGroup: editProfile.bloodGroup ?? '',
                maritalStatus: editProfile.maritalStatus ?? '',
                mobile: editProfile.mobile,
                email: editProfile.email,
                aadhaarNumber: editProfile.aadhaarNumber ?? '',
                panNumber: editProfile.panNumber ?? '',
                address: editProfile.address,
                city: editProfile.city,
                state: editProfile.state,
                country: editProfile.country,
                pinCode: editProfile.pinCode,
                emergencyContactPerson: editProfile.emergencyContactPerson,
                emergencyContactNumber: editProfile.emergencyContactNumber,
                profilePhoto: editProfile.profilePhoto ?? '',
                department: editProfile.department ?? 'none',
              }
            : {
                ...emptyForm,
                department: 'none',
              },
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, editProfile]);

  // Reset form when dialog opens
  const handleOpenChange = (o: boolean) => {
    if (!o) onClose();
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  // Preview Staff ID
  const previewStaffId = useMemo(() => {
    if (editProfile) return editProfile.staffId;
    const prefix = STAFF_ROLES.find((r) => r.value === form.role)?.idPrefix ?? 'STF';
    const count = profiles.filter((p) => p.role === form.role).length + 1;
    return `${prefix}-${String(count).padStart(4, '0')}`;
  }, [form.role, profiles, editProfile]);

  const isValid =
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '' &&
    form.gender !== '' &&
    form.dateOfBirth !== '' &&
    form.mobile.trim() !== '' &&
    form.email.trim() !== '' &&
    form.address.trim() !== '' &&
    form.city.trim() !== '' &&
    form.state !== '' &&
    form.country.trim() !== '' &&
    form.pinCode.trim() !== '' &&
    form.emergencyContactPerson.trim() !== '' &&
    form.emergencyContactNumber.trim() !== '';

  const handleSubmit = () => {
    if (!isValid) {
      toast.error('Please fill all required fields');
      return;
    }
    const data = {
      role: form.role,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender as 'male' | 'female' | 'other',
      dateOfBirth: form.dateOfBirth,
      bloodGroup: form.bloodGroup || undefined,
      maritalStatus: (form.maritalStatus || undefined) as StaffProfile['maritalStatus'],
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      aadhaarNumber: form.aadhaarNumber || undefined,
      panNumber: form.panNumber || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      country: form.country.trim(),
      pinCode: form.pinCode.trim(),
      emergencyContactPerson: form.emergencyContactPerson.trim(),
      emergencyContactNumber: form.emergencyContactNumber.trim(),
      profilePhoto: form.profilePhoto || undefined,
      department: form.department && form.department !== 'none' ? form.department : undefined,
    };

    if (editProfile) {
      updateProfile(editProfile.id, data);
      toast.success(`Profile updated for ${form.firstName} ${form.lastName}`);
    } else {
      const created = addProfile(data);
      toast.success(`Staff profile created`, {
        description: `Staff ID: ${created.staffId} assigned to ${form.firstName} ${form.lastName}`,
      });
    }
    onClose();
  };

  const initials = getInitials(form.firstName, form.lastName);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
              <UserCheck className="h-4 w-4 text-primary" />
            </span>
            {editProfile ? 'Edit Staff Profile' : 'Create Staff Profile'}
          </DialogTitle>
          <DialogDescription>
            {editProfile
              ? "Update the staff member's profile details."
              : 'Fill in the details to create a new staff profile. Staff ID is auto-assigned by the system.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Selector */}
          {!editProfile && (
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Staff Role
              </Label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {STAFF_ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set({ role: r.value })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-all text-xs font-medium',
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/40 text-primary'
                          : 'border-border bg-background hover:border-primary/40 hover:bg-accent/40 text-muted-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-7 w-7 place-items-center rounded-lg',
                          active ? 'bg-primary text-primary-foreground' : 'bg-muted',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="leading-tight">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Staff ID Preview */}
          <StaffIdBadge staffId={previewStaffId} />

          {/* Profile Photo */}
          <div className="flex justify-center">
            <PhotoUpload
              value={form.profilePhoto}
              onChange={(v) => set({ profilePhoto: v })}
              initials={initials}
            />
          </div>

          {/* Section: Personal Information */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div>
                <Label htmlFor="sp-fname">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-fname"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => set({ firstName: sanitizeLettersOnly(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              {/* Last Name */}
              <div>
                <Label htmlFor="sp-lname">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-lname"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => set({ lastName: sanitizeLettersOnly(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              {/* Gender */}
              <div>
                <Label>
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => set({ gender: v as FormState['gender'] })}
                >
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Date of Birth */}
              <div>
                <Label htmlFor="sp-dob">
                  Date of Birth <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set({ dateOfBirth: e.target.value })}
                  className="mt-1.5 bg-background"
                />
              </div>
              {/* Blood Group */}
              <div>
                <Label>
                  Blood Group <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Select value={form.bloodGroup} onValueChange={(v) => set({ bloodGroup: v })}>
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Marital Status */}
              <div>
                <Label>
                  Marital Status <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Select value={form.maritalStatus} onValueChange={(v) => set({ maritalStatus: v })}>
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUSES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Department */}
              <div>
                <Label>
                  Department <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Select value={form.department} onValueChange={(v) => set({ department: v })}>
                  <SelectTrigger className="mt-1.5 bg-background">
                    <SelectValue placeholder="Unassigned / None" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="none">None / Unassigned</SelectItem>
                    {CLINICAL_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Contact & Identity */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Contact & Identity
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sp-mobile">
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-mobile"
                  type="tel"
                  placeholder="98765 43210"
                  value={form.mobile}
                  onChange={(e) => set({ mobile: sanitizePhone(e.target.value) })}
                  maxLength={15}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="sp-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-email"
                  type="email"
                  placeholder="staff@hospital.io"
                  value={form.email}
                  onChange={(e) => set({ email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="sp-aadhaar">
                  Aadhaar Number <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="sp-aadhaar"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                  value={form.aadhaarNumber}
                  onChange={(e) => set({ aadhaarNumber: sanitizeAadhaar(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="sp-pan">
                  PAN Number <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  id="sp-pan"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  value={form.panNumber}
                  onChange={(e) => set({ panNumber: sanitizePAN(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Section: Address */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Address
            </p>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="sp-address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="sp-address"
                  placeholder="House No., Street, Area"
                  rows={2}
                  value={form.address}
                  onChange={(e) => set({ address: e.target.value })}
                  className="mt-1.5 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sp-city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sp-city"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => set({ city: sanitizeLettersOnly(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.state} onValueChange={(v) => set({ state: v })}>
                    <SelectTrigger className="mt-1.5 bg-background">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {INDIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sp-country">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sp-country"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => set({ country: sanitizeLettersOnly(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sp-pincode">
                    PIN Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sp-pincode"
                    placeholder="6-digit PIN"
                    maxLength={6}
                    value={form.pinCode}
                    onChange={(e) => set({ pinCode: sanitizePincode(e.target.value) })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
              Emergency Contact
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sp-ecperson">
                  Contact Person <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-ecperson"
                  placeholder="Full name"
                  value={form.emergencyContactPerson}
                  onChange={(e) =>
                    set({ emergencyContactPerson: sanitizeLettersOnly(e.target.value) })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="sp-ecnum">
                  Contact Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sp-ecnum"
                  type="tel"
                  placeholder="98765 43210"
                  value={form.emergencyContactNumber}
                  onChange={(e) => set({ emergencyContactNumber: sanitizePhone(e.target.value) })}
                  maxLength={15}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {!isValid && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              All required fields marked with{' '}
              <span className="font-semibold text-destructive ml-1">*</span> must be filled.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid} id="btn-save-staff-profile">
            <UserCheck className="mr-2 h-4 w-4" />
            {editProfile ? 'Save Changes' : 'Create Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── View Profile Dialog ──────────────────────────────────────────────────────

function ViewProfileDialog({
  profile,
  onClose,
  onEdit,
}: {
  profile: StaffProfile | null;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!profile) return null;
  const roleInfo = getRoleInfo(profile.role);
  const Icon = roleInfo?.icon ?? Users;
  const initials = getInitials(profile.firstName, profile.lastName);

  return (
    <Dialog open={!!profile} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Staff Profile</DialogTitle>
        </DialogHeader>

        {/* Profile Hero */}
        <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
          {profile.profilePhoto ? (
            <img
              src={profile.profilePhoto}
              alt={`${profile.firstName} ${profile.lastName}`}
              className="h-16 w-16 rounded-full object-cover border-2 border-primary/30 shrink-0"
            />
          ) : (
            <div
              className={cn(
                'grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 text-xl font-bold',
                roleInfo?.color ?? 'bg-muted',
              )}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold truncate">
              {profile.firstName} {profile.lastName}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                  roleInfo?.color,
                )}
              >
                <Icon className="h-3 w-3" />
                {roleInfo?.label}
              </span>
              {profile.department && (
                <span className="text-xs text-muted-foreground">· {profile.department}</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-sm font-bold text-primary">{profile.staffId}</p>
            <p className="text-xs text-muted-foreground">Staff ID</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          {/* Personal */}
          <ProfileSection title="Personal Information">
            <ProfileRow label="Gender" value={profile.gender} className="capitalize" />
            <ProfileRow label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
            <ProfileRow label="Blood Group" value={profile.bloodGroup || '—'} />
            <ProfileRow
              label="Marital Status"
              value={
                profile.maritalStatus
                  ? profile.maritalStatus.charAt(0).toUpperCase() + profile.maritalStatus.slice(1)
                  : '—'
              }
            />
          </ProfileSection>

          {/* Contact */}
          <ProfileSection title="Contact & Identity">
            <ProfileRow
              label="Mobile"
              value={
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  {profile.mobile}
                </span>
              }
            />
            <ProfileRow
              label="Email"
              value={
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {profile.email}
                </span>
              }
            />
            <ProfileRow label="Aadhaar" value={profile.aadhaarNumber || '—'} />
            <ProfileRow label="PAN" value={profile.panNumber || '—'} />
          </ProfileSection>

          {/* Address */}
          <ProfileSection title="Address">
            <ProfileRow
              label="Address"
              value={
                <span className="flex items-start gap-1">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    {profile.address}, {profile.city}, {profile.state} — {profile.pinCode},{' '}
                    {profile.country}
                  </span>
                </span>
              }
            />
          </ProfileSection>

          {/* Emergency */}
          <ProfileSection title="Emergency Contact">
            <ProfileRow label="Name" value={profile.emergencyContactPerson} />
            <ProfileRow label="Number" value={profile.emergencyContactNumber} />
          </ProfileSection>

          {/* Meta */}
          <ProfileSection title="System Info">
            <ProfileRow
              label="Staff ID"
              value={<span className="font-mono font-bold text-primary">{profile.staffId}</span>}
            />
            <ProfileRow
              label="Status"
              value={
                <StatusChip tone={profile.status === 'active' ? 'success' : 'danger'}>
                  {profile.status}
                </StatusChip>
              }
            />
            <ProfileRow label="Created" value={formatDate(profile.createdAt)} />
            <ProfileRow label="Last Updated" value={formatDate(profile.updatedAt)} />
          </ProfileSection>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
        {title}
      </p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function ProfileRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
      <span className={cn('flex-1 font-medium', className)}>{value}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AdminStaff() {
  const { profiles, deleteProfile, updateProfile } = useStaffProfiles();
  const [createOpen, setCreateOpen] = useState(false);
  const [viewProfile, setViewProfile] = useState<StaffProfile | null>(null);
  const [editProfile, setEditProfile] = useState<StaffProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | Role>('all');

  const filteredProfiles = useMemo(
    () => (activeTab === 'all' ? profiles : profiles.filter((p) => p.role === activeTab)),
    [profiles, activeTab],
  );

  const columns = useMemo<ColumnDef<StaffProfile>[]>(
    () => [
      {
        header: 'Staff ID',
        accessorKey: 'staffId',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-bold text-primary bg-primary/8 px-2 py-0.5 rounded">
            {String(getValue())}
          </span>
        ),
      },
      {
        header: 'Staff Member',
        id: 'name',
        cell: ({ row }) => {
          const p = row.original;
          const roleInfo = getRoleInfo(p.role);
          return (
            <div className="flex items-center gap-3">
              {p.profilePhoto ? (
                <img
                  src={p.profilePhoto}
                  alt={`${p.firstName} ${p.lastName}`}
                  className="h-9 w-9 rounded-full object-cover shrink-0 border"
                />
              ) : (
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-semibold',
                    roleInfo?.color ?? 'bg-muted',
                  )}
                >
                  {getInitials(p.firstName, p.lastName)}
                </span>
              )}
              <div>
                <p className="font-medium">
                  {p.firstName} {p.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        header: 'Role',
        accessorKey: 'role',
        cell: ({ row }) => {
          const roleInfo = getRoleInfo(row.original.role);
          const Icon = roleInfo?.icon ?? Users;
          return (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
                roleInfo?.color,
              )}
            >
              <Icon className="h-3 w-3" />
              {roleInfo?.label}
            </span>
          );
        },
      },
      {
        header: 'Mobile',
        accessorKey: 'mobile',
        cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const s = getValue() as StaffProfile['status'];
          return <StatusChip tone={s === 'active' ? 'success' : 'danger'}>{s}</StatusChip>;
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewProfile(p)}>
                  <Eye className="mr-2 h-4 w-4" /> View profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setViewProfile(null);
                    setEditProfile(p);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {p.status === 'active' ? (
                  <DropdownMenuItem
                    className="text-amber-600"
                    onClick={() => {
                      updateProfile(p.id, { status: 'inactive' });
                      toast.success(`${p.firstName} ${p.lastName} marked inactive`);
                    }}
                  >
                    Mark inactive
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-emerald-600"
                    onClick={() => {
                      updateProfile(p.id, { status: 'active' });
                      toast.success(`${p.firstName} ${p.lastName} reactivated`);
                    }}
                  >
                    Mark active
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    if (
                      confirm(
                        `Delete profile for ${p.firstName} ${p.lastName}? This cannot be undone.`,
                      )
                    ) {
                      deleteProfile(p.id);
                      toast.success('Profile deleted');
                    }
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [deleteProfile, updateProfile],
  );

  // Stats
  const stats = useMemo(
    () => [
      { label: 'Total Staff', value: profiles.length, color: 'text-primary' },
      {
        label: 'Active',
        value: profiles.filter((p) => p.status === 'active').length,
        color: 'text-emerald-600',
      },
      {
        label: 'Doctors',
        value: profiles.filter((p) => p.role === 'doctor').length,
        color: 'text-emerald-500',
      },
      {
        label: 'Nurses',
        value: profiles.filter((p) => p.role === 'nurse').length,
        color: 'text-pink-600',
      },
      {
        label: 'Lab Staff',
        value: profiles.filter((p) => p.role === 'lab').length,
        color: 'text-violet-600',
      },
    ],
    [profiles],
  );

  return (
    <>
      {/* Modals */}
      <ProfileFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ProfileFormDialog
        open={!!editProfile}
        onClose={() => setEditProfile(null)}
        editProfile={editProfile}
      />
      <ViewProfileDialog
        profile={viewProfile}
        onClose={() => setViewProfile(null)}
        onEdit={() => {
          setEditProfile(viewProfile);
          setViewProfile(null);
        }}
      />

      <PageHeader
        eyebrow="Administration"
        title="Staff Profiles"
        description="Create and manage complete staff profiles for all roles. Staff IDs are auto-generated by the system."
        actions={
          <Button onClick={() => setCreateOpen(true)} id="btn-create-staff-profile">
            <UserPlus className="mr-2 h-4 w-4" /> Add Staff Profile
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card px-4 py-3">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Role filter tabs */}
      <div className="mb-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | Role)}>
          <TabsList>
            <TabsTrigger value="all">All Staff</TabsTrigger>
            {STAFF_ROLES.map((r) => (
              <TabsTrigger key={r.value} value={r.value}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Table or empty state */}
      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted py-20 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
            <UserCheck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display text-lg font-semibold">No staff profiles yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Create the first staff profile. Staff IDs like DOC-0001, NUR-0001 will be automatically
            assigned.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)} id="btn-empty-create-staff">
            <UserPlus className="mr-2 h-4 w-4" /> Create first profile
          </Button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted py-16 text-center">
          <p className="text-muted-foreground text-sm">No staff profiles found for this role.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add profile
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredProfiles}
          searchPlaceholder="Search by name, email, staff ID…"
        />
      )}
    </>
  );
}
