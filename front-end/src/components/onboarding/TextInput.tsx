import { useTheme } from "@/components/ThemeContext";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  label,
  icon,
}: TextInputProps) {
  const { isDark } = useTheme();
  const isActive = value.trim().length > 0;

  /* ─── Theme tokens ─── */
  const labelColor = isDark ? "#f0e8de" : "#0f172a";

  const wrapperActive: React.CSSProperties = isDark
    ? {
        background: "rgba(249,115,22,0.08)",
        border: "1px solid rgba(249,115,22,0.45)",
      }
    : {
        background: "rgba(29,78,216,0.04)",
        border: "1px solid #1d4ed8",
      };

  const wrapperIdle: React.CSSProperties = isDark
    ? {
        background: "#1c1c1c",
        border: "1px solid rgba(249,115,22,0.2)",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e2e8f0",
      };

  const focusBorder = isDark ? "rgba(249,115,22,0.65)" : "#1d4ed8";
  const focusBg     = isDark ? "rgba(249,115,22,0.1)"  : "rgba(29,78,216,0.04)";

  const inputColor       = isDark ? "#f0e8de" : "#0f172a";
  const placeholderColor = isDark ? "#4a3520" : "#94a3b8";

  return (
    <div className="space-y-1">
      {label && (
        <label
          className="block text-sm font-medium transition-colors duration-300"
          style={{ color: labelColor }}
        >
          {label}
        </label>
      )}

      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
        style={isActive ? wrapperActive : wrapperIdle}
        onFocusCapture={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = focusBorder;
          el.style.background  = focusBg;
        }}
        onBlurCapture={(e) => {
          const el = e.currentTarget as HTMLElement;
          const active = (e.currentTarget.querySelector("input") as HTMLInputElement)?.value?.trim().length > 0;
          const s = active ? wrapperActive : wrapperIdle;
          el.style.borderColor = s.border?.toString().split(" ")[2] ?? "";
          el.style.background  = s.background as string;
        }}
      >
        {/* Icon — tint to match accent if provided */}
        {icon && (
          <span
            className="shrink-0 transition-colors duration-200"
            style={{ color: isActive ? (isDark ? "#f97316" : "#1d4ed8") : (isDark ? "#8a6540" : "#94a3b8") }}
          >
            {icon}
          </span>
        )}

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm"
          style={{ color: inputColor }}
        />

        {/* Inline placeholder style injection */}
        <style>{`
          input::placeholder { color: ${placeholderColor}; }
        `}</style>
      </div>
    </div>
  );
}