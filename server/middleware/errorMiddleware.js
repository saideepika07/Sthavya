// Not Found (404) Route Handler
export const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred.",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default { notFound, errorHandler };
