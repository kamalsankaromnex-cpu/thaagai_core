"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Scissors,
  Sparkles,
  Ruler,
  Check,
  MessageSquare,
  ShieldCheck,
  RotateCw,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Layers,
  Sparkle,
  ArrowRight,
  Info,
} from "lucide-react";
import { useCustomerAuth } from "@/context/customer-auth-context";
import { useCart } from "@/context/cart-context";
import { LotusMotif } from "@/components/storefront/tamil-motifs";

export interface StyleOption {
  id: string;
  label: string;
  tamil: string;
  desc: string;
  priceDelta: number;
  previewImage?: string;
  badge?: string;
}

export interface FabricOption extends StyleOption {
  colorHex: string;
  colorName: string;
  fabricType: string;
  heroImage: string;
}

const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: "chettinad_cotton",
    label: "Handloom Chettinad Cotton",
    tamil: "",
    desc: "Authentic handwoven Chettinad cotton with temple thread border accents. Breathable, crisp, and comfortable for all-day wear.",
    priceDelta: 0,
    colorHex: "#5E1624",
    colorName: "Temple Maroon & Sand",
    fabricType: "Pure Handloom Cotton",
    heroImage: "/products/chettinad-cotton-maroon.jpg",
  },
  {
    id: "chanderi_silk",
    label: "Festive Chanderi Zari Silk",
    tamil: "",
    desc: "Lightweight festive silk woven with micro zari buttas, accompanied by an embellished sheer organza dupatta.",
    priceDelta: 750,
    colorHex: "#450E18",
    colorName: "Royal Wine & Antique Gold",
    fabricType: "Chanderi Silk Blend",
    heroImage: "/products/festive-chanderi-anarkali.jpg",
  },
  {
    id: "raw_silk",
    label: "Pure Raw Silk with Banarasi Border",
    tamil: "",
    desc: "Structured, rich raw silk kurta paired with an opulent Banarasi gold zari dupatta for celebrations.",
    priceDelta: 1350,
    colorHex: "#1B3B4B",
    colorName: "Peacock Blue & Gold",
    fabricType: "Pure Raw Silk",
    heroImage: "/products/peacock-blue-raw-silk.jpg",
  },
  {
    id: "kanchipuram_silk",
    label: "Kanchipuram Pure Silk Celebration",
    tamil: "",
    desc: "Heirloom grade pure silk woven with gold zari temple borders, custom crafted for weddings and special occasions.",
    priceDelta: 2100,
    colorHex: "#781826",
    colorName: "Crimson Red & Pure Zari",
    fabricType: "Kanchipuram Pure Silk",
    heroImage: "/products/kanchipuram-silk-bridal.jpg",
  },
];

const KURTA_CUTS: StyleOption[] = [
  {
    id: "straight",
    label: "Classic Straight Cut",
    tamil: "",
    desc: "Timeless straight-line silhouette with generous side slits for effortless grace and posture.",
    priceDelta: 0,
    badge: "Most Popular",
  },
  {
    id: "a_line",
    label: "Graceful A-Line Flare",
    tamil: "",
    desc: "Gentle outward flare starting from the waistline, comfortable for everyday movement.",
    priceDelta: 300,
  },
  {
    id: "anarkali",
    label: "Royal Kalidar Anarkali",
    tamil: "",
    desc: "Grand multi-kali flared silhouette with regal sweep and celebratory twirl.",
    priceDelta: 700,
    badge: "Festive",
  },
];

const NECKLINES: StyleOption[] = [
  {
    id: "round",
    label: "Timeless Round Neck",
    tamil: "",
    desc: "Modest circular cut with clean hand-turned fabric piping.",
    priceDelta: 0,
  },
  {
    id: "sweetheart",
    label: "Royal Sweetheart",
    tamil: "",
    desc: "Romantic contoured neckline framing traditional temple necklaces elegantly.",
    priceDelta: 200,
    badge: "Bridal Pick",
  },
  {
    id: "boat_neck",
    label: "High Boat Neck with Zari",
    tamil: "",
    desc: "Sophisticated shoulder-to-shoulder cut with delicate zari cord piping.",
    priceDelta: 150,
  },
  {
    id: "v_neck",
    label: "Slender V-Neck with Placket",
    tamil: "",
    desc: "Flattering elongating neckline adorned with handcrafted potli buttons.",
    priceDelta: 100,
  },
];

