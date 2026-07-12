import { z } from "zod";
import { SPECIES } from "@/lib/constants";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name"),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["CLIENT", "VET"]),
    // Only used when role === "VET":
    clinicName: z.string().trim().optional(),
    city: z.string().trim().optional(),
  })
  .refine((d) => d.role !== "VET" || (d.clinicName && d.clinicName.length >= 2), {
    message: "Clinic name is required",
    path: ["clinicName"],
  })
  .refine((d) => d.role !== "VET" || (d.city && d.city.length >= 2), {
    message: "City is required",
    path: ["city"],
  });

export const petSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  species: z.enum(SPECIES),
  breed: z.string().trim().optional(),
  birthdate: z.string().optional(),
  notes: z.string().trim().optional(),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  description: z.string().trim().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  durationMin: z.coerce.number().int().min(10).max(480),
});

export const staffSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  specialties: z.string().trim().optional(),
  bio: z.string().trim().optional(),
});

export const availabilitySchema = z.object({
  vetId: z.string().min(1),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export const clinicProfileSchema = z.object({
  name: z.string().trim().min(2),
  city: z.string().trim().min(2),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const bookingSchema = z.object({
  clinicId: z.string().min(1),
  serviceId: z.string().min(1),
  vetId: z.string().min(1),
  petId: z.string().min(1),
  startAt: z.string().min(1), // ISO datetime
  notes: z.string().trim().optional(),
});

export const reviewSchema = z.object({
  appointmentId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().optional(),
});

export const messageSchema = z.object({
  clinicId: z.string().min(1),
  body: z.string().trim().min(1, "Message can't be empty"),
});
