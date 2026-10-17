import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowLeft,
  ShoppingBag,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Scissors,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CustomerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;

  let customer: any = null;
  try {
    customer = await db.customer.findUnique({
      where: { id },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        },
      },
    });
  } catch (err) {
    console.error("Error fetching customer:", err);
  }

  if (!customer) {
    notFound();
  }

  const totalSpent = customer.orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);
  const cleanPhone = customer.mobileNumber.replace(/\D/g, "");

  return (
    <div className="space-y-8">
      {/* Top Navigation */}
      <div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-thaagai-wine hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Clients Directory</span>
        </Link>
      </div>

      {/* Customer Header Card */}
      <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine font-brand text-2xl font-bold dark:bg-thaagai-sandDark">
              {customer.fullName ? customer.fullName[0].toUpperCase() : "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-brand text-2xl font-bold text-thaagai-ink dark:text-white">
                  {customer.fullName || "Registered Client"}
                </h1>
                {customer.phoneVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> Phone Verified
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-thaagai-gold" />
                  +91 {customer.mobileNumber}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-thaagai-gold" />
                    {customer.email}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-thaagai-gold" />
                  Joined {new Date(customer.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <a
              href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(customer.fullName || "")},%20this%20is%20Thaagai%20Boutique.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-600 px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Client</span>
            </a>
          </div>
        </div>

        {/* Lifetime Metrics */}
        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-thaagai-line/60 pt-6 sm:grid-cols-3">
          <div className="rounded-xl bg-[#FAF7F2] p-4 dark:bg-thaagai-sandDark/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-thaagai-ink/60">
              Total Order Requests
            </span>
            <p className="mt-1 text-2xl font-bold text-thaagai-wine">
              {customer.orders.length}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF7F2] p-4 dark:bg-thaagai-sandDark/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-thaagai-ink/60">
              Lifetime Value
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-400">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-[#FAF7F2] p-4 dark:bg-thaagai-sandDark/20">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-thaagai-ink/60">
              Saved Delivery Addresses
            </span>
            <p className="mt-1 text-2xl font-bold text-thaagai-ink dark:text-white">
              {customer.addresses.length}
            </p>
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
          Saved Delivery Addresses ({customer.addresses.length})
        </h2>

        {customer.addresses.length === 0 ? (
          <p className="mt-4 text-xs text-thaagai-ink/60">
            This client has not saved any addresses yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {customer.addresses.map((addr: any) => (
              <div
                key={addr.id}
                className="relative rounded-xl border border-thaagai-line bg-[#FAF7F2] p-4 text-xs dark:bg-thaagai-sandDark/20"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-thaagai-ink dark:text-white">
                    {addr.recipientName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-thaagai-sand px-2 py-0.5 text-[10px] font-semibold text-thaagai-ink">
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="rounded bg-thaagai-wine px-2 py-0.5 text-[10px] font-bold text-white">
                        Default
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                  {addr.houseOrFlat}{addr.buildingName ? `, ${addr.buildingName}` : ""}, {addr.street}, {addr.locality}
                </p>
                <p className="text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  {addr.city}, {addr.state} - <strong className="font-semibold">{addr.pinCode}</strong>
                </p>
                <p className="mt-2 font-mono text-[11px] text-thaagai-ink/60">
                  Mobile: +91 {addr.mobileNumber}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History with Customization Snapshots */}
      <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
          Client Order History ({customer.orders.length})
        </h2>

        {customer.orders.length === 0 ? (
          <p className="mt-4 text-xs text-thaagai-ink/60">
            No orders placed by this client yet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {customer.orders.map((ord: any) => (
              <div
                key={ord.id}
                className="rounded-xl border border-thaagai-line p-5 transition-all hover:border-thaagai-wine/50 dark:border-thaagai-line/40"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-thaagai-line/40 pb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="font-mono text-sm font-bold text-thaagai-wine hover:underline"
                    >
                      {ord.reference}
                    </Link>
                    <span className="rounded bg-thaagai-sand px-2.5 py-0.5 text-[10px] font-semibold text-thaagai-ink">
                      {ord.status.replace(/_/g, " ")}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      {ord.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-thaagai-ink/60">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span className="font-sans text-sm font-bold text-thaagai-ink dark:text-white">
                      ₹{Number(ord.total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Items & Customization Snapshots */}
                <div className="mt-3 divide-y divide-thaagai-line/30">
                  {ord.items.map((it: any) => {
                    const cust = it.customizations as any;
                    return (
                      <div key={it.id} className="py-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-thaagai-ink dark:text-white">
                            {it.productName} {it.variantLabel ? `(${it.variantLabel})` : ""}
                          </span>
                          <span className="text-thaagai-ink/70">
                            Qty: {it.quantity} × ₹{Number(it.unitPrice).toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Customization Snapshot Display */}
                        {cust && (
                          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                            <div className="flex items-center gap-1 font-bold text-thaagai-maroon">
                              <Scissors className="h-3.5 w-3.5 text-thaagai-gold" />
                              <span>Tailoring & Bespoke Snapshot:</span>
                            </div>

                            {cust.selections && cust.selections.length > 0 && (
                              <div className="mt-1 space-y-0.5 text-[11px]">
                                {cust.selections.map((s: any, sIdx: number) => (
                                  <div key={sIdx}>
                                    • {s.groupName}: <strong>{s.optionName}</strong>
                                    {s.priceDelta && s.priceDelta > 0 ? ` (+₹${s.priceDelta})` : ""}
                                  </div>
                                ))}
                              </div>
                            )}

                            {cust.measurements && (
                              <div className="mt-2 border-t border-amber-200/60 pt-1.5 text-[11px]">
                                <span className="font-semibold text-thaagai-maroon block">
                                  Body Measurements:
                                </span>
                                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                  {cust.measurements.bust && <span>Bust: <strong>{cust.measurements.bust}&quot;</strong></span>}
                                  {cust.measurements.waist && <span>Waist: <strong>{cust.measurements.waist}&quot;</strong></span>}
                                  {cust.measurements.hips && <span>Hips: <strong>{cust.measurements.hips}&quot;</strong></span>}
                                  {cust.measurements.length && <span>Length: <strong>{cust.measurements.length}&quot;</strong></span>}
                                  {cust.measurements.shoulder && <span>Shoulder: <strong>{cust.measurements.shoulder}&quot;</strong></span>}
                                </div>
                                {cust.measurements.notes && (
                                  <p className="mt-1 italic">
                                    Notes: &quot;{cust.measurements.notes}&quot;
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-end">
                  <Link
                    href={`/admin/orders/${ord.id}`}
                    className="text-xs font-semibold text-thaagai-wine hover:underline"
                  >
                    Manage full order details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
