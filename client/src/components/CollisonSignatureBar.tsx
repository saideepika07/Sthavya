import { useState } from "react";

interface CollectionItem {
  id: string;
  num: string;
  name: string;
  category: string;
  description: string;
  materials: string[];
  dimensions: string;
  leadTime: string;
  iconSvg: (isActive: boolean) => React.ReactNode;
}

const SIGNATURE_ITEMS: CollectionItem[] = [
  {
    id: "kitchens",
    num: "01",
    name: "KITCHENS",
    category: "Culinary Monoliths",
    description: "Bespoke architectural woodwork, solid timber framing, and integrated quartzite work surfaces crafted for effortless culinary movement.",
    materials: ["Smoked European Oak", "Roman Travertine", "Brushed Bronze Patina"],
    dimensions: "Custom dimensions • Flush integrated appliances",
    leadTime: "6 - 8 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Monolith island line drawing */}
        <rect x="15" y="32" width="70" height="34" rx="1" />
        <line x1="15" y1="44" x2="85" y2="44" strokeDasharray="2 2" />
        <line x1="38" y1="44" x2="38" y2="66" />
        <line x1="62" y1="44" x2="62" y2="66" />
        {/* Vessel faucet & branches */}
        <path d="M48 32 V20 C48 16 54 16 54 20" strokeLinecap="round" />
        <ellipse cx="32" cy="24" rx="7" ry="2" />
        <path d="M72 32 C72 26 76 22 80 18" strokeLinecap="round" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    id: "seating",
    num: "02",
    name: "SEATING",
    category: "Sculptural Chairs & Stools",
    description: "Turned solid wood stools and bouclé accent chairs defined by monolithic geometry, tactile joinery, and ergonomic calm.",
    materials: ["Natural White Oak", "Belgian Bouclé", "Vegetable-Tanned Leather"],
    dimensions: "18\" Seat Height • 16\" Dia Pedestal",
    leadTime: "3 - 4 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Sculptural stool */}
        <ellipse cx="50" cy="22" rx="14" ry="5" />
        <path d="M38 24 L42 66 H58 L62 24" />
        <ellipse cx="50" cy="66" rx="8" ry="2.5" strokeDasharray="1 1" />
        <line x1="44" y1="45" x2="56" y2="45" />
      </svg>
    ),
  },
  {
    id: "tables",
    num: "03",
    name: "TABLES",
    category: "Architectural Tables",
    description: "Pedestal round and banquet tables with chamfered bullnose edges, celebrating raw timber grain and natural stone foundations.",
    materials: ["Flamed Walnut", "Honed Crema Marfil", "Blackened Steel"],
    dimensions: "60\" - 96\" Diameter • Seats 6 to 10",
    leadTime: "4 - 5 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Round table with pedestal */}
        <ellipse cx="50" cy="28" rx="34" ry="10" />
        <ellipse cx="50" cy="31" rx="34" ry="10" />
        <path d="M42 38 V64 C42 67 36 68 34 68 H66 C64 68 58 67 58 64 V38" />
        <line x1="32" y1="68" x2="68" y2="68" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "benches",
    num: "04",
    name: "BENCHES",
    category: "Entryway & Gallery Joinery",
    description: "Heavy-duty exposed mortise-and-tenon entryway benches, providing grounding architectural weight with clean Japanese aesthetic lines.",
    materials: ["Solid Character Oak", "Raw Brass Pins", "Wabi-Sabi Wax Finish"],
    dimensions: "72\" L × 16\" D × 18\" H",
    leadTime: "3 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Bench top */}
        <rect x="18" y="34" width="64" height="6" rx="1" />
        {/* Legs with mortise joints */}
        <path d="M26 40 V66 H34 V40" />
        <path d="M66 40 V66 H74 V40" />
        {/* Stretcher beam */}
        <line x1="34" y1="52" x2="66" y2="52" />
        <circle cx="30" cy="46" r="1" fill="#181614" />
        <circle cx="70" cy="46" r="1" fill="#181614" />
      </svg>
    ),
  },
  {
    id: "shelving",
    num: "05",
    name: "SHELVING",
    category: "Flight & Wall Systems",
    description: "Floor-to-ceiling modular open shelving inspired by airy flight mechanics, balancing slender vertical uprights with generous horizontal spans.",
    materials: ["Acoustic Timber Slats", "Extruded Anodized Rail", "Linen Inlays"],
    dimensions: "Configurable modular heights up to 12 ft",
    leadTime: "4 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Vertical posts */}
        <line x1="28" y1="16" x2="28" y2="68" />
        <line x1="72" y1="16" x2="72" y2="68" />
        {/* Shelves */}
        <line x1="20" y1="28" x2="80" y2="28" />
        <line x1="20" y1="46" x2="80" y2="46" />
        <line x1="20" y1="64" x2="80" y2="64" />
        {/* Small ceramics on shelves */}
        <path d="M36 28 C36 24 40 24 40 28" />
        <rect x="56" y="22" width="10" height="6" rx="0.5" />
        <ellipse cx="64" cy="44" rx="4" ry="2" />
      </svg>
    ),
  },
  {
    id: "storage",
    num: "06",
    name: "STORAGE",
    category: "Writers Cabinets & Credenzas",
    description: "Concealed push-to-open fluted credenzas and wardrobes that dissolve visually into surrounding walls, hiding home clutter.",
    materials: ["Rift-Cut White Oak", "Smoked Mirror Linings", "Soft-Close German Latches"],
    dimensions: "84\" W × 32\" H × 18\" D",
    leadTime: "5 Weeks Handcraft",
    iconSvg: (active) => (
      <svg viewBox="0 0 100 80" className={`w-14 h-11 transition-all ${active ? "stroke-[#181614] scale-105" : "stroke-[#7D7569] group-hover:stroke-[#181614]"}`} fill="none" strokeWidth="1.2">
        {/* Cabinet box */}
        <rect x="24" y="20" width="52" height="42" rx="1" />
        {/* Doors line */}
        <line x1="50" y1="20" x2="50" y2="62" />
        {/* Slender legs */}
        <line x1="28" y1="62" x2="26" y2="70" />
        <line x1="72" y1="62" x2="74" y2="70" />
        {/* Vertical fluted textures */}
        <line x1="32" y1="24" x2="32" y2="58" strokeDasharray="1.5 1.5" />
        <line x1="42" y1="24" x2="42" y2="58" strokeDasharray="1.5 1.5" />
        <line x1="58" y1="24" x2="58" y2="58" strokeDasharray="1.5 1.5" />
        <line x1="68" y1="24" x2="68" y2="58" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
];

export default function CollisonSignatureBar({
  onSelectCategory,
}: {
  onSelectCategory?: (category: string) => void;
}) {
  const [activeItem, setActiveItem] = useState<CollectionItem>(SIGNATURE_ITEMS[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleItemClick = (item: CollectionItem) => {
    setActiveItem(item);
    setDrawerOpen(true);
    if (onSelectCategory) {
      onSelectCategory(item.name);
    }
  };

  return (
    <section className="bg-[#FAF8F5] border-y border-[rgba(28,24,20,0.09)] py-12 px-4 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Collison Editorial Header */}
        <div className="text-center mb-10 space-y-2">
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#8E867B] font-semibold block">
            What We Do &amp; Bespoke Joinery Collection
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-[#181614] tracking-tight">
            SIGNATURE ARCHITECTURAL ELEMENTS
          </h2>
          <p className="text-xs md:text-sm text-[#575149] max-w-2xl mx-auto leading-relaxed">
            Designed to seamlessly pair with AI room plans. Handcrafted solid woodwork, flush cabinetry, and sculptural furniture designed to maximize space and timeless beauty.
          </p>
        </div>

        {/* 6-Column Icon Grid (Faithful to Collison reference) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-l border-[rgba(28,24,20,0.1)] rounded-2xl overflow-hidden shadow-sm bg-white">
          {SIGNATURE_ITEMS.map((item) => {
            const isSelected = activeItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-6 border-r border-b border-[rgba(28,24,20,0.1)] flex flex-col items-center justify-between text-center transition-all group relative cursor-pointer min-h-[160px] ${
                  isSelected ? "bg-[#F3EFE9]" : "hover:bg-[#FAF8F5]"
                }`}
              >
                {/* Number Accent */}
                <span className="text-[10px] font-mono text-[#8E867B] font-bold self-start">
                  {item.num}
                </span>

                {/* SVG Line-art Sketch */}
                <div className="my-2 group-hover:scale-105 transition-transform duration-300">
                  {item.iconSvg(isSelected)}
                </div>

                {/* Name */}
                <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-[rgba(28,24,20,0.06)]">
                  <span className="font-display text-xs font-bold tracking-wider text-[#181614] group-hover:text-[#B88555] transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#8E867B] group-hover:text-[#181614] transition-colors">
                    ↗
                  </span>
                </div>

                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#181614]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Expandable Spec Detail Drawer */}
        {drawerOpen && (
          <div className="mt-6 bg-white border border-[rgba(28,24,20,0.12)] rounded-3xl p-6 md:p-8 shadow-lg animate-fadeIn flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-[#181614] text-white px-2.5 py-0.5 rounded-full">
                  COLLECTION {activeItem.num}
                </span>
                <h3 className="font-display font-bold text-lg md:text-xl text-[#181614]">
                  {activeItem.name} — {activeItem.category}
                </h3>
              </div>
              <p className="text-xs md:text-sm text-[#575149] leading-relaxed">
                {activeItem.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#181614] pt-2">
                <div>
                  <span className="text-[#8E867B] font-medium">Finishes: </span>
                  <span className="font-semibold">{activeItem.materials.join(" • ")}</span>
                </div>
                <div>
                  <span className="text-[#8E867B] font-medium">Specs: </span>
                  <span className="font-semibold">{activeItem.dimensions}</span>
                </div>
                <div>
                  <span className="text-[#8E867B] font-medium">Crafting: </span>
                  <span className="font-semibold text-[#B88555]">{activeItem.leadTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="#workforce"
                className="bg-[#181614] hover:bg-[#2A2622] text-white text-xs font-semibold px-5 py-3 rounded-full transition-all active:scale-95 text-center flex-1 md:flex-initial"
              >
                Hire Craftsman for {activeItem.name} ↗
              </a>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full border border-[rgba(28,24,20,0.15)] hover:bg-[#FAF8F5] flex items-center justify-center text-xs text-[#181614] transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Collison Running Statement Banner */}
        <div className="mt-10 py-4 px-6 rounded-2xl bg-[#EFECE6]/80 border border-[rgba(28,24,20,0.08)] flex items-center justify-between flex-wrap gap-4">
          <p className="text-[11px] md:text-xs font-editorial uppercase tracking-wider text-[#575149]">
            A NEW COLLECTION IS TAKING SHAPE • FLIGHT SHELVES • WRITER'S CABINET &amp; CONCEALED STORAGE • BESPOKE ARCHITECTURAL WOODWORK
          </p>
          <span className="text-[11px] font-mono text-[#B88555] font-bold">
            HANDMADE IN STUDIO ✦
          </span>
        </div>
      </div>
    </section>
  );
}
