"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { upsertDoctor } from "@/lib/admin/actions";
import type { Doctor, Service } from "@/types/database.types";

interface FormValues {
  full_name: string;
  slug: string;
  specialty: string;
  qualifications: string;
  years_experience: number;
  bio: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function DoctorFormDialog({
  trigger,
  doctor,
  services = [],
}: {
  trigger: React.ReactNode;
  doctor?: Doctor & { serviceIds?: string[] };
  services?: Service[];
}) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: doctor
      ? {
          full_name: doctor.full_name,
          slug: doctor.slug,
          specialty: doctor.specialty,
          qualifications: doctor.qualifications ?? "",
          years_experience: doctor.years_experience,
          bio: doctor.bio ?? "",
        }
      : { full_name: "", slug: "", specialty: "", qualifications: "", years_experience: 0, bio: "" },
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(doctor?.serviceIds ?? []);

  const fullName = watch("full_name");

  async function onSubmit(values: FormValues) {
    const res = await upsertDoctor({
      id: doctor?.id,
      full_name: values.full_name,
      slug: values.slug || slugify(values.full_name),
      specialty: values.specialty,
      qualifications: values.qualifications || null,
      years_experience: Number(values.years_experience) || 0,
      bio: values.bio || null,
      is_active: doctor?.is_active ?? true,
      display_order: doctor?.display_order ?? 0,
    }, selectedServiceIds);

    if (res.success) {
      toast.success(doctor ? "Doctor updated" : "Doctor added");
      setOpen(false);
      if (!doctor) reset();
    } else {
      toast.error(res.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{doctor ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Full name</Label>
            <Input
              id="full_name"
              {...register("full_name", { required: "Required" })}
              onBlur={() => {
                if (!watch("slug")) setValue("slug", slugify(fullName));
              }}
            />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" {...register("slug", { required: "Required" })} placeholder="dr-jane-smith" />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" {...register("specialty", { required: "Required" })} placeholder="Cardiologist" />
            {errors.specialty && <p className="text-xs text-destructive">{errors.specialty.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input id="qualifications" {...register("qualifications")} placeholder="MBBS, FCPS" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="years_experience">Years experience</Label>
              <Input id="years_experience" type="number" min={0} {...register("years_experience")} />
            </div>
          </div>

          {services.length > 0 && (
            <div className="space-y-2">
              <Label>Services offered</Label>
              <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                {services.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={(event) => {
                        setSelectedServiceIds((current) =>
                          event.target.checked
                            ? [...current, service.id]
                            : current.filter((id) => id !== service.id)
                        );
                      }}
                    />
                    {service.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={3} {...register("bio")} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : doctor ? "Save Changes" : "Add Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
