import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Heart, X, Sun, Moon } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpVerification from "@/components/auth/OtpVerification";
import ForgotPassword from "@/components/auth/Forgotpassword";
import ResetPasswordOTP from "@/components/auth/Resetpasswordotp";
import NewPassword from "@/components/auth/Newpassword";
import { useTheme } from "@/components/ThemeContext";

type AuthView = "login" | "signup" | "otp" | "forgot-password" | "reset-otp" | "new-password";

type LoginPageProps = {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLoginSuccess: () => void;
};

const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE_URL = `${API_BASE}/api`;

/* ─────────────────────────────────────────────
   CHARACTER ANIMATION COMPONENTS
───────────────────────────────────────────── */

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

function EyeBall({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
}: EyeBallProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calcPupil = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined)
      return { x: forceLookX, y: forceLookY };
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calcPupil();

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: isBlinking ? 2 : size,
        backgroundColor: eyeColor,
        overflow: "hidden",
        transition: "height 0.1s ease-out",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: pupilSize,
            height: pupilSize,
            backgroundColor: pupilColor,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
}

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

function Pupil({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
}: PupilProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  const calcPos = () => {
    if (!ref.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined)
      return { x: forceLookX, y: forceLookY };
    const rect = ref.current.getBoundingClientRect();
    const dx = mouseX - (rect.left + rect.width / 2);
    const dy = mouseY - (rect.top + rect.height / 2);
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calcPos();

  return (
    <div
      ref={ref}
      className="rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: pupilColor,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
}

function CharacterPanel({
  isTyping,
  password,
  showPassword,
  isDark,
}: {
  isTyping: boolean;
  password: string;
  showPassword: boolean;
  isDark: boolean;
}) {
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef  = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule(); return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const schedule = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); schedule(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = schedule(); return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const t = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(t);
    } else setIsLookingAtEachOther(false);
  }, [isTyping]);

  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else setIsPurplePeeking(false);
  }, [password, showPassword, isPurplePeeking]);

  const hidingPassword  = password.length > 0 && !showPassword;
  const showingPassword = password.length > 0 && showPassword;

  // ── Palette: vivid in light, neon-glow in dark ──
  // Dark:  orange accent (tall) · cyan (mid) · coral (round) · lime (short)
  // Light: indigo (tall) · slate (mid) · peach (round) · yellow (short)
  const c1 = isDark ? "#f97316" : "#6C3FF5"; // tall rectangle — orange / indigo
  const c2 = isDark ? "#22d3ee" : "#334155"; // center slim   — cyan  / slate
  const c3 = isDark ? "#fb7185" : "#FF9B6B"; // round blob    — coral / peach
  const c4 = isDark ? "#a3e635" : "#E8D754"; // short round   — lime  / yellow
  const pupilDark = isDark ? "#0d0d0d" : "#1a1a1a";

  return (
    <div className="relative select-none" style={{ width: 300, height: 270, overflow: "visible" }}>

      {/* Monster 1 — tall rectangle, far left */}
      <div
        ref={purpleRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 30,
          width: 96,
          height: isTyping || hidingPassword ? 248 : 230,
          backgroundColor: c1,
          borderRadius: "8px 8px 0 0",
          zIndex: 1,
          boxShadow: isDark ? `0 0 28px ${c1}55` : "none",
          transform: showingPassword
            ? "skewX(0deg)"
            : isTyping || hidingPassword
            ? "skewX(-7deg) translateX(20px)"
            : "skewX(0deg)",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-4 transition-all duration-700 ease-in-out"
          style={{
            left: showingPassword ? 10 : isLookingAtEachOther ? 28 : 24,
            top:  showingPassword ? 20 : isLookingAtEachOther ? 36 : 22,
          }}
        >
          {[0, 1].map((i) => (
            <EyeBall key={i} size={15} pupilSize={5} maxDistance={4}
              eyeColor="white" pupilColor={pupilDark} isBlinking={isPurpleBlinking}
              forceLookX={showingPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
              forceLookY={showingPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
            />
          ))}
        </div>
      </div>

      {/* Monster 2 — slim center */}
      <div
        ref={blackRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 126,
          width: 64,
          height: 176,
          backgroundColor: c2,
          borderRadius: "6px 6px 0 0",
          zIndex: 2,
          boxShadow: isDark ? `0 0 22px ${c2}55` : "none",
          transform: showingPassword
            ? "skewX(0deg)"
            : isLookingAtEachOther
            ? "skewX(8deg) translateX(10px)"
            : isTyping || hidingPassword
            ? "skewX(4deg)"
            : "skewX(0deg)",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-3 transition-all duration-700 ease-in-out"
          style={{
            left: showingPassword ? 7 : isLookingAtEachOther ? 18 : 13,
            top:  showingPassword ? 18 : isLookingAtEachOther ? 7 : 18,
          }}
        >
          {[0, 1].map((i) => (
            <EyeBall key={i} size={13} pupilSize={5} maxDistance={3}
              eyeColor="white" pupilColor={pupilDark} isBlinking={isBlackBlinking}
              forceLookX={showingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
              forceLookY={showingPassword ? -4 : isLookingAtEachOther ? -4 : undefined}
            />
          ))}
        </div>
      </div>

      {/* Monster 3 — round blob, front-left */}
      <div
        ref={orangeRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 0,
          width: 130,
          height: 108,
          backgroundColor: c3,
          borderRadius: "65px 65px 0 0",
          zIndex: 3,
          boxShadow: isDark ? `0 0 24px ${c3}55` : "none",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-4 transition-all duration-200 ease-out"
          style={{
            left: showingPassword ? 26 : 44,
            top:  showingPassword ? 46 : 48,
          }}
        >
          {[0, 1].map((i) => (
            <Pupil key={i} size={9} maxDistance={4} pupilColor={pupilDark}
              forceLookX={showingPassword ? -5 : undefined}
              forceLookY={showingPassword ? -4 : undefined}
            />
          ))}
        </div>
      </div>

      {/* Monster 4 — short round, far right */}
      <div
        ref={yellowRef}
        className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 174,
          width: 80,
          height: 128,
          backgroundColor: c4,
          borderRadius: "40px 40px 0 0",
          zIndex: 4,
          boxShadow: isDark ? `0 0 20px ${c4}55` : "none",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="absolute flex gap-3 transition-all duration-200 ease-out"
          style={{
            left: showingPassword ? 10 : 28,
            top:  showingPassword ? 18 : 22,
          }}
        >
          {[0, 1].map((i) => (
            <Pupil key={i} size={9} maxDistance={4} pupilColor={pupilDark}
              forceLookX={showingPassword ? -5 : undefined}
              forceLookY={showingPassword ? -4 : undefined}
            />
          ))}
        </div>
        {/* Mouth */}
        <div
          className="absolute rounded-full transition-all duration-200 ease-out"
          style={{
            width: 44, height: 3,
            backgroundColor: pupilDark,
            left: showingPassword ? 6 : 18,
            top: 50,
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LOGIN PAGE
───────────────────────────────────────────── */

export default function LoginPage({
  isLoggedIn,
  onLogout,
  onLoginSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme, setIsDark } = useTheme() as any;
  const handleToggle = toggleTheme ?? (() => setIsDark?.((v: boolean) => !v));

  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Character animation state
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ─── Theme tokens ─── */
  const accentColor  = isDark ? "#f97316" : "#1d4ed8";
  const pageBg       = isDark ? "#0d0d0d" : "linear-gradient(to bottom, #f8faff, #f0f4ff)";
  const navBg        = isDark ? "rgba(13,13,13,0.95)" : "rgba(255,255,255,0.95)";
  const navBorder    = isDark ? "rgba(249,115,22,0.14)" : "rgba(29,78,216,0.1)";
  const cardBg       = isDark ? "#1c1c1c" : "#ffffff";
  const cardBorder   = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const cardShadow   = isDark
    ? "0 24px 60px rgba(0,0,0,0.55)"
    : "0 24px 60px rgba(15,23,42,0.08)";
  const txPrimary    = isDark ? "#f0e8de" : "#222222";
  const txBody       = isDark ? "#c4a882" : "#4b5563";
  const txMuted      = isDark ? "#8a6540" : "#9ca3af";
  const labelColor   = isDark ? "#c4a882" : "#4b5563";
  const inputBg      = isDark ? "rgba(255,255,255,0.04)" : "#f9fafb";
  const inputBorder  = isDark ? "rgba(249,115,22,0.2)"  : "#e5e7eb";
  const inputFocus   = isDark ? "#f97316"               : "#1d4ed8";
  const eyeIconCl    = isDark ? "#8a6540"               : "#c4c9d3";
  const eyeIconHover = isDark ? "#c4a882"               : "#6b7280";
  const linkColor    = isDark ? "#fb923c"               : "#1d4ed8";
  const ctaGradient  = isDark
    ? "linear-gradient(135deg, #f97316, #fb923c)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const ctaShadow    = isDark
    ? "0 8px 18px rgba(249,115,22,0.35)"
    : "0 8px 18px rgba(29,78,216,0.28)";
  const logoGrad     = isDark
    ? "linear-gradient(135deg, #f97316, #fb923c)"
    : "linear-gradient(135deg, #1d4ed8, #3b82f6)";
  const googleBg     = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const googleBorder = isDark ? "rgba(249,115,22,0.18)"  : "#e5e7eb";
  const googleHover  = isDark ? "rgba(255,255,255,0.07)" : "#f9fafb";
  const checkColor   = isDark ? "#f97316" : "#1d4ed8";
  const checkHoverBdr = isDark ? "#fb923c" : "#3b82f6";
  const modalBg      = isDark ? "#1c1c1c"    : "#ffffff";
  const modalBorder  = isDark ? "rgba(249,115,22,0.14)" : "#f1f1f5";
  const modalTxHead  = isDark ? "#f0e8de"    : "#111";
  const modalTxBody  = isDark ? "#c4a882"    : "#4b5563";
  const modalTxMuted = isDark ? "#8a6540"    : "#9ca3af";
  const toggleStyle  = isDark
    ? { background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.28)", color: "#fb923c" }
    : { background: "rgba(29,78,216,0.08)", border: "1px solid rgba(29,78,216,0.22)", color: "#1d4ed8" };

  /* Character panel bg — matches the app's dark (orange) / light (blue) theme */
  const charPanelBg = isDark
    ? "linear-gradient(160deg, #151008 0%, #0f0d0a 55%, #0d0d0d 100%)"
    : "linear-gradient(160deg, #e8e0ff 0%, #f0f4ff 60%, #e5e7eb 100%)";
  const charPanelGlow = isDark
    ? "radial-gradient(ellipse 70% 50% at 50% 90%, rgba(249,115,22,0.18) 0%, transparent 70%)"
    : "radial-gradient(ellipse 70% 60% at 50% 80%, rgba(108,63,245,0.12) 0%, transparent 70%)";

  const charLabelColor = isDark ? "rgba(249,115,22,0.35)" : "rgba(100,100,150,0.5)";
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    if (!access || !refresh) return;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    fetch(`${API_BASE_URL}/me/`, { headers: { Authorization: `Bearer ${access}` } })
      .then((res) => { if (!res.ok) throw new Error("Failed to fetch user"); return res.json(); })
      .then((user) => {
        if (user?.email) localStorage.setItem("user_email", user.email.toLowerCase());
        window.history.replaceState({}, "", window.location.pathname);
        onLoginSuccess();
        navigate("/home");
      })
      .catch(() => setErrorMsg("Google login failed. Please try again."));
  }, [location.search, navigate, onLoginSuccess]);

  /* ─── Login ─── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    const username = email.trim();
    try {
      const userRes = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (userRes.ok) {
        const data = await userRes.json();
        const { access, refresh, user } = data;
        if (!user?.is_verified) {
          await fetch(`${API_BASE_URL}/login/send-otp/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
          });
          setView("otp");
          setLoading(false);
          return;
        }
        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);
        localStorage.setItem("user_email", user.email.toLowerCase());
        const adminCheckRes = await fetch(`${API_BASE_URL}/admin/dashboard/stats/`, {
          headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
        });
        if (adminCheckRes.ok) { navigate("/admin/dashboard"); setLoading(false); return; }
        onLoginSuccess();
        navigate("/home");
        setLoading(false);
        return;
      }
      const adminRes = await fetch(`${API_BASE_URL}/admin/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        localStorage.setItem("admin_token", adminData.token);
        localStorage.setItem("admin_user", JSON.stringify(adminData.user));
        navigate("/admin/dashboard");
        setLoading(false);
        return;
      }
      const adminError = await adminRes.json();
      throw new Error(adminError.error || adminError.detail || "Invalid credentials");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Signup ─── */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (password !== confirmPassword) { setErrorMsg("Passwords do not match"); return; }
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters"); return; }
    if (!ageConfirmed) { setErrorMsg("You must confirm you are 18 or older"); return; }
    if (!agreedToTerms) { setErrorMsg("You must agree to the Terms of Service and Privacy Policy"); return; }
    setLoading(true);
    try {
      const registerRes = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim(), password, agreed_to_terms: agreedToTerms, age_confirmed: ageConfirmed }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.detail || "Signup failed");
      await fetch(`${API_BASE_URL}/login/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim() }),
      });
      setView("otp");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/login/send-otp/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim() }),
      });
    } catch {}
  };

  const handleResendResetOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/password/forgot/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/google-login/`);
      const data = await res.json();
      if (!res.ok || !data.auth_url) throw new Error("Google login failed");
      window.location.href = data.auth_url;
    } catch (err: any) {
      setErrorMsg(err.message || "Google login failed");
    }
  };

  /* ─── Legal content ─── */
  const LEGAL_CONTENT = {
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-[13px] leading-relaxed" style={{ color: modalTxBody }}>
          <p className="font-semibold" style={{ color: modalTxHead }}>Welcome to The Dating App. By accessing our platform, you agree to these Terms.</p>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>1. Eligibility</h4><p>You must be at least 18 years of age to create an account on The Dating App.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>2. Code of Conduct</h4><p>You agree to treat other users with respect and not engage in harassment, bullying, or hate speech of any kind.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>3. Account Responsibility</h4><p>You are responsible for maintaining the confidentiality of your account and password.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>4. Prohibited Content</h4><p>You may not post content that is illegal, offensive, misleading, or infringes on the rights of others.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>5. Termination</h4><p>We reserve the right to suspend or terminate accounts that violate these Terms at our sole discretion.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>6. Jurisdiction</h4><p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</p></div>
          <p className="text-[11px]" style={{ color: modalTxMuted }}>Last updated: January 15, 2026</p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-[13px] leading-relaxed" style={{ color: modalTxBody }}>
          <p className="font-semibold" style={{ color: modalTxHead }}>Your privacy is at the core of The Dating App experience.</p>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>1. Information We Collect</h4><p>We collect information you provide directly — such as your name, email, profile details, and messages — as well as usage data.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>2. How We Use Your Data</h4><p>Your data is used to provide and improve our matching service. We do not sell your personal data to third parties.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>3. Data Storage</h4><p>Your data is securely stored on servers located in India, in compliance with applicable data protection regulations.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>4. Your Rights</h4><p>You have the right to access, correct, or delete your personal data at any time via Settings → Privacy.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>5. Cookies</h4><p>We use cookies to remember your session and preferences.</p></div>
          <div><h4 className="font-semibold mb-1" style={{ color: modalTxHead }}>6. Contact</h4><p>For privacy-related questions, contact us at <span style={{ color: accentColor }}>support@thedatingapp.com</span>.</p></div>
          <p className="text-[11px]" style={{ color: modalTxMuted }}>Last updated: January 20, 2026</p>
        </div>
      ),
    },
  };

  /* ─── Determine character state ─── */
  const characterIsTyping = isEmailFocused;

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: pageBg }}>

      {/* ── Legal Modal ── */}
      <AnimatePresence>
        {legalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setLegalModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md max-h-[80vh] flex flex-col rounded-[24px] shadow-2xl overflow-hidden"
              style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${modalBorder}` }}>
                <h2 className="text-[15px] font-semibold" style={{ color: modalTxHead }}>{LEGAL_CONTENT[legalModal].title}</h2>
                <button
                  onClick={() => setLegalModal(null)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: isDark ? "rgba(249,115,22,0.1)" : "#f3f4f6", color: isDark ? "#8a6540" : "#6b7280" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(249,115,22,0.18)" : "#e5e7eb")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(249,115,22,0.1)" : "#f3f4f6")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-6 py-5 flex-1">{LEGAL_CONTENT[legalModal].body}</div>
              <div className="px-6 py-4" style={{ borderTop: `1px solid ${modalBorder}` }}>
                <button
                  onClick={() => setLegalModal(null)}
                  className="w-full h-9 rounded-lg text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
                  style={{ background: ctaGradient }}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl transition-all duration-300"
        style={{ background: navBg, borderBottom: `1px solid ${navBorder}` }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 sm:px-10 py-3.5">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: logoGrad, boxShadow: `0 4px 14px ${accentColor}40` }}
            >
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-[15px] leading-none" style={{ color: txPrimary }}>
              The Dating App
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleToggle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}
              className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-300"
              style={toggleStyle}
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "moon" : "sun"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                  transition={{ duration: 0.22 }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {isDark ? <Moon size={15} /> : <Sun size={15} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
            <Button
              className="rounded-full px-6 py-2 text-[12px] font-semibold text-white hover:opacity-90 shadow-sm border-none"
              style={{ background: ctaGradient, boxShadow: ctaShadow }}
              onClick={() => navigate("/login")}
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="pt-16 min-h-screen flex">
        <AnimatePresence mode="wait">
          {view === "otp" ? (
            <div className="w-full flex items-start justify-center px-4 pt-16 pb-20">
              <OtpVerification
                key="otp"
                email={email}
                apiBaseUrl={API_BASE_URL}
                onSuccess={() => { onLoginSuccess(); navigate("/home"); }}
                onResend={handleResendOtp}
                onBack={() => setView("login")}
              />
            </div>
          ) : view === "forgot-password" ? (
            <div className="w-full flex items-start justify-center px-4 pt-16 pb-20">
              <ForgotPassword
                key="forgot-password"
                apiBaseUrl={API_BASE_URL}
                onBack={() => setView("login")}
                onOtpSent={(resetEmail) => { setEmail(resetEmail); setView("reset-otp"); }}
              />
            </div>
          ) : view === "reset-otp" ? (
            <div className="w-full flex items-start justify-center px-4 pt-16 pb-20">
              <ResetPasswordOTP
                key="reset-otp"
                email={email}
                apiBaseUrl={API_BASE_URL}
                onVerified={(verifiedEmail, token) => { setEmail(verifiedEmail); setResetToken(token); setView("new-password"); }}
                onBack={() => setView("forgot-password")}
                onResend={handleResendResetOtp}
              />
            </div>
          ) : view === "new-password" ? (
            <div className="w-full flex items-start justify-center px-4 pt-16 pb-20">
              <NewPassword
                key="new-password"
                email={email}
                resetToken={resetToken}
                apiBaseUrl={API_BASE_URL}
                onSuccess={() => { setView("login"); setPassword(""); setEmail(""); }}
                onBack={() => setView("reset-otp")}
              />
            </div>
          ) : view === "signup" ? (
            /* ──────── SIGNUP — two-column with character panel ──────── */
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full grid lg:grid-cols-2"
            >
              {/* Left — character panel */}
              <div
                className="hidden lg:flex flex-col items-center justify-center relative"
                style={{ background: charPanelBg, minHeight: "calc(100vh - 64px)", overflow: "visible" }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: charPanelGlow }} />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <CharacterPanel isTyping={characterIsTyping} password={password} showPassword={showConfirmPassword} isDark={isDark} />
                  <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: charLabelColor }}>
                    They're watching you sign up
                  </p>
                </div>
              </div>

              {/* Right — signup form */}
              <div className="flex items-start justify-center px-4 pt-10 pb-20 overflow-y-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
                <div className="w-full max-w-sm">
                  <div
                    className="rounded-[28px] px-10 py-10"
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow, overflow: "hidden" }}
                  >
                    <button
                      onClick={() => setView("login")}
                      className="flex items-center gap-2 text-[11px] mb-6 bg-transparent border-none cursor-pointer transition-colors"
                      style={{ color: txMuted }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = txBody)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = txMuted)}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to login</span>
                    </button>

                    {/* Mobile character panel — sits at top of card */}
                    <div
                      className="lg:hidden -mx-10 -mt-10 mb-6 flex items-end justify-center overflow-hidden"
                      style={{
                        background: charPanelBg,
                        height: 200,
                        borderRadius: "28px 28px 0 0",
                        position: "relative",
                      }}
                    >
                      <div className="absolute inset-0 pointer-events-none" style={{ background: charPanelGlow }} />
                      <div className="relative z-10" style={{ transform: "scale(0.78)", transformOrigin: "bottom center" }}>
                        <CharacterPanel isTyping={characterIsTyping} password={password} showPassword={showConfirmPassword} isDark={isDark} />
                      </div>
                    </div>

                    <div className="text-center mb-7">
                      <h1 className="text-[18px] font-semibold mb-1" style={{ color: txPrimary }}>Create Account</h1>
                      <p className="text-[12px]" style={{ color: txMuted }}>Join The Dating App today</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4 text-[12px]">
                      <div className="space-y-1">
                        <Label htmlFor="signup-email" className="text-[11px] font-medium" style={{ color: labelColor }}>Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="youremail@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={(e) => { setIsEmailFocused(true); (e.currentTarget.style.borderColor = inputFocus); }}
                          onBlur={(e) => { setIsEmailFocused(false); (e.currentTarget.style.borderColor = inputBorder); }}
                          className="h-10 rounded-lg text-[12px]"
                          style={{ background: inputBg, borderColor: inputBorder, color: txPrimary } as any}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="signup-password" className="text-[11px] font-medium" style={{ color: labelColor }}>Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 rounded-lg text-[12px] pr-9"
                            style={{ background: inputBg, borderColor: inputBorder, color: txPrimary } as any}
                            onFocus={(e) => (e.currentTarget.style.borderColor = inputFocus)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors"
                            style={{ color: eyeIconCl }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconHover)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconCl)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="confirm-password" className="text-[11px] font-medium" style={{ color: labelColor }}>Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="h-10 rounded-lg text-[12px] pr-9"
                            style={{ background: inputBg, borderColor: inputBorder, color: txPrimary } as any}
                            onFocus={(e) => (e.currentTarget.style.borderColor = inputFocus)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors"
                            style={{ color: eyeIconCl }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconHover)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconCl)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Consent checkboxes */}
                      <div className="space-y-3 pt-1">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input type="checkbox" checked={ageConfirmed} onChange={(e) => setAgeConfirmed(e.target.checked)} className="sr-only" />
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                              style={ageConfirmed ? { background: checkColor, borderColor: checkColor } : { background: "transparent", borderColor: isDark ? "rgba(249,115,22,0.3)" : "#d1d5db" }}
                              onMouseEnter={(e) => { if (!ageConfirmed) (e.currentTarget as HTMLElement).style.borderColor = checkHoverBdr; }}
                              onMouseLeave={(e) => { if (!ageConfirmed) (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(249,115,22,0.3)" : "#d1d5db"; }}
                            >
                              {ageConfirmed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                          <span className="text-[11px] leading-relaxed" style={{ color: txBody }}>
                            I confirm that I am <strong style={{ color: isDark ? "#f0e8de" : "#374151" }}>18 years of age or older</strong>
                          </span>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative mt-0.5 flex-shrink-0">
                            <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="sr-only" />
                            <div
                              className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                              style={agreedToTerms ? { background: checkColor, borderColor: checkColor } : { background: "transparent", borderColor: isDark ? "rgba(249,115,22,0.3)" : "#d1d5db" }}
                              onMouseEnter={(e) => { if (!agreedToTerms) (e.currentTarget as HTMLElement).style.borderColor = checkHoverBdr; }}
                              onMouseLeave={(e) => { if (!agreedToTerms) (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(249,115,22,0.3)" : "#d1d5db"; }}
                            >
                              {agreedToTerms && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                          <span className="text-[11px] leading-relaxed" style={{ color: txBody }}>
                            I agree to the{" "}
                            <button type="button" onClick={() => setLegalModal("terms")} className="font-medium hover:underline bg-transparent border-none cursor-pointer" style={{ color: linkColor }}>Terms of Service</button>
                            {" "}and{" "}
                            <button type="button" onClick={() => setLegalModal("privacy")} className="font-medium hover:underline bg-transparent border-none cursor-pointer" style={{ color: linkColor }}>Privacy Policy</button>
                          </span>
                        </label>
                      </div>

                      {errorMsg && <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>}

                      <Button
                        type="submit"
                        className="w-full h-10 mt-1 rounded-lg text-white text-[12px] font-semibold hover:opacity-90 disabled:opacity-50 border-none"
                        style={{ background: ctaGradient, boxShadow: ctaShadow }}
                        disabled={loading || !ageConfirmed || !agreedToTerms}
                      >
                        {loading ? "Creating account..." : "Sign Up"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-colors"
                        style={{ background: googleBg, borderColor: googleBorder, color: txBody }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = googleHover)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = googleBg)}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </form>

                    <p className="text-center text-[11px] mt-6" style={{ color: txMuted }}>
                      Already have an account?{" "}
                      <button onClick={() => setView("login")} className="font-medium hover:underline bg-transparent border-none cursor-pointer" style={{ color: linkColor }}>
                        Log in
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ──────── LOGIN — two-column with character panel ──────── */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full grid lg:grid-cols-2"
            >
              {/* Left — character panel */}
              <div
                className="hidden lg:flex flex-col items-center justify-center relative"
                style={{ background: charPanelBg, minHeight: "calc(100vh - 64px)", overflow: "visible" }}
              >
                <div className="absolute inset-0 pointer-events-none" style={{ background: charPanelGlow }} />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <CharacterPanel isTyping={characterIsTyping} password={password} showPassword={showPassword} isDark={isDark} />
                  <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: charLabelColor }}>
                    They're watching you type
                  </p>
                </div>
              </div>

              {/* Right — login form */}
              <div
                className="flex items-center justify-center px-4 py-12"
                style={{ minHeight: "calc(100vh - 64px)" }}
              >
                <div className="w-full max-w-sm">
                  <div
                    className="rounded-[28px]"
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: cardShadow, overflow: "hidden" }}
                  >
                    {/* Mobile character strip — inside card at top */}
                    <div
                      className="lg:hidden flex items-end justify-center"
                      style={{
                        background: charPanelBg,
                        height: 180,
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div className="absolute inset-0 pointer-events-none" style={{ background: charPanelGlow }} />
                      <div className="relative z-10" style={{ transform: "scale(0.72)", transformOrigin: "bottom center" }}>
                        <CharacterPanel isTyping={characterIsTyping} password={password} showPassword={showPassword} isDark={isDark} />
                      </div>
                    </div>
                    <div className="px-10 py-10">
                    <div className="text-center mb-7">
                      <h1 className="text-[18px] font-semibold mb-1" style={{ color: txPrimary }}>The Dating App</h1>
                      <p className="text-[13px]" style={{ color: txMuted }}>Login</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 text-[12px]">
                      <div className="space-y-1">
                        <Label htmlFor="email" className="text-[11px] font-medium" style={{ color: labelColor }}>Email / Username</Label>
                        <Input
                          id="email"
                          type="text"
                          placeholder="youremail@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={(e) => { setIsEmailFocused(true); (e.currentTarget.style.borderColor = inputFocus); }}
                          onBlur={(e) => { setIsEmailFocused(false); (e.currentTarget.style.borderColor = inputBorder); }}
                          className="h-10 rounded-lg text-[12px]"
                          style={{ background: inputBg, borderColor: inputBorder, color: txPrimary } as any}
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="password" className="text-[11px] font-medium" style={{ color: labelColor }}>Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 rounded-lg text-[12px] pr-9"
                            style={{ background: inputBg, borderColor: inputBorder, color: txPrimary } as any}
                            onFocus={(e) => (e.currentTarget.style.borderColor = inputFocus)}
                            onBlur={(e) => (e.currentTarget.style.borderColor = inputBorder)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer transition-colors"
                            style={{ color: eyeIconCl }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconHover)}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = eyeIconCl)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setView("forgot-password")}
                          className="text-[11px] font-medium hover:underline bg-transparent border-none cursor-pointer"
                          style={{ color: linkColor }}
                        >
                          Forgot password?
                        </button>
                      </div>

                      {errorMsg && <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>}

                      <Button
                        type="submit"
                        className="w-full h-10 mt-1 rounded-lg text-white text-[12px] font-semibold hover:opacity-90 border-none"
                        style={{ background: ctaGradient, boxShadow: ctaShadow }}
                        disabled={loading}
                      >
                        {loading ? "Logging in..." : "Login"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 rounded-lg text-[12px] font-semibold flex items-center justify-center transition-colors"
                        style={{ background: googleBg, borderColor: googleBorder, color: txBody }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = googleHover)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = googleBg)}
                        onClick={handleGoogleLogin}
                        disabled={loading}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setView("signup")}
                        className="text-[11px] font-medium hover:underline bg-transparent border-none cursor-pointer"
                        style={{ color: linkColor }}
                      >
                        New user? Sign up
                      </button>
                    </div>
                    </div>{/* end px-10 py-10 */}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}