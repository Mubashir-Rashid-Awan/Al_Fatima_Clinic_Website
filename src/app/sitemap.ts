import type { MetadataRoute } from "next";
import { getDoctors, getServices } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);

  const staticRoutes = ["", "/services", "/doctors", "/about", "/contact", "/faq", "/booking"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const doctorRoutes = doctors.map((d) => ({
    url: `${siteUrl}/doctors/${d.slug}`,
    lastModified: new Date(d.updated_at),
  }));

  return [...staticRoutes, ...doctorRoutes];
}
