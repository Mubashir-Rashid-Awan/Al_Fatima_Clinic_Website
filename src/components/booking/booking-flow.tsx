"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStepper } from "@/components/booking/stepper";
import { StepDoctorService } from "@/components/booking/step-doctor-service";
import { StepDateTime } from "@/components/booking/step-datetime";
import { StepDetails } from "@/components/booking/step-details";
import { StepConfirmation } from "@/components/booking/step-confirmation";
import { bookAppointment } from "@/lib/booking/actions";
import type { PatientDetailsInput } from "@/lib/validations/booking";
import type { Doctor, Service } from "@/types/database.types";

interface Props {
  doctors: Doctor[];
  services: Service[];
  preselectedDoctorSlug?: string;
  preselectedServiceSlug?: string;
}

export function BookingFlow({ doctors, services, preselectedDoctorSlug, preselectedServiceSlug }: Props) {
  const preselectedDoctor = doctors.find((d) => d.slug === preselectedDoctorSlug);
  const preselectedService = services.find((s) => s.slug === preselectedServiceSlug);

  const [step, setStep] = useState(1);
  const [doctorId, setDoctorId] = useState<string | null>(preselectedDoctor?.id ?? null);
  const [serviceId, setServiceId] = useState<string | null>(preselectedService?.id ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<{ start: string; end: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ emailSent: boolean; email: string } | null>(null);

  const selectedDoctor = useMemo(() => doctors.find((d) => d.id === doctorId) ?? null, [doctors, doctorId]);
  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);

  async function handleDetailsSubmit(details: PatientDetailsInput) {
    if (!doctorId || !serviceId || !date || !time) return;

    setSubmitting(true);
    const res = await bookAppointment({
      doctor_id: doctorId,
      service_id: serviceId,
      appointment_date: date,
      start_time: time.start,
      end_time: time.end,
      ...details,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error ?? "Something went wrong. Please try again.");
      // If the slot was taken by someone else, send the user back to pick a new time.
      if (res.error?.toLowerCase().includes("slot")) {
        setTime(null);
        setStep(2);
      }
      return;
    }

    setResult({ emailSent: !!res.emailSent, email: details.patient_email });
    setStep(4);
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <BookingStepper currentStep={step} />

        {step === 1 && (
          <StepDoctorService
            doctors={doctors}
            services={services}
            selectedDoctorId={doctorId}
            selectedServiceId={serviceId}
            onSelectDoctor={setDoctorId}
            onSelectService={setServiceId}
            onContinue={() => setStep(2)}
          />
        )}

        {step === 2 && doctorId && (
          <StepDateTime
            doctorId={doctorId}
            selectedDate={date}
            selectedTime={time?.start ?? null}
            onSelectDate={(d) => {
              setDate(d);
              setTime(null);
            }}
            onSelectTime={(start, end) => setTime({ start, end })}
            onBack={() => setStep(1)}
            onContinue={() => setStep(3)}
          />
        )}

        {step === 3 && selectedDoctor && selectedService && date && time && (
          <StepDetails
            doctor={selectedDoctor}
            service={selectedService}
            date={date}
            time={time.start}
            defaultValues={{}}
            submitting={submitting}
            onBack={() => setStep(2)}
            onSubmit={handleDetailsSubmit}
          />
        )}

        {step === 4 && selectedDoctor && selectedService && date && time && result && (
          <StepConfirmation
            doctor={selectedDoctor}
            service={selectedService}
            date={date}
            time={time.start}
            patientEmail={result.email}
            emailSent={result.emailSent}
          />
        )}

        {doctors.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No doctors are configured yet. Once your Supabase database is connected, doctors
            will appear here automatically.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
