# Juddi Housing Scheme Pasni — Full-Stack MERN Web Application

A complete public real-estate portal and separate protected Admin Dashboard built with React, TypeScript, Vite, Tailwind CSS, Express.js, Mongoose/MongoDB, Multer, Cloudinary, JWT, and Recharts.

## Project Structure

- `server.ts` — Express server entry point mounting REST APIs and Vite middleware.
- `server/config/` — Environment configuration (`env.ts`) and MongoDB/Mongoose connection (`db.ts`) with persistent local fallback when `MONGODB_URI` is unset.
- `server/models/` — Mongoose schemas (`Admin`, `Plot`, `Order`, `Payment`).
- `server/services/` — Unified data repository (`dataStore.ts`) and Cloudinary/local image handler (`mediaService.ts`).
- `server/middleware/` — JWT verification, CSRF check, and Multer file validation (`auth.ts`).
- `server/routes/` — `publicRoutes.ts` and `adminRoutes.ts`.
- `src/` — React + TypeScript frontend:
  - `src/pages/` — Public pages (`Home`, `About`, `Plots`, `PlotDetail`, `Facilities`, `Location`, `MasterPlan`, `Blocks`, `Updates`, `Gallery`, `Announcements`, `Contact`).
  - `src/admin/` — Protected Admin Console (`/admin/login`, `Dashboard`, `Add Plot`, `Manage Plots`, `Plot Orders`, `Sales Analytics`, `Settings`).

## Environment Variables

Configure secrets in your deployment/environment settings (see `.env.example`):

- `MONGODB_URI` — MongoDB connection string (optional in preview; uses persistent local datastore when empty).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Optional initial administrator credentials (if unset, `/admin/login` provides a one-time first-run setup form).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials for plot image uploads.
- `JWT_SECRET` — Optional signing key for JWT sessions (falls back to a runtime cryptographic secret).

## Commands

- `npm run dev` — Start Express + Vite development server on port 3000.
- `npm run build` — Build frontend bundle to `dist/`.
- `npm run start` — Serve production Express server.
- `npm run lint` — TypeScript typecheck (`tsc --noEmit`).
