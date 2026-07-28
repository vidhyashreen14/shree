import { z } from "zod";

// ─── Sanitization Utilities ───────────────────────────────────────────────────

/**
 * Strips HTML tags, prevents script injection, and removes multiple spaces.
 */
export const sanitizeText = (val: string) => {
  if (!val) return val;
  return val
    .replace(/<[^>]*>?/gm, "") // Remove HTML tags
    .replace(/script|javascript|eval|on\w+/gi, "") // Basic XSS mitigation
    .replace(/\s{2,}/g, " ") // Remove consecutive spaces
    .trim();
};

/**
 * Higher-order utility to create a sanitizer that only allows specific characters
 * to be typed in an input field (used for onChange events).
 */
export const allowOnly = (allowedPattern: RegExp) => (val: string) => {
  // Strip out anything that doesn't match the allowed pattern globally
  const matches = val.match(allowedPattern);
  return matches ? matches.join("") : "";
};

// Character blockers for onChange handlers
export const allowOnlyAlphabetsAndSpaces = allowOnly(/[a-zA-Z\s]/g);
export const allowOnlyNumbers = allowOnly(/[0-9]/g);
export const allowOnlyHospitalNameChars = allowOnly(/[a-zA-Z0-9\s.,\-&()]/g);
export const allowOnlyAddressChars = allowOnly(/[a-zA-Z0-9\s.,\-/#()]/g);
export const allowOnlyTestNameChars = allowOnly(/[a-zA-Z0-9\s\-/&()]/g);
export const allowOnlyResultChars = allowOnly(/[a-zA-Z0-9\s.,\-+%]/g); // Numbers, decimals, basic units
export const allowOnlyReferenceChars = allowOnly(/[0-9\s.,\-/<>&]/g);

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const noEmojiRegex =
  /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)*[^\p{Emoji_Presentation}\p{Emoji}\uFE0F]*$/u;

const baseString = z.string().trim();
const refineString = (schema: z.ZodString) =>
  schema
    .refine((val) => !/(<script|javascript:|on\w+\s*=)/i.test(val), "Script injection detected")
    .refine((val) => !/\s{2,}/.test(val), "Multiple consecutive spaces are not allowed");

export const patientNameSchema = refineString(
  baseString
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Patient name should contain only alphabets.")
);

export const doctorNameSchema = refineString(
  baseString
    .max(100, "Doctor name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s]*$/, "Only alphabets and spaces allowed")
)
  .optional()
  .or(z.literal(""));

export const hospitalNameSchema = refineString(
  baseString
    .max(150, "Hospital name cannot exceed 150 characters")
    .regex(/^[a-zA-Z0-9\s.,\-&()]*$/, "Invalid characters in hospital name")
);

export const mobileSchema = refineString(
  baseString.regex(/^\d{10}$/, "Enter a valid 10-digit mobile number.")
);

export const alternateMobileSchema = refineString(
  baseString.regex(/^\d{10}$/, "Mobile number must be exactly 10 digits")
)
  .optional()
  .or(z.literal(""));

export const emailSchema = refineString(
  baseString.email("Enter a valid email address.").max(100, "Email cannot exceed 100 characters")
)
  .optional()
  .or(z.literal(""));

export const labIdSchema = refineString(
  baseString
    .max(20, "Lab ID / Specimen ID cannot exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9\-]+$/,
      "Lab ID / Specimen ID can only contain alphanumeric characters and hyphens"
    )
)
  .optional()
  .or(z.literal(""));

export const ageSchema = z.coerce
  .number({ invalid_type_error: "Age must be a number" })
  .int("Age must be a whole number")
  .min(0, "Age cannot be negative")
  .max(120, "Age cannot exceed 120");

export const genderSchema = z.enum(["Male", "Female", "Other", ""], {
  errorMap: () => ({ message: "Please select a valid gender" }),
});

export const aadhaarSchema = refineString(
  baseString.regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits")
)
  .optional()
  .or(z.literal(""));

export const pinCodeSchema = refineString(
  baseString.regex(/^\d{6}$/, "PIN code must be exactly 6 digits")
)
  .optional()
  .or(z.literal(""));

export const addressSchema = refineString(
  baseString
    .max(250, "Address cannot exceed 250 characters")
    .regex(/^[a-zA-Z0-9\s.,\-/#()]*$/, "Invalid characters in address")
)
  .optional()
  .or(z.literal(""));

export const testNameSchema = refineString(
  baseString
    .min(1, "Test name is required")
    .max(100, "Test name cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-/&()]+$/, "Invalid characters in test name")
);

export const resultValueSchema = refineString(
  baseString
    .min(1, "Result cannot be empty")
    .regex(/^[a-zA-Z0-9\s.,\-+%]+$/, "Invalid characters in result")
);

export const referenceRangeSchema = refineString(
  baseString.regex(/^[0-9\s.,\-/<>&]*$/, "Invalid characters in reference range")
)
  .optional()
  .or(z.literal(""));

export const remarksSchema = refineString(
  baseString.max(500, "Remarks cannot exceed 500 characters")
)
  .optional()
  .or(z.literal(""));

export const pastDateSchema = z.date().refine((date) => date <= new Date(), {
  message: "Future dates are not allowed",
});

export const anyDateSchema = z.date();
