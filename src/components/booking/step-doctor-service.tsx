"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceIcon } from "@/components/site/service-icon";
import { cn } from "@/lib/utils";
import type { Doctor, Service } from "@/types/database.types";

interface Props {
  doctors: Doctor[];
  services: Service[];
  selectedServiceId: string | null;
  selectedDoctorId: string | null;
  onSelectService: (id: string) => void;
  onSelectDoctor: (id: string) => void;
  onContinue: () => void;
}

export function StepDoctorService({
  doctors,
  services,
  selectedServiceId,
  selectedDoctorId,
  onSelectService,
  onSelectDoctor,
  onContinue,
}: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold">1. Choose a service</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/60",
                selectedServiceId === service.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ServiceIcon iconName={service.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">~{service.duration_minutes} min</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">2. Choose a doctor</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelectDoctor(doctor.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary/60",
                selectedDoctorId === doctor.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {doctor.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div>
                <p className="text-sm font-medium">{doctor.full_name}</p>
                <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Card className="border-none bg-secondary/50">
        <CardContent className="flex items-center justify-between py-4">
          <p className="text-sm text-muted-foreground">
            {selectedServiceId && selectedDoctorId
              ? "Great, let's pick a time."
              : "Select a service and a doctor to continue."}
          </p>
          <Button onClick={onContinue} disabled={!selectedServiceId || !selectedDoctorId}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
