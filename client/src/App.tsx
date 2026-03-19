import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./hooks/useAuth";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Guards
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";

// Public pages
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { SignupPage } from "./pages/public/SignupPage";
import { LeaderboardPage } from "./pages/public/LeaderboardPage";
import { AuthCallbackPage } from "./pages/public/AuthCallbackPage";
import { TermsPage } from "./pages/public/TermsPage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// Shared pages
import { SharedLeaderboardPage } from "./pages/shared/LeaderboardPage";

// Influencer pages
import { InfluencerDashboard } from "./pages/influencer/Dashboard";
import { CampaignsPage } from "./pages/influencer/CampaignsPage";
import { CampaignDetailsPage } from "./pages/influencer/CampaignDetailsPage";
import { MyCampaignsPage } from "./pages/influencer/MyCampaignsPage";
import { EarningsPage } from "./pages/influencer/EarningsPage";
import { InfluencerProfilePage } from "./pages/influencer/ProfilePage";

// Business pages
import { BusinessDashboard } from "./pages/business/Dashboard";
import { CreateCampaignPage } from "./pages/business/CreateCampaignPage";
import { BusinessMyCampaignsPage } from "./pages/business/MyCampaignsPage";
import { CampaignManagementPage } from "./pages/business/CampaignManagementPage";
import { BusinessProfilePage } from "./pages/business/ProfilePage";
import { VerificationPendingPage } from "./pages/business/VerificationPendingPage";
import { VerificationRejectedPage } from "./pages/business/VerificationRejectedPage";

// Admin pages
import { AdminDashboard } from "./pages/admin/Dashboard";
import { BusinessListPage } from "./pages/admin/BusinessListPage";
import { BusinessDetailPage } from "./pages/admin/BusinessDetailPage";
import { InfluencerListPage } from "./pages/admin/InfluencerListPage";

/**
 * Root redirect — sends authenticated users to their role-specific dashboard.
 */
function RootRedirect() {
  const { user, session, loading } = useAuth();

  if (loading) return null;

  if (session && user) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    return (
      <Navigate
        to={
          user.role === "BUSINESS"
            ? "/business/dashboard"
            : "/influencer/dashboard"
        }
        replace
      />
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      {/* ── Public routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/leaderboard/:id" element={<LeaderboardPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Route>

      {/* ── OAuth callback (no layout chrome) ── */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ── Protected: Influencer routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleGuard
              allowedRole="INFLUENCER"
              redirectTo="/business/dashboard"
            />
          }
        >
          <Route element={<AuthLayout />}>
            <Route
              path="/influencer/dashboard"
              element={<InfluencerDashboard />}
            />
            <Route
              path="/influencer/campaigns"
              element={<CampaignsPage />}
            />
            <Route
              path="/influencer/campaigns/:id"
              element={<CampaignDetailsPage />}
            />
            <Route
              path="/influencer/my-campaigns"
              element={<MyCampaignsPage />}
            />
            <Route
              path="/influencer/earnings"
              element={<EarningsPage />}
            />
            <Route
              path="/influencer/leaderboard"
              element={<SharedLeaderboardPage />}
            />
            <Route
              path="/influencer/leaderboard/:id"
              element={<SharedLeaderboardPage />}
            />
            <Route
              path="/influencer/profile"
              element={<InfluencerProfilePage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── Protected: Business routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleGuard
              allowedRole="BUSINESS"
              redirectTo="/influencer/dashboard"
            />
          }
        >
          {/* Verification status pages (no sidebar layout) */}
          <Route
            path="/business/verification-pending"
            element={<VerificationPendingPage />}
          />
          <Route
            path="/business/verification-rejected"
            element={<VerificationRejectedPage />}
          />

          <Route element={<AuthLayout />}>
            <Route
              path="/business/dashboard"
              element={<BusinessDashboard />}
            />
            <Route
              path="/business/create"
              element={<CreateCampaignPage />}
            />
            <Route
              path="/business/campaigns"
              element={<BusinessMyCampaignsPage />}
            />
            <Route
              path="/business/campaigns/:id"
              element={<CampaignManagementPage />}
            />
            <Route
              path="/business/profile"
              element={<BusinessProfilePage />}
            />
            <Route
              path="/business/leaderboard"
              element={<SharedLeaderboardPage />}
            />
            <Route
              path="/business/leaderboard/:id"
              element={<SharedLeaderboardPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── Protected: Admin routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleGuard
              allowedRole="ADMIN"
              redirectTo="/"
            />
          }
        >
          <Route element={<AuthLayout />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
            <Route
              path="/admin/businesses"
              element={<BusinessListPage />}
            />
            <Route
              path="/admin/businesses/:id"
              element={<BusinessDetailPage />}
            />
            <Route
              path="/admin/influencers"
              element={<InfluencerListPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
