import { useState, useEffect } from "react";
import { HOUSE_PLANS_DATA } from "../data/housePlansData";
import { PROFESSIONALS_DIRECTORY } from "../data/professionalsData";
import { housePlanningService, type ConsultationRequest, type ConfirmedSlotBooking } from "../services/housePlanningService";

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export default function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [bookings, setBookings] = useState<ConfirmedSlotBooking[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "plans" | "pros" | "bookings" | "consultations">("overview");

  useEffect(() => {
    setConsultations(housePlanningService.getConsultationRequests());
    setBookings(housePlanningService.getBookings());
  }, []);

  const totalRevenue = bookings.reduce((acc, b) => acc + b.consultationFee, 0);

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] pb-20 select-none">
      {/* Top Admin Banner */}
      <div className="bg-[#181614] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono">
              <span>🔒</span>
              <span>ADMINISTRATIVE OPERATIONS CONSOLE</span>
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              STHAVYA Master Administration
            </h1>
            <p className="text-xs text-white/70 max-w-xl font-mono">
              Global catalog oversight, double-booking validation, transactional communication logs, and marketplace revenue.
            </p>
          </div>

          <button
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
          >
            ← Exit Admin Mode
          </button>
        </div>
      </div>

      {/* Admin KPI Ribbon */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-xs">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase block">House Plans</span>
            <span className="font-display font-bold text-xl text-[#181614]">{HOUSE_PLANS_DATA.length}</span>
            <span className="text-[10px] text-[#8E867B] block mt-0.5">Multi-Floor CAD</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-xs">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Professionals</span>
            <span className="font-display font-bold text-xl text-[#181614]">{PROFESSIONALS_DIRECTORY.length}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">9 Specializations</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-xs">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Consultations</span>
            <span className="font-display font-bold text-xl text-[#181614]">{consultations.length}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Active Requests</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-xs">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Total Bookings</span>
            <span className="font-display font-bold text-xl text-[#28362B]">{bookings.length}</span>
            <span className="text-[10px] text-blue-700 block mt-0.5">Zero Conflicts</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[rgba(28,24,20,0.1)] shadow-xs">
            <span className="text-[10px] font-mono text-[#8E867B] uppercase block">Platform Volume</span>
            <span className="font-display font-bold text-xl text-[#B88555]">₹{totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">100% Settled</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="flex items-center gap-2 border-b border-[rgba(28,24,20,0.1)] pb-2 text-xs font-semibold">
          {[
            { id: "overview", label: "📊 Operations Overview" },
            { id: "plans", label: "📐 House Plans Catalogue" },
            { id: "pros", label: "👥 Verified Professionals" },
            { id: "consultations", label: "📋 Consultations Audit" },
            { id: "bookings", label: "📅 Bookings & Slots" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === t.id
                  ? "bg-[#181614] text-white shadow-xs"
                  : "text-[#575149] hover:bg-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] shadow-xs space-y-4">
              <h3 className="font-display font-bold text-base text-[#181614]">Recent Consultation Requests</h3>
              <div className="space-y-2 text-xs">
                {consultations.slice(0, 5).map((c) => (
                  <div key={c.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-[#181614]">{c.customerName}</strong>
                      <span className="text-[#8E867B] block text-[11px]">{c.selectedPlanName} • {c.location}</span>
                    </div>
                    <span className="font-mono uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] shadow-xs space-y-4">
              <h3 className="font-display font-bold text-base text-[#181614]">Active Calendar Bookings</h3>
              <div className="space-y-2 text-xs">
                {bookings.length === 0 ? (
                  <p className="text-[#8E867B] py-6 text-center">No bookings registered yet.</p>
                ) : (
                  bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-[#181614]">{b.customerName}</strong>
                        <span className="text-[#8E867B] block text-[11px]">With {b.professionalName} ({b.bookedDate} {b.bookedTimeSlot})</span>
                      </div>
                      <span className="font-mono text-[#B88555] font-bold">₹{b.consultationFee}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: House Plans */}
        {activeTab === "plans" && (
          <div className="mt-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(28,24,20,0.08)] text-[#8E867B] font-mono uppercase text-[10px]">
                  <th className="pb-3">Plan Name</th>
                  <th className="pb-3">Plot Size</th>
                  <th className="pb-3">Config</th>
                  <th className="pb-3">Built-up</th>
                  <th className="pb-3">Est. Cost</th>
                  <th className="pb-3">Circulation</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,24,20,0.06)]">
                {HOUSE_PLANS_DATA.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#181614]">{p.name} ({p.variation})</td>
                    <td className="py-3">{p.plotSizeSqYd} sq yd ({p.plotDimensions.lengthFt}&apos;×{p.plotDimensions.widthFt}&apos;)</td>
                    <td className="py-3">{p.bhk} BHK • {p.floors}</td>
                    <td className="py-3 font-mono">{p.builtUpAreaSqFt} sq.ft</td>
                    <td className="py-3 font-bold text-[#B88555]">₹{p.estimatedCostLakhs} L</td>
                    <td className="py-3 text-emerald-700 font-bold">{p.circulationRating}/10</td>
                    <td className="py-3"><span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Active CAD</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Professionals */}
        {activeTab === "pros" && (
          <div className="mt-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[rgba(28,24,20,0.08)] text-[#8E867B] font-mono uppercase text-[10px]">
                  <th className="pb-3">Professional</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Experience</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Fee / Session</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(28,24,20,0.06)]">
                {PROFESSIONALS_DIRECTORY.map((pro) => (
                  <tr key={pro.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-bold text-[#181614] flex items-center gap-2">
                      <img src={pro.avatar} alt={pro.name} className="w-7 h-7 rounded-full object-cover" />
                      <span>{pro.name}</span>
                    </td>
                    <td className="py-3">{pro.category}</td>
                    <td className="py-3">{pro.experience} Years</td>
                    <td className="py-3">{pro.location}</td>
                    <td className="py-3 font-mono font-bold text-[#B88555]">₹{pro.consultationFee}</td>
                    <td className="py-3 text-emerald-700 font-bold">★ {pro.rating}</td>
                    <td className="py-3"><span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold uppercase">Verified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Consultations */}
        {activeTab === "consultations" && (
          <div className="mt-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-base text-[#181614]">Consultation Request Log</h3>
            <div className="space-y-2 text-xs">
              {consultations.map((c) => (
                <div key={c.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#8E867B]">#{c.id}</span>
                    <strong className="text-[#181614] ml-2">{c.customerName}</strong>
                    <span className="text-[#575149] ml-2">({c.customerPhone})</span>
                    <p className="text-[11px] text-[#8E867B] mt-0.5">Assigned: {c.professionalName} • {c.selectedPlanName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{c.status}</span>
                    <span className="text-[11px] text-[#8E867B] block mt-0.5">₹{c.budgetLakhs} L Budget</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Bookings */}
        {activeTab === "bookings" && (
          <div className="mt-6 bg-white rounded-3xl border border-[rgba(28,24,20,0.1)] p-6 shadow-xs space-y-3">
            <h3 className="font-display font-bold text-base text-[#181614]">Confirmed Appointments &amp; Payments</h3>
            <div className="space-y-2 text-xs">
              {bookings.map((b) => (
                <div key={b.id} className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[#B88555] font-bold">#{b.bookingRef}</span>
                    <strong className="text-[#181614] ml-2">{b.customerName}</strong>
                    <span className="text-[#575149] ml-2">booked with {b.professionalName}</span>
                    <p className="text-[11px] text-[#8E867B] mt-0.5">Scheduled: {b.bookedDate} at {b.bookedTimeSlot} • Paid: ₹{b.consultationFee}</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
