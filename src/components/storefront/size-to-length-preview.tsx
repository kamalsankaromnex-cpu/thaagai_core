"use client";

import { useState } from "react";
import { Ruler, Scissors, Sparkles, CheckCircle2, MessageCircle, Info } from "lucide-react";
import { LotusMotif } from "@/components/storefront/tamil-motifs";

export interface SizeToLengthPreviewProps {
  initialSize?: string;
  className?: string;
  compact?: boolean;
}

interface SizeRowData {
  size: string;
  bustIn: string;
  bustCm: string;
  waistIn: string;
  waistCm: string;
  hipIn: string;
  hipCm: string;
  kurtaLenIn: string;
  kurtaLenCm: string;
  straightPantIn: string;
  straightPantCm: string;
  churidarLenIn: string;
  churidarLenCm: string;
  shoulderIn: string;
  shoulderCm: string;
  heightRec: string;
}

const MASTER_SIZE_ROWS: SizeRowData[] = [
  {
    size: "XS",
    bustIn: "32",
    bustCm: "81",
    waistIn: "28",
    waistCm: "71",
    hipIn: "36",
    hipCm: "91",
    kurtaLenIn: "42",
    kurtaLenCm: "107",
    straightPantIn: "37",
    straightPantCm: "94",
    churidarLenIn: "44",
    churidarLenCm: "112",
    shoulderIn: "13.5",
    shoulderCm: "34",
    heightRec: "5'0\" – 5'2\"",
  },
  {
    size: "S",
    bustIn: "34",
    bustCm: "86",
    waistIn: "30",
    waistCm: "76",
    hipIn: "38",
    hipCm: "97",
    kurtaLenIn: "43",
    kurtaLenCm: "109",
    straightPantIn: "37.5",
    straightPantCm: "95",
    churidarLenIn: "45",
    churidarLenCm: "114",
    shoulderIn: "14",
    shoulderCm: "36",
    heightRec: "5'2\" – 5'4\"",
  },
  {
    size: "M",
    bustIn: "36",
    bustCm: "91",
    waistIn: "32",
    waistCm: "81",
    hipIn: "40",
    hipCm: "102",
    kurtaLenIn: "44",
    kurtaLenCm: "112",
    straightPantIn: "38",
    straightPantCm: "97",
    churidarLenIn: "46",
    churidarLenCm: "117",
    shoulderIn: "14.5",
    shoulderCm: "37",
    heightRec: "5'4\" – 5'6\"",
  },
  {
    size: "L",
    bustIn: "38",
    bustCm: "97",
    waistIn: "34",
    waistCm: "86",
    hipIn: "42",
    hipCm: "107",
    kurtaLenIn: "44",
    kurtaLenCm: "112",
    straightPantIn: "38.5",
    straightPantCm: "98",
    churidarLenIn: "46",
    churidarLenCm: "117",
    shoulderIn: "15",
    shoulderCm: "38",
    heightRec: "5'5\" – 5'7\"",
  },
  {
    size: "XL",
    bustIn: "40",
    bustCm: "102",
    waistIn: "36",
    waistCm: "91",
    hipIn: "44",
    hipCm: "112",
    kurtaLenIn: "45",
    kurtaLenCm: "114",
    straightPantIn: "39",
    straightPantCm: "99",
    churidarLenIn: "47",
    churidarLenCm: "119",
    shoulderIn: "15.5",
    shoulderCm: "39",
    heightRec: "5'6\" – 5'8\"",
  },
  {
    size: "XXL",
    bustIn: "42",
    bustCm: "107",
    waistIn: "38",
    waistCm: "97",
    hipIn: "46",
    hipCm: "117",
    kurtaLenIn: "45",
    kurtaLenCm: "114",
    straightPantIn: "39.5",
    straightPantCm: "100",
    churidarLenIn: "47",
    churidarLenCm: "119",
    shoulderIn: "16",
    shoulderCm: "41",
    heightRec: "5'7\" – 5'9\"",
  },
  {
    size: "3XL",
    bustIn: "44",
    bustCm: "112",
    waistIn: "40",
    waistCm: "102",
    hipIn: "48",
    hipCm: "122",
    kurtaLenIn: "46",
    kurtaLenCm: "117",
    straightPantIn: "40",
    straightPantCm: "102",
    churidarLenIn: "48",
    churidarLenCm: "122",
    shoulderIn: "16.5",
    shoulderCm: "42",
    heightRec: "5'8\"+",
  },
];

