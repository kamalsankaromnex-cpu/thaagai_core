import { db } from "@/lib/db";
import { requestOtp, verifyOtp, normalizeIndianMobile, OtpError } from "@/server/auth/otp-service";
import { getWhatsAppBusinessNumber, buildWhatsAppLink } from "@/lib/whatsapp";
import { OrderStatus } from "@prisma/client";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  productType: string;
  shortDescription: string | null;
  sizes: string[];
  colors: string[];
  primaryVariantId: string;
  sku: string;
  stockQuantity: number;
}

export interface CustomizationOptionSelection {
  groupName: string;
  optionName: string;
  priceDelta: number;
}

export interface CustomizationSummary {
  productName: string;
  productSlug: string;
  topStyle: string;
  neckline: string;
  sleeve: string;
  bottomCut: string;
  lining: string;
  basePrice: number;
  priceDelta: number;
  totalPrice: number;
  estimatedDays: string;
  selections: CustomizationOptionSelection[];
}

export interface OrderStatusCard {
  reference: string;
  status: string;
  statusLabel: string;
  step: number; // 1: Placed, 2: Confirmed/Tailoring, 3: Dispatched, 4: Delivered
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  total: number;
  currency: string;
  createdAt: string;
  shippedAt?: string | null;
  items: Array<{
    productName: string;
    variantLabel?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    customizations?: any;
  }>;
}

export interface OtpPrompt {
  step: "REQUESTED" | "VERIFIED" | "FAILED";
  reference: string;
  phone: string;
  maskedPhone: string;
  expiresInSeconds?: number;
  devOtp?: string;
  error?: string;
}

export interface WhatsAppHandover {
  phone: string;
  text: string;
  url: string;
  label?: string;
}

export interface AssistantResponse {
  message: string;
  language: "en" | "ta";
  quickReplies: string[];
  products?: ProductCard[];
  customization?: CustomizationSummary;
  orderStatus?: OrderStatusCard;
  otpPrompt?: OtpPrompt;
  whatsappHandover?: WhatsAppHandover;
}

export interface ChatContext {
  currentPath?: string;
  customerId?: string;
  customerPhone?: string;
  customerName?: string;
  pendingOtpPhone?: string;
  pendingOtpRef?: string;
  otpCode?: string;
  isOtpVerified?: boolean;
  preferredLanguage?: "en" | "ta";
}

/** Detects if the prompt is predominantly Tamil */
export function isTamilInput(text: string): boolean {
  // Check for Tamil Unicode characters range [\u0B80-\u0BFF]
  const tamilCharCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  if (tamilCharCount >= 2) return true;

  // Common transliterated Tamil keywords
  const transliteratedPatterns = [
    /\bvanakkam\b/i,
    /\bkurti\s+vilai\b/i,
    /\bordar\b/i,
    /\benna\s+vilai\b/i,
    /\beppadi\b/i,
    /\bthuniyil\b/i,
    /\bthaikkalaamaa\b/i,
  ];
  return transliteratedPatterns.some((pattern) => pattern.test(text));
}

/** Extracts order reference like TG-XXXXX or THA-XXXX from free text */
export function extractOrderReference(text: string): string | null {
  const match = text.match(/\b(TG-[A-Z0-9]{4,16}|THA-[A-Z0-9-]{4,20})\b/i);
  return match ? match[1].toUpperCase() : null;
}

/** Extracts 10-digit Indian mobile number from text */
export function extractMobileNumber(text: string): string | null {
  const match = text.match(/(?:\+?91[\s-]?)?([6-9]\d{9})\b/);
  return match ? match[1] : null;
}

