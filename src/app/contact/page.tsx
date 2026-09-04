import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getClinicSettings } from "@/lib/data";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with our clinic. Call, email, or send us a message and we will respond promptly.",
};

export default async function ContactPage() {
  const settings = await getClinicSettings();

  const mapQuery = encodeURIComponent(`${settings.clinic_name}, ${settings.address}`);
  const hasCoordinates =
    typeof settings.latitude === "number" &&
    typeof settings.longitude === "number" &&
    Number.isFinite(settings.latitude) &&
    Number.isFinite(settings.longitude);
  const mapSrc = hasCoordinates
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${settings.clinic_name}, ${settings.address}`)}@${settings.latitude},${settings.longitude}&z=17&output=embed`
    : `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Questions before booking? Reach out and our front desk team will get back to you
          promptly.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="space-y-5 py-6">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{settings.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-sm text-muted-foreground hover:text-primary">
                    {settings.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-sm text-muted-foreground hover:text-primary">
                    {settings.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium">Opening Hours</p>
                  <p className="text-sm text-muted-foreground">Mon - Fri: {settings.opening_hours.mon_fri}</p>
                  <p className="text-sm text-muted-foreground">Saturday: {settings.opening_hours.sat}</p>
                  <p className="text-sm text-muted-foreground">Sunday: {settings.opening_hours.sun}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border">
            <iframe
              title="Clinic location map"
              src={mapSrc}
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="py-6">
              <h2 className="mb-5 text-lg font-semibold">Send us a message</h2>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
