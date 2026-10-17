import { useState, useEffect } from "react";
import { PROFESSIONALS_DIRECTORY, type ProfessionalProfile } from "../data/professionalsData";
import { housePlanningService, type ConsultationRequest, type ConfirmedSlotBooking } from "../services/housePlanningService";

interface ProfessionalDashboardProps {
  onBackToHome: () => void;
}

export default function ProfessionalDashboard({ onBackToHome }: ProfessionalDashboardProps) {
  const [selectedProId, setSelectedProId] = useState<string>("pro-arch-1");
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [bookings, setBookings] = useState<ConfirmedSlotBooking[]>([]);

  // Response Modal State
  const [activeRequestForResponse, setActiveRequestForResponse] = useState<ConsultationRequest | null>(null);
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [proposedStartDate, setProposedStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [responseFee, setResponseFee] = useState(2500);
  const [responseNote, setResponseNote] = useState(
    "Plot dimensions verified. Feasible for G+1 construction. Setting 3 consultation slots for architectural review."
  );

  const currentPro: ProfessionalProfile =
    PROFESSIONALS_DIRECTORY.find((p) => p.id === selectedProId) || PROFESSIONALS_DIRECTORY[0];

  useEffect(() => {
    loadData();
  }, [selectedProId]);

  const loadData = () => {
    const allReqs = housePlanningService.getConsultationRequests();
    setRequests(allReqs.filter((r) => r.professionalId === selectedProId));

    const allBookings = housePlanningService.getBookings();
    setBookings(allBookings.filter((b) => b.professionalId === selectedProId));
  };

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForResponse) return;

    housePlanningService.respondToConsultationRequest(activeRequestForResponse.id, "accepted", {
      estimatedDays: Number(estimatedDays),
      proposedStartDate,
      consultationFee: Number(responseFee),
      responseNote,
      availableSlots: [
        { date: "Tomorrow", time: "10:00 AM" },
        { date: "Tomorrow", time: "02:30 PM" },
        { date: "Day After", time: "11:30 AM" },
      ],
    });

    setActiveRequestForResponse(null);
    loadData();
  };

  const handleReject = (reqId: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      housePlanningService.respondToConsultationRequest(reqId, "rejected");
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] pb-20">
      {/* Top Banner */}
      <div className="bg-[#181614] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentPro.avatar}
              alt={currentPro.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-[#B88555] shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                  {currentPro.category}
                </span>
                <span className="text-xs text-white/70">★ {currentPro.rating} ({currentPro.reviewsCount} reviews)</span>
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white mt-0.5">
                {currentPro.name}
              </h1>
              <p className="text-xs text-white/70 font-mono">{currentPro.role}</p>
            </div>
          </div>

          {/* Switch Professional Account */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-2xl border border-white/15">
              <span className="text-[10px] font-mono text-white/70 uppercase block mb-1">
                Switch Persona:
              </span>
              <select
                value={selectedProId}
                onChange={(e) => setSelectedProId(e.target.value)}
                className="bg-[#181614] text-white text-xs font-semibold p-1.5 rounded-lg border border-white/20 focus:outline-none"
              >
                {PROFESSIONALS_DIRECTORY.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              ← Back to Platform
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8E867B] block mb-1">Inbound Requests</span>
            <span className="font-display font-bold text-2xl text-[#181614]">{requests.length}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">
              {requests.filter((r) => r.status === "pending").length} Pending Action
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8E867B] block mb-1">Active Bookings</span>
            <span className="font-display font-bold text-2xl text-[#28362B]">{bookings.length}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Confirmed Slots</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8E867B] block mb-1">Consultation Fee</span>
            <span className="font-display font-bold text-2xl text-[#B88555]">₹{currentPro.consultationFee}</span>
            <span className="text-[10px] text-[#8E867B] block mt-0.5">Per Session</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-[#8E867B] block mb-1">Completed Works</span>
            <span className="font-display font-bold text-2xl text-[#181614]">{currentPro.completedProjects}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Verified Deliveries</span>
          </div>
        </div>

        {/* Section 1: Inbound Customer Consultation Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-[#181614]">Inbound Client Consultation Requests</h3>
              <p className="text-xs text-[#575149]">
                Accept requests, set expected duration &amp; configure available consultation time slots.
              </p>
            </div>
            <span className="text-xs font-mono text-[#8E867B]">
              Real-time synchronization enabled
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] text-xs text-[#8E867B]">
              No work requests assigned to {currentPro.name} yet. Submit a consultation from any house plan card to test the flow.
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(28,24,20,0.06)]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-base text-[#181614]">
                          Client: {r.customerName}
                        </h4>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                            r.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : r.status === "booked"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#575149] mt-0.5">
                        Phone: <strong>{r.customerPhone}</strong> • Email: <strong>{r.customerEmail}</strong> • Location: <strong>{r.location}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[#8E867B] block">Client Budget</span>
                      <span className="font-bold text-base text-[#B88555]">₹{r.budgetLakhs} Lakhs</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.05)]">
                      <span className="text-[#8E867B] block text-[10px]">Selected Concept</span>
                      <strong className="text-[#181614]">{r.selectedPlanName}</strong>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.05)]">
                      <span className="text-[#8E867B] block text-[10px]">Plot Dimensions</span>
                      <strong className="text-[#181614]">{r.plotSizeSqYd} sq yd ({r.plotDimensions})</strong>
                    </div>
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[rgba(28,24,20,0.05)]">
                      <span className="text-[#8E867B] block text-[10px]">Floors &amp; Target</span>
                      <strong className="text-[#181614]">{r.bhk} • {r.floors}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-[#EFECE6]/70 rounded-xl text-xs text-[#575149]">
                    <span className="font-bold text-[#181614]">Work Description: </span>
                    {r.workDescription}
                  </div>

                  {/* Actions for Pending Requests */}
                  {r.status === "pending" && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReject(r.id)}
                        className="px-4 py-2 rounded-xl bg-[#EFECE6] text-[#575149] hover:text-rose-700 text-xs font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setActiveRequestForResponse(r);
                          setResponseFee(currentPro.consultationFee);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#28362B] hover:bg-[#1E2B22] text-white text-xs font-semibold shadow-sm"
                      >
                        Accept Request &amp; Set Available Slots ↗
                      </button>
                    </div>
                  )}

                  {/* Already accepted summary */}
                  {r.status === "accepted" && (
                    <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs flex justify-between items-center">
                      <span>✓ You accepted this request. Waiting for client to pick their slot.</span>
                      <span className="font-mono text-[11px]">Duration: {r.professionalResponse?.estimatedDays} days</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Booked Client Schedule */}
        <div className="space-y-4 pt-4 border-t border-[rgba(28,24,20,0.08)]">
          <h3 className="font-display font-bold text-xl text-[#181614]">Confirmed Client Calendar</h3>
          {bookings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] text-xs text-[#8E867B]">
              No confirmed appointments booked yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="p-5 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-2xs space-y-2 text-xs">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-[#B88555] font-mono">#{b.bookingRef}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {b.bookedDate} at {b.bookedTimeSlot}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#181614]">{b.customerName}</p>
                  <p className="text-[#575149]">Plan: {b.planName} • Fee: ₹{b.consultationFee}</p>
                  <div className="pt-2 border-t border-[rgba(28,24,20,0.06)] flex justify-between items-center">
                    <span className="text-[11px] text-[#8E867B]">{b.customerEmail}</span>
                    <a
                      href={b.meetingLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-[#28362B] text-white rounded-lg text-[10px] font-semibold"
                    >
                      Virtual Room ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acceptance Modal Dialog */}
      {activeRequestForResponse && (
        <div className="fixed inset-0 z-[10002] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="w-full max-w-lg bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(28,24,20,0.08)]">
              <div>
                <h4 className="font-display font-bold text-base text-[#181614]">
                  Accept Consultation for {activeRequestForResponse.customerName}
                </h4>
                <p className="text-[11px] text-[#575149]">Specify project timeline and consultation fee</p>
              </div>
              <button
                onClick={() => setActiveRequestForResponse(null)}
                className="w-7 h-7 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#575149] block mb-1">Estimated Days *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#575149] block mb-1">Proposed Start Date *</label>
                  <input
                    type="date"
                    required
                    value={proposedStartDate}
                    onChange={(e) => setProposedStartDate(e.target.value)}
                    className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Consultation Fee (₹) *</label>
                <input
                  type="number"
                  required
                  value={responseFee}
                  onChange={(e) => setResponseFee(Number(e.target.value))}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-bold text-[#B88555]"
                />
              </div>

              <div>
                <label className="font-bold text-[#575149] block mb-1">Architectural Review Note to Client</label>
                <textarea
                  rows={3}
                  required
                  value={responseNote}
                  onChange={(e) => setResponseNote(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614]"
                />
              </div>

              <div className="p-3 bg-[#EFECE6] rounded-xl text-[11px] text-[#575149]">
                ✓ 3 Consultation slots (Tomorrow 10:00 AM, 02:30 PM, Day After 11:30 AM) will be automatically opened for the client to book.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRequestForResponse(null)}
                  className="flex-1 py-2.5 rounded-xl bg-[#EFECE6] text-[#575149] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#28362B] text-white font-semibold shadow-md"
                >
                  Confirm Acceptance &amp; Send Slots ↗
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
