import Link from "next/link";
import { CheckCircle2, Mail, MailWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doctor, Service } from "@/types/database.types";

interface Props {
  doctor: Doctor;
  service: Service;
  date: string;
  time: string;
  patientEmail: string;
  emailSent: boolean;
}

export function StepConfirmation({ doctor, service, date, time, patientEmail, emailSent }: Props) {
  const readableDate = new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const readableTime = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="flex flex-col items-center py-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-9 w-9" />
      </span>
      <h2 className="mt-5 text-2xl font-bold">Appointment Confirmed</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Your appointment has been booked successfully. We look forward to seeing you.
      </p>

      <Card className="mt-8 w-full max-w-sm border-none bg-secondary/50">
        <CardContent className="space-y-2 py-5 text-left text-sm">
          <p><span className="text-muted-foreground">Doctor:</span> {doctor.full_name}</p>
          <p><span className="text-muted-foreground">Service:</span> {service.name}</p>
          <p><span className="text-muted-foreground">Date:</span> {readableDate}</p>
          <p><span className="text-muted-foreground">Time:</span> {readableTime}</p>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        {emailSent ? (
          <>
            <Mail className="h-4 w-4" /> A confirmation email was sent to {patientEmail}
          </>
        ) : (
          <>
            <MailWarning className="h-4 w-4" /> Your appointment is saved. Email confirmation is pending setup.
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild>
          <Link href="/booking">Book Another Appointment</Link>
        </Button>
      </div>
    </div>
  );
}
