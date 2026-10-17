import { useState, useId } from "react";
import { signInWithContactDetails, signInWithGoogle, type SthavyaUser } from "../services/auth";
import { authApi } from "../services/api";

interface LoginPageProps {
  onLoginSuccess: (user: SthavyaUser) => void;
  onNavigateToConsultation: () => void;
  onBackToHome: () => void;
  initialPhone?: string;
  initialEmail?: string;
  initialName?: string;
}

const COUNTRY_CODES = [
  { code: "+91", country: "IN", label: "India (+91)" },
  { code: "+1", country: "US", label: "US / Canada (+1)" },
  { code: "+44", country: "UK", label: "United Kingdom (+44)" },
  { code: "+971", country: "AE", label: "UAE / Dubai (+971)" },
  { code: "+65", country: "SG", label: "Singapore (+65)" },
  { code: "+61", country: "AU", label: "Australia (+61)" },
];

export default function LoginPage({
  onLoginSuccess,
  onNavigateToConsultation,
  onBackToHome,
  initialPhone = "",
  initialEmail = "",
  initialName = "",
}: LoginPageProps) {
  const [name, setName] = useState(initialName);
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState(initialEmail);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [verificationMode, setVerificationMode] = useState<"instant" | "otp">("instant");
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [demoOtp, setDemoOtp] = useState("2026");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<SthavyaUser | null>(null);

  const nameId = useId();
  const phoneId = useId();
  const emailId = useId();

  // Validate form
  const isFormValid =
    name.trim().length >= 2 &&
    email.includes("@") &&
    email.includes(".") &&
    phone.replace(/\D/g, "").length >= 7 &&
    agreeTerms;

  const handleInstantLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isFormValid) {
      setError("Please fill in your valid contact details, name, and email address.");
      return;
    }

    setLoading(true);
    setError(null);

    const fullContact = `${countryCode} ${phone.trim()}`;

    try {
      // 1. Sign in via pure MERN JWT auth service
      const user = await signInWithContactDetails(name.trim(), email.trim(), fullContact);

      // 2. Sync / ensure profile on backend API
      try {
        await authApi.register({
          name: user.name || name.trim(),
          email: user.email || email.trim(),
          phone: fullContact,
          role: "client",
        });
      } catch {
        // Already registered / active session
      }

      setAuthenticatedUser(user);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify your contact details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please provide your name, valid email, and contact phone number first.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const generated = Math.floor(1000 + Math.random() * 9000).toString();
      setDemoOtp(generated);
      setOtpSent(true);
      setLoading(false);
    }, 700);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.trim() !== demoOtp && otpValue.trim() !== "2026") {
      setError(`Invalid verification code. (Hint: use demo code ${demoOtp})`);
      return;
    }
    await handleInstantLogin();
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      try {
        await authApi.register({
          name: user.name || "STHAVYA Client",
          email: user.email || "client@sthavya.example",
          role: "client",
        });
      } catch {}
      setAuthenticatedUser(user);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] flex flex-col justify-between selection:bg-[#B88555]/20 selection:text-[#181614]">
      {/* Top Header */}
      <header className="w-full px-6 py-5 border-b border-[rgba(28,24,20,0.08)] bg-[#FAF8F5]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2.5 group text-left transition-transform hover:scale-[1.01]"
          >
            <span className="w-8 h-8 rounded-xl bg-[#181614] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#B88555] transition-colors">
              ✦
            </span>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-[#181614] block leading-none">
                STHAVYA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-[#8E867B] font-semibold">
                Spaces &amp; Planning
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-[#575149] hover:text-[#181614] px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors"
            >
              ← Back to Overview
            </button>
            <button
              onClick={onNavigateToConsultation}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#28362B] text-white px-4 py-2 rounded-full hover:bg-[#1C261E] transition-all shadow-xs"
            >
              <span>Work Consultation</span>
              <span className="text-amber-300">↗</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-10 lg:py-16 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Architectural Editorial Brand Showcase */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE6] border border-[rgba(28,24,20,0.1)] text-xs font-mono text-[#B88555] font-semibold tracking-wide">
              <span>✦</span>
              <span>PRIVATE CLIENT ACCESS</span>
              <span className="text-[10px] text-[#8E867B]">• VERIFIED ENTRY</span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight text-[#181614] leading-[1.12]">
              Access Your Architectural &amp; Space Planning Studio.
            </h1>

            <p className="text-base text-[#575149] leading-relaxed max-w-xl font-normal">
              Log in with your contact details, full name, and email address to unlock verified in-house craftsmen day rates, instant 2D floor plan solvers, and custom budget consultation scheduling.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/70 border border-[rgba(28,24,20,0.08)] shadow-xs hover:border-[#B88555]/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#28362B]/10 text-[#28362B] flex items-center justify-center font-bold mb-2.5">
                  📐
                </div>
                <h2 className="font-display font-bold text-sm text-[#181614] mb-1">
                  Budget &amp; Timeline Engine
                </h2>
                <p className="text-xs text-[#575149] leading-relaxed">
                  Tailor your project by exact budget (₹ Lakhs) and desired number of days with live cost breakdowns.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/70 border border-[rgba(28,24,20,0.08)] shadow-xs hover:border-[#B88555]/40 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#B88555]/10 text-[#B88555] flex items-center justify-center font-bold mb-2.5">
                  🔨
                </div>
                <h2 className="font-display font-bold text-sm text-[#181614] mb-1">
                  Direct In-House Trades
                </h2>
                <p className="text-xs text-[#575149] leading-relaxed">
                  Zero commission markups. Lock Julian Vance, Elena Rostova, and certified master joiners by daily rate.
                </p>
              </div>
            </div>

            {/* Trust Metrics Bar */}
            <div className="p-4 rounded-2xl bg-[#EFECE6]/80 border border-[rgba(28,24,20,0.08)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#FAF8F5] object-cover"
                    src="https://images.unsplash.com/photo-1547609434-b732edfee020?w=100&h=100&fit=crop"
                    alt="Master Joiner"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#FAF8F5] object-cover"
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop"
                    alt="Senior Architect"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-[#FAF8F5] object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                    alt="Turnkey Lead"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#181614]">1,420+ Projects Completed</p>
                  <p className="text-[11px] text-[#575149]">Bangalore • Mumbai • Hyderabad • NCR</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#B88555] block">4.98 / 5.0</span>
                <span className="text-[10px] text-[#8E867B] uppercase tracking-wider">Client Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-lg bg-[#FAF8F5] border border-[rgba(28,24,20,0.12)] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Subtle architectural gradient banner */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#28362B] via-[#B88555] to-[#C59B67]" />

              {/* Logged in state view */}
              {authenticatedUser ? (
                <div className="py-6 space-y-6 text-center animate-fadeIn">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold tracking-wider uppercase mb-2">
                      Authentication Successful
                    </span>
                    <h2 className="font-display font-bold text-2xl text-[#181614]">
                      Welcome, {authenticatedUser.displayName || "Valued Client"}!
                    </h2>
                    <p className="text-xs text-[#575149] mt-1 max-w-xs mx-auto">
                      Your client session is active. You can now configure your customized work consultation based on your budget and timeline.
                    </p>
                  </div>

                  {/* Summary Profile Pill */}
                  <div className="p-4 rounded-2xl bg-[#EFECE6] border border-[rgba(28,24,20,0.08)] text-left text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Client Name:</span>
                      <span className="font-semibold text-[#181614]">{authenticatedUser.displayName}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-[rgba(28,24,20,0.06)]">
                      <span className="text-[#8E867B]">Contact Number:</span>
                      <span className="font-mono font-semibold text-[#181614]">{authenticatedUser.phoneNumber || "Verified Phone"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8E867B]">Email Address:</span>
                      <span className="font-semibold text-[#181614]">{authenticatedUser.email}</span>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={onNavigateToConsultation}
                      className="w-full py-4 px-6 rounded-2xl bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                      <span>Proceed to Work Consultation (Set Budget &amp; Days)</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>

                    <button
                      onClick={onBackToHome}
                      className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-[#EFECE6] text-[#181614] border border-[rgba(28,24,20,0.12)] font-semibold text-xs transition-colors"
                    >
                      Explore 2D House Planner &amp; AI Studio
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Login Form */
                <div className="space-y-6">
                  {/* Card Title & Mode Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-display font-bold text-2xl text-[#181614]">
                        Client Login
                      </h2>
                      <span className="text-[10px] font-mono uppercase bg-[#EFECE6] text-[#B88555] px-2.5 py-1 rounded-full font-bold">
                        Secure SSL 256-bit
                      </span>
                    </div>
                    <p className="text-xs text-[#575149]">
                      Enter your contact details, name, and email address to log in to Sthavya. Your Vision, Built to Belong.
                    </p>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 p-1 bg-[#EFECE6] rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setVerificationMode("instant");
                        setOtpSent(false);
                      }}
                      className={`py-2 px-3 rounded-lg transition-all ${
                        verificationMode === "instant"
                          ? "bg-white text-[#181614] shadow-xs"
                          : "text-[#8E867B] hover:text-[#181614]"
                      }`}
                    >
                      ⚡ Instant Access
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationMode("otp")}
                      className={`py-2 px-3 rounded-lg transition-all ${
                        verificationMode === "otp"
                          ? "bg-white text-[#181614] shadow-xs"
                          : "text-[#8E867B] hover:text-[#181614]"
                      }`}
                    >
                      📱 SMS / WhatsApp OTP
                    </button>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                      <span className="text-sm">⚠️</span>
                      <div className="flex-1">{error}</div>
                    </div>
                  )}

                  {/* Main Form Fields */}
                  {!otpSent ? (
                    <form
                      onSubmit={verificationMode === "instant" ? handleInstantLogin : handleRequestOtp}
                      className="space-y-4"
                    >
                      {/* Full Name Input */}
                      <div>
                        <label
                          htmlFor={nameId}
                          className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5"
                        >
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id={nameId}
                            type="text"
                            required
                            placeholder="e.g. Deepika Reddy"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-4 py-3 text-sm text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555] focus:ring-2 focus:ring-[#B88555]/15 transition-all"
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8E867B] pointer-events-none">
                            👤
                          </div>
                        </div>
                      </div>

                      {/* Contact Details (Phone & Country Code) */}
                      <div>
                        <label
                          htmlFor={phoneId}
                          className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5"
                        >
                          Contact Details (Phone / WhatsApp) <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-2.5 py-3 text-xs font-semibold text-[#181614] focus:outline-none focus:border-[#B88555]"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code} ({c.country})
                              </option>
                            ))}
                          </select>
                          <div className="relative flex-1">
                            <input
                              id={phoneId}
                              type="tel"
                              required
                              placeholder="98765 43210"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-4 py-3 text-sm text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555] focus:ring-2 focus:ring-[#B88555]/15 transition-all font-mono"
                            />
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8E867B] pointer-events-none">
                              📞
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#8E867B] mt-1">
                          We use this contact number to send instant project estimates and architect assignment alerts.
                        </p>
                      </div>

                      {/* Email Address Input */}
                      <div>
                        <label
                          htmlFor={emailId}
                          className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5"
                        >
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id={emailId}
                            type="email"
                            required
                            placeholder="deepika@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-4 py-3 text-sm text-[#181614] placeholder-[#8E867B]/70 focus:outline-none focus:border-[#B88555] focus:ring-2 focus:ring-[#B88555]/15 transition-all"
                          />
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8E867B] pointer-events-none">
                            ✉️
                          </div>
                        </div>
                      </div>

                      {/* Terms & Privacy checkbox */}
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          id="terms-checkbox"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-[rgba(28,24,20,0.2)] text-[#B88555] focus:ring-[#B88555]"
                        />
                        <label htmlFor="terms-checkbox" className="text-[11px] text-[#575149] leading-tight select-none">
                          I agree to receive architectural consultation updates, floor plans, and verified artisan assignments.
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        className="w-full py-4 px-6 rounded-2xl bg-[#181614] hover:bg-[#28362B] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Authenticating Client...</span>
                          </span>
                        ) : verificationMode === "instant" ? (
                          <>
                            <span>Log In to Sthavya</span>
                            <span className="group-hover:translate-x-1 transition-transform">↗</span>
                          </>
                        ) : (
                          <>
                            <span>Send 4-Digit Verification Code</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification Step */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                        <p className="font-semibold mb-0.5">Verification Code Sent!</p>
                        <p>
                          We sent a 4-digit code to <strong>{countryCode} {phone}</strong> and <strong>{email}</strong>.
                        </p>
                        <p className="mt-1 text-[11px] font-mono text-amber-800">
                          (Demo code: <strong>{demoOtp}</strong>)
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#575149] uppercase tracking-wider mb-1.5">
                          Enter 4-Digit Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            required
                            placeholder={demoOtp}
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-[#181614] focus:outline-none focus:border-[#B88555] focus:ring-2 focus:ring-[#B88555]/15"
                          />
                          <button
                            type="button"
                            onClick={() => setOtpValue(demoOtp)}
                            className="px-3 py-2 bg-[#EFECE6] hover:bg-[#E4DFD6] rounded-xl text-xs font-mono font-bold text-[#181614] whitespace-nowrap"
                          >
                            Auto-fill
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="flex-1 py-3 rounded-xl bg-[#EFECE6] text-[#575149] hover:text-[#181614] text-xs font-semibold"
                        >
                          ← Change Details
                        </button>
                        <button
                          type="submit"
                          disabled={loading || otpValue.length < 4}
                          className="flex-1 py-3 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                        >
                          {loading ? "Verifying..." : "Verify & Enter ↗"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Alternative Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-[rgba(28,24,20,0.1)] w-full" />
                    <span className="bg-[#FAF8F5] px-3 text-[10px] uppercase font-mono tracking-widest text-[#8E867B] absolute">
                      or sign in with
                    </span>
                  </div>

                  {/* Google OAuth Option */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#181614] flex items-center justify-center gap-3 transition-colors shadow-2xs active:scale-[0.99]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Footnote */}
                  <div className="pt-2 text-center text-[11px] text-[#8E867B]">
                    <span>Need immediate architectural assistance? </span>
                    <a
                      href="tel:+918049618200"
                      className="text-[#B88555] font-semibold hover:underline"
                    >
                      Call +91 80 4961 8200
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="w-full border-t border-[rgba(28,24,20,0.08)] bg-[#FAF8F5] py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8E867B]">
          <p>© 2026 Sthavya Ltd. • Your Vision, Built to Belong. • Architectural &amp; Interior Design Studio</p>
          <div className="flex gap-4">
            <button onClick={onBackToHome} className="hover:text-[#181614]">Home</button>
            <button onClick={onNavigateToConsultation} className="hover:text-[#181614]">Work Consultation</button>
            <span>Confidential &amp; Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
