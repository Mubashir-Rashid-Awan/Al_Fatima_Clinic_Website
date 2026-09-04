import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { DoctorsTable } from "@/components/admin/doctors-table";
import { DoctorFormDialog } from "@/components/admin/doctor-form-dialog";
import type { Doctor, Service } from "@/types/database.types";

type DoctorWithServiceIds = Doctor & { serviceIds: string[] };

async function getDoctorData(): Promise<{ doctors: DoctorWithServiceIds[]; services: Service[] }> {
  const supabase = await createClient();
  const [{ data: doctors, error: doctorsError }, { data: services, error: servicesError }] = await Promise.all([
    supabase.from("doctors").select("*").order("display_order"),
    supabase.from("services").select("*").order("display_order"),
  ]);
  if (doctorsError || servicesError) {
    console.error("Failed to load doctor data:", doctorsError?.message ?? servicesError?.message);
    return { doctors: [], services: [] };
  }

  const { data: links, error: linksError } = await supabase.from("doctor_services").select("doctor_id, service_id");
  if (linksError) {
    console.error("Failed to load doctor services:", linksError.message);
    return {
      doctors: (doctors ?? []).map((doctor) => ({ ...doctor, serviceIds: [] })),
      services: services ?? [],
    };
  }

  const serviceIdsByDoctor = new Map<string, string[]>();
  for (const link of links ?? []) {
    const serviceIds = serviceIdsByDoctor.get(link.doctor_id) ?? [];
    serviceIds.push(link.service_id);
    serviceIdsByDoctor.set(link.doctor_id, serviceIds);
  }

  return {
    doctors: (doctors ?? []).map((doctor) => ({ ...doctor, serviceIds: serviceIdsByDoctor.get(doctor.id) ?? [] })),
    services: services ?? [],
  };
}

export default async function AdminDoctorsPage() {
  const { doctors, services } = await getDoctorData();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Doctors</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the doctors shown on the public site.</p>
        </div>
        <DoctorFormDialog trigger={<Button>Add Doctor</Button>} services={services} />
      </div>

      <div className="mt-8">
        <DoctorsTable doctors={doctors} services={services} />
      </div>
    </div>
  );
}
