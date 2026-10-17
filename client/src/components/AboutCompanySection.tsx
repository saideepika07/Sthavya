import { useEffect, useRef, useState } from "react";

function useAnimatedNumber(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(ease * target));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { val, ref };
}

export default function AboutCompanySection() {
  const stat1 = useAnimatedNumber(45);
  const stat2 = useAnimatedNumber(20);
  const stat3 = useAnimatedNumber(100);

  return (
    <section
      id="about"
      className="py-28 px-4 md:px-8 max-w-7xl mx-auto bg-transparent relative overflow-hidden"
    >
      {/* Top Header Row (from Screenshot 3) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-20">
        <div className="pt-3 max-w-xs">
          <span className="text-[11px] md:text-xs font-mono font-bold tracking-widest text-[#181614] uppercase leading-relaxed block">
            LEARN MORE<br />
            ABOUT THE<br />
            COMPANY
          </span>
        </div>

        {/* Monumental Headline: "ABOUT COMPANY" */}
        <div className="flex-1 text-left md:text-center">
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-editorial font-bold tracking-tight leading-[0.88] select-none">
            <span className="block text-[#181614]">ABOUT</span>
            <span className="block text-[#5B3E2B] md:ml-16">COMPANY</span>
          </h2>
        </div>

        {/* Top-right spacer / badge */}
        <div className="hidden md:block w-24 text-right pt-3">
          <span className="text-xs font-mono text-[#8E867B] font-bold">EST. 2021</span>
        </div>
      </div>

      {/* Main Grid: Left Framed Photo Montage + Vertical Lettering | Right Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Side: Vertical Outlined Typography & 3 Stacked Photos */}
        <div className="lg:col-span-6 flex items-stretch gap-6 relative">
          {/* Vertical Outline Lettering (as in DEV.UN Screenshot 3) */}
          <div className="flex flex-col justify-between items-center py-4 select-none">
            <span className="text-outline-light font-editorial font-bold text-4xl sm:text-5xl md:text-6xl tracking-[0.25em] writing-vertical transform rotate-180 opacity-60">
              DEV.UN
            </span>
          </div>

          {/* Hairline Architectural Box holding 3 Photos */}
          <div className="flex-1 border-l border-t border-b border-[rgba(28,24,20,0.18)] pl-6 pt-6 pb-6 space-y-6">
            {/* Photo 1: Ceramic pottery & bench */}
            <div className="overflow-hidden shadow-sm aspect-[16/10] bg-white border border-[rgba(28,24,20,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=500&fit=crop&auto=format"
                alt="Minimalist living interior with pottery and daybed"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Photo 2: Architect on laptop */}
            <div className="overflow-hidden shadow-sm aspect-[16/10] bg-white border border-[rgba(28,24,20,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=500&fit=crop&auto=format"
                alt="Architect working on blueprint CAD drawings"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Photo 3: Site craftsmen discussing plans */}
            <div className="overflow-hidden shadow-sm aspect-[16/10] bg-white border border-[rgba(28,24,20,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=500&fit=crop&auto=format"
                alt="Master contractors and architect reviewing construction plan"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Metrics (from Screenshot 3) */}
        <div className="lg:col-span-6 space-y-16 lg:space-y-24 pt-4 lg:pt-12">
          {/* Metric 01: 45+ DESIGN PROJECTS */}
          <div ref={stat1.ref} className="space-y-3 relative group">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-light text-6xl sm:text-7xl md:text-8xl text-[#181614] leading-none">
                {stat1.val}+
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xl md:text-2xl text-[#181614] uppercase tracking-tight">
                DESIGN PROJECTS
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed max-w-lg">
              prove that owners of large commercial facilities, owners of houses and apartments are willing to work with us. We are happy to provide you with samples of real projects.
            </p>
          </div>

          {/* Metric 02: 20+ EMPLOYEES */}
          <div ref={stat2.ref} className="space-y-3 relative group">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-light text-6xl sm:text-7xl md:text-8xl text-[#181614] leading-none">
                {stat2.val}+
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xl md:text-2xl text-[#181614] uppercase tracking-tight">
                EMPLOYEES
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed max-w-lg">
              are always ready to answer your questions and save you time spent on repairs and searching for interior design references.
            </p>
          </div>

          {/* Metric 03: 100+ CONTRACTORS */}
          <div ref={stat3.ref} className="space-y-3 relative group">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-light text-6xl sm:text-7xl md:text-8xl text-[#181614] leading-none">
                {stat3.val}+
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xl md:text-2xl text-[#181614] uppercase tracking-tight">
                CONTRACTORS
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed max-w-lg">
              guarantee on-time completion of assigned tasks, personal support and thorough control of interior design at all stages.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
