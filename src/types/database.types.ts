// Hand-written types mirroring supabase/schema.sql.
// Once your Supabase project is live, you can optionally replace this file
// with an auto-generated one by running:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
// The shapes below already match the schema exactly, so the app works either way.

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Service = {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string | null;
  duration_minutes: number;
  icon: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type Doctor = {
  id: string;
  full_name: string;
  slug: string;
  specialty: string;
  qualifications: string | null;
  years_experience: number;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type DoctorService = {
  doctor_id: string;
  service_id: string;
}

export type DoctorAvailability = {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  start_time: string; // "09:00:00"
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export type DoctorTimeOff = {
  id: string;
  doctor_id: string;
  off_date: string; // "2026-08-20"
  reason: string | null;
  created_at: string;
}

export type Appointment = {
  id: string;
  doctor_id: string;
  service_id: string;
  appointment_date: string; // "2026-08-20"
  start_time: string; // "09:30:00"
  end_time: string;
  status: AppointmentStatus;
  patient_first_name: string;
  patient_last_name: string;
  patient_email: string;
  patient_phone: string;
  patient_notes: string | null;
  confirmation_email_sent: boolean;
  created_at: string;
  updated_at: string;
}

export type Testimonial = {
  id: string;
  patient_name: string;
  rating: number;
  quote: string;
  doctor_id: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
}

export type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export type ClinicSettings = {
  id: number;
  clinic_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: {
    mon_fri: string;
    sat: string;
    sun: string;
  };
  whatsapp_number: string;
  years_experience: number;
  patients_treated: number;
}

// Convenience joined types used by the UI
export type DoctorWithServices = Doctor & {
  services: Service[];
}

export type AppointmentWithDetails = Appointment & {
  doctor: Pick<Doctor, "id" | "full_name" | "specialty" | "photo_url">;
  service: Pick<Service, "id" | "name" | "duration_minutes">;
}

// Each table entry must match postgrest-js's GenericTable shape:
// { Row, Insert, Update, Relationships }. The schema must also declare
// Views and Functions (empty here) or the client infers `never` everywhere.
type TableDef<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      services: TableDef<Service>;
      doctors: TableDef<Doctor>;
      doctor_services: TableDef<DoctorService>;
      doctor_availability: TableDef<DoctorAvailability>;
      doctor_time_off: TableDef<DoctorTimeOff>;
      appointments: TableDef<Appointment>;
      testimonials: TableDef<Testimonial>;
      contact_messages: TableDef<ContactMessage>;
      clinic_settings: TableDef<ClinicSettings>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      appointment_status: AppointmentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
