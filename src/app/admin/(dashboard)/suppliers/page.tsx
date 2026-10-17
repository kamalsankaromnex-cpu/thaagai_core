"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  PlusCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  code: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstin?: string | null;
  active: boolean;
  _count?: { purchaseOrders: number };
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/suppliers");
      if (res.ok) {
        const data = await res.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (err) {
      console.error("Failed to load suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          contactName: contactName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          gstin: gstin.trim().toUpperCase() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Failed to create supplier");
        return;
      }

      setName("");
      setCode("");
      setContactName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setGstin("");
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error("Error creating supplier:", err);
      setFormError("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-ink sm:text-3xl dark:text-white">
              Textile Suppliers & Vendors
            </h1>
          </div>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Manage fabric weavers, cotton mills, and luxury packaging vendors with GSTIN and purchasing terms.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-10 min-h-[40px] items-center gap-2 rounded-lg bg-thaagai-wine px-4 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-thaagai-wineHover"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Suppliers Table */}
      <div className="overflow-hidden rounded-xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-thaagai-wine" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center">
            <Truck className="mx-auto h-10 w-10 text-thaagai-ink/30 dark:text-thaagai-inkDark/30" />
            <h3 className="mt-3 text-sm font-bold text-thaagai-ink dark:text-white">
              No suppliers recorded yet
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Add your first textile weaver (e.g. Coimbatore Cotton Mills or Kanchi Silk Weavers).
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-thaagai-line/80 bg-thaagai-sand/30 font-semibold uppercase tracking-wider text-thaagai-ink/60 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/60">
                <tr>
                  <th className="px-4 py-3">Supplier / Code</th>
                  <th className="px-4 py-3">Contact Person</th>
                  <th className="px-4 py-3">Phone & Email</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3 text-center">Orders</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-thaagai-line/50 dark:divide-thaagai-line/30">
                {suppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-thaagai-sand/20 dark:hover:bg-thaagai-sandDark/10"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark dark:text-thaagai-gold">
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-thaagai-ink dark:text-white">
                            {s.name}
                          </p>
                          <span className="font-mono text-[10px] text-thaagai-gold font-bold">
                            {s.code}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-thaagai-ink/80 dark:text-white/80">
                      {s.contactName || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      <div>{s.phone || "—"}</div>
                      {s.email && <div className="text-[10px] text-thaagai-ink/50">{s.email}</div>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                      {s.gstin || "Unregistered"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-center font-bold text-thaagai-wine dark:text-thaagai-gold">
                      {s._count?.purchaseOrders || 0}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3">
              <h3 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
                Register Supplier / Mill
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-thaagai-ink/50 hover:bg-thaagai-sand/60 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Supplier / Mill Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore Handlooms"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Supplier Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUP-CBE-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 h-10 w-full font-mono uppercase rounded-lg border border-thaagai-line bg-white px-3 text-xs font-bold text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sundaramurthy"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    GSTIN (Tax ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 33AAAAA0000A1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="mt-1 h-10 w-full font-mono uppercase rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98420 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-thaagai-ink dark:text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. orders@cbehandlooms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-thaagai-line bg-white px-3 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-thaagai-ink dark:text-white">
                  Mill / Warehouse Address
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 42 Cotton Market Road, Tiruppur, Tamil Nadu - 641602"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-thaagai-line bg-white p-2.5 text-xs text-thaagai-ink placeholder:text-stone-400 outline-none focus:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white dark:placeholder:text-stone-500"
                />
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
                  <span>Save Supplier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
