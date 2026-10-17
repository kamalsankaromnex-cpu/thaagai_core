"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/storefront/brand-logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-thaagai-bg px-4 py-12 dark:bg-thaagai-cardDark">
      <div className="w-full max-w-md rounded-2xl border border-thaagai-line bg-white p-8 shadow-sm dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/40">
        <div className="text-center">
          <BrandLogo
            className="justify-center mx-auto mb-4"
            iconClassName="h-14 w-auto object-contain shrink-0"
            wordmarkClassName="h-9 w-auto object-contain"
            href="/admin/login"
          />
          <h1 className="text-xl font-semibold tracking-tight text-thaagai-ink dark:text-thaagai-inkDark">
            Admin Portal Login
          </h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Authorized store managers and owners only
          </p>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-thaagai-ink dark:text-thaagai-inkDark">
              Admin Email
            </label>
            <div className="relative mt-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@thaagai.com"
                className="h-11 w-full rounded-md border border-thaagai-line bg-thaagai-bg/50 px-3 pl-9 text-sm text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:bg-thaagai-cardDark dark:text-white"
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-thaagai-ink/50" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-thaagai-ink dark:text-thaagai-inkDark">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-11 w-full rounded-md border border-thaagai-line bg-thaagai-bg/50 px-3 pl-9 text-sm text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:bg-thaagai-cardDark dark:text-white"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-thaagai-ink/50" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full min-h-[44px] items-center justify-center gap-2 rounded-md bg-thaagai-wine text-sm font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 rounded-lg border border-thaagai-line/60 bg-thaagai-sand/30 p-3 text-center dark:bg-thaagai-cardDark">
          <p className="text-[11px] font-medium text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Default credentials from <code className="font-mono font-semibold">.env</code>:
          </p>
          <p className="mt-1 font-mono text-xs font-semibold text-thaagai-wine">
            owner@thaagai.com
          </p>
          <p className="font-mono text-xs text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
            AdminThaagai@2026SecurePass
          </p>
        </div>
      </div>
    </div>
  );
}
