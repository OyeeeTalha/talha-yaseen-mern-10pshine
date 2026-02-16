import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import LandingPage from "@/pages/Landing-Page";

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );
};

describe("Landing Page", () => {
  it("renders without crashing", () => {
    render(<LandingPage />, { wrapper: createWrapper() });
    expect(document.body).toBeTruthy();
  });

  it("displays main heading", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/Capture ideas/i) ||
      screen.getByRole("heading", { level: 1 }),
    ).toBeInTheDocument();
  });

  it("has navbar", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const navbar =
      document.querySelector("nav") || screen.queryByRole("navigation");
    expect(navbar).toBeTruthy();
  });

  it("has footer", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const footer =
      document.querySelector("footer") || screen.queryByRole("contentinfo");
    expect(footer).toBeTruthy();
  });

  it("displays call-to-action links", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // The CTA buttons are Links wrapped in Buttons, so they have role="link"
    const getStartedLinks = screen.getAllByRole("link", {
      name: /get started/i,
    });
    expect(getStartedLinks.length).toBeGreaterThan(0);
    expect(getStartedLinks[0]).toBeInTheDocument();
  });

  it("shows features section", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Should display feature highlights
    expect(screen.getByText(/Distraction-free/i)).toBeInTheDocument();
    expect(screen.getByText(/Limitless Canvas/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Search/i)).toBeInTheDocument();
  });

  it("displays trusted by section", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/TRUSTED BY/i)).toBeInTheDocument();
    expect(screen.getByText(/10Pearls/i)).toBeInTheDocument();
  });

  it("has responsive layout", () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() });

    // Should have responsive grid/flex classes
    const responsiveElement =
      container.querySelector('[class*="lg:"]') ||
      container.querySelector('[class*="sm:"]');
    expect(responsiveElement).toBeTruthy();
  });

  it("displays version badge", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Use queryAllByText to handle multiple matches
    const versionElements = screen.queryAllByText(/v2.0|shipped/i);
    expect(versionElements.length).toBeGreaterThan(0);
  });

  it("has gradient text effect on main heading", () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() });

    // Should have gradient text styling
    const gradientText =
      container.querySelector('[class*="gradient"]') ||
      container.querySelector('[class*="bg-clip-text"]');
    expect(gradientText).toBeTruthy();
  });

  it("displays app branding as Mantiq", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Check for Mantiq branding - appears in multiple places
    const mantiqElements = screen.queryAllByText(/Mantiq/i);
    expect(mantiqElements.length).toBeGreaterThan(0);
  });

  it("has sign in link", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const signInLink = document.querySelector('a[href="/signin"]');
    expect(signInLink).toBeTruthy();
  });

  it("displays about section with author info", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Author name appears multiple times in the about section
    const authorElements = screen.queryAllByText(/Muhammad Talha Yaseen/i);
    expect(authorElements.length).toBeGreaterThan(0);
  });

  it("has contact us button", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const contactButton = screen.getByRole("button", { name: /Contact Us/i });
    expect(contactButton).toBeInTheDocument();
  });
});
