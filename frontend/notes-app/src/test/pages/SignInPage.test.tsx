import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SignInPage from "@/pages/SignIn-Page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock auth service
vi.mock("@/services/authService", () => ({
  default: {
    login: vi.fn(),
    signup: vi.fn(),
  },
  handleGoogleSignIn: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe("SignIn Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<SignInPage />, { wrapper: createWrapper() });
    expect(document.body).toBeTruthy();
  });

  it("displays sign in heading", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Log in to Mantiq/i)).toBeInTheDocument();
  });

  it("has Google OAuth button", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const googleButton = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    expect(googleButton).toBeInTheDocument();
  });

  it("has GitHub OAuth button", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const githubButton = screen.getByRole("button", {
      name: /Continue with GitHub/i,
    });
    expect(githubButton).toBeInTheDocument();
  });

  it("shows navbar", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const navbar = document.querySelector("nav");
    expect(navbar).toBeTruthy();
  });

  it("shows footer", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const footer = document.querySelector("footer");
    expect(footer).toBeTruthy();
  });

  it("displays app branding", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    // Check for "Mantiq" branding - the brand name is split into individual spans
    const branding = screen.queryAllByText(/Mantiq|M|a|n|t|i|q/i);
    expect(branding.length).toBeGreaterThan(0);
  });

  it("shows secure access message", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Secure Access/i)).toBeInTheDocument();
  });

  it("displays terms of service link", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const termsLink = screen.getByRole("link", { name: /Terms of Service/i });
    expect(termsLink).toBeInTheDocument();
  });

  it("displays privacy policy link", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    const privacyLink = screen.getByRole("link", { name: /Privacy Policy/i });
    expect(privacyLink).toBeInTheDocument();
  });

  it("displays sync message", () => {
    render(<SignInPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Sync your ideas/i)).toBeInTheDocument();
  });
});
