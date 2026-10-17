"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  PlusCircle,
  Shield,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
} from "lucide-react";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN";
  active: boolean;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "OWNER">("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create staff account");
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      console.error("Failed to create staff account:", err);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Staff & Permissions
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Manage authenticated team access, administrative roles, and atelier permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-thaagai-wineHover"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Directory Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-thaagai-line/80 bg-thaagai-sand/30 font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-thaagai-line/50 dark:divide-thaagai-line/30">
                {staff.map((member) => (
                  <tr
                    key={member.id}
                    className="transition-colors hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand text-xs font-bold text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-thaagai-ink dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          member.role === "OWNER"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                            : "bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold"
                        }`}
                      >
                        <Shield className="h-2.5 w-2.5" />
                        <span>{member.role}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{member.active ? "Active" : "Inactive"}</span>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                      {new Date(member.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                Add Team Member
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Full Name *
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-thaagai-ink/40" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyadharshini K."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-thaagai-line bg-white pl-9 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Email Address *
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-thaagai-ink/40" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. staff@thaagai.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-thaagai-line bg-white pl-9 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Temporary Password *
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-thaagai-ink/40" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 w-full rounded-lg border border-thaagai-line bg-white pl-9 pr-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Role Permission *
                </label>
                <select
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
                >
                  <option value="ADMIN">ADMIN — Manage Orders, Products, Customers & Inventory</option>
                  <option value="OWNER">OWNER — Full Access including Staff, Financials & Settings</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-thaagai-line/60 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-thaagai-line px-4 py-2 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-thaagai-wine px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-thaagai-wineHover disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
