"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface BrandLogoProps {
  /**
   * Color theme variant: 'default' (bronze/copper) or 'white' (pearl-white on dark backgrounds)
   */
  variant?: "default" | "white";
  /**
   * 'separate': Renders logo icon and wordmark as two distinct elements with independent sizing/styling.
   * 'combined': Renders a single unified image asset.
   */
  mode?: "separate" | "combined";
  /**
   * Custom path to standalone logo emblem/icon image (e.g. /logo-icon.png)
   */
  iconSrc?: string;
  /**
   * Custom path to standalone brand wordmark image (e.g. /wordmark.png)
   */
  wordmarkSrc?: string;
  /**
   * Custom path to combined logo image when mode="combined"
   */
  combinedSrc?: string;
  /**
   * Whether to display the logo emblem/icon
   */
  showIcon?: boolean;
  /**
   * Whether to display the brand wordmark
   */
  showWordmark?: boolean;
  /**
   * Whether to display the secondary Tamil wordmark in typographic fallback mode
   */
  showTamilWordmark?: boolean;
  /**
   * Layout direction: 'horizontal' (side-by-side) or 'stacked' (vertical)
   */
  layout?: "horizontal" | "stacked";
  /**
   * Outer container wrapper classes
   */
  className?: string;
  /**
   * Class name for combined logo image
   */
  imageClassName?: string;
  /**
   * Class name for standalone emblem/icon image
   */
  iconClassName?: string;
  /**
   * Class name for standalone wordmark image
   */
  wordmarkClassName?: string;
  /**
   * Target destination link (defaults to home '/')
   */
  href?: string;
}

export function BrandLogo({
  variant = "default",
  mode = "separate",
  iconSrc = "/logo-icon.png",
  wordmarkSrc,
  combinedSrc,
  showIcon = true,
  showWordmark = true,
  showTamilWordmark = true,
  layout = "horizontal",
  className = "",
  imageClassName = "h-10 w-auto object-contain",
  iconClassName = "h-9 sm:h-11 w-auto object-contain shrink-0",
  wordmarkClassName = "h-7 sm:h-8 w-auto object-contain",
  href = "/",
}: BrandLogoProps) {
  const [iconError, setIconError] = useState(false);
  const [wordmarkError, setWordmarkError] = useState(false);
  const [combinedError, setCombinedError] = useState(false);

  const defaultCombinedSrc = variant === "white" ? "/logo-white.svg" : "/logo.svg";
  const defaultWordmarkSrc = variant === "white" ? "/wordmark-white.png" : "/wordmark.png";

  const resolvedCombinedSrc = combinedSrc || defaultCombinedSrc;
  const resolvedWordmarkSrc = wordmarkSrc || defaultWordmarkSrc;

  // Render combined mode if explicitly requested and no error
  if (mode === "combined" && !combinedError) {
    const combinedContent = (
      <div className={`flex items-center transition-opacity hover:opacity-90 ${className}`}>
        <Image
          src={resolvedCombinedSrc}
          alt="THAAGAI"
          width={180}
          height={48}
          className={imageClassName}
          priority
          onError={() => setCombinedError(true)}
        />
      </div>
    );

    return href ? (
      <Link href={href} aria-label="Thaagai Home">
        {combinedContent}
      </Link>
    ) : (
      combinedContent
    );
  }

  // Render separate mode: Standalone Icon (Mannequin Needle) + Standalone Wordmark (Embroidered Thaagai)
  const content = (
    <div
      className={`group/logo flex items-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] tap-bounce ${
        layout === "stacked"
          ? "flex-col items-center gap-1.5"
          : "flex-row items-center gap-2 sm:gap-2.5"
      } ${className}`}
    >
      {/* 1. Standalone Emblem / Logo Icon */}
      {showIcon && (
        <div className="flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/logo:scale-105 group-hover/logo:rotate-1">
          {!iconError ? (
            <Image
              src={iconSrc}
              alt="THAAGAI Emblem"
              width={709}
              height={629}
              className={iconClassName}
              priority
              onError={() => setIconError(true)}
            />
          ) : (
            /* Fallback Icon badge */
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-thaagai-wine text-thaagai-gold shadow-xs">
              <span className="font-serif font-bold text-base">T</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Standalone Wordmark (Image with elegant typographic fallback) */}
      {showWordmark && (
        <div className="flex items-center">
          {!wordmarkError && resolvedWordmarkSrc ? (
            <>
              {/* Light variant / default wordmark (Bronze embroidered lettering) */}
              <Image
                src={resolvedWordmarkSrc}
                alt="THAAGAI"
                width={1024}
                height={309}
                className={`${wordmarkClassName} ${variant === "default" && !wordmarkSrc ? "dark:hidden" : ""}`}
                priority
                onError={() => setWordmarkError(true)}
              />
              {/* Dark mode wordmark (Pearl-white embroidered lettering) */}
              {variant === "default" && !wordmarkSrc && (
                <Image
                  src="/wordmark-white.png"
                  alt="THAAGAI"
                  width={1024}
                  height={313}
                  className={`${wordmarkClassName} hidden dark:block`}
                  priority
                />
              )}
            </>
          ) : (
            /* Clean Typographic Wordmark */
            <div className="flex items-baseline gap-2">
              <span
                className={`font-brand text-xl sm:text-2xl font-bold tracking-widest ${
                  variant === "white" ? "text-white" : "text-thaagai-wine"
                }`}
              >
                THAAGAI
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Thaagai Home">
        {content}
      </Link>
    );
  }

  return content;
}
