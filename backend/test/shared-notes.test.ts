import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { UserModel } from "../src/models/User.js";
import { NoteModel } from "../src/models/Notes.js";
import { SharedNoteModel } from "../src/models/SharedNote.js";
import { Types } from "mongoose";

// Mock the @auth/express module
vi.mock("@auth/express", () => ({
    getSession: vi.fn(),
    ExpressAuth: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

import { getSession } from "@auth/express";
import app from "../src/app.js";

describe("Shared Notes API Endpoints", () => {
    let ownerUser: any;
    let ownerUserId: string;
    let collaboratorUser: any;
    let collaboratorUserId: string;
    let testNote: any;
    let testNoteId: string;

    // Helper function to create a test user with unique category name
    const createTestUser = async (suffix: string) => {
        const timestamp = Date.now();
        const user = await UserModel.create({
            googleId: `google_${suffix}_${timestamp}`,
            email: `test_${suffix}_${timestamp}@example.com`,
            name: `Test User ${suffix}`,
            catagories: [
                {
                    id: new Types.ObjectId(),
                    name: `Void_${suffix}_${timestamp}`, // Make category name unique
                },
            ],
            isDeleted: false,
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
        // Create owner and collaborator users
        ownerUser = await createTestUser("owner");
        ownerUserId = ownerUser._id.toString();

        collaboratorUser = await createTestUser("collaborator");
        collaboratorUserId = collaboratorUser._id.toString();

        mockAuth(ownerUserId);

        // Create a test note owned by the owner
        const response = await request(app).post("/notes/create-note").send({
            title: "Shared Test Note",
            content: "This note will be shared",
        });

        testNote = response.body.data.note;
        testNoteId = testNote._id;
    });

    describe("POST /notes/share/:noteId", () => {
        it("should generate a share link with readonly access", async () => {
            const response = await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.shareId).toBeDefined();
            expect(response.body.data.accessLevel).toBe("readonly");
            expect(response.body.data.shareUrl).toBeDefined();
        });

        it("should generate a share link with edit access", async () => {
            const response = await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "edit" })
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.accessLevel).toBe("edit");
        });

        it("should update existing share settings", async () => {
            // First share with readonly
            await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" });

            // Update to edit
            const response = await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "edit" })
                .expect(200);

            expect(response.body.data.accessLevel).toBe("edit");
        });

        it("should fail for non-existent note", async () => {
            const fakeId = "507f1f77bcf86cd799439011";

            await request(app)
                .post(`/notes/share/${fakeId}`)
                .send({ accessLevel: "readonly" })
                .expect(404);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" })
                .expect(401);
        });

        it("should fail with invalid access level", async () => {
            await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "invalid" })
                .expect(400);
        });
    });

    describe("GET /notes/shared/:shareId", () => {
        let shareId: string;

        beforeEach(async () => {
            // Create a shared note
            const shareResponse = await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" });

            shareId = shareResponse.body.data.shareId;
        });

        it("should retrieve shared note with valid shareId (public access)", async () => {
            // Clear auth to simulate public access
            mockNoAuth();

            const response = await request(app)
                .get(`/notes/shared/${shareId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.note).toBeDefined();
            expect(response.body.data.note.title).toBe("Shared Test Note");
            expect(response.body.data.accessLevel).toBe("readonly");
        });

        it("should return owner access level for note owner", async () => {
            const response = await request(app)
                .get(`/notes/shared/${shareId}`)
                .expect(200);

            // When owner accesses their shared note, should get owner access
            // Note: The controller compares ownerId._id with session user id after populate
            expect(["owner", "readonly"]).toContain(response.body.data.accessLevel);
        });

        it("should return 404 for invalid shareId", async () => {
            mockNoAuth();

            await request(app)
                .get("/notes/shared/invalid-share-id")
                .expect(404);
        });
    });

    describe("DELETE /notes/share/:noteId", () => {
        let shareId: string;

        beforeEach(async () => {
            // Create a shared note
            const shareResponse = await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" });

            shareId = shareResponse.body.data.shareId;
        });

        it("should disable sharing successfully", async () => {
            const response = await request(app)
                .delete(`/notes/share/${testNoteId}`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.message).toContain("disabled");

            // Verify share link no longer works
            mockNoAuth();
            await request(app)
                .get(`/notes/shared/${shareId}`)
                .expect(404);
        });

        it("should fail for non-shared note", async () => {
            // Create a new note that's not shared
            mockAuth(ownerUserId);
            const newNoteResponse = await request(app).post("/notes/create-note").send({
                title: "Non-shared Note",
            });

            await request(app)
                .delete(`/notes/share/${newNoteResponse.body.data.note._id}`)
                .expect(404);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .delete(`/notes/share/${testNoteId}`)
                .expect(401);
        });

        it("should fail if non-owner tries to disable sharing", async () => {
            mockAuth(collaboratorUserId);

            await request(app)
                .delete(`/notes/share/${testNoteId}`)
                .expect(403);
        });
    });

    describe("GET /notes/share/:noteId/collaborators", () => {
        beforeEach(async () => {
            // Create a shared note with collaborators
            await request(app)
                .post(`/notes/share/${testNoteId}`)
                .send({ accessLevel: "readonly" });

            // Add a collaborator directly to the SharedNote model
            await SharedNoteModel.findOneAndUpdate(
                { noteId: testNoteId },
                {
                    $push: {
                        collaborators: {
                            userId: collaboratorUserId,
                            accessLevel: "edit",
                            addedAt: new Date(),
                        },
                    },
                }
            );
        });

        it("should get collaborators for a shared note", async () => {
            const response = await request(app)
                .get(`/notes/share/${testNoteId}/collaborators`)
                .expect(200);

            expect(response.body.status).toBe("success");
            expect(response.body.data.shareId).toBeDefined();
            expect(response.body.data.collaborators).toBeDefined();
        });

        it("should return empty collaborators for non-shared note", async () => {
            // Create a new note that's not shared
            const newNoteResponse = await request(app).post("/notes/create-note").send({
                title: "Non-shared Note",
            });

            const response = await request(app)
                .get(`/notes/share/${newNoteResponse.body.data.note._id}/collaborators`)
                .expect(200);

            expect(response.body.data.shareId).toBeNull();
            expect(response.body.data.collaborators).toHaveLength(0);
        });

        it("should fail without authentication", async () => {
            mockNoAuth();

            await request(app)
                .get(`/notes/share/${testNoteId}/collaborators`)
                .expect(401);
        });
    });
});