/** Extracts 6-digit OTP code from text */
export function extractOtpCode(text: string): string | null {
  const match = text.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

/** Maps OrderStatus enum to customer-friendly display and step number */
export function mapOrderStatusToDisplay(status: OrderStatus): { label: string; step: number; description: string } {
  switch (status) {
    case OrderStatus.PENDING_WHATSAPP:
    case OrderStatus.PENDING_WHATSAPP_CONFIRMATION:
    case OrderStatus.SUBMITTED_BY_CUSTOMER:
      return {
        label: "Request Received",
        step: 1,
        description: "Your order request has been logged. Our concierge is reviewing measurements and fabric availability.",
      };
    case OrderStatus.CONFIRMED:
      return {
        label: "Confirmed",
        step: 2,
        description: "Order confirmed! Fabric has been reserved and queued for tailoring.",
      };
    case OrderStatus.PROCESSING:
      return {
        label: "In Tailoring & Quality Check",
        step: 2,
        description: "Your garment is currently being cut, stitched, and physically quality-inspected by our master tailors.",
      };
    case OrderStatus.READY_FOR_DISPATCH:
      return {
        label: "Packed & Ready",
        step: 2,
        description: "Finishing touches complete. Package is boxed and awaiting courier pickup.",
      };
    case OrderStatus.SHIPPED:
      return {
        label: "Dispatched & On the Way",
        step: 3,
        description: "Your order has been handed to our courier partner and is on its way to you.",
      };
    case OrderStatus.DELIVERED:
      return {
        label: "Delivered",
        step: 4,
        description: "Delivered safely! We hope you love every thread. Remember our 48-hour return window for any fit queries.",
      };
    case OrderStatus.CANCELLED:
      return {
        label: "Cancelled",
        step: 0,
        description: "This order request has been cancelled.",
      };
    case OrderStatus.RETURN_REQUESTED:
      return {
        label: "Return Requested",
        step: 3,
        description: "Return request received and currently under review by our support team.",
      };
    case OrderStatus.RETURNED:
      return {
        label: "Returned",
        step: 4,
        description: "Garment received back at our boutique studio.",
      };
    case OrderStatus.REFUNDED:
      return {
        label: "Refunded",
        step: 4,
        description: "Full refund has been credited back to your original payment mode.",
      };
    default:
      return {
        label: "In Progress",
        step: 2,
        description: "Order is currently being handled by the Thaagai team.",
      };
  }
}

/** Formats courier tracking URL */
function getTrackingUrl(courier: string | null, trackingNumber: string | null): string | null {
  if (!trackingNumber) return null;
  const c = (courier || "").toLowerCase();
  if (c.includes("dtdc")) return `https://www.dtdc.in/tracking/shipment-tracking.asp?trno=${trackingNumber}`;
  if (c.includes("delhivery")) return `https://www.delhivery.com/track/package/${trackingNumber}`;
  if (c.includes("bluedart")) return `https://www.bluedart.com/tracking?trackNumber=${trackingNumber}`;
  if (c.includes("post") || c.includes("speed")) return `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx`;
  return `https://www.google.com/search?q=${encodeURIComponent(`${courier || "courier"} tracking ${trackingNumber}`)}`;
}

/**
 * Searches the real database for active products based on user intent keywords
 */
export async function searchCatalog(query: string, options: { maxPrice?: number; limit?: number } = {}): Promise<ProductCard[]> {
  const clean = query.toLowerCase();
  const limit = options.limit || 4;

  // Extract price filter from query if not already passed
  let maxPrice = options.maxPrice;
  if (!maxPrice) {
    const underMatch = clean.match(/(?:under|below|less than|within|upto|up to)\s*(?:rs\.?|inr|₹)?\s*(\d{3,6})/i);
    if (underMatch) {
      maxPrice = parseInt(underMatch[1], 10);
    }
  }

  // Keywords detection
  const isSilk = clean.includes("silk") || clean.includes("kanchipuram") || clean.includes("raw silk") || clean.includes("pattu");
  const isCotton = clean.includes("cotton") || clean.includes("mulmul") || clean.includes("handloom");
  const isCustom = clean.includes("custom") || clean.includes("bespoke") || clean.includes("tailor") || clean.includes("stitch");
  const isChuridar = clean.includes("churidar") || clean.includes("suit") || clean.includes("salwar");
  const isKurti = clean.includes("kurti") || clean.includes("kurtis") || clean.includes("tunic") || clean.includes("top");
  const isSaree = clean.includes("saree") || clean.includes("sari");
  const isDupatta = clean.includes("dupatta") || clean.includes("stole");
  const isSet = clean.includes("set") || clean.includes("3 piece") || clean.includes("ensemble");

  try {
    const products = await db.product.findMany({
      where: {
        status: "ACTIVE",
        ...(maxPrice ? { basePrice: { lte: maxPrice } } : {}),
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 2,
        },
        variants: {
          where: { active: true },
          take: 6,
        },
        categories: {
          include: { category: true },
        },
      },
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
      ],
      take: 20, // get candidate pool
    });

    if (!products.length) return [];

    // Score and rank candidates based on keyword matches
    const scored = products.map((prod) => {
      let score = 0;
      const text = `${prod.name} ${prod.description || ""} ${prod.shortDescription || ""}`.toLowerCase();

      if (isSilk && (text.includes("silk") || text.includes("kanchipuram"))) score += 10;
      if (isCotton && (text.includes("cotton") || text.includes("mulmul"))) score += 10;
      if (isCustom && prod.productType === "CUSTOM_MADE") score += 12;
      if (isChuridar && (text.includes("churidar") || text.includes("suit"))) score += 8;
      if (isKurti && (text.includes("kurti") || text.includes("kurta"))) score += 8;
      if (isSaree && text.includes("saree")) score += 10;
      if (isDupatta && text.includes("dupatta")) score += 10;
      if (isSet && text.includes("set")) score += 8;

      // Color matching
      ["maroon", "gold", "green", "ochre", "blue", "wine", "amber", "copper"].forEach((color) => {
        if (clean.includes(color) && text.includes(color)) score += 6;
      });

      // Occasion matching
      if ((clean.includes("office") || clean.includes("daily") || clean.includes("work")) && (text.includes("daily") || text.includes("mulmul") || text.includes("cotton"))) {
        score += 8;
      }
      if ((clean.includes("wedding") || clean.includes("bridal") || clean.includes("party") || clean.includes("festive")) && (text.includes("silk") || text.includes("bridal") || text.includes("celebration"))) {
        score += 8;
      }

      return { prod, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Pick top items
    const selected = scored.slice(0, limit).map(({ prod }) => {
      const primaryImage = prod.images.find((img) => img.isPrimary) || prod.images[0];
      const primaryVariant = prod.variants[0] || {
        id: prod.id,
        sku: prod.sku || "TG-DEF",
        stockQuantity: 10,
        size: "M",
        colour: "Standard",
      };

      const sizes = Array.from(new Set(prod.variants.map((v) => v.size).filter(Boolean))) as string[];
      const colors = Array.from(new Set(prod.variants.map((v) => v.colour).filter(Boolean))) as string[];

      // Resolve image URL
      let imageUrl = primaryImage?.storageKey || null;
      if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
        imageUrl = `/api/storage/${imageUrl}`;
      }
      if (!imageUrl) {
        // Fallback placeholder based on type
        imageUrl = prod.productType === "CUSTOM_MADE"
          ? "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
          : "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80";
      }

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: Number(prod.basePrice),
        salePrice: prod.salePrice ? Number(prod.salePrice) : null,
        imageUrl,
        productType: prod.productType,
        shortDescription: prod.shortDescription,
        sizes: sizes.length ? sizes : ["S", "M", "L", "XL"],
        colors: colors.length ? colors : ["Natural"],
        primaryVariantId: primaryVariant.id,
        sku: primaryVariant.sku || prod.sku || "TG-ITEM",
        stockQuantity: primaryVariant.stockQuantity ?? 10,
      };
    });

    return selected;
  } catch (err) {
    console.error("Catalog search error in AI Assistant:", err);
    return [];
  }
}

