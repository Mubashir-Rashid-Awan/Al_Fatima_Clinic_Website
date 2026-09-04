"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ clinicName }: { clinicName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">{clinicName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/booking">Book Appointment</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>{clinicName}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === link.href ? "bg-accent text-primary" : "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-3">
                  <Link href="/booking" onClick={() => setOpen(false)}>
                    Book Appointment
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
