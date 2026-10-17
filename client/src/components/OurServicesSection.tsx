interface OurServicesSectionProps {
  onOpenEstimateModal: () => void;
}

export default function OurServicesSection({
  onOpenEstimateModal,
}: OurServicesSectionProps) {
  return (
    <section
      id="services"
      className="py-28 px-4 md:px-8 max-w-7xl mx-auto bg-transparent relative overflow-hidden"
    >
      {/* Top Header Row (from Screenshot 2) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-20">
        {/* Top-left small motto */}
        <div className="pt-3 max-w-xs">
          <p className="text-[11px] md:text-xs font-mono font-bold tracking-widest text-[#181614] uppercase leading-relaxed">
            DOING OUR JOB<br />
            FROM THE BOTTOM<br />
            OF OUR HEARTS
          </p>
        </div>

        {/* Monumental Headline: "OUR SERVICES" */}
        <div className="flex-1 text-left md:text-center">
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-editorial font-bold tracking-tight leading-[0.88] select-none">
            <span className="block text-[#181614]">OUR</span>
            <span className="block text-[#5B3E2B] md:ml-16">SERVICES</span>
          </h2>
        </div>

        {/* Top-right Studio Symbol */}
        <div className="hidden md:flex items-center gap-2 pt-3">
          <svg className="w-5 h-5 text-[#181614]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-display font-extrabold tracking-widest text-[#181614]">
            DEV.UN
          </span>
        </div>
      </div>

      {/* Services List with Alternating Layouts & Offset Hairline Frames */}
      <div className="space-y-28 md:space-y-36">
        {/* ─── 01: INTERIOR DESIGN ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-[#181614] tracking-tight uppercase">
                INTERIOR DESIGN
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed font-normal">
              We implement interior design for buildings of all sizes. With a competent interior design, even a small apartment can be significantly expanded, modernised and visually enlarged, giving it more usable space.
            </p>
          </div>

          {/* Right Photo with Offset Hairline Border & Floating "01" */}
          <div className="lg:col-span-7 relative">
            <div className="relative architect-frame max-w-xl ml-auto">
              <span className="absolute -top-10 right-0 font-display font-light text-5xl md:text-6xl text-[#181614]/35 select-none z-10">
                01
              </span>
              <div className="rounded-none overflow-hidden shadow-lg border border-[rgba(28,24,20,0.1)] aspect-[16/10] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&h=650&fit=crop&auto=format"
                  alt="Minimalist warm limestone bathroom with freestanding oval tub"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ─── 02: TURNKEY RENOVATION ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Photo with Offset Hairline Border & Floating "02" */}
          <div className="lg:col-span-7 order-2 lg:order-1 relative">
            <div className="relative architect-frame architect-frame-left max-w-xl mr-auto">
              <span className="absolute -top-10 left-0 font-display font-light text-5xl md:text-6xl text-[#181614]/35 select-none z-10">
                02
              </span>
              <div className="rounded-none overflow-hidden shadow-lg border border-[rgba(28,24,20,0.1)] aspect-[16/10] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&h=650&fit=crop&auto=format"
                  alt="Turnkey modern living room with warm sofa, designer lamp, and wall art"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="lg:col-span-5 order-1 lg:order-2 space-y-4 pl-0 lg:pl-8">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-[#181614] tracking-tight uppercase">
                TURNKEY RENOVATION
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed font-normal">
              A well-established system of managing all stages of work makes it possible to meet deadlines and complete the interior design without you. We visit the site, monitor the similarity between the design project and the actual situation, and control the correspondence to the colour scheme.
            </p>
          </div>
        </div>

        {/* ─── 03: SELECTION OF MATERIALS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-4 pr-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-2xl md:text-3xl text-[#181614] tracking-tight uppercase">
                SELECTION OF MATERIALS
              </h3>
              <span className="w-8 h-px bg-[#181614]/40" />
            </div>
            <p className="text-xs md:text-sm text-[#575149] leading-relaxed font-normal">
              Choosing materials and interior items together with a specialist is a comprehensive and cost-effective service for the client. It helps you to purchase stylistically justified and functional objects that will not stand out from the overall picture of your home.
            </p>
          </div>

          {/* Right Photo with Offset Hairline Border & Floating "03" */}
          <div className="lg:col-span-7 relative">
            <div className="relative architect-frame max-w-xl ml-auto">
              <span className="absolute -top-10 right-0 font-display font-light text-5xl md:text-6xl text-[#181614]/35 select-none z-10">
                03
              </span>
              <div className="rounded-none overflow-hidden shadow-lg border border-[rgba(28,24,20,0.1)] aspect-[16/10] bg-white">
                <img
                  src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&h=650&fit=crop&auto=format"
                  alt="Architectural material selection with fabric swatches, color palette, and blueprint"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Distinctive Angled Gold Button (Matching Screenshot 2) */}
      <div className="mt-16 pt-8">
        <button
          onClick={onOpenEstimateModal}
          className="btn-angled-estimate py-4 px-8 md:px-10 font-display font-bold text-xs md:text-sm tracking-wider uppercase inline-flex items-center gap-3 shadow-md group cursor-pointer"
        >
          <span>CALCULATE THE ESTIMATE</span>
          <span className="text-base group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
            ↗
          </span>
        </button>
      </div>
    </section>
  );
}
