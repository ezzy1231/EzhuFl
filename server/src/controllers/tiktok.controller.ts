import type { Request, Response } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";
import { supabase } from "../config/supabase.js";
import * as profileService from "../services/profile.service.js";

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USERINFO_URL = "https://open.tiktokapis.com/v2/user/info/";

// ── Stateless CSRF: sign state with HMAC so we can verify without cookies ──

function generateState(): string {
  const payload = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", env.TIKTOK_CLIENT_SECRET!)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

function verifyState(state: string): boolean {
  const dotIdx = state.indexOf(".");
  if (dotIdx === -1) return false;
  const payload = state.slice(0, dotIdx);
  const signature = state.slice(dotIdx + 1);
  if (!payload || !signature) return false;
  const expected = crypto
    .createHmac("sha256", env.TIKTOK_CLIENT_SECRET!)
    .update(payload)
    .digest("hex");
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signature, "hex"),
    Buffer.from(expected, "hex")
  );
}

/**
 * GET /api/auth/tiktok — Redirect the browser to TikTok's authorization page.
 */
export async function tiktokAuth(req: Request, res: Response): Promise<void> {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) {
    res.status(500).json({ error: "TikTok OAuth is not configured" });
    return;
  }

  const state = generateState();

  // Build the server callback URL
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  const redirectUri = `${protocol}://${host}/api/auth/tiktok/callback`;

  const params = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY,
    response_type: "code",
    scope: "user.info.basic,user.info.profile",
    redirect_uri: redirectUri,
    state,
  });

  res.redirect(`${TIKTOK_AUTH_URL}?${params.toString()}`);
}

/**
 * GET /api/auth/tiktok/callback — TikTok redirects here after user authorization.
 * Exchanges auth code for token, fetches profile, creates/finds Supabase user,
 * and redirects the browser so the client picks up the session.
 */
export async function tiktokCallback(
  req: Request,
  res: Response
): Promise<void> {
  const clientUrl = env.CLIENT_URL;

  try {
    const { code, state, error: tiktokError } = req.query as Record<string, string>;

    // ── User denied or TikTok returned an error ──
    if (tiktokError) {
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent(tiktokError)}`);
      return;
    }

    // ── Verify CSRF state ──
    if (!state || !verifyState(state)) {
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Invalid state parameter")}`);
      return;
    }

    if (!code) {
      res.redirect(`${clientUrl}/login?error=${encodeURIComponent("Missing authorization code")}`);
      return;
    }

    // ── Build the same redirect URI used in the auth step ──
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const redirectUri = `${protocol}://${host}/api/auth/tiktok/callback`;

    // ── Exchange code for access token ──
    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: env.TIKTOK_CLIENT_KEY!,
        client_secret: env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("TikTok token exchange failed:", tokenData);
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent("TikTok authentication failed")}`
      );
      return;
    }

    const { access_token, open_id } = tokenData;

    // ── Fetch TikTok user info ──
    // Only request fields covered by approved scopes:
    //   user.info.basic  → open_id, display_name, avatar_url
    //   user.info.profile → username, bio_description
    const fields = [
      "open_id",
      "display_name",
      "avatar_url",
      "username",
      "bio_description",
    ].join(",");

    const userInfoRes = await fetch(
      `${TIKTOK_USERINFO_URL}?fields=${fields}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const userInfoData = await userInfoRes.json();
    console.log("TikTok user info response:", JSON.stringify(userInfoData));
    const tiktokUser = userInfoData?.data?.user;

    if (!tiktokUser) {
      console.error("TikTok user info fetch failed:", JSON.stringify(userInfoData));
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent("Failed to fetch TikTok profile")}`
      );
      return;
    }

    const tiktokOpenId: string = tiktokUser.open_id || open_id;
    const displayName: string = tiktokUser.display_name || "";
    const avatarUrl: string = tiktokUser.avatar_url || "";
    const username: string = tiktokUser.username || "";
    const bio: string = tiktokUser.bio_description || "";

    // ── Deterministic email for TikTok users ──
    const syntheticEmail = `tiktok.${tiktokOpenId}@tiktok.users.noreply`;

    // ── Find or create Supabase user ──
    // Strategy: try to create first. If email_exists, update instead.
    let userId: string;

    const { data: newUser, error: createErr } =
      await supabase.auth.admin.createUser({
        email: syntheticEmail,
        email_confirm: true,
        user_metadata: {
          tiktok_open_id: tiktokOpenId,
          tiktok_username: username,
          tiktok_display_name: displayName,
          tiktok_avatar_url: avatarUrl,
          tiktok_bio: bio,
          name: displayName,
          full_name: displayName,
          avatar_url: avatarUrl,
          provider: "tiktok",
        },
      });

    if (newUser?.user) {
      // New user created successfully
      userId = newUser.user.id;
    } else if (createErr && (createErr as any).code === "email_exists") {
      // User already exists — find them by paginating through all auth users
      let foundUser: any = null;
      let page = 1;
      const perPage = 100;

      while (!foundUser) {
        const { data: batch } = await supabase.auth.admin.listUsers({
          page,
          perPage,
        });

        if (!batch?.users || batch.users.length === 0) break;

        foundUser = batch.users.find((u) => u.email === syntheticEmail);
        if (batch.users.length < perPage) break; // last page
        page++;
      }

      if (!foundUser) {
        console.error("User exists in auth but could not be found via listUsers");
        res.redirect(
          `${clientUrl}/login?error=${encodeURIComponent("Account lookup failed — please try again")}`
        );
        return;
      }

      userId = foundUser.id;

      // Update metadata with latest TikTok info
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...foundUser.user_metadata,
          tiktok_open_id: tiktokOpenId,
          tiktok_username: username,
          tiktok_display_name: displayName,
          tiktok_avatar_url: avatarUrl,
          tiktok_bio: bio,
          name: foundUser.user_metadata?.name || displayName,
          full_name: foundUser.user_metadata?.full_name || displayName,
          avatar_url: foundUser.user_metadata?.avatar_url || avatarUrl,
        },
      });
    } else {
      console.error("Failed to create Supabase user for TikTok:", createErr);
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent("Failed to create account")}`
      );
      return;
    }

    // ── Generate a magic link so the client gets a real Supabase session ──
    const { data: linkData, error: linkErr } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: syntheticEmail,
        options: {
          redirectTo: `${clientUrl}/auth/callback`,
        },
      });

    if (linkErr || !linkData) {
      console.error("Magic link generation failed:", linkErr);
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent("Failed to create session")}`
      );
      return;
    }

    // The action_link is the Supabase verify URL that sets the session
    // and then redirects the browser to the redirectTo URL (/auth/callback).
    const actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      console.error("No action_link in generateLink response");
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent("Failed to create session")}`
      );
      return;
    }

    res.redirect(actionLink);
  } catch (err) {
    console.error("TikTok callback error:", err);
    res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent("An unexpected error occurred")}`
    );
  }
}
