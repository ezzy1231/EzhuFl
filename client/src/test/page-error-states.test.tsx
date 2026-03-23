import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPage } from "../pages/public/LandingPage";
import { CampaignsPage } from "../pages/influencer/CampaignsPage";
import { LoginPage } from "../pages/public/LoginPage";
import { SignupPage } from "../pages/public/SignupPage";
import { ApiError } from "../services/api";

const navigateMock = vi.fn();
const authMock = {
  user: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
  signInWithTikTok: vi.fn(),
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => authMock,
}));

const getAllCampaignsMock = vi.fn();
const getPublicStatsMock = vi.fn();

vi.mock("../services/campaign.service", () => ({
  getAllCampaigns: (...args: unknown[]) => getAllCampaignsMock(...args),
}));

vi.mock("../services/stats.service", () => ({
  getPublicStats: (...args: unknown[]) => getPublicStatsMock(...args),
}));

function renderWithRouter(node: React.ReactNode, initialEntries = ["/"]) {
  return render(<MemoryRouter initialEntries={initialEntries}>{node}</MemoryRouter>);
}

describe("client page error states", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    authMock.user = null;
    authMock.signIn.mockReset();
    authMock.signUp.mockReset();
    authMock.signInWithGoogle.mockReset();
    authMock.signInWithTikTok.mockReset();
    getAllCampaignsMock.mockReset();
    getPublicStatsMock.mockReset();
  });

  it("shows the landing-page campaign load error", async () => {
    getAllCampaignsMock.mockRejectedValueOnce(new ApiError("Campaigns are unavailable"));
    getPublicStatsMock.mockResolvedValueOnce({
      totalCampaigns: 0,
      activeCreators: 0,
      totalPaidOut: 0,
      avgEngagementRate: 0,
    });

    renderWithRouter(<LandingPage />);

    expect(await screen.findByText("Campaigns are unavailable")).toBeInTheDocument();
  });

  it("shows the campaigns-page load error", async () => {
    getAllCampaignsMock.mockRejectedValueOnce(new ApiError("Unable to load campaigns right now"));

    renderWithRouter(<CampaignsPage />);

    expect(await screen.findByText("Unable to load campaigns right now")).toBeInTheDocument();
  });

  it("uses normalized API details on login failures", async () => {
    authMock.signIn.mockRejectedValueOnce(
      new ApiError("Login failed", {
        details: [{ path: "email", message: "Email address is required" }],
      })
    );

    const { container } = renderWithRouter(<LoginPage />, ["/login"]);
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector("form") as HTMLFormElement;

    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.submit(form);

    expect(await screen.findByText("Email address is required")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("uses normalized API details on signup failures", async () => {
    authMock.signUp.mockRejectedValueOnce(
      new ApiError("Signup failed", {
        details: [{ path: "name", message: "Full name is required" }],
      })
    );

    const { container } = renderWithRouter(<SignupPage />, ["/signup"]);
    const textInputs = container.querySelectorAll('input[type="text"]');
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const form = container.querySelector("form") as HTMLFormElement;

    fireEvent.change(textInputs[0], { target: { value: "" } });
    fireEvent.change(emailInput, { target: { value: "person@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.submit(form);

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    await waitFor(() => expect(navigateMock).not.toHaveBeenCalled());
  });
});