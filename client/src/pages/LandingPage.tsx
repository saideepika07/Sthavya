import { Link } from "react-router-dom";
import SthavyaBrandLogo from "../components/SthavyaBrandLogo";
import { useState } from "react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: "📐",
      title: "1–4 BHK Custom Generator",
      desc: "Tailored to your exact plot dimensions (width × depth) with multi-floor options from G to G+2.",
    },
    {
      icon: "🚿",
      title: "100% En-Suite Washrooms",
      desc: "Zero compromise privacy. Every bedroom features an attached washroom with smart plumbing stacks.",
    },
    {
      icon: "🏛",
      title: "2D Blueprint + 3D Dollhouse",
      desc: "Toggle between high-precision CAD line vectors and immersive 3D isometric cutaways.",
    },
    {
      icon: "⚡",
      title: "AI Floor Plan Audit",
      desc: "Instant analysis of spatial circulation, cross-ventilation, natural daylight, and Vastu alignment.",
    },
    {
      icon: "📊",
      title: "Cost & Timeline Forecasts",
      desc: "Itemized material estimates from ₹15 Lakhs to ₹1.5+ Crore with realistic milestone schedules.",
    },
    {
      icon: "👷",
      title: "Verified Workforce Network",
      desc: "Instant access to pre-screened licensed architects, structural engineers, electricians, carpenters, and plumbers.",
    },
    {
      icon: "📄",
      title: "A3 Vector CAD & PDF Export",
      desc: "Download publication-ready A3 landscape blueprints in sharp vector PDF, PNG, and SVG formats.",
    },
    {
      icon: "🤝",
      title: "Real-Time Collaboration",
      desc: "Share blueprint links with your spouse, architect, or contractor with live multi-user cursors.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Register Your Profile",
      desc: "Sign up in 30 seconds with your email and mobile number. Instant access to your private planning workspace.",
    },
    {
      number: "02",
      title: "Share Your Requirements",
      desc: "Enter your plot dimensions, facing direction, BHK preference, budget range, and lifestyle desires.",
    },
    {
      number: "03",
      title: "Get Your AI Blueprint",
      desc: "Our architectural intelligence generates dimensionally accurate 2D CAD layouts and 3D cutaways in seconds.",
    },
    {
      number: "04",
      title: "Download & Hire",
      desc: "Export your vector A3 PDF specification sheet and book consultations with verified regional builders.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] selection:bg-[#B88555] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ─── Sticky Navbar ─── */}
      <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[rgba(24,22,20,0.08)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center group">
            <SthavyaBrandLogo size="md" showTagline={true} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide text-[#3D3730]">
            <a href="#about" className="hover:text-[#B88555] transition-colors">
              About
            </a>
            <a href="#features" className="hover:text-[#B88555] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#B88555] transition-colors">
              How It Works
            </a>
            <Link
              to="/login"
              className="text-[#181614] hover:text-[#B88555] font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 rounded-full bg-[#181614] hover:bg-[#B88555] text-white text-xs uppercase tracking-widest font-bold shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-wider text-[#181614] px-3 py-1.5"
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#EFECE6] text-[#181614]"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FAF8F5] border-b border-[rgba(24,22,20,0.1)] px-4 py-4 space-y-3">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[#181614] py-1"
            >
              About STHAVYA
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[#181614] py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-[#181614] py-1"
            >
              How It Works
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#181614] text-white text-xs uppercase tracking-widest font-bold"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#EAE5DC] border border-[#D5CDBC] text-[#8C6239] text-xs font-mono uppercase tracking-widest font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#B88555] animate-ping" />
              <span>Next-Gen Architectural AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#181614] leading-[1.12] tracking-tight">
              Your Vision,{" "}
              <span className="italic font-serif font-light text-[#B88555]">
                Built to Belong.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-[#575149] max-w-2xl leading-relaxed font-sans">
              STHAVYA transforms your plot dimensions, budget, and lifestyle requirements into intelligent 1–4 BHK architectural floor plans, high-fidelity 3D views, itemized cost estimates, and verified builder networks.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-full bg-[#181614] hover:bg-[#B88555] text-white font-bold text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5"
              >
                Get Started Free ➔
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-full bg-white hover:bg-[#EFECE6] text-[#181614] font-bold text-sm uppercase tracking-widest border border-[#181614]/15 shadow-sm transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-[#181614]/10 max-w-lg">
              <div>
                <p className="font-serif font-bold text-2xl text-[#181614]">100%</p>
                <p className="text-xs text-[#7A7268] font-mono uppercase">En-Suite Washrooms</p>
              </div>
              <div>
                <p className="font-serif font-bold text-2xl text-[#181614]">A3 CAD</p>
                <p className="text-xs text-[#7A7268] font-mono uppercase">Sharp Vector PDF</p>
              </div>
              <div>
                <p className="font-serif font-bold text-2xl text-[#181614]">Vastu</p>
                <p className="text-xs text-[#7A7268] font-mono uppercase">Spatial AI Audits</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl p-6 bg-[#FAF8F5] border border-[#181614]/12 shadow-2xl overflow-hidden group">
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-[#181614] text-[#EFECE6] text-[10px] font-mono tracking-widest uppercase">
                Interactive Preview
              </div>

              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#181614] relative mb-5 flex items-center justify-center p-6 border border-white/10">
                <img
                  src="/sthavya-logo.png"
                  alt="STHAVYA"
                  className="w-32 h-32 object-contain filter drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <p className="text-white text-xs font-mono font-bold">STHAVYA ARCHITECTURAL CAD ENGINE</p>
                  <p className="text-[#C9A675] text-[10px] uppercase font-mono tracking-wider">
                    YOUR VISION, BUILT TO BELONG
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#7A7268]">SPECIFICATION:</span>
                  <span className="font-bold text-[#181614]">3 BHK East-Facing Villa</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#7A7268]">DIMENSIONS:</span>
                  <span className="font-bold text-[#181614]">30' × 45' (1,350 Sq Ft)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#7A7268]">CIRCULATION SCORE:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">98/100 Optimal</span>
                </div>
                <Link
                  to="/register"
                  className="block text-center w-full py-3 mt-2 rounded-xl bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Generate Blueprint For Your Plot ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── About STHAVYA Section ─── */}
      <section id="about" className="py-24 bg-[#FAF8F5] border-y border-[rgba(24,22,20,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#B88555]">
              About STHAVYA
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#181614]">
              Where Architecture Meets Spatial Intelligence
            </h2>
            <p className="text-[#575149] text-base sm:text-lg leading-relaxed">
              STHAVYA is an AI-powered residential planning platform that bridges the gap between raw land parcels and build-ready architectural blueprints. We turn your plot dimensions, family composition, and financial budget into optimized 1–4 BHK floor plans, immersive 3D dollhouses, milestone cost projections, and direct connections to verified regional professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F6F3ED] p-8 rounded-2xl border border-[#181614]/8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#181614] text-white flex items-center justify-center text-xl mb-4">
                📐
              </div>
              <h3 className="font-serif font-bold text-xl text-[#181614]">Precision Plot Geometry</h3>
              <p className="text-sm text-[#575149] leading-relaxed">
                Enter your exact plot boundary, setback rules, and road facing direction. STHAVYA generates compliant setbacks, optimal door swings, and window daylight ratios.
              </p>
            </div>

            <div className="bg-[#F6F3ED] p-8 rounded-2xl border border-[#181614]/8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#B88555] text-white flex items-center justify-center text-xl mb-4">
                🔒
              </div>
              <h3 className="font-serif font-bold text-xl text-[#181614]">Attached Privacy Standard</h3>
              <p className="text-sm text-[#575149] leading-relaxed">
                Every bedroom in STHAVYA layouts includes dedicated en-suite washroom access. No awkward shared corridors or compromised family privacy.
              </p>
            </div>

            <div className="bg-[#F6F3ED] p-8 rounded-2xl border border-[#181614]/8 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#181614] text-white flex items-center justify-center text-xl mb-4">
                💼
              </div>
              <h3 className="font-serif font-bold text-xl text-[#181614]">Verified Workforce</h3>
              <p className="text-sm text-[#575149] leading-relaxed">
                Connect directly with licensed architects, certified structural consultants, electricians, plumbers, and carpenters to execute your approved floor plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <p className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#B88555]">
            Engineering Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181614]">
            Everything Needed from Concept to Foundation
          </h2>
          <p className="text-sm sm:text-base text-[#575149]">
            Comprehensive spatial tools designed for homeowners, developers, and architects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-[#181614]/10 hover:border-[#B88555]/50 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-serif font-bold text-lg text-[#181614] group-hover:text-[#B88555] transition-colors mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-[#575149] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works Section ─── */}
      <section id="how-it-works" className="py-24 bg-[#FAF8F5] border-t border-[rgba(24,22,20,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-[#B88555]">
              Seamless Workflow
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#181614]">
              How STHAVYA Works in 4 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative bg-[#F6F3ED] p-7 rounded-2xl border border-[#181614]/10 space-y-3"
              >
                <div className="text-3xl font-mono font-bold text-[#B88555]">
                  {s.number}
                </div>
                <h3 className="font-serif font-bold text-xl text-[#181614]">{s.title}</h3>
                <p className="text-xs text-[#575149] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#181614] hover:bg-[#B88555] text-white font-bold text-xs uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
            >
              <span>Start Planning Your Home Today</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#181614] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <SthavyaBrandLogo size="lg" theme="light" showTagline={true} />
            <p className="text-xs text-white/60 max-w-sm font-sans leading-relaxed pt-2">
              Next-generation spatial planning intelligence. Empowering homeowners and architects to transform plot dimensions into high-precision vector CAD blueprints and build-ready specifications.
            </p>
            <div className="pt-2 text-xs font-mono text-[#C9A675]">
              Contact Concierge: <a href="mailto:concierge@sthavya.com" className="underline hover:text-white">concierge@sthavya.com</a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A675]">
              Platform
            </p>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link to="/plan/new" className="hover:text-white transition-colors">Requirements Wizard</Link></li>
              <li><a href="#features" className="hover:text-white transition-colors">Features &amp; Tech Specs</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Client Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#C9A675]">
              STHAVYA Guarantee
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Every blueprint generated on STHAVYA complies with structural spatial setback standards, private en-suite bathroom provisions, and vector CAD accuracy.
            </p>
            <div className="pt-3 border-t border-white/10 text-[11px] font-mono text-white/40">
              © {new Date().getFullYear()} STHAVYA. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
