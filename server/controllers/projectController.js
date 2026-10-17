import mongoose from "mongoose";
import SavedProject from "../models/SavedProject.js";

/**
 * @desc    Save an AI Interior Project
 * @route   POST /api/projects
 * @access  Optional Auth
 */
export const saveProject = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.body.userId || "anonymous";
    const {
      title,
      roomType,
      style,
      dimensions,
      budgetTier,
      userNotes,
      enhancedPrompt,
      designSummary,
      imageUrl,
      productMarkers,
      blueprintModifications,
      redesignedRooms,
      totalSqFtGained,
    } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "imageUrl is required to save an AI Interior Project.",
      });
    }

    const project = await SavedProject.create({
      userId,
      title: title || `${style || "Modern"} ${roomType || "Living Room"} Concept`,
      roomType: roomType || "Living Room",
      style: style || "Modern",
      dimensions: dimensions || "16ft × 14ft",
      budgetTier: budgetTier || "₹18-25 Lakhs",
      userNotes: userNotes || "",
      enhancedPrompt: enhancedPrompt || "",
      designSummary: designSummary || "",
      imageUrl,
      productMarkers: productMarkers || [],
      blueprintModifications: blueprintModifications || [],
      redesignedRooms: redesignedRooms || [],
      totalSqFtGained: totalSqFtGained || "",
    });

    res.status(201).json({
      success: true,
      message: "AI project saved successfully.",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving AI project.",
      error: error.message,
    });
  }
};

/**
 * @desc    Get saved projects for a user
 * @route   GET /api/projects
 * @access  Optional Auth
 */
export const getProjects = async (req, res) => {
  try {
    const userId = req.user?._id?.toString() || req.query.userId;
    const filter = userId ? { userId } : {};

    const projects = await SavedProject.find(filter).sort({ createdAt: -1 }).limit(50);

    res.json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID." });
    }

    const project = await SavedProject.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update project by ID
 * @route   PUT /api/projects/:id
 * @access  Private / Optional Auth
 */
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await SavedProject.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.json({ success: true, message: "Project updated.", project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete project by ID
 * @route   DELETE /api/projects/:id
 * @access  Private / Optional Auth
 */
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await SavedProject.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    await project.deleteOne();
    res.json({ success: true, message: "Project deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { saveProject, getProjects, getProjectById, updateProject, deleteProject };


