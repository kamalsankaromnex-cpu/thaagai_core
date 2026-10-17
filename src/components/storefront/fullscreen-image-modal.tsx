"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export interface FullscreenImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { id: string; url: string; altText: string | null }[];
  initialIndex: number;
}

export function FullscreenImageModal({
  isOpen,
  onClose,
  images,
  initialIndex,
}: FullscreenImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Product Image Fullscreen Preview"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Header Bar */}
      <div className="z-10 flex w-full max-w-7xl items-center justify-between text-white/90">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tracking-wider">
            {currentIndex + 1} / {images.length}
          </span>
          <span className="hidden text-xs text-white/60 sm:inline">
            (Use Arrow Keys to navigate, ESC to close)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZoomed((prev) => !prev)}
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            {isZoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fullscreen modal"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Display Container */}
      <div className="relative flex h-full max-h-[82vh] w-full max-w-5xl items-center justify-center overflow-hidden">
        {/* Navigation Previous */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 hover:scale-105"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}

        {/* Active Image */}
        <div
          onClick={() => setIsZoomed((prev) => !prev)}
          className={`relative h-full w-full flex items-center justify-center cursor-${isZoomed ? "zoom-out" : "zoom-in"} select-none`}
        >
          <div
            className={`relative transition-transform duration-300 ease-out ${
              isZoomed ? "scale-150 sm:scale-175 cursor-grab" : "scale-100"
            } h-full w-full max-h-[78vh]`}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.altText || "Fullscreen preview"}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation Next */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-2 sm:right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/80 hover:scale-105"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="z-10 flex max-w-full gap-2.5 overflow-x-auto pb-2 pt-2 px-4">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                currentIndex === idx
                  ? "border-amber-400 ring-2 ring-amber-400/40 opacity-100 scale-105"
                  : "border-white/30 opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altText || `Thumbnail ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
