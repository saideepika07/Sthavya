import { useState, useEffect } from "react";
import type { HousePlan } from "../data/housePlansData";
import { PROFESSIONALS_DIRECTORY, type ProfessionalProfile } from "../data/professionalsData";
import { housePlanningService, type ConsultationRequest } from "../services/housePlanningService";

interface WorkRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan?: HousePlan | null;
  initialCustomerName?: string;
  initialCustomerPhone?: string;
  initialCustomerEmail?: string;
  onRequestSubmitted: (request: ConsultationRequest) => void;
}

export default function WorkRequestModal({
  isOpen,
  onClose,
  selectedPlan,
  initialCustomerName = "",
  initialCustomerPhone = "",
  initialCustomerEmail = "",
  onRequestSubmitted,
}: WorkRequestModalProps) {
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);
  const [customerEmail, setCustomerEmail] = useState(initialCustomerEmail);
  const [location, setLocation] = useState("Indiranagar, Bangalore");
  const [plotSizeSqYd, setPlotSizeSqYd] = useState(selectedPlan?.plotSizeSqYd || 150);
  const [plotDimensions, setPlotDimensions] = useState(
    selectedPlan ? `${selectedPlan.plotDimensions.lengthFt}' × ${selectedPlan.plotDimensions.widthFt}'` : "45' × 30'"
  );
  const [bhk, setBhk] = useState(selectedPlan ? `${selectedPlan.bhk} BHK` : "3 BHK");
  const [floors, setFloors] = useState<string>(selectedPlan?.floors || "G+1");
  const [professionalCategory, setProfessionalCategory] = useState("Architect");
  const [professionalId, setProfessionalId] = useState("pro-arch-1");
  const [workDescription, setWorkDescription] = useState(
    "Need complete structural validation, municipality drawing approvals, and material finishes consultation for this layout."
  );
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split("T")[0];
  });
  const [budgetLakhs, setBudgetLakhs] = useState(selectedPlan?.estimatedCostLakhs || 45);
  const [additionalRequirements, setAdditionalRequirements] = useState(
    "Need Vastu compliant Pooja placement, EV car charger outlet, and maximum cross-ventilation."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      setPlotSizeSqYd(selectedPlan.plotSizeSqYd);
      setPlotDimensions(`${selectedPlan.plotDimensions.lengthFt}' × ${selectedPlan.plotDimensions.widthFt}'`);
      setBhk(`${selectedPlan.bhk} BHK`);
      setFloors(selectedPlan.floors);
      setBudgetLakhs(selectedPlan.estimatedCostLakhs);
    }
  }, [selectedPlan]);

  const filteredPros = PROFESSIONALS_DIRECTORY.filter((p) =>
    professionalCategory === "All" ? true : p.category === professionalCategory
  );

  const selectedPro =
    PROFESSIONALS_DIRECTORY.find((p) => p.id === professionalId) || filteredPros[0] || PROFESSIONALS_DIRECTORY[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      alert("Please provide your name, phone number, and email.");
      return;
    }

    setIsSubmitting(true);
    const req = housePlanningService.createConsultationRequest({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      location: location.trim(),
      plotSizeSqYd: Number(plotSizeSqYd),
      plotDimensions,
      bhk,
      floors,
      selectedPlanId: selectedPlan?.id || "plan-custom",
      selectedPlanName: selectedPlan ? `${selectedPlan.name} (${selectedPlan.variation})` : "Custom Residential Plan",
      professionalId: selectedPro.id,
      professionalName: selectedPro.name,
      professionalCategory: selectedPro.category,
      workDescription: workDescription.trim(),
      expectedCompletionDate,
      budgetLakhs: Number(budgetLakhs),
      additionalRequirements: additionalRequirements.trim(),
    });

    setIsSubmitting(false);
    onRequestSubmitted(req);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none overflow-y-auto">
      <div className="w-full max-w-3xl my-8 bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#181614] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#B88555] flex items-center justify-center text-white font-bold text-sm">
              📋
            </span>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                Request Professional Consultation &amp; Work Proposal
              </h3>
              <p className="text-xs text-white/60">
                Direct engagement with council-certified architects, civil engineers, and master builders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Selected Plan Summary Banner */}
        {selectedPlan && (
          <div className="px-6 py-3 bg-[#EFECE6] border-b border-[rgba(28,24,20,0.08)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#B88555] font-bold">Selected House Plan:</span>
              <strong className="text-[#181614]">{selectedPlan.name}</strong>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[rgba(28,24,20,0.1)]">
                {selectedPlan.variation}
              </span>
            </div>
            <span className="font-mono text-[#575149]">
              {selectedPlan.plotSizeSqYd} sq yd • {selectedPlan.bhk} BHK • {selectedPlan.floors} • ₹{selectedPlan.estimatedCostLakhs}L est.
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          {/* Section 1: Customer Contact Info */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#B88555]">
              1. Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-[#575149] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepika Reddy"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] focus:outline-none focus:border-[#B88555]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-mono focus:outline-none focus:border-[#B88555]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="deepika@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] focus:outline-none focus:border-[#B88555]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#575149] block mb-1">Project Site Location / City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot #48, 12th Main, Indiranagar, Bangalore, Karnataka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] focus:outline-none focus:border-[#B88555]"
              />
            </div>
          </div>

          {/* Section 2: Plot & Layout Specifications */}
          <div className="space-y-3 pt-3 border-t border-[rgba(28,24,20,0.08)]">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#B88555]">
              2. Plot &amp; Structure Parameters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-[#575149] block mb-1">Plot Size (Sq Yds)</label>
                <input
                  type="number"
                  value={plotSizeSqYd}
                  onChange={(e) => setPlotSizeSqYd(Number(e.target.value))}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Dimensions (L × W)</label>
                <input
                  type="text"
                  value={plotDimensions}
                  onChange={(e) => setPlotDimensions(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">BHK Requirement</label>
                <select
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                >
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5 BHK">5 BHK</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Number of Floors</label>
                <select
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                >
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="G+1">G+1</option>
                  <option value="G+2">G+2</option>
                  <option value="G+3">G+3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Professional Required */}
          <div className="space-y-3 pt-3 border-t border-[rgba(28,24,20,0.08)]">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#B88555]">
              3. Select Professional Specialization
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#575149] block mb-1">Category of Professional</label>
                <select
                  value={professionalCategory}
                  onChange={(e) => {
                    setProfessionalCategory(e.target.value);
                    const match = PROFESSIONALS_DIRECTORY.find((p) => p.category === e.target.value);
                    if (match) setProfessionalId(match.id);
                  }}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-semibold"
                >
                  {[
                    "Architect",
                    "Civil Engineer",
                    "Structural Engineer",
                    "Interior Designer",
                    "3D Designer",
                    "Electrical Engineer",
                    "Plumbing Professional",
                    "Contractor",
                    "Construction Team",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Designated Professional</label>
                <select
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-semibold"
                >
                  {filteredPros.map((pro) => (
                    <option key={pro.id} value={pro.id}>
                      {pro.name} ({pro.experience}y exp) — ₹{pro.consultationFee} fee
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Micro-Card */}
            {selectedPro && (
              <div className="p-3 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] flex items-center gap-3">
                <img
                  src={selectedPro.avatar}
                  alt={selectedPro.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#B88555]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-[#181614]">{selectedPro.name}</strong>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      ★ {selectedPro.rating} ({selectedPro.reviewsCount} reviews)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#575149]">{selectedPro.role}</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[#8E867B] block text-[10px]">Consultation Fee</span>
                  <span className="font-bold text-[#B88555]">₹{selectedPro.consultationFee}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Work Scope, Deadline & Budget */}
          <div className="space-y-3 pt-3 border-t border-[rgba(28,24,20,0.08)]">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#B88555]">
              4. Scope, Timeline &amp; Budget
            </h4>

            <div>
              <label className="font-bold text-[#575149] block mb-1">Work Description &amp; Scope *</label>
              <textarea
                rows={3}
                required
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] focus:outline-none focus:border-[#B88555]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#575149] block mb-1">Expected Completion Date</label>
                <input
                  type="date"
                  required
                  value={expectedCompletionDate}
                  onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Target Build Budget (₹ Lakhs)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={budgetLakhs}
                  onChange={(e) => setBudgetLakhs(Number(e.target.value))}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-bold text-[#B88555]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#575149] block mb-1">Additional Requirements (Vastu, Parking, Greenery)</label>
              <input
                type="text"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-[rgba(28,24,20,0.08)] flex items-center justify-between">
            <span className="text-[11px] text-[#8E867B]">
              Professional will review within 2-4 hours and allocate booking time slots.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold text-xs transition-all shadow-md active:scale-98 disabled:opacity-60"
            >
              {isSubmitting ? "Dispatching Work Proposal..." : "Submit Consultation Request ↗"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
