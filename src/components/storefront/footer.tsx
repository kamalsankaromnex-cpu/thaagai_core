import Link from "next/link";
import { TempleBorder, LotusMotif } from "@/components/storefront/tamil-motifs";
import { BrandLogo } from "@/components/storefront/brand-logo";

export interface FooterCategory {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
}

export interface StoreProfileConfig {
  storeName?: string;
  tagline?: string;
  supportPhone?: string;
  orderNotice?: string;
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
  };
}

interface FooterProps {
  categories?: FooterCategory[];
  storeProfile?: StoreProfileConfig | null;
}

export function Footer({ categories = [], storeProfile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Find active Churidars category if provided by database
  const churidarCategory = categories.find(
    (c) =>
      c.active !== false &&
      (c.slug.toLowerCase() === "churidars" || c.name.toLowerCase() === "churidars")
  );
  const showChuridars = churidarCategory ? churidarCategory.active !== false : true;

  const social = storeProfile?.socialLinks;
  const hasSocialLinks = Boolean(
    social &&
      (social.instagram?.trim() ||
        social.facebook?.trim() ||
        social.youtube?.trim() ||
        social.whatsapp?.trim())
  );

  return (
    <footer className="mt-20 border-t border-thaagai-line bg-[#FAF7F2] text-thaagai-ink dark:border-thaagai-line/20 dark:bg-thaagai-cardDark dark:text-thaagai-inkDark">
      {/* Decorative Traditional Temple Border Motif */}
      <TempleBorder className="w-full text-thaagai-gold/30" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          
          {/* =========================================================================
              1. BRAND
             ========================================================================= */}
          <div className="space-y-4">
            <BrandLogo imageClassName="h-9 w-auto object-contain" />
            <p className="text-xs leading-relaxed text-thaagai-ink/75 dark:text-thaagai-inkDark/75">
              Modern Indian luxury inspired by ancient Tamil textile traditions,
              handloom weaves, and artisanal bespoke tailoring.
            </p>
            
            <div className="flex items-center gap-2 pt-1 text-xs text-thaagai-wine">
              <LotusMotif className="h-4 w-4 text-thaagai-gold" />
              <span className="font-medium">Tradition in Every Thread</span>
            </div>

            {/* Social media links, only when configured */}
            {hasSocialLinks && (
              <div className="flex items-center gap-3 pt-2">
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow THAAGAI on Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand/60 text-thaagai-wine transition-colors hover:bg-thaagai-wine hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow THAAGAI on Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand/60 text-thaagai-wine transition-colors hover:bg-thaagai-wine hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                )}
                {social?.whatsapp && (
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Connect with THAAGAI on WhatsApp"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-thaagai-sand/60 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              2. SHOP
              - All Products
              - New Arrivals
              - Offers & Sale
              - Churidars
              - Custom Made
             ========================================================================= */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-thaagai-wine">
              Shop
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/shop"
                  className="font-medium text-thaagai-ink transition-colors hover:text-thaagai-wine hover:underline dark:text-white"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?filter=new"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?filter=offers"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Offers &amp; Sale
                </Link>
              </li>
              {showChuridars && (
                <li>
                  <Link
                    href={`/category/${churidarCategory?.slug || "churidars"}`}
                    className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                  >
                    {churidarCategory?.name || "Churidars"}
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/custom-made"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Custom Made
                </Link>
              </li>
            </ul>
          </div>

          {/* =========================================================================
              3. CUSTOMER CARE
              - Contact Us
              - Shipping Policy
              - Returns & Refunds
              - Order Tracking
             ========================================================================= */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-thaagai-wine">
              Customer Care
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/about"
                  className="font-medium text-thaagai-ink transition-colors hover:text-thaagai-wine hover:underline dark:text-white"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/return-refund-policy"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* =========================================================================
              4. POLICIES
              - Privacy Policy
              - Terms & Conditions
              - Cancellation Policy
              - Refund Policy
             ========================================================================= */}
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-thaagai-wine">
              Policies
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/return-refund-policy#cancellation"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/return-refund-policy"
                  className="text-thaagai-ink/80 transition-colors hover:text-thaagai-wine hover:underline dark:text-thaagai-inkDark/80"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* =========================================================================
            5. FOOTER BOTTOM
            - Dynamic copyright year
            - THAAGAI brand name
            - Payment-method icons for supported methods (UPI, Bank Transfer, Cards)
           ========================================================================= */}
        <div className="mt-12 flex flex-col items-center justify-between gap-5 border-t border-thaagai-line/60 pt-8 text-xs text-thaagai-ink/70 sm:flex-row dark:border-thaagai-line/20 dark:text-thaagai-inkDark/70">
          
          {/* Copyright & Brand */}
          <div className="text-center sm:text-left">
            <p>
              © {currentYear} <strong className="font-serif tracking-wider text-thaagai-wine">THAAGAI</strong>. All rights reserved.
            </p>
            <p className="mt-1 text-[11px] text-thaagai-gold">
              Crafted with pride in Tamil Nadu
            </p>
          </div>

          {/* Right-aligned: Powered by KAAMASI Solutions */}
          <div className="text-center sm:text-right">
            <p className="text-[11px] tracking-wider text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
              Powered by
            </p>
            <p className="font-serif text-sm font-semibold tracking-wide text-thaagai-wine dark:text-thaagai-gold">
              KAAMASI Solutions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
