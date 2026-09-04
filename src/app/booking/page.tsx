import type { Metadata } from "next";
import { getDoctors, getServices } from "@/lib/data";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Book an appointment online in under two minutes. Choose your doctor, pick a time, and get instant confirmation.",
};

interface PageProps {
  searchParams: Promise<{ doctor?: string; service?: string }>;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Book an Appointment</h1>
        <p className="mt-3 text-muted-foreground">
          Four quick steps to a confirmed appointment.
        </p>
      </div>

      <BookingFlow
        doctors={doctors}
        services={services}
        preselectedDoctorSlug={params.doctor}
        preselectedServiceSlug={params.service}
      />
    </div>
  );
}
