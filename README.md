# 🏛️ STHAVYA — Multi-Floor AI Architectural & Spatial Planning Suite

> **"Your Vision, Built to Belong."**

[![GitHub Repository](https://img.shields.io/badge/GitHub-saideepika07%2FSthavya-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/saideepika07/Sthavya)
[![Pure MERN Stack](https://img.shields.io/badge/Architecture-Pure_MERN-00C781?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Real--Time-Socket.io_4.8-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Jest Tests](https://img.shields.io/badge/Tests-26%2F26_Passing_(100%25)-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

STHAVYA is an enterprise-grade architectural spatial planning and interior intelligence platform. Engineered as a **Pure MERN application** with zero third-party auth or storage vendor lock-in, STHAVYA bridges generative spatial AI, multi-floor CAD engineering, real-time multi-user WebSockets collaboration, and turnkey civil execution.

---

## 📑 Table of Contents

- [🌟 Architectural Highlights](#-architectural-highlights)
- [🏗️ System Architecture](#️-system-architecture)
- [✨ Core Capabilities](#-core-capabilities)
  - [1. Multi-Floor Architectural Blueprint Engine (Ground to G+4 + Penthouse)](#1-multi-floor-architectural-blueprint-engine-ground-to-g4--penthouse)
  - [2. Multi-Floor Blueprint Viewer & 3D Dollhouse](#2-multi-floor-blueprint-viewer--3d-dollhouse)
  - [3. Professional Vector CAD PDF Dossier & ZIP Archive System](#3-professional-vector-cad-pdf-dossier--zip-archive-system)
  - [4. Real-Time Collaborative 2D Floor Plan Engine](#4-real-time-collaborative-2d-floor-plan-engine)
  - [5. Pure MERN Authentication & Role-Based Access](#5-pure-mern-authentication--role-based-access)
  - [6. Multimodal AI Diagnostics & Zod Schema Validation](#6-multimodal-ai-diagnostics--zod-schema-validation)
  - [7. MongoDB GridFS File Storage](#7-mongodb-gridfs-file-storage)
  - [8. Verified In-House Workforce & Booking Pipeline](#8-verified-in-house-workforce--booking-pipeline)
- [💻 Tech Stack](#-tech-stack)
- [📁 Repository Structure](#-repository-structure)
- [🚀 Quick Start & Local Setup](#-quick-start--local-setup)
- [🔑 Environment Variables Reference](#-environment-variables-reference)
- [📡 API Gateway Reference](#-api-gateway-reference)
- [🧪 Automated Test Suite](#-automated-test-suite)
- [☁️ Production Deployment](#️-production-deployment)
- [📄 License](#-license)

---

## 🌟 Architectural Highlights

- **Multi-Floor Structural Consistency**: Generates complete vertical building packages (`Ground only`, `G+1`, `G+2`, `G+3`, `G+4`, plus optional `Penthouse`). Locks the vertical circulation shaft (staircase and lift core) at identical spatial coordinates (`{ x: 48, y: 50, w: 14, h: 22 }`) and aligns wet plumbing stacks vertically across all levels.
- **100% Attached En-Suite Guarantee**: Every residential bedroom across all floors maintains private, direct en-suite bathroom access with zero detached common bathrooms.
- **Plot Footprint Validation**: Proactively validates user selections against plot dimensions, displaying actionable recommendations and optimal dimensions without blocking progression.
- **Pure MERN Foundation**: 100% free of third-party vendor lock-in. Powered by native MongoDB Atlas storage, JWT stored in `httpOnly` secure cookies, `bcryptjs` password hashing, and Multer + GridFS asset streaming.
- **Real-Time Collaboration**: Powered by **Socket.io**. Multiple designers and homeowners join shared floor plan rooms with live room movements, attribute synchronization, collaborator cursor tracking, and presence badges.
- **Server-Only Gemini AI Gateway**: Zero API keys exposed in browser bundles. Generative intelligence runs through Express with strict Zod schema validation, automatic retry, and a deterministic rule-based fallback generator.
- **Vector CAD Export Engine**: Produces sharp, scalable A3 landscape vector CAD blueprints using `jspdf` and `svg2pdf.js`, generating multi-page executive dossiers and bundled ZIP archives with `jszip`.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 + Vite Frontend                        │
│             (Tailwind v4 • Lucide Icons • Socket.io Client)            │
└───────────────────▲───────────────────────────────▲────────────────────┘
                    │                               │
        WebSockets  │ (plan updates, cursor sync)   │ HTTPS REST API
        Socket.io   │                               │ (JWT httpOnly Cookie)
                    ▼                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Express 4.21 MVC Backend                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Security: Helmet • CORS (CLIENT_URL) • Rate Limits • MongoSanitize│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │   Auth & RBAC (JWT)   │  │  House Plans API  │  │ Bookings & Roster│ │
│  └───────────────────────┘  └───────────────────┘  └─────────────────┘ │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │
│  │   GridFS Multer Store │  │ Socket.io Server  │  │ Multi-Floor AI  │ │
│  │  (Files / Blueprints) │  │(Rooms: plan, user)│  │ (Zod Validation)│ │
│  └──────────┬────────────┘  └───────────────────┘  └────────┬────────┘ │
└─────────────┼───────────────────────────────────────────────┼──────────┘
              ▼                                               ▼
┌───────────────────────────────┐               ┌────────────────────────┐
│         MongoDB Atlas         │               │    Google Gemini API   │
│  - Users (bcrypt passwords)   │               │   (gemini-2.0-flash)   │
│  - HousePlans (Multi-Floor)   │               │ - Multimodal Vision    │
│  - Architects & Workers       │               │ - Architectural Audits │
│  - Bookings (real-time push)  │               │ - Structural Layouts   │
│  - GridFS Chunks & Files      │               │ - Fallback Rule Engine │
└───────────────────────────────┘               └────────────────────────┘
```

---

## ✨ Core Capabilities

### 1. Multi-Floor Architectural Blueprint Engine (Ground to G+4 + Penthouse)
- **Floors Selector**: Choose from `Ground only`, `G+1`, `G+2`, `G+3`, and `G+4`.
- **Typology Scaling**: Configurable from `1 BHK` to `4 BHK` per floor.
- **Top Penthouse Suite**: Optional toggle adds a top-floor luxury penthouse with master suite, sky lounge, and open terrace deck.
- **Vertical Core Locking**: Fixed staircase and vertical riser shaft (`{ x: 48, y: 50, w: 14, h: 22 }`) ensuring structural alignment on every floor.
- **Vertical Plumbing Stacks**: Wet areas (kitchen, attached bathrooms, utility, pantry) align vertically to guarantee plumbing riser integrity.
- **Architectural Detailing**: Every generated floor includes door swing arcs, window symbols on exterior walls, dimension lines, and a cardinal north compass.

### 2. Multi-Floor Blueprint Viewer & 3D Dollhouse
- **Floor Navigation Tabs**: Switch instantly between `Ground | 1st | 2nd | 3rd | 4th | Penthouse` with per-floor built-up and carpet area metrics.
- **All Floors Overview**: Stacked grid overview rendering every level's 2D CAD blueprint simultaneously.
- **3D Dollhouse Floor Slider**: Cycle through individual vertical floors in 3D isometric cutaways, front elevation, and interior perspectives.
- **Dynamic Cost Forecast**: Automatically scales civil, interior joinery, and MEP financial estimates across all floors.

### 3. Professional Vector CAD PDF Dossier & ZIP Archive System
- **Current Floor A3 PDF**: True vector CAD specification sheet formatted for A3 landscape printing.
- **All Floors Multi-Page Dossier**: Complete architectural drawing set featuring an executive **Cover Page** (STHAVYA logo, project specifications, drawing sheet index) followed by individual floor sheets.
- **Complete ZIP Archive**: Bundles per-floor vector SVGs (`/CAD_SVG_Vectors`), high-resolution PNGs (`/Raster_PNG`), individual A3 PDFs (`/PDF_Drawings`), the master multi-page PDF, and a project specification manifest.
- **Standardized Naming**: Follows the `Sthavya_<BHK>_<floors>_<date>.pdf` convention.

### 4. Real-Time Collaborative 2D Floor Plan Engine
- **Multiplayer CAD Editing**: Connected clients join plan rooms (`plan:${planId}`). When an architect or homeowner drags, resizes, adds, or deletes a room zone, all connected peers receive instant canvas synchronization.
- **Live Peer Presence**: Displays real-time collaborator counter, active designer name tags, and randomized designer identity badges.
- **Public Share Links**: Generates instant deep links (`#plan=<id>`) with persistent MongoDB storage and `isPublic` status toggles.

### 5. Pure MERN Authentication & Role-Based Access
- **No Third-Party Auth Dependencies**: Native user collection storing salted passwords with `bcryptjs` (work factor 10).
- **Secure Token Delivery**: JWTs issued directly in `httpOnly`, `sameSite: "lax"`, secure cookies with automatic fallback to `Authorization: Bearer <token>`.
- **RBAC Roles**: Granular permission checks for `client`, `architect`, `worker`, and `admin`.

### 6. Multimodal AI Diagnostics & Zod Schema Validation
- **Structured JSON Validation**: Server-side Zod validation (`MultiFloorBlueprintSchema`) guarantees all AI outputs contain valid geometric and spatial attributes.
- **Deterministic Fallback Engine**: If the AI model is rate-limited or fails validation, the system automatically falls back to STHAVYA's structural rule engine without interrupting user flow.

### 7. MongoDB GridFS File Storage
- **Native Document Storage**: Large CAD blueprints and interior renders stream directly to and from MongoDB GridFS chunks (`fs.files` and `fs.chunks`).
- **Resilient Fallback**: Gracefully falls back to data URLs if MongoDB GridFS is offline.

### 8. Verified In-House Workforce & Booking Pipeline
- **Trade Roster**: Verified directory of licensed architects, structural engineers, plumbers, electricians, and civil contractors.
- **Consultation Scheduling**: Real-time slot booking with instant WebSockets push notifications to the assigned professional.

---

## 💻 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, Lucide Icons, Socket.io Client |
| **Document Export** | jsPDF 4.2, svg2pdf.js 2.8, html2canvas 1.4, JSZip 3.10 |
| **Backend** | Node.js 20 LTS, Express 4.21, Socket.io 4.8, Mongoose 8 |
| **Database** | MongoDB Atlas / Local MongoDB (Native BSON + GridFS Bucket) |
| **AI Engine** | Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`), Zod 3.24 |
| **Security** | Helmet 8, CORS, Express-Rate-Limit, Express-Mongo-Sanitize, Cookie-Parser, BcryptJS |
| **Testing** | Jest 29, Supertest 7 (Native Node ESM VM Modules) |
| **Deployment** | Render (Web Service), Vercel (SPA Frontend), MongoDB Atlas |

---

## 📁 Repository Structure

```text
Sthavya/
├── client/                               # Frontend Single-Page App (React 19 + Vite)
│   ├── src/
│   │   ├── components/                   # UI Modules (Blueprint2DViewer, Modals, 3D Dollhouse)
│   │   ├── pages/                        # Landing, Wizard, BlueprintResult, Dashboard, Auth
│   │   ├── services/
│   │   │   ├── api.ts                    # Central REST client (VITE_API_URL + credentials)
│   │   │   ├── socket.ts                 # Socket.io connection manager & event hooks
│   │   │   ├── auth.ts                   # Pure MERN JWT Auth & Client State
│   │   │   ├── blueprintPdfService.ts    # Vector A3 PDF & ZIP export engine
│   │   │   └── multiFloorGenerator.ts    # Client-side spatial validation & layout generator
│   │   ├── data/                         # Type interfaces & architectural catalog
│   │   ├── App.tsx                       # React Router configuration & notification system
│   │   ├── index.css                     # Tailwind CSS v4 styling rules
│   │   └── main.tsx                      # React root entry
│   ├── public/                           # Static assets & sthavya-logo.png
│   ├── package.json                      # Client dependencies & scripts
│   ├── tsconfig.json                     # TypeScript strict configuration
│   ├── vercel.json                       # Vercel SPA routing rewrite rules
│   └── vite.config.ts                    # Vite config (API proxy :5000)
├── server/                               # Backend REST API & Real-Time Server
│   ├── config/
│   │   └── db.js                         # MongoDB connection & GridFS bucket init
│   ├── controllers/
│   │   ├── aiController.js               # Gemini AI & Multi-Floor Zod schemas
│   │   ├── architectController.js        # Architect catalog queries
│   │   ├── authController.js             # Register, Login, Logout, Me, Profile (JWT)
│   │   ├── bookingController.js          # Consultation booking & Socket.io push notifications
│   │   ├── housePlanController.js        # CRUD for multi-floor plans & public share links
│   │   ├── projectController.js          # Studio projects & saved renders
│   │   ├── uploadController.js           # Multer + GridFS upload & stream handlers
│   │   └── workerController.js           # Trade specialists & plumbers
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT verify & RBAC role guards
│   │   ├── errorMiddleware.js            # Central 404 and structured error responder
│   │   └── uploadMiddleware.js           # Multer in-memory storage buffer
│   ├── models/                           # Mongoose Schemas (User, HousePlan, Booking)
│   ├── routes/                           # Express route definitions
│   ├── utils/
│   │   └── multiFloorGenerator.js        # Deterministic multi-floor structural layout engine
│   ├── seeds/
│   │   └── seedData.js                   # Database seed script for initial workforce & plans
│   ├── tests/
│   │   └── api.test.js                   # Jest + Supertest integration suite (26 passing tests)
│   ├── package.json                      # Server dependencies & test scripts
│   └── server.js                         # HTTP server, Socket.io gateway, middleware pipeline
├── .gitignore                            # Comprehensive ignore rules
├── package.json                          # Monorepo root scripts (client, server, test, seed, build)
├── render.yaml                           # Render Web Service Blueprint (Node.js runtime)
├── vercel.json                           # Root Vercel SPA deployment config
├── GO_LIVE_CHECKLIST.md                  # Production deployment & verification checklist
└── README.md                             # Architectural & operational documentation
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0+ (v20+ LTS recommended)
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/sthavya_spaces`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/saideepika07/Sthavya.git
cd Sthavya

# Install monorepo root dependencies
npm install

# Install client and server dependencies
npm install --prefix client
npm install --prefix server
```

### 2. Configure Environment Variables

Create environment configuration files from the provided templates:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000,http://localhost:5173
MONGO_URI=mongodb://localhost:27017/sthavya_spaces
JWT_SECRET=super_secret_jwt_key_at_least_32_characters_long
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Edit `client/.env`:
```env
# In development, leave blank to use the Vite proxy, or set explicitly:
VITE_API_URL=http://localhost:5000
```

### 3. Seed MongoDB Database

Populate your database with default architects, trade specialists, sample multi-floor plans, and demonstration accounts:

```bash
npm run seed
```

### 4. Run Locally

Open two terminal windows:

```bash
# Terminal 1 — Backend API & Socket.io server (Port 5000)
npm run server

# Terminal 2 — Frontend Client (Port 3000)
npm run client
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Optional | `5000` | Port for the Express REST & Socket.io server |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`) |
| `CLIENT_URL` | **Yes** | `http://localhost:3000` | Allowed CORS origins for client requests & secure cookies |
| `MONGO_URI` | **Yes** | - | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | **Yes** | - | Cryptographic secret for signing auth tokens (min 32 chars) |
| `GEMINI_API_KEY` | Optional* | - | Google Gemini API Key (*falls back to structural engine if omitted) |
| `GEMINI_MODEL` | Optional | `gemini-2.0-flash` | Primary Gemini model ID |

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `VITE_API_URL` | Optional | `""` (Vite Proxy) | Full backend base URL in production (e.g. `https://sthavya-spaces-api.onrender.com`) |

---

## 📡 API Gateway Reference

All endpoints are prefixed with `/api`. Authenticated requests accept the JWT cookie automatically or via `Authorization: Bearer <token>`.

### 🩺 Health & Diagnostics
- `GET /api/health` — Public server telemetry, uptime, database status, and active gateway endpoints.

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `mobile`).
- `POST /api/auth/login` — Sign in and receive `httpOnly` JWT session cookie.
- `GET /api/auth/me` — Retrieve current authenticated profile.
- `POST /api/auth/logout` — Invalidate session and clear auth cookie.
- `PUT /api/auth/profile` — Update user profile details.

### 📐 House Plans (`/api/plans`)
- `GET /api/plans` — Query house plans with optional filters (`bhkType`, `facing`, `floors`).
- `GET /api/plans/:id` — Fetch single floor plan by MongoDB ID.
- `POST /api/plans` — Save new multi-floor plan layout (`floorsCount`, `hasPenthouse`, `floors[]`).
- `PUT /api/plans/:id` — Update floor plan layout (*author or admin*).
- `DELETE /api/plans/:id` — Delete saved floor plan (*author or admin*).

### 🤖 Gemini Artificial Intelligence (`/api/ai`)
- `POST /api/ai/generate-multifloor` — Synthesize complete multi-floor architectural blueprints with Zod validation.
- `POST /api/ai/audit-floorplan` — Chief Architect spatial audit with Vastu & circulation grading.
- `POST /api/ai/analyze-room` — Multimodal vision blueprint scanner & space reclamation diagnostics.
- `POST /api/ai/enhance-prompt` — Synthesizes architectural photography prompts for photorealistic rendering.

### 👷 Trades & Architects (`/api/workers` & `/api/architects`)
- `GET /api/workers` — Verified workforce directory (filter by `category=Plumber`, `Carpenter`, etc.).
- `GET /api/workers/:id` — Worker portfolio & specialty breakdown.
- `GET /api/architects` — Verified architectural firms & consultation rates.

### 📅 Bookings & Consultations (`/api/bookings`)
- `POST /api/bookings` — Create consultation booking (validated with Zod, triggers Socket.io notification).
- `GET /api/bookings/my` — Fetch current user's consultation reservations (*requires auth*).
- `PATCH /api/bookings/:id/status` — Update booking status (`pending`, `confirmed`, `completed`).

### 📁 Uploads & Storage (`/api/upload`)
- `POST /api/upload/blueprint` — Upload blueprint file buffer to MongoDB GridFS (*requires auth*).
- `POST /api/upload/interior` — Upload interior photograph to MongoDB GridFS (*requires auth*).
- `GET /api/upload/file/:filename` — Stream binary image directly from GridFS.

---

## 🧪 Automated Test Suite

A comprehensive automated test suite validates the health gateway, pure MERN authentication workflows, multi-floor structural generation, penthouse suite configurations, and Zod booking validation using **Jest** and **Supertest**:

```bash
npm test
```

### Test Results
```text
PASS tests/api.test.js
  1. Health Check Endpoint
    ✓ GET /api/health returns operational status and gateway endpoints (72 ms)
  2. Pure MERN Auth Workflow (/api/auth)
    ✓ POST /api/auth/register creates user with hashed password and returns JWT (51 ms)
    ✓ POST /api/auth/register rejects duplicate registration by email (27 ms)
    ✓ POST /api/auth/register rejects duplicate registration by mobile (23 ms)
    ✓ POST /api/auth/login authenticates valid credentials via email (23 ms)
    ✓ POST /api/auth/login authenticates valid credentials via mobile number (40 ms)
    ✓ POST /api/auth/login rejects invalid password (17 ms)
    ✓ GET /api/auth/me rejects unauthenticated request (19 ms)
    ✓ POST /api/auth/logout clears session (18 ms)
  3. House Plans API (/api/plans)
    ✓ POST /api/plans saves a floor plan layout (23 ms)
    ✓ GET /api/plans returns catalog of public plans (15 ms)
    ✓ GET /api/plans/:id retrieves plan by id (13 ms)
  4. Consultation Bookings API (/api/bookings)
    ✓ POST /api/bookings validates schema and creates consultation booking (39 ms)
    ✓ POST /api/bookings rejects payload failing Zod validation (18 ms)
    ✓ GET /api/bookings returns list of bookings (15 ms)
  5. Multer File Upload API (/api/upload)
    ✓ POST /api/upload/blueprint uploads blueprint file buffer and returns URL (57 ms)
    ✓ POST /api/upload/interior uploads interior image buffer and returns URL (26 ms)
    ✓ POST /api/upload/blueprint returns 400 when no file attached (21 ms)
  6. Multi-Floor Architectural Blueprint Engine & API
    Structural Multi-Floor Generator Invariants
      ✓ generates G+1 layout without penthouse (2 floors) (3 ms)
      ✓ generates G+1 layout with penthouse (3 floors) (2 ms)
      ✓ generates G+2 layout without and with penthouse (1 ms)
      ✓ generates G+3 layout without penthouse (4 floors) (2 ms)
      ✓ generates G+4 layout without and with penthouse (3 ms)
      ✓ verifies 1 BHK, 2 BHK, 3 BHK bedroom en-suite bathroom guarantee (3 ms)
    Multi-Floor AI Gateway API (/api/ai/generate-multifloor)
      ✓ POST /api/ai/generate-multifloor generates consistent multi-level plan (834 ms)
    Multi-Floor Plan Model Persistence & Migration (/api/plans)
      ✓ POST /api/plans stores floorsCount, hasPenthouse, and multi-floor array (29 ms)

Test Suites: 1 passed, 1 total
Tests:       26 passed, 26 total
Snapshots:   0 total
Time:        4.621 s
Ran all test suites.
```

---

## ☁️ Production Deployment

See [`GO_LIVE_CHECKLIST.md`](./GO_LIVE_CHECKLIST.md) for step-by-step production instructions.

### 1. Backend on Render (`render.yaml`)
1. In [Render](https://render.com), create a new Web Service from the [`saideepika07/Sthavya`](https://github.com/saideepika07/Sthavya) repository.
2. Select **Render Blueprint** to use `render.yaml`, or configure manually:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/api/health`
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`.

### 2. Frontend on Vercel (`vercel.json`)
1. Import [`saideepika07/Sthavya`](https://github.com/saideepika07/Sthavya) into [Vercel](https://vercel.com).
2. Set **Root Directory** to `client` (or root with `vercel.json` pointing to `client/dist`).
3. Set **Framework Preset** to `Vite`.
4. Configure `VITE_API_URL` to your Render backend domain.

---

## 📄 License

This project is licensed under the **MIT License**.

Built with precision for **STHAVYA** — *"Your Vision, Built to Belong."*
