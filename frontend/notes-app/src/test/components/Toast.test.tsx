import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast, ToastContainer } from "@/components/ui/toast";

describe("Toast Component", () => {
  const mockOnClose = vi.fn();

  it("renders success toast", () => {
    render(
      <Toast message="Success message" type="success" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("renders error toast", () => {
    render(
      <Toast message="Error message" type="error" onClose={mockOnClose} />,
    );
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("renders info toast", () => {
    render(<Toast message="Info message" type="info" onClose={mockOnClose} />);
    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("applies correct variant styles", () => {
    const { container } = render(
      <Toast message="Test" type="success" onClose={mockOnClose} />,
    );
    expect(container.querySelector('[class*="green"]')).toBeTruthy();
  });

  it("has close button", () => {
    render(<Toast message="Test" type="success" onClose={mockOnClose} />);
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });
});

describe("ToastContainer", () => {
  it("renders multiple toasts", () => {
    const toasts = [
      { id: "1", message: "Toast 1", variant: "success" as const },
      { id: "2", message: "Toast 2", variant: "error" as const },
    ];

    render(<ToastContainer toasts={toasts} onClose={() => {}} />);

    expect(screen.getByText("Toast 1")).toBeInTheDocument();
    expect(screen.getByText("Toast 2")).toBeInTheDocument();
  });

  it("renders empty when no toasts", () => {
    const { container } = render(
      <ToastContainer toasts={[]} onClose={() => {}} />,
    );
    expect(container.querySelector('[class*="toast"]')).toBeFalsy();
  });
});
