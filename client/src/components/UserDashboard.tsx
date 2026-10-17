import { useState, useEffect } from "react";
import { HOUSE_PLANS_DATA, type HousePlan } from "../data/housePlansData";
import { housePlanningService, type ConsultationRequest, type ConfirmedSlotBooking } from "../services/housePlanningService";
import type { SthavyaUser } from "../services/auth";
import { downloadBlueprintAsPdf, getBlueprintPdfFilename } from "../services/blueprintPdfService";

interface UserDashboardProps {
  currentUser?: SthavyaUser | null;
  onOpenBlueprint: (plan: HousePlan) => void;
  onOpen3D: (plan: HousePlan) => void;
  onOpenBookingModal: (request: ConsultationRequest) => void;
  onExplorePlans: () => void;
  onOpenLogin: () => void;
}

export default function UserDashboard({
  currentUser,
  onOpenBlueprint,
  onOpen3D,
  onOpenBookingModal,
  onExplorePlans,
  onOpenLogin,
}: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"plans" | "consultations" | "bookings" | "profile">("plans");
  const [savedPlans, setSavedPlans] = useState<HousePlan[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [bookings, setBookings] = useState<ConfirmedSlotBooking[]>([]);
  const [downloadingPlanId, setDownloadingPlanId] = useState<string | null>(null);
  const [dashboardToast, setDashboardToast] = useState<string | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const savedIds = housePlanningService.getSavedPlanIds();
    const plans = HOUSE_PLANS_DATA.filter((p) => savedIds.includes(p.id));
    setSavedPlans(plans.length > 0 ? plans : [HOUSE_PLANS_DATA[0]]);

    setConsultations(housePlanningService.getConsultationRequests());
    setBookings(housePlanningService.getBookings());
  };

  const handleDownloadPlanPdf = async (plan: HousePlan) => {
    if (downloadingPlanId) return;
    setDownloadingPlanId(plan.id);
    setDashboardToast(`📐 Generating PDF for ${plan.name}...`);
    try {
      await downloadBlueprintAsPdf({ plan, theme: "vellum" });
      const filename = getBlueprintPdfFilename(plan);
      setDashboardToast(`✓ Blueprint PDF downloaded: ${filename}`);
      setTimeout(() => setDashboardToast(null), 4000);
    } catch (err) {
      console.error("Dashboard PDF export failed:", err);
      setDashboardToast("⚠ Failed to generate blueprint PDF. Please try again.");
      setTimeout(() => setDashboardToast(null), 4000);
    } finally {
      setDownloadingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] pb-20 relative">
      {/* Floating Toast Notification */}
      {dashboardToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-[#181614]/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/15 animate-fade-in pointer-events-none">
          {dashboardToast}
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#181614] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono">
              <span>✦</span>
              <span>CLIENT RESIDENTIAL DASHBOARD</span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-white">
              {currentUser?.displayName ? `Welcome back, ${currentUser.displayName}` : "Client Project Workspace"}
            </h1>
            <p className="text-xs text-white/70 max-w-xl font-mono">
              Track your saved 2D/3D blueprints, manage professional consultation requests, and view booked architectural time slots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExplorePlans}
              className="px-5 py-2.5 rounded-full bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-xs transition-all shadow-md"
            >
              Book Consultation ↗
            </button>
            {!currentUser && (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] p-1.5 shadow-sm flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "plans" ? "bg-[#181614] text-white shadow-xs" : "text-[#575149] hover:text-[#181614]"
            }`}
          >
            <span>📐 My Saved Plans</span>
            <span className="font-mono text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
              {savedPlans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "consultations" ? "bg-[#181614] text-white shadow-xs" : "text-[#575149] hover:text-[#181614]"
            }`}
          >
            <span>📋 Consultations</span>
            <span className="font-mono text-[10px] bg-amber-500/20 text-amber-900 px-1.5 py-0.5 rounded">
              {consultations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "bookings" ? "bg-[#181614] text-white shadow-xs" : "text-[#575149] hover:text-[#181614]"
            }`}
          >
            <span>📅 Confirmed Bookings</span>
            <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-900 px-1.5 py-0.5 rounded">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "profile" ? "bg-[#181614] text-white shadow-xs" : "text-[#575149] hover:text-[#181614]"
            }`}
          >
            <span>👤 Profile &amp; Preferences</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* TAB 1: SAVED PLANS */}
        {activeTab === "plans" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-[#181614]">Saved House Plans &amp; Blueprints</h3>
                <p className="text-xs text-[#575149]">Instant vector CAD blueprints and 3D architectural renders.</p>
              </div>
              <button
                onClick={onExplorePlans}
                className="text-xs font-semibold text-[#B88555] hover:underline"
              >
                + Add More Plans
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-5 shadow-xs space-y-4 hover:border-[#B88555] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden h-44 bg-[#121110]">
                      <img
                        src={plan.visualization3D.exteriorFront}
                        alt={plan.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/70 text-amber-300 font-mono text-[10px] font-bold">
                        {plan.variation}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#B88555] text-white font-bold text-xs">
                        ₹{plan.estimatedCostLakhs} L
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-base text-[#181614]">{plan.name}</h4>
                      <p className="text-xs text-[#575149] mt-0.5 line-clamp-2">{plan.tagline}</p>
                    </div>

                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.06)] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Plot Size</span>
                        <strong className="text-[#181614]">{plan.plotSizeSqYd} sq yd</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Layout</span>
                        <strong className="text-[#181614]">{plan.bhk} BHK • {plan.floors}</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Built-up Area</span>
                        <strong className="text-[#181614]">{plan.builtUpAreaSqFt} sq.ft</strong>
                      </div>
                      <div>
                        <span className="text-[#8E867B] block text-[10px]">Circulation Score</span>
                        <strong className="text-emerald-700">{plan.circulationRating}/10</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <button
                      onClick={() => onOpenBlueprint(plan)}
                      className="py-2.5 rounded-xl border border-[rgba(28,24,20,0.15)] bg-white hover:bg-[#FAF8F5] font-semibold text-[#181614] cursor-pointer"
                    >
                      📐 Open 2D Blueprint
                    </button>
                    <button
                      onClick={() => onOpen3D(plan)}
                      className="py-2.5 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold shadow-xs cursor-pointer"
                    >
                      ✦ 3D Views
                    </button>
                  </div>

                  <button
                    onClick={() => handleDownloadPlanPdf(plan)}
                    disabled={downloadingPlanId === plan.id}
                    className="w-full mt-2 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EAE6DF] border border-[rgba(28,24,20,0.15)] text-[#181614] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                    title="Download vector A3 architectural blueprint PDF"
                  >
                    {downloadingPlanId === plan.id ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#181614]/30 border-t-[#181614] rounded-full animate-spin" />
                        <span>Generating PDF...</span>
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        <span>Download Blueprint as PDF</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CONSULTATIONS */}
        {activeTab === "consultations" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-[#181614]">Work Requests &amp; Consultations</h3>
              <p className="text-xs text-[#575149]">Manage submissions, professional acceptances, and booking approvals.</p>
            </div>

            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] text-xs text-[#8E867B]">
                  No consultation requests found. Select any house plan and click &quot;Request Consultation&quot;.
                </div>
              ) : (
                consultations.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(28,24,20,0.06)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-base text-[#181614]">
                            {req.selectedPlanName}
                          </h4>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                              req.status === "accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : req.status === "booked"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {req.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-[#575149] mt-0.5">
                          Professional: <strong>{req.professionalName}</strong> ({req.professionalCategory}) • Submitted {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-[#8E867B] block">Budget</span>
                        <span className="font-bold text-sm text-[#B88555]">₹{req.budgetLakhs} Lakhs</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#575149] space-y-1">
                      <p><strong>Work Scope:</strong> {req.workDescription}</p>
                      <p><strong>Site:</strong> {req.location} • <strong>Plot Size:</strong> {req.plotSizeSqYd} sq yd ({req.plotDimensions})</p>
                    </div>

                    {/* Professional Response Banner */}
                    {req.status === "accepted" && req.professionalResponse && (
                      <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                            <span>✓</span>
                            <span>Request Accepted by {req.professionalName}</span>
                          </span>
                          <p className="text-emerald-950 text-[11px]">
                            {req.professionalResponse.responseNote}
                          </p>
                          <p className="text-[11px] text-[#575149]">
                            Estimated Days: <strong>{req.professionalResponse.estimatedDays} Days</strong> • Fee: <strong>₹{req.professionalResponse.consultationFee}</strong>
                          </p>
                        </div>

                        <button
                          onClick={() => onOpenBookingModal(req)}
                          className="py-2.5 px-5 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white font-semibold text-xs shadow-md whitespace-nowrap"
                        >
                          Select Slot &amp; Lock Booking ↗
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-bold text-xl text-[#181614]">Confirmed Appointments &amp; Slots</h3>
              <p className="text-xs text-[#575149]">Real-time calendar synchronization with assigned architects.</p>
            </div>

            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] text-xs text-[#8E867B]">
                  No confirmed bookings yet. When a professional accepts your consultation, select a slot to see your schedule here.
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(28,24,20,0.06)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#B88555] bg-amber-50 px-2 py-0.5 rounded">
                            #{b.bookingRef}
                          </span>
                          <h4 className="font-display font-bold text-base text-[#181614]">
                            {b.professionalName} ({b.professionalCategory})
                          </h4>
                        </div>
                        <p className="text-xs text-[#575149] mt-0.5">
                          Plot Plan: <strong>{b.planName}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">
                          Confirmed &amp; Paid (₹{b.consultationFee})
                        </span>
                        <span className="text-[11px] font-mono text-[#8E867B] block mt-1">
                          Ref: {b.paymentReference}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.06)]">
                        <span className="text-[#8E867B] block text-[10px]">Scheduled Slot</span>
                        <strong className="text-[#181614] text-sm">{b.bookedDate} at {b.bookedTimeSlot}</strong>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.06)]">
                        <span className="text-[#8E867B] block text-[10px]">Client Details</span>
                        <strong className="text-[#181614]">{b.customerName} ({b.customerPhone})</strong>
                      </div>

                      <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.06)] flex items-center justify-between">
                        <div>
                          <span className="text-[#8E867B] block text-[10px]">Virtual Studio</span>
                          <span className="text-[11px] text-emerald-700 font-semibold">Active Session</span>
                        </div>
                        <a
                          href={b.meetingLink || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#28362B] text-white text-[11px] font-semibold"
                        >
                          Join Meeting ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 sm:p-8 space-y-6 text-xs">
            <h3 className="font-display font-bold text-xl text-[#181614]">Client Profile &amp; Preferences</h3>

            <div className="space-y-4">
              <div>
                <label className="font-bold text-[#575149] block mb-1">Display Name</label>
                <input
                  type="text"
                  readOnly
                  value={currentUser?.displayName || "Deepika Reddy"}
                  className="w-full bg-[#FAF8F5] border border-[rgba(28,24,20,0.12)] rounded-xl p-2.5 font-semibold text-[#181614]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={currentUser?.email || "deepika.reddy@example.com"}
                  className="w-full bg-[#FAF8F5] border border-[rgba(28,24,20,0.12)] rounded-xl p-2.5 font-semibold text-[#181614]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  readOnly
                  value={currentUser?.phoneNumber || "+91 98765 43210"}
                  className="w-full bg-[#FAF8F5] border border-[rgba(28,24,20,0.12)] rounded-xl p-2.5 font-mono text-[#181614]"
                />
              </div>

              <div className="p-4 bg-[#EFECE6] rounded-2xl space-y-2">
                <span className="font-bold text-[#181614] block">Default Plot Preferences</span>
                <p className="text-[#575149]">Standard Plot: <strong>150 Sq. Yds (45&apos; × 30&apos;)</strong> • Preferred Configuration: <strong>3 BHK G+1</strong></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
