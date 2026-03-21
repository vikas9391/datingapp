import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "@/components/ThemeContext";

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const CheckboxField = ({
  label,
  checked,
  onChange,
  className,
}: CheckboxFieldProps) => {
  const { isDark } = useTheme();

  const checkedBox = isDark
    ? "bg-orange-500 border-orange-500"
    : "bg-[#1d4ed8] border-[#1d4ed8]";

  const uncheckedBox = isDark
    ? "border-[rgba(249,115,22,0.35)] bg-[#1c1c1c] group-hover:border-[#f97316]"
    : "border-gray-300 bg-white group-hover:border-[#1d4ed8]";

  const checkedLabel = isDark ? "text-[#f0e8de] font-medium" : "text-gray-900 font-medium";
  const uncheckedLabel = isDark ? "text-[#8a6540]" : "text-gray-500";

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-3 w-full py-2 text-left group",
        className
      )}
    >
      <div
        className={cn(
          "w-6 h-6 flex items-center justify-center transition-all duration-200 border-2 rounded-full shrink-0",
          checked ? checkedBox : uncheckedBox
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: checked ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
        </motion.div>
      </div>

      <span
        className={cn(
          "text-sm transition-colors duration-200",
          checked ? checkedLabel : uncheckedLabel
        )}
      >
        {label}
      </span>
    </button>
  );
};