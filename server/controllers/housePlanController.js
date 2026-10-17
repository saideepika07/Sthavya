import mongoose from "mongoose";
import HousePlan from "../models/HousePlan.js";

/**
 * @desc    Save a new house plan
 * @route   POST /api/plans
 * @access  Optional / Authenticated
 */
export const createHousePlan = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.body.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required to create and save house plans.",
      });
    }
    const {
      title,
      tagline,
      inputs,
      rooms,
      floors,
      floorsCount,
      hasPenthouse = false,
      floorsData,
      totalSqFt,
      auditResult,
      blueprintImageUrl,
      svgContent,
      isPublic = true,
    } = req.body;

    const finalRooms = rooms && Array.isArray(rooms) && rooms.length > 0
      ? rooms
      : floors && Array.isArray(floors) && floors[0]?.rooms
      ? floors[0].rooms
      : [];

    if (finalRooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Plan must contain at least one configured room.",
      });
    }

    const calculatedSqFt = totalSqFt ||
      (floors && Array.isArray(floors) && floors.length > 0
        ? floors.reduce((acc, f) => acc + (f.totalSqFt || f.builtUpAreaSqFt || 0), 0)
        : finalRooms.reduce((acc, r) => acc + (r.sqFt || 0), 0));

    const finalFloorsCount = floorsCount || (floors?.length || 1);
    const finalHasPenthouse = Boolean(hasPenthouse || inputs?.hasPenthouse);

    const planId = `plan-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const plan = await HousePlan.create({
      planId,
      userId,
      title: title || `Bespoke ${inputs?.style || "Modern"} ${inputs?.floors || "G+1"} Floor Plan`,
      tagline: tagline || "",
      isPublic: Boolean(isPublic),
      inputs: inputs || {},
      floorsCount: finalFloorsCount,
      hasPenthouse: finalHasPenthouse,
      floors: floors || [
        {
          level: 0,
          label: "Ground Floor",
          rooms: finalRooms,
          totalSqFt: calculatedSqFt,
          builtUpAreaSqFt: calculatedSqFt,
          carpetAreaSqFt: Math.round(calculatedSqFt * 0.8),
        },
      ],
      rooms: finalRooms,
      floorsData: floorsData || [],
      totalSqFt: calculatedSqFt,
      auditResult: auditResult || {},
      blueprintImageUrl: blueprintImageUrl || "",
      svgContent: svgContent || "",
      status: "finalized",
    });

    res.status(201).json({
      success: true,
      message: "House plan saved successfully.",
      plan,
      shareUrl: `/plan/${plan._id}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save house plan.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get house plans (user plans if logged in, or public catalog)
 * @route   GET /api/plans
 * @access  Public / Authenticated
 */
export const getHousePlans = async (req, res) => {
  try {
    const { userId, search, bhk, style, maxBudget, catalog } = req.query;
    const filter = {};

    if (catalog === "true") {
      filter.isPublic = true;
    } else if (req.user) {
      filter.userId = req.user._id.toString();
    } else if (userId) {
      filter.userId = userId;
    } else {
      filter.isPublic = true;
    }

    if (bhk && bhk !== "All") {
      filter["inputs.bhk"] = bhk;
    }

    if (style && style !== "All") {
      filter["inputs.style"] = style;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { tagline: regex }, { "inputs.style": regex }];
    }

    const plans = await HousePlan.find(filter).sort({ createdAt: -1 }).limit(60);

    res.json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch house plans.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single house plan by ID or planId (Public or Owned)
 * @route   GET /api/plans/:id
 * @access  Public
 */
export const getHousePlanById = async (req, res) => {
  try {
    const { id } = req.params;
    let plan = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      plan = await HousePlan.findById(id);
    }

    if (!plan) {
      plan = await HousePlan.findOne({ planId: id });
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "House plan not found.",
      });
    }

    res.json({
      success: true,
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve house plan.",
      error: error.message,
    });
  }
};

/**
 * @desc    Update rooms / layout in an existing house plan (or collaborative edit)
 * @route   PUT /api/plans/:id
 * @access  Public / Optional Auth
 */
export const updateHousePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { rooms, floors, floorsCount, hasPenthouse, title, inputs, auditResult, isPublic } = req.body;

    let plan = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      plan = await HousePlan.findById(id);
    } else {
      plan = await HousePlan.findOne({ planId: id });
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "House plan not found for updating.",
      });
    }

    if (floors && Array.isArray(floors)) {
      plan.floors = floors;
      plan.floorsCount = floorsCount || floors.length;
      plan.totalSqFt = floors.reduce((acc, f) => acc + (f.totalSqFt || f.builtUpAreaSqFt || 0), 0);
      if (!rooms || rooms.length === 0) {
        plan.rooms = floors[0]?.rooms || [];
      }
    } else if (rooms && Array.isArray(rooms)) {
      plan.rooms = rooms;
      plan.totalSqFt = rooms.reduce((acc, r) => acc + (r.sqFt || 0), 0);
    }

    if (typeof hasPenthouse === "boolean") plan.hasPenthouse = hasPenthouse;
    if (title) plan.title = title;
    if (inputs) plan.inputs = { ...plan.inputs, ...inputs };
    if (auditResult) plan.auditResult = auditResult;
    if (typeof isPublic === "boolean") plan.isPublic = isPublic;

    await plan.save();

    res.json({
      success: true,
      message: "House plan updated successfully.",
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update house plan.",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a house plan
 * @route   DELETE /api/plans/:id
 * @access  Private
 */
export const deleteHousePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await HousePlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "House plan not found.",
      });
    }

    // Ensure only owner or admin can delete
    if (req.user && plan.userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to delete this plan.",
      });
    }

    await plan.deleteOne();

    res.json({
      success: true,
      message: "House plan deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  createHousePlan,
  getHousePlans,
  getHousePlanById,
  updateHousePlan,
  deleteHousePlan,
};
