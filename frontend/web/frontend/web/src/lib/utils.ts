import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Input Sanitizers ─────────────────────────────────────────────────────────
// Use these in onChange handlers to restrict what characters can be entered
// in each field type. They are pure transform functions: value in → clean value out.

/** Names: letters, spaces, hyphens, apostrophes, dots (e.g. "Dr. O'Brien", "Jean-Pierre") */
export const sanitizeLettersOnly = (v: string) => v.replace(/[^a-zA-Z\s\-'.]/g, '');

/** Digits only — used for phone, PIN, Aadhaar raw digits */
export const sanitizeDigitsOnly = (v: string) => v.replace(/\D/g, '');

/** Phone / mobile: digits only, capped at maxLen (default 15) */
export const sanitizePhone = (v: string, maxLen = 15) => v.replace(/\D/g, '').slice(0, maxLen);

/** PIN / Zip code: digits only, max 6 */
export const sanitizePincode = (v: string) => v.replace(/\D/g, '').slice(0, 6);

/** Aadhaar: digits only, auto-formatted as "XXXX XXXX XXXX" */
export const sanitizeAadhaar = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

/** PAN: uppercase letters and digits only, max 10 (e.g. ABCDE1234F) */
export const sanitizePAN = (v: string) =>
  v
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 10);

/** GSTIN: uppercase alphanumeric, max 15 */
export const sanitizeGSTIN = (v: string) =>
  v
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 15);

/** License / ID numbers: alphanumeric + hyphens, max 25 */
export const sanitizeAlphanumericId = (v: string) => v.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 25);

/** Blood pressure: digits and "/" only (e.g. 120/80) */
export const sanitizeBP = (v: string) => v.replace(/[^0-9/]/g, '').slice(0, 7);

/** Decimal numbers: digits and single "." only (e.g. 98.6, 72.5) */
export const sanitizeDecimal = (v: string) => {
  const cleaned = v.replace(/[^0-9.]/g, '');
  // Allow only one decimal point
  const parts = cleaned.split('.');
  return parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
};

/** Positive integer (age, pulse, SpO2, sugar etc.) — digits only, no leading zeros */
export const sanitizePositiveInt = (v: string) => v.replace(/\D/g, '');

/** Clinic name / hospital name: letters, digits, spaces, &, -, . */
export const sanitizeOrgName = (v: string) => v.replace(/[^a-zA-Z0-9\s\-&'.]/g, '');
