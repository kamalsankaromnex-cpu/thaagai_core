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
      className="fixed bottom-20 right-4 z-30 md:bottom-6 md:right-6"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Thaagai Master Tailor on WhatsApp"
        className="group relative flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#20ba5a] hover:shadow-xl active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        {/* Subtle breathing glow ring */}
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none"
        />

        {/* Desktop hover pill badge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg border border-stone-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-md backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 opacity-0 md:block dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
        >
          Chat with Master Tailor
        </span>

        {/* WhatsApp Icon */}
        <MessageSquare className="h-6 w-6 fill-white text-white" />
      </a>
    </aside>
  );
}
