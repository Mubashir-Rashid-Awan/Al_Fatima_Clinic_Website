"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local first."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-secondary/30 px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-2">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </span>
            <h1 className="mt-3 text-xl font-semibold">Staff Login</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to manage appointments and content.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourclinic.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Admin accounts are created in your Supabase project under Authentication → Users.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
