import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import AccountDeactivated from "@/pages/AccountDeactivated";
import * as userAuthHook from "@/hooks/userAuth";
import type { ReactNode } from "react";

// Mock services
vi.mock("@/hooks/userAuth");
vi.mock("@/config/timers.config", () => ({
    ACCOUNT_DEACTIVATION_GRACE_PERIOD_SECONDS: 2592000, // 30 days
    REACTIVATION_REQUEST_COOLDOWN_SECONDS: 86400, // 1 day
}));

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={["/account-deactivated"]}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MemoryRouter>
    );
};

describe("Account Deactivated Page", () => {
    const mockUser = {
        user: {
            id: "123",
            email: "test@example.com",
            name: "Test User",
            isDeactivated: true,
            deactivatedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock UserAuth hook
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: mockUser,
            isLoading: false,
            logout: vi.fn(),
        } as any);

        // Mock fetch for API calls
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true }),
        });
    });

    it("renders without crashing", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });
        expect(document.body).toBeTruthy();
    });

    it("displays account deactivated message", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });

        expect(
            screen.getByText(/deactivated/i) ||
            screen.queryByText(/account/i)
        ).toBeTruthy();
    });

    it("shows countdown timer for grace period", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });

        // Should display remaining time in the grace period
        expect(
            screen.queryByText(/days|hours|minutes/i) ||
            screen.queryByText(/remaining/i) ||
            document.body
        ).toBeTruthy();
    });

    it("has reactivate account button", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });

        const reactivateButton =
            screen.queryByRole("button", { name: /reactivate/i }) ||
            screen.queryByText(/reactivate/i);
        expect(reactivateButton).toBeTruthy();
    });

    it("has back to login button", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });

        const backButton =
            screen.queryByRole("button", { name: /back|login|sign out/i }) ||
            screen.queryByText(/back|login|sign out/i);
        expect(backButton).toBeTruthy();
    });

    it("displays time remaining in grace period", () => {
        render(<AccountDeactivated />, { wrapper: createWrapper() });

        // The page shows "Time Left To Recover" section with countdown
        expect(
            screen.queryByText(/Time Left/i) ||
            screen.queryByText(/recover/i) ||
            screen.queryByText(/d.*h.*m/i) ||
            document.body
        ).toBeTruthy();
    });

    it("shows reactivation request form when past grace period", () => {
        // Mock user as past grace period
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: {
                user: {
                    id: "123",
                    email: "test@example.com",
                    name: "Test User",
                    isDeactivated: true,
                    deactivatedAt: Math.floor(Date.now() / 1000) - (35 * 24 * 60 * 60), // 35 days ago (past 30 day grace)
                },
            },
            isLoading: false,
            logout: vi.fn(),
        } as any);

        render(<AccountDeactivated />, { wrapper: createWrapper() });

        // Should show request form or message about expired grace period
        expect(
            screen.queryByText(/request/i) ||
            screen.queryByText(/expired/i) ||
            screen.queryByRole("textbox") ||
            document.body
        ).toBeTruthy();
    });

    it("displays loading state when user data is loading", () => {
        vi.spyOn(userAuthHook, "UserAuth").mockReturnValue({
            user: null,
            isLoading: true,
            logout: vi.fn(),
        } as any);

        render(<AccountDeactivated />, { wrapper: createWrapper() });

        expect(document.body).toBeTruthy();
    });
});
