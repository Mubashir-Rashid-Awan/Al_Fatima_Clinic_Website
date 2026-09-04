"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { patientDetailsSchema, type PatientDetailsInput } from "@/lib/validations/booking";
import type { Doctor, Service } from "@/types/database.types";

interface Props {
  doctor: Doctor;
  service: Service;
  date: string;
  time: string;
  defaultValues: Partial<PatientDetailsInput>;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (data: PatientDetailsInput) => void;
}

export function StepDetails({ doctor, service, date, time, defaultValues, submitting, onBack, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientDetailsInput>({
    resolver: zodResolver(patientDetailsSchema),
    defaultValues,
  });

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
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">4. Your details</h2>

      <Card className="border-none bg-secondary/50">
        <CardContent className="grid grid-cols-1 gap-2 py-4 text-sm sm:grid-cols-2">
          <p><span className="text-muted-foreground">Doctor:</span> {doctor.full_name}</p>
          <p><span className="text-muted-foreground">Service:</span> {service.name}</p>
          <p><span className="text-muted-foreground">Date:</span> {readableDate}</p>
          <p><span className="text-muted-foreground">Time:</span> {readableTime}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="patient_first_name">First name</Label>
            <Input id="patient_first_name" {...register("patient_first_name")} placeholder="Ahmed" />
            {errors.patient_first_name && (
              <p className="text-xs text-destructive">{errors.patient_first_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patient_last_name">Last name</Label>
            <Input id="patient_last_name" {...register("patient_last_name")} placeholder="Khan" />
            {errors.patient_last_name && (
              <p className="text-xs text-destructive">{errors.patient_last_name.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="patient_email">Email</Label>
            <Input id="patient_email" type="email" {...register("patient_email")} placeholder="you@example.com" />
            {errors.patient_email && (
              <p className="text-xs text-destructive">{errors.patient_email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="patient_phone">Phone number</Label>
            <Input id="patient_phone" type="tel" {...register("patient_phone")} placeholder="+92 300 1234567" />
            {errors.patient_phone && (
              <p className="text-xs text-destructive">{errors.patient_phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="patient_notes">Notes for the doctor (optional)</Label>
          <Textarea
            id="patient_notes"
            {...register("patient_notes")}
            placeholder="Briefly describe your symptoms or reason for visit"
            rows={3}
          />
          {errors.patient_notes && (
            <p className="text-xs text-destructive">{errors.patient_notes.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-6">
          <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
            Back
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Confirming..." : "Confirm Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
