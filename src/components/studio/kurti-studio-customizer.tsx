"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ThreeKurtiViewer,
  SilhouetteStyle,
  NecklineStyle,
  SleeveStyle,
  BottomWearStyle,
} from "./three-kurti-viewer";
import { CustomFabric, INITIAL_FABRICS } from "@/server/services/fabric-service";
import { useCart } from "@/context/cart-context";
import { buildWhatsAppLink, getWhatsAppBusinessNumber } from "@/lib/whatsapp";
import {
  Sparkles,
  Scissors,
  ShoppingBag,
  MessageSquare,
  Check,
  ChevronRight,
  Info,
  Layers,
  Ruler,
  CheckCircle2,
  FileCode,
} from "lucide-react";

interface KurtiStudioCustomizerProps {
  initialFabrics?: CustomFabric[];
  whatsappNumber?: string;
}

export function KurtiStudioCustomizer({
  initialFabrics = INITIAL_FABRICS,
  whatsappNumber,
}: KurtiStudioCustomizerProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const fabrics = initialFabrics.length > 0 ? initialFabrics : INITIAL_FABRICS;
  const [selectedFabric, setSelectedFabric] = useState<CustomFabric>(fabrics[0]);
  const [silhouette, setSilhouette] = useState<SilhouetteStyle>("STRAIGHT_CUT");
  const [neckline, setNeckline] = useState<NecklineStyle>("ROUND");
  const [sleeves, setSleeves] = useState<SleeveStyle>("THREE_QUARTER");
  const [bottomWear, setBottomWear] = useState<BottomWearStyle>("NONE");
  const [size, setSize] = useState<string>("M");
  const [heightProfile, setHeightProfile] = useState<"PETITE" | "REGULAR" | "TALL">("REGULAR");
  const [customBust, setCustomBust] = useState<string>("38");
  const [customLength, setCustomLength] = useState<string>("44");
  const [activeTab, setActiveTab] = useState<"fabric" | "styling" | "sizing">("fabric");
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showManifest, setShowManifest] = useState(false);

  // METERS REQUIRED BASED ON SILHOUETTE & SLEEVES
  // Straight Cut: 2.0m (sleeveless) / 2.5m (3/4th)
  // Kalidar Anarkali (16 flared kalis): 3.5m (sleeveless) / 4.0m (3/4th)
  const metersRequired = useMemo(() => {
    if (silhouette === "STRAIGHT_CUT") {
      return sleeves === "THREE_QUARTER" ? 2.5 : 2.0;
    }
    return sleeves === "THREE_QUARTER" ? 4.0 : 3.5;
  }, [silhouette, sleeves]);

  const fabricCost = Math.round(selectedFabric.pricePerMeter * metersRequired);
  
  // Tailoring charge: Straight Cut = ₹650, Kalidar Anarkali = ₹1,150
  const tailoringCharge = silhouette === "STRAIGHT_CUT" ? 650 : 1150;

  // Bottom wear add-on pricing:
  // None = ₹0, Churidar = ₹750 (2m ivory fabric + gathering), Cigarette = ₹850 (tailored)
  const bottomWearCost = useMemo(() => {
    if (bottomWear === "CHURIDAR_GATHERED") return 750;
    if (bottomWear === "CIGARETTE_PANTS") return 850;
    return 0;
  }, [bottomWear]);

  const totalPrice = fabricCost + tailoringCharge + bottomWearCost;

  // WORKSHOP ORDER MANIFEST
  const orderManifest = useMemo(() => {
    return {
      manifestVersion: "2.0-thaagai-3d",
      garmentType: silhouette === "STRAIGHT_CUT" ? "STRAIGHT_CUT_KURTI" : "KALIDAR_ANARKALI_KURTI",
      fabric: {
        fabricId: selectedFabric.fabricId,
        name: selectedFabric.name,
        type: selectedFabric.fabricType,
        placementMode: selectedFabric.placementMode,
        repeatScaleCm: {
          width: selectedFabric.repeatWidthCm,
          height: selectedFabric.repeatHeightCm,
        },
        metersRequired,
        pricePerMeter: selectedFabric.pricePerMeter,
        fabricCost,
      },
      styling: {
        silhouette: silhouette === "STRAIGHT_CUT"
          ? "Straight Cut Kurti with High Open Side Slits"
          : "16-Kali Flared Anarkali with Empire Bodice & Zari Waistband",
        neckline: neckline === "ROUND" ? "Round Scoop Neckline" : "Contoured Sweetheart Neckline",
        sleeves: sleeves === "THREE_QUARTER" ? "3/4th Gathered Sleeves with Zari Cuff" : "Modern Sleeveless with Piped Trim",
        bottomWear: bottomWear === "NONE"
          ? "None (Tunic / Kurti Only)"
          : bottomWear === "CHURIDAR_GATHERED"
          ? "Gathered Churidar in Ivory Raw Silk (6 Ankle Gathering Rings)"
          : "Tailored Cigarette Trousers in Ivory Raw Silk with Ankle Slit Buttons",
        sideSlits: silhouette === "STRAIGHT_CUT" ? "Standard 14-inch High Side Slits with Zari Piping" : "Seamless 360-degree Flared Kalis",
      },
      measurements: {
        standardSize: size,
        heightProfile,
        bustInches: customBust,
        kurtaLengthInches: customLength,
      },
      pricing: {
        fabricSubtotal: fabricCost,
        tailoringSubtotal: tailoringCharge,
        bottomWearSubtotal: bottomWearCost,
        totalInr: totalPrice,
      },
      timestamp: new Date().toISOString(),
    };
  }, [selectedFabric, silhouette, neckline, sleeves, bottomWear, size, heightProfile, customBust, customLength, metersRequired, fabricCost, tailoringCharge, bottomWearCost, totalPrice]);

  // WHATSAPP CONSULTATION MESSAGE
  const phone = whatsappNumber || getWhatsAppBusinessNumber();
  const whatsappMessage = `Hello Thaagai! I customized this 3D Kurti in your 3D Studio:
Fabric: ${selectedFabric.name} (${selectedFabric.fabricId})
Silhouette: ${silhouette === "STRAIGHT_CUT" ? "Straight Cut with Side Slits" : "16-Kali Flared Anarkali"}
Neckline: ${neckline === "ROUND" ? "Round Scoop" : "Sweetheart Plunge"}
Sleeves: ${sleeves === "THREE_QUARTER" ? "3/4th Sleeves" : "Sleeveless"}
Bottoms: ${bottomWear === "NONE" ? "Tunic Only" : bottomWear === "CHURIDAR_GATHERED" ? "Gathered Churidar Pants" : "Cigarette Trousers"}
Size: ${size} (${customBust}" Bust, ${customLength}" Length)
Calculated Price: ₹${totalPrice.toLocaleString("en-IN")} (Fabric: ₹${fabricCost} + Tailoring: ₹${tailoringCharge}${bottomWearCost > 0 ? ` + Bottoms: ₹${bottomWearCost}` : ""})

Could your master tailor confirm fabric stock and pattern cut?`;

  const whatsappUrl = buildWhatsAppLink(phone, whatsappMessage);

  const handleAddToBag = () => {
    addItem(
      {
        variantId: `3d-kurti-${selectedFabric.fabricId}-${silhouette}-${neckline}-${sleeves}-${bottomWear}-${size}`,
        productId: `3d-kurti-${selectedFabric.fabricId}`,
        name: `Bespoke 3D ${silhouette === "STRAIGHT_CUT" ? "Straight Kurti" : "Flared Anarkali"} — ${selectedFabric.name}`,
        sku: `3D-${selectedFabric.fabricId}-${silhouette.slice(0, 3)}-${size}`,
        size,
        colour: selectedFabric.name,
        price: totalPrice,
        salePrice: null,
        maxStock: 5,
        imageUrl: selectedFabric.originalPhoto,
        slug: "3d-studio",
        customizations: {
          productType: "CUSTOM_MADE",
          sizeMode: "STANDARD",
          standardSize: size,
          totalCustomPrice: totalPrice,
          selections: [
            { groupName: "Fabric", optionName: `${selectedFabric.name} (${selectedFabric.fabricId})`, priceDelta: fabricCost },
            { groupName: "Silhouette", optionName: silhouette === "STRAIGHT_CUT" ? "Straight Cut with Side Slits" : "16-Kali Flared Anarkali" },
            { groupName: "Neckline", optionName: neckline === "ROUND" ? "Round Scoop Neck" : "Sweetheart Plunge" },
            { groupName: "Sleeves", optionName: sleeves === "THREE_QUARTER" ? "3/4th Gathered Sleeves" : "Modern Sleeveless" },
            { groupName: "Bottom Wear", optionName: bottomWear === "NONE" ? "Tunic Only" : bottomWear === "CHURIDAR_GATHERED" ? "Gathered Churidar Pants" : "Tailored Cigarette Trousers", priceDelta: bottomWearCost },
          ],
          measurements: {
            bust: customBust,
            length: customLength,
            notes: `3D Studio Atelier Configuration. Fabric ID: ${selectedFabric.fabricId}, Meters: ${metersRequired}m. Silhouette: ${silhouette}. Bottoms: ${bottomWear}. Placement: ${selectedFabric.placementMode}.`,
          },
        },
      },
      1
    );

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Studio Header Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/" className="hover:text-[#8A4A38] transition">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-stone-400" />
            <span className="font-bold text-stone-900">3D Fabric Studio</span>
          </div>
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-medium tracking-tight text-stone-900">
            Real-Time 3D Kurti Atelier
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-stone-600">
            Choose physical handloom fabrics from our boutique racks and watch them drape live on a 3D model.
          </p>
        </div>

        {/* Studio Prototype Badge */}
        <div className="flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/80 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <span>Calibrated Fabric-to-3D Prototype</span>
        </div>
      </div>

      {/* Main Studio Grid: 3D Canvas Left, Interactive Customizer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================================================================
            LEFT / CENTER: 3D WebGL Canvas Viewport (7 Cols)
           =================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <ThreeKurtiViewer
            fabric={selectedFabric}
            silhouette={silhouette}
            neckline={neckline}
            sleeves={sleeves}
            bottomWear={bottomWear}
            autoRotate={false}
          />

          {/* Quick Specifications Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl border border-stone-200 bg-white p-3 text-center shadow-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-400">Fabric</p>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {selectedFabric.fabricId}
              </p>
            </div>
            <div className="border-l sm:border-x border-stone-100">
              <p className="text-[10px] uppercase font-bold text-stone-400">Silhouette</p>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {silhouette === "STRAIGHT_CUT" ? "Straight Cut" : "Kalidar Flare"}
              </p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-r border-stone-100 pt-2 sm:pt-0">
              <p className="text-[10px] uppercase font-bold text-stone-400">Neck & Sleeve</p>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {neckline === "ROUND" ? "Round" : "Sweetheart"} • {sleeves === "THREE_QUARTER" ? "3/4th" : "Sleeveless"}
              </p>
            </div>
            <div className="border-t sm:border-t-0 border-l sm:border-l-0 border-stone-100 pt-2 sm:pt-0">
              <p className="text-[10px] uppercase font-bold text-stone-400">Bottoms</p>
              <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">
                {bottomWear === "NONE" ? "Tunic Only" : bottomWear === "CHURIDAR_GATHERED" ? "Churidar" : "Cigarette"}
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            RIGHT: Interactive Atelier Customizer Controls (5 Cols)
           =================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 shadow-sm">
          {/* Step Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 text-xs font-bold text-stone-600">
            <button
              type="button"
              onClick={() => setActiveTab("fabric")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                activeTab === "fabric"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "hover:text-stone-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>1. Fabric</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("styling")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                activeTab === "styling"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "hover:text-stone-900"
              }`}
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>2. Style</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sizing")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition ${
                activeTab === "sizing"
                  ? "bg-white text-stone-900 shadow-xs"
                  : "hover:text-stone-900"
              }`}
            >
              <Ruler className="h-3.5 w-3.5" />
              <span>3. Sizing</span>
            </button>
          </div>

          {/* TAB 1: FABRICS SELECTION */}
          {activeTab === "fabric" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900">
                    Boutique Fabric Racks
                  </h3>
                  <p className="text-xs text-stone-500">
                    Straight-on scans calibrated with real-world physical repeat scale
                  </p>
                </div>
                <span className="text-xs font-bold text-[#8A4A38]">
                  {fabrics.length} Available
                </span>
              </div>

              <div className="space-y-3">
                {fabrics.map((f) => {
                  const isSelected = selectedFabric.fabricId === f.fabricId;
                  return (
                    <button
                      key={f.id || f.fabricId}
                      type="button"
                      onClick={() => setSelectedFabric(f)}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 shadow-xs"
                          : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                      }`}
                    >
                      {/* Fabric Swatch Preview */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-2xs">
                        <Image
                          src={f.originalPhoto}
                          alt={f.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#8A4A38]/20 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white stroke-[3] drop-shadow-xs" />
                          </div>
                        )}
                      </div>

                      {/* Fabric Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A4A38]">
                            {f.fabricId}
                          </span>
                          <span className="rounded bg-stone-100 px-1.5 py-0.2 text-[9px] font-semibold text-stone-600">
                            {f.fabricType}
                          </span>
                          {f.placementMode === "BORDER_HEM" && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                              Zari Border
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-xs sm:text-sm font-semibold text-stone-900 truncate mt-0.5">
                          {f.name}
                        </h4>

                        <div className="mt-1 flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-900">
                            ₹{f.pricePerMeter}/m
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {f.stockMeters}m in stock
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("styling")}
                className="w-full mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 text-xs font-bold text-white transition hover:bg-stone-800"
              >
                <span>Proceed to Neckline & Sleeves</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* TAB 2: STYLING (SILHOUETTE, NECKLINE, SLEEVES & BOTTOMS) */}
          {activeTab === "styling" && (
            <div className="space-y-6">
              {/* Silhouette Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    1. Garment Silhouette
                  </h4>
                  <span className="text-[11px] font-semibold text-[#8A4A38]">
                    {silhouette === "STRAIGHT_CUT" ? "Classic Straight" : "16-Kali Flare"}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSilhouette("STRAIGHT_CUT")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      silhouette === "STRAIGHT_CUT"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Straight Cut Kurti</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">High Side Slits • 2.0–2.5m</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSilhouette("KALIDAR_ANARKALI")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      silhouette === "KALIDAR_ANARKALI"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Kalidar Flared Anarkali</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">16-Kali Flare • 3.5–4.0m</span>
                  </button>
                </div>
              </div>

              {/* Neckline Selection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Neckline Cut
                </h4>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNeckline("ROUND")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      neckline === "ROUND"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Round Scoop Neck</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Classic Scoop Cut</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeckline("SWEETHEART")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      neckline === "SWEETHEART"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Sweetheart Plunge</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Festive Contoured</span>
                  </button>
                </div>
              </div>

              {/* Sleeve Style Selection */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  3. Sleeve Style
                </h4>
                <div className="mt-2.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSleeves("THREE_QUARTER")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      sleeves === "THREE_QUARTER"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">3/4th Gathered Sleeves</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Zari Border Cuffs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSleeves("SLEEVELESS")}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition ${
                      sleeves === "SLEEVELESS"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Modern Sleeveless</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Bias Piped Armholes</span>
                  </button>
                </div>
              </div>

              {/* Bottom Wear Selection */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    4. Matching Bottom Wear
                  </h4>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {bottomWear === "NONE" ? "Tunic Only" : "Suit Set"}
                  </span>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBottomWear("NONE")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      bottomWear === "NONE"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Kurti Only</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">No Bottoms</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBottomWear("CHURIDAR_GATHERED")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      bottomWear === "CHURIDAR_GATHERED"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Churidar</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">6 Rings • +₹750</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBottomWear("CIGARETTE_PANTS")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                      bottomWear === "CIGARETTE_PANTS"
                        ? "border-[#8A4A38] bg-[#FAF7F2] ring-2 ring-[#8A4A38]/20 text-stone-900 font-bold shadow-xs"
                        : "border-stone-200 bg-white hover:border-stone-300 text-stone-600 font-medium"
                    }`}
                  >
                    <span className="text-xs">Cigarette Pant</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Tailored • +₹850</span>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("sizing")}
                className="w-full mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 text-xs font-bold text-white transition hover:bg-stone-800"
              >
                <span>Proceed to Size & Tailoring</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* TAB 3: SIZING & WORKSHOP MANIFEST */}
          {activeTab === "sizing" && (
            <div className="space-y-5">
              {/* Sizing Standard Buttons */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Standard Size
                  </h4>
                  <span className="text-xs text-stone-500">
                    Bust: {size === "S" ? "36" : size === "M" ? "38" : size === "L" ? "40" : size === "XL" ? "42" : size === "XXL" ? "44" : "46"}&quot;
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSize(sz);
                        const bMap: Record<string, string> = { S: "36", M: "38", L: "40", XL: "42", XXL: "44", "3XL": "46" };
                        setCustomBust(bMap[sz] || "38");
                      }}
                      className={`min-w-[46px] h-10 px-3 rounded-lg text-xs font-bold transition ${
                        size === sz
                          ? "border-2 border-stone-900 bg-white text-stone-900 shadow-xs"
                          : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height Profile */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Height Profile
                </h4>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "PETITE", label: "Petite", sub: "Below 5'3\"" },
                    { id: "REGULAR", label: "Regular", sub: "5'3\" – 5'6\"" },
                    { id: "TALL", label: "Tall", sub: "Above 5'6\"" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setHeightProfile(p.id as any)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        heightProfile === p.id
                          ? "border-[#8A4A38] bg-[#FAF7F2] text-stone-900 font-bold"
                          : "border-stone-200 bg-white text-stone-600"
                      }`}
                    >
                      <p className="text-xs">{p.label}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{p.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Order Manifest Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowManifest(!showManifest)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                >
                  <FileCode className="h-3.5 w-3.5 text-[#8A4A38]" />
                  <span>{showManifest ? "Hide Workshop Manifest" : "View Technical Workshop Manifest"}</span>
                </button>

                {showManifest && (
                  <pre className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-stone-900 p-3 text-[11px] font-mono text-emerald-400">
                    {JSON.stringify(orderManifest, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              LIVE PRICING SUMMARY & DUAL CTAS (Always Visible)
             ================================================================= */}
          <div className="border-t border-stone-200/80 pt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Kurti Fabric ({metersRequired}m @ ₹{selectedFabric.pricePerMeter}/m):</span>
              <span className="font-semibold text-stone-900">₹{fabricCost.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span>Master Tailoring ({silhouette === "STRAIGHT_CUT" ? "Straight Cut" : "16-Kali Anarkali"}):</span>
              <span className="font-semibold text-stone-900">₹{tailoringCharge.toLocaleString("en-IN")}</span>
            </div>
            {bottomWearCost > 0 && (
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Matching Bottoms ({bottomWear === "CHURIDAR_GATHERED" ? "Gathered Churidar" : "Cigarette Trousers"}):</span>
                <span className="font-semibold text-stone-900">₹{bottomWearCost.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-stone-200/60 pt-2">
              <div>
                <span className="font-serif text-base font-bold text-stone-900">
                  Total Custom Price:
                </span>
                <p className="text-[10px] text-stone-400">Inclusive of all taxes & handloom cutting</p>
              </div>
              <span className="font-sans text-xl font-bold text-stone-900">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {/* Add to Bag Button */}
              <button
                type="button"
                onClick={handleAddToBag}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold shadow-xs transition active:scale-95 ${
                  addedAnimation
                    ? "bg-emerald-700 text-white"
                    : "bg-[#8A4A38] text-white hover:bg-[#723B2C]"
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              {/* Order via WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow-xs transition hover:bg-[#20ba5a] active:scale-95"
              >
                <MessageSquare className="h-4 w-4 fill-white" />
                <span>Book via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
