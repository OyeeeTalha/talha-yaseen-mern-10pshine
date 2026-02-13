import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Mock the @auth/express module
vi.mock("@auth/express", () => ({
    getSession: vi.fn(),
    ExpressAuth: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

import app from "../src/app.js";

describe("App Core Endpoints", () => {
    describe("GET /", () => {
        it("should return welcome message with service info", async () => {
            const response = await request(app)
                .get("/")
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toContain("Welcome");
            expect(response.body.data.service).toBe("10pShine-backend");
            expect(response.body.data.version).toBe("1.0.0");
            expect(response.body.data.environment).toBeDefined();
            expect(response.body.data.serverTime).toBeDefined();
            expect(response.body.data.uptime).toBeDefined();
        });
    });

    describe("GET /health", () => {
        it("should return OK status", async () => {
            const response = await request(app)
                .get("/health")
                .expect(200);

            expect(response.body.status).toBe("OK");
        });
    });

    describe("GET /config", () => {
        it("should return timer configuration", async () => {
            const response = await request(app)
                .get("/config")
                .expect(200);

            expect(response.body).toBeDefined();
            // Config should contain timer values
            expect(typeof response.body).toBe("object");
        });
    });

    describe("404 Handler", () => {
        it("should return 404 for unknown routes", async () => {
            const response = await request(app)
                .get("/unknown-route")
                .expect(404);

            expect(response.body.message).toContain("Can't find");
        });

        it("should return 404 for unknown POST routes", async () => {
            const response = await request(app)
                .post("/unknown-route")
                .send({ data: "test" })
                .expect(404);

            expect(response.body.message).toContain("Can't find");
        });
    });
});
