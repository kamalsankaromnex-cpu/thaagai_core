"use client";

import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { buildWhatsAppLink, getWhatsAppBusinessNumber } from "@/lib/whatsapp";

interface WhatsAppFloatingConciergeProps {
  whatsappNumber?: string;
}

export function WhatsAppFloatingConcierge({
  whatsappNumber,
}: WhatsAppFloatingConciergeProps) {
  const pathname = usePathname();

  // Hide on Product Detail Pages (dedicated sticky buy/WhatsApp bar is rendered there)
  // and on Checkout pages
  if (
    !pathname ||
    pathname.startsWith("/product/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname.startsWith("/order-success/")
  ) {
    return null;
  }

  const phone = whatsappNumber || getWhatsAppBusinessNumber();
  const greeting = "Hello Thaagai! I have a question about your Churidar collections and bespoke tailoring.";
  const href = buildWhatsAppLink(phone, greeting);

  return (
    <aside
      aria-label="WhatsApp Concierge"
      className="fixed bottom-36 right-4 z-30 md:bottom-22 md:right-6 animate-float"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Thaagai Master Tailor on WhatsApp"
        className="group relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#20ba5a] hover:shadow-2xl active:scale-95 tap-bounce focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        {/* Subtle breathing ripple glow rings */}
        <span
          aria-hidden="true"
          className="absolute -inset-1.5 rounded-full bg-[#25D366]/40 animate-ripple-glow pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute -inset-3 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none duration-1000"
        />

        {/* Desktop hover pill badge with smooth slide-in */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-3.5 hidden whitespace-nowrap rounded-xl border border-stone-200/80 bg-white/95 px-3.5 py-2 text-xs font-semibold text-stone-800 shadow-xl backdrop-blur-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 translate-x-2 opacity-0 md:block dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
            <span>Chat with Master Tailor</span>
          </span>
        </span>

        {/* WhatsApp Icon with hover rotate */}
        <MessageSquare className="h-6 w-6 fill-white text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
      </a>
    </aside>
  );
}
