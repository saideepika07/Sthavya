import mongoose from "mongoose";
import Architect from "../models/Architect.js";

/**
 * @desc    Get list of all certified architects
 * @route   GET /api/architects
 * @access  Public
 */
export const getArchitects = async (req, res) => {
  try {
    const { location, search } = req.query;
    const query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { specialties: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const architects = await Architect.find(query).sort({ rating: -1 });

    res.json({
      success: true,
      count: architects.length,
      architects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve architects from database.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get architect by ID
 * @route   GET /api/architects/:id
 * @access  Public
 */
export const getArchitectById = async (req, res) => {
  try {
    const { id } = req.params;

    let architect = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      architect = await Architect.findById(id);
    }

    if (!architect) {
      architect = await Architect.findOne({
        $or: [{ name: new RegExp(id, "i") }],
      });
    }

    if (!architect) {
      return res.status(404).json({
        success: false,
        message: "Architect not found.",
      });
    }

    res.json({
      success: true,
      architect,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database query failed.",
      error: error.message,
    });
  }
};

export default { getArchitects, getArchitectById };
