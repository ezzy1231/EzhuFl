import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/Spinner";

// Layouts
import { PublicLayout } from "./layouts/PublicLayout";
import { AuthLayout } from "./layouts/AuthLayout";

// Guards
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";

const LandingPage = lazy(() => import("./pages/public/LandingPage").then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("./pages/public/LoginPage").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./pages/public/SignupPage").then((module) => ({ default: module.SignupPage })));
const LeaderboardPage = lazy(() => import("./pages/public/LeaderboardPage").then((module) => ({ default: module.LeaderboardPage })));
const AuthCallbackPage = lazy(() => import("./pages/public/AuthCallbackPage").then((module) => ({ default: module.AuthCallbackPage })));
const TermsPage = lazy(() => import("./pages/public/TermsPage").then((module) => ({ default: module.TermsPage })));
const PrivacyPage = lazy(() => import("./pages/public/PrivacyPage").then((module) => ({ default: module.PrivacyPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const SharedLeaderboardPage = lazy(() => import("./pages/shared/LeaderboardPage").then((module) => ({ default: module.SharedLeaderboardPage })));
const InfluencerDashboard = lazy(() => import("./pages/influencer/Dashboard").then((module) => ({ default: module.InfluencerDashboard })));
const CampaignsPage = lazy(() => import("./pages/influencer/CampaignsPage").then((module) => ({ default: module.CampaignsPage })));
const CampaignDetailsPage = lazy(() => import("./pages/influencer/CampaignDetailsPage").then((module) => ({ default: module.CampaignDetailsPage })));
const MyCampaignsPage = lazy(() => import("./pages/influencer/MyCampaignsPage").then((module) => ({ default: module.MyCampaignsPage })));
const EarningsPage = lazy(() => import("./pages/influencer/EarningsPage").then((module) => ({ default: module.EarningsPage })));
const InfluencerProfilePage = lazy(() => import("./pages/influencer/ProfilePage").then((module) => ({ default: module.InfluencerProfilePage })));
const BusinessDashboard = lazy(() => import("./pages/business/Dashboard").then((module) => ({ default: module.BusinessDashboard })));
const CreateCampaignPage = lazy(() => import("./pages/business/CreateCampaignPage").then((module) => ({ default: module.CreateCampaignPage })));
const BusinessMyCampaignsPage = lazy(() => import("./pages/business/MyCampaignsPage").then((module) => ({ default: module.BusinessMyCampaignsPage })));
const CampaignManagementPage = lazy(() => import("./pages/business/CampaignManagementPage").then((module) => ({ default: module.CampaignManagementPage })));
const BusinessProfilePage = lazy(() => import("./pages/business/ProfilePage").then((module) => ({ default: module.BusinessProfilePage })));
const VerificationPendingPage = lazy(() => import("./pages/business/VerificationPendingPage").then((module) => ({ default: module.VerificationPendingPage })));
const VerificationRejectedPage = lazy(() => import("./pages/business/VerificationRejectedPage").then((module) => ({ default: module.VerificationRejectedPage })));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard").then((module) => ({ default: module.AdminDashboard })));
const BusinessListPage = lazy(() => import("./pages/admin/BusinessListPage").then((module) => ({ default: module.BusinessListPage })));
const BusinessDetailPage = lazy(() => import("./pages/admin/BusinessDetailPage").then((module) => ({ default: module.BusinessDetailPage })));
const InfluencerListPage = lazy(() => import("./pages/admin/InfluencerListPage").then((module) => ({ default: module.InfluencerListPage })));

function RouteFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

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
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
  );
}
