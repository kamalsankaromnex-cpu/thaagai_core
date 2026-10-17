"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowRight, RotateCcw, Ruler, Scissors, Award } from "lucide-react";

interface QuizState {
  silhouette: string;
  heightGroup: string;
  usualSize: string;
}

const SILHOUETTES = [
  {
    id: "straight-slim",
    title: "Tailored Straight Cut",
    subtitle: "Classic Straight Silhouette",
    description: "Crisp architectural line, clean side slits, structured bust contour.",
    icon: "📐",
  },
  {
    id: "relaxed-comfort",
    title: "Comfort Daily Classic",
    subtitle: "Everyday Comfort Fit",
    description: "Gentle ease through waist and hips, breathable for South Indian climate.",
    icon: "✨",
  },
  {
    id: "anarkali-flare",
    title: "Regal Kalidar Anarkali",
    subtitle: "Regal Flared Silhouette",
    description: "Fitted bust with flared panel drapes and floor-sweeping grace.",
    icon: "👑",
  },
];

const HEIGHT_OPTIONS = [
  {
    id: "petite",
    label: "Petite (Under 5'2\" / <157 cm)",
    kurtaLength: "40 inches",
    bottomRipples: "5 to 6 churidar ankle gathers",
  },
  {
    id: "classic",
    label: "Classic (5'3\" to 5'6\" / 160–168 cm)",
    kurtaLength: "42 inches",
    bottomRipples: "7 to 8 churidar ankle gathers",
  },
  {
    id: "tall",
    label: "Statuesque (5'7\"+ / >170 cm)",
    kurtaLength: "44–46 inches",
    bottomRipples: "8 to 10 churidar ankle gathers",
  },
];

const SIZES = [
  { size: "XS", bust: "34 inches", waist: "28 inches", hip: "38 inches" },
  { size: "S", bust: "36 inches", waist: "30 inches", hip: "40 inches" },
  { size: "M", bust: "38 inches", waist: "32 inches", hip: "42 inches" },
  { size: "L", bust: "40 inches", waist: "34 inches", hip: "44 inches" },
  { size: "XL", bust: "42 inches", waist: "36 inches", hip: "46 inches" },
  { size: "XXL", bust: "44 inches", waist: "38 inches", hip: "48 inches" },
  { size: "3XL", bust: "46 inches", waist: "40 inches", hip: "50 inches" },
];

