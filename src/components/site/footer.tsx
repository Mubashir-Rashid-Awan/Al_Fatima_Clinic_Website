import Link from "next/link";
import { MapPin, Mail, Phone, Clock, Stethoscope } from "lucide-react";
import type { ClinicSettings } from "@/types/database.types";

export function SiteFooter({ settings }: { settings: ClinicSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-semibold text-lg">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Stethoscope className="h-5 w-5" />
              </span>
              {settings.clinic_name}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{settings.tagline}</p>
          </div>

          <div>
            <h3 className="font-medium">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary">Our Services</Link></li>
              <li><Link href="/doctors" className="hover:text-primary">Our Doctors</Link></li>
              <li><Link href="/booking" className="hover:text-primary">Book an Appointment</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Contact</h3>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Opening Hours</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Mon - Fri: {settings.opening_hours.mon_fri}</span>
              </li>
              <li className="flex items-center gap-2 pl-6">
                <span>Saturday: {settings.opening_hours.sat}</span>
              </li>
              <li className="flex items-center gap-2 pl-6">
                <span>Sunday: {settings.opening_hours.sun}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {year} {settings.clinic_name}. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-primary">
            Staff Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
