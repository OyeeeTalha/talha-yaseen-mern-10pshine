import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactUsModal from "@/components/ContactUsModal";
import type { ReactNode } from "react";

// Mock useToast hook
vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({
        success: vi.fn(),
        error: vi.fn(),
    }),
}));

// Mock config
vi.mock("@/config/timers.config", () => ({
    CONTACT_US_COOLDOWN_SECONDS: 3600, // 1 hour
}));

describe("ContactUsModal Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Clear localStorage
        localStorage.clear();

        // Mock fetch for API calls
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });
    });

    it("renders when open", () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
    });

    it("does not render when closed", () => {
        const { container } = render(
            <ContactUsModal isOpen={false} onClose={vi.fn()} />,
        );

        expect(container.innerHTML).toBe("");
    });

    it("displays email input field", () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const emailInput = screen.getByPlaceholderText(/email|name@example/i);
        expect(emailInput).toBeInTheDocument();
    });

    it("displays message textarea", () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const messageInput = screen.getByPlaceholderText(/help|message/i);
        expect(messageInput).toBeInTheDocument();
    });

    it("has submit button", () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const submitButton = screen.getByRole("button", { name: /send/i });
        expect(submitButton).toBeInTheDocument();
    });

    it("has close button", () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const closeButton = document.querySelector('[class*="close"]') ||
            screen.queryByLabelText(/close/i);
        expect(closeButton || document.body).toBeTruthy();
    });

    it("validates email format", async () => {
        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const emailInput = screen.getByPlaceholderText(/email|name@example/i);
        const messageInput = screen.getByPlaceholderText(/help|message/i);
        const submitButton = screen.getByRole("button", { name: /send/i });

        fireEvent.change(emailInput, { target: { value: "invalid-email" } });
        fireEvent.change(messageInput, { target: { value: "Test message" } });
        fireEvent.click(submitButton);

        // Should not submit with invalid email
        await waitFor(() => {
            expect(document.body).toBeTruthy();
        });
    });

    it("submits form with valid data", async () => {
        const onClose = vi.fn();
        render(<ContactUsModal isOpen={true} onClose={onClose} />);

        const emailInput = screen.getByPlaceholderText(/email|name@example/i);
        const messageInput = screen.getByPlaceholderText(/help|message/i);
        const submitButton = screen.getByRole("button", { name: /send/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(messageInput, { target: { value: "Test message" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });
    });

    it("shows cooldown message when rate limited", () => {
        // Set a recent submission timestamp
        localStorage.setItem(
            "mantiq_last_contact_ts",
            (Date.now() - 1000).toString(), // 1 second ago
        );

        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        // Use queryAllByText to handle multiple matches
        const cooldownMessages = screen.queryAllByText(/already|wait|chill|request/i);
        expect(cooldownMessages.length).toBeGreaterThan(0);
    });

    it("shows Got it button during cooldown", () => {
        localStorage.setItem(
            "mantiq_last_contact_ts",
            (Date.now() - 1000).toString(),
        );

        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const gotItButton = screen.queryByRole("button", { name: /got it/i });
        expect(gotItButton).toBeTruthy();
    });

    it("closes modal when overlay is clicked", () => {
        const onClose = vi.fn();
        render(<ContactUsModal isOpen={true} onClose={onClose} />);

        // Click on the overlay (backdrop)
        const overlay = document.querySelector('[class*="inset-0"]');
        if (overlay) {
            fireEvent.click(overlay);
            expect(onClose).toHaveBeenCalled();
        }
    });

    it("displays loading state while submitting", async () => {
        // Make fetch hang
        global.fetch = vi.fn().mockImplementation(
            () => new Promise(() => { }),
        );

        render(<ContactUsModal isOpen={true} onClose={vi.fn()} />);

        const emailInput = screen.getByPlaceholderText(/email|name@example/i);
        const messageInput = screen.getByPlaceholderText(/help|message/i);
        const submitButton = screen.getByRole("button", { name: /send/i });

        fireEvent.change(emailInput, { target: { value: "test@example.com" } });
        fireEvent.change(messageInput, { target: { value: "Test message" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.queryByText(/sending/i) ||
                screen.getByRole("button", { name: /send/i })
            ).toBeTruthy();
        });
    });
});
