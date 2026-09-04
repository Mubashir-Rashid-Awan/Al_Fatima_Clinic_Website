"use server";

import { createClient } from "@/lib/supabase/server";
import { sendConfirmationEmail } from "@/lib/email/send-confirmation";
import { bookingSchema, contactSchema, type BookingInput, type ContactInput } from "@/lib/validations/booking";
import { getAvailableSlots } from "@/lib/booking/slots";

export interface BookAppointmentResult {
  success: boolean;
  error?: string;
  appointmentId?: string;
  emailSent?: boolean;
}

export async function bookAppointment(input: BookingInput): Promise<BookAppointmentResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const supabase = await createClient();

  // Re-check availability right before writing, closing the race-condition
  // window where two people could grab the same slot within seconds of
  // each other. The unique_doctor_slot constraint in the schema is the
  // final safety net if this check and the insert still race.
  const slots = await getAvailableSlots(data.doctor_id, data.appointment_date);
  const requestedSlot = slots.find((s) => s.start_time === data.start_time.slice(0, 5));

  if (!requestedSlot || !requestedSlot.available) {
    return { success: false, error: "That time slot is no longer available. Please choose another." };
  }

  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      doctor_id: data.doctor_id,
      service_id: data.service_id,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      end_time: data.end_time,
      status: "pending",
      patient_first_name: data.patient_first_name,
      patient_last_name: data.patient_last_name,
      patient_email: data.patient_email,
      patient_phone: data.patient_phone,
      patient_notes: data.patient_notes || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      // unique_doctor_slot violation — someone else booked it milliseconds earlier
      return { success: false, error: "That time slot was just booked by someone else. Please choose another." };
    }
    console.error("bookAppointment insert error:", error.message);
    return { success: false, error: "Something went wrong while saving your appointment. Please try again." };
  }

  // Fetch doctor/service names for the email, then send it.
  // Email failure never fails the booking — the appointment is already saved.
  const [{ data: doctor }, { data: service }, { data: settings }] = await Promise.all([
    supabase.from("doctors").select("full_name").eq("id", data.doctor_id).single(),
    supabase.from("services").select("name").eq("id", data.service_id).single(),
    supabase.from("clinic_settings").select("*").eq("id", 1).single(),
  ]);

  const readableDate = new Date(`${data.appointment_date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const readableTime = new Date(`2000-01-01T${data.start_time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const emailResult = await sendConfirmationEmail({
    to: data.patient_email,
    patientFirstName: data.patient_first_name,
    doctorName: doctor?.full_name ?? "our specialist",
    serviceName: service?.name ?? "your appointment",
    date: readableDate,
    time: readableTime,
    clinicName: settings?.clinic_name ?? "the clinic",
    clinicAddress: settings?.address ?? "",
    clinicPhone: settings?.phone ?? "",
  });

  if (emailResult.sent) {
    await supabase.from("appointments").update({ confirmation_email_sent: true }).eq("id", inserted.id);
  }

  return { success: true, appointmentId: inserted.id, emailSent: emailResult.sent };
}

export interface SubmitContactResult {
  success: boolean;
  error?: string;
}

export async function submitContactMessage(input: ContactInput): Promise<SubmitContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    subject: data.subject || null,
    message: data.message,
  });

  if (error) {
    console.error("submitContactMessage error:", error.message);
    return { success: false, error: "Something went wrong. Please try again or call us directly." };
  }

  return { success: true };
}
