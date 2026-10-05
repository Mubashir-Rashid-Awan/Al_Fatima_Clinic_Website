import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { Toaster } from "@/components/ui/sonner";
import { getClinicSettings } from "@/lib/data";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
  },
  title: {
    default: "Al Fatima Clinic — Book Appointments Online",
    template: "%s | Al Fatima Clinic",
  },
  description:
    "Book appointments online with experienced doctors at Al Fatima Clinic. General medicine, dental care, cardiology, pediatrics, dermatology, and physiotherapy.",
  keywords: [
    "clinic",
    "book appointment online",
    "doctor near me",
    "general physician",
    "dental clinic",
    "cardiologist",
    "pediatrician",
  ],
  openGraph: {
    type: "website",
    siteName: "Al Fatima Clinic",
    title: "Al Fatima Clinic — Book Appointments Online",
    description:
      "Book appointments online with experienced doctors at Al Fatima Clinic.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getClinicSettings();

  return (
    <html
      lang="en"
      className={`${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader clinicName={settings.clinic_name} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
        <WhatsAppButton phoneNumber={settings.whatsapp_number} />
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
