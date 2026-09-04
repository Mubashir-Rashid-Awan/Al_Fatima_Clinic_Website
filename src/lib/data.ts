import { createClient } from "@/lib/supabase/server";
import type { ClinicSettings, Doctor, DoctorWithServices, Service, Testimonial } from "@/types/database.types";

// Every function here is defensive on purpose: if Supabase env vars are not
// yet configured (e.g. during initial setup or a build without secrets),
// these fall back to an empty result instead of throwing, so the site keeps
// rendering. Once real credentials are added, real data flows through
// automatically — nothing else needs to change.

export async function getServices(): Promise<Service[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("getServices error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("getServices: Supabase not configured yet.", err);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getDoctors(): Promise<Doctor[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("getDoctors error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("getDoctors: Supabase not configured yet.", err);
    return [];
  }
}

export async function getDoctorBySlug(slug: string): Promise<DoctorWithServices | null> {
  try {
    const supabase = await createClient();
    const { data: doctor, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !doctor) return null;

    const { data: links } = await supabase
      .from("doctor_services")
      .select("service_id")
      .eq("doctor_id", doctor.id);

    if (!links || links.length === 0) {
      return { ...doctor, services: [] };
    }

    const serviceIds = links.map((l) => l.service_id);
    const { data: services } = await supabase
      .from("services")
      .select("*")
      .in("id", serviceIds)
      .eq("is_active", true);

    return { ...doctor, services: services ?? [] };
  } catch {
    return null;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("getTestimonials error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.warn("getTestimonials: Supabase not configured yet.", err);
    return [];
  }
}

const DEFAULT_SETTINGS: ClinicSettings = {
  id: 1,
  clinic_name: "Al Fatima Clinic",
  tagline: "Compassionate Care, Modern Medicine",
  phone: "+92 336 2824124",
  email: "info@alfatimaclinic.example",
  address: "Ground Floor, Melody Market, Islamabad Medical and Surgical Centre, G-6 Markaz G 6 Markaz G-6, Islamabad, 44000, Pakistan",
  latitude: 33.7163960560463,
  longitude: 73.08473785975016,
  opening_hours: { mon_fri: "9:00 AM - 9:00 PM", sat: "10:00 AM - 6:00 PM", sun: "Closed" },
  whatsapp_number: "923362824124",
  years_experience: 51,
  patients_treated: 20000,
};

export async function getClinicSettings(): Promise<ClinicSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("clinic_settings").select("*").eq("id", 1).single();
    if (error || !data) return DEFAULT_SETTINGS;
    if (data.clinic_name === "Wellness Point Clinic") {
      return { ...data, clinic_name: "Al Fatima Clinic" };
    }
    return data;
  } catch {
    // Supabase not configured yet — fall back to sensible placeholder
    // content so the site still renders during initial setup.
    return DEFAULT_SETTINGS;
  }
}