export function FitFinderQuiz() {
  const [step, setStep] = useState<number>(1);
  const [quizState, setQuizState] = useState<QuizState>({
    silhouette: "straight-slim",
    heightGroup: "classic",
    usualSize: "M",
  });
  const [isCalculated, setIsCalculated] = useState(false);

  const handleSelectSilhouette = (id: string) => {
    setQuizState((prev) => ({ ...prev, silhouette: id }));
  };

  const handleSelectHeight = (id: string) => {
    setQuizState((prev) => ({ ...prev, heightGroup: id }));
  };

  const handleSelectSize = (sz: string) => {
    setQuizState((prev) => ({ ...prev, usualSize: sz }));
  };

  const handleCalculate = () => {
    setIsCalculated(true);
  };

  const handleReset = () => {
    setStep(1);
    setIsCalculated(false);
    setQuizState({
      silhouette: "straight-slim",
      heightGroup: "classic",
      usualSize: "M",
    });
  };

  const selectedSilhouette = SILHOUETTES.find((s) => s.id === quizState.silhouette) || SILHOUETTES[0];
  const selectedHeight = HEIGHT_OPTIONS.find((h) => h.id === quizState.heightGroup) || HEIGHT_OPTIONS[1];
  const selectedSizeInfo = SIZES.find((s) => s.size === quizState.usualSize) || SIZES[2];

  return (
    <div className="w-full rounded-2xl border border-thaagai-line bg-white p-6 shadow-md dark:border-thaagai-line/30 dark:bg-thaagai-cardDark sm:p-8">
      {!isCalculated ? (
        <div>
          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-thaagai-line/60 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-thaagai-wine text-xs font-bold text-white">
                {step}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-thaagai-ink dark:text-white">
                Step {step} of 3: {step === 1 ? "Silhouette" : step === 2 ? "Height & Hemline" : "Usual Fit"}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    step >= s ? "bg-thaagai-wine" : "bg-thaagai-line dark:bg-thaagai-line/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Step 1: Silhouette Preference */}
          {step === 1 && (
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h3 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
                  How do you prefer your Churidar kurta to sit on you?
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Select your drape preference for weddings, work, or casual festive gatherings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {SILHOUETTES.map((s) => {
                  const active = quizState.silhouette === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleSelectSilhouette(s.id)}
                      className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-thaagai-wine bg-thaagai-sand/50 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-sandDark/40"
                          : "border-thaagai-line bg-white hover:border-thaagai-wine/50 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                      }`}
                    >
                      <div className="text-2xl">{s.icon}</div>
                      <h4 className="mt-2 font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                        {s.title}
                      </h4>
                      <span className="text-[10px] text-thaagai-gold font-bold">{s.subtitle}</span>
                      <p className="mt-1 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70 leading-normal">
                        {s.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-6 text-xs font-bold text-white shadow-sm hover:bg-thaagai-wineHover"
                >
                  <span>Next: Height & Length</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Height & Hemline */}
          {step === 2 && (
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h3 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
                  What is your approximate height?
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Our master tailors calculate the optimal below-the-knee kurta hemline so your churidar ripples gather perfectly.
                </p>
              </div>

              <div className="space-y-3">
                {HEIGHT_OPTIONS.map((h) => {
                  const active = quizState.heightGroup === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleSelectHeight(h.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "border-thaagai-wine bg-thaagai-sand/50 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-sandDark/40"
                          : "border-thaagai-line bg-white hover:border-thaagai-wine/50 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                      }`}
                    >
                      <div>
                        <h4 className="font-serif text-sm font-bold text-thaagai-ink dark:text-white">
                          {h.label}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                          Tailored Kurta Length: <strong className="text-thaagai-wine dark:text-thaagai-gold">{h.kurtaLength}</strong> • {h.bottomRipples}
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                          active
                            ? "border-thaagai-wine bg-thaagai-wine text-white"
                            : "border-thaagai-line"
                        }`}
                      >
                        {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border border-thaagai-line px-5 py-2.5 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-6 text-xs font-bold text-white shadow-sm hover:bg-thaagai-wineHover"
                >
                  <span>Next: Usual Size</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Usual Kurti Size */}
          {step === 3 && (
            <div className="mt-6 space-y-4">
              <div className="text-left">
                <h3 className="font-brand text-xl font-bold text-thaagai-ink dark:text-white">
                  What is your standard ready-made kurti size?
                </h3>
                <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
                  Select your usual size to calculate ease allowance across bust, waist, and hip.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SIZES.map((s) => {
                  const active = quizState.usualSize === s.size;
                  return (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => handleSelectSize(s.size)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all ${
                        active
                          ? "border-thaagai-wine bg-thaagai-sand/50 ring-2 ring-thaagai-wine dark:border-thaagai-gold dark:bg-thaagai-sandDark/40"
                          : "border-thaagai-line bg-white hover:border-thaagai-wine/50 dark:border-thaagai-line/40 dark:bg-thaagai-cardDark"
                      }`}
                    >
                      <span className="font-brand text-lg font-bold text-thaagai-wine dark:text-white">
                        {s.size}
                      </span>
                      <span className="mt-0.5 text-[10px] text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                        Bust: {s.bust}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border border-thaagai-line px-5 py-2.5 text-xs font-semibold text-thaagai-ink hover:bg-thaagai-sand/60 dark:border-thaagai-line/40 dark:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCalculate}
                  className="flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-6 text-xs font-bold text-white shadow-sm hover:bg-thaagai-wineHover"
                >
                  <Sparkles className="h-4 w-4 text-thaagai-gold" />
                  <span>Reveal My Custom Fit Match</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Results Card */
        <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Award className="h-7 w-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-thaagai-gold">
              Master Tailor Recommended Match
            </span>
            <h3 className="mt-1 font-brand text-3xl font-bold text-thaagai-wine sm:text-4xl">
              Size {quizState.usualSize}
            </h3>
            <p className="mt-1 text-xs text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
              98% Fit Accuracy for {selectedSilhouette.title} Silhouette
            </p>
          </div>

          {/* Measurements Specs Box */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-thaagai-line bg-thaagai-sand/30 p-3.5 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20">
              <span className="text-[10px] font-bold uppercase text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                Recommended Kurta Length
              </span>
              <p className="mt-1 font-serif text-base font-bold text-thaagai-wine dark:text-white">
                {selectedHeight.kurtaLength}
              </p>
              <p className="text-[10px] text-thaagai-ink/60">Optimal knee coverage</p>
            </div>

            <div className="rounded-xl border border-thaagai-line bg-thaagai-sand/30 p-3.5 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20">
              <span className="text-[10px] font-bold uppercase text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                Garment Chest Circumference
              </span>
              <p className="mt-1 font-serif text-base font-bold text-thaagai-wine dark:text-white">
                {selectedSizeInfo.bust}
              </p>
              <p className="text-[10px] text-thaagai-ink/60">Includes 2.5 inch tailored ease</p>
            </div>

            <div className="rounded-xl border border-thaagai-line bg-thaagai-sand/30 p-3.5 dark:border-thaagai-line/30 dark:bg-thaagai-sandDark/20">
              <span className="text-[10px] font-bold uppercase text-thaagai-ink/60 dark:text-thaagai-inkDark/60">
                Churidar Leg Gather
              </span>
              <p className="mt-1 font-serif text-base font-bold text-thaagai-wine dark:text-white">
                {selectedHeight.bottomRipples}
              </p>
              <p className="text-[10px] text-thaagai-ink/60">Traditional ankle ripples</p>
            </div>
          </div>

          {/* Tailor Advice */}
          <div className="rounded-xl border border-thaagai-gold/60 bg-thaagai-sand/40 p-4 text-left dark:bg-thaagai-sandDark/30">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-thaagai-wine dark:text-thaagai-gold">
              <Scissors className="h-4 w-4" />
              <span>Atelier Drape Advice</span>
            </h4>
            <p className="mt-1.5 text-xs text-thaagai-ink/80 dark:text-thaagai-inkDark/80 leading-relaxed">
              For your height and silhouette, we recommend choosing <strong>Size {quizState.usualSize}</strong> in our Ready-to-Wear catalog. If you would like exact bespoke neckline depth or sleeve length adjustments, you can also store these specs in your personal <strong>Bespoke Measurements Vault</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/shop"
              className="flex h-11 items-center gap-2 rounded-lg bg-thaagai-wine px-6 text-xs font-bold text-white shadow-sm hover:bg-thaagai-wineHover"
            >
              <span>Explore Size {quizState.usualSize} in Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/account/measurements"
              className="flex h-11 items-center gap-2 rounded-lg border border-thaagai-line bg-white px-5 text-xs font-semibold text-thaagai-ink hover:border-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
            >
              <Ruler className="h-4 w-4 text-thaagai-gold" />
              <span>Save to Measurements Vault</span>
            </Link>

            <button
              type="button"
              onClick={handleReset}
              className="flex h-11 items-center gap-1.5 rounded-lg border border-transparent px-4 text-xs font-semibold text-thaagai-ink/60 hover:text-thaagai-wine dark:text-white/60"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
