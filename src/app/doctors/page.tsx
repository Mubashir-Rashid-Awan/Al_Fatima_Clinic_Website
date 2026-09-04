import type { Metadata } from "next";
import Link from "next/link";
import { Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDoctors } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Doctors",
  description:
    "Meet our team of experienced, board-certified doctors across general medicine, cardiology, dentistry, pediatrics, and more.",
};

export default async function DoctorsPage() {
  const doctors = await getDoctors();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Our Doctors</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A team chosen for clinical excellence and a genuine ability to put patients at
          ease.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden">
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/10 to-accent">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-2xl font-semibold text-primary">
                {doctor.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
            <CardContent>
              <h2 className="font-semibold">{doctor.full_name}</h2>
              <p className="text-sm text-primary">{doctor.specialty}</p>
              {doctor.qualifications && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Award className="h-3.5 w-3.5" /> {doctor.qualifications}
                </p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {doctor.years_experience} years of experience
              </p>
              {doctor.bio && (
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{doctor.bio}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/doctors/${doctor.slug}`}>
                    View Profile <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/booking?doctor=${doctor.slug}`}>Book Now</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {doctors.length === 0 && (
        <p className="mt-14 text-center text-muted-foreground">
          Doctors will appear here once your Supabase database is connected. See
          supabase/schema.sql for the seed data.
        </p>
      )}
    </div>
  );
}