/**
 * Builds customisation configuration from free-text preferences
 */
export async function buildCustomizationSummary(text: string): Promise<CustomizationSummary> {
  const clean = text.toLowerCase();

  // Try to find the custom bespoke product in the DB for accurate baseline pricing
  let basePrice = 5400;
  let productName = "Bespoke Kanchipuram Silk Bridal Churidar Suit";
  let productSlug = "bespoke-kanchipuram-silk-bridal-churidar";

  try {
    const customProduct = await db.product.findFirst({
      where: { productType: "CUSTOM_MADE", status: "ACTIVE" },
      include: {
        customizationGroups: {
          include: { options: true },
        },
      },
    });

    if (customProduct) {
      basePrice = Number(customProduct.basePrice);
      productName = customProduct.name;
      productSlug = customProduct.slug;
    }
  } catch {
    // fallback gracefully
  }

  // 1. Top Silhouette
  let topStyle = "Straight Cut Kurta (Classic)";
  let topDelta = 0;
  if (clean.includes("anarkali") || clean.includes("flare") || clean.includes("kali")) {
    topStyle = "Flared Anarkali Silhouette";
    topDelta = 600;
  } else if (clean.includes("a-line") || clean.includes("aline")) {
    topStyle = "A-Line Cut Kurta";
    topDelta = 200;
  }

  // 2. Neckline Pattern
  let neckline = "Classic Sweetheart Neck";
  let neckDelta = 0;
  if (clean.includes("boat") || clean.includes("boat neck") || clean.includes("high neck")) {
    neckline = "High Boat Neck with Zari Piping";
    neckDelta = 150;
  } else if (clean.includes("mandarin") || clean.includes("collar") || clean.includes("chinese collar")) {
    neckline = "Mandarin Collar with Placket";
    neckDelta = 250;
  } else if (clean.includes("potli") || clean.includes("round") || clean.includes("front slit")) {
    neckline = "Round Neck with Front Slit & Potli Buttons";
    neckDelta = 100;
  } else if (clean.includes("v neck") || clean.includes("v-neck")) {
    neckline = "Graceful V-Neck with Antique Zari";
    neckDelta = 120;
  }

  // 3. Sleeve Style
  let sleeve = "Elbow Length Sleeves (11-inch)";
  let sleeveDelta = 0;
  if (clean.includes("3/4") || clean.includes("three quarter") || clean.includes("wrist")) {
    sleeve = "3/4th Sleeves with Zari Cuff";
    sleeveDelta = 200;
  } else if (clean.includes("full") || clean.includes("long sleeve")) {
    sleeve = "Full Sleeves with Gathered Cuffs";
    sleeveDelta = 350;
  } else if (clean.includes("sleeveless") || clean.includes("cut sleeve")) {
    sleeve = "Sleeveless with Contrast Piping";
    sleeveDelta = 0;
  }

  // 4. Bottom Trouser Cut
  let bottomCut = "Traditional Gathered Churidar";
  let bottomDelta = 0;
  if (clean.includes("pant") || clean.includes("cigarette") || clean.includes("straight pant")) {
    bottomCut = "Tailored Slim Cigarette Pants";
    bottomDelta = 150;
  } else if (clean.includes("palazzo") || clean.includes("wide leg")) {
    bottomCut = "Flared Palazzo Bottom with Zari Hem";
    bottomDelta = 250;
  } else if (clean.includes("salwar") || clean.includes("patiala")) {
    bottomCut = "Pleated Punjabi Salwar";
    bottomDelta = 100;
  }

  // 5. Lining Option
  let lining = "Pure Cotton Voile (Breathable & Skin-Friendly)";
  let liningDelta = 150;
  if (clean.includes("santoon") || clean.includes("heavy lining")) {
    lining = "Heavy Royal Santoon Lining";
    liningDelta = 300;
  } else if (clean.includes("crepe") || clean.includes("butter crepe")) {
    lining = "Smooth Butter Crepe Lining";
    liningDelta = 0;
  }

  const selections: CustomizationOptionSelection[] = [
    { groupName: "Top Cut Style", optionName: topStyle, priceDelta: topDelta },
    { groupName: "Neckline Pattern", optionName: neckline, priceDelta: neckDelta },
    { groupName: "Sleeve Style", optionName: sleeve, priceDelta: sleeveDelta },
    { groupName: "Bottom Trouser Cut", optionName: bottomCut, priceDelta: bottomDelta },
    { groupName: "Inner Lining", optionName: lining, priceDelta: liningDelta },
  ];

  const totalDelta = selections.reduce((sum, item) => sum + item.priceDelta, 0);
  const totalPrice = basePrice + totalDelta;

  return {
    productName,
    productSlug,
    topStyle,
    neckline,
    sleeve,
    bottomCut,
    lining,
    basePrice,
    priceDelta: totalDelta,
    totalPrice,
    estimatedDays: "7 to 10 business days for bespoke made-to-measure tailoring",
    selections,
  };
}

