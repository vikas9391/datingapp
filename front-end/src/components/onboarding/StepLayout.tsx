// src/components/onboarding/StepLayout.tsx
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import ProgressBar from "./ProgressBar";
import { OnboardingData } from "./OnboardingFlow";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onSkip?: () => void;
  onNext: () => void;
  nextLabel?: string;
  canProceed?: boolean;
  showBack?: boolean;
  isSaving?: boolean;
  data?: OnboardingData;
  onStepClick?: (step: number) => void;
}

export default function StepLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onBack,
  onSkip,
  onNext,
  nextLabel = "Next",
  canProceed = true,
  showBack = true,
  isSaving = false,
  data,
  onStepClick,
}: StepLayoutProps) {
  const { isDark } = useTheme();

  /* ─── Theme tokens ─── */
  const pageBg = isDark ? "#0d0d0d" : "#f1f5ff";

  const cardStyle: React.CSSProperties = isDark
    ? {
        background: "linear-gradient(145deg, #1a1a1a 0%, #141008 100%)",
        border: "1px solid rgba(249,115,22,0.2)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
      }
    : {
        background: "#ffffff",
        border: "1px solid rgba(29,78,216,0.1)",
        boxShadow: "0 4px 24px rgba(29,78,216,0.08)",
      };

  const headerBorder = isDark
    ? "1px solid rgba(249,115,22,0.12)"
    : "1px solid #e2e8f0";

  const backBtnColor  = isDark ? "#8a6540" : "#64748b";
  const backBtnHover  = isDark ? "#f0e8de" : "#0f172a";
  const skipColor     = isDark ? "#8a6540" : "#64748b";
  const skipHover     = isDark ? "#f0e8de" : "#0f172a";

  const titleColor    = isDark ? "#f0e8de" : "#0f172a";
  const subtitleColor = isDark ? "#8a6540" : "#64748b";

  const footerBorder  = isDark
    ? "1px solid rgba(249,115,22,0.12)"
    : "1px solid #e2e8f0";

  const footerBg = isDark ? "transparent" : "#ffffff";

  const activeBtn = isDark
    ? "linear-gradient(135deg, #c2410c 0%, #ea580c 40%, #f97316 100%)"
    : "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)";

  const activeBtnShadow = isDark
    ? "0 4px 20px rgba(194,65,12,0.45)"
    : "0 4px 20px rgba(29,78,216,0.3)";

  const disabledStyle: React.CSSProperties = isDark
    ? { background: "#242424", color: "#4a3520", cursor: "not-allowed" }
    : { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center pt-20 transition-colors duration-300"
      style={{ background: pageBg }}
    >
      <div
        className="w-full max-w-4xl rounded-2xl flex flex-col max-h-[90vh] transition-all duration-300"
        style={cardStyle}
      >
        {/* HEADER */}
        <header
          className="rounded-t-2xl transition-all duration-300"
          style={{ borderBottom: headerBorder }}
        >
          <div className="px-10 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              {showBack ? (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 transition-colors duration-150"
                  style={{ color: backBtnColor }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = backBtnHover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = backBtnColor)}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              ) : (
                <div />
              )}

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm font-medium transition-colors duration-150"
                  style={{ color: skipColor }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = skipHover)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = skipColor)}
                >
                  Skip
                </button>
              )}
            </div>

            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              isSaving={isSaving}
              data={data}
              onStepClick={onStepClick}
            />

            <div className="mt-6">
              <h1
                className="text-2xl font-semibold transition-colors duration-300"
                style={{ color: titleColor }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className="text-sm mt-1 transition-colors duration-300"
                  style={{ color: subtitleColor }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-10 pb-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>

        {/* FOOTER */}
        <footer
          className="px-10 py-4 rounded-b-2xl transition-all duration-300"
          style={{ borderTop: footerBorder, background: footerBg }}
        >
          <motion.button
            whileHover={{ scale: canProceed && !isSaving ? 1.02 : 1 }}
            whileTap={{ scale: canProceed && !isSaving ? 0.98 : 1 }}
            onClick={onNext}
            disabled={!canProceed || isSaving}
            className="mx-auto block w-[230px] py-3 text-base font-semibold rounded-full transition-all text-white"
            style={
              canProceed && !isSaving
                ? { background: activeBtn, boxShadow: activeBtnShadow }
                : disabledStyle
            }
          >
            {isSaving ? "Saving..." : nextLabel}
          </motion.button>
        </footer>
      </div>
    </div>
  );
}