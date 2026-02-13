import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { UserModel } from "../src/models/User.js";
import { Types } from "mongoose";

// Mock the @auth/express module
vi.mock("@auth/express", () => ({
    getSession: vi.fn(),
    ExpressAuth: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

// Mock nodemailer to prevent actual email sending
vi.mock("nodemailer", () => ({
    default: {
        createTransport: vi.fn(() => ({
            sendMail: vi.fn().mockResolvedValue({ messageId: "test-id" }),
        })),
    },
}));

import { getSession } from "@auth/express";
import app from "../src/app.js";

describe("User API Endpoints", () => {
    let testUser: any;
    let testUserId: string;

    // Helper function to create a test user
    const createTestUser = async (options: Partial<{
        isDeactivated: boolean;
        deactivatedAt: number;
        deactivationExpireAt: Date;
    }> = {}) => {
        const user = await UserModel.create({
            googleId: `google_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            name: "Test User",
            firstName: "Test",
            lastName: "User",
            bio: "Test bio",
            avatar: "default-avatar-1",
            avatarBgColor: "#60a5fa",
            catagories: [
                {
                    id: new Types.ObjectId(),
                    name: "Void",
                },
            ],
            isDeleted: false,
            ...options,
        });
        return user;
    };

    // Mock authentication by mocking getSession
    const mockAuth = (userId: string) => {
        vi.mocked(getSession).mockImplementation(async () => ({
            user: {
                id: userId,
                email: "test@example.com",
                name: "Test User",
            },
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        } as any));
    };

    const mockNoAuth = () => {
        vi.mocked(getSession).mockImplementation(async () => null as any);
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    beforeEach(async () => {
        testUser = await createTestUser();
        testUserId = testUser._id.toString();
        mockAuth(testUserId);
    });

    describe("GET /user/profile", () => {
        it("should retrieve user profile successfully", async () => {
            const response = await request(app)
                .get("/user/profile")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.email).toBe(testUser.email);
            expect(response.body.data.user.name).toBe("Test User");
        });

        it("should not expose sensitive fields", async () => {
            const response = await request(app)
                .get("/user/profile")
                .expect(200);

            expect(response.body.data.user.accessToken).toBeUndefined();
            expect(response.body.data.user.refreshToken).toBeUndefined();
            expect(response.body.data.user.googleId).toBeUndefined();
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            const response = await request(app)
                .get("/user/profile")
                .expect(401);

            expect(response.body.message).toContain("not logged in");
        });
    });

    describe("PATCH /user/profile", () => {
        it("should update user profile successfully", async () => {
            const updateData = {
                displayName: "Updated Display Name",
                firstName: "Updated",
                lastName: "Name",
                bio: "Updated bio content",
            };

            const response = await request(app)
                .patch("/user/profile")
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.displayName).toBe(updateData.displayName);
            expect(response.body.data.user.firstName).toBe(updateData.firstName);
            expect(response.body.data.user.bio).toBe(updateData.bio);
        });

        it("should update avatar settings", async () => {
            const updateData = {
                avatar: "custom-avatar-5",
                avatarBgColor: "#ff5733",
            };

            const response = await request(app)
                .patch("/user/profile")
                .send(updateData)
                .expect(200);

            expect(response.body.data.user.avatar).toBe(updateData.avatar);
            expect(response.body.data.user.avatarBgColor).toBe(updateData.avatarBgColor);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .patch("/user/profile")
                .send({ displayName: "Test" })
                .expect(401);
        });
    });

    describe("DELETE /user/deactivate", () => {
        it("should deactivate account successfully", async () => {
            const response = await request(app)
                .delete("/user/deactivate")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("deactivated");

            // Verify user is marked as deactivated in DB
            const updatedUser = await UserModel.findById(testUserId);
            expect(updatedUser?.isDeactivated).toBe(true);
            expect(updatedUser?.deactivatedAt).toBeDefined();
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .delete("/user/deactivate")
                .expect(401);
        });
    });

    describe("POST /user/reactivate", () => {
        beforeEach(async () => {
            // Set up a deactivated user within grace period
            const deactivatedAt = Math.floor(Date.now() / 1000);
            await UserModel.findByIdAndUpdate(testUserId, {
                isDeactivated: true,
                deactivatedAt: deactivatedAt,
                deactivationExpireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
        });

        it("should reactivate account within grace period", async () => {
            const response = await request(app)
                .post("/user/reactivate")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("reactivated");

            // Verify user is reactivated in DB
            const updatedUser = await UserModel.findById(testUserId);
            expect(updatedUser?.isDeactivated).toBe(false);
        });

        it("should fail if account is not deactivated", async () => {
            // Reset user to active state
            await UserModel.findByIdAndUpdate(testUserId, {
                isDeactivated: false,
                $unset: { deactivatedAt: 1, deactivationExpireAt: 1 },
            });

            await request(app)
                .post("/user/reactivate")
                .expect(400);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .post("/user/reactivate")
                .expect(401);
        });
    });

    describe("POST /user/reactivation-request", () => {
        beforeEach(async () => {
            // Set up a deactivated user past grace period
            const deactivatedAt = Math.floor(Date.now() / 1000) - (35 * 24 * 60 * 60); // 35 days ago
            await UserModel.findByIdAndUpdate(testUserId, {
                isDeactivated: true,
                deactivatedAt: deactivatedAt,
            });
        });

        it("should submit reactivation request successfully", async () => {
            const requestData = {
                subject: "Request to reactivate my account",
                message: "I need my account back please.",
            };

            const response = await request(app)
                .post("/user/reactivation-request")
                .send(requestData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("submitted");

            // Verify request is marked in DB
            const updatedUser = await UserModel.findById(testUserId);
            expect(updatedUser?.reactivationRequestSubmitted).toBe(true);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .post("/user/reactivation-request")
                .send({ subject: "Test", message: "Test" })
                .expect(401);
        });
    });
});
