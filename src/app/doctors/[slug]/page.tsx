import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDoctorBySlug } from "@/lib/data";
import { ServiceIcon } from "@/components/site/service-icon";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);
  if (!doctor) return { title: "Doctor Not Found" };
  return {
    title: `${doctor.full_name} — ${doctor.specialty}`,
    description: doctor.bio ?? `Book an appointment with ${doctor.full_name}, ${doctor.specialty}.`,
  };
}

export default async function DoctorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const doctor = await getDoctorBySlug(slug);

  if (!doctor) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent">
            <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/15 text-4xl font-semibold text-primary">
              {doctor.full_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href={`/booking?doctor=${doctor.slug}`}>
              Book with {doctor.full_name.split(" ")[1] ?? "this doctor"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold">{doctor.full_name}</h1>
          <p className="mt-1 text-lg text-primary">{doctor.specialty}</p>

          <div className="mt-4 space-y-2">
            {doctor.qualifications && (
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <Award className="h-4 w-4" /> {doctor.qualifications}
              </p>
            )}
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> {doctor.years_experience} years of experience
            </p>
          </div>

          {doctor.bio && (
            <p className="mt-6 text-justify leading-relaxed text-muted-foreground">
              {doctor.bio}
            </p>
          )}

          {doctor.services.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold">Services Offered</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {doctor.services.map((s) => (
                  <Badge key={s.id} variant="secondary" className="gap-1.5 py-1.5">
                    <ServiceIcon iconName={s.icon} className="h-3.5 w-3.5" />
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Card className="mt-8">
            <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Ready to book?</p>
                <p className="text-sm text-muted-foreground">
                  Check real-time availability and confirm instantly.
                </p>
              </div>
              <Button asChild>
                <Link href={`/booking?doctor=${doctor.slug}`}>Check Availability</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
