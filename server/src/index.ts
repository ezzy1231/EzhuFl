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
  "https://ezhu.vercel.app",
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
      // Allow Vercel preview deployments (e.g. ezhu-*-ezzy1231s-projects.vercel.app)
      if (origin.endsWith(".vercel.app") && origin.includes("ezhu")) {
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

// ── TikTok domain verification ─────────────────
app.get("/tiktokTGgQ9chnnY11Cg3JH6cGpwtb2wyhf9dO.txt", (_req, res) => {
  res.type("text/plain").send("tiktok-developers-site-verification=TGgQ9chnnY11Cg3JH6cGpwtb2wyhf9dO");
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

// ── Start server (skipped on Vercel — it handles listening) ──
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`✓ Server running on http://localhost:${env.PORT}`);
    console.log(`✓ Allowing CORS from ${Array.from(allowedOrigins).join(", ")}`);
  });
}

export default app;
