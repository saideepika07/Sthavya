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

export default function PortfolioLightboxModal({
  item,
  isOpen,
  onClose,
  onBookSimilar,
}: {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookSimilar: (projectName: string) => void;
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FAF8F5] rounded-3xl border border-[rgba(28,24,20,0.15)] max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(28,24,20,0.08)] flex items-center justify-between bg-white rounded-t-3xl sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#8E867B]">{item.num}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#181614] font-semibold">
                {item.location} • {item.days}
              </span>
            </div>
            <h3 className="font-editorial text-xl font-bold text-[#181614] mt-0.5">
              {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold text-[#181614] hover:bg-[#E4DFD6] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8 flex-1">
          {/* Narrative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-[rgba(28,24,20,0.08)]">
            <div className="md:col-span-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E867B] block mb-1">
                Project Narrative
              </span>
              <p className="text-xs md:text-sm text-[#575149] leading-relaxed">
                {item.description}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E867B] block mb-1">
                Curated Materials
              </span>
              <ul className="space-y-1 text-xs text-[#181614]">
                {item.materials.map((m, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B88555]" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {item.images.map((img, i) => (
              <div key={i} className="group rounded-2xl overflow-hidden bg-black/5 relative aspect-[4/3] shadow-sm">
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-white text-xs">
                  {img.caption}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t border-[rgba(28,24,20,0.08)] bg-white rounded-b-3xl flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <span className="text-xs text-[#575149] hidden sm:inline">
            Turnkey architectural execution with guaranteed delivery.
          </span>
          <button
            onClick={() => {
              onBookSimilar(item.title);
              onClose();
            }}
            className="bg-[#181614] hover:bg-[#2A2622] text-white px-6 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 ml-auto"
          >
            Inquire About Similar Build ↗
          </button>
        </div>
      </div>
    </div>
  );
}
