// Shared enum-like constants. SQLite has no native enums, so these string unions
// are the single source of truth used across validation, UI, and the seed.

export const ROLES = ["CLIENT", "VET", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  COMPLETED: "bg-sky-100 text-sky-800 ring-sky-200",
  CANCELLED: "bg-rose-100 text-rose-700 ring-rose-200",
};

export const SPECIES = [
  "Dog",
  "Cat",
  "Bird",
  "Rabbit",
  "Reptile",
  "Other",
] as const;
export type Species = (typeof SPECIES)[number];

export const SPECIES_EMOJI: Record<string, string> = {
  Dog: "🐕",
  Cat: "🐈",
  Bird: "🐦",
  Rabbit: "🐇",
  Reptile: "🦎",
  Other: "🐾",
};

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
