import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import { useNavigate, useLocation } from "react-router-dom";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Orientation from "./steps/Step2Orientation";
import Step3Distance from "./steps/Step3Distance";
import Step4Lifestyle from "./steps/Step4Lifestyle";
import Step5Communication from "./steps/Step5Communication";
import Step6Interests from "./steps/Step6Interests";
import Step7Location from "./steps/Step7Location";
import Step8Bio from "./steps/Step9Bio";
import Step9Social from "./steps/Step10Social";
import Step10Review from "./steps/Step11Review";
import { profileService } from "../../services/profileService";

export type OnboardingData = {
  firstName: string;
  dateOfBirth: Date | null;
  gender: string;
  showGender: boolean;
  relationshipType: string;
  interestedIn: string[];
  distance: number;
  strictDistance: boolean;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  communicationStyle: string[];
  responsePace: string;
  interests: string[];
  location: string;
  useCurrentLocation: boolean;
  latitude?: number;
  longitude?: number;
  photos: string[];
  bio: string;
  socialAccounts?: {
    instagram: string;
    whatsapp: string;
    snapchat: string;
    twitter: string;
    linkedin: string;
  };
};

const initialData: OnboardingData = {
  firstName: "",
  dateOfBirth: null,
  gender: "",
  showGender: false,
  relationshipType: "",
  interestedIn: [],
  distance: 25,
  strictDistance: false,
  drinking: "",
  smoking: "",
  workout: "",
  pets: "",
  communicationStyle: [],
  responsePace: "",
  interests: [],
  location: "",
  useCurrentLocation: false,
  latitude: undefined,
  longitude: undefined,
  photos: [],
  bio: "",
  socialAccounts: {
    instagram: "",
    whatsapp: "",
    snapchat: "",
    twitter: "",
    linkedin: "",
  },
};

const TOTAL_STEPS = 10;

// Key used to signal "onboarding just completed — skip the reload guard"
const ONBOARDING_DONE_KEY = "onboarding_complete";

export default function OnboardingFlow({
  onComplete,
  onLogout,
}: {
  onComplete?: () => void;
  onLogout?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // FIX: track whether we are in the middle of finishing so we don't
  // accidentally reload the profile or reset state mid-navigation.
  const isFinishingRef = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.dateOfBirth) {
          parsed.dateOfBirth = new Date(parsed.dateOfBirth);
        }
        parsed.photos = [];
        delete parsed.conversationStarter;
        setData({ ...initialData, ...parsed });
      } catch (e) {
        console.error("Failed to parse onboarding data", e);
      }
    }
  }, []);

  // Save to localStorage whenever data changes (without photos)
  useEffect(() => {
    // Don't write to localStorage after we're done — avoids a race where the
    // cleanup in saveProfileAndFinish is immediately overwritten.
    if (isFinishingRef.current) return;
    const { photos: _photos, ...rest } = data;
    localStorage.setItem("onboardingData", JSON.stringify(rest));
  }, [data]);

  // Load existing profile from API
  useEffect(() => {
    loadExistingProfile();

    const state = location.state as { startStep?: number } | null;
    if (state?.startStep) {
      setStep(state.startStep);
    }
  }, []);

  const loadExistingProfile = async () => {
    // FIX: if we just finished onboarding, skip the API reload entirely
    // so we don't overwrite the just-saved data or re-render the flow.
    if (isFinishingRef.current) return;

    try {
      setIsLoading(true);
      const result = await profileService.getProfile();

      if (result?.exists && result?.data) {
        const mergedData = {
          ...initialData,
          ...result.data,
          photos: [],
          interestedIn: result.data.interestedIn || [],
          communicationStyle: result.data.communicationStyle || [],
          interests: result.data.interests || [],
          socialAccounts: result.data.socialAccounts || initialData.socialAccounts,
        };
        setData(mergedData);
      }
    } catch (err) {
      console.error("⚠️ Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveData = useCallback(async () => {
    try {
      setIsSaving(true);
      await profileService.saveProfile(data);
    } catch (err) {
      console.error("❌ Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [data]);

  const setStepData = (patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const goNext = async () => {
    await autoSaveData();
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkip = async () => {
    await autoSaveData();
    goNext();
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep >= 1 && targetStep <= TOTAL_STEPS) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveProfileAndFinish = async () => {
    // FIX: set the ref immediately so no other effect can trigger a reload
    isFinishingRef.current = true;

    try {
      setIsSaving(true);
      await profileService.saveProfile(data);

      // Clean up all onboarding state from storage
      localStorage.removeItem("onboardingData");
      localStorage.removeItem(ONBOARDING_DONE_KEY);

      // Small delay so the save request fully completes before we navigate
      await new Promise((resolve) => setTimeout(resolve, 150));

      if (data.gender && data.gender.toLowerCase() === "man") {
        // Men are shown the premium upsell first
        navigate("/premium", { replace: true });
      } else if (onComplete) {
        // Parent component handles the redirect (e.g. in a modal flow)
        onComplete();
      } else {
        navigate("/home", { replace: true });
      }
    } catch (err) {
      console.error("❌ Profile save failed:", err);
      // On error, allow the user to try again
      isFinishingRef.current = false;
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    const commonProps = {
      data,
      onChange: setStepData,
      onNext: goNext,
      onBack: goBack,
      onSkip: handleSkip,
      isSaving,
      onboardingData: data,
      onStepClick: handleStepClick,
    };

    switch (step) {
      case 1:  return <Step1BasicInfo {...commonProps} />;
      case 2:  return <Step2Orientation {...commonProps} />;
      case 3:  return <Step3Distance {...commonProps} />;
      case 4:  return <Step4Lifestyle {...commonProps} />;
      case 5:  return <Step5Communication {...commonProps} />;
      case 6:  return <Step6Interests {...commonProps} />;
      case 7:  return <Step7Location {...commonProps} />;
      case 8:  return <Step8Bio {...commonProps} />;
      case 9:  return <Step9Social {...commonProps} />;
      case 10: return <Step10Review {...commonProps} onNext={saveProfileAndFinish} />;
      default: return <Step1BasicInfo {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar userName={data.firstName || "User"} onLogout={onLogout} />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 w-full"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}