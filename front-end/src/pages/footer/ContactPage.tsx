import React, { useState } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { Mail, MapPin, MessageSquare, Send, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

const SUBJECTS = [
  "General Inquiry", "Bug Report", "Account Issue", "Premium / Billing",
  "Safety Concern", "Feature Request", "Press / Media", "Other",
];

const ContactPage = () => {
  const { isDark } = useTheme() as any;
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const accentEmber  = isDark ? "#fb923c" : "#3b82f6";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const txPrimary    = isDark ? "#f0e8de" : "#111827";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark ? "0 24px 60px rgba(0,0,0,0.55)" : "0 24px 60px rgba(15,23,42,0.08)";
  const ctaGradient  = isDark ? "linear-gradient(135deg,#f97316,#fb923c)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ctaShadow    = isDark ? "0 8px 18px rgba(249,115,22,0.35)" : "0 8px 18px rgba(29,78,216,0.28)";
  const dividerColor = isDark ? "rgba(249,115,22,0.08)" : "#f1f5f9";

  const inputBg      = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const inputBg2     = isDark ? "rgba(255,255,255,0.06)" : "#ffffff"; // focused
  const inputBorder  = isDark ? "rgba(249,115,22,0.2)"   : "#e5e7eb";
  const inputFocus   = isDark ? "#f97316"                : "#1d4ed8";
  const labelColor   = isDark ? "#c4a882"                : "#374151";

  const iconPillBg   = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const iconPillBd   = isDark ? "rgba(249,115,22,0.18)"  : "#f1f5f9";
  const iconCl       = accentColor;

  const infoBannerBg = isDark ? "rgba(249,115,22,0.08)"  : "rgba(29,78,216,0.06)";
  const infoBannerBd = isDark ? "rgba(249,115,22,0.2)"   : "rgba(29,78,216,0.15)";
  const infoBannerCl = isDark ? "#c4a882"                : "#1d4ed8";

  const errorBg      = isDark ? "rgba(244,63,94,0.08)"   : "#fff1f2";
  const errorBd      = isDark ? "rgba(244,63,94,0.2)"    : "#fecdd3";
  const errorCl      = isDark ? "#fca5a5"                : "#be123c";

  const successBg    = isDark ? "rgba(9,207,139,0.08)"   : "#f0fdf4";
  const successCl    = isDark ? "#09cf8b"                : "#059669";
  const resetLinkCl  = accentColor;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/contact/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Something went wrong. Please try again."); return; }
      setSubmitted(true);
    } catch { setError("Network error. Please check your connection and try again."); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({ name: "", email: "", subject: "General Inquiry", message: "" });
  };

  const inputStyle = { background: inputBg, border: `1px solid ${inputBorder}`, color: txPrimary };
  const focusStyle = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = inputFocus;
    e.currentTarget.style.background  = inputBg2;
  };
  const blurStyle  = (e: React.FocusEvent<any>) => {
    e.currentTarget.style.borderColor = inputBorder;
    e.currentTarget.style.background  = inputBg;
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col transition-colors duration-300" style={{ background: pageBg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(29,78,216,0.07) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: isDark ? "radial-gradient(ellipse, rgba(251,146,60,0.05) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: isDark ? "radial-gradient(circle, rgba(249,115,22,0.07) 1px, transparent 1px)" : "radial-gradient(circle, rgba(29,78,216,0.06) 1px, transparent 1px)", backgroundSize: "48px 48px", opacity: 0.3 }} />
      </div>

      <TopBar />

      <div className="flex-1 max-w-6xl mx-auto px-4 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* ── Contact Info ── */}
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="space-y-8 md:space-y-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-black mb-4" style={{ color: txPrimary }}>Get in touch</h1>
            <p className="text-lg leading-relaxed" style={{ color: txBody }}>
              Have a question about the app? Running into a bug? Or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                icon: Mail, label: "Email Us",
                lines: ["support@thedatingapp.com", "press@thedatingapp.com"],
              },
              {
                icon: MapPin, label: "Visit Us",
                lines: ["The Dating App HQ", "Mindspace IT Park, Hitech City", "Hyderabad, Telangana 500081"],
              },
            ].map(({ icon: Icon, label, lines }) => (
              <motion.div key={label} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex items-start gap-5">
                <div className="p-3 rounded-2xl shadow-sm flex-shrink-0"
                  style={{ background: iconPillBg, border: `1px solid ${iconPillBd}` }}>
                  <Icon className="w-6 h-6" style={{ color: iconCl }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: txPrimary }}>{label}</h3>
                  {lines.map((line) => (
                    <p key={line} className="text-sm" style={{ color: txBody }}>{line}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl p-5" style={{ background: infoBannerBg, border: `1px solid ${infoBannerBd}` }}>
            <p className="text-sm font-medium" style={{ color: infoBannerCl }}>
              ⏱ We typically respond within <strong>24 hours</strong> on business days.
            </p>
          </div>
        </motion.div>

        {/* ── Form ── */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[32px] p-6 md:p-10"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow }}>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: successBg }}>
                <MessageSquare className="w-10 h-10" style={{ color: successCl }} />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: txPrimary }}>Message Sent!</h3>
              <p style={{ color: txMuted }}>We'll get back to you within 24 hours.</p>
              <button onClick={handleReset}
                className="mt-8 font-bold hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: resetLinkCl }}>
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl text-sm font-medium"
                  style={{ background: errorBg, border: `1px solid ${errorBd}`, color: errorCl }}>
                  {error}
                </div>
              )}

              {[
                { id: "name",  label: "Name",  type: "text",  placeholder: "Your name" },
                { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label className="block text-sm font-bold mb-2" style={{ color: labelColor }}>{label}</label>
                  <input name={id} value={(form as any)[id]} onChange={handleChange} required
                    type={type} placeholder={placeholder}
                    className="w-full p-4 rounded-xl outline-none transition-all"
                    style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              ))}

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: labelColor }}>Subject</label>
                <select name="subject" value={form.subject} onChange={handleChange}
                  className="w-full p-4 rounded-xl outline-none transition-all cursor-pointer"
                  style={{ ...inputStyle, color: txPrimary }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: labelColor }}>Message</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={4}
                  className="w-full p-4 rounded-xl outline-none transition-all resize-none"
                  placeholder="How can we help?"
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="w-full py-4 font-bold rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: ctaGradient, boxShadow: ctaShadow }}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <>Send Message <Send className="w-4 h-4" /></>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;