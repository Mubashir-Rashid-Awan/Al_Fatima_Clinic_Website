import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
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
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl border-l-2 border-primary pl-5">
        <p className="text-sm font-semibold text-primary">Al Fatima Clinic</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Services and specialties</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Find the care you need, see how long appointments take, and book with our team.
        </p>
      </header>

      {services.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-4 md:grid-cols-2 lg:gap-x-24 lg:gap-y-8">
          {services.map((service) => (
            <article
              key={service.id}
              id={service.slug}
              className="group flex h-full scroll-mt-24 border-t border-border py-6 transition-colors hover:border-primary"
            >
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-accent">
                <ServiceIcon iconName={service.icon} className="h-5 w-5" />
              </span>
              <div className="ml-4 flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-lg font-semibold">{service.name}</h2>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {service.duration_minutes} min
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {service.full_description ?? service.short_description}
                </p>
                <Link
                  href={`/booking?service=${service.slug}`}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-semibold text-primary transition-colors hover:text-foreground"
                >
                  Book an appointment <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-10 border-t border-border py-8 text-muted-foreground">
          No services are available right now. Please contact the clinic for assistance.
        </p>
      )}

    </div>
  );
}
