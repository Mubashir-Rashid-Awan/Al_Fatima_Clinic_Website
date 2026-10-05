import type { Metadata } from "next";
import Link from "next/link";
import { Award, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClinicSettings, getDoctors } from "@/lib/data";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our clinic's mission, values, and the experienced team behind the care we provide.",
};

export default async function AboutPage() {
  const [settings, doctors] = await Promise.all([getClinicSettings(), getDoctors()]);

  const values = [
    {
      icon: HeartHandshake,
      title: "Patient-First Care",
      description: "Every decision starts with what is best for the person in front of us, not what is fastest or most convenient for us.",
    },
    {
      icon: ShieldCheck,
      title: "Evidence-Based Medicine",
      description: "Our doctors follow current clinical guidelines and continue their education year-round.",
    },
    {
      icon: Award,
      title: "Qualified Specialists",
      description: "Every doctor on our team is credentialed, experienced, and vetted before joining the clinic.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: `We've treated over ${(settings.patients_treated / 1000).toFixed(0)},000 patients and counting, many of whom return for years of ongoing care.`,
    },
  ];

  return (
    <div>
      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight">About {settings.clinic_name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            For {settings.years_experience} years, we have combined modern medicine with genuine,
            unhurried care, one patient at a time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-3xl font-bold">Our Story</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {settings.clinic_name} was founded on a simple idea: that quality healthcare
              should be accessible, transparent, and delivered without unnecessary friction.
              What began as a small general practice has grown into a multi-specialty clinic,
              while keeping the same attentive, personal approach we started with.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Today, our team of {Math.max(doctors.length, 4)}+ specialists sees patients across
              general medicine, dentistry, cardiology, pediatrics, dermatology, and physiotherapy,
              all supported by a booking system designed to respect your time as much as we
              respect your health.
            </p>
          </div>
          <div
            role="img"
            aria-label="Doctor consulting with a patient at Al Fatima Clinic"
            className="aspect-square rounded-2xl bg-cover bg-center shadow-inner"
            style={{ backgroundImage: "url('/aboutus.png')" }}
          />
        </div>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold">What We Stand For</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <value.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{value.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Come see us</h2>
        <p className="mt-3 text-muted-foreground">
          Book an appointment online or reach out with any questions first.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/booking">Book an Appointment</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
