import { Navbar, NavigationCategory } from "@/components/storefront/navbar";
import { Footer, StoreProfileConfig } from "@/components/storefront/footer";
import { AnnouncementBar, AnnouncementBarConfig } from "@/components/storefront/announcement-bar";
import { MobileBottomNav } from "@/components/storefront/mobile-bottom-nav";
import { WhatsAppFloatingConcierge } from "@/components/storefront/whatsapp-floating-concierge";
import { AiChatAssistant } from "@/components/storefront/ai-chat-assistant";
import { CartProvider } from "@/context/cart-context";
import { CustomerAuthProvider } from "@/context/customer-auth-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { CurrencyProvider } from "@/context/currency-context";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: NavigationCategory[] = [];
  let storeProfile: StoreProfileConfig | null = null;
  let announcementConfig: AnnouncementBarConfig | null = null;

  try {
    const [fetchedCategories, settingsRecord, announcementRecord] = await Promise.all([
      db.category.findMany({
        where: { active: true },
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          active: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
      db.storeSetting.findUnique({
        where: { key: "store_profile" },
      }),
      db.storeSetting.findUnique({
        where: { key: "announcement_bar" },
      }),
    ]);

    categories = fetchedCategories;
    storeProfile = settingsRecord?.value as StoreProfileConfig | null;
    announcementConfig = announcementRecord?.value as AnnouncementBarConfig | null;
  } catch (err) {
    console.error("Failed to load layout navigation categories:", err);
  }

  return (
    <CustomerAuthProvider>
      <CurrencyProvider>
        <WishlistProvider>
          <CartProvider>
            {/* Accessible skip link */}
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-thaagai-wine focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
            >
              Skip to main content
            </a>

            {/* Global Shared Two-Row Header & Category Navigation */}
            <Navbar categories={categories} tagline={storeProfile?.tagline} />

            {/* Admin-Configured Storefront Announcement Bar (Row 3) */}
            <AnnouncementBar config={announcementConfig} />

            {/* Main Storefront Area */}
            <main id="main-content" className="flex-1 pb-16 md:pb-0">
              {children}
            </main>

            {/* Global Shared Footer */}
            <Footer categories={categories} storeProfile={storeProfile} />

            {/* Smartphone Bottom Navigation Bar (Hidden on desktop, PDP & checkout) */}
            <MobileBottomNav />

            {/* Floating Boutique WhatsApp Concierge Button */}
            <WhatsAppFloatingConcierge whatsappNumber={storeProfile?.supportPhone} />

            {/* Floating Thaagai AI Stylist & Customer Assistance Chatbot */}
            <AiChatAssistant />
          </CartProvider>
        </WishlistProvider>
      </CurrencyProvider>
    </CustomerAuthProvider>
  );
}
