# STHAVYA — Architectural Spatial Planning Suite
> "Your Vision, Built to Belong."

## Project Overview
STHAVYA is an enterprise-grade AI architectural planning and spatial design platform built on a Pure MERN stack (React 19, TypeScript, Express, MongoDB).

## Key Standards & Conventions
- **Branding**: Always use **STHAVYA** in all uppercase for brand headers/titles, and **Sthavya** in camelCase/URLs (`https://github.com/saideepika07/Sthavya`).
- **Tagline**: *"Your Vision, Built to Belong."*
- **Aesthetic**: Luxury Sand & Bronze palette (`#181614`, `#B88555`, `#FAF8F5`, `#EFECE6`).
- **Multi-Floor Architectural Invariant**:
  - Floors supported: Ground only, G+1, G+2, G+3, G+4, plus optional Penthouse.
  - Staircase core (`{ x: 48, y: 50, w: 14, h: 22 }`) and vertical plumbing risers must align identically across all floors.
  - 100% attached private en-suite bathrooms for all bedrooms across all levels.
- **Export Standards**: A3 landscape vector CAD specifications (`jspdf` + `svg2pdf.js`) and complete ZIP packages (`jszip`).
- **Architecture**: Pure MERN with zero third-party vendor lock-in. Real-time collaboration powered by Socket.io. Server-side AI via Gemini with strict Zod validation.

## Development & Test Commands
- `npm run client` — Starts frontend development server on port 3000 (Vite)
- `npm run server` — Starts Express & Socket.io server on port 5000
- `npm test` — Executes Jest integration test suite in `server`
- `npm run build` — Builds production frontend bundle with Vite
