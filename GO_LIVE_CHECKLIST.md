# 🚀 STHAVYA Pure MERN — Go-Live Deployment Checklist

**Repository**: [`https://github.com/saideepika07/Sthavya.git`](https://github.com/saideepika07/Sthavya.git)  
**Brand**: **STHAVYA** — *"Your Vision, Built to Belong."*

---

## 1. Secrets & Credentials (Security)
- [ ] If you ever used or committed a Gemini API key, rotate it at [Google AI Studio](https://aistudio.google.com/apikey) and generate a fresh key.
- [ ] Generate a secure 32+ character random secret for `JWT_SECRET` (e.g. `openssl rand -base64 32`).

## 2. Database (MongoDB Atlas)
- [ ] Create a free MongoDB Atlas cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
- [ ] Whitelist `0.0.0.0/0` (or Render service IP ranges) in Network Access.
- [ ] Obtain the connection URI (e.g. `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/sthavya_spaces?retryWrites=true&w=majority`).
- [ ] Populate default data by running `npm run seed` with `MONGO_URI` set in `server/.env`.

## 3. Backend Deployment (Render)
- [ ] Connect the repository `saideepika07/Sthavya` to [Render](https://render.com) and deploy using `render.yaml`.
- [ ] In the Render dashboard for `sthavya-spaces-api`, ensure the following environment variables are set:
  - `NODE_ENV`: `production`
  - `PORT`: `5000`
  - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
  - `MONGO_URI`: Your MongoDB Atlas connection string
  - `JWT_SECRET`: Your 32+ character secret
  - `GEMINI_API_KEY`: Your server-only Google AI Studio key
  - `GEMINI_MODEL`: `gemini-2.0-flash`
- [ ] Verify the health check: `https://<your-render-app>.onrender.com/api/health`.

## 4. Frontend Deployment (Vercel)
- [ ] Import the repository `saideepika07/Sthavya` into [Vercel](https://vercel.com).
- [ ] Root directory: `client` (or root using `vercel.json` with `outputDirectory: client/dist`).
- [ ] Set Environment Variables:
  - `VITE_API_URL`: `https://<your-render-app>.onrender.com`
- [ ] Deploy and verify the live domain.

## 5. Multi-Floor & Feature Verification
- [ ] Test registration, login, and logout at `/api/auth/*` via the UI.
- [ ] Run Requirements Wizard (`/plan/new`) across `Ground only`, `G+1`, `G+2`, `G+3`, `G+4`, and `Add Penthouse`.
- [ ] Confirm plot size validation warning message appears on compact plot footprints (<500 sq ft).
- [ ] Verify multi-floor viewer tabs (`Ground | 1st | 2nd | Penthouse`), "All Floors Overview" stacked grid, and 3D dollhouse slider.
- [ ] Test PDF downloads:
  - Current floor A3 landscape vector PDF
  - All floors multi-page dossier (with Cover Page + 1 page per floor)
  - All floors ZIP archive (PDFs, SVGs, PNGs, and specification manifest)
- [ ] Verify collaborative 2D floor plan editing in two browser windows with real-time room sync and cursor tracking.
- [ ] Confirm file uploads to MongoDB GridFS stream properly.
