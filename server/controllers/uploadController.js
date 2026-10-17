import stream from "stream";
import { v2 as cloudinary } from "cloudinary";
import { getGridFSBucket } from "../config/db.js";

// Configure Cloudinary if environment variables are present
if (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
};

/**
 * Upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = "sthavya_blueprints") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Helper to upload buffer to MongoDB GridFS
 */
const uploadToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    if (!bucket) {
      return reject(new Error("GridFSBucket is not initialized (MongoDB not connected)."));
    }

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
      metadata: { uploadedAt: new Date() },
    });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    bufferStream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => {
        resolve({
          id: uploadStream.id,
          filename: uploadStream.filename,
        });
      });
  });
};

/**
 * @desc    Upload blueprint (Multer + Cloudinary / GridFS)
 * @route   POST /api/upload/blueprint
 * @access  Optional / Public
 */
export const uploadBlueprint = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided for upload." });
    }

    const file = req.file;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFilename = `blueprint_${Date.now()}_${sanitizedName}`;

    // 1. Try Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(file.buffer, "sthavya_blueprints");
        return res.status(201).json({
          success: true,
          message: "Blueprint uploaded successfully to Cloudinary.",
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          provider: "cloudinary",
          size: file.size,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to GridFS:", cloudErr.message);
      }
    }

    // 2. Try MongoDB GridFS
    try {
      const gridResult = await uploadToGridFS(file.buffer, uniqueFilename, file.mimetype);
      const fileUrl = `/api/upload/file/${gridResult.filename}`;

      return res.status(201).json({
        success: true,
        message: "Blueprint uploaded successfully to MongoDB GridFS.",
        url: fileUrl,
        filename: gridResult.filename,
        fileId: gridResult.id,
        provider: "gridfs",
        size: file.size,
      });
    } catch (gridError) {
      console.warn("GridFS storage failed, falling back to data URL:", gridError.message);
      const base64Url = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      return res.status(201).json({
        success: true,
        message: "Blueprint uploaded (embedded data format).",
        url: base64Url,
        filename: uniqueFilename,
        provider: "embedded",
        size: file.size,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Blueprint upload failed.",
      error: error.message,
    });
  }
};

/**
 * @desc    Upload interior space photograph or render (Multer + Cloudinary / GridFS)
 * @route   POST /api/upload/interior
 * @access  Optional / Public
 */
export const uploadInteriorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    const file = req.file;
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFilename = `interior_${Date.now()}_${sanitizedName}`;

    // 1. Try Cloudinary if configured
    if (isCloudinaryConfigured()) {
      try {
        const cloudResult = await uploadToCloudinary(file.buffer, "sthavya_interiors");
        return res.status(201).json({
          success: true,
          message: "Interior image uploaded successfully to Cloudinary.",
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          provider: "cloudinary",
          size: file.size,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to GridFS:", cloudErr.message);
      }
    }

    // 2. Try MongoDB GridFS
    try {
      const gridResult = await uploadToGridFS(file.buffer, uniqueFilename, file.mimetype);
      const fileUrl = `/api/upload/file/${gridResult.filename}`;

      return res.status(201).json({
        success: true,
        message: "Interior image uploaded successfully to MongoDB GridFS.",
        url: fileUrl,
        filename: gridResult.filename,
        fileId: gridResult.id,
        provider: "gridfs",
        size: file.size,
      });
    } catch (gridError) {
      console.warn("GridFS storage failed, falling back to data URL:", gridError.message);
      const base64Url = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
      return res.status(201).json({
        success: true,
        message: "Interior image uploaded (embedded format).",
        url: base64Url,
        filename: uniqueFilename,
        provider: "embedded",
        size: file.size,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image upload failed.",
      error: error.message,
    });
  }
};

/**
 * @desc    Stream uploaded file from MongoDB GridFS
 * @route   GET /api/upload/file/:filename
 * @access  Public
 */
export const getFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const bucket = getGridFSBucket();

    if (!bucket) {
      return res.status(503).json({ success: false, message: "Storage service not ready." });
    }

    const files = await bucket.find({ filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    const file = files[0];
    if (file.contentType) {
      res.set("Content-Type", file.contentType);
    }
    res.set("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.on("error", () => res.status(404).end());
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default { uploadBlueprint, uploadInteriorImage, getFile };
