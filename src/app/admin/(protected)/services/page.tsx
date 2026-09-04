import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ServicesTable } from "@/components/admin/services-table";
import { ServiceFormDialog } from "@/components/admin/service-form-dialog";
import type { Service } from "@/types/database.types";

async function getAllServices(): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").order("display_order");
  if (error) {
    console.error("Failed to load services:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function AdminServicesPage() {
  const services = await getAllServices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the services shown on the public site.</p>
        </div>
        <ServiceFormDialog trigger={<Button>Add Service</Button>} />
      </div>

      <div className="mt-8">
        <ServicesTable services={services} />
      </div>
    </div>
  );
}
