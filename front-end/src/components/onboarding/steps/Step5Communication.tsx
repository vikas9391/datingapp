// src/components/onboarding/steps/Step4Communication.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step4Props {
  data: Pick<OnboardingData, "communicationStyle" | "responsePace">;
  onChange: (data: Step4Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const communicationOptions = [
  { label: "Texting a lot",       emoji: "💬" },
  { label: "Occasional texter",   emoji: "📱" },
  { label: "Phone calls",         emoji: "📞" },
  { label: "Video calls",         emoji: "🎥" },
  { label: "In-person preferred", emoji: "☕" },
];

const paceOptions = [
  { label: "Fast responder",  emoji: "⚡", description: "I usually reply right away" },
  { label: "Chill",           emoji: "😌", description: "I take my time, no pressure" },
  { label: "Slow responder",  emoji: "🐢", description: "I'm bad at checking my phone" },
];

export const Step4Communication = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step4Props) => {
  const { isDark } = useTheme();

  const toggleStyle = (style: string) => {
    const current = data.communicationStyle;
    onChange({
      ...data,
      communicationStyle: current.includes(style)
        ? current.filter((s) => s !== style)
        : [...current, style],
    });
  };

  /* ─── Theme tokens ─── */
  const labelColor = isDark ? "#f0e8de" : "#0f172a";
  const subColor   = isDark ? "#8a6540" : "#64748b";

  const cardSelected: React.CSSProperties = isDark
    ? {
        border: "2px solid #f97316",
        background: "rgba(249,115,22,0.08)",
      }
    : {
        border: "2px solid #1d4ed8",
        background: "rgba(29,78,216,0.05)",
      };

  const cardIdle: React.CSSProperties = isDark
    ? {
        border: "2px solid rgba(249,115,22,0.12)",
        background: "#1c1c1c",
      }
    : {
        border: "2px solid #e2e8f0",
        background: "#ffffff",
      };

  const cardHoverBorder = isDark ? "rgba(249,115,22,0.35)" : "#93c5fd";
  const cardHoverBg     = isDark ? "rgba(249,115,22,0.05)" : "#f8faff";

  const emojiWrapSelected: React.CSSProperties = isDark
    ? { background: "#242424", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
    : { background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };

  const emojiWrapIdle: React.CSSProperties = isDark
    ? { background: "#2a2a2a" }
    : { background: "#f1f5f9" };

  const emojiWrapIdleHover: React.CSSProperties = isDark
    ? { background: "#242424", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }
    : { background: "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" };

  const labelSelected = isDark ? "#fb923c" : "#1e3a8a";
  const labelIdle     = isDark ? "#c4a882" : "#0f172a";
  const descSelected  = isDark ? "rgba(251,146,60,0.8)" : "rgba(30,58,138,0.7)";
  const descIdle      = isDark ? "#8a6540" : "#64748b";

  const radioBorderSelected = isDark ? "#f97316" : "#1d4ed8";
  const radioDotSelected    = isDark ? "#f97316" : "#1d4ed8";
  const radioBorderIdle     = isDark ? "rgba(249,115,22,0.25)" : "#e2e8f0";
  const radioBorderHover    = isDark ? "rgba(249,115,22,0.55)" : "#93c5fd";

  return (
    <StepLayout
      currentStep={4}
      totalSteps={7}
      title="How do you vibe best?"
      subtitle="Let's find your communication match"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-10">

        {/* Communication Style */}
        <div className="space-y-4">
          <div>
            <label
              className="text-base font-semibold block transition-colors duration-300"
              style={{ color: labelColor }}
            >
              Preferred ways to connect
            </label>
            <p className="text-sm mt-1 transition-colors duration-300" style={{ color: subColor }}>
              Select all that work for you
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {communicationOptions.map(({ label, emoji }) => (
              <ChipSelector
                key={label}
                label={label}
                icon={emoji}
                selected={data.communicationStyle.includes(label)}
                onClick={() => toggleStyle(label)}
              />
            ))}
          </div>
        </div>

        {/* Response Pace */}
        <div className="space-y-4">
          <label
            className="text-base font-semibold block transition-colors duration-300"
            style={{ color: labelColor }}
          >
            Your response pace
          </label>

          <div className="space-y-3">
            {paceOptions.map(({ label, emoji, description }) => {
              const isSelected = data.responsePace === label;

              return (
                <button
                  key={label}
                  onClick={() => onChange({ ...data, responsePace: label })}
                  className="w-full flex items-center gap-4 p-4 rounded-xl text-left outline-none transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
                  style={isSelected ? cardSelected : cardIdle}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = cardHoverBorder;
                      el.style.background  = cardHoverBg;
                      // Also update emoji wrap inside
                      const emojiEl = el.querySelector("[data-emoji]") as HTMLElement;
                      if (emojiEl) {
                        emojiEl.style.background  = emojiWrapIdleHover.background as string;
                        emojiEl.style.boxShadow   = emojiWrapIdleHover.boxShadow as string ?? "";
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = cardIdle.border?.toString().split(" ")[2] ?? "";
                      el.style.background  = cardIdle.background as string;
                      const emojiEl = el.querySelector("[data-emoji]") as HTMLElement;
                      if (emojiEl) {
                        emojiEl.style.background = emojiWrapIdle.background as string;
                        emojiEl.style.boxShadow  = "";
                      }
                    }
                  }}
                >
                  {/* Emoji circle */}
                  <div
                    data-emoji
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 transition-all duration-200"
                    style={isSelected ? emojiWrapSelected : emojiWrapIdle}
                  >
                    {emoji}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <p
                      className="font-semibold transition-colors duration-200"
                      style={{ color: isSelected ? labelSelected : labelIdle }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-sm transition-colors duration-200"
                      style={{ color: isSelected ? descSelected : descIdle }}
                    >
                      {description}
                    </p>
                  </div>

                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0"
                    style={{
                      borderColor: isSelected ? radioBorderSelected : radioBorderIdle,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.borderColor = radioBorderHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (e.currentTarget as HTMLElement).style.borderColor = radioBorderIdle;
                    }}
                  >
                    {isSelected && (
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: radioDotSelected }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepLayout>
  );
};

export default Step4Communication;