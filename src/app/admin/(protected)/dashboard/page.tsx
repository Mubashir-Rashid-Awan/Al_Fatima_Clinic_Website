import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentsTable } from "@/components/admin/appointments-table";
import type { AppointmentWithDetails } from "@/types/database.types";

async function getAppointments(): Promise<AppointmentWithDetails[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `*, doctor:doctors(id, full_name, specialty, photo_url), service:services(id, name, duration_minutes)`
    )
    .order("appointment_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Failed to load appointments:", error.message);
    return [];
  }
  return (data as unknown as AppointmentWithDetails[]) ?? [];
}

export default async function AdminDashboardPage() {
  const appointments = await getAppointments();

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = appointments.filter((a) => a.appointment_date === today).length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const upcomingCount = appointments.filter(
    (a) => a.appointment_date >= today && a.status !== "cancelled" && a.status !== "completed"
  ).length;

  return (
    <div>
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        View, confirm, and manage every appointment booked through the site.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="py-5"><p className="text-sm text-muted-foreground">Today</p><p className="mt-1 text-2xl font-bold">{todayCount}</p></CardContent></Card>
        <Card><CardContent className="py-5"><p className="text-sm text-muted-foreground">Pending Confirmation</p><p className="mt-1 text-2xl font-bold">{pendingCount}</p></CardContent></Card>
        <Card><CardContent className="py-5"><p className="text-sm text-muted-foreground">Upcoming</p><p className="mt-1 text-2xl font-bold">{upcomingCount}</p></CardContent></Card>
      </div>

      <div className="mt-8">
        <AppointmentsTable appointments={appointments} />
      </div>
    </div>
  );
}