const SLEEVE_STYLES: StyleOption[] = [
  {
    id: "sleeves_three_fourth",
    label: "3/4th Quarter Sleeves (16\")",
    tamil: "",
    desc: "Ending past the elbow with matching border cuffs. The most versatile fit.",
    priceDelta: 0,
    badge: "Standard",
  },
  {
    id: "sleeves_full",
    label: "Full Length Gathered Sleeves",
    tamil: "",
    desc: "Wrist-length tapered sleeves with delicate micro churidar gathers at cuffs.",
    priceDelta: 200,
  },
  {
    id: "sleeves_cap",
    label: "Cap Sleeves (5\")",
    tamil: "",
    desc: "Compact sleeve covering the shoulder cap with contrast inner binding.",
    priceDelta: 0,
  },
  {
    id: "sleeveless",
    label: "Atelier Sleeveless",
    tamil: "",
    desc: "Comfort armholes tailored with reinforced bias tape and zero bunching.",
    priceDelta: 0,
  },
];

const BOTTOM_STYLES: StyleOption[] = [
  {
    id: "churidar",
    label: "Traditional Gathered Churidar",
    tamil: "",
    desc: "Signature snug-fitting trousers with stacked horizontal churi gathers at the ankle and drawstring waist.",
    priceDelta: 0,
    badge: "Thaagai Signature",
  },
  {
    id: "cigarette_pants",
    label: "Tailored Cigarette Trousers",
    tamil: "",
    desc: "Modern ankle-length straight trousers with side pocket, flat waistband, and discreet ankle slit.",
    priceDelta: 250,
  },
  {
    id: "palazzo",
    label: "Flared Wide-Leg Palazzo",
    tamil: "",
    desc: "Breezy wide-legged drape offering airy comfort, pairing majestically with knee-length kurtas.",
    priceDelta: 350,
  },
  {
    id: "patiala",
    label: "Pleated Patiala Salwar",
    tamil: "",
    desc: "Traditional rich pleats forming billowing volume and a comfortable tapered ankle cuff.",
    priceDelta: 200,
  },
];

const LINING_OPTIONS: StyleOption[] = [
  {
    id: "cotton_voile",
    label: "Pure Malmal Cotton Lining",
    tamil: "",
    desc: "100% preshrunk breathable cotton lining ensuring supreme skin comfort in warm weather.",
    priceDelta: 300,
    badge: "Recommended",
  },
  {
    id: "butter_crepe",
    label: "Butter Crepe Smooth Lining",
    tamil: "",
    desc: "Silky fluid slip lining preventing static friction and enhancing the external drape.",
    priceDelta: 250,
  },
  {
    id: "no_lining",
    label: "Unlined (For heavy handloom cottons)",
    tamil: "",
    desc: "Single layer tailored construction suitable for naturally opaque handloom weaves.",
    priceDelta: 0,
  },
];

const STANDARD_PRESETS = [
  { size: "S", bust: 36, waist: 30, hips: 38, kurtaLength: 42, bottomLength: 39 },
  { size: "M", bust: 38, waist: 32, hips: 40, kurtaLength: 43, bottomLength: 39 },
  { size: "L", bust: 40, waist: 34, hips: 42, kurtaLength: 44, bottomLength: 40 },
  { size: "XL", bust: 42, waist: 36, hips: 44, kurtaLength: 44, bottomLength: 40 },
  { size: "XXL", bust: 44, waist: 38, hips: 46, kurtaLength: 45, bottomLength: 41 },
  { size: "3XL", bust: 46, waist: 40, hips: 48, kurtaLength: 45, bottomLength: 41 },
];

