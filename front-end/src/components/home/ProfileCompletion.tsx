import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { profileService } from "@/services/profileService";

interface OnboardingData {
  firstName?: string;
  dateOfBirth?: Date | null;
  gender?: string;
  interests?: string[];
  location?: string;
  bio?: string;
  drinking?: string;
  smoking?: string;
  workout?: string;
  pets?: string;
  communicationStyle?: string[];
  responsePace?: string;
  interestedIn?: string[];
  distance?: number;
  relationshipType?: string;
}

// Maps each validation step to the actual onboarding screen number
// Photos step removed — Bio is now step 8, Social is step 9, Review is step 10
const STEP_MAP: Record<number, number> = {
  1: 1,  // Basic Info
  2: 3,  // Distance Preferences (onboarding step 3)
  3: 4,  // Lifestyle
  4: 5,  // Communication Style
  5: 6,  // Interests
  6: 7,  // Location
  7: 8,  // Bio (was step 9, now step 8)
  8: 9,  // Social Accounts (was step 10, now step 9)
};

const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const [percentage, setPercentage] = useState(0);
  const [nextStep, setNextStep] = useState(1);
  const [isFullyComplete, setIsFullyComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  useEffect(() => {
    fetchProfileCompletion();
  }, []);

  const fetchProfileCompletion = async () => {
    try {
      setLoading(true);
      const result = await profileService.getProfile();

      if (!result.exists || !result.data) {
        setPercentage(0);
        setNextStep(1);
        setIsFullyComplete(false);
        setMissingFields(["All fields"]);
        return;
      }

      const data: OnboardingData = result.data;
      console.log("Profile data for completion check:", data);

      const steps = [
        {
          id: 1,
          onboardingStep: STEP_MAP[1],
          valid:
            !!data.firstName?.trim() &&
            !!data.dateOfBirth &&
            !!data.gender?.trim() &&
            (data.interestedIn || []).length > 0,
          label: "Basic Info",
        },
        {
          id: 2,
          onboardingStep: STEP_MAP[2],
          valid: typeof data.distance === "number" && data.distance > 0,
          label: "Distance Preferences",
        },
        {
          id: 3,
          onboardingStep: STEP_MAP[3],
          valid:
            !!data.drinking?.trim() &&
            !!data.smoking?.trim() &&
            !!data.workout?.trim() &&
            !!data.pets?.trim(),
          label: "Lifestyle",
        },
        {
          id: 4,
          onboardingStep: STEP_MAP[4],
          valid:
            (data.communicationStyle || []).length > 0 &&
            !!data.responsePace?.trim(),
          label: "Communication Style",
        },
        {
          id: 5,
          onboardingStep: STEP_MAP[5],
          valid: (data.interests || []).length > 0,
          label: "Interests",
        },
        {
          id: 6,
          onboardingStep: STEP_MAP[6],
          valid: !!data.location?.trim(),
          label: "Location",
        },
        {
          id: 7,
          onboardingStep: STEP_MAP[7],
          valid: !!data.bio?.trim() && data.bio.trim().split(/\s+/).filter(Boolean).length >= 10,
          label: "Bio",
        },
        {
          id: 8,
          onboardingStep: STEP_MAP[8],
          valid: true, // Social accounts optional
          label: "Social Accounts (Optional)",
        },
      ];

      steps.forEach((step) => {
        console.log(`Step ${step.id} (${step.label}): ${step.valid ? "✅" : "❌"}`);
      });

      const totalDataSteps = steps.length;
      const completedSteps = steps.filter((s) => s.valid).length;
      const pct = Math.min(100, Math.round((completedSteps / totalDataSteps) * 100));
      setPercentage(pct);

      const missing = steps.filter((s) => !s.valid).map((s) => s.label);
      setMissingFields(missing);

      const firstIncomplete = steps.find((s) => !s.valid);

      if (firstIncomplete) {
        setNextStep(firstIncomplete.onboardingStep);
        setIsFullyComplete(false);
        console.log(
          `Next incomplete step: ${firstIncomplete.id} (${firstIncomplete.label}) → onboarding screen ${firstIncomplete.onboardingStep}`
        );
      } else {
        setNextStep(10); // Review step (was 11, now 10)
        setIsFullyComplete(true);
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
      setPercentage(0);
      setNextStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = () => {
    navigate("/onboarding", { state: { startStep: nextStep } });
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="mb-6 p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      </div>
    );
  }

  /* ---------------- COMPLETE ---------------- */
  if (isFullyComplete) {
    return (
      <div className="mb-6 p-6 rounded-[24px] bg-emerald-50 border border-emerald-100 flex flex-col items-center text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-emerald-900 font-bold text-lg mb-1">
          Profile Complete!
        </h3>
        <p className="text-emerald-700/80 text-xs mb-4">
          Your profile looks great. You're ready to match!
        </p>
        <button
          onClick={handleCompleteProfile}
          className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          Review Profile
        </button>
      </div>
    );
  }

  /* ---------------- INCOMPLETE ---------------- */
  return (
    <div className="mb-6 p-6 rounded-[24px] bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="block text-sm font-bold text-gray-900">
            Profile Completion
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {missingFields.length} section
            {missingFields.length !== 1 ? "s" : ""} remaining
          </span>
        </div>
        <span className="text-lg font-black text-teal-600">{percentage}%</span>
      </div>

      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {missingFields.length > 0 && missingFields.length <= 3 && (
        <div className="mb-4 p-3 bg-teal-50 rounded-xl border border-teal-100">
          <p className="text-xs font-semibold text-teal-900 mb-1">
            Next steps:
          </p>
          <ul className="text-xs text-teal-700 space-y-0.5">
            {missingFields.map((field, idx) => (
              <li key={idx}>• {field}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleCompleteProfile}
        className="w-full flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-full text-xs font-bold uppercase tracking-wide hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-100 transition-all duration-200 group"
      >
        <span>Continue Profile</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default ProfileCompletion;