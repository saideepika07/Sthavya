import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import housePlanRoutes from "./routes/housePlanRoutes.js";
import architectRoutes from "./routes/architectRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Trust proxy for Render / Vercel so rate limiters track real client IPs
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Initialize Database
connectDB();

// ─── CORS CONFIGURATION ───────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:8443",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8443",
  "http://127.0.0.1:5173",
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
};

// ─── SECURITY MIDDLEWARES ────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin previews & SVG canvases
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(mongoSanitize());

// ─── RATE LIMITING ───────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { success: false, message: "Too many requests from this IP. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many authentication attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: { success: false, message: "AI compute limit reached (15 calls/min). Please pause for a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, message: "Booking request limit reached. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", generalLimiter);

// ─── SOCKET.IO REAL-TIME COLLABORATION & NOTIFICATIONS ───────────────────────
export const io = new Server(server, {
  cors: corsOptions,
});

// Active collaborators map: planId -> Set of { socketId, userId, name, color }
const planCollaborators = new Map();

io.on("connection", (socket) => {
  // Join user-specific notification channel
  socket.on("join:user", (userId) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  // Real-time collaborative floor plan editing
  socket.on("plan:join", ({ planId, user }) => {
    if (!planId) return;
    socket.join(`plan:${planId}`);

    if (!planCollaborators.has(planId)) {
      planCollaborators.set(planId, new Map());
    }

    const planUsers = planCollaborators.get(planId);
    const collaborator = {
      socketId: socket.id,
      userId: user?.id || user?._id || "guest",
      name: user?.name || user?.displayName || "Guest Designer",
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`,
    };
    planUsers.set(socket.id, collaborator);

    // Notify all peers in this plan room
    io.to(`plan:${planId}`).emit("plan:collaborators-updated", {
      planId,
      collaborators: Array.from(planUsers.values()),
    });
  });

  // Room moved / dragged
  socket.on("plan:room-move", ({ planId, roomId, x, y, user }) => {
    socket.to(`plan:${planId}`).emit("plan:room-moved", { roomId, x, y, user });
  });

  // Room attributes modified (color, dimensions, label, furniture)
  socket.on("plan:room-update", ({ planId, room, user }) => {
    socket.to(`plan:${planId}`).emit("plan:room-updated", { room, user });
  });

  // New room placed
  socket.on("plan:room-add", ({ planId, room, user }) => {
    socket.to(`plan:${planId}`).emit("plan:room-added", { room, user });
  });

  // Room removed
  socket.on("plan:room-delete", ({ planId, roomId, user }) => {
    socket.to(`plan:${planId}`).emit("plan:room-deleted", { roomId, user });
  });

  // Peer cursor tracking
  socket.on("plan:cursor-move", ({ planId, x, y, user }) => {
    socket.to(`plan:${planId}`).emit("plan:cursor-moved", {
      socketId: socket.id,
      x,
      y,
      user,
    });
  });

  // Leave plan room
  socket.on("plan:leave", ({ planId }) => {
    socket.leave(`plan:${planId}`);
    if (planCollaborators.has(planId)) {
      const planUsers = planCollaborators.get(planId);
      planUsers.delete(socket.id);
      io.to(`plan:${planId}`).emit("plan:collaborators-updated", {
        planId,
        collaborators: Array.from(planUsers.values()),
      });
    }
  });

  socket.on("disconnect", () => {
    planCollaborators.forEach((planUsers, planId) => {
      if (planUsers.has(socket.id)) {
        planUsers.delete(socket.id);
        io.to(`plan:${planId}`).emit("plan:collaborators-updated", {
          planId,
          collaborators: Array.from(planUsers.values()),
        });
      }
    });
  });
});

export const getIO = () => io;

// ─── HEALTH CHECK & API GATEWAY ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    platform: "STHAVYA Pure MERN Real-Time Platform",
    status: "operational",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    services: {
      mongodb: "connected",
      ai: process.env.GEMINI_API_KEY ? "configured" : "key_required",
      realtime: "socket.io online",
      storage: "mongodb gridfs",
    },
    endpoints: {
      auth: "/api/auth",
      housePlans: "/api/plans",
      architects: "/api/architects",
      workers: "/api/workers",
      bookings: "/api/bookings",
      projects: "/api/projects",
      ai: "/api/ai",
      upload: "/api/upload",
    },
  });
});

// ─── MOUNT ROUTES ────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/plans", housePlanRoutes);
app.use("/api/architects", architectRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/bookings", bookingLimiter, bookingRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/upload", uploadRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server if not imported by tests
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`✦ STHAVYA Express + Socket.io Server running on port ${PORT}`);
    console.log(`✦ Health check: http://localhost:${PORT}/api/health`);
    console.log(`✦ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`=======================================================`);
  });
}

export default app;
export { server };
