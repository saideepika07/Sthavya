import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import SthavyaBrandLogo from "../components/SthavyaBrandLogo";
import { signIn } from "../services/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (location.state?.message) {
      setInfoMessage(location.state.message);
    }
    if (location.state?.emailOrMobile) {
      setIdentifier(location.state.emailOrMobile);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email address or 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn({
        identifier: identifier.trim(),
        password,
        rememberMe,
      });

      // Redirect to /dashboard after successful login
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "Invalid email/mobile or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-[#B88555] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#181614] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          <span>ℹ</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
          <SthavyaBrandLogo size="lg" vertical={true} showTagline={true} />
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-[#181614]/10 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-serif font-bold text-[#181614]">
            Welcome Back
          </h2>
          <p className="text-xs text-[#7A7268] font-sans">
            Sign in to access your saved architectural blueprints
          </p>
        </div>

        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <span>✓</span>
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Identifier: Email or Mobile */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730] mb-1">
              Email or Mobile Number *
            </label>
            <input
              type="text"
              name="identifier"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setError(null);
              }}
              placeholder="name@example.com or 9876543210"
              className="w-full px-4 py-3 rounded-xl border border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white text-sm font-sans focus:outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730]">
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-mono text-[#B88555] hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white text-sm font-sans focus:outline-none transition-all"
            />
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#B88555] focus:ring-[#B88555]"
              />
              <span className="text-xs text-[#575149]">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => showToast("Password reset coming soon")}
              className="text-xs text-[#B88555] hover:underline focus:outline-none focus:ring-1 focus:ring-[#B88555] rounded transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl bg-[#181614] hover:bg-[#B88555] text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In ➔</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#181614]/10">
          <p className="text-xs text-[#7A7268]">
            Don't have an account yet?{" "}
            <Link to="/register" className="font-bold text-[#B88555] hover:underline">
              Get Started Free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
