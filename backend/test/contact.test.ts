import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import SubmissionLogModel from "../src/features/contact/submissionLog.model.js";
import WaitlistModel from "../src/features/contact/waitlist.model.js";

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

import app from "../src/app.js";

describe("Contact API Endpoints", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /contact", () => {
        it("should submit contact form successfully", async () => {
            const contactData = {
                email: "test@example.com",
                subject: "Test Subject",
                message: "This is a test message for the contact form.",
            };

            const response = await request(app)
                .post("/contact")
                .send(contactData)
                .expect(201);

            expect(response.body.error).toBe(false);
            expect(response.body.message).toContain("received");
        });

        it("should submit contact form without subject", async () => {
            const contactData = {
                email: "test@example.com",
                message: "This is a test message without subject.",
            };

            const response = await request(app)
                .post("/contact")
                .send(contactData)
                .expect(201);

            expect(response.body.error).toBe(false);
        });

        it("should fail without email", async () => {
            const contactData = {
                subject: "Test Subject",
                message: "This is a test message.",
            };

            const response = await request(app)
                .post("/contact")
                .send(contactData)
                .expect(400);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("required");
        });

        it("should fail without message", async () => {
            const contactData = {
                email: "test@example.com",
                subject: "Test Subject",
            };

            const response = await request(app)
                .post("/contact")
                .send(contactData)
                .expect(400);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("required");
        });

        it("should rate limit duplicate submissions from same IP", async () => {
            const contactData = {
                email: "test@example.com",
                subject: "Test Subject",
                message: "First message.",
            };

            // First submission should succeed
            await request(app)
                .post("/contact")
                .send(contactData)
                .expect(201);

            // Second submission should be rate limited
            const response = await request(app)
                .post("/contact")
                .send({
                    email: "another@example.com",
                    subject: "Another Subject",
                    message: "Second message.",
                })
                .expect(429);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("recently");
        });
    });

    describe("POST /waitlist", () => {
        it("should add email to waitlist successfully", async () => {
            const waitlistData = {
                email: `waitlist_${Date.now()}@example.com`,
                type: "general",
            };

            const response = await request(app)
                .post("/waitlist")
                .send(waitlistData)
                .expect(201);

            expect(response.body.error).toBe(false);
            expect(response.body.message).toContain("Added to waitlist");
        });

        it("should add email to waitlist with specific type", async () => {
            const waitlistData = {
                email: `waitlist_type_${Date.now()}@example.com`,
                type: "beta",
            };

            const response = await request(app)
                .post("/waitlist")
                .send(waitlistData)
                .expect(201);

            expect(response.body.error).toBe(false);
        });

        it("should fail without email", async () => {
            const waitlistData = {
                type: "general",
            };

            const response = await request(app)
                .post("/waitlist")
                .send(waitlistData)
                .expect(400);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("required");
        });

        it("should prevent duplicate email on waitlist", async () => {
            const email = `duplicate_${Date.now()}@example.com`;

            // First submission
            await request(app)
                .post("/waitlist")
                .send({ email, type: "general" })
                .expect(201);

            // Clear rate limit log to allow second submission
            await SubmissionLogModel.deleteMany({ action: "waitlist" });

            // Duplicate submission
            const response = await request(app)
                .post("/waitlist")
                .send({ email, type: "general" })
                .expect(400);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("already on the waitlist");
        });

        it("should rate limit duplicate submissions from same IP", async () => {
            const email1 = `waitlist_rate1_${Date.now()}@example.com`;
            const email2 = `waitlist_rate2_${Date.now()}@example.com`;

            // First submission should succeed
            await request(app)
                .post("/waitlist")
                .send({ email: email1, type: "general" })
                .expect(201);

            // Second submission should be rate limited
            const response = await request(app)
                .post("/waitlist")
                .send({ email: email2, type: "general" })
                .expect(429);

            expect(response.body.error).toBe(true);
            expect(response.body.message).toContain("recently");
        });
    });
});
