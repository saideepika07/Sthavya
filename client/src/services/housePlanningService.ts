// House Planning Core Service
// Handles plot calculations, multi-criteria plan filtering, consultation workflows,
// slot booking with double-booking prevention, and transactional email generation

import { HOUSE_PLANS_DATA, type HousePlan } from "../data/housePlansData";
import { PROFESSIONALS_DIRECTORY, type ProfessionalProfile } from "../data/professionalsData";
import { bookingApi } from "./api";

export interface CustomPlotInputs {
  unit: "sq yd" | "sq ft" | "meters";
  area: number;
  length: number;
  width: number;
}

export interface PlotValidationResult {
  isValid: boolean;
  convertedAreaSqYd: number;
  convertedAreaSqFt: number;
  aspectRatio: number;
  minFrontSetbackFt: number;
  minRearSetbackFt: number;
  maxGroundCoverageSqFt: number;
  recommendedBhk: string;
  recommendedFloors: string;
  validationMessages: string[];
}

export interface ConsultationRequest {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  location: string;
  plotSizeSqYd: number;
  plotDimensions: string;
  bhk: string;
  floors: string;
  selectedPlanId: string;
  selectedPlanName: string;
  professionalId: string;
  professionalName: string;
  professionalCategory: string;
  workDescription: string;
  expectedCompletionDate: string;
  budgetLakhs: number;
  additionalRequirements: string;
  status: "pending" | "accepted" | "rejected" | "more_info_needed" | "booked";
  professionalResponse?: {
    estimatedDays: number;
    proposedStartDate: string;
    expectedCompletionDate: string;
    consultationFee: number;
    availableSlots: { date: string; time: string }[];
    responseNote?: string;
  };
}

export interface ConfirmedSlotBooking {
  id: string;
  consultationRequestId: string;
  bookingRef: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  professionalId: string;
  professionalName: string;
  professionalCategory: string;
  planName: string;
  bookedDate: string;
  bookedTimeSlot: string;
  consultationFee: number;
  paymentStatus: "paid" | "pending";
  paymentReference: string;
  meetingLink?: string;
  createdAt: string;
  status: "confirmed" | "completed" | "cancelled";
}

export interface TransactionalEmailLog {
  id: string;
  to: string;
  recipientName: string;
  recipientRole: "customer" | "professional" | "admin";
  subject: string;
  htmlBody: string;
  timestamp: string;
  read: boolean;
  category: "work_request" | "request_accepted" | "booking_confirmed" | "status_update";
}

const STORAGE_KEY_SAVED_PLANS = "STHAVYA_SAVED_PLANS";
const STORAGE_KEY_CONSULTATIONS = "STHAVYA_CONSULTATION_REQUESTS";
const STORAGE_KEY_BOOKINGS = "STHAVYA_CONFIRMED_BOOKINGS";
const STORAGE_KEY_EMAILS = "STHAVYA_TRANSACTIONAL_EMAILS";

