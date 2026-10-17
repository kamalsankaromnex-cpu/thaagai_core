import { describe, it, expect } from "vitest";
import { buildWhatsAppMessage, MsgOrder } from "@/lib/whatsapp";

describe("Custom-Made Garment Flow & WhatsApp Formatting", () => {
  it("calculates live price deltas correctly for bespoke garment choices", () => {
    const basePrice = 3200;
    const selections = [
      { groupName: "Fabric", optionName: "Kanchipuram Brocade Silk", priceDelta: 1200 },
      { groupName: "Neckline", optionName: "Deep U-Back with Dori", priceDelta: 250 },
      { groupName: "Sleeve Cut", optionName: "Full Sleeves with Zari Cuff", priceDelta: 400 },
      { groupName: "Lining", optionName: "Pure Cotton Lining", priceDelta: 0 },
    ];

    const sumDeltas = selections.reduce((sum, s) => sum + s.priceDelta, 0);
    const finalPrice = basePrice + sumDeltas;

    expect(sumDeltas).toBe(1850);
    expect(finalPrice).toBe(5050);
  });

  it("formats custom-made tailoring details and body measurements in WhatsApp message", () => {
    const customOrder: MsgOrder = {
      reference: "TG-BESPOKE1",
      customerName: "Meenakshi Sundaram",
      customerPhone: "9876543210",
      address: "12 South Mada Street, Mylapore",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600004",
      subtotal: "5,050.00",
      items: [
        {
          productName: "Bespoke Silk Bridal Churidar Suit",
          variantLabel: "Custom Fit",
          quantity: 1,
          unitPrice: "5,050.00",
          customizations: {
            selections: [
              { groupName: "Fabric", optionName: "Kanchipuram Brocade Silk", priceDelta: 1200 },
              { groupName: "Neckline", optionName: "Deep U-Back with Dori", priceDelta: 250 },
              { groupName: "Sleeve Cut", optionName: "Full Sleeves with Zari Cuff", priceDelta: 400 },
            ],
            measurements: {
              bust: "36",
              waist: "30",
              hips: "38",
              length: "42",
              shoulder: "14",
              notes: "Add 1.5 inch inner margin, gathered churidar ankle dori",
            },
          },
        },
      ],
    };

    const msg = buildWhatsAppMessage(customOrder);

    expect(msg).toContain("Thaagai order request");
    expect(msg).toContain("Reference: TG-BESPOKE1");
    expect(msg).toContain("- Bespoke Silk Bridal Churidar Suit (Custom Fit) x1 @ ₹5,050.00");
    expect(msg).toContain("• Fabric: Kanchipuram Brocade Silk (+₹1200)");
    expect(msg).toContain("• Neckline: Deep U-Back with Dori (+₹250)");
    expect(msg).toContain('• Measurements: Bust: 36", Waist: 30", Hips: 38", Length: 42", Shoulder: 14"');
    expect(msg).toContain('• Tailoring Notes: Add 1.5 inch inner margin, gathered churidar ankle dori');
    expect(msg).toContain("Subtotal: ₹5,050.00 (shipping to be confirmed)");
    expect(msg).toContain("Address: 12 South Mada Street, Mylapore, Chennai, Tamil Nadu - 600004");
  });

  it("preserves standard ready-to-wear format when no customizations exist", () => {
    const readyToWearOrder: MsgOrder = {
      reference: "TG-RTW99",
      customerName: "Ananya Krishnan",
      customerPhone: "9840123456",
      address: "45 Anna Nagar West",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600040",
      subtotal: "1,890.00",
      items: [
        {
          productName: "Handloom Cotton Kurta",
          variantLabel: "M, Natural Indigo",
          quantity: 1,
          unitPrice: "1,890.00",
        },
      ],
    };

    const msg = buildWhatsAppMessage(readyToWearOrder);

    expect(msg).toContain("- Handloom Cotton Kurta (M, Natural Indigo) x1 @ ₹1,890.00");
    expect(msg).not.toContain("Measurements:");
    expect(msg).not.toContain("Tailoring Notes:");
  });
});
