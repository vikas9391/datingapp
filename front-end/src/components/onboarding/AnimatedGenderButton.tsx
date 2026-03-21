import { Mars, Venus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface GenderButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function AnimatedGenderButton({
  label,
  isSelected,
  onClick,
}: GenderButtonProps) {
  const { isDark } = useTheme();
  const Icon = label === "Man" ? Mars : Venus;

  /* ─── Dark mode styles ─── */
  const darkCard = isSelected
    ? "border-orange-500 bg-[#1e1208] shadow-md shadow-orange-900/20"
    : "border-[rgba(249,115,22,0.18)] bg-[#1a1a1a] hover:border-[rgba(249,115,22,0.45)]";

  const darkBlobGrad = "from-orange-500/5 to-transparent";

  const darkIconWrapSelected = "bg-orange-500 text-white scale-110";
  const darkIconWrapUnselected =
    "bg-[#242424] text-[#8a6540] group-hover:bg-[rgba(249,115,22,0.12)] group-hover:text-[#fb923c] group-hover:scale-110";

  const darkLabel = isSelected
    ? "text-[#fb923c]"
    : "text-[#8a6540] group-hover:text-[#fb923c]";

  const darkCheck = "text-orange-500 fill-[#1e1208]";

  /* ─── Light mode styles ─── */
  const lightCard = isSelected
    ? "border-[#1d4ed8] bg-blue-50/60 shadow-md shadow-blue-200/50"
    : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm";

  const lightBlobGrad = "from-[#1d4ed8]/5 to-transparent";

  const lightIconWrapSelected = "bg-[#1d4ed8] text-white scale-110";
  const lightIconWrapUnselected =
    "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-[#1d4ed8] group-hover:scale-110";

  const lightLabel = isSelected
    ? "text-[#1d4ed8] font-extrabold"
    : "text-gray-600 group-hover:text-[#1d4ed8]";

  const lightCheck = "text-[#1d4ed8] fill-blue-50";

  /* ─── Resolved ─── */
  const cardStyle   = isDark ? darkCard   : lightCard;
  const blobGrad    = isDark ? darkBlobGrad : lightBlobGrad;
  const iconWrapSel = isDark ? darkIconWrapSelected   : lightIconWrapSelected;
  const iconWrapUns = isDark ? darkIconWrapUnselected : lightIconWrapUnselected;
  const labelStyle  = isDark ? darkLabel  : lightLabel;
  const checkStyle  = isDark ? darkCheck  : lightCheck;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative group flex flex-col items-center justify-center h-32 w-full rounded-3xl border-2 transition-all duration-300 ease-out",
        "hover:shadow-lg hover:-translate-y-1",
        "active:scale-95 active:shadow-sm active:translate-y-0",
        cardStyle
      )}
    >
      {/* Animated background blob */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 bg-gradient-to-br",
          blobGrad,
          isSelected && "opacity-100"
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "p-3 rounded-full mb-3 transition-all duration-300",
          isSelected ? iconWrapSel : iconWrapUns
        )}
      >
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-extrabold tracking-wide transition-colors duration-200",
          labelStyle
        )}
      >
        {label}
      </span>

      {/* Floating checkmark */}
      <div
        className={cn(
          "absolute top-3 right-3 transition-all duration-500 transform",
          isSelected
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-50 translate-y-2"
        )}
      >
        <CheckCircle2 className={cn("w-5 h-5", checkStyle)} />
      </div>
    </button>
  );
}