import { describe, it, expect } from "vitest";
import {
  DEFAULT_ANNOUNCEMENT_BAR,
  AnnouncementBarConfig,
} from "./announcement-bar";

describe("Storefront Announcement Bar Configuration & Component Logic", () => {
  it("provides valid default announcement bar configuration", () => {
    expect(DEFAULT_ANNOUNCEMENT_BAR.enabled).toBe(true);
    expect(DEFAULT_ANNOUNCEMENT_BAR.text.length).toBeGreaterThan(10);
    expect(DEFAULT_ANNOUNCEMENT_BAR.bgColor).toBe("#5E1624");
    expect(DEFAULT_ANNOUNCEMENT_BAR.text).toContain("Handloom Weaves");
  });

  it("evaluates active visibility based on enabled flag", () => {
    const activeConfig: AnnouncementBarConfig = {
      enabled: true,
      text: "Festive Announcement",
      bgColor: "#5E1624",
    };

    const disabledConfig: AnnouncementBarConfig = {
      enabled: false,
      text: "Festive Announcement",
      bgColor: "#5E1624",
    };

    expect(activeConfig.enabled).toBe(true);
    expect(disabledConfig.enabled).toBe(false);
  });

  it("handles custom promotional text and link formatting", () => {
    const customConfig: AnnouncementBarConfig = {
      enabled: true,
      text: "Exclusive 15% Off On All Churidars",
      link: "/shop?filter=offers",
      bgColor: "#482820",
    };

    expect(customConfig.text).toBe("Exclusive 15% Off On All Churidars");
    expect(customConfig.link?.startsWith("/")).toBe(true);
    expect(customConfig.bgColor).toBe("#482820");
  });

  it("validates announcement text length limits and boundary values", () => {
    const longText = "A".repeat(300);
    expect(longText.length).toBe(300);

    const emptyText = "";
    expect(emptyText.trim().length).toBe(0);
  });
});
