import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getServices } from "@/lib/data";
import { ServiceIcon } from "@/components/site/service-icon";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore the full range of medical services we offer, from general consultations to specialized cardiology, dental, pediatric, and dermatology care.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every service is delivered by experienced, credentialed doctors and backed by a
          booking system that shows only real, available time slots.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {services.map((service) => (
          <Card key={service.id} id={service.slug} className="scroll-mt-24">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ServiceIcon iconName={service.icon} className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {service.full_description ?? service.short_description}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> ~{service.duration_minutes} min
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/booking?service=${service.slug}`}>
                      Book This Service <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <p className="mt-14 text-center text-muted-foreground">
          Services will appear here once your Supabase database is connected. See
          supabase/schema.sql for the seed data.
        </p>
      )}
    </div>
  );
}
