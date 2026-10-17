import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SthavyaBrandLogo from "../components/SthavyaBrandLogo";
import { register } from "../services/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 10-digit Indian mobile regex: starts with 6-9 followed by 9 digits
  const indianMobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required.";
        if (value.trim().length < 2) return "Name must be at least 2 characters.";
        return "";
      case "mobile": {
        const clean = value.replace(/\D/g, "");
        if (!clean) return "Mobile number is required.";
        if (clean.length !== 10) return "Mobile number must be exactly 10 digits.";
        if (!indianMobileRegex.test(clean)) return "Enter a valid Indian mobile number (starts with 6, 7, 8, or 9).";
        return "";
      }
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters long.";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== formData.password) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "mobile") {
      // Only keep digits, max 10
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    // Real-time inline error clearing
    const err = validateField(name, formattedValue);
    setErrors((prev) => ({ ...prev, [name]: err }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key as keyof typeof formData]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
      });

      // Show success toast and redirect to /login (do NOT auto-login)
      setSuccessToast("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Account created successfully. Please log in with your email or mobile.",
            emailOrMobile: formData.email || formData.mobile,
          },
        });
      }, 1500);
    } catch (err: any) {
      setServerError(err.message || "Failed to create account. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-[#B88555] selection:text-white">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-6 z-50 px-6 py-3 rounded-2xl bg-emerald-900 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-emerald-400/30 animate-bounce">
          <span>✓</span>
          <span>{successToast}</span>
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
            Create Your Account
          </h2>
          <p className="text-xs text-[#7A7268] font-sans">
            Start designing your 1–4 BHK architectural blueprint
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Deepika Reddy"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
                errors.name
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white"
              }`}
            />
            {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730] mb-1">
              Mobile Number (10-Digit Indian) *
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#D5CDBC] bg-[#EFECE6] text-xs font-mono text-[#575149] font-semibold">
                +91
              </span>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                placeholder="9876543210"
                className={`w-full px-4 py-3 rounded-r-xl border text-sm font-mono focus:outline-none transition-all ${
                  errors.mobile
                    ? "border-red-400 bg-red-50/30 focus:border-red-500"
                    : "border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white"
                }`}
              />
            </div>
            {errors.mobile && <p className="text-[11px] text-red-600 mt-1">{errors.mobile}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="deepika@example.com"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
                errors.email
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white"
              }`}
            />
            {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
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
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
                errors.password
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white"
              }`}
            />
            {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#3D3730] mb-1">
              Confirm Password *
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={`w-full px-4 py-3 rounded-xl border text-sm font-sans focus:outline-none transition-all ${
                errors.confirmPassword
                  ? "border-red-400 bg-red-50/30 focus:border-red-500"
                  : "border-[#D5CDBC] bg-[#FAF8F5] focus:border-[#B88555] focus:bg-white"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit CTA */}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account ➔</span>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#181614]/10">
          <p className="text-xs text-[#7A7268]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#B88555] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
