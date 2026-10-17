"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, RotateCw, AlertCircle, ArrowLeft } from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";

  const { customer, isAuthenticated, requestOtp, verifyOtp } = useCustomerAuth();

  const [step, setStep] = useState<"MOBILE" | "OTP">("MOBILE");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && customer) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, customer, redirectPath, router]);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestOtp(cleanMobile);
      setStep("OTP");
      setCooldown(res.expiresInSeconds ? 60 : 60);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setSuccessMsg("Verification code sent via SMS.");
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(mobileNumber, cleanOtp);
      router.push(redirectPath);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await requestOtp(mobileNumber);
      setCooldown(60);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setSuccessMsg("A new verification code has been sent.");
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-20">
      <div className="overflow-hidden rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-thaagai-sand/60 text-thaagai-wine dark:bg-thaagai-sandDark/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            {step === "MOBILE" ? "Customer Sign In" : "Verify Phone Number"}
          </h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            {step === "MOBILE"
              ? "Passwordless mobile OTP login for fast & secure shopping"
              : `Enter the 6-digit code sent to +91 ${mobileNumber}`}
          </p>
        </div>

        {/* Error and Success Alerts */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && !error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dev OTP Helper Banner */}
        {devOtpHint && step === "OTP" && (
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="font-semibold">Development Simulator OTP: </span>
            <span className="font-mono font-bold tracking-widest">{devOtpHint}</span>
            <p className="mt-0.5 text-[11px] opacity-80">Use this code directly for local testing without SMS gateway charges.</p>
          </div>
        )}

        {/* Step 1: Mobile Number Form */}
        {step === "MOBILE" ? (
          <form onSubmit={handleMobileSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="mobile" className="block text-xs font-semibold text-thaagai-ink dark:text-thaagai-inkDark">
                Indian Mobile Number
              </label>
              <div className="mt-1.5 flex rounded-lg border border-thaagai-line bg-white shadow-sm focus-within:border-thaagai-wine focus-within:ring-1 focus-within:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                <span className="inline-flex h-11 items-center border-r border-thaagai-line px-3.5 text-xs font-semibold text-thaagai-ink/80 dark:border-thaagai-line/40 dark:text-thaagai-inkDark/80">
                  +91
                </span>
                <input
                  id="mobile"
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  required
                  autoFocus
                  className="h-11 w-full bg-transparent px-3 text-sm text-thaagai-ink placeholder:text-thaagai-ink/40 focus:outline-none dark:text-white"
                />
              </div>
              <p className="mt-1 text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                New mobile numbers will automatically have an account created.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || mobileNumber.length < 10}
              className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-thaagai-wine font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Requesting OTP...</span>
                </>
              ) : (
                <>
                  <span>Get Verification Code</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleOtpSubmit} className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="otp" className="block text-xs font-semibold text-thaagai-ink dark:text-thaagai-inkDark">
                  Enter 6-Digit Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep("MOBILE");
                    setOtp("");
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium text-thaagai-wine hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> Change number
                </button>
              </div>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                required
                autoFocus
                className="mt-1.5 h-12 w-full rounded-lg border border-thaagai-line bg-white text-center font-mono text-xl font-bold tracking-widest text-thaagai-ink shadow-sm placeholder:text-thaagai-ink/30 focus:border-thaagai-wine focus:outline-none focus:ring-1 focus:ring-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-thaagai-wine font-semibold text-white shadow-sm transition-all hover:bg-thaagai-wineHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify & Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="pt-2 text-center text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              {cooldown > 0 ? (
                <span>Resend code in <strong className="font-semibold text-thaagai-wine">{cooldown}s</strong></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-semibold text-thaagai-wine hover:underline"
                >
                  Did not receive code? Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {/* Footer Guarantee */}
        <div className="mt-8 border-t border-thaagai-line/60 pt-4 text-center">
          <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
            Orders are confirmed manually with the seller on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-thaagai-ink/60">Loading sign in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
