import { z } from "zod";

export const patientDetailsSchema = z.object({
  patient_first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(60, "First name is too long"),
  patient_last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(60, "Last name is too long"),
  patient_email: z.string().trim().email("Enter a valid email address"),
  patient_phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  patient_notes: z.string().trim().max(500, "Notes must be under 500 characters").optional(),
});

export const bookingSchema = patientDetailsSchema.extend({
  doctor_id: z.string().uuid("Please select a doctor"),
  service_id: z.string().uuid("Please select a service"),
  appointment_date: z.string().min(1, "Please select a date"),
  start_time: z.string().min(1, "Please select a time slot"),
  end_time: z.string().min(1),
});

export type PatientDetailsInput = z.infer<typeof patientDetailsSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().trim().max(120).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be under 1000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
