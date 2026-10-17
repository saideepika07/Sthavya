import { useState } from "react";
import { housePlanningService, type ConsultationRequest, type ConfirmedSlotBooking } from "../services/housePlanningService";

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ConsultationRequest;
  onBookingConfirmed: (booking: ConfirmedSlotBooking) => void;
}

export default function SlotBookingModal({
  isOpen,
  onClose,
  request,
  onBookingConfirmed,
}: SlotBookingModalProps) {
  const availableSlots = request.professionalResponse?.availableSlots || [
    { date: "Tomorrow", time: "10:00 AM" },
    { date: "Tomorrow", time: "02:30 PM" },
    { date: "Day After", time: "11:00 AM" },
    { date: "Day After", time: "04:00 PM" },
  ];

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("client@oksbi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const fee = request.professionalResponse?.consultationFee || 2500;
  const gst = Math.round(fee * 0.18);
  const totalAmount = fee + gst;

  const chosenSlot = availableSlots[selectedSlotIndex] || availableSlots[0];

  // Double-booking check
  const isAlreadyBooked = housePlanningService.isSlotBooked(
    request.professionalId,
    chosenSlot.date,
    chosenSlot.time
  );

  const handleConfirmAndPay = () => {
    setErrorMessage(null);
    setIsProcessing(true);

    setTimeout(() => {
      const paymentRef = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const result = housePlanningService.confirmSlotBooking({
        consultationRequestId: request.id,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        professionalId: request.professionalId,
        professionalName: request.professionalName,
        professionalCategory: request.professionalCategory,
        planName: request.selectedPlanName,
        bookedDate: chosenSlot.date,
        bookedTimeSlot: chosenSlot.time,
        consultationFee: totalAmount,
        paymentReference: paymentRef,
      });

      setIsProcessing(false);

      if (result.success && result.booking) {
        onBookingConfirmed(result.booking);
        onClose();
      } else {
        setErrorMessage(result.message || "Slot booking failed due to a schedule conflict. Please choose another slot.");
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn select-none">
      <div className="w-full max-w-xl bg-[#FAF8F5] border border-[rgba(28,24,20,0.15)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#181614] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              📅
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Book Consultation Slot with {request.professionalName}
              </h3>
              <p className="text-xs text-white/60">
                Guaranteed slot reservation • Real-time double booking prevention
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

        <div className="p-6 space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project Context Pill */}
          <div className="p-3.5 bg-[#EFECE6] rounded-2xl space-y-1">
            <div className="flex justify-between font-semibold text-[#181614]">
              <span>House Plan: {request.selectedPlanName}</span>
              <span className="text-[#B88555] font-mono">{request.bhk} • {request.floors}</span>
            </div>
            <p className="text-[11px] text-[#575149]">
              Estimated Duration: <strong>{request.professionalResponse?.estimatedDays || 14} Days</strong> • Proposed Start: <strong>{request.professionalResponse?.proposedStartDate || "Immediate"}</strong>
            </p>
          </div>

          {/* Available Slots Grid */}
          <div>
            <label className="font-bold text-[#575149] block mb-2 uppercase tracking-wider text-[11px]">
              Select Available Appointment Slot
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {availableSlots.map((slot, idx) => {
                const booked = housePlanningService.isSlotBooked(
                  request.professionalId,
                  slot.date,
                  slot.time
                );
                const isSelected = selectedSlotIndex === idx;

                return (
                  <button
                    key={`${slot.date}-${slot.time}`}
                    type="button"
                    disabled={booked}
                    onClick={() => setSelectedSlotIndex(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      booked
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                        : isSelected
                        ? "bg-white border-[#B88555] ring-2 ring-[#B88555]/20 shadow-xs"
                        : "bg-white/80 border-[rgba(28,24,20,0.12)] hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-[#181614]">{slot.date}</span>
                      {booked ? (
                        <span className="text-[9px] font-mono uppercase bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                          Booked
                        </span>
                      ) : isSelected ? (
                        <span className="text-[9px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-emerald-600">Available</span>
                      )}
                    </div>
                    <span className="font-mono text-sm font-bold text-[#28362B] block mt-1">
                      {slot.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-[rgba(28,24,20,0.08)]">
            <label className="font-bold text-[#575149] block mb-2 uppercase tracking-wider text-[11px]">
              Consultation Fee &amp; Payment Gateway
            </label>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { id: "upi", label: "⚡ UPI / QR" },
                { id: "card", label: "💳 Credit / Debit" },
                { id: "netbanking", label: "🏛 Net Banking" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                    paymentMethod === m.id
                      ? "bg-[#181614] text-white border-[#181614]"
                      : "bg-white text-[#575149] border-[rgba(28,24,20,0.15)]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {paymentMethod === "upi" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter UPI ID (e.g. yourname@okhdfcbank)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-white border border-[rgba(28,24,20,0.15)] rounded-xl p-2.5 text-[#181614] font-mono"
                />
              </div>
            )}

            {/* Fee Breakdown */}
            <div className="p-3 mt-3 bg-white rounded-2xl border border-[rgba(28,24,20,0.08)] space-y-1.5">
              <div className="flex justify-between text-[#8E867B]">
                <span>Architect Consultation Fee:</span>
                <span className="font-mono text-[#181614]">₹{fee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#8E867B]">
                <span>GST (18%):</span>
                <span className="font-mono text-[#181614]">₹{gst.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[rgba(28,24,20,0.06)] font-bold text-sm text-[#181614]">
                <span>Total Payable:</span>
                <span className="font-display text-[#B88555]">₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirmAndPay}
              disabled={isProcessing || isAlreadyBooked}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#B88555] hover:bg-[#A07144] text-white font-semibold text-sm transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              {isProcessing
                ? "Processing Secure Payment & Locking Slot..."
                : isAlreadyBooked
                ? "Selected Slot is Unavailable"
                : `Pay ₹${totalAmount.toLocaleString("en-IN")} & Lock Consultation Slot ↗`}
            </button>
            <p className="text-[10px] text-center text-[#8E867B] mt-2">
              🔒 Instant calendar invite &amp; virtual studio room link will be emailed immediately upon confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