export const housePlanningService = {
  // ─── 1. Plot Size & Dimension Validator ──────────────────────────────────────
  validatePlotDimensions(inputs: CustomPlotInputs): PlotValidationResult {
    let areaSqFt = 0;
    let lengthFt = inputs.length;
    let widthFt = inputs.width;

    if (inputs.unit === "sq yd") {
      areaSqFt = inputs.area * 9;
      // If length and width provided in yards
      if (lengthFt && widthFt) {
        lengthFt = lengthFt * 3;
        widthFt = widthFt * 3;
      }
    } else if (inputs.unit === "meters") {
      areaSqFt = inputs.area * 10.7639;
      if (lengthFt && widthFt) {
        lengthFt = lengthFt * 3.28084;
        widthFt = widthFt * 3.28084;
      }
    } else {
      areaSqFt = inputs.area;
    }

    // Auto-calculate missing dimension if area is given
    if (!lengthFt && !widthFt && areaSqFt > 0) {
      widthFt = Math.round(Math.sqrt(areaSqFt / 1.5));
      lengthFt = Math.round(areaSqFt / widthFt);
    } else if (lengthFt && !widthFt) {
      widthFt = Math.round(areaSqFt / lengthFt);
    } else if (widthFt && !lengthFt) {
      lengthFt = Math.round(areaSqFt / widthFt);
    }

    const convertedAreaSqYd = Math.round(areaSqFt / 9);
    const messages: string[] = [];
    let isValid = true;

    if (convertedAreaSqYd < 75) {
      isValid = false;
      messages.push("Minimum recommended residential plot size is 75 square yards (675 sq ft).");
    }

    if (widthFt < 18) {
      isValid = false;
      messages.push(`Plot width of ${widthFt.toFixed(1)} ft is too narrow for comfortable room circulation.`);
    }

    const aspectRatio = lengthFt > 0 && widthFt > 0 ? Number((lengthFt / widthFt).toFixed(2)) : 1.5;
    if (aspectRatio > 3.5) {
      messages.push("High aspect ratio (length > 3.5x width); layout will use linear courtyard circulation.");
    }

    // Standard residential setbacks
    const minFrontSetbackFt = convertedAreaSqYd >= 200 ? 10 : 6;
    const minRearSetbackFt = convertedAreaSqYd >= 200 ? 6 : 4;
    const maxGroundCoverageSqFt = Math.round(areaSqFt * 0.72);

    let recommendedBhk = "2 BHK";
    let recommendedFloors = "G+1";
    if (convertedAreaSqYd <= 90) {
      recommendedBhk = "1 BHK or 2 BHK";
      recommendedFloors = "Ground or G+1";
    } else if (convertedAreaSqYd <= 140) {
      recommendedBhk = "2 BHK or 3 BHK";
      recommendedFloors = "G+1";
    } else if (convertedAreaSqYd <= 220) {
      recommendedBhk = "3 BHK or 4 BHK";
      recommendedFloors = "G+1 or G+2";
    } else {
      recommendedBhk = "4 BHK or 5 BHK";
      recommendedFloors = "G+2 or G+3";
    }

    return {
      isValid,
      convertedAreaSqYd,
      convertedAreaSqFt: Math.round(areaSqFt),
      aspectRatio,
      minFrontSetbackFt,
      minRearSetbackFt,
      maxGroundCoverageSqFt,
      recommendedBhk,
      recommendedFloors,
      validationMessages: messages,
    };
  },

  // ─── 2. Smart House Plan Search & Filter ────────────────────────────────────
  getPlans(filters?: {
    plotSizeSqYd?: number;
    bhk?: number;
    floors?: string;
    designStyle?: string;
    maxBudgetLakhs?: number;
    hasParking?: boolean;
    search?: string;
  }): HousePlan[] {
    return HOUSE_PLANS_DATA.filter((plan) => {
      if (filters?.plotSizeSqYd && filters.plotSizeSqYd !== 0) {
        // Match exact or closest bracket
        if (Math.abs(plan.plotSizeSqYd - filters.plotSizeSqYd) > 35 && filters.plotSizeSqYd < 350) {
          return false;
        }
      }
      if (filters?.bhk && plan.bhk !== filters.bhk) {
        return false;
      }
      if (filters?.floors && filters.floors !== "All" && plan.floors !== filters.floors) {
        return false;
      }
      if (filters?.designStyle && filters.designStyle !== "All" && plan.designStyle !== filters.designStyle) {
        return false;
      }
      if (filters?.maxBudgetLakhs && plan.estimatedCostLakhs > filters.maxBudgetLakhs) {
        return false;
      }
      if (filters?.hasParking && !plan.parkingSpaces.toLowerCase().includes("car")) {
        return false;
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        const matchesName = plan.name.toLowerCase().includes(query);
        const matchesStyle = plan.designStyle.toLowerCase().includes(query);
        const matchesTagline = plan.tagline.toLowerCase().includes(query);
        if (!matchesName && !matchesStyle && !matchesTagline) return false;
      }
      return true;
    });
  },

  getPlanById(id: string): HousePlan | undefined {
    return HOUSE_PLANS_DATA.find((p) => p.id === id);
  },

  // ─── 3. Saved Plans Management ──────────────────────────────────────────────
  getSavedPlanIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SAVED_PLANS);
      return raw ? JSON.parse(raw) : ["plan-150-3bhk-g1-a"];
    } catch {
      return [];
    }
  },

  toggleSavePlan(planId: string): boolean {
    const current = this.getSavedPlanIds();
    let updated: string[];
    let isSaved = false;
    if (current.includes(planId)) {
      updated = current.filter((id) => id !== planId);
      isSaved = false;
    } else {
      updated = [...current, planId];
      isSaved = true;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_SAVED_PLANS, JSON.stringify(updated));
    }
    return isSaved;
  },

  // ─── 4. Consultation & Work Request System ──────────────────────────────────
  getConsultationRequests(): ConsultationRequest[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CONSULTATIONS);
      if (!raw) {
        // Initial seed consultation request for testing acceptance flow immediately
        const seed: ConsultationRequest[] = [
          {
            id: "req-101",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            customerName: "Deepika Reddy",
            customerPhone: "+91 98765 43210",
            customerEmail: "deepika.reddy@example.com",
            location: "Indiranagar, Bangalore",
            plotSizeSqYd: 150,
            plotDimensions: "45' x 30'",
            bhk: "3 BHK",
            floors: "G+1",
            selectedPlanId: "plan-150-3bhk-g1-a",
            selectedPlanName: "The Courtyard Haven 3BHK",
            professionalId: "pro-arch-1",
            professionalName: "Ar. Elena Rostova",
            professionalCategory: "Architect",
            workDescription: "Need structural review and municipality drawings for our 150 sq yd plot in Bangalore. We want to finalize the courtyard sunlight orientation.",
            expectedCompletionDate: "2026-11-20",
            budgetLakhs: 48,
            additionalRequirements: "Must have Vastu compliant Pooja alcove and pet-friendly ground floor balcony.",
            status: "accepted",
            professionalResponse: {
              estimatedDays: 15,
              proposedStartDate: "2026-10-15",
              expectedCompletionDate: "2026-10-30",
              consultationFee: 2500,
              availableSlots: [
                { date: "Tomorrow", time: "10:00 AM" },
                { date: "Tomorrow", time: "02:00 PM" },
                { date: "Day After", time: "11:00 AM" },
              ],
              responseNote: "Reviewed the plot specs. 45'x30' is ideal for the Courtyard Haven layout. I have configured 3 consultation slots for an architectural walkthrough.",
            },
          },
        ];
        window.localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  createConsultationRequest(payload: Omit<ConsultationRequest, "id" | "createdAt" | "status">): ConsultationRequest {
    const newReq: ConsultationRequest = {
      ...payload,
      id: `req-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const current = this.getConsultationRequests();
    const updated = [newReq, ...current];
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(updated));
    }

    // Trigger simulated transactional email to the professional
    this.sendTransactionalEmail({
      to: "pro.notifications@sthavya.example",
      recipientName: payload.professionalName,
      recipientRole: "professional",
      subject: `New Client Work Request: ${payload.customerName} (${payload.plotSizeSqYd} sq yd, ${payload.bhk})`,
      category: "work_request",
      htmlBody: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #181614;">
          <h2 style="color: #B88555;">New Architectural Consultation Request</h2>
          <p>Hello <strong>${payload.professionalName}</strong>,</p>
          <p>You have received a new high-intent client request on Sthavya:</p>
          <ul>
            <li><strong>Client Name:</strong> ${payload.customerName}</li>
            <li><strong>Contact:</strong> ${payload.customerPhone} | ${payload.customerEmail}</li>
            <li><strong>Location:</strong> ${payload.location}</li>
            <li><strong>Plot Size:</strong> ${payload.plotSizeSqYd} sq yd (${payload.plotDimensions})</li>
            <li><strong>Requirement:</strong> ${payload.bhk} • ${payload.floors}</li>
            <li><strong>Selected Concept:</strong> ${payload.selectedPlanName}</li>
            <li><strong>Client Budget:</strong> ₹${payload.budgetLakhs} Lakhs</li>
            <li><strong>Work Scope:</strong> ${payload.workDescription}</li>
          </ul>
          <p>Please log in to your <strong>Professional Dashboard</strong> to Accept or Reject this request and assign your available consultation time slots.</p>
        </div>
      `,
    });

    return newReq;
  },

  respondToConsultationRequest(
    requestId: string,
    action: "accepted" | "rejected" | "more_info_needed",
    responseDetails?: {
      estimatedDays?: number;
      proposedStartDate?: string;
      expectedCompletionDate?: string;
      consultationFee?: number;
      availableSlots?: { date: string; time: string }[];
      responseNote?: string;
    }
  ): ConsultationRequest | null {
    const list = this.getConsultationRequests();
    const target = list.find((r) => r.id === requestId);
    if (!target) return null;

    target.status = action;
    if (action === "accepted" && responseDetails) {
      target.professionalResponse = {
        estimatedDays: responseDetails.estimatedDays || 14,
        proposedStartDate: responseDetails.proposedStartDate || new Date().toISOString().split("T")[0],
        expectedCompletionDate: responseDetails.expectedCompletionDate || "",
        consultationFee: responseDetails.consultationFee || 2500,
        availableSlots: responseDetails.availableSlots || [
          { date: "Tomorrow", time: "10:30 AM" },
          { date: "Tomorrow", time: "03:00 PM" },
          { date: "Day After", time: "11:00 AM" },
        ],
        responseNote: responseDetails.responseNote || "Accepted work scope. Please select your meeting slot.",
      };

      // Email customer that professional accepted
      this.sendTransactionalEmail({
        to: target.customerEmail,
        recipientName: target.customerName,
        recipientRole: "customer",
        subject: `Work Request Accepted by ${target.professionalName}! Book Your Slot`,
        category: "request_accepted",
        htmlBody: `
          <div style="font-family: sans-serif; line-height: 1.5; color: #181614;">
            <h2 style="color: #28362B;">Good News! Your Consultation is Approved</h2>
            <p>Dear <strong>${target.customerName}</strong>,</p>
            <p><strong>${target.professionalName}</strong> (${target.professionalCategory}) has reviewed your plot requirements for <em>${target.selectedPlanName}</em> and accepted your request.</p>
            <p><strong>Proposed Timeline:</strong> ${responseDetails.estimatedDays || 14} working days</p>
            <p><strong>Consultation Fee:</strong> ₹${responseDetails.consultationFee || 2500}</p>
            <p>Please visit your <strong>User Dashboard</strong> to select your preferred date & time slot to lock your booking.</p>
          </div>
        `,
      });
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(list));
    }
    return target;
  },

  // ─── 5. Slot Booking with Double-Booking Prevention ─────────────────────────
  getBookings(): ConfirmedSlotBooking[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_BOOKINGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  isSlotBooked(professionalId: string, date: string, timeSlot: string): boolean {
    const existing = this.getBookings();
    return existing.some(
      (b) =>
        b.professionalId === professionalId &&
        b.bookedDate === date &&
        b.bookedTimeSlot === timeSlot &&
        b.status !== "cancelled"
    );
  },

  confirmSlotBooking(payload: {
    consultationRequestId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    professionalId: string;
    professionalName: string;
    professionalCategory: string;
    planName: string;
    bookedDate: string;
    bookedTimeSlot: string;
    consultationFee: number;
    paymentReference: string;
  }): { success: boolean; booking?: ConfirmedSlotBooking; message?: string } {
    // 1. Strict Double-Booking Check
    if (this.isSlotBooked(payload.professionalId, payload.bookedDate, payload.bookedTimeSlot)) {
      return {
        success: false,
        message: `This slot (${payload.bookedDate} at ${payload.bookedTimeSlot}) has just been taken by another client. Please select another slot.`,
      };
    }

    const bookingRef = `STHAVYA-BK-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: ConfirmedSlotBooking = {
      id: `bk-${Date.now().toString(36)}`,
      consultationRequestId: payload.consultationRequestId,
      bookingRef,
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      customerPhone: payload.customerPhone,
      professionalId: payload.professionalId,
      professionalName: payload.professionalName,
      professionalCategory: payload.professionalCategory,
      planName: payload.planName,
      bookedDate: payload.bookedDate,
      bookedTimeSlot: payload.bookedTimeSlot,
      consultationFee: payload.consultationFee,
      paymentStatus: "paid",
      paymentReference: payload.paymentReference,
      meetingLink: `https://meet.sthavya.example/${bookingRef}`,
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };

    const currentBookings = this.getBookings();
    const updated = [newBooking, ...currentBookings];
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(updated));
    }

    // Sync booking with backend MongoDB API & broadcast via WebSockets
    bookingApi
      .createBooking({
        clientName: payload.customerName,
        clientPhone: payload.customerPhone,
        clientEmail: payload.customerEmail,
        workerId: payload.professionalId,
        workerName: payload.professionalName,
        workerCategory: payload.professionalCategory,
        days: 1,
        dayRate: payload.consultationFee,
        scopeContext: `Slot Consultation: ${payload.planName} (${payload.bookedDate} at ${payload.bookedTimeSlot})`,
        notes: `Ref: ${payload.paymentReference} | Meeting: ${newBooking.meetingLink}`,
      })
      .catch((e) => console.warn("Backend booking sync note:", e.message));

    // Update status in consultation request
    const consultations = this.getConsultationRequests();
    const match = consultations.find((c) => c.id === payload.consultationRequestId);

    if (match) {
      match.status = "booked";
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_CONSULTATIONS, JSON.stringify(consultations));
      }
    }

    // Send confirmation email to Customer
    this.sendTransactionalEmail({
      to: payload.customerEmail,
      recipientName: payload.customerName,
      recipientRole: "customer",
      subject: `Booking Confirmed #${bookingRef} with ${payload.professionalName}`,
      category: "booking_confirmed",
      htmlBody: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #181614;">
          <h2 style="color: #B88555;">Consultation Slot Confirmed (#${bookingRef})</h2>
          <p>Thank you, <strong>${payload.customerName}</strong>. Your architectural consultation is confirmed:</p>
          <ul>
            <li><strong>Professional:</strong> ${payload.professionalName} (${payload.professionalCategory})</li>
            <li><strong>Date & Time:</strong> ${payload.bookedDate} at ${payload.bookedTimeSlot}</li>
            <li><strong>House Plan:</strong> ${payload.planName}</li>
            <li><strong>Virtual Studio Link:</strong> <a href="${newBooking.meetingLink}">${newBooking.meetingLink}</a></li>
            <li><strong>Amount Paid:</strong> ₹${payload.consultationFee} (Ref: ${payload.paymentReference})</li>
          </ul>
        </div>
      `,
    });

    // Send confirmation email to Professional
    this.sendTransactionalEmail({
      to: "pro.calendar@sthavya.example",
      recipientName: payload.professionalName,
      recipientRole: "professional",
      subject: `New Calendar Booking #${bookingRef} from ${payload.customerName}`,
      category: "booking_confirmed",
      htmlBody: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #181614;">
          <h2 style="color: #28362B;">Client Appointment Booked (#${bookingRef})</h2>
          <p>Hi <strong>${payload.professionalName}</strong>, client <strong>${payload.customerName}</strong> has locked their consultation slot:</p>
          <p><strong>Scheduled:</strong> ${payload.bookedDate} at ${payload.bookedTimeSlot}</p>
          <p><strong>Plot Plan:</strong> ${payload.planName}</p>
          <p>Check your Professional Dashboard calendar for project attachments and 2D CAD files.</p>
        </div>
      `,
    });

    return { success: true, booking: newBooking };
  },

  // ─── 6. Transactional Email & Notification Center ───────────────────────────
  getEmailLogs(): TransactionalEmailLog[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_EMAILS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  sendTransactionalEmail(email: Omit<TransactionalEmailLog, "id" | "timestamp" | "read">) {
    const newEntry: TransactionalEmailLog = {
      ...email,
      id: `email-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const current = this.getEmailLogs();
    const updated = [newEntry, ...current].slice(0, 30); // keep last 30
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(updated));
    }
    return newEntry;
  },

  markEmailRead(id: string) {
    const emails = this.getEmailLogs();
    const target = emails.find((e) => e.id === id);
    if (target) {
      target.read = true;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY_EMAILS, JSON.stringify(emails));
      }
    }
  },
};
