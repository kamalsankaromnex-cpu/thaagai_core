import { describe, it, expect } from "vitest";
import { buildWhatsAppMessage, whatsappUrl, MsgOrder } from "./whatsapp";

describe("whatsapp link & message builder", () => {
  const sampleOrder: MsgOrder = {
    reference: "TG-1A2B3C",
    customerName: "Kavitha Raman",
    customerPhone: "9876543210",
    address: "74 Gandhi Road, T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    pinCode: "600017",
    subtotal: "3,780.00",
    items: [
      {
        productName: "Handloom cotton kurta",
        variantLabel: "M, Natural Indigo",
        quantity: 2,
        unitPrice: "1,890.00",
      },
    ],
  };

  it("builds clean WhatsApp message conforming to no-API human confirmation flow", () => {
    const msg = buildWhatsAppMessage(sampleOrder);

    expect(msg).toContain("Thaagai order request");
    expect(msg).toContain("Reference: TG-1A2B3C");
    expect(msg).toContain("- Handloom cotton kurta (M, Natural Indigo) x2 @ ₹1,890.00");
    expect(msg).toContain("Subtotal: ₹3,780.00 (shipping to be confirmed)");
    expect(msg).toContain("Name: Kavitha Raman");
    expect(msg).toContain("Phone: +919876543210");
    expect(msg).toContain("Address: 74 Gandhi Road, T. Nagar, Chennai, Tamil Nadu - 600017");
    expect(msg).toContain("This request is awaiting seller confirmation.");
  });

  it("builds wa.me URL with official wa.me format and encoded text", () => {
    const msg = buildWhatsAppMessage(sampleOrder);
    const url = whatsappUrl(msg);

    expect(url.startsWith("https://wa.me/919876543210?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("Reference: TG-1A2B3C"));
  });
});
