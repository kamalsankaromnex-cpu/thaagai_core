import Link from "next/link";
import { LotusMotif } from "@/components/storefront/tamil-motifs";

export interface AnnouncementBarConfig {
  enabled: boolean;
  text: string;
  link?: string;
  bgColor?: string;
  textColor?: string;
}

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  enabled: true,
  text: "Handloom Weaves & Bespoke Churidar Tailoring · WhatsApp Confirmation Across India",
  link: "",
  bgColor: "#5E1624",
  textColor: "#FFFFFF",
};

interface AnnouncementBarProps {
  config?: AnnouncementBarConfig | null;
}

export function AnnouncementBar({ config }: AnnouncementBarProps) {
  // If explicitly disabled by admin in DB, do not render
  if (config && config.enabled === false) {
    return null;
  }

  const effectiveConfig = config || DEFAULT_ANNOUNCEMENT_BAR;
  const { text, link, bgColor = "#5E1624" } = effectiveConfig;

  if (!text || !text.trim()) {
    return null;
  }

  const content = (
    <div className="mx-auto flex max-w-7xl items-center justify-center gap-2.5 sm:gap-3 px-4">
      <LotusMotif className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#DA9F63] shrink-0" />
      <span className="truncate sm:overflow-visible sm:whitespace-normal font-sans text-[11px] sm:text-xs font-medium tracking-wide">
        {text}
      </span>
      <LotusMotif className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#DA9F63] shrink-0 hidden sm:inline" />
    </div>
  );

  return (
    <section
      role="region"
      aria-label="Store Announcement"
      style={{ backgroundColor: bgColor }}
      className="border-b border-[#DA9F63]/25 py-2 sm:py-2.5 text-center text-xs font-medium tracking-wide text-white/95 transition-colors"
    >
      {link && link.trim() ? (
        <Link
          href={link.trim()}
          className="transition-opacity hover:opacity-90 focus-visible:outline focus-visible:ring-1 focus-visible:ring-[#DA9F63]"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
}
