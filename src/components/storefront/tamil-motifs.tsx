import React from "react";

/** Subtle Traditional Tamil Kolam Line Pattern (SVG) */
export function KolamPattern({ className = "w-full h-8 text-thaagai-gold/40" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 16 Q30 4, 60 16 T120 16 T180 16 T240 16 T300 16 T360 16 T420 16 T480 16 T540 16 T600 16 T660 16 T720 16 T780 16 T840 16 T900 16 T960 16 T1020 16 T1080 16 T1140 16 T1200 16"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="60" cy="16" r="2.5" fill="currentColor" />
      <circle cx="180" cy="16" r="2.5" fill="currentColor" />
      <circle cx="300" cy="16" r="2.5" fill="currentColor" />
      <circle cx="420" cy="16" r="2.5" fill="currentColor" />
      <circle cx="540" cy="16" r="2.5" fill="currentColor" />
      <circle cx="660" cy="16" r="2.5" fill="currentColor" />
      <circle cx="780" cy="16" r="2.5" fill="currentColor" />
      <circle cx="900" cy="16" r="2.5" fill="currentColor" />
      <circle cx="1020" cy="16" r="2.5" fill="currentColor" />
      <circle cx="1140" cy="16" r="2.5" fill="currentColor" />
    </svg>
  );
}

/** Temple-Border Geometric Chevron Pattern (South Indian Sari Border) */
export function TempleBorder({ className = "w-full h-4 text-thaagai-gold/30" }: { className?: string }) {
  return (
    <div className={`overflow-hidden flex items-center justify-center opacity-70 ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 800 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="repeat"
      >
        <pattern id="temple-motif" x="0" y="0" width="20" height="16" patternUnits="userSpaceOnUse">
          <polygon points="10,2 18,14 2,14" />
        </pattern>
        <rect x="0" y="0" width="100%" height="16" fill="url(#temple-motif)" />
      </svg>
    </div>
  );
}

/** Lotus Motif in Antique Gold */
export function LotusMotif({ className = "w-6 h-6 text-thaagai-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3C12 3 7 8 7 13C7 16.5 9.5 19 12 19C14.5 19 17 16.5 17 13C17 8 12 3 12 3Z" />
      <path d="M7 13C5 11 2 13 2 16C2 18 4.5 19.5 8 19.5" />
      <path d="M17 13C19 11 22 13 22 16C22 18 19.5 19.5 16 19.5" />
      <path d="M8 19.5C9.5 20.5 10.7 21 12 21C13.3 21 14.5 20.5 16 19.5" />
    </svg>
  );
}

/** Heritage Brand Badge with Tamil Unicode Wordmark */
export function HeritageBadge({
  text = "Handloom Craft · Traditional Heritage Luxury",
  className = "",
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-thaagai-gold/60 bg-thaagai-ivory/90 px-4 py-1.5 shadow-sm dark:bg-thaagai-cardDark ${className}`}
    >
      <LotusMotif className="h-4 w-4 text-thaagai-gold shrink-0" />
      <span className="font-tamil text-xs font-semibold tracking-wider text-thaagai-maroon">
        {text}
      </span>
    </div>
  );
}
