import { Resend } from "resend";

interface ConfirmationEmailParams {
  to: string;
  patientFirstName: string;
  doctorName: string;
  serviceName: string;
  date: string; // human-readable, e.g. "Thursday, August 20, 2026"
  time: string; // e.g. "10:00 AM"
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
}

/**
 * Sends a real appointment confirmation email via Resend.
 * Returns { sent: false, reason } instead of throwing when RESEND_API_KEY
 * is not configured yet, so the booking flow itself never breaks —
 * the appointment is still saved to the database either way.
 */
export async function sendConfirmationEmail(params: ConfirmationEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set — skipping confirmation email.");
    return { sent: false, reason: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(apiKey);

  const html = renderConfirmationHtml(params);

  try {
    const { data, error } = await resend.emails.send({
      from: `${params.clinicName} <${fromEmail}>`,
      to: [params.to],
      subject: `Appointment Confirmed — ${params.date} at ${params.time}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { sent: false, reason: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    return { sent: false, reason: "unexpected_error" };
  }
}

function renderConfirmationHtml(params: ConfirmationEmailParams): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <div style="background-color: #0f766e; padding: 24px; border-radius: 8px 8px 0 0;">
      <h1 style="color: #ffffff; font-size: 20px; margin: 0;">${escapeHtml(params.clinicName)}</h1>
    </div>
    <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
      <h2 style="font-size: 18px; margin-top: 0;">Your appointment is confirmed</h2>
      <p>Hi ${escapeHtml(params.patientFirstName)},</p>
      <p>Thank you for booking with us. Here are your appointment details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Doctor</td>
          <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(params.doctorName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Service</td>
          <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(params.serviceName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Date</td>
          <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(params.date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Time</td>
          <td style="padding: 8px 0; font-weight: bold;">${escapeHtml(params.time)}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 14px;">
        Location: ${escapeHtml(params.clinicAddress)}<br />
        Questions? Call us at ${escapeHtml(params.clinicPhone)}
      </p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
        If you need to reschedule or cancel, please contact the clinic directly.
      </p>
    </div>
  </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
