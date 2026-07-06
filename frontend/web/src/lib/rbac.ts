import type { Role } from "./types";

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Administrator", description: "Full hospital access" },
  { value: "doctor", label: "Doctor", description: "Patient care & prescriptions" },
  { value: "frontdesk", label: "Front Desk", description: "Registration & appointments" },
  { value: "nurse", label: "Nurse", description: "Vitals & observations" },
  { value: "pharmacy", label: "Pharmacy", description: "Inventory & dispensing" },
  { value: "lab", label: "Laboratory", description: "Test orders & reports" },
];

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  doctor: "/doctor",
  frontdesk: "/frontdesk",
  nurse: "/nurse",
  pharmacy: "/pharmacy",
  lab: "/lab",
};

/** Route prefix → roles that may access it. */
export const ROUTE_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/doctor", roles: ["doctor", "admin"] },
  { prefix: "/frontdesk", roles: ["frontdesk", "admin"] },
  { prefix: "/nurse", roles: ["nurse", "admin"] },
  { prefix: "/pharmacy", roles: ["pharmacy", "admin"] },
  { prefix: "/lab", roles: ["lab", "admin"] },
];

export function canAccess(role: Role, pathname: string): boolean {
  const match = ROUTE_ACCESS.find((r) => pathname.startsWith(r.prefix));
  if (!match) return true; // shared routes (profile, settings, notifications)
  return match.roles.includes(role);
}
