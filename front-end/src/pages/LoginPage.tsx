import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Heart, X } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpVerification from "@/components/auth/OtpVerification";
import ForgotPassword from "@/components/auth/Forgotpassword";
import ResetPasswordOTP from "@/components/auth/Resetpasswordotp";
import NewPassword from "@/components/auth/Newpassword";

type AuthView = "login" | "signup" | "otp" | "forgot-password" | "reset-otp" | "new-password";

type LoginPageProps = {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onLoginSuccess: () => void;
};

const API_BASE_URL = "http://localhost:8000/api";

export default function LoginPage({
  isLoggedIn,
  onLogout,
  onLoginSuccess,
}: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ---------------- GOOGLE REDIRECT HANDLING ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");

    if (!access || !refresh) return;

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    fetch(`${API_BASE_URL}/me/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((user) => {
        if (user?.email) {
          localStorage.setItem("user_email", user.email.toLowerCase());
        }
        window.history.replaceState({}, "", window.location.pathname);
        onLoginSuccess();
        navigate("/home");
      })
      .catch(() => {
        setErrorMsg("Google login failed. Please try again.");
      });
  }, [location.search, navigate, onLoginSuccess]);

  /* ---------------- UNIFIED LOGIN ---------------- */
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

        if (adminCheckRes.ok) {
          navigate("/admin/dashboard");
          setLoading(false);
          return;
        }

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

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (!ageConfirmed) {
      setErrorMsg("You must confirm you are 18 or older");
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const registerRes = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim(),
          password,
          agreed_to_terms: agreedToTerms,
          age_confirmed: ageConfirmed,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.detail || "Signup failed");
      }

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

  /* ---------------- RESEND OTPs ---------------- */
  const handleResendOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/login/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email.trim() }),
      });
    } catch {}
  };

  const handleResendResetOtp = async () => {
    try {
      await fetch(`${API_BASE_URL}/password/forgot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
  };

  /* ---------------- GOOGLE LOGIN ---------------- */
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

  /* ---------------- UI ---------------- */

  const LEGAL_CONTENT = {
    terms: {
      title: "Terms of Service",
      body: (
        <div className="space-y-4 text-[13px] text-[#4b5563] leading-relaxed">
          <p className="text-[#111] font-semibold">Welcome to The Dating App. By accessing our platform, you agree to these Terms.</p>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">1. Eligibility</h4>
            <p>You must be at least 18 years of age to create an account on The Dating App.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">2. Code of Conduct</h4>
            <p>You agree to treat other users with respect and not engage in harassment, bullying, or hate speech of any kind.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">3. Account Responsibility</h4>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">4. Prohibited Content</h4>
            <p>You may not post content that is illegal, offensive, misleading, or infringes on the rights of others.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">5. Termination</h4>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms at our sole discretion.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">6. Jurisdiction</h4>
            <p>These terms are governed by the laws of India. Any disputes are subject to the jurisdiction of courts in Hyderabad, Telangana.</p>
          </div>
          <p className="text-[11px] text-[#9ca3af]">Last updated: January 15, 2026</p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy Policy",
      body: (
        <div className="space-y-4 text-[13px] text-[#4b5563] leading-relaxed">
          <p className="text-[#111] font-semibold">Your privacy is at the core of The Dating App experience.</p>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">1. Information We Collect</h4>
            <p>We collect information you provide directly — such as your name, email, profile details, and messages — as well as usage data like login times and interactions.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">2. How We Use Your Data</h4>
            <p>Your data is used to provide and improve our matching service, ensure platform safety, and communicate important updates. We do not sell your personal data to third parties.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">3. Data Storage</h4>
            <p>Your data is securely stored on servers located in India, in compliance with applicable data protection regulations.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">4. Your Rights</h4>
            <p>You have the right to access, correct, or delete your personal data at any time via Settings → Privacy. You may also request a full data export.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">5. Cookies</h4>
            <p>We use cookies to remember your session and preferences. You can disable cookies in your browser settings, though this may affect functionality.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111] mb-1">6. Contact</h4>
            <p>For privacy-related questions, contact us at <span className="text-[#16a3ff]">support@thedatingapp.com</span>.</p>
          </div>
          <p className="text-[11px] text-[#9ca3af]">Last updated: January 20, 2026</p>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbff] to-[#f9fdfc]">

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
              className="bg-white rounded-[24px] shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f1f5]">
                <h2 className="text-[15px] font-semibold text-[#222]">
                  {LEGAL_CONTENT[legalModal].title}
                </h2>
                <button
                  onClick={() => setLegalModal(null)}
                  className="w-7 h-7 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Scrollable body */}
              <div className="overflow-y-auto px-6 py-5 flex-1">
                {LEGAL_CONTENT[legalModal].body}
              </div>
              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#f1f1f5]">
                <button
                  onClick={() => setLegalModal(null)}
                  className="w-full h-9 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] text-white text-[12px] font-semibold hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Bar */}
      <nav className="w-full bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-10 py-3.5">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#02b2f6] flex items-center justify-center shadow-sm">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-semibold text-[15px] leading-none text-[#222222]">
              The Dating App
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              className="rounded-full px-6 py-2 text-[12px] font-semibold text-white bg-gradient-to-r from-[#02b2f6] to-[#09cf8b] hover:opacity-90 shadow-sm"
              onClick={() => navigate("/login")}
            >
              Login / Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20 flex items-start justify-center px-4">
        <AnimatePresence mode="wait">
          {view === "otp" ? (
            <OtpVerification
              key="otp"
              email={email}
              apiBaseUrl={API_BASE_URL}
              onSuccess={() => { onLoginSuccess(); navigate("/home"); }}
              onResend={handleResendOtp}
              onBack={() => setView("login")}
            />
          ) : view === "forgot-password" ? (
            <ForgotPassword
              key="forgot-password"
              apiBaseUrl={API_BASE_URL}
              onBack={() => setView("login")}
              onOtpSent={(resetEmail) => { setEmail(resetEmail); setView("reset-otp"); }}
            />
          ) : view === "reset-otp" ? (
            <ResetPasswordOTP
              key="reset-otp"
              email={email}
              apiBaseUrl={API_BASE_URL}
              onVerified={(verifiedEmail, token) => { setEmail(verifiedEmail); setResetToken(token); setView("new-password"); }}
              onBack={() => setView("forgot-password")}
              onResend={handleResendResetOtp}
            />
          ) : view === "new-password" ? (
            <NewPassword
              key="new-password"
              email={email}
              resetToken={resetToken}
              apiBaseUrl={API_BASE_URL}
              onSuccess={() => { setView("login"); setPassword(""); setEmail(""); }}
              onBack={() => setView("reset-otp")}
            />
          ) : view === "signup" ? (
            /* ---------------- SIGNUP VIEW ---------------- */
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
                <button
                  onClick={() => setView("login")}
                  className="flex items-center gap-2 text-[11px] text-[#9ca3af] hover:text-[#4b5563] mb-6"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </button>

                <div className="text-center mb-7">
                  <h1 className="text-[18px] font-semibold text-[#222222] mb-1">Create Account</h1>
                  <p className="text-[12px] text-[#9ca3af]">Join The Dating App today</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4 text-[12px]">
                  <div className="space-y-1">
                    <Label htmlFor="signup-email" className="text-[11px] font-medium text-[#4b5563]">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="youremail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="signup-password" className="text-[11px] font-medium text-[#4b5563]">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="confirm-password" className="text-[11px] font-medium text-[#4b5563]">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Consent Checkboxes ── */}
                  <div className="space-y-3 pt-1">
                    {/* Age confirmation */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={ageConfirmed}
                          onChange={(e) => setAgeConfirmed(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            ageConfirmed
                              ? "bg-[#ff7e5f] border-[#ff7e5f]"
                              : "bg-white border-[#d1d5db] group-hover:border-[#ff9966]"
                          }`}
                        >
                          {ageConfirmed && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#6b7280] leading-relaxed">
                        I confirm that I am <strong className="text-[#374151]">18 years of age or older</strong>
                      </span>
                    </label>

                    {/* Terms + Privacy */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                            agreedToTerms
                              ? "bg-[#ff7e5f] border-[#ff7e5f]"
                              : "bg-white border-[#d1d5db] group-hover:border-[#ff9966]"
                          }`}
                        >
                          {agreedToTerms && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-[11px] text-[#6b7280] leading-relaxed">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setLegalModal("terms")}
                          className="text-[#16a3ff] hover:underline font-medium"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={() => setLegalModal("privacy")}
                          className="text-[#16a3ff] hover:underline font-medium"
                        >
                          Privacy Policy
                        </button>
                      </span>
                    </label>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)] disabled:opacity-50"
                    disabled={loading || !ageConfirmed || !agreedToTerms}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-lg bg-white border border-[#e5e7eb] text-[12px] font-semibold hover:bg-[#f9fafb] flex items-center justify-center"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </form>

                <p className="text-center text-[11px] text-[#b0b5c0] mt-6">
                  Already have an account?{" "}
                  <button onClick={() => setView("login")} className="text-[#16a3ff] hover:underline font-medium">
                    Log in
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            /* ---------------- LOGIN VIEW ---------------- */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-sm"
            >
              <div className="bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,23,42,0.08)] border border-[#f1f1f5] px-10 py-10">
                <div className="text-center mb-7">
                  <h1 className="text-[18px] font-semibold text-[#222222] mb-1">The Dating App</h1>
                  <p className="text-[13px] text-[#9ca3af]">Login</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 text-[12px]">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[11px] font-medium text-[#4b5563]">Email / Username</Label>
                    <Input
                      id="email"
                      type="text"
                      placeholder="youremail@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] focus:ring-1 focus:ring-[#ff9966]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-[11px] font-medium text-[#4b5563]">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 rounded-lg bg-[#f9fafb] border border-[#e5e7eb] text-[12px] placeholder:text-[#c4c9d3] pr-9 focus:ring-1 focus:ring-[#ff9966]"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c4c9d3] hover:text-[#6b7280]">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <button type="button" onClick={() => setView("forgot-password")} className="text-[11px] text-[#16a3ff] hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-[11px] text-center">{errorMsg}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 mt-1 rounded-lg bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-white text-[12px] font-semibold shadow-[0_8px_18px_rgba(255,126,95,0.35)]"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 rounded-lg bg-white border border-[#e5e7eb] text-[12px] font-semibold hover:bg-[#f9fafb] flex items-center justify-center"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => setView("signup")} className="text-[11px] text-[#16a3ff] hover:underline font-medium">
                    New user? Sign up
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}