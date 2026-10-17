import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "application/pdf",
    "application/octet-stream",
  ];

  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|svg|pdf|dwg|dxf)$/i)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Supported formats: JPEG, PNG, WEBP, SVG, PDF, DWG, DXF."
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  },
  fileFilter,
});

export default upload;
