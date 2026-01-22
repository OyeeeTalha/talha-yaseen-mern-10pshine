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

    // Navbar should be present
    const navbar =
      document.querySelector("nav") || screen.queryByRole("navigation");
    expect(navbar).toBeTruthy();
  });

  it("has footer", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Footer should be present
    const footer =
      document.querySelector("footer") || screen.queryByRole("contentinfo");
    expect(footer).toBeTruthy();
  });

  it("displays call-to-action button", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    const ctaButtons = screen.getAllByRole("button", {
      name: /get started|start/i,
    });
    expect(ctaButtons.length).toBeGreaterThan(0);
    expect(ctaButtons[0]).toBeInTheDocument();
  });

  it("shows features section", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    // Should display feature highlights - use queryAllByText for multiple matches
    const featureElements = screen.queryAllByText(
      /organize|collaborate|real-time/i,
    );
    expect(featureElements.length).toBeGreaterThan(0);
  });

  it("displays trusted by section", () => {
    render(<LandingPage />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/trusted by/i) || screen.getByText(/10Pearls|Google/i),
    ).toBeInTheDocument();
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

    expect(
      screen.getByText(/v2.0|shipped/i) || screen.queryByText(/version/i),
    ).toBeTruthy();
  });

  it("has gradient text effect on main heading", () => {
    const { container } = render(<LandingPage />, { wrapper: createWrapper() });

    // Should have gradient text styling
    const gradientText =
      container.querySelector('[class*="gradient"]') ||
      container.querySelector('[class*="bg-clip-text"]');
    expect(gradientText).toBeTruthy();
  });
});
