// src/components/onboarding/ProgressBar.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { OnboardingData } from "./OnboardingFlow";
import { useTheme } from "@/components/ThemeContext";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  isSaving?: boolean;
  data?: OnboardingData;
  onStepClick?: (step: number) => void;
}

const isStepComplete = (stepNumber: number, data?: OnboardingData): boolean => {
  if (!data) return false;
  switch (stepNumber) {
    case 1:  return !!(data.firstName && data.dateOfBirth && data.gender);
    case 2:  return !!data.relationshipType;
    case 3:  return true;
    case 4:  return !!(data.drinking || data.smoking || data.workout || data.pets);
    case 5:  return data.communicationStyle.length > 0 || !!data.responsePace;
    case 6:  return data.interests.length > 0;
    case 7:  return !!(data.location || data.useCurrentLocation);
    case 8:  return true;
    case 9:  return !!(data.bio && (data as any).conversationStarter);
    case 10: return true;
    case 11: return true;
    default: return false;
  }
};

const findFirstIncompleteStep = (data?: OnboardingData, totalSteps = 11): number => {
  if (!data) return 1;
  for (let i = 1; i <= totalSteps; i++) {
    if (!isStepComplete(i, data)) return i;
  }
  return totalSteps;
};

export const ProgressBar = ({
  currentStep,
  totalSteps,
  isSaving,
  data,
  onStepClick,
}: ProgressBarProps) => {
  const { isDark } = useTheme();

  const progress = (currentStep / totalSteps) * 100;
  const firstIncompleteStep = findFirstIncompleteStep(data, totalSteps);
  const canNavigate =
    onStepClick &&
    firstIncompleteStep !== currentStep &&
    firstIncompleteStep < currentStep;

  const handleBarClick = () => {
    if (canNavigate) onStepClick!(firstIncompleteStep);
  };

  /* ─── Theme tokens ─── */
  const trackBg      = isDark ? "rgba(249,115,22,0.1)" : "#e2e8f0";
  const trackHoverBg = isDark ? "rgba(249,115,22,0.18)" : "#cbd5e1";
  const fillColor    = isDark ? "#f97316" : "#1d4ed8";
  const savingColor  = isDark ? "#8a6540" : "#64748b";
  const stepColor    = isDark ? "#c4a882" : "#64748b";

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={cn(
          "w-full h-1.5 rounded-full overflow-hidden relative transition-colors duration-200",
          canNavigate && "cursor-pointer"
        )}
        style={{ background: trackBg }}
        onClick={handleBarClick}
        onMouseEnter={(e) => {
          if (canNavigate) (e.currentTarget as HTMLElement).style.background = trackHoverBg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = trackBg;
        }}
        title={canNavigate ? `Jump to Step ${firstIncompleteStep}` : undefined}
      >
        {/* Main progress fill */}
        <motion.div
          className="h-full rounded-full"
          style={{ background: fillColor }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        {/* Incomplete step indicator */}
        {canNavigate && (
          <motion.div
            className="absolute top-0 h-full rounded-full bg-amber-400"
            style={{
              width: `${(1 / totalSteps) * 100}%`,
              left: `${((firstIncompleteStep - 1) / totalSteps) * 100}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-amber-300 rounded-full"
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>

      {isSaving && (
        <span
          className="text-xs whitespace-nowrap animate-pulse transition-colors duration-300"
          style={{ color: savingColor }}
        >
          Saving...
        </span>
      )}

      <span
        className="text-xs font-semibold whitespace-nowrap transition-colors duration-300"
        style={{ color: stepColor }}
      >
        {currentStep}/{totalSteps}
      </span>
    </div>
  );
};

export default ProgressBar;