import { describe, it, expect } from "vitest";
import { buildWhatsAppMessage, whatsappUrl } from "./whatsapp";

describe("WhatsApp Checkout & Link Generation", () => {
  const sampleOrder = {
    reference: "TG-A1B2C3",
    customerName: "Priyanka Patel",
    customerPhone: "9876543210",
    address: "Flat 402, Lotus Residency, MG Road",
    city: "Ahmedabad",
    state: "Gujarat",
    pinCode: "380001",
    subtotal: "3,499",
    items: [
      {
        productName: "Chanderi Silk Anarkali",
        variantLabel: "M, Royal Blue",
        quantity: 1,
        unitPrice: "3,499",
      },
    ],
  };

  it("formats WhatsApp message with clear order reference, items, and address", () => {
    const message = buildWhatsAppMessage(sampleOrder);

    expect(message).toContain("Reference: TG-A1B2C3");
    expect(message).toContain("Name: Priyanka Patel");
    expect(message).toContain("Phone: +919876543210");
    expect(message).toContain("Chanderi Silk Anarkali (M, Royal Blue) x1 @ ₹3,499");
    expect(message).toContain("Subtotal: ₹3,499 (shipping to be confirmed)");
    expect(message).toContain("Address: Flat 402, Lotus Residency, MG Road, Ahmedabad, Gujarat - 380001");
    expect(message).toContain("This request is awaiting seller confirmation.");
  });

  it("encodes message into a valid wa.me click-to-chat URL", () => {
    const message = buildWhatsAppMessage(sampleOrder);
    const url = whatsappUrl(message);

    expect(url).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(url).toContain(encodeURIComponent("TG-A1B2C3"));
    expect(url).toContain(encodeURIComponent("Priyanka Patel"));
  });

  it("handles multi-item orders properly", () => {
    const multiItemOrder = {
      ...sampleOrder,
      reference: "TG-998877",
      subtotal: "6,998",
      items: [
        {
          productName: "Chettinad Cotton Straight Churidar",
          variantLabel: "L, Indigo",
          quantity: 2,
          unitPrice: "1,999",
        },
        {
          productName: "Festive Chanderi Silk Anarkali Suit",
          variantLabel: null,
          quantity: 1,
          unitPrice: "3,000",
        },
      ],
    };

    const msg = buildWhatsAppMessage(multiItemOrder);
    expect(msg).toContain("Reference: TG-998877");
    expect(msg).toContain("Chettinad Cotton Straight Churidar (L, Indigo) x2 @ ₹1,999");
    expect(msg).toContain("Festive Chanderi Silk Anarkali Suit x1 @ ₹3,000");
    expect(msg).toContain("Subtotal: ₹6,998 (shipping to be confirmed)");
  });
});
