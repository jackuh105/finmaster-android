"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/"); // Redirect to dashboard/home after login
      router.refresh();
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-bg dark:bg-darkBg font-sans flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-lg">
        <Card className="bg-secondaryBg dark:bg-secondaryBlack border-2 border-border shadow-light p-8 rounded-base">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-heading text-text dark:text-darkText">Login to your account</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1 text-text dark:text-darkText">
                <Label htmlFor="email">email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="eg: jhon@email.com"
                  required
                />
              </div>

              <div className="space-y-1 text-text dark:text-darkText">
                <Label htmlFor="password">password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="password"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 text-sm font-bold rounded-base">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-heading"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
