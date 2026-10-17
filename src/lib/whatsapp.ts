export type MsgOrderItem = {
  productName: string;
  variantLabel?: string | null;
  quantity: number;
  unitPrice: string;
  customizations?: {
    selections?: { groupName: string; optionName: string; priceDelta?: number }[];
    measurements?: {
      bust?: string;
      waist?: string;
      hips?: string;
      length?: string;
      shoulder?: string;
      notes?: string;
    };
  } | null;
};

export type MsgOrder = {
  reference: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  subtotal: string;
  items: MsgOrderItem[];
};

export function buildWhatsAppMessage(o: MsgOrder): string {
  const lines = o.items.flatMap((i) => {
    const mainLine = `- ${i.productName}${i.variantLabel ? ` (${i.variantLabel})` : ""} x${i.quantity} @ \u20B9${i.unitPrice}`;
    const extraLines: string[] = [];
    if (i.customizations) {
      if (i.customizations.selections && i.customizations.selections.length > 0) {
        i.customizations.selections.forEach((s) => {
          extraLines.push(`    • ${s.groupName}: ${s.optionName}${s.priceDelta && s.priceDelta > 0 ? ` (+₹${s.priceDelta})` : ""}`);
        });
      }
      if (i.customizations.measurements) {
        const m = i.customizations.measurements;
        const mParts = [
          m.bust ? `Bust: ${m.bust}"` : null,
          m.waist ? `Waist: ${m.waist}"` : null,
          m.hips ? `Hips: ${m.hips}"` : null,
          m.length ? `Length: ${m.length}"` : null,
          m.shoulder ? `Shoulder: ${m.shoulder}"` : null,
        ].filter(Boolean);
        if (mParts.length > 0) {
          extraLines.push(`    • Measurements: ${mParts.join(", ")}`);
        }
        if (m.notes) {
          extraLines.push(`    • Tailoring Notes: ${m.notes}`);
        }
      }
    }
    return [mainLine, ...extraLines];
  });

  return [
    "Thaagai order request",
    `Reference: ${o.reference}`,
    "",
    ...lines,
    "",
    `Subtotal: \u20B9${o.subtotal} (shipping to be confirmed)`,
    "",
    `Name: ${o.customerName}`,
    `Phone: +91${o.customerPhone}`,
    `Address: ${o.address}, ${o.city}, ${o.state} - ${o.pinCode}`,
    "",
    "This request is awaiting seller confirmation.",
  ].join("\n");
}

export function getWhatsAppBusinessNumber(): string {
  return (
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ||
    process.env.WHATSAPP_BUSINESS_NUMBER ||
    "919876543210"
  ).replace(/\D/g, "");
}

export const whatsappUrl = (msg: string, businessNumber?: string) => {
  const number = (businessNumber || getWhatsAppBusinessNumber()).replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
};

export function buildWhatsAppLink(phone: string, msg: string): string {
  const sanitized = phone.replace(/\D/g, "");
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(msg)}`;
}

