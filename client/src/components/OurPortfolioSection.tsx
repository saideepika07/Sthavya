import { useState } from "react";
import PortfolioLightboxModal from "./PortfolioLightboxModal";

interface PortfolioItem {
  id: string;
  num: string;
  title: string;
  category: string;
  location: string;
  days: string;
  description: string;
  images: { url: string; caption: string }[];
  materials: string[];
}

const PORTFOLIO_PROJECTS: PortfolioItem[] = [
  {
    id: "sauna-kyiv",
    num: "01",
    title: "SAUNA DESIGN",
    category: "Wellness & Spa Architecture",
    location: "KYIV",
    days: "30 DAYS",
    description:
      "Throughout this entire construction process, we paid special attention to every detail to create the perfect environment. From the selection of the highest quality materials to the precise installation of each element. We intended the sauna to be not only functional, but also visually appealing.",
    materials: ["Thermo-treated Nordic Aspen", "Black Basalt Stone", "Frameless 10mm Clear Glass", "Concealed IP68 Warm Lighting"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=1000&fit=crop&auto=format",
        caption: "Bespoke Finnish cedar sauna cabin with floating bench architecture",
      },
      {
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=600&fit=crop&auto=format",
        caption: "Integrated slate washroom with custom vanity and matte hardware",
      },
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop&auto=format",
        caption: "Handcrafted cedar bucket and tactile slate wall texture",
      },
      {
        url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop&auto=format",
        caption: "Glass entrance doorway maintaining acoustic & thermal seal",
      },
    ],
  },
  {
    id: "apt-mykolaiv",
    num: "02",
    title: "APARTMENT DESIGN",
    category: "Modern Residential Architecture",
    location: "MYKOLAIV",
    days: "60 DAYS",
    description:
      "This apartment design represents modern minimalism, using neutral shades and clean lines to create a space full of light and harmony. Furniture of simple shapes and functional elements emphasize simplicity and functionality while providing comfort. The customer was satisfied.",
    materials: ["Smoked European Oak", "Belgian Linen Upholstery", "Travertine Slabs", "Woven Cane Pendants"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=1000&fit=crop&auto=format",
        caption: "Minimalist cloud sofa with textured plaster wall art and jute rug",
      },
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&auto=format",
        caption: "Living room lounge with concealed storage wall and woven lighting",
      },
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&auto=format",
        caption: "Serene bedroom sanctuary with layered linen textiles",
      },
      {
        url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop&auto=format",
        caption: "Solid oak sliding pocket door dividing living and work zones",
      },
    ],
  },
  {
    id: "kitchen-odesa",
    num: "03",
    title: "KITCHEN DESIGN",
    category: "Culinary & Dining Monolith",
    location: "ODESA",
    days: "45 DAYS",
    description:
      "The kitchen design combines modern aesthetics with functionality, offering a comfortable space for cooking and gatherings. The minimalist approach to the colour palette and materials creates a modern design. The integration of innovative technologies emphasises modernity.",
    materials: ["Fluted Warm Oak", "Calacatta Gold Quartzite", "Brushed Brass Chandelier", "Concealed Induction System"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=1000&fit=crop&auto=format",
        caption: "Circular halo suspension chandelier over round dining table",
      },
      {
        url: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800&h=600&fit=crop&auto=format",
        caption: "Minimalist two-tone oak and matte white cabinetry",
      },
      {
        url: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&h=600&fit=crop&auto=format",
        caption: "Monolithic island with flush recessed bar seating",
      },
      {
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop&auto=format",
        caption: "Refined dining nook bathed in diffuse morning light",
      },
    ],
  },
];

export default function OurPortfolioSection({
  onBookConsultation,
}: {
  onBookConsultation: (projectName: string) => void;
}) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  return (
    <section
      id="portfolio"
      className="py-28 px-4 md:px-8 max-w-7xl mx-auto bg-transparent relative overflow-hidden"
    >
      {/* Top Header Row (from Screenshot 4) */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-24">
        <div className="pt-3 max-w-xs">
          <span className="text-[11px] md:text-xs font-mono font-bold tracking-widest text-[#181614] uppercase leading-relaxed block">
            SELECTED CASE STUDIES<br />
            AND REALIZED<br />
            ARCHITECTURE
          </span>
        </div>

        {/* Monumental Headline: "OUR PORTFOLIO" */}
        <div className="flex-1 text-left md:text-center">
          <h2 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-editorial font-bold tracking-tight leading-[0.88] select-none">
            <span className="block text-[#181614]">OUR</span>
            <span className="block text-[#5B3E2B] md:ml-20">PORTFOLIO</span>
          </h2>
        </div>

        <div className="hidden md:block w-24 text-right pt-3">
          <span className="text-xs font-mono text-[#8E867B] font-bold">2024 - 2026</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-36">
        {PORTFOLIO_PROJECTS.map((project, idx) => {
          const isOdd = idx % 2 === 1;

          return (
            <div key={project.id} className="relative group">
              {/* Project Top Narrative Bar */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 border-b border-[rgba(28,24,20,0.12)] pb-6">
                <div className="max-w-xl space-y-3">
                  <h3 className="font-display font-bold text-2xl md:text-3xl text-[#181614] tracking-tight uppercase">
                    {project.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#575149] leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Location & Terms badge (matching screenshot) + Floating Outline Number */}
                <div className="flex items-center gap-8 self-start lg:self-end">
                  <div className="text-xs space-y-1">
                    <div>
                      <span className="text-[#8E867B] text-[10px] font-mono uppercase block">
                        Location
                      </span>
                      <span className="font-display font-bold text-[#181614] tracking-wider">
                        {project.location}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8E867B] text-[10px] font-mono uppercase block">
                        Terms of execution
                      </span>
                      <span className="font-display font-bold text-[#181614] tracking-wider">
                        {project.days}
                      </span>
                    </div>
                  </div>

                  <span className="font-display font-light text-6xl md:text-7xl text-[#181614]/30 select-none">
                    {project.num}
                  </span>
                </div>
              </div>

              {/* Multi-Photo Collage Grid with Hairline Architectural Borders */}
              <div
                onClick={() => setSelectedItem(project)}
                className="cursor-pointer relative architect-frame"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 border border-[rgba(28,24,20,0.1)] shadow-sm">
                  {/* Hero vertical/large photo (5 cols) */}
                  <div className={`md:col-span-5 aspect-[4/5] overflow-hidden ${isOdd ? "md:order-2" : "md:order-1"}`}>
                    <img
                      src={project.images[0].url}
                      alt={project.images[0].caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* 3 Detail Photos Grid (7 cols) */}
                  <div className={`md:col-span-7 grid grid-cols-2 gap-3 ${isOdd ? "md:order-1" : "md:order-2"}`}>
                    <div className="col-span-2 aspect-[16/9] overflow-hidden">
                      <img
                        src={project.images[1].url}
                        alt={project.images[1].caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={project.images[2].url}
                        alt={project.images[2].caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={project.images[3].url}
                        alt={project.images[3].caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>

                {/* Hover Quick Action */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-md text-xs font-semibold text-[#181614] flex items-center gap-2">
                  <span>View Full Architectural Case Study</span>
                  <span>↗</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <PortfolioLightboxModal
        item={selectedItem}
        isOpen={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        onBookSimilar={(proj) => onBookConsultation(`Inquiry for project style: ${proj}`)}
      />
    </section>
  );
}
