"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/cart-context";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-thaagai-sand text-thaagai-wine dark:bg-thaagai-sandDark">
            <ShoppingBag className="h-8 w-8" />
          </div>
        </div>
        <h1 className="mt-6 font-brand text-3xl font-bold tracking-tight text-thaagai-wine sm:text-4xl">
          Your Shopping Bag is Empty
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
          Discover our curated collection of handcrafted churidars, bespoke suits, and festive ensembles.
        </p>
        <div className="mt-8">
          <Link
            href="/shop"
            className="inline-flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-6 text-xs font-semibold text-white shadow-sm transition-all shimmer-sweep tap-bounce hover:bg-thaagai-wineHover"
          >
            <span>Start Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-baseline justify-between border-b border-thaagai-line/60 pb-4">
        <div>
          <h1 className="font-brand text-2xl font-bold tracking-tight text-thaagai-wine sm:text-3xl">
            Shopping Bag
          </h1>
          <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
            {itemCount} piece{itemCount === 1 ? "" : "s"} selected
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-medium text-rose-700 hover:underline dark:text-rose-400"
        >
          Clear bag
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Item List */}
        <div className="divide-y divide-thaagai-line/60 lg:col-span-8">
          {items.map((item) => {
            const unitPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div key={item.variantId} className="flex gap-4 py-5 sm:gap-6">
                {/* Thumbnail */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-thaagai-line bg-thaagai-sand/30 dark:bg-thaagai-sandDark/20">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-thaagai-ink/40">
                      No photo
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-serif text-base font-bold text-thaagai-ink hover:text-thaagai-wine dark:text-white"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name} from bag`}
                        className="flex h-8 w-8 items-center justify-center text-thaagai-ink/40 transition-transform tap-bounce hover:text-rose-600 active:scale-90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                      {item.size && <span>Size: <strong className="text-thaagai-ink dark:text-white">{item.size}</strong></span>}
                      {item.colour && <span>Colour: <strong className="text-thaagai-ink dark:text-white">{item.colour}</strong></span>}
                      <span className="font-mono text-[11px]">SKU: {item.sku}</span>
                    </div>

                    {item.customizations && (
                      <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                        <div className="flex items-center gap-1 font-semibold text-thaagai-maroon">
                          <Sparkles className="h-3 w-3 text-thaagai-gold" />
                          <span>Bespoke Tailoring Details</span>
                        </div>
                        {item.customizations.selections && (
                          <div className="mt-1 space-y-0.5 text-[11px]">
                            {item.customizations.selections.map((s: any, idx: number) => (
                              <div key={idx} className="text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                                • {s.groupName}: <strong>{s.optionName}</strong> {s.priceDelta && s.priceDelta > 0 ? `(+₹${s.priceDelta})` : ""}
                              </div>
                            ))}
                          </div>
                        )}
                        {item.customizations.measurements && (
                          <div className="mt-1 border-t border-amber-200/60 pt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                            {[
                              item.customizations.measurements.bust ? `Bust: ${item.customizations.measurements.bust}"` : null,
                              item.customizations.measurements.waist ? `Waist: ${item.customizations.measurements.waist}"` : null,
                              item.customizations.measurements.hips ? `Hips: ${item.customizations.measurements.hips}"` : null,
                              item.customizations.measurements.length ? `Length: ${item.customizations.measurements.length}"` : null,
                              item.customizations.measurements.shoulder ? `Shoulder: ${item.customizations.measurements.shoulder}"` : null,
                            ].filter(Boolean).join(" · ")}
                            {item.customizations.measurements.notes && (
                              <div className="italic mt-0.5">Note: &quot;{item.customizations.measurements.notes}&quot;</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-thaagai-line bg-white dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center text-thaagai-ink transition-transform tap-bounce hover:text-thaagai-wine active:scale-90 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-thaagai-ink dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center text-thaagai-ink transition-transform tap-bounce hover:text-thaagai-wine active:scale-90 disabled:opacity-30"
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-sans text-sm font-bold text-thaagai-wine">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-thaagai-ink/50">
                          ₹{unitPrice.toLocaleString("en-IN")} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-thaagai-line bg-white p-6 shadow-sm dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <h2 className="font-brand text-lg font-bold text-thaagai-ink dark:text-white">
              Order Summary
            </h2>

            <div className="mt-4 space-y-2 border-b border-thaagai-line/60 pb-4 text-xs">
              <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span>Pieces ({itemCount})</span>
                <span className="font-mono">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                <span>Estimated Shipping</span>
                <span className="text-emerald-700 font-semibold dark:text-emerald-400">Calculated on WhatsApp</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-sm font-bold text-thaagai-ink dark:text-white">Estimated Subtotal</span>
              <span className="font-sans text-xl font-bold text-thaagai-wine">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Mandatory Locked Disclosure */}
            <div className="mt-6 rounded-lg bg-thaagai-sand/40 p-3.5 text-center dark:bg-thaagai-sandDark/30">
              <p className="text-[11px] font-medium leading-relaxed text-thaagai-ink/80 dark:text-thaagai-inkDark/80">
                Orders are requests until the seller confirms them on WhatsApp.
              </p>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-thaagai-wine text-xs font-semibold text-white shadow-sm transition-all shimmer-sweep tap-bounce hover:bg-thaagai-wineHover"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/shop"
              className="mt-3 flex h-10 w-full items-center justify-center text-xs font-semibold text-thaagai-wine transition-transform tap-bounce hover:underline active:scale-95"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
