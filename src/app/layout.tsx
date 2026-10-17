import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl, SITE_CONFIG } from "@/lib/seo";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_CONFIG.fullName,
    template: `%s | ${SITE_CONFIG.brandName} (${SITE_CONFIG.tamilName})`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "churidars",
    "kurtis",
    "sarees",
    "dupattas",
    "churidar sets",
    "tamil handloom",
    "chettinad cotton",
    "bespoke churidar",
    "anarkali suits",
    "made-to-measure tailoring",
    "handcrafted indian clothing",
  ],
  authors: [{ name: SITE_CONFIG.brandName, url: siteUrl }],
  creator: SITE_CONFIG.brandName,
  publisher: SITE_CONFIG.brandName,
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.defaultLocale,
    url: siteUrl,
    siteName: SITE_CONFIG.brandName,
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.fullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.fullName,
    description: SITE_CONFIG.description,
    images: [`${siteUrl}/og-image.jpg`],
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GSC_VERIFICATION ||
      process.env.GSC_VERIFICATION ||
      undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  themeColor: "#741832",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Noto+Sans:wght@400;500;600;700&family=Noto+Serif+Tamil:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var m=window.matchMedia('(prefers-color-scheme: dark)');function u(e){if(e.matches){d.classList.add('dark');}else{d.classList.remove('dark');}}u(m);if(m.addEventListener){m.addEventListener('change',u);}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-thaagai-bg text-thaagai-ink antialiased selection:bg-thaagai-gold/30 selection:text-thaagai-wine dark:bg-thaagai-cardDark dark:text-thaagai-inkDark">
        {children}
      </body>
    </html>
  );
}
