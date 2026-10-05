import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getClinicSettings, getDoctors, getServices, getTestimonials } from "@/lib/data";
import { ServiceIcon } from "@/components/site/service-icon";

export default async function HomePage() {
  const [settings, services, doctors, testimonials] = await Promise.all([
    getClinicSettings(),
    getServices(),
    getDoctors(),
    getTestimonials(),
  ]);
  const listedDoctorNameParts = new Set(
    doctors.flatMap((doctor) => doctor.full_name.toLowerCase().split(/\W+/))
  );
  const visibleTestimonials = testimonials.filter((testimonial) =>
    [...testimonial.quote.matchAll(/\bDr\.?\s+([a-z]+)/gi)].every(([, name]) =>
      listedDoctorNameParts.has(name.toLowerCase())
    )
  );
  const additionalTestimonials = [
    {
      id: "patient-review-umer-farooq",
      rating: 5,
      quote:
        "Dr. Abdul Ghulam Fareed took time to understand my concerns and explained my check-up clearly. I left knowing what to do next.",
      patient_name: "Umer Farooq",
    },
    {
      id: "patient-review-moin-ud-din",
      rating: 5,
      quote:
        "Dr. Usama Shah was patient and thorough, and answered all my questions in a way I could understand.",
      patient_name: "Moin ud din",
    },
  ];
  const displayedTestimonials = [
    ...visibleTestimonials,
    ...additionalTestimonials.slice(0, Math.max(0, 3 - visibleTestimonials.length)),
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <MapPin className="h-4 w-4" /> G-6 Markaz, Islamabad
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              {settings.tagline}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Book a visit with our experienced doctors in under two minutes. Real-time
              availability, instant confirmation, no phone calls required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="text-base">
                <Link href="/booking">
                  Book Appointment <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base">
                <Link href="/doctors">Meet Our Doctors</Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t pt-8">
              <div>
                <dt className="sr-only">Years of experience</dt>
                <dd className="text-2xl font-bold text-primary">{settings.years_experience}+</dd>
                <p className="text-sm text-muted-foreground">Years of care</p>
              </div>
              <div>
                <dt className="sr-only">Patients treated</dt>
                <dd className="text-2xl font-bold text-primary">
                  {(settings.patients_treated / 1000).toFixed(0)}k+
                </dd>
                <p className="text-sm text-muted-foreground">Patients treated</p>
              </div>
              <div>
                <dt className="sr-only">Specialist doctors</dt>
                <dd className="text-2xl font-bold text-primary">{Math.max(doctors.length, 4)}+</dd>
                <p className="text-sm text-muted-foreground">Specialist doctors</p>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div
              role="img"
              aria-label="Modern clinic interior"
              className="aspect-[4/3] w-full rounded-2xl bg-cover bg-center shadow-inner"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(8, 55, 52, 0.04), rgba(8, 55, 52, 0.2)), url('/clinic-hero.png')",
              }}
            />
            <Card className="absolute -bottom-6 left-1/2 w-[85%] -translate-x-1/2 border-none shadow-xl sm:w-4/5">
              <CardContent className="flex items-center gap-4 py-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium">Next available slot</p>
                  <p className="text-sm text-muted-foreground">Often within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SERVICES OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Our Services</h2>
          <p className="mt-3 text-muted-foreground">
            Comprehensive care across the specialties patients need most, delivered by
            experienced, board-certified doctors.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service) => (
            <Card key={service.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ServiceIcon iconName={service.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{service.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{service.short_description}</p>
                <Link
                  href={`/services#${service.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>
      </section>

      {/* DOCTOR HIGHLIGHTS */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">Meet Our Doctors</h2>
            <p className="mt-3 text-muted-foreground">
              Every doctor on our team is vetted for both clinical expertise and genuine
              bedside manner.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((doctor) => (
              <Card key={doctor.id} className="h-full overflow-hidden text-center">
                <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                  {doctor.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <CardContent className="flex flex-1 flex-col">
                  <h3 className="font-semibold">{doctor.full_name}</h3>
                  <p className="text-sm text-primary">{doctor.specialty}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {doctor.years_experience} years experience
                  </p>
                  <div className="mt-auto pt-4">
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/booking?doctor=${doctor.slug}`}>Book with {doctor.full_name.split(" ")[1] ?? "Doctor"}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {displayedTestimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">What Our Patients Say</h2>
            <p className="mt-3 text-muted-foreground">
              Feedback from patients about their visits and care.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTestimonials.map((t) => (
              <Card key={t.id}>
                <CardContent className="pt-2">
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < t.rating ? "fill-primary text-primary" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4" /> {t.patient_name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA STRIP */}
      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to see a doctor?</h2>
          <p className="max-w-xl text-primary-foreground/85">
            Choose your doctor, pick a time that works for you, and get an instant
            confirmation. No waiting on hold.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-base">
            <Link href="/booking">
              Book Your Appointment <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
