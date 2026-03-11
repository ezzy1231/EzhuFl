import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try server/.env first, then fall back to root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../server/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../server/.env") });

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  PORT: number;
  CLIENT_URL: string;
  RAPIDAPI_KEY?: string;
  TIKTOK_RAPIDAPI_HOST?: string;
  INSTAGRAM_RAPIDAPI_HOST?: string;
  YOUTUBE_API_KEY?: string;
  TIKTOK_CLIENT_KEY?: string;
  TIKTOK_CLIENT_SECRET?: string;
}

function getEnv(): Env {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ] as const;

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    PORT: parseInt(process.env.PORT || "3001", 10),
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY,
    TIKTOK_RAPIDAPI_HOST: process.env.TIKTOK_RAPIDAPI_HOST,
    INSTAGRAM_RAPIDAPI_HOST: process.env.INSTAGRAM_RAPIDAPI_HOST,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    TIKTOK_CLIENT_KEY: process.env.TIKTOK_CLIENT_KEY,
    TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
  };
}

export const env = getEnv();