/**
 * Handles guest order lookup with privacy protection and OTP verification
 */
export async function lookupOrderWithSecurity(
  orderRefOrPhone: string,
  context: ChatContext
): Promise<{ order?: OrderStatusCard; otpPrompt?: OtpPrompt; error?: string }> {
  const clean = orderRefOrPhone.trim();
  const isRef = /^TG-[A-Z0-9]{4,16}$/i.test(clean) || /^THA-[A-Z0-9-]{4,20}$/i.test(clean);
  const isPhone = /^[6-9]\d{9}$/.test(clean.replace(/[\s-+]/g, "").slice(-10));

  try {
    let order: any = null;

    if (isRef) {
      order = await db.orderRequest.findUnique({
        where: { reference: clean.toUpperCase() },
        include: { items: true },
      });
    } else if (isPhone) {
      const cleanPhone = clean.replace(/[\s-+]/g, "").slice(-10);
      order = await db.orderRequest.findFirst({
        where: { customerPhone: cleanPhone },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });
    }

    if (!order) {
      return {
        error: `I couldn't locate any order matching "${clean}". Please verify your Thaagai Order Reference (e.g. TG-XXXXXX) or your registered 10-digit mobile number.`,
      };
    }

    // Security Check: Customer privacy protection
    // If the customer is logged in and matches the order's phone or customerId, bypass OTP
    const isCustomerMatch =
      (context.customerId && order.customerId === context.customerId) ||
      (context.customerPhone && order.customerPhone === context.customerPhone.slice(-10));

    // If already verified or OTP code is provided in context, attempt to verify it
    if (context.isOtpVerified) {
      // Authenticated via OTP verification
    } else if (context.otpCode && context.pendingOtpPhone) {
      try {
        await verifyOtp(context.pendingOtpPhone, context.otpCode);
        // OTP succeeded! Reveal order details
      } catch (err: any) {
        return {
          otpPrompt: {
            step: "FAILED",
            reference: order.reference,
            phone: order.customerPhone,
            maskedPhone: `+91 ******${order.customerPhone.slice(-4)}`,
            error: err.message || "Invalid OTP code. Please try again.",
          },
        };
      }
    } else if (!isCustomerMatch) {
      // Guest or unverified user: Trigger OTP verification flow to protect customer privacy!
      try {
        const otpResult = await requestOtp(order.customerPhone);
        return {
          otpPrompt: {
            step: "REQUESTED",
            reference: order.reference,
            phone: order.customerPhone,
            maskedPhone: `+91 ******${order.customerPhone.slice(-4)}`,
            expiresInSeconds: otpResult.expiresInSeconds,
            devOtp: otpResult.devOtp, // available in dev mode
          },
        };
      } catch (err: any) {
        if (err instanceof OtpError && err.code === "COOLDOWN_ACTIVE") {
          return {
            otpPrompt: {
              step: "REQUESTED",
              reference: order.reference,
              phone: order.customerPhone,
              maskedPhone: `+91 ******${order.customerPhone.slice(-4)}`,
              expiresInSeconds: 600,
              error: err.message,
            },
          };
        }
        return { error: `Could not initiate verification: ${err.message}` };
      }
    }

    // Build the secure order card
    const statusMeta = mapOrderStatusToDisplay(order.status);
    const trackingUrl = getTrackingUrl(order.courier, order.trackingNumber);

    const orderCard: OrderStatusCard = {
      reference: order.reference,
      status: order.status,
      statusLabel: statusMeta.label,
      step: statusMeta.step,
      customerName: order.customerName,
      customerPhone: `+91 ******${order.customerPhone.slice(-4)}`, // masked for display
      address: order.address,
      city: order.city,
      state: order.state,
      pinCode: order.pinCode,
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      trackingUrl,
      total: Number(order.total),
      currency: order.currency || "INR",
      createdAt: order.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      shippedAt: order.shippedAt ? order.shippedAt.toLocaleDateString("en-IN") : null,
      items: order.items.map((it: any) => ({
        productName: it.productName,
        variantLabel: it.variantLabel,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        lineTotal: Number(it.lineTotal),
        customizations: it.customizations,
      })),
    };

    return { order: orderCard };
  } catch (err: any) {
    console.error("Order lookup error in AI Assistant:", err);
    return { error: "An unexpected error occurred while retrieving order records." };
  }
}

