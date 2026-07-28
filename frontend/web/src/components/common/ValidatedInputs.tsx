import React, { useEffect, useRef, useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import {
  allowOnlyAlphabetsAndSpaces,
  allowOnlyNumbers,
  patientNameSchema,
  mobileSchema,
  emailSchema,
  labIdSchema,
} from "@/lib/validations";

type ValidatedInputProps = Omit<InputProps, "value" | "onChange"> & {
  value: string;
  onChange: (val: string) => void;
  onErrorChange?: (hasError: boolean) => void;
  required?: boolean;
};

// ─── Patient Name Input ───────────────────────────────────────────────────────
export function PatientNameInput({
  value,
  onChange,
  onErrorChange,
  required,
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value && !required) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    const res = patientNameSchema.safeParse(value);
    if (!res.success) {
      setError(res.error.errors[0].message);
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(allowOnlyAlphabetsAndSpaces(e.target.value));
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      error={error}
      maxLength={50}
      placeholder="Patient Name"
      {...props}
    />
  );
}

// ─── Mobile Input (+91 Prefix) ───────────────────────────────────────────────
export function MobileInput({
  value,
  onChange,
  onErrorChange,
  required,
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value && !required) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    const res = mobileSchema.safeParse(value);
    if (!res.success) {
      setError(res.error.errors[0].message);
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith("+91 ")) val = val.substring(4);
    if (val.startsWith("+91")) val = val.substring(3);
    onChange(allowOnlyNumbers(val));
  };

  const displayValue = value ? `+91 ${value}` : "";

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      error={error}
      maxLength={14}
      placeholder="+91 Mobile Number"
      {...props}
    />
  );
}

// ─── Email Input ─────────────────────────────────────────────────────────────
export function EmailInput({
  value,
  onChange,
  onErrorChange,
  required,
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value && !required) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    const res = emailSchema.safeParse(value);
    if (!res.success) {
      setError(res.error.errors[0].message);
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  return (
    <Input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      maxLength={100}
      placeholder="Email Address"
      {...props}
    />
  );
}

// ─── Lab ID / Specimen ID Input ──────────────────────────────────────────────
export function LabIdInput({
  value,
  onChange,
  onErrorChange,
  required,
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value && !required) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    const res = labIdSchema.safeParse(value);
    if (!res.success) {
      setError(res.error.errors[0].message);
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const cleaned = raw.replace(/[^a-zA-Z0-9\-]/g, "").toUpperCase();
    onChange(cleaned);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      error={error}
      maxLength={20}
      placeholder="Lab / Specimen ID"
      {...props}
    />
  );
}

// ─── Search Mobile Input (+91 prefix, 10 digits, real-time validation) ────────
export function SearchMobileInput({
  value,
  onChange,
  onErrorChange,
  className,
  ...props
}: Omit<ValidatedInputProps, "required">) {
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Validate the raw 10-digit value
  useEffect(() => {
    if (!value) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    if (value.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      onErrorChange?.(true);
    } else {
      const res = mobileSchema.safeParse(value);
      if (!res.success) {
        setError(res.error.errors[0].message);
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
    }
  }, [value, onErrorChange]);

  // Block non-numeric keypresses
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Block invalid paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const digitsOnly = pasted.replace(/\D/g, "");
    const remaining = 10 - value.length;
    if (remaining > 0) {
      onChange((value + digitsOnly).slice(0, 10));
    }
  };

  // onChange: strip non-digits, cap at 10
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = allowOnlyNumbers(e.target.value).slice(0, 10);
    onChange(digits);
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        maxLength={10}
        placeholder="Search mobile..."
        className={className}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {error && (
        <p className="mt-1 text-[11px] font-medium text-destructive animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Search Patient Name Input (alphabets + single spaces, real-time validation)
export function SearchPatientNameInput({
  value,
  onChange,
  onErrorChange,
  className,
  ...props
}: Omit<ValidatedInputProps, "required">) {
  const [error, setError] = useState<string>();

  // Validate
  useEffect(() => {
    if (!value) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    // Only allow letters and single internal spaces
    if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(value)) {
      setError("Patient name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, onErrorChange]);

  // Block invalid keypresses: only letters, space, navigation keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z ]$/.test(e.key)) {
      e.preventDefault();
    }
    // Block leading space
    if (e.key === " " && value.length === 0) e.preventDefault();
    // Block consecutive spaces
    if (e.key === " " && value.endsWith(" ")) e.preventDefault();
  };

  // Block invalid paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    // Strip anything that isn't letters or spaces, collapse multiple spaces
    const cleaned = pasted
      .replace(/[^a-zA-Z ]/g, "")
      .replace(/\s{2,}/g, " ")
      .trimStart();
    const merged = (value + cleaned).slice(0, 50);
    onChange(merged);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip invalid chars, collapse multiple spaces, prevent leading space
    let val = e.target.value.replace(/[^a-zA-Z ]/g, "").replace(/\s{2,}/g, " ");
    if (val.startsWith(" ")) val = val.trimStart();
    onChange(val.slice(0, 50));
  };

  return (
    <div className="w-full">
      <input
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        maxLength={50}
        placeholder="Search patient name..."
        className={className}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {error && (
        <p className="mt-1 text-[11px] font-medium text-destructive animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}
