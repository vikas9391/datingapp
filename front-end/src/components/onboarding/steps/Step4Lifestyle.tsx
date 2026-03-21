// src/components/onboarding/steps/Step3Lifestyle.tsx
import StepLayout from "../StepLayout";
import { ChipSelector } from "../ChipSelector";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step3Props {
  data: Pick<OnboardingData, "drinking" | "smoking" | "workout" | "pets">;
  onChange: (data: Step3Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const lifestyleOptions = {
  drinking: [
    { label: "Never",    emoji: "🚫" },
    { label: "Socially", emoji: "🍷" },
    { label: "Regularly", emoji: "🍻" },
  ],
  smoking: [
    { label: "Never",     emoji: "🚭" },
    { label: "Sometimes", emoji: "💨" },
    { label: "Regularly", emoji: "🚬" },
  ],
  workout: [
    { label: "Never",     emoji: "🛋️" },
    { label: "Sometimes", emoji: "🚶" },
    { label: "Often",     emoji: "💪" },
    { label: "Daily",     emoji: "✨" },
  ],
  pets: [
    { label: "Own pets",  emoji: "🐾" },
    { label: "Love pets", emoji: "❤️" },
    { label: "Allergic",  emoji: "🤧" },
    { label: "None",      emoji: "🚫" },
  ],
} as const;

const SECTIONS: { key: keyof typeof lifestyleOptions; label: string }[] = [
  { key: "drinking", label: "Drinking" },
  { key: "smoking",  label: "Smoking" },
  { key: "workout",  label: "Working out" },
  { key: "pets",     label: "Pets" },
];

export const Step3Lifestyle = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step3Props) => {
  const { isDark } = useTheme();

  const labelColor = isDark ? "#f0e8de" : "#0f172a";

  return (
    <StepLayout
      currentStep={3}
      totalSteps={7}
      title="Your lifestyle"
      subtitle="No judgment here — just finding your vibe"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-10">
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="space-y-4">
            <label
              className="text-base font-semibold block transition-colors duration-300"
              style={{ color: labelColor }}
            >
              {label}
            </label>
            <div className="flex flex-wrap gap-3">
              {lifestyleOptions[key].map(({ label: optLabel, emoji }) => (
                <ChipSelector
                  key={optLabel}
                  label={optLabel}
                  icon={emoji}
                  selected={data[key] === optLabel}
                  onClick={() => onChange({ ...data, [key]: optLabel })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepLayout>
  );
};

export default Step3Lifestyle;