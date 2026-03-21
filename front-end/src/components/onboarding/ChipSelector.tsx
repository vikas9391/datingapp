import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface ChipSelectorProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const ChipSelector = ({
  label,
  selected,
  onClick,
  icon,
  className,
}: ChipSelectorProps) => {
  const { isDark } = useTheme();

  const selectedStyles = isDark
    ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-900/30"
    : "bg-[#1d4ed8] border-[#1d4ed8] text-white shadow-md shadow-blue-200";

  const unselectedStyles = isDark
    ? "bg-[#1c1c1c] border-[rgba(249,115,22,0.25)] text-[#c4a882] hover:border-[#f97316] hover:text-[#fb923c]"
    : "bg-white border-gray-200 text-gray-700 hover:border-[#1d4ed8] hover:text-[#1d4ed8]";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border",
        selected ? selectedStyles : unselectedStyles,
        className
      )}
    >
      {icon && <span className="text-lg leading-none">{icon}</span>}
      <span>{label}</span>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          selected ? "w-4 opacity-100" : "w-0 opacity-0"
        )}
      >
        <Check className="w-4 h-4 text-white stroke-[3]" />
      </div>
    </motion.button>
  );
};