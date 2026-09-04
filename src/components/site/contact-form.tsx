"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations/booking";
import { submitContactMessage } from "@/lib/booking/actions";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactInput) {
    const res = await submitContactMessage(data);
    if (res.success) {
      toast.success("Message sent. We'll get back to you shortly.");
      reset();
    } else {
      toast.error(res.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" {...register("full_name")} placeholder="Your name" />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" {...register("phone")} placeholder="+92 300 1234567" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject">Subject (optional)</Label>
          <Input id="subject" {...register("subject")} placeholder="What is this about?" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} placeholder="How can we help?" />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
