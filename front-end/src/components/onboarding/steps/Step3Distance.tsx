// src/components/onboarding/steps/Step2Distance.tsx
import StepLayout from "../StepLayout";
import { CustomSlider } from "../CustomSlider";
import { ToggleSwitch } from "../ToggleSwitch";
import { MapPin } from "lucide-react";
import { OnboardingData } from "../OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface Step2Props {
  data: Pick<OnboardingData, "distance" | "strictDistance">;
  onChange: (data: Step2Props["data"]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isSaving?: boolean;
  onboardingData?: OnboardingData;
  onStepClick?: (step: number) => void;
}

export const Step2Distance = ({
  data,
  onChange,
  onNext,
  onBack,
  onSkip,
  isSaving,
  onboardingData,
  onStepClick,
}: Step2Props) => {
  const { isDark } = useTheme();

  /* ─── Theme tokens ─── */
  const iconCircleBg = isDark
    ? "linear-gradient(135deg, #c2410c, #f97316)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";

  const iconCircleShadow = isDark
    ? "0 8px 28px rgba(194,65,12,0.4)"
    : "0 8px 28px rgba(29,78,216,0.25)";

  const labelColor = isDark ? "#f0e8de" : "#0f172a";
  const hintColor  = isDark ? "#8a6540" : "#94a3b8";

  return (
    <StepLayout
      currentStep={2}
      totalSteps={7}
      title="How far would you go?"
      subtitle="Set your maximum distance for matches"
      onBack={onBack}
      onNext={onNext}
      onSkip={onSkip}
      isSaving={isSaving}
      data={onboardingData}
      onStepClick={onStepClick}
    >
      <div className="space-y-10">

        {/* Icon */}
        <div className="flex justify-center py-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
            style={{ background: iconCircleBg, boxShadow: iconCircleShadow }}
          >
            <MapPin className="w-10 h-10 text-white fill-white" />
          </div>
        </div>

        {/* Distance Slider */}
        <div className="space-y-6">
          <label
            className="text-base font-semibold block transition-colors duration-300"
            style={{ color: labelColor }}
          >
            Maximum distance
          </label>

          <CustomSlider
            value={data.distance}
            min={1}
            max={150}
            step={1}
            unit="km"
            onChange={(distance) => onChange({ ...data, distance })}
          />
        </div>

        {/* Strict Distance Toggle */}
        <div className="pt-2">
          <ToggleSwitch
            label="Only show people within this range"
            checked={data.strictDistance}
            onChange={(strictDistance) => onChange({ ...data, strictDistance })}
          />
        </div>

        <p
          className="text-xs text-center pt-4 transition-colors duration-300"
          style={{ color: hintColor }}
        >
          You can always adjust this later in settings
        </p>
      </div>
    </StepLayout>
  );
};

export default Step2Distance;