import { useEffect, useRef } from "react";
import Datepicker from "flowbite-datepicker/Datepicker";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "Select date" }: DatePickerProps) {
  const { isDark } = useTheme();
  const datepickerRef = useRef<HTMLInputElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    const inputElement = datepickerRef.current;
    if (!inputElement) return;

    instanceRef.current = new Datepicker(inputElement, {
      autohide: true,
      format: "mm/dd/yyyy",
      orientation: "bottom",
      buttons: true,
      autoSelectToday: 0,
      container: "body",
    });

    const handleDateChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.value) {
        if (onChange) onChange(null);
        return;
      }
      const selectedDate = new Date(target.value);
      if (!isNaN(selectedDate.getTime()) && onChange) onChange(selectedDate);
    };

    inputElement.addEventListener("changeDate", handleDateChange);

    return () => {
      inputElement.removeEventListener("changeDate", handleDateChange);
      if (instanceRef.current) instanceRef.current.destroy();
      document.querySelectorAll(".datepicker").forEach((p) => p.remove());
    };
  }, [onChange]);

  useEffect(() => {
    if (datepickerRef.current && instanceRef.current) {
      if (value) {
        const mm   = String(value.getMonth() + 1).padStart(2, "0");
        const dd   = String(value.getDate()).padStart(2, "0");
        const yyyy = value.getFullYear();
        const formatted = `${mm}/${dd}/${yyyy}`;
        if (datepickerRef.current.value !== formatted) {
          instanceRef.current.setDate(value);
        }
      } else if (datepickerRef.current.value !== "") {
        instanceRef.current.setDate({ clear: true });
      }
    }
  }, [value]);

  /* ─── Theme styles ─── */
  const iconColor = isDark ? "#f97316" : "#1d4ed8";

  const inputStyle: React.CSSProperties = isDark
    ? {
        background: "#1c1c1c",
        border: "2px solid rgba(249,115,22,0.25)",
        color: "#f0e8de",
        borderRadius: "0.75rem",
        paddingLeft: "3rem",
        padding: "1rem",
        paddingInlineStart: "3rem",
        fontSize: "0.875rem",
        width: "100%",
        outline: "none",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }
    : {
        background: "#ffffff",
        border: "2px solid #e2e8f0",
        color: "#0f172a",
        borderRadius: "0.75rem",
        paddingLeft: "3rem",
        padding: "1rem",
        paddingInlineStart: "3rem",
        fontSize: "0.875rem",
        width: "100%",
        outline: "none",
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      };

  const focusBorderColor = isDark ? "#f97316" : "#1d4ed8";
  const hoverBorderColor = isDark ? "rgba(249,115,22,0.5)" : "#93c5fd";

  return (
    <>
      {/* Inject scoped styles for focus/hover since inline styles can't handle pseudo-classes */}
      <style>{`
        .themed-datepicker:hover {
          border-color: ${hoverBorderColor} !important;
        }
        .themed-datepicker:focus {
          border-color: ${focusBorderColor} !important;
          box-shadow: 0 0 0 3px ${isDark ? "rgba(249,115,22,0.15)" : "rgba(29,78,216,0.1)"} !important;
        }
        .themed-datepicker::placeholder {
          color: ${isDark ? "#4a3520" : "#94a3b8"};
        }
      `}</style>

      <div className="relative w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none z-10">
          <CalendarIcon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
        <input
          ref={datepickerRef}
          type="text"
          className="themed-datepicker"
          style={inputStyle}
          placeholder={placeholder}
          autoComplete="off"
          onKeyDown={(e) => e.preventDefault()}
        />
      </div>
    </>
  );
}