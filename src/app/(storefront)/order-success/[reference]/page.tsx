import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { buildWhatsAppMessage, whatsappUrl } from "@/lib/whatsapp";
import { CheckCircle2, MessageSquare, ExternalLink, ArrowRight, ShieldCheck, Home } from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderSuccessPageProps {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ wa?: string }>;
}

export default async function OrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { reference } = await params;
  const { wa } = await searchParams;

  let order: any = null;
  try {
    order = await db.orderRequest.findUnique({
      where: { reference },
      include: { items: true },
    });
  } catch (err) {
    console.error("Error fetching order request:", err);
  }

  if (!order) {
    notFound();
  }

  // Use passed wa URL or reconstruct
  let chatLink = wa;
  if (!chatLink) {
    const waMsg = buildWhatsAppMessage({
      reference: order.reference,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      city: order.city,
      state: order.state,
      pinCode: order.pinCode,
      subtotal: Number(order.subtotal).toLocaleString("en-IN"),
      items: order.items.map((it: any) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice).toLocaleString("en-IN"),
      })),
    });
    chatLink = whatsappUrl(waMsg);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Success banner */}
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50/50 p-8 text-center sm:p-10 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h1 className="mt-4 font-brand text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-200 sm:text-4xl">
          Order Request Received!
        </h1>
        <p className="mx-auto mt-2 max-w-md text-xs text-emerald-800/80 dark:text-emerald-300/80">
          Your request has been logged. Please tap the button below to send your order details to Thaagai on WhatsApp so our team can confirm availability.
        </p>

        {/* Reference pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-1.5 shadow-sm dark:bg-thaagai-cardDark">
          <span className="text-xs text-thaagai-ink/60">Reference:</span>
          <span className="font-mono text-sm font-bold text-thaagai-wine">{order.reference}</span>
        </div>

        {/* Primary WhatsApp Action */}
        <div className="mt-8">
          <a
            href={chatLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Open WhatsApp to Confirm</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Mandatory Brand Disclosure */}
      <div className="mt-8 rounded-xl bg-thaagai-sand/40 p-4 text-center dark:bg-thaagai-sandDark/30">
        <p className="text-xs font-semibold text-thaagai-wine">
          Orders are requests until the seller confirms them on WhatsApp.
        </p>
      </div>

      {/* Order Summary Details */}
      <div className="mt-8 rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm sm:p-8 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
        <h2 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
          Requested Pieces ({order.items.length})
        </h2>

        <div className="mt-4 divide-y divide-thaagai-line/40">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                  {it.productName}
                </p>
                <p className="text-xs text-thaagai-ink/60">
                  {it.variantLabel ? `Option: ${it.variantLabel} · ` : ""}Qty: {it.quantity}
                </p>
              </div>
              <span className="font-sans text-sm font-bold text-thaagai-wine">
                ₹{Number(it.lineTotal).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-thaagai-line/60 pt-4">
          <div className="flex justify-between text-xs text-thaagai-ink/70">
            <span>Subtotal</span>
            <span className="font-bold text-thaagai-ink dark:text-white">
              ₹{Number(order.subtotal).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="mt-1 flex justify-between text-xs text-thaagai-ink/70">
            <span>Shipping</span>
            <span className="text-emerald-700 font-semibold dark:text-emerald-400">Coordinated on WhatsApp</span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="mt-6 border-t border-thaagai-line/60 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            Shipping Destination
          </h3>
          <p className="mt-2 text-xs font-semibold text-thaagai-ink dark:text-white">
            {order.customerName} (+91 {order.customerPhone})
          </p>
          <p className="mt-0.5 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            {order.address}, {order.city}, {order.state} - {order.pinCode}
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md border border-thaagai-line bg-white px-5 text-xs font-semibold text-thaagai-ink hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/shop"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-5 text-xs font-semibold text-white hover:bg-thaagai-wineHover"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
