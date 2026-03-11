/**
 * Social Media Metrics Service
 *
 * Fetches video engagement (views, likes, comments) from TikTok & Instagram.
 *
 * Supports two providers:
 *   1. RapidAPI scrapers (easy signup, works immediately)
 *   2. Official platform APIs (requires approval)
 *
 * Set the following env vars:
 *   RAPIDAPI_KEY           – Your RapidAPI key (https://rapidapi.com)
 *   TIKTOK_RAPIDAPI_HOST   – e.g. "tiktok-scraper7.p.rapidapi.com"
 *   INSTAGRAM_RAPIDAPI_HOST – e.g. "instagram-scraper-api2.p.rapidapi.com"
 *
 * If no API key is configured the service returns null and the submission
 * keeps whatever values the creator provided (manual fallback).
 */

import { env } from "../config/env.js";

export interface VideoMetrics {
  views: number;
  likes: number;
  comments: number;
}

// ── Helpers ──────────────────────────────────────

function rapidApiKey(): string | undefined {
  return env.RAPIDAPI_KEY;
}

function tiktokHost(): string {
  return env.TIKTOK_RAPIDAPI_HOST || "tiktok-scraper7.p.rapidapi.com";
}

function instagramHost(): string {
  return (
    env.INSTAGRAM_RAPIDAPI_HOST ||
    "instagram-scraper-api2.p.rapidapi.com"
  );
}

/**
 * Extract the TikTok video ID from a URL.
 * Supports:
 *   https://www.tiktok.com/@user/video/7123456789
 *   https://vm.tiktok.com/ZMxxxxxx/
 */
function extractTikTokVideoId(url: string): string | null {
  // Long-form URL
  const longMatch = url.match(/\/video\/(\d+)/);
  if (longMatch) return longMatch[1];
  // Short URL – return full URL so the API can resolve it
  if (url.includes("vm.tiktok.com") || url.includes("vt.tiktok.com")) {
    return url;
  }
  return null;
}

/**
 * Extract the Instagram media shortcode from a URL.
 * Supports:
 *   https://www.instagram.com/p/CxAbCdEfGhI/
 *   https://www.instagram.com/reel/CxAbCdEfGhI/
 */
function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

// ── TikTok ───────────────────────────────────────

async function fetchTikTokMetrics(videoUrl: string): Promise<VideoMetrics | null> {
  const apiKey = rapidApiKey();
  if (!apiKey) return null;

  const videoId = extractTikTokVideoId(videoUrl);
  if (!videoId) return null;

  try {
    const host = tiktokHost();
    // tiktok-scraper7 uses root endpoint with `url` query param
    const endpoint = `https://${host}/`;
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(videoUrl)}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": host,
      },
    });

    if (!res.ok) {
      console.error(`TikTok API ${res.status}: ${await res.text()}`);
      return null;
    }

    const json = await res.json();

    // tiktok-scraper7 returns metrics directly on json.data
    // Also handle other RapidAPI providers with different schemas
    const stats =
      json?.data ||
      json?.data?.videos?.[0] ||
      json?.data?.stats ||
      json?.itemInfo?.itemStruct?.stats ||
      json?.stats ||
      json;

    const views =
      stats?.play_count ?? stats?.playCount ?? stats?.views ?? 0;
    const likes =
      stats?.digg_count ?? stats?.diggCount ?? stats?.likes ?? 0;
    const comments =
      stats?.comment_count ?? stats?.commentCount ?? stats?.comments ?? 0;

    return {
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
    };
  } catch (err) {
    console.error("TikTok metrics fetch error:", err);
    return null;
  }
}

// ── Instagram ────────────────────────────────────

async function fetchInstagramMetrics(videoUrl: string): Promise<VideoMetrics | null> {
  const apiKey = rapidApiKey();
  if (!apiKey) return null;

  const shortcode = extractInstagramShortcode(videoUrl);
  if (!shortcode) return null;

  try {
    const host = instagramHost();
    const endpoint = `https://${host}/media/info`;
    const res = await fetch(
      `${endpoint}?shortcode=${encodeURIComponent(shortcode)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": host,
        },
      }
    );

    if (!res.ok) {
      console.error(`Instagram API ${res.status}: ${await res.text()}`);
      return null;
    }

    const json = await res.json();

    // Common response paths
    const item = json?.data ?? json?.graphql?.shortcode_media ?? json;

    const views =
      item?.play_count ??
      item?.video_view_count ??
      item?.view_count ??
      0;
    const likes =
      item?.like_count ??
      item?.edge_media_preview_like?.count ??
      item?.likes?.count ??
      0;
    const comments =
      item?.comment_count ??
      item?.edge_media_to_comment?.count ??
      item?.comments?.count ??
      0;

    return {
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
    };
  } catch (err) {
    console.error("Instagram metrics fetch error:", err);
    return null;
  }
}

// ── YouTube ──────────────────────────────────────

async function fetchYouTubeMetrics(videoUrl: string): Promise<VideoMetrics | null> {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  // Extract video ID from various YouTube URL formats
  const match = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) return null;

  const videoId = match[1];

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${apiKey}`
    );

    if (!res.ok) {
      console.error(`YouTube API ${res.status}: ${await res.text()}`);
      return null;
    }

    const json = await res.json();
    const stats = json?.items?.[0]?.statistics;
    if (!stats) return null;

    return {
      views: Number(stats.viewCount) || 0,
      likes: Number(stats.likeCount) || 0,
      comments: Number(stats.commentCount) || 0,
    };
  } catch (err) {
    console.error("YouTube metrics fetch error:", err);
    return null;
  }
}

// ── Public API ───────────────────────────────────

/**
 * Fetch engagement metrics for a video URL.
 * Returns null if the platform is unsupported or API keys are missing.
 */
export async function fetchVideoMetrics(
  videoUrl: string,
  platform: string
): Promise<VideoMetrics | null> {
  switch (platform.toUpperCase()) {
    case "TIKTOK":
      return fetchTikTokMetrics(videoUrl);
    case "INSTAGRAM":
      return fetchInstagramMetrics(videoUrl);
    case "YOUTUBE":
      return fetchYouTubeMetrics(videoUrl);
    default:
      return null;
  }
}

/**
 * Returns true if at least one social-media API is configured.
 */
export function isApiConfigured(): boolean {
  return !!(rapidApiKey() || env.YOUTUBE_API_KEY);
}
