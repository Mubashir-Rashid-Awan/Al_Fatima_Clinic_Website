import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Stethoscope, ListChecks, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/sign-out-button";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Appointments", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/services", label: "Services", icon: ListChecks },
  { href: "/admin/messages", label: "Messages", icon: Mail },
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  let user = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Supabase env vars not configured yet.
    redirect("/admin/login");
  }

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl">
      <aside className="hidden w-60 shrink-0 border-r py-8 pr-4 md:block">
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 border-t pt-4">
          <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <div className="flex-1 py-8 pl-0 md:pl-8">
        {/* Mobile nav */}
        <nav className="mb-6 flex gap-1 overflow-x-auto border-b pb-3 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
