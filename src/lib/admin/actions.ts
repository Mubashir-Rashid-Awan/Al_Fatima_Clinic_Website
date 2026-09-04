"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentStatus, Doctor, Service } from "@/types/database.types";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }
  return supabase;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function upsertDoctor(
  doctor: Partial<Doctor> & { full_name: string; slug: string; specialty: string },
  serviceIds: string[] = []
) {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("doctors").upsert(doctor).select("id").single();
  if (error) return { success: false, error: error.message };

  const { error: deleteServicesError } = await supabase
    .from("doctor_services")
    .delete()
    .eq("doctor_id", data.id);
  if (deleteServicesError) return { success: false, error: deleteServicesError.message };

  if (serviceIds.length > 0) {
    const { error: insertServicesError } = await supabase.from("doctor_services").insert(
      serviceIds.map((serviceId) => ({ doctor_id: data.id, service_id: serviceId }))
    );
    if (insertServicesError) return { success: false, error: insertServicesError.message };
  }

  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function deleteDoctor(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("doctors").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function toggleDoctorActive(id: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("doctors").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/doctors");
  revalidatePath("/doctors");
  return { success: true };
}

export async function upsertService(service: Partial<Service> & { name: string; slug: string; short_description: string }) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("services").upsert(service);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function deleteService(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: true };
}

export async function markMessageRead(id: string, isRead: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("contact_messages").update({ is_read: isRead }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/messages");
  return { success: true };
}