const HEIGHT_BRACKETS = [
  { id: "petite", label: "Petite (Under 5'2\" / <157 cm)", hemNote: "Falls 2.5\" to 3\" below knee (graceful mid-calf drape)" },
  { id: "classic", label: "Classic (5'3\" to 5'5\" / 160–165 cm)", hemNote: "Hits classic 2\" below knee (proportional South Indian drape)" },
  { id: "medium-tall", label: "Medium-Tall (5'6\" to 5'7\" / 167–170 cm)", hemNote: "Hits just below knee with sharp modern silhouette" },
  { id: "tall", label: "Statuesque (5'8\"+ / >172 cm)", hemNote: "Hits knee level; custom extended length available on request" },
];

export function SizeToLengthPreview({
  initialSize = "M",
  className = "",
  compact = false,
}: SizeToLengthPreviewProps) {
  const [selectedSize, setSelectedSize] = useState<string>(initialSize);
  const [selectedHeight, setSelectedHeight] = useState<string>("classic");
  const [unit, setUnit] = useState<"INCH" | "CM">("INCH");

  const currentData =
    MASTER_SIZE_ROWS.find((r) => r.size === selectedSize) || MASTER_SIZE_ROWS[2];
  const currentHeightBracket =
    HEIGHT_BRACKETS.find((h) => h.id === selectedHeight) || HEIGHT_BRACKETS[1];

  const kurtaLen = unit === "INCH" ? `${currentData.kurtaLenIn}"` : `${currentData.kurtaLenCm} cm`;
  const bustVal = unit === "INCH" ? `${currentData.bustIn}"` : `${currentData.bustCm} cm`;
  const waistVal = unit === "INCH" ? `${currentData.waistIn}"` : `${currentData.waistCm} cm`;
  const hipVal = unit === "INCH" ? `${currentData.hipIn}"` : `${currentData.hipCm} cm`;
  const straightVal = unit === "INCH" ? `${currentData.straightPantIn}"` : `${currentData.straightPantCm} cm`;
  const churidarVal = unit === "INCH" ? `${currentData.churidarLenIn}"` : `${currentData.churidarLenCm} cm`;
  const shoulderVal = unit === "INCH" ? `${currentData.shoulderIn}"` : `${currentData.shoulderCm} cm`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Unit Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#8A4A38]" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Size to Length & Drape Preview
            </h3>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Visual length and height proportion simulator
          </p>
        </div>

        {/* Unit Toggle */}
        <div className="flex items-center self-start sm:self-auto rounded-lg border border-stone-300 bg-stone-100 p-0.5">
          <button
            type="button"
            onClick={() => setUnit("INCH")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition ${
              unit === "INCH"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Inches (in)
          </button>
          <button
            type="button"
            onClick={() => setUnit("CM")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition ${
              unit === "CM"
                ? "bg-white text-stone-900 shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Centimetres (cm)
          </button>
        </div>
      </div>

      {/* 2. Controls: Size Buttons & Height Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Size Selection */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
            1. Select Boutique Size:
          </span>
          <div className="flex flex-wrap gap-2">
            {MASTER_SIZE_ROWS.map((r) => {
              const isSelected = selectedSize === r.size;
              return (
                <button
                  key={r.size}
                  type="button"
                  onClick={() => setSelectedSize(r.size)}
                  className={`min-w-[42px] h-9 px-3 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "border-2 border-stone-900 bg-stone-900 text-white shadow-xs"
                      : "border border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {r.size}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            Recommended height for Size {selectedSize}: <strong>{currentData.heightRec}</strong>
          </p>
        </div>

        {/* Height Bracket Selection */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <span className="block text-xs font-bold uppercase tracking-wider text-stone-900 mb-2">
            2. Select Your Height:
          </span>
          <select
            value={selectedHeight}
            onChange={(e) => setSelectedHeight(e.target.value)}
            className="w-full h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs text-stone-900 font-medium focus:border-stone-900 focus:outline-none"
          >
            {HEIGHT_BRACKETS.map((h) => (
              <option key={h.id} value={h.id}>
                {h.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] text-[#8A4A38] font-medium">
            ✓ {currentHeightBracket.hemNote}
          </p>
        </div>
      </div>

      {/* 3. Interactive Silhouette & Measurement Blueprint Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
        {/* Left: Graphical Proportional Silhouette (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-xl bg-[#FAF8F5] p-5 border border-stone-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A4A38] mb-3">
            Drape & Hemline Blueprint
          </span>

          {/* SVG Silhouette with Length Callouts */}
          <div className="relative w-full max-w-[220px] aspect-[1/2] flex flex-col items-center justify-between py-2">
            <svg
              viewBox="0 0 200 400"
              className="w-full h-full drop-shadow-xs"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Shoulders */}
              <line x1="60" y1="50" x2="140" y2="50" stroke="#8A4A38" strokeWidth="3" strokeLinecap="round" />
              {/* Neck contour */}
              <path d="M85 50 Q100 65 115 50" stroke="#8A4A38" strokeWidth="2" fill="none" />
              
              {/* Kurta Body Outline */}
              <path
                d="M60 50 L52 110 L58 160 L45 270 L155 270 L142 160 L148 110 L140 50 Z"
                fill="#F4EDE4"
                stroke="#8A4A38"
                strokeWidth="2"
              />

              {/* Kurta Placket & Yoke */}
              <line x1="100" y1="58" x2="100" y2="120" stroke="#B85D43" strokeWidth="2" strokeDasharray="3 2" />
              
              {/* Bust Line indicator */}
              <line x1="53" y1="110" x2="147" y2="110" stroke="#B85D43" strokeWidth="1" strokeDasharray="2 2" />
              <text x="100" y="106" textAnchor="middle" fontSize="9" fill="#8A4A38" fontWeight="bold">
                Bust {bustVal}
              </text>

              {/* Waist Line indicator */}
              <line x1="58" y1="160" x2="142" y2="160" stroke="#B85D43" strokeWidth="1" strokeDasharray="2 2" />
              <text x="100" y="156" textAnchor="middle" fontSize="9" fill="#8A4A38" fontWeight="bold">
                Waist {waistVal}
              </text>

              {/* Kurta Hemline */}
              <line x1="45" y1="270" x2="155" y2="270" stroke="#8A4A38" strokeWidth="3" />
              <text x="100" y="284" textAnchor="middle" fontSize="10" fill="#1C1917" fontWeight="bold">
                Kurta Length: {kurtaLen}
              </text>

              {/* Kneeline Indicator */}
              <line x1="30" y1="250" x2="170" y2="250" stroke="#A8A29E" strokeWidth="1" strokeDasharray="4 3" />
              <text x="172" y="253" fontSize="8" fill="#78716C">
                Knee level
              </text>

              {/* Bottom Pant / Churidar Legs */}
              <path
                d="M65 270 L72 380 M135 270 L128 380"
                stroke="#78716C"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Ankle Gathers (Churis) */}
              <path
                d="M68 360 Q72 365 76 360 M68 368 Q72 373 76 368 M68 376 Q72 381 76 376"
                stroke="#8A4A38"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M124 360 Q128 365 132 360 M124 368 Q128 373 132 368 M124 376 Q128 381 132 376"
                stroke="#8A4A38"
                strokeWidth="2"
                fill="none"
              />
              <text x="100" y="392" textAnchor="middle" fontSize="9" fill="#78716C">
                Ankle gathers: {churidarVal}
              </text>
            </svg>
          </div>

          <div className="mt-2 text-center text-[10px] text-stone-500">
            Proportional drape simulation for Size {selectedSize}
          </div>
        </div>

        {/* Right: Exact Specifications Grid (7 cols) */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="font-serif text-sm font-bold text-stone-900">
                Size {selectedSize} Tailored Specifications
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                1.5&quot; Inner Seam Margin
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Kurta Top Length</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {kurtaLen}
                </p>
                <span className="text-[10px] text-stone-500">Shoulder to hemline</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Garment Bust</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {bustVal}
                </p>
                <span className="text-[10px] text-stone-500">Includes 2&quot; ease</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Natural Waist</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {waistVal}
                </p>
                <span className="text-[10px] text-stone-500">Relaxed contour</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Hip / Seat</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {hipVal}
                </p>
                <span className="text-[10px] text-stone-500">Flared comfort</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Straight Pant Length</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {straightVal}
                </p>
                <span className="text-[10px] text-stone-500">Waist to ankle bone</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-[11px] text-stone-500">Churidar Pant (Gathered)</span>
                <p className="mt-0.5 font-sans text-base font-bold text-stone-900">
                  {churidarVal}
                </p>
                <span className="text-[10px] text-stone-500">With 6-8 ankle churis</span>
              </div>
            </div>
          </div>

          {/* Sizing Advisory Banner */}
          <div className="rounded-xl border border-[#8A4A38]/30 bg-[#FAF7F2] p-4 text-xs text-stone-700 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#8A4A38]">
              <Sparkles className="h-4 w-4" />
              <span>Thaagai Tailoring Margin Guarantee:</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Every ready-to-wear and bespoke piece includes <strong>1.5 inches of margin fabric</strong> inside both side seams. If your bust or waist measurements change, your local tailor can easily expand the garment up to one full size.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Complete Size-to-Length Master Matrix Table (if not compact) */}
      {!compact && (
        <div className="space-y-3">
          <h4 className="font-serif text-base font-bold text-stone-900">
            Complete Size-to-Length Comparison Matrix
          </h4>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#8A4A38]">
                <tr>
                  <th className="p-3 font-bold border-b border-stone-200">Size</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Kurta Length</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Bust</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Waist</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Hip</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Straight Pant</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Churidar</th>
                  <th className="p-3 font-bold border-b border-stone-200 text-center">Height</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {MASTER_SIZE_ROWS.map((r) => {
                  const isRowActive = r.size === selectedSize;
                  return (
                    <tr
                      key={r.size}
                      onClick={() => setSelectedSize(r.size)}
                      className={`cursor-pointer transition ${
                        isRowActive
                          ? "bg-stone-100 font-bold text-stone-900"
                          : "hover:bg-stone-50/80 text-stone-700"
                      }`}
                    >
                      <td className="p-3 font-sans font-bold text-[#8A4A38]">
                        {r.size}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.kurtaLenIn}"` : `${r.kurtaLenCm} cm`}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.bustIn}"` : `${r.bustCm} cm`}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.waistIn}"` : `${r.waistCm} cm`}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.hipIn}"` : `${r.hipCm} cm`}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.straightPantIn}"` : `${r.straightPantCm} cm`}
                      </td>
                      <td className="p-3 text-center">
                        {unit === "INCH" ? `${r.churidarLenIn}"` : `${r.churidarLenCm} cm`}
                      </td>
                      <td className="p-3 text-center font-sans text-stone-500">
                        {r.heightRec}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Master Tailor WhatsApp Concierge Callout */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-stone-700">
            Unsure between two sizes or need customized kurta length? Chat directly with our master tailor.
          </span>
        </div>
        <a
          href="https://api.whatsapp.com/send?phone=919876543210&text=Hello%20Thaagai!%20I%20have%20a%20question%20regarding%20churidar%20size%20and%20length%20measurements."
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 transition"
        >
          WhatsApp Tailor Guidance
        </a>
      </div>
    </div>
  );
}
