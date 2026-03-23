import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

process.env.VERCEL = "1";
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY = "anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
process.env.CLIENT_URL = "http://localhost:5173";

const mocks = vi.hoisted(() => {
  const state = {
    authUser: {
      id: "11111111-1111-1111-1111-111111111111",
      email: "tester@example.com",
      user_metadata: {},
    },
    userProfile: {
      id: "11111111-1111-1111-1111-111111111111",
      email: "tester@example.com",
      name: "Test User",
      role: "INFLUENCER",
      created_at: "2026-01-01T00:00:00.000Z",
    },
    influencerVerificationStatus: "verified",
    campaignNotFound: false,
    campaignStatus: "ACTIVE",
    existingParticipant: false,
  };

  function createQueryBuilder(table: string) {
    const filters: Record<string, unknown> = {};
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn((column: string, value: unknown) => {
        filters[column] = value;
        return builder;
      }),
      order: vi.fn(() => builder),
      in: vi.fn(() => builder),
      lte: vi.fn(() => builder),
      gt: vi.fn(() => builder),
      update: vi.fn(() => builder),
      insert: vi.fn(() => builder),
      upsert: vi.fn(() => builder),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      single: vi.fn(async () => {
        if (table === "users") {
          return { data: state.userProfile, error: null };
        }

        if (table === "influencer_profiles") {
          return {
            data: { verification_status: state.influencerVerificationStatus },
            error: null,
          };
        }

        if (table === "campaigns") {
          if (state.campaignNotFound) {
            return { data: null, error: { code: "PGRST116" } };
          }

          return {
            data: {
              id: filters.id,
              business_id: "22222222-2222-2222-2222-222222222222",
              title: "Example Campaign",
              description: null,
              budget: 100,
              duration_days: 1,
              winners_count: 3,
              status: state.campaignStatus,
              start_date: null,
              end_date: null,
              cover_image_url: null,
              platforms: ["TIKTOK"],
              rate_per_1k: null,
              created_at: "2026-01-01T00:00:00.000Z",
            },
            error: null,
          };
        }

        if (table === "participants") {
          return state.existingParticipant
            ? { data: { id: "participant-1" }, error: null }
            : { data: null, error: { code: "PGRST116" } };
        }

        return { data: null, error: null };
      }),
    };

    return builder;
  }

  const supabase = {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: state.authUser },
        error: null,
      })),
    },
    from: vi.fn((table: string) => createQueryBuilder(table)),
  };

  return { state, supabase };
});

vi.mock("../src/config/supabase.js", () => ({
  supabase: mocks.supabase,
}));

describe("centralized error response contract", () => {
  let app: Awaited<typeof import("../src/index.js")>["default"];

  beforeAll(async () => {
    app = (await import("../src/index.js")).default;
  });

  beforeEach(() => {
    mocks.state.campaignNotFound = false;
    mocks.state.influencerVerificationStatus = "verified";
    mocks.state.campaignStatus = "ACTIVE";
    mocks.state.existingParticipant = false;
    mocks.supabase.auth.getUser.mockClear();
    mocks.supabase.from.mockClear();
  });

  it("returns the shared auth error shape for missing authorization", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      },
    });
  });

  it("returns validation details in the shared error shape", async () => {
    const response = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", "Bearer test-token")
      .send({ name: "", role: "ADMIN" });

    expect(response.status).toBe(400);
    expect(response.body.ok).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
    expect(response.body.error.message).toBe("Invalid request body");
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "name" }),
        expect.objectContaining({ path: "role" }),
      ])
    );
  });

  it("returns the shared domain error shape for missing campaigns", async () => {
    mocks.state.campaignNotFound = true;

    const response = await request(app)
      .get("/api/campaigns/550e8400-e29b-41d4-a716-446655440000")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Campaign not found",
      },
    });
  });

  it("returns the shared forbidden error shape for unverified influencers", async () => {
    mocks.state.influencerVerificationStatus = "unverified";

    const response = await request(app)
      .post("/api/campaigns/550e8400-e29b-41d4-a716-446655440000/join")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "FORBIDDEN",
        message: "Influencer verification required. Add your basic profile details before participating in campaigns.",
      },
    });
  });

  it("returns the shared conflict error shape for duplicate joins", async () => {
    mocks.state.existingParticipant = true;

    const response = await request(app)
      .post("/api/campaigns/550e8400-e29b-41d4-a716-446655440000/join")
      .set("Authorization", "Bearer test-token");

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      ok: false,
      error: {
        code: "CONFLICT",
        message: "Already joined this campaign",
      },
    });
  });
});