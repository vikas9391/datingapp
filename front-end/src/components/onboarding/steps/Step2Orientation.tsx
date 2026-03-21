import { Heart } from "lucide-react";
import StepLayout from "../StepLayout";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step2Props {
  data: Pick<OnboardingData, "relationshipType">;
  onChange: (data: Partial<Step2Props["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const RELATIONSHIP_STATUSES = [
  "Single",
  "Committed",
  "Broken up recently",
  "Divorced",
  "Widowed",
];

export default function Step2Orientation({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step2Props) {
  const { isDark } = useTheme();
  const canProceed = !!data.relationshipType;

  /* ─── Theme tokens ─── */
  const btnSelectedStyle: React.CSSProperties = isDark
    ? {
        border: "2px solid #f97316",
        background: "rgba(249,115,22,0.08)",
        color: "#fb923c",
      }
    : {
        border: "2px solid #1d4ed8",
        background: "rgba(29,78,216,0.05)",
        color: "#1e3a8a",
      };

  const btnIdleStyle: React.CSSProperties = isDark
    ? {
        border: "2px solid rgba(249,115,22,0.12)",
        background: "#1c1c1c",
        color: "#8a6540",
      }
    : {
        border: "2px solid #e2e8f0",
        background: "#ffffff",
        color: "#64748b",
      };

  const btnHoverBorder = isDark ? "rgba(249,115,22,0.4)" : "rgba(29,78,216,0.3)";
  const btnHoverBg     = isDark ? "rgba(249,115,22,0.05)" : "#f8faff";

  const radioSelectedStyle: React.CSSProperties = isDark
    ? { border: "2px solid #f97316", background: "#f97316", color: "#ffffff" }
    : { border: "2px solid #1d4ed8", background: "#1d4ed8", color: "#ffffff" };

  const radioIdleHoverBorder = isDark ? "rgba(249,115,22,0.4)" : "rgba(29,78,216,0.3)";

  const radioIdleStyle: React.CSSProperties = isDark
    ? { border: "2px solid rgba(249,115,22,0.2)", background: "transparent" }
    : { border: "2px solid #e2e8f0", background: "transparent" };

  const selectedGrad = isDark
    ? "linear-gradient(to right, rgba(249,115,22,0.06), transparent)"
    : "linear-gradient(to right, rgba(29,78,216,0.05), transparent)";

  return (
    <StepLayout
      currentStep={2}
      totalSteps={11}
      title="Relationship Status"
      subtitle="Be honest, it helps us find what you really need."
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      canProceed={canProceed}
      showBack={true}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {RELATIONSHIP_STATUSES.map((status) => {
          const isActive = data.relationshipType === status;

          return (
            <button
              key={status}
              onClick={() => onChange({ relationshipType: status })}
              className="w-full p-5 rounded-2xl text-left font-bold text-base transition-all duration-200 flex items-center justify-between group relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
              style={isActive ? btnSelectedStyle : btnIdleStyle}
              onMouseEnter={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = btnHoverBorder;
                  el.style.background  = btnHoverBg;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = btnIdleStyle.border?.toString().split(" ")[2] ?? "";
                  el.style.background  = btnIdleStyle.background as string;
                }
              }}
            >
              <span className="relative z-10">{status}</span>

              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10"
                style={isActive ? radioSelectedStyle : radioIdleStyle}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.borderColor = radioIdleHoverBorder;
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLElement).style.borderColor =
                      radioIdleStyle.border?.toString().split(" ")[2] ?? "";
                }}
              >
                {isActive && <Heart className="w-3 h-3 fill-current" />}
              </div>

              {isActive && (
                <div
                  className="absolute inset-0 z-0"
                  style={{ background: selectedGrad }}
                />
              )}
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
}