export function CustomChuridarBuilder() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { addItem } = useCart();

  // Active Wizard Step: 1 = Silhouette & Fabric, 2 = Neckline & Sleeves, 3 = Bottom & Lining, 4 = Measurements
  const [currentStep, setCurrentStep] = useState(1);

  // Selections
  const [selectedFabric, setSelectedFabric] = useState<FabricOption>(FABRIC_OPTIONS[0]);
  const [selectedCut, setSelectedCut] = useState<StyleOption>(KURTA_CUTS[0]);
  const [selectedNeck, setSelectedNeck] = useState<StyleOption>(NECKLINES[0]);
  const [selectedSleeve, setSelectedSleeve] = useState<StyleOption>(SLEEVE_STYLES[0]);
  const [selectedBottom, setSelectedBottom] = useState<StyleOption>(BOTTOM_STYLES[0]);
  const [selectedLining, setSelectedLining] = useState<StyleOption>(LINING_OPTIONS[0]);

  // Measurements
  const [measurementMode, setMeasurementMode] = useState<"preset" | "custom" | "tailor_call">("preset");
  const [selectedPresetSize, setSelectedPresetSize] = useState("M");
  const [heightProfile, setHeightProfile] = useState<"petite" | "regular" | "tall">("regular");

  const [bust, setBust] = useState(38);
  const [waist, setWaist] = useState(32);
  const [hips, setHips] = useState(40);
  const [kurtaLength, setKurtaLength] = useState(43);
  const [bottomLength, setBottomLength] = useState(39);

  const [cartSuccess, setCartSuccess] = useState(false);

  // Sync preset changes
  const applyPreset = (sizeName: string, height: "petite" | "regular" | "tall") => {
    setSelectedPresetSize(sizeName);
    setHeightProfile(height);
    const p = STANDARD_PRESETS.find((x) => x.size === sizeName) || STANDARD_PRESETS[1];
    const heightDelta = height === "petite" ? -1.5 : height === "tall" ? 1.5 : 0;
    setBust(p.bust);
    setWaist(p.waist);
    setHips(p.hips);
    setKurtaLength(Math.round(p.kurtaLength + heightDelta));
    setBottomLength(Math.round(p.bottomLength + heightDelta));
  };

  // Base price calculation
  const BASE_PRICE = 2899;
  const totalPrice =
    BASE_PRICE +
    selectedFabric.priceDelta +
    selectedCut.priceDelta +
    selectedNeck.priceDelta +
    selectedSleeve.priceDelta +
    selectedBottom.priceDelta +
    selectedLining.priceDelta;

  const handleGenerateWhatsApp = () => {
    const measurementsText =
      measurementMode === "tailor_call"
        ? "Requested Master Tailor 5-Min WhatsApp Video Consultation"
        : measurementMode === "preset"
        ? `Standard Size: ${selectedPresetSize} (${heightProfile.toUpperCase()} Height) · Bust: ${bust}\", Waist: ${waist}\", Hips: ${hips}\", Kurta Length: ${kurtaLength}\", Bottom: ${bottomLength}\"`
        : `Precision Custom: Bust ${bust}\", Waist ${waist}\", Hips ${hips}\", Kurta Length ${kurtaLength}\", Bottom ${bottomLength}\"`;

    const message = `Namaste THAAGAI Master Tailor! 🪡✨\n\nI would like to order a Bespoke Made-to-Measure Churidar Suite configured on your atelier:\n\n` +
      `🌿 Fabric & Weave: ${selectedFabric.label}\n` +
      `👗 Kurta Silhouette: ${selectedCut.label}\n` +
      `✨ Neckline Contour: ${selectedNeck.label}\n` +
      `✂️ Sleeve Cut: ${selectedSleeve.label}\n` +
      `👖 Bottom Silhouette: ${selectedBottom.label}\n` +
      `🛡️ Inner Lining: ${selectedLining.label}\n\n` +
      `📏 Measurements Blueprint:\n${measurementsText}\n` +
      `✨ Inner Alteration Margins: 1.5 inches guaranteed\n\n` +
      `💰 Configured Price: ₹${totalPrice.toLocaleString("en-IN")}\n\n` +
      `Please confirm fabric availability and share dispatch turnaround time. Thank you!`;

    const encoded = encodeURIComponent(message);
    const boutiqueNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";
    window.open(`https://wa.me/${boutiqueNumber}?text=${encoded}`, "_blank");
  };

  const handleAddToCart = () => {
    const customSnapshot = {
      fabric: selectedFabric.label,
      fabricTamil: selectedFabric.tamil,
      kurtaCut: selectedCut.label,
      neckline: selectedNeck.label,
      sleeve: selectedSleeve.label,
      bottom: selectedBottom.label,
      lining: selectedLining.label,
      measurements: {
        mode: measurementMode,
        bust,
        waist,
        hips,
        kurtaLength,
        bottomLength,
        presetSize: selectedPresetSize,
        heightProfile,
      },
      alterationMargin: "1.5 inch inner margins guaranteed",
    };

    addItem({
      variantId: `bespoke-${selectedFabric.id}-${selectedCut.id}-${selectedBottom.id}`,
      productId: "bespoke-kanchipuram-silk-bridal-churidar",
      name: `Bespoke Tailored Churidar (${selectedFabric.fabricType})`,
      sku: `TG-BESPOKE-${selectedFabric.id.toUpperCase().slice(0, 3)}-${selectedCut.id.toUpperCase().slice(0, 3)}`,
      size: measurementMode === "preset" ? `${selectedPresetSize} (Custom Length)` : "Custom Tailored",
      colour: selectedFabric.colorName,
      price: totalPrice,
      maxStock: 99,
      imageUrl: selectedFabric.heroImage,
      slug: "bespoke-kanchipuram-silk-bridal-churidar",
      customizations: customSnapshot,
    });

    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 4500);
  };

  const STEPS = [
    { num: 1, title: "Fabric & Silhouette", subtitle: "Weave & Flare" },
    { num: 2, title: "Neckline & Sleeves", subtitle: "Contour & Cut" },
    { num: 3, title: "Bottom & Lining", subtitle: "Churidar & Comfort" },
    { num: 4, title: "Your Measurements", subtitle: "Sizing & Fit" },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-thaagai-line bg-white shadow-xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
      {/* 1. Atelier Top Header */}
      <div className="border-b border-thaagai-line/60 bg-[#FAF7F2] px-6 py-6 sm:px-10 dark:border-thaagai-line/30 dark:bg-[#1A1114]">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-thaagai-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bespoke Tailoring Atelier</span>
            </span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-thaagai-wine sm:text-3xl dark:text-white">
              Curate Your Custom Churidar Suit
            </h2>
            <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              Hand-cut to your posture with 1.5-inch inner alteration margins.
            </p>
          </div>

          {/* Transparent Live Price Pill */}
          <div className="rounded-2xl border border-thaagai-gold/60 bg-white px-5 py-3 shadow-xs dark:bg-thaagai-cardDark">
            <span className="block text-[10px] uppercase tracking-wider text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
              Configured Price
            </span>
            <span className="font-serif text-2xl font-bold text-thaagai-wine dark:text-thaagai-gold">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 2. Step Progress Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((s) => {
            const isCurrent = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  isCurrent
                    ? "border-thaagai-wine bg-white shadow-sm ring-1 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-cardDark dark:ring-thaagai-gold"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-transparent bg-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-thaagai-wine text-white"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-thaagai-line text-thaagai-ink dark:bg-white/10 dark:text-white"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                </div>
                <div className="overflow-hidden">
                  <div className="truncate text-xs font-bold text-thaagai-ink dark:text-white">
                    {s.title}
                  </div>
                  <div className="truncate text-[10px] text-thaagai-ink/50 dark:text-thaagai-inkDark/50">
                    {s.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace: Selections (Left) & Real Editorial Model Preview (Right) */}
      <div className="grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-12">
        {/* Left Column: Active Step Selector (7 Cols) */}
        <div className="lg:col-span-7">
          {/* STEP 1: Fabric & Kurta Cut */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  1. Select Handloom Fabric & Weave
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Directly sourced from artisan weaving clusters across Tamil Nadu and celebrated weaving hubs.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {FABRIC_OPTIONS.map((fab) => {
                    const isSelected = selectedFabric.id === fab.id;
                    return (
                      <div
                        key={fab.id}
                        onClick={() => setSelectedFabric(fab)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full border border-black/20 shadow-xs"
                              style={{ backgroundColor: fab.colorHex }}
                            />
                            <span className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                              {fab.label}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <span className="mt-1 block font-tamil text-[10px] text-thaagai-gold">
                          {fab.tamil}
                        </span>
                        <p className="mt-1.5 text-xs text-thaagai-ink/70 leading-relaxed dark:text-thaagai-inkDark/70">
                          {fab.desc}
                        </p>
                        <div className="mt-3 flex items-center justify-between border-t border-thaagai-line/40 pt-2 text-xs">
                          <span className="text-thaagai-ink/50">{fab.colorName}</span>
                          <span className="font-bold text-thaagai-wine dark:text-thaagai-gold">
                            {fab.priceDelta === 0 ? "Included" : `+₹${fab.priceDelta}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-thaagai-line/60 pt-6 dark:border-thaagai-line/30">
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  2. Choose Kurta Silhouette & Flare
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Drafted for seamless posture with side slits or multi-kali celebratory flare.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {KURTA_CUTS.map((cut) => {
                    const isSelected = selectedCut.id === cut.id;
                    return (
                      <div
                        key={cut.id}
                        onClick={() => setSelectedCut(cut)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                            {cut.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <span className="mt-1 block font-tamil text-[10px] text-thaagai-gold">
                          {cut.tamil}
                        </span>
                        <p className="mt-1.5 text-xs text-thaagai-ink/70 leading-relaxed dark:text-thaagai-inkDark/70">
                          {cut.desc}
                        </p>
                        {cut.priceDelta > 0 && (
                          <span className="mt-2 inline-block text-xs font-bold text-thaagai-wine dark:text-thaagai-gold">
                            +₹{cut.priceDelta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Neckline & Sleeves */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  3. Select Neckline Contour & Zari Trim
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Frames your necklaces and earrings with modest, flattering contours.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {NECKLINES.map((neck) => {
                    const isSelected = selectedNeck.id === neck.id;
                    return (
                      <div
                        key={neck.id}
                        onClick={() => setSelectedNeck(neck)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                            {neck.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <span className="mt-1 block font-tamil text-[10px] text-thaagai-gold">
                          {neck.tamil}
                        </span>
                        <p className="mt-1.5 text-xs text-thaagai-ink/70 leading-relaxed dark:text-thaagai-inkDark/70">
                          {neck.desc}
                        </p>
                        {neck.priceDelta > 0 && (
                          <span className="mt-2 inline-block text-xs font-bold text-thaagai-wine dark:text-thaagai-gold">
                            +₹{neck.priceDelta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-thaagai-line/60 pt-6 dark:border-thaagai-line/30">
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  4. Choose Sleeve Length & Cuffs
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Custom cut to your arm length with clean finished edges.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SLEEVE_STYLES.map((slv) => {
                    const isSelected = selectedSleeve.id === slv.id;
                    return (
                      <div
                        key={slv.id}
                        onClick={() => setSelectedSleeve(slv)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                            {slv.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <span className="mt-1 block font-tamil text-[10px] text-thaagai-gold">
                          {slv.tamil}
                        </span>
                        <p className="mt-1.5 text-xs text-thaagai-ink/70 leading-relaxed dark:text-thaagai-inkDark/70">
                          {slv.desc}
                        </p>
                        {slv.priceDelta > 0 && (
                          <span className="mt-2 inline-block text-xs font-bold text-thaagai-wine dark:text-thaagai-gold">
                            +₹{slv.priceDelta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Bottom Style & Lining */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  5. Choose Your Bottom Silhouette
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Tailored specifically to your height and waist preference.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {BOTTOM_STYLES.map((btm) => {
                    const isSelected = selectedBottom.id === btm.id;
                    return (
                      <div
                        key={btm.id}
                        onClick={() => setSelectedBottom(btm)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                            {btm.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <span className="mt-1 block font-tamil text-[10px] text-thaagai-gold">
                          {btm.tamil}
                        </span>
                        <p className="mt-1.5 text-xs text-thaagai-ink/70 leading-relaxed dark:text-thaagai-inkDark/70">
                          {btm.desc}
                        </p>
                        {btm.priceDelta > 0 && (
                          <span className="mt-2 inline-block text-xs font-bold text-thaagai-wine dark:text-thaagai-gold">
                            +₹{btm.priceDelta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-thaagai-line/60 pt-6 dark:border-thaagai-line/30">
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  6. Select Breathable Inner Lining
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Preshrunk soft natural linings for effortless tropical comfort.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {LINING_OPTIONS.map((lin) => {
                    const isSelected = selectedLining.id === lin.id;
                    return (
                      <div
                        key={lin.id}
                        onClick={() => setSelectedLining(lin)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? "border-thaagai-wine bg-thaagai-wine/5 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-wine/20 dark:ring-thaagai-gold"
                            : "border-thaagai-line bg-white hover:border-thaagai-wine/40 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-xs font-bold text-thaagai-ink dark:text-white">
                            {lin.label}
                          </span>
                          {isSelected && <Check className="h-4 w-4 text-thaagai-wine dark:text-thaagai-gold" />}
                        </div>
                        <p className="mt-1 text-[11px] text-thaagai-ink/70 leading-tight dark:text-thaagai-inkDark/70">
                          {lin.desc}
                        </p>
                        {lin.priceDelta > 0 && (
                          <span className="mt-2 inline-block text-[11px] font-bold text-thaagai-wine dark:text-thaagai-gold">
                            +₹{lin.priceDelta}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Measurements & Fit Guarantee */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-lg font-bold text-thaagai-wine dark:text-white">
                  7. Provide Your Sizing & Measurements
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Every piece is hand-cut with 1.5-inch inner alteration margins on both sides.
                </p>

                {/* Mode Selector */}
                <div className="mt-4 flex rounded-xl border border-thaagai-line bg-white p-1 text-xs dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
                  <button
                    type="button"
                    onClick={() => setMeasurementMode("preset")}
                    className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                      measurementMode === "preset"
                        ? "bg-thaagai-wine text-white shadow-xs"
                        : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
                    }`}
                  >
                    Quick Standard Size
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasurementMode("custom")}
                    className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                      measurementMode === "custom"
                        ? "bg-thaagai-wine text-white shadow-xs"
                        : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
                    }`}
                  >
                    Custom Inches
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeasurementMode("tailor_call")}
                    className={`flex-1 rounded-lg py-2 font-semibold transition-all ${
                      measurementMode === "tailor_call"
                        ? "bg-thaagai-wine text-white shadow-xs"
                        : "text-thaagai-ink hover:text-thaagai-wine dark:text-white"
                    }`}
                  >
                    Tailor Video Call
                  </button>
                </div>

                {/* Sub-view: Preset Size */}
                {measurementMode === "preset" && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-5 dark:border-thaagai-line/30 dark:bg-thaagai-cardDark/40">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/70 dark:text-thaagai-inkDark/70 block">
                        Select Standard Size:
                      </span>
                      <div className="mt-2 grid grid-cols-6 gap-2">
                        {STANDARD_PRESETS.map((p) => {
                          const isSelected = selectedPresetSize === p.size;
                          return (
                            <button
                              key={p.size}
                              type="button"
                              onClick={() => applyPreset(p.size, heightProfile)}
                              className={`rounded-xl border py-2.5 text-center text-xs font-bold transition-all ${
                                isSelected
                                  ? "border-thaagai-wine bg-thaagai-wine text-white shadow-sm"
                                  : "border-thaagai-line bg-white text-thaagai-ink hover:border-thaagai-wine dark:bg-thaagai-cardDark dark:text-white"
                              }`}
                            >
                              {p.size}
                              <span className="block text-[9px] font-normal opacity-75">{p.bust}&quot;</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink/70 dark:text-thaagai-inkDark/70 block">
                        Height Fit (Determines Kurta & Pant Hem):
                      </span>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        {[
                          { id: "petite", label: "Petite (5'0\"–5'2\")", len: "Kurta: 41\" · Pant: 38\"" },
                          { id: "regular", label: "Regular (5'3\"–5'5\")", len: "Kurta: 43\" · Pant: 39\"" },
                          { id: "tall", label: "Tall (5'6\"+)", len: "Kurta: 45\" · Pant: 41\"" },
                        ].map((h) => {
                          const isSelected = heightProfile === h.id;
                          return (
                            <button
                              key={h.id}
                              type="button"
                              onClick={() => applyPreset(selectedPresetSize, h.id as any)}
                              className={`rounded-xl border p-3 text-left transition-all ${
                                isSelected
                                  ? "border-thaagai-wine bg-thaagai-wine/10 ring-1 ring-thaagai-wine"
                                  : "border-thaagai-line bg-white text-thaagai-ink hover:border-thaagai-wine dark:bg-thaagai-cardDark dark:text-white"
                              }`}
                            >
                              <div className="text-xs font-bold text-thaagai-ink dark:text-white">
                                {h.label}
                              </div>
                              <div className="mt-0.5 text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                                {h.len}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-view: Custom Inches */}
                {measurementMode === "custom" && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { label: "Bust", val: bust, setter: setBust, min: 30, max: 54 },
                      { label: "Waist", val: waist, setter: setWaist, min: 24, max: 48 },
                      { label: "Hips", val: hips, setter: setHips, min: 32, max: 56 },
                      { label: "Kurta Length", val: kurtaLength, setter: setKurtaLength, min: 36, max: 50 },
                      { label: "Pant Length", val: bottomLength, setter: setBottomLength, min: 34, max: 46 },
                    ].map((m) => (
                      <div key={m.label} className="rounded-2xl border border-thaagai-line bg-white p-3.5 dark:bg-thaagai-cardDark">
                        <span className="text-[11px] font-medium text-thaagai-ink/60 dark:text-thaagai-inkDark/60 block">
                          {m.label}
                        </span>
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => m.setter((prev) => Math.max(m.min, prev - 1))}
                            className="h-7 w-7 rounded-lg bg-[#FAF7F2] font-bold text-thaagai-wine hover:bg-thaagai-sand transition-colors"
                          >
                            -
                          </button>
                          <span className="font-serif text-base font-bold text-thaagai-wine dark:text-thaagai-gold">
                            {m.val}&quot;
                          </span>
                          <button
                            type="button"
                            onClick={() => m.setter((prev) => Math.min(m.max, prev + 1))}
                            className="h-7 w-7 rounded-lg bg-[#FAF7F2] font-bold text-thaagai-wine hover:bg-thaagai-sand transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-view: Tailor Video Call */}
                {measurementMode === "tailor_call" && (
                  <div className="mt-5 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-xs text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-300">
                      <PhoneCall className="h-4 w-4" />
                      <span>5-Minute Master Tailor Video Verification</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                      Relax without measuring tape stress! Once your request is received, our master pattern maker connects via a quick WhatsApp video call to verify your posture and shoulder slope.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="mt-8 flex items-center justify-between border-t border-thaagai-line/60 pt-5 dark:border-thaagai-line/30">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1.5 rounded-xl border border-thaagai-line bg-white px-5 py-2.5 text-xs font-semibold text-thaagai-ink transition-all hover:bg-[#FAF7F2] dark:border-thaagai-line/30 dark:bg-thaagai-cardDark dark:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1.5 rounded-xl bg-thaagai-wine px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-thaagai-wineHover"
              >
                <span>Continue to Step {currentStep + 1}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Ready for Tailoring Blueprint
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Editorial Visual Showcase & Checkout (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Real Editorial Model Showcase Card */}
          <div className="overflow-hidden rounded-3xl border border-thaagai-line bg-white shadow-lg dark:border-thaagai-line/30 dark:bg-thaagai-cardDark">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-thaagai-sand/30">
              <Image
                src={selectedFabric.heroImage}
                alt={selectedFabric.label}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {/* Badges on image */}
              <div className="absolute left-4 top-4 flex flex-col gap-1">
                <span className="rounded-full bg-thaagai-wine px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  {selectedFabric.fabricType}
                </span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-xs">
                  {selectedCut.label}
                </span>
              </div>

              {/* Bottom specifications overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="font-tamil text-xs text-thaagai-gold">
                  {selectedFabric.tamil}
                </p>
                <h4 className="font-serif text-lg font-bold">
                  {selectedFabric.label}
                </h4>
                <p className="mt-1 text-xs text-white/80 line-clamp-1">
                  {selectedNeck.label} · {selectedSleeve.label} · {selectedBottom.label.split(" ")[0]}
                </p>
              </div>
            </div>

            {/* 2. Itemized Blueprint */}
            <div className="p-5">
              <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-3 dark:border-thaagai-line/30">
                <span className="font-serif text-xs font-bold uppercase tracking-wider text-thaagai-wine dark:text-thaagai-gold">
                  Bespoke Blueprint
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  4–6 Business Days
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-thaagai-ink/75 dark:text-thaagai-inkDark/75">
                <div className="flex justify-between">
                  <span>Base Tailoring:</span>
                  <span className="font-semibold">₹{BASE_PRICE}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fabric ({selectedFabric.label.split(" ").slice(0, 2).join(" ")}):</span>
                  <span className="font-semibold">{selectedFabric.priceDelta === 0 ? "Included" : `+₹${selectedFabric.priceDelta}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Silhouette & Neckline:</span>
                  <span className="font-semibold">+{selectedCut.priceDelta + selectedNeck.priceDelta}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bottom ({selectedBottom.label.split(" ")[0]}):</span>
                  <span className="font-semibold">{selectedBottom.priceDelta === 0 ? "Included" : `+₹${selectedBottom.priceDelta}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comfort Lining:</span>
                  <span className="font-semibold">{selectedLining.priceDelta === 0 ? "Included" : `+₹${selectedLining.priceDelta}`}</span>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between border-t border-thaagai-line/60 pt-3 dark:border-thaagai-line/30">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-thaagai-ink/50 block">
                    All-Inclusive Price:
                  </span>
                  <span className="font-serif text-2xl font-bold text-thaagai-wine dark:text-thaagai-gold">
                    ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="text-[11px] text-thaagai-ink/60">
                  Free Shipping in India
                </span>
              </div>

              {/* Success Toast */}
              {cartSuccess && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>Custom Churidar added to bag!</span>
                  <Link href="/cart" className="ml-auto underline font-bold hover:text-emerald-950">
                    View Bag
                  </Link>
                </div>
              )}

              {/* CTAs */}
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-thaagai-wine px-4 text-xs font-bold text-white shadow-md transition-all hover:bg-thaagai-wineHover"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add Bespoke Set to Bag (₹{totalPrice.toLocaleString("en-IN")})</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateWhatsApp}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-white px-4 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-50 dark:bg-thaagai-cardDark dark:text-emerald-400"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>Book via WhatsApp Master Tailor</span>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Zero-risk: Pattern verified before fabric cutting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
