"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Send,
  ShoppingBag,
  Check,
  Truck,
  Scissors,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  RotateCcw,
  Bot,
  MessageSquare,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useCustomerAuth } from "@/context/customer-auth-context";
import type {
  AssistantResponse,
  ProductCard,
  CustomizationSummary,
  OrderStatusCard,
  OtpPrompt,
  WhatsAppHandover,
} from "@/server/services/ai-assistant-service";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  products?: ProductCard[];
  customization?: CustomizationSummary;
  orderStatus?: OrderStatusCard;
  otpPrompt?: OtpPrompt;
  whatsappHandover?: WhatsAppHandover;
  quickReplies?: string[];
}

export function AiChatAssistant() {
  const pathname = usePathname();
  const { addItem } = useCart();
  const { customer } = useCustomerAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState<"en" | "ta">("en");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // OTP form state
  const [otpInput, setOtpInput] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [currentOtpPrompt, setCurrentOtpPrompt] = useState<OtpPrompt | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome greeting
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to Thaagai 🌸\n\n*“Every Thread, A Touch of You.”*\n\nI am your personal boutique stylist & concierge. How can I help you today? You can ask me to recommend kurtis, plan bespoke necklines and sleeve styles, track an order, or check our policies!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickReplies: [
        "🌸 Kurtis under ₹2,000",
        "✂️ Bespoke Customisation",
        "📦 Track My Order",
        "↩️ Return & Refund Policy",
        "💬 WhatsApp Stylist",
      ],
    },
  ]);

  // Hide on checkout & payment success pages to avoid distracting user during transactions
  if (
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/order-success")
  ) {
    return null;
  }

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: MessageItem = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          context: {
            currentPath: pathname,
            customerId: customer?.id,
            customerPhone: customer?.mobileNumber,
            customerName: customer?.fullName || undefined,
            preferredLanguage: language,
            pendingOtpPhone: currentOtpPrompt?.phone,
            pendingOtpRef: currentOtpPrompt?.reference,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.response) {
        const resp: AssistantResponse = data.response;
        const assistantMessage: MessageItem = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: resp.message,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          products: resp.products,
          customization: resp.customization,
          orderStatus: resp.orderStatus,
          otpPrompt: resp.otpPrompt,
          whatsappHandover: resp.whatsappHandover,
          quickReplies: resp.quickReplies,
        };

        if (resp.otpPrompt) {
          setCurrentOtpPrompt(resp.otpPrompt);
          setOtpInput("");
        } else if (resp.orderStatus) {
          setCurrentOtpPrompt(null);
        }

        if (resp.language && resp.language !== language) {
          setLanguage(resp.language);
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to process message");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I apologize, but I had trouble reaching our boutique servers. Please feel free to ask again or tap 'WhatsApp Stylist' for direct assistance.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickReplies: ["🌸 Browse Kurtis", "💬 WhatsApp Stylist", "📦 Track My Order"],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (prompt: OtpPrompt) => {
    if (!otpInput.trim() || isVerifyingOtp) return;
    setIsVerifyingOtp(true);

    try {
      const response = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Verify OTP: ${otpInput.trim()}` }],
          action: "VERIFY_OTP",
          actionPayload: {
            phone: prompt.phone,
            reference: prompt.reference,
            otp: otpInput.trim(),
          },
          context: {
            preferredLanguage: language,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.response) {
        const resp: AssistantResponse = data.response;
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: resp.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            orderStatus: resp.orderStatus,
            otpPrompt: resp.otpPrompt,
            quickReplies: resp.quickReplies,
          },
        ]);

        if (resp.orderStatus) {
          setCurrentOtpPrompt(null);
        } else if (resp.otpPrompt) {
          setCurrentOtpPrompt(resp.otpPrompt);
        }
      }
    } catch {
      alert("Failed to verify code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async (prompt: OtpPrompt) => {
    setIsVerifyingOtp(true);
    try {
      const response = await fetch("/api/chat/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Resend OTP" }],
          action: "RESEND_OTP",
          actionPayload: {
            phone: prompt.phone,
            reference: prompt.reference,
          },
          context: { preferredLanguage: language },
        }),
      });

      const data = await response.json();
      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: data.response.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            otpPrompt: data.response.otpPrompt,
            quickReplies: data.response.quickReplies,
          },
        ]);
        if (data.response.otpPrompt) {
          setCurrentOtpPrompt(data.response.otpPrompt);
        }
      }
    } catch {
      alert("Could not resend OTP at this time.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleAddToCart = (product: ProductCard) => {
    addItem({
      variantId: product.primaryVariantId,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      salePrice: product.salePrice,
      maxStock: product.stockQuantity,
      imageUrl: product.imageUrl,
      slug: product.slug,
      size: product.sizes[0] || "M",
      colour: product.colors[0] || "Standard",
    });

    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2500);
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ta" : "en";
    setLanguage(nextLang);
    handleSendMessage(nextLang === "ta" ? "வணக்கம், தமிழில் பேசலாம்" : "Hello, let's chat in English");
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <aside
          aria-label="Thaagai AI Stylist Concierge"
          className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Thaagai AI Stylist & Customer Support Assistant"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#741832] to-[#4a0d1e] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#741832] tap-bounce animate-float"
          >
            {/* Ambient golden glow ring */}
            <span
              aria-hidden="true"
              className="absolute -inset-1 rounded-full bg-[#B89A62]/30 animate-pulse pointer-events-none"
            />

            {/* Desktop hover badge */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-xl border border-stone-200/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#4a2023] shadow-lg backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 opacity-0 md:flex md:items-center md:gap-1.5 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#B89A62]" />
              <span>Thaagai Stylist & Help</span>
            </span>

            {/* Icon */}
            <div className="relative">
              <Bot className="h-7 w-7 text-white" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#B89A62] border-2 border-[#741832]" />
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* Expandable Conversation Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Thaagai Customer Assistant Chat"
          className={`fixed z-50 flex flex-col bg-[#FFFDF9] text-[#4a2023] shadow-2xl transition-all duration-300 border border-[#EBE1D7] animate-scale-in dark:bg-stone-900 dark:border-stone-800 dark:text-stone-100 ${
            isExpanded
              ? "inset-2 md:inset-10 rounded-2xl"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-[#EBE1D7] bg-gradient-to-r from-[#741832] via-[#5E1028] to-[#4a0d1e] px-4 py-3 text-white rounded-t-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur-xs">
                <Sparkles className="h-5 w-5 text-amber-200" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#741832]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-bold tracking-tight">THAAGAI</span>
                  <span className="rounded bg-[#B89A62]/30 px-1.5 py-0.5 text-[10px] font-medium text-amber-100">
                    AI Stylist
                  </span>
                </div>
                <span className="text-[11px] text-white/80">Every Thread, A Touch of You</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                title="Switch Language (English / தமிழ்)"
                className="mr-1 rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 transition hover:bg-white/20"
              >
                {language === "en" ? "தமிழ்" : "English"}
              </button>

              {/* Expand / Minimize toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-[#FFFDF9] to-[#FAF7F2] dark:from-stone-900 dark:to-stone-950">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    msg.role === "user"
                      ? "bg-[#741832] text-white rounded-br-xs"
                      : "bg-white text-[#4a2023] border border-[#EBE1D7] rounded-bl-xs dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Timestamp */}
                  <span
                    className={`mt-1.5 block text-[10px] text-right ${
                      msg.role === "user" ? "text-white/70" : "text-stone-400"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Rich Product Recommendation Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 w-full space-y-2.5">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-xl border border-[#EBE1D7] bg-white p-2.5 shadow-sm transition hover:shadow-md dark:bg-stone-800 dark:border-stone-700"
                      >
                        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-700">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="72px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                              Thaagai
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${p.slug}`}
                            className="block font-medium text-xs sm:text-sm text-[#4a2023] hover:text-[#741832] truncate transition font-serif dark:text-stone-100 dark:hover:text-amber-200"
                          >
                            {p.name}
                          </Link>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#741832] dark:text-amber-200">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            {p.salePrice && p.salePrice < p.price && (
                              <span className="text-[11px] text-stone-400 line-through">
                                ₹{p.salePrice.toLocaleString("en-IN")}
                              </span>
                            )}
                            <span className="text-[10px] rounded bg-stone-100 px-1 py-0.2 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                              {p.sizes[0] || "M"}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(p)}
                              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs transition ${
                                addedItemIds[p.id]
                                  ? "bg-emerald-600 text-white"
                                  : "bg-[#741832] text-white hover:bg-[#5E1028]"
                              }`}
                            >
                              {addedItemIds[p.id] ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="h-3 w-3" />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>

                            <Link
                              href={`/product/${p.slug}`}
                              className="flex items-center gap-0.5 text-[11px] font-medium text-stone-600 hover:text-[#741832] dark:text-stone-300"
                            >
                              <span>Details</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customisation Summary Card */}
                {msg.customization && (
                  <div className="mt-2.5 w-full rounded-xl border border-[#B89A62]/40 bg-gradient-to-br from-[#FFFDF9] to-[#FAF7F2] p-3 shadow-sm dark:bg-stone-800 dark:border-stone-700">
                    <div className="flex items-center justify-between border-b border-[#EBE1D7] pb-2 dark:border-stone-700">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-[#741832] dark:text-amber-200">
                        <Scissors className="h-3.5 w-3.5" />
                        <span>Bespoke Custom Configuration</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#741832] dark:text-amber-200">
                        ₹{msg.customization.totalPrice.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#4a2023]/90 dark:text-stone-300">
                      <div>
                        <span className="text-stone-500 block text-[10px]">Silhouette:</span>
                        <span className="font-medium truncate block">{msg.customization.topStyle}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Neckline:</span>
                        <span className="font-medium truncate block">{msg.customization.neckline}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Sleeves:</span>
                        <span className="font-medium truncate block">{msg.customization.sleeve}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[10px]">Bottom Cut:</span>
                        <span className="font-medium truncate block">{msg.customization.bottomCut}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#EBE1D7] dark:border-stone-700">
                      <span className="text-[10px] text-stone-500">
                        ⏱️ {msg.customization.estimatedDays}
                      </span>
                      <Link
                        href={`/custom-made`}
                        className="flex items-center gap-1 rounded bg-[#741832] px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#5E1028] transition"
                      >
                        <span>Open 3D Studio</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Order Status & Shipment Card */}
                {msg.orderStatus && (
                  <div className="mt-2.5 w-full rounded-xl border border-stone-200 bg-white p-3.5 shadow-sm dark:bg-stone-800 dark:border-stone-700">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 dark:border-stone-700">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium">Order Ref</span>
                        <h4 className="font-bold text-xs sm:text-sm text-[#741832] dark:text-amber-200">
                          {msg.orderStatus.reference}
                        </h4>
                      </div>
                      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-800">
                        {msg.orderStatus.statusLabel}
                      </span>
                    </div>

                    {/* Timeline steps */}
                    <div className="mt-3 flex items-center justify-between px-2">
                      {[
                        { step: 1, label: "Placed" },
                        { step: 2, label: "Tailoring" },
                        { step: 3, label: "Dispatched" },
                        { step: 4, label: "Delivered" },
                      ].map((s) => {
                        const isDone = msg.orderStatus!.step >= s.step;
                        const isCurrent = msg.orderStatus!.step === s.step;
                        return (
                          <div key={s.step} className="flex flex-col items-center flex-1 relative">
                            <div
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition ${
                                isDone
                                  ? "bg-[#741832] text-white"
                                  : "bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400"
                              } ${isCurrent ? "ring-2 ring-[#B89A62] ring-offset-1" : ""}`}
                            >
                              {isDone ? <Check className="h-3 w-3" /> : s.step}
                            </div>
                            <span className="mt-1 text-[9px] font-medium text-stone-500 text-center">
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Courier and tracking */}
                    {msg.orderStatus.trackingNumber && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-stone-50 p-2 text-xs border border-stone-200/80 dark:bg-stone-700/50 dark:border-stone-600">
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-200">
                          <Truck className="h-3.5 w-3.5 text-[#741832] dark:text-amber-200" />
                          <span>
                            {msg.orderStatus.courier || "Courier"}: <strong>{msg.orderStatus.trackingNumber}</strong>
                          </span>
                        </div>
                        {msg.orderStatus.trackingUrl && (
                          <a
                            href={msg.orderStatus.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 font-semibold text-[#741832] hover:underline dark:text-amber-200"
                          >
                            <span>Track</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Destination details & Items */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 text-[11px] text-stone-600 dark:text-stone-300 dark:border-stone-700">
                      <div className="flex justify-between">
                        <span>Recipient: <strong>{msg.orderStatus.customerName}</strong></span>
                        <span>{msg.orderStatus.city}, {msg.orderStatus.pinCode}</span>
                      </div>
                      <div className="mt-1.5 space-y-1">
                        {msg.orderStatus.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-500">
                            <span className="truncate max-w-[200px]">
                              {it.quantity}x {it.productName}
                            </span>
                            <span>₹{it.lineTotal.toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between font-bold text-xs text-[#741832] pt-1 border-t border-dashed border-stone-200 dark:text-amber-200 dark:border-stone-700">
                        <span>Order Total:</span>
                        <span>₹{msg.orderStatus.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTP Security Prompt Card */}
                {msg.otpPrompt && msg.otpPrompt.step !== "VERIFIED" && (
                  <div className="mt-2.5 w-full rounded-xl border border-amber-300 bg-amber-50/70 p-3 shadow-xs dark:bg-stone-800 dark:border-amber-700">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Order Security Verification</span>
                    </div>
                    <p className="mt-1 text-[11px] text-amber-800 dark:text-stone-300 leading-normal">
                      We sent a 6-digit code to <strong>{msg.otpPrompt.maskedPhone}</strong> to verify ownership.
                    </p>

                    {msg.otpPrompt.devOtp && (
                      <p className="mt-1 text-[11px] text-emerald-700 font-semibold dark:text-emerald-400">
                        Dev Code: {msg.otpPrompt.devOtp}
                      </p>
                    )}

                    {msg.otpPrompt.error && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        <span>{msg.otpPrompt.error}</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                        className="w-28 rounded-md border border-stone-300 bg-white px-2 py-1 text-center text-xs tracking-widest font-mono text-stone-900 focus:border-[#741832] focus:outline-hidden dark:bg-stone-700 dark:border-stone-600 dark:text-white"
                      />
                      <button
                        type="button"
                        disabled={isVerifyingOtp || otpInput.length < 6}
                        onClick={() => handleVerifyOtp(msg.otpPrompt!)}
                        className="rounded-md bg-[#741832] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#5E1028] disabled:opacity-50 transition"
                      >
                        {isVerifyingOtp ? "Checking..." : "Verify & View"}
                      </button>
                      <button
                        type="button"
                        disabled={isVerifyingOtp}
                        onClick={() => handleResendOtp(msg.otpPrompt!)}
                        className="text-[11px] text-stone-600 hover:text-[#741832] underline"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp Handover Card */}
                {msg.whatsappHandover && (
                  <div className="mt-2.5 w-full rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-xs dark:bg-stone-800 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        <span>Speak with Thaagai Master Tailor</span>
                      </div>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-300">
                      Connect via WhatsApp for video fabric consultations, sizing queries, and bespoke requests.
                    </p>
                    <div className="mt-2.5 flex justify-end">
                      <a
                        href={msg.whatsappHandover.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#20ba5a] transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5 fill-white text-white" />
                        <span>{msg.whatsappHandover.label || "Open WhatsApp Chat"}</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Suggested Quick Replies */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {msg.quickReplies.map((qr, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSendMessage(qr)}
                        className="rounded-full border border-[#EBE1D7] bg-white/90 px-3 py-1 text-xs font-medium text-[#741832] shadow-2xs hover:bg-[#FAF7F2] hover:border-[#741832]/40 transition active:scale-95 disabled:opacity-50 dark:bg-stone-800 dark:border-stone-700 dark:text-amber-200"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 text-xs px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#741832]/10">
                  <Sparkles className="h-3.5 w-3.5 text-[#741832] animate-spin" />
                </div>
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#741832] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#741832] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#741832] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[11px] text-stone-500 italic">Thaagai Stylist is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-[#EBE1D7] bg-white p-3 rounded-b-2xl dark:bg-stone-900 dark:border-stone-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === "ta"
                    ? "குர்த்தி, தையல், ஆர்டர் பற்றி கேளுங்கள்..."
                    : "Ask about kurtis, sizes, custom tailoring, tracking..."
                }
                disabled={isLoading}
                className="flex-1 rounded-xl border border-stone-200 bg-[#FAF7F2] px-3.5 py-2 text-xs sm:text-sm text-[#4a2023] placeholder-stone-400 focus:border-[#741832] focus:bg-white focus:outline-hidden transition dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:focus:border-amber-300"
              />

              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#741832] text-white shadow-xs transition hover:bg-[#5E1028] disabled:opacity-40 disabled:hover:bg-[#741832]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-stone-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-stone-400" />
                <span>Guest shopping & private tracking</span>
              </span>
              <span>Thaagai Assistant v2.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
