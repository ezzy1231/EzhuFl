import express from "express";
import cors from "cors";
import { env } from "./config/env.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import tiktokRoutes from "./routes/tiktok.routes.js";

const app = express();

const allowedOrigins = new Set([
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
]);

// ── Middleware ──────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

// ── Health check ───────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────
app.use("/api/auth", tiktokRoutes); // TikTok OAuth (public, before auth middleware)
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 handler ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start server ───────────────────────────────
app.listen(env.PORT, () => {
  console.log(`✓ Server running on http://localhost:${env.PORT}`);
  console.log(`✓ Allowing CORS from ${Array.from(allowedOrigins).join(", ")}`);
});

export default app;
