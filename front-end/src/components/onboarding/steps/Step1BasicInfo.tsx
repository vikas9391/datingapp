import { User, Calendar, Sparkles, Heart } from "lucide-react";
import StepLayout from "../StepLayout";
import { TextInput } from "../TextInput";
import { DatePicker } from "../DatePicker";
import { AnimatedGenderButton } from "../AnimatedGenderButton";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step1Props {
  data: Pick<OnboardingData, "firstName" | "dateOfBirth" | "gender" | "interestedIn">;
  onChange: (data: Partial<Step1Props["data"]>) => void;
  onNext: () => void;
  onSkip?: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const INTERESTED_IN_OPTIONS = ["Men", "Women", "Everyone"];

export default function Step1BasicInfo({
  data,
  onChange,
  onNext,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step1Props) {
  const { isDark } = useTheme();

  const canProceed =
    data.firstName.trim() !== "" &&
    !!data.dateOfBirth &&
    data.gender !== "" &&
    data.interestedIn.length > 0;

  const toggleInterestedIn = (option: string) => {
    const current = data.interestedIn || [];
    if (current.includes(option)) {
      onChange({ interestedIn: current.filter((o) => o !== option) });
    } else {
      onChange({ interestedIn: [...current, option] });
    }
  };

  /* ─── Theme tokens ─── */
  const labelColor       = isDark ? "#f0e8de" : "#0f172a";
  const accentIcon       = isDark ? "#f97316" : "#1d4ed8";
  const hintBg           = isDark ? "rgba(29,78,216,0.06)"  : "rgba(219,234,254,0.5)";
  const hintBorder       = isDark ? "rgba(29,78,216,0.15)"  : "rgba(191,219,254,0.5)";
  const hintIconColor    = isDark ? "#60a5fa" : "#3b82f6";
  const hintText         = isDark ? "#8a6540" : "#64748b";
  const multiHintBg      = isDark ? "rgba(251,191,36,0.06)" : "rgba(254,243,199,0.6)";
  const multiHintBorder  = isDark ? "rgba(251,191,36,0.15)" : "rgba(253,230,138,0.6)";
  const multiHintIcon    = "#fbbf24";

  /* Interested-in button tokens */
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

  const radioIdleStyle: React.CSSProperties = isDark
    ? { border: "2px solid rgba(249,115,22,0.2)", background: "transparent" }
    : { border: "2px solid #e2e8f0", background: "transparent" };

  const selectedGrad = isDark
    ? "linear-gradient(to right, rgba(249,115,22,0.06), transparent)"
    : "linear-gradient(to right, rgba(29,78,216,0.05), transparent)";

  return (
    <StepLayout
      currentStep={1}
      totalSteps={11}
      title="Let's start with the basics"
      subtitle="We need a few details to set up your profile"
      onNext={onNext}
      onSkip={onSkip}
      canProceed={canProceed}
      showBack={false}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* 1. First Name */}
        <div className="space-y-2">
          <TextInput
            value={data.firstName}
            onChange={(firstName) => onChange({ firstName })}
            placeholder="Enter your first name"
            label="First Name"
            icon={<User className="w-5 h-5" style={{ color: accentIcon }} />}
          />
        </div>

        {/* 2. Date of Birth */}
        <div className="space-y-3">
          <label
            className="flex items-center gap-2 text-sm font-bold transition-colors duration-300"
            style={{ color: labelColor }}
          >
            <Calendar className="w-4 h-4" style={{ color: accentIcon }} />
            Date of birth
          </label>

          <div className="relative">
            <DatePicker
              value={data.dateOfBirth ?? undefined}
              onChange={(date) => onChange({ dateOfBirth: date ?? null })}
            />
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-2xl transition-all duration-300"
            style={{ background: hintBg, border: `1px solid ${hintBorder}` }}
          >
            <Sparkles
              className="w-4 h-4 flex-shrink-0 animate-pulse"
              style={{ color: hintIconColor }}
            />
            <p className="text-xs font-medium leading-tight" style={{ color: hintText }}>
              Don't worry, we only show your age, not your exact birthday.
            </p>
          </div>
        </div>

        {/* 3. Gender Selection */}
        <div className="space-y-4">
          <label
            className="block text-sm font-bold transition-colors duration-300"
            style={{ color: labelColor }}
          >
            I identify as
          </label>

          <div className="grid grid-cols-2 gap-4">
            {["Man", "Woman"].map((option) => (
              <AnimatedGenderButton
                key={option}
                label={option}
                isSelected={data.gender === option}
                onClick={() => onChange({ gender: option })}
              />
            ))}
          </div>
        </div>

        {/* 4. Interested In */}
        <div className="space-y-4">
          <label
            className="block text-sm font-bold transition-colors duration-300"
            style={{ color: labelColor }}
          >
            I'm interested in
          </label>

          <div className="space-y-3">
            {INTERESTED_IN_OPTIONS.map((option) => {
              const isSelected = (data.interestedIn || []).includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleInterestedIn(option)}
                  className="w-full p-4 rounded-2xl text-left font-bold text-base transition-all duration-200 flex items-center justify-between group relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
                  style={isSelected ? btnSelectedStyle : btnIdleStyle}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = btnHoverBorder;
                      el.style.background  = btnHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = btnIdleStyle.border?.toString().split(" ")[2] ?? "";
                      el.style.background  = btnIdleStyle.background as string;
                    }
                  }}
                >
                  <span className="relative z-10">{option}</span>

                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 relative z-10"
                    style={isSelected ? radioSelectedStyle : radioIdleStyle}
                  >
                    {isSelected && <Heart className="w-3 h-3 fill-current" />}
                  </div>

                  {isSelected && (
                    <div
                      className="absolute inset-0 z-0"
                      style={{ background: selectedGrad }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div
            className="flex items-center gap-2 p-3 rounded-2xl transition-all duration-300"
            style={{ background: multiHintBg, border: `1px solid ${multiHintBorder}` }}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: multiHintIcon }} />
            <p className="text-xs font-medium leading-tight" style={{ color: hintText }}>
              You can select multiple options
            </p>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}