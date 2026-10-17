"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Ruler,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

export default function AccountPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout, refreshProfile } = useCustomerAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when customer profile loads
  useEffect(() => {
    if (customer) {
      setFullName(customer.fullName || "");
      setEmail(customer.email || "");
    }
  }, [customer]);

  // If not authenticated and not loading, redirect to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/customers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }
      setSavedMsg("Profile information updated successfully.");
      await refreshProfile();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading || !customer) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <RotateCw className="mx-auto h-6 w-6 animate-spin text-thaagai-wine" />
        <p className="mt-2 text-xs text-thaagai-ink/60">Loading account details...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-thaagai-line/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-thaagai-gold">
            Customer Dashboard
          </span>
          <h1 className="mt-1 font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            My Account
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-lg border border-thaagai-line bg-white px-4 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 hover:border-red-300 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Navigation & Summary Cards (Left Column) */}
        <div className="space-y-4 md:col-span-1">
          {/* Saved Addresses Card */}
          <Link
            href="/account/addresses"
            className="group flex flex-col justify-between rounded-xl border border-thaagai-line bg-white p-5 shadow-sm transition-all hover:border-thaagai-wine/50 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-thaagai-sand/60 p-2.5 text-thaagai-wine dark:bg-thaagai-sandDark/40">
                <MapPin className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-thaagai-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-thaagai-wine" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-bold text-thaagai-ink dark:text-white">Saved Addresses</h2>
              <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Manage your delivery addresses and PIN autofill
              </p>
            </div>
          </Link>

          {/* Orders History Card */}
          <Link
            href="/account/orders"
            className="group flex flex-col justify-between rounded-xl border border-thaagai-line bg-white p-5 shadow-sm transition-all hover:border-thaagai-wine/50 hover:shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-thaagai-sand/60 p-2.5 text-thaagai-wine dark:bg-thaagai-sandDark/40">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-thaagai-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-thaagai-wine" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-bold text-thaagai-ink dark:text-white">Order Requests</h2>
              <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Track status timelines, view delivery details and reorder
              </p>
            </div>
          </Link>

          {/* Bespoke Measurements Card */}
          <Link
            href="/account/measurements"
            className="group flex flex-col justify-between rounded-xl border border-thaagai-gold/60 bg-white p-5 shadow-sm transition-all hover:border-thaagai-wine hover:shadow-md dark:border-thaagai-gold/40 dark:bg-thaagai-cardDark"
          >
            <div className="flex items-start justify-between">
              <div className="rounded-lg bg-thaagai-sand/60 p-2.5 text-thaagai-wine dark:bg-thaagai-sandDark/40">
                <Ruler className="h-5 w-5 text-thaagai-gold" />
              </div>
              <ArrowRight className="h-4 w-4 text-thaagai-ink/40 transition-transform group-hover:translate-x-1 group-hover:text-thaagai-wine" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-bold text-thaagai-ink dark:text-white">Measurements Vault</h2>
              <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                Save your bust, waist & kurta lengths for bespoke tailoring
              </p>
            </div>
          </Link>

          {/* Customer Info Card */}
          <div className="rounded-xl border border-thaagai-line/60 bg-thaagai-sand/20 p-5 dark:bg-thaagai-sandDark/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-thaagai-ink dark:text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verified Mobile Account</span>
            </div>
            <p className="mt-1 font-mono text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              +91 {customer.mobileNumber}
            </p>
            <p className="mt-3 text-[11px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
              Member since {new Date(customer.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Profile Details Form (Right Column) */}
        <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 md:col-span-2 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
          <h2 className="text-base font-bold text-thaagai-ink dark:text-white">
            Personal Details
          </h2>
          <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Keep your contact name and email up to date for dispatch alerts
          </p>

          {savedMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{savedMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
            {/* Mobile (Read-only verified) */}
            <div>
              <label className="block text-xs font-semibold text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                Mobile Number (Verified)
              </label>
              <div className="mt-1.5 flex h-11 items-center rounded-lg border border-thaagai-line/80 bg-thaagai-sand/30 px-3 font-mono text-sm text-thaagai-ink/80 dark:bg-thaagai-sandDark/20 dark:text-white">
                +91 {customer.mobileNumber}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kavitha Raman"
                className="mt-1.5 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-sm text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-thaagai-ink dark:text-white">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kavitha@example.com"
                className="mt-1.5 h-11 w-full rounded-lg border border-thaagai-line bg-white px-3 text-sm text-thaagai-ink placeholder:text-thaagai-ink/40 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover disabled:opacity-50"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
