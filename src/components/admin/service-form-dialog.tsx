"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { upsertService } from "@/lib/admin/actions";
import type { Service } from "@/types/database.types";

const ICON_OPTIONS = ["Stethoscope", "Smile", "HeartPulse", "Baby", "Sparkles", "Activity"];

interface FormValues {
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  duration_minutes: number;
  icon: string;
}

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function ServiceFormDialog({ trigger, service }: { trigger: React.ReactNode; service?: Service }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: service
      ? {
          name: service.name,
          slug: service.slug,
          short_description: service.short_description,
          full_description: service.full_description ?? "",
          duration_minutes: service.duration_minutes,
          icon: service.icon ?? "Stethoscope",
        }
      : {
          name: "",
          slug: "",
          short_description: "",
          full_description: "",
          duration_minutes: 30,
          icon: "Stethoscope",
        },
  });

  const name = watch("name");
  const icon = watch("icon");

  async function onSubmit(values: FormValues) {
    const res = await upsertService({
      id: service?.id,
      name: values.name,
      slug: values.slug || slugify(values.name),
      short_description: values.short_description,
      full_description: values.full_description || null,
      duration_minutes: Number(values.duration_minutes) || 30,
      icon: values.icon,
      is_active: service?.is_active ?? true,
      display_order: service?.display_order ?? 0,
    });

    if (res.success) {
      toast.success(service ? "Service updated" : "Service added");
      setOpen(false);
      if (!service) reset();
    } else {
      toast.error(res.error ?? "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Add Service"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Required" })}
              onBlur={() => {
                if (!watch("slug")) setValue("slug", slugify(name));
              }}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">URL slug</Label>
            <Input id="slug" {...register("slug", { required: "Required" })} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="short_description">Short description</Label>
            <Input id="short_description" {...register("short_description", { required: "Required" })} />
            {errors.short_description && (
              <p className="text-xs text-destructive">{errors.short_description.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="full_description">Full description</Label>
            <Textarea id="full_description" rows={3} {...register("full_description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="duration_minutes">Duration (min)</Label>
              <Input id="duration_minutes" type="number" min={5} step={5} {...register("duration_minutes")} />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={icon} onValueChange={(v) => setValue("icon", v ?? "Stethoscope")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : service ? "Save Changes" : "Add Service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