/**
 * Main AI Assistant processor
 * Accepts recent messages and context, executes intent classification,
 * queries live database tools, and crafts a helpful, empathetic, contextual response.
 */
export async function processChat(
  messages: ChatMessage[],
  context: ChatContext = {}
): Promise<AssistantResponse> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const rawInput = lastUserMessage?.content || "";
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  const isTamil = isTamilInput(input) || context.preferredLanguage === "ta";
  const whatsappPhone = getWhatsAppBusinessNumber();

  // 1. Check for Order Tracking / OTP verification intent
  const extractedRef = extractOrderReference(input) || context.pendingOtpRef;
  const extractedPhone = extractMobileNumber(input) || context.pendingOtpPhone;
  const extractedOtp = extractOtpCode(input) || context.otpCode;

  const isOrderQuery =
    Boolean(extractedRef) ||
    lower.includes("track") ||
    lower.includes("where is my order") ||
    lower.includes("order status") ||
    lower.includes("shipment") ||
    lower.includes("delivery status") ||
    lower.includes("ஆர்டர்") ||
    lower.includes("டெலிவரி");

  if (isOrderQuery) {
    if (extractedRef || extractedPhone) {
      const targetQuery = extractedRef || extractedPhone || "";
      const { order, otpPrompt, error } = await lookupOrderWithSecurity(targetQuery, {
        ...context,
        otpCode: extractedOtp || undefined,
        pendingOtpPhone: context.pendingOtpPhone || (extractedPhone ? normalizeIndianMobile(extractedPhone) : undefined),
      });

      if (order) {
        const msg = isTamil
          ? `உங்கள் ஆர்டர் **${order.reference}** விவரங்கள் இதோ! நிலை: **${order.statusLabel}**.`
          : `I found your order **${order.reference}**! It is currently **${order.statusLabel}**.`;
        return {
          message: `${msg}\n\n${mapOrderStatusToDisplay(order.status as OrderStatus).description}`,
          language: isTamil ? "ta" : "en",
          orderStatus: order,
          quickReplies: isTamil
            ? ["கொரியர் கண்காணிப்பு", "திரும்பப் பெறுதல் கொள்கை", "வாட்ஸ்அப் ஆதரவு"]
            : ["Track Courier", "Return Policy", "WhatsApp Support", "Explore Kurtis"],
        };
      }

      if (otpPrompt) {
        if (otpPrompt.step === "FAILED") {
          return {
            message: isTamil
              ? `மன்னிக்கவும், தவறான OTP குறியீடு. தயவுசெய்து உங்கள் 6-இலக்க குறியீட்டை மீண்டும் உள்ளிடவும்.`
              : `That verification code was incorrect. Please check your SMS and enter the 6-digit code sent to ${otpPrompt.maskedPhone}.`,
            language: isTamil ? "ta" : "en",
            otpPrompt,
            quickReplies: ["Resend OTP", "Talk to WhatsApp Concierge"],
          };
        }

        const devNotice = otpPrompt.devOtp ? ` (Simulated dev OTP: **${otpPrompt.devOtp}**)` : "";
        return {
          message: isTamil
            ? `உங்கள் தனியுரிமையைப் பாதுகாக்க, **${otpPrompt.maskedPhone}** என்ற எண்ணிற்கு 6-இலக்க சரிபார்ப்புக் குறியீடு அனுப்பப்பட்டுள்ளது.${devNotice} உங்கள் ஆர்டரைப் பார்க்க OTP-ஐ உள்ளிடவும்:`
            : `To protect your personal delivery and order details, I've dispatched a 6-digit verification code to **${otpPrompt.maskedPhone}** via SMS.${devNotice} Please enter the code below to view your full shipment and tracking timeline:`,
          language: isTamil ? "ta" : "en",
          otpPrompt,
          quickReplies: otpPrompt.devOtp ? [`Enter ${otpPrompt.devOtp}`, "Resend OTP", "Change Phone"] : ["Resend OTP", "Contact Concierge"],
        };
      }

      if (error) {
        return {
          message: error,
          language: isTamil ? "ta" : "en",
          quickReplies: isTamil
            ? ["ஆர்டர் எண் கொடுங்கள்", "வாட்ஸ்அப் ஆதரவு"]
            : ["Check Order Reference", "Talk to Human Concierge", "Browse Kurtis"],
        };
      }
    } else {
      return {
        message: isTamil
          ? "உங்கள் ஆர்டரைக் கண்காணிக்க, உங்கள் **ஆர்டர் குறிப்பு எண்** (எ.கா: TG-123456) அல்லது பதிவுசெய்யப்பட்ட **10-இலக்க மொபைல் எண்ணை** பகிரவும்."
          : "I would be delighted to track your order! Please share your **Order Reference** (e.g. TG-XXXXXX) or your **10-digit mobile number** used during checkout.",
        language: isTamil ? "ta" : "en",
        quickReplies: isTamil
          ? ["என்னிடம் TG எண் உள்ளது", "மொபைல் எண் மூலம் பார்க்க", "வாட்ஸ்அப் ஆதரவு"]
          : ["I have a TG- Reference", "Track with Mobile Number", "Speak with Stylist"],
      };
    }
  }

  // 2. Customisation & Bespoke Inquiries
  const isCustomizationQuery =
    lower.includes("custom") ||
    lower.includes("bespoke") ||
    lower.includes("neck") ||
    lower.includes("sleeve") ||
    lower.includes("stitch") ||
    lower.includes("tailor") ||
    lower.includes("measurement") ||
    lower.includes("length") ||
    lower.includes("lining") ||
    lower.includes("bottom cut") ||
    lower.includes("pant") ||
    lower.includes("salwar") ||
    lower.includes("cigarette") ||
    lower.includes("sweetheart") ||
    lower.includes("தையல்") ||
    lower.includes("கஸ்டமைஸ்");

  if (isCustomizationQuery) {
    const summary = await buildCustomizationSummary(input);
    const msg = isTamil
      ? `தாகையின் பிரத்யேக தையல் கலையின் மூலம் உங்கள் உடலமைப்பிற்கு ஏற்ப ஆடைகளை தைத்து தருகிறோம் ✂️\n\nநீங்கள் விரும்பிய விருப்பங்கள்:\n• **கழுத்து வடிவம்**: ${summary.neckline}\n• **கை வடிவமைப்பு**: ${summary.sleeve}\n• **கீழ் ஆடை**: ${summary.bottomCut}\n• **உட்புற லைனிங்**: ${summary.lining}\n\nமொத்த கணக்கீடு: ₹${summary.totalPrice.toLocaleString("en-IN")}. மேலும் அளவுகளை துல்லியமாக வழங்க எங்கள் ஸ்டுடியோவிற்கு செல்லலாம்!`
      : `At Thaagai, every thread is tailored to touch your soul ✂️ We offer complete made-to-measure customisation crafted to your exact height, bust, waist, and silhouette.\n\nHere is your custom curation based on your preferences:\n• **Neckline**: ${summary.neckline}\n• **Sleeves**: ${summary.sleeve}\n• **Bottom Cut**: ${summary.bottomCut}\n• **Inner Lining**: ${summary.lining}\n\n**Estimated Price**: ₹${summary.totalPrice.toLocaleString("en-IN")} *(Includes luxury handloom silk/cotton, custom pattern drafting & tailoring)*.\nTimeline: 7–10 business days with complimentary 2-inch side seam margins for future adjustments.`;

    return {
      message: msg,
      language: isTamil ? "ta" : "en",
      customization: summary,
      quickReplies: isTamil
        ? ["தையல் அளவுகள் வழிகாட்டி", "ஸ்டுடியோவில் ஆர்டர் செய்க", "வாட்ஸ்அப் மாஸ்டர் டெய்லர்"]
        : ["Customise in 3D Studio", "Measurement Guide", "Talk to Master Tailor", "Explore Ready Kurtis"],
      whatsappHandover: {
        phone: whatsappPhone,
        text: `Hello Thaagai! I would like to order a bespoke suit with ${summary.neckline}, ${summary.sleeve}, and ${summary.bottomCut}.`,
        url: buildWhatsAppLink(whatsappPhone, `Hello Thaagai! I want to order a bespoke suit with ${summary.neckline}, ${summary.sleeve}, and ${summary.bottomCut}.`),
        label: "Chat with Master Tailor",
      },
    };
  }

  // 3. Human Escalation / WhatsApp Concierge
  const isEscalation =
    lower.includes("human") ||
    lower.includes("agent") ||
    lower.includes("executive") ||
    lower.includes("person") ||
    lower.includes("whatsapp") ||
    lower.includes("call") ||
    lower.includes("phone number") ||
    lower.includes("support team") ||
    lower.includes("மனிதாபிமான") ||
    lower.includes("நேரடி உதவி");

  if (isEscalation) {
    const whatsappUrl = buildWhatsAppLink(
      whatsappPhone,
      "Hello Thaagai! I was chatting with your AI Stylist and would like to speak directly with your boutique concierge."
    );
    return {
      message: isTamil
        ? `எங்கள் வாட்ஸ்அப் பூட்டிக் மாஸ்டர் டெய்லருடன் நேரடியாக உரையாடலாம்! துணி மாதிரிகள், தனிப்பயன் தையல் அல்லது சிறப்பு கோரிக்கைகளுக்கு அவர்கள் உங்களுக்கு உடனடியாக வழிகாட்டுவார்கள்.`
        : `You can connect directly with our Master Tailor and Boutique Concierge on WhatsApp! They will assist you with custom fabric swatches, high-resolution video consultations, and order confirmations.`,
      language: isTamil ? "ta" : "en",
      whatsappHandover: {
        phone: whatsappPhone,
        text: "Direct connection with Thaagai Boutique Concierge",
        url: whatsappUrl,
        label: "Open WhatsApp Concierge",
      },
      quickReplies: isTamil
        ? ["வாட்ஸ்அப்பில் பேசுக", "ஆர்டர் நிலை பார்க்க", "குர்த்திகள் பார்க்க"]
        : ["Open WhatsApp Chat", "Track Existing Order", "Browse Ready-to-Wear"],
    };
  }

  // 4. Return, Refund & Cancellation Policy
  const isPolicy =
    lower.includes("return") ||
    lower.includes("refund") ||
    lower.includes("exchange") ||
    lower.includes("cancel") ||
    lower.includes("damage") ||
    lower.includes("alteration") ||
    lower.includes("ரிடர்ன்") ||
    lower.includes("ரத்து") ||
    lower.includes("திரும்ப") ||
    lower.includes("மாற்று");

  if (isPolicy) {
    let policyText = "";
    if (lower.includes("cancel")) {
      policyText = isTamil
        ? `**ரத்து கொள்கை (Cancellation Policy)**:\n• **தயாரான ஆடைகள் (Ready-to-Wear)**: வாட்ஸ்அப் வழியாக பார்சல் அனுப்பப்படும் முன் இலவசமாக ரத்து செய்யலாம்.\n• **தனிப்பயன் ஆடைகள் (Custom-Made)**: துணி வெட்டுதல் மற்றும் பேட்டர்ன் வரைவதற்கு முன்பு ரத்து இலவசம்.`
        : `**Thaagai Cancellation Policy**:\n• **Ready-to-Wear Pieces**: You can cancel free of charge prior to dispatch confirmation via WhatsApp. Once handed to the courier, standard return protocols apply.\n• **Bespoke Custom Garments**: Cancellations are accepted free of charge prior to fabric cutting and pattern drafting.`;
    } else {
      policyText = isTamil
        ? `**திரும்பப் பெறுதல் & பணம் திரும்பப் பெறுதல் கொள்கை**:\n• **48-மணிநேர அவகாசம்**: ஏதேனும் சேதம் அல்லது தவறான அளவு இருப்பின், பார்சல் கிடைத்த 48 மணி நேரத்திற்குள் அன்பாக்சிங் வீடியோவுடன் வாட்ஸ்அப்பில் தெரிவிக்கவும்.\n• **பணம் திரும்பப் பெறுதல்**: ஆய்வு செய்யப்பட்ட பின் 3 வணிக நாட்களுக்குள் உங்கள் வங்கிக் கணக்கில் பணம் திருப்பிச் செலுத்தப்படும்.\n• **கைத்தறி நுணுக்கங்கள்**: கைத்தறி பருத்தி நூலின் இயற்கை அமைப்புகள் மற்றும் சிறிய நிற வேறுபாடுகள் கைவினைத்திறனின் அடையாளம், குறைபாடுகள் அல்ல.`
        : `**Thaagai Return & Refund Policy**:\n• **48-Hour Notification Window**: If your garment arrives with a defect, wrong size compared to agreed measurements, or transit damage, please notify us within 48 hours of delivery with an unboxing photo/video on WhatsApp.\n• **Refund Processing**: Approved claims receive an immediate replacement piece or full refund credited to your original payment mode within 3 business days.\n• **Handloom Character**: Subtle slubs in handloom cotton fabric, natural yarn character, and minor tonal variations are intrinsic markers of authentic artisan weaving, not defects.\n• **Built-In Alteration Margin**: All tailored garments feature extra 2-inch side seam margins for effortless future adjustments.`;
    }

    return {
      message: policyText,
      language: isTamil ? "ta" : "en",
      quickReplies: isTamil
        ? ["வாட்ஸ்அப்பில் உதவி பெற", "ஆர்டர் கண்காணிக்க", "குர்த்திகள் பார்க்க"]
        : ["Chat with Concierge", "Track My Order", "Shipping Timelines", "Browse Collection"],
      whatsappHandover: {
        phone: whatsappPhone,
        text: "Hello Thaagai! I have a question regarding returns/cancellations.",
        url: buildWhatsAppLink(whatsappPhone, "Hello Thaagai! I have a question regarding returns/cancellations."),
        label: "Speak with Returns Team",
      },
    };
  }

  // 5. Shipping & Delivery Timelines
  const isShipping =
    lower.includes("shipping") ||
    lower.includes("delivery time") ||
    lower.includes("how long") ||
    lower.includes("pincode") ||
    lower.includes("courier") ||
    lower.includes("charges") ||
    lower.includes("எப்போது வரும்");

  if (isShipping) {
    const shippingText = isTamil
      ? `**டெலிவரி விவரங்கள்**:\n• **தென்னிந்தியா**: 2 முதல் 4 வணிக நாட்கள்.\n• **பிற இந்திய பகுதிகள்**: 4 முதல் 7 வணிக நாட்கள்.\n• **அனுப்பும் நேரம்**: வாட்ஸ்அப் உறுதிப்படுத்தலுக்குப் பிறகு 2 வணிக நாட்களுக்குள் தரப் பரிசோதனை முடிந்து அனுப்பப்படும்.`
      : `**Thaagai Shipping & Delivery Timelines**:\n• **Dispatch**: Every piece undergoes thorough physical quality inspection and is dispatched within 2 business days of WhatsApp order confirmation.\n• **South India**: Delivers in 2–4 business days.\n• **Rest of India**: Delivers in 4–7 business days depending on pin code accessibility.\n• **Tracking**: Live tracking link is sent directly to your WhatsApp as soon as the courier picks up the package.`;

    return {
      message: shippingText,
      language: isTamil ? "ta" : "en",
      quickReplies: isTamil
        ? ["ஆர்டர் கண்காணிக்க", "குர்த்திகள் பார்க்க", "வாட்ஸ்அப் ஆதரவு"]
        : ["Track My Order", "Delivery PIN Check", "Browse Kurtis", "WhatsApp Stylist"],
    };
  }

  // 6. Shopping & Product Catalog Search
  const isGreeting =
    lower === "hi" ||
    lower === "hello" ||
    lower === "hey" ||
    lower === "vanakkam" ||
    lower === "வணக்கம்" ||
    lower === "help" ||
    lower === "start";

  if (isGreeting) {
    const greetingMsg = isTamil
      ? `வணக்கம்! தாகைக்கு வரவேற்கிறோம் 🌸\n\n“தாகை – Every Thread, A Touch of You.”\n\nநான் உங்கள் பிரத்யேக தாகை ஸ்டைலிஸ்ட். உங்களுக்கு குர்த்தி தேடவா, தனிப்பயன் தையல் விவரங்கள் தேவையா அல்லது உங்கள் ஆர்டரைக் கண்காணிக்கவா?`
      : `Welcome to Thaagai 🌸\n\n*“Every Thread, A Touch of You.”*\n\nI am your personal boutique stylist & concierge. How can I assist you today? You can ask me to recommend kurtis, explore custom necklines and sleeve patterns, track your shipment, or check our store policies!`;

    // Fetch featured products for immediate visual delight
    const featuredProducts = await searchCatalog("", { limit: 3 });

    return {
      message: greetingMsg,
      language: isTamil ? "ta" : "en",
      products: featuredProducts,
      quickReplies: isTamil
        ? ["🌸 குர்த்திகள் பார்க்க", "✂️ தனிப்பயன் தையல்", "📦 ஆர்டர் நிலை", "↩️ திரும்பப் பெறுதல்"]
        : ["🌸 Kurtis under ₹2,000", "✂️ Bespoke Customisation", "📦 Track My Order", "💬 WhatsApp Stylist"],
    };
  }

  // Fallback to Catalog Search with user terms
  const searchResults = await searchCatalog(input, { limit: 4 });

  if (searchResults.length > 0) {
    const introMsg = isTamil
      ? `உங்கள் ரசனைக்கேற்ப தேர்ந்தெடுக்கப்பட்ட சில தாகை படைப்புகள் இதோ 🌸 எந்த ஆடையையும் கிளிக் செய்து நேரடியாக கார்ட்டில் சேர்க்கலாம்:`
      : `Here are our finest handcrafted pieces matching your style preferences 🌸 You can click any design to explore details or add it directly to your shopping bag:`;

    return {
      message: introMsg,
      language: isTamil ? "ta" : "en",
      products: searchResults,
      quickReplies: isTamil
        ? ["✂️ தையல் விருப்பங்கள்", "₹2,000-க்குள் ஆடைகள்", "ஆர்டர் செய்ய வாட்ஸ்அப்"]
        : ["Filter under ₹2,000", "Bespoke Customisation", "Track My Order", "WhatsApp Concierge"],
    };
  }

  // Graceful conversational response if no specific intent or product matched
  const fallbackMsg = isTamil
    ? `நிச்சயமாக! தாகையில் நாம் கைத்தறி காட்டன், ராவ் சில்க் மற்றும் காஞ்சிபுரம் ஜரிகை ஆடைகளை வடிவமைக்கிறோம் 🌸\n\nநீங்கள் குறிப்பிட்ட வகை, விலை அல்லது தையல் விவரங்களை எனக்கு கூற முடியுமா?`
    : `I'd love to help you with that! At Thaagai, we specialize in authentic handloom cotton kurtis, celebration raw silk churidars, and bespoke made-to-measure tailoring 🌸\n\nCould you tell me a little more about what you're looking for? For example: preferred fabric (cotton or silk), occasion (office or festive), or desired neck/sleeve pattern?`;

  return {
    message: fallbackMsg,
    language: isTamil ? "ta" : "en",
    quickReplies: isTamil
      ? ["ஆபீஸ் குர்த்திகள்", "பண்டிகை சில்க்", "தையல் விருப்பங்கள்", "வாட்ஸ்அப் உதவி"]
      : ["Office Cotton Kurtis", "Festive Raw Silk", "Bespoke Customisation", "Track My Order"],
  };
}
