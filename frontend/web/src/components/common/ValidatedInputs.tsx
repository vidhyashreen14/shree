import React, { useEffect, useRef, useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import {
  allowOnlyAlphabetsAndSpaces,
  allowOnlyAlphabets,
  allowOnlyNumbers,
  allowOnlyEmailChars,
  allowOnlyAlphanumericAndHyphen,
  patientNameSchema,
  firstNameSchema,
  middleNameSchema,
  lastNameSchema,
  passwordSchema,
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
  placeholder = "Patient Name",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Patient name is required.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = patientNameSchema.safeParse(value);
    if (!res.success) {
      setError("Patient name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(allowOnlyAlphabetsAndSpaces(e.target.value).slice(0, 50));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    const trimmed = value.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      maxLength={50}
      placeholder={placeholder}
      {...props}
    />
  );
}

// ─── First Name Input ────────────────────────────────────────────────────────
export function FirstNameInput({
  value,
  onChange,
  onErrorChange,
  required,
  placeholder = "First Name",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("First name should contain only alphabets.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = firstNameSchema.safeParse(value);
    if (!res.success) {
      setError("First name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(allowOnlyAlphabetsAndSpaces(e.target.value).slice(0, 50));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    const trimmed = value.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      maxLength={50}
      placeholder={placeholder}
      {...props}
    />
  );
}

// ─── Middle Name Input ───────────────────────────────────────────────────────
export function MiddleNameInput({
  value,
  onChange,
  onErrorChange,
  required,
  placeholder = "Middle Name",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    const res = middleNameSchema.safeParse(value);
    if (!res.success) {
      setError("Middle name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(allowOnlyAlphabetsAndSpaces(e.target.value).slice(0, 50));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    const trimmed = value.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      maxLength={50}
      placeholder={placeholder}
      {...props}
    />
  );
}

// ─── Last Name Input ─────────────────────────────────────────────────────────
export function LastNameInput({
  value,
  onChange,
  onErrorChange,
  required,
  placeholder = "Last Name",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Last name should contain only alphabets.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = lastNameSchema.safeParse(value);
    if (!res.success) {
      setError("Last name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(allowOnlyAlphabetsAndSpaces(e.target.value).slice(0, 50));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    const trimmed = value.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      maxLength={50}
      placeholder={placeholder}
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
  placeholder = "(+91) Mobile Number",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Enter a valid 10-digit mobile number.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    if (value.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      onErrorChange?.(true);
    } else {
      const res = mobileSchema.safeParse(value);
      if (!res.success) {
        setError("Enter a valid 10-digit mobile number.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith("(+91) ")) val = val.substring(6);
    if (val.startsWith("(+91)")) val = val.substring(5);
    if (val.startsWith("+91 ")) val = val.substring(4);
    if (val.startsWith("+91")) val = val.substring(3);
    const cleanDigits = allowOnlyNumbers(val).slice(0, 10);
    onChange(cleanDigits);
  };

  const displayValue = value ? `(+91) ${value}` : "";

  return (
    <Input
      value={displayValue}
      onChange={handleChange}
      error={error}
      maxLength={16}
      placeholder={placeholder}
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
  placeholder = "Email Address",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Enter a valid email address.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = emailSchema.safeParse(value);
    if (!res.success) {
      setError("Enter a valid email address.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow letters, numbers, @, dot, underscore, hyphen.
    // Disallow all other special characters (#, $, %, &, *, !, +, =, etc.) while typing.
    const cleaned = allowOnlyEmailChars(e.target.value.trim());
    onChange(cleaned);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    props.onBlur?.(e);
    const trimmed = value.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    }
  };

  return (
    <Input
      type="email"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      maxLength={100}
      placeholder={placeholder}
      {...props}
    />
  );
}

// ─── Password Input (Alphabets Only) ─────────────────────────────────────────
export function PasswordInput({
  value,
  onChange,
  onErrorChange,
  required,
  placeholder = "Password",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Password should contain only alphabets.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = passwordSchema.safeParse(value);
    if (!res.success) {
      setError("Password should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only alphabetic characters (A-Z, a-z). Block numbers (0-9) and special characters.
    const cleaned = allowOnlyAlphabets(e.target.value).slice(0, 50);
    onChange(cleaned);
  };

  return (
    <Input
      type="password"
      value={value}
      onChange={handleChange}
      error={error}
      maxLength={50}
      placeholder={placeholder}
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
  placeholder = "Lab / Specimen ID",
  ...props
}: ValidatedInputProps) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      if (required) {
        setError("Lab ID / Specimen ID can only contain alphanumeric characters and hyphens.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
      return;
    }
    const res = labIdSchema.safeParse(value);
    if (!res.success) {
      setError("Lab ID / Specimen ID can only contain alphanumeric characters and hyphens.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, required, onErrorChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = allowOnlyAlphanumericAndHyphen(e.target.value).slice(0, 20);
    onChange(cleaned);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      error={error}
      maxLength={20}
      placeholder={placeholder}
      {...props}
    />
  );
}

// ─── Search Mobile Input ─────────────────────────────────────────────────────
export function SearchMobileInput({
  value,
  onChange,
  onErrorChange,
  className,
  placeholder = "(+91) Search mobile...",
  ...props
}: Omit<ValidatedInputProps, "required">) {
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

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
        setError("Enter a valid 10-digit mobile number.");
        onErrorChange?.(true);
      } else {
        setError(undefined);
        onErrorChange?.(false);
      }
    }
  }, [value, onErrorChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    let pasted = e.clipboardData.getData("text");
    if (pasted.startsWith("(+91) ")) pasted = pasted.substring(6);
    if (pasted.startsWith("(+91)")) pasted = pasted.substring(5);
    if (pasted.startsWith("+91 ")) pasted = pasted.substring(4);
    if (pasted.startsWith("+91")) pasted = pasted.substring(3);
    const digitsOnly = allowOnlyNumbers(pasted);
    const merged = (value + digitsOnly).slice(0, 10);
    onChange(merged);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.startsWith("(+91) ")) val = val.substring(6);
    if (val.startsWith("(+91)")) val = val.substring(5);
    if (val.startsWith("+91 ")) val = val.substring(4);
    if (val.startsWith("+91")) val = val.substring(3);
    const digits = allowOnlyNumbers(val).slice(0, 10);
    onChange(digits);
  };

  const displayValue = value ? `(+91) ${value}` : "";

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        maxLength={16}
        placeholder={placeholder}
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

// ─── Search Patient Name Input ───────────────────────────────────────────────
export function SearchPatientNameInput({
  value,
  onChange,
  onErrorChange,
  className,
  placeholder = "Search patient name...",
  ...props
}: Omit<ValidatedInputProps, "required">) {
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!value) {
      setError(undefined);
      onErrorChange?.(false);
      return;
    }
    if (!/^[a-zA-Z]+(\s[a-zA-Z]+)*$/.test(value)) {
      setError("Patient name should contain only alphabets.");
      onErrorChange?.(true);
    } else {
      setError(undefined);
      onErrorChange?.(false);
    }
  }, [value, onErrorChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (!allowed.includes(e.key) && !/^[a-zA-Z ]$/.test(e.key)) {
      e.preventDefault();
    }
    if (e.key === " " && value.length === 0) e.preventDefault();
    if (e.key === " " && value.endsWith(" ")) e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const cleaned = pasted
      .replace(/[^a-zA-Z ]/g, "")
      .replace(/\s{2,}/g, " ")
      .trimStart();
    const merged = (value + cleaned).slice(0, 50);
    onChange(merged);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        placeholder={placeholder}
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
