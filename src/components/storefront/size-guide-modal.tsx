"use client";

import { useState } from "react";
import { X, Ruler, Scissors, Info } from "lucide-react";
import { SizeChartData, DEFAULT_CHURIDAR_SIZE_CHART } from "@/server/services/size-chart-service";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeChart?: SizeChartData;
  isCustomMade?: boolean;
}

export function SizeGuideModal({
  isOpen,
  onClose,
  sizeChart = DEFAULT_CHURIDAR_SIZE_CHART,
  isCustomMade = false,
}: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"INCH" | "CM">("INCH");
  const [activeTab, setActiveTab] = useState<"CHART" | "HOW_TO_MEASURE" | "CUSTOM_FIT">(
    isCustomMade ? "CUSTOM_FIT" : "CHART"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-thaagai-line bg-white p-6 shadow-2xl dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-thaagai-line/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-thaagai-gold" />
              <h2 className="font-serif text-2xl font-bold text-thaagai-wine dark:text-white">
                Churidar Sizing & Fit Guide
              </h2>
            </div>
            <p className="text-xs text-thaagai-gold font-medium">
              Bespoke Fit & Size Specifications
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="rounded-full p-2 text-thaagai-ink/60 transition-colors hover:bg-thaagai-sand/60 hover:text-thaagai-ink dark:text-thaagai-inkDark"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation & Unit Selector */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-thaagai-line/60 pb-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("CHART")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "CHART"
                  ? "bg-thaagai-wine text-white shadow-xs"
                  : "bg-thaagai-sand/40 text-thaagai-ink hover:bg-thaagai-sand dark:text-thaagai-inkDark"
              }`}
            >
              Measurement Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("HOW_TO_MEASURE")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "HOW_TO_MEASURE"
                  ? "bg-thaagai-wine text-white shadow-xs"
                  : "bg-thaagai-sand/40 text-thaagai-ink hover:bg-thaagai-sand dark:text-thaagai-inkDark"
              }`}
            >
              How to Measure
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("CUSTOM_FIT")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === "CUSTOM_FIT"
                  ? "bg-thaagai-wine text-white shadow-xs"
                  : "bg-thaagai-sand/40 text-thaagai-ink hover:bg-thaagai-sand dark:text-thaagai-inkDark"
              }`}
            >
              Custom Tailoring & Margins
            </button>
          </div>

          {/* Unit Toggle */}
          {activeTab === "CHART" && (
            <div className="flex items-center self-end sm:self-auto rounded-lg border border-thaagai-line bg-thaagai-sand/20 p-0.5 dark:border-thaagai-line/40">
              <button
                type="button"
                onClick={() => setUnit("INCH")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  unit === "INCH"
                    ? "bg-white text-thaagai-wine shadow-xs dark:bg-thaagai-cardDark dark:text-white"
                    : "text-thaagai-ink/70 hover:text-thaagai-ink dark:text-thaagai-inkDark"
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setUnit("CM")}
                className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                  unit === "CM"
                    ? "bg-white text-thaagai-wine shadow-xs dark:bg-thaagai-cardDark dark:text-white"
                    : "text-thaagai-ink/70 hover:text-thaagai-ink dark:text-thaagai-inkDark"
                }`}
              >
                Centimetres (cm)
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Measurement Table */}
        {activeTab === "CHART" && (
          <div className="mt-4 space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-thaagai-line bg-white shadow-xs dark:border-thaagai-line/40 dark:bg-thaagai-cardDark">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-thaagai-wine dark:bg-thaagai-sandDark/30">
                  <tr>
                    <th className="border-b border-thaagai-line p-3 font-serif font-bold min-w-[160px]">
                      Dimension
                    </th>
                    {sizeChart.sizes.map((sz) => (
                      <th
                        key={sz}
                        className="border-b border-thaagai-line p-3 text-center font-bold"
                      >
                        {sz}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-thaagai-line/50">
                  {sizeChart.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white dark:bg-thaagai-cardDark" : "bg-thaagai-sand/10 dark:bg-thaagai-sandDark/10"}
                    >
                      <td className="p-3">
                        <span className="block font-semibold text-thaagai-ink dark:text-white">
                          {row.label}
                        </span>
                      </td>
                      {sizeChart.sizes.map((sz) => {
                        const val =
                          unit === "INCH"
                            ? row.valuesInches?.[sz] || "-"
                            : row.valuesCm?.[sz] || "-";
                        return (
                          <td
                            key={sz}
                            className="p-3 text-center font-mono font-medium text-thaagai-ink dark:text-thaagai-inkDark"
                          >
                            {val}
                            <span className="text-[10px] text-thaagai-ink/40 ml-0.5">
                              {unit === "INCH" ? '"' : " cm"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Note banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-thaagai-gold/40 bg-[#FAF7F2] p-4 text-xs text-thaagai-ink/80 dark:bg-thaagai-sandDark/20 dark:text-thaagai-inkDark/80">
              <Info className="h-4 w-4 text-thaagai-gold shrink-0 mt-0.5" />
              <div>
                <strong className="text-thaagai-wine font-semibold">Fitting Note: </strong>
                All dimensions represent finished garment measurements. For a comfortable, graceful drape, choose a size that is 2 to 3 inches roomier than your exact body bust measurement.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How to Measure */}
        {activeTab === "HOW_TO_MEASURE" && (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sizeChart.howToMeasure.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-thaagai-line bg-[#FAF7F2] p-4 dark:border-thaagai-line/40 dark:bg-thaagai-sandDark/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-thaagai-wine text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-thaagai-wine dark:text-white">
                      {item.part}
                    </h4>
                    <span className="font-tamil text-[11px] text-thaagai-gold">
                      ({item.tamilPart})
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                    {item.instruction}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-thaagai-line bg-white p-4 text-xs text-thaagai-ink/80 dark:bg-thaagai-cardDark dark:text-thaagai-inkDark/80">
              <strong className="text-thaagai-wine">Boutique Tailor Tip:</strong> Always keep the measuring tape level and snug, but not constrictive. Wear standard undergarments when measuring for the most accurate fit.
            </div>
          </div>
        )}

        {/* Tab 3: Custom Fit & Margins */}
        {activeTab === "CUSTOM_FIT" && (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border-2 border-thaagai-gold/60 bg-[#5E1028] p-6 text-white">
              <div className="flex items-center gap-2">
                <Scissors className="h-5 w-5 text-thaagai-gold" />
                <h3 className="font-serif text-lg font-bold">
                  Bespoke Atelier & Alteration Margins
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                {sizeChart.customFitGuide}
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-thaagai-gold font-serif">1.5-inch Inner Margin</strong>
                  <span className="text-[11px] text-white/80">Generous seam allowances for easy local size loosening.</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-thaagai-gold font-serif">Deep Gathers</strong>
                  <span className="text-[11px] text-white/80">6 to 8 inches extra fabric for classic ankle gathers.</span>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <strong className="block text-thaagai-gold font-serif">Tailor WhatsApp Review</strong>
                  <span className="text-[11px] text-white/80">Consult our master tailor directly before fabric is cut.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-thaagai-line/60 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-thaagai-wine px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-thaagai-wineHover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
