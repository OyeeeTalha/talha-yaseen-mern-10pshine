import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { UserModel } from "../src/models/User.js";

// Mock the @auth/express module
vi.mock("@auth/express", () => ({
  getSession: vi.fn(),
  ExpressAuth: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

import { getSession } from "@auth/express";
import app from "../src/app.js";

describe("Notes API Endpoints", () => {
  let testUser: any;
  let testUserId: string;

  // Helper function to create a test user
  const createTestUser = async () => {
    const user = await UserModel.create({
      googleId: `google_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      name: "Test User",
      catagories: [],
      isDeleted: false,
    });
    return user;
  };

  // Mock authentication by mocking getSession
  const mockAuth = (userId: string) => {
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: userId,
        email: "test@example.com",
        name: "Test User",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(async () => {
    // Create a test user before each test
    testUser = await createTestUser();
    testUserId = testUser._id.toString();
    mockAuth(testUserId);
  });

  describe("POST /notes/create-note", () => {
    it("should create a new note successfully", async () => {
      const noteData = {
        title: "Test Note",
        content: "This is test content",
        category: "Work",
        tags: ["test", "work"],
        isPinned: false,
      };

      const response = await request(app)
        .post("/notes/create-note")
        .send(noteData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.note).toBeDefined();
      expect(response.body.data.note.title).toBe(noteData.title);
      expect(response.body.data.note.content).toBe(noteData.content);
    });

    it("should create a note with optional fields", async () => {
      const noteData = {
        title: "Minimal Note",
      };

      const response = await request(app)
        .post("/notes/create-note")
        .send(noteData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.note.title).toBe(noteData.title);
    });

    it("should fail without authentication", async () => {
      vi.mocked(getSession).mockResolvedValue(null as any);

      const response = await request(app)
        .post("/notes/create-note")
        .send({ title: "Test" })
        .expect(401);

      expect(response.body.message).toContain("not logged in");
    });
  });

  describe("PATCH /notes/update-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app).post("/notes/create-note").send({
        title: "Original Title",
        content: "Original Content",
      });

      noteId = response.body.data.note._id;
    });

    it("should update a note successfully", async () => {
      const updateData = {
        title: "Updated Title",
        content: "Updated Content",
      };

      const response = await request(app)
        .patch(`/notes/update-note/${noteId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.note.title).toBe(updateData.title);
      expect(response.body.data.note.content).toBe(updateData.content);
    });

    it("should update specific fields only", async () => {
      const response = await request(app)
        .patch(`/notes/update-note/${noteId}`)
        .send({ isPinned: true })
        .expect(200);

      expect(response.body.data.note.isPinned).toBe(true);
      expect(response.body.data.note.title).toBe("Original Title");
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app)
        .patch(`/notes/update-note/${fakeId}`)
        .send({ title: "Updated" })
        .expect(404);
    });
  });

  describe("DELETE /notes/delete-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app).post("/notes/create-note").send({
        title: "Note to Delete",
        content: "This will be deleted",
      });

      noteId = response.body.data.note._id;
    });

    it("should soft delete a note successfully", async () => {
      const response = await request(app)
        .delete(`/notes/delete-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("deleted");
      expect(response.body.data.note.isDeleted).toBe(true);
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).delete(`/notes/delete-note/${fakeId}`).expect(404);
    });
  });

  describe("GET /notes/get-notes", () => {
    beforeEach(async () => {
      // Create multiple test notes
      await request(app)
        .post("/notes/create-note")
        .send({ title: "Note 1", isPinned: true });

      await request(app)
        .post("/notes/create-note")
        .send({ title: "Note 2", isPinned: false });

      await request(app)
        .post("/notes/create-note")
        .send({ title: "Note 3", isPinned: false });
    });

    it("should retrieve all notes", async () => {
      const response = await request(app).get("/notes/get-notes").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.notes).toHaveLength(3);
      expect(response.body.results).toBe(3);
    });

    it("should sort notes with pinned first", async () => {
      const response = await request(app).get("/notes/get-notes").expect(200);

      expect(response.body.data.notes[0].isPinned).toBe(true);
    });

    it("should implement pagination", async () => {
      const response = await request(app)
        .get("/notes/get-notes?page=1&limit=2")
        .expect(200);

      expect(response.body.data.notes).toHaveLength(2);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(2);
    });

    it("should not return deleted notes", async () => {
      const note = await request(app)
        .post("/notes/create-note")
        .send({ title: "Deleted Note" });

      await request(app).delete(
        `/notes/delete-note/${note.body.data.note._id}`
      );

      const response = await request(app).get("/notes/get-notes").expect(200);

      expect(response.body.data.notes).toHaveLength(3); // Only non-deleted
    });
  });

  describe("GET /notes/get-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app).post("/notes/create-note").send({
        title: "Specific Note",
        content: "Specific Content",
      });

      noteId = response.body.data.note._id;
    });

    it("should retrieve a specific note by ID", async () => {
      const response = await request(app)
        .get(`/notes/get-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.note.title).toBe("Specific Note");
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).get(`/notes/get-note/${fakeId}`).expect(404);
    });

    it("should not retrieve deleted notes", async () => {
      await request(app).delete(`/notes/delete-note/${noteId}`);

      await request(app).get(`/notes/get-note/${noteId}`).expect(404);
    });
  });

  describe("GET /notes/get-notes-by-category/:category", () => {
    beforeEach(async () => {
      await request(app)
        .post("/notes/create-note")
        .send({ title: "Work Note 1", category: "Work", isPinned: true });

      await request(app)
        .post("/notes/create-note")
        .send({ title: "Work Note 2", category: "Work" });

      await request(app)
        .post("/notes/create-note")
        .send({ title: "Personal Note", category: "Personal" });
    });

    it("should retrieve notes by category", async () => {
      const response = await request(app)
        .get("/notes/get-notes-by-category/Work")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.notes).toHaveLength(2);
      expect(
        response.body.data.notes.every((n: any) => n.category === "Work")
      ).toBe(true);
    });

    it("should sort notes with pinned first", async () => {
      const response = await request(app)
        .get("/notes/get-notes-by-category/Work")
        .expect(200);

      expect(response.body.data.notes[0].isPinned).toBe(true);
    });

    it("should return empty array for non-existent category", async () => {
      const response = await request(app)
        .get("/notes/get-notes-by-category/NonExistent")
        .expect(200);

      expect(response.body.data.notes).toHaveLength(0);
    });
  });

  describe("PATCH /notes/pin-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/notes/create-note")
        .send({ title: "Note to Pin", isPinned: false });

      noteId = response.body.data.note._id;
    });

    it("should pin a note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/pin-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("pinned");
      expect(response.body.data.note.isPinned).toBe(true);
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).patch(`/notes/pin-note/${fakeId}`).expect(404);
    });
  });

  describe("PATCH /notes/unpin-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/notes/create-note")
        .send({ title: "Pinned Note", isPinned: true });

      noteId = response.body.data.note._id;
    });

    it("should unpin a note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/unpin-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("unpinned");
      expect(response.body.data.note.isPinned).toBe(false);
    });
  });

  describe("Category Management", () => {
    describe("POST /notes/create-category", () => {
      it("should create a category successfully", async () => {
        const response = await request(app)
          .post("/notes/create-category")
          .send({ name: "New Category" })
          .expect(201);

        expect(response.body.status).toBe("success");
        expect(response.body.data.category.name).toBe("New Category");
      });

      it("should fail without category name", async () => {
        await request(app).post("/notes/create-category").send({}).expect(400);
      });
    });

    describe("GET /notes/get-categories", () => {
      beforeEach(async () => {
        await request(app)
          .post("/notes/create-category")
          .send({ name: "Work" });

        await request(app)
          .post("/notes/create-category")
          .send({ name: "Personal" });
      });

      it("should retrieve all categories", async () => {
        const response = await request(app)
          .get("/notes/get-categories")
          .expect(200);

        expect(response.body.status).toBe("success");
        expect(response.body.data.categories.length).toBeGreaterThanOrEqual(2);
      });

      it("should sort categories alphabetically", async () => {
        const response = await request(app)
          .get("/notes/get-categories")
          .expect(200);

        const categories = response.body.data.categories;
        expect(categories[0].name).toBe("Personal");
        expect(categories[1].name).toBe("Work");
      });
    });

    describe("DELETE /notes/delete-category/:id", () => {
      let categoryId: number;

      beforeEach(async () => {
        const response = await request(app)
          .post("/notes/create-category")
          .send({ name: "To Delete" });

        categoryId = response.body.data.category.id;
      });

      it("should soft delete a category", async () => {
        const response = await request(app)
          .delete(`/notes/delete-category/${categoryId}`)
          .expect(200);

        expect(response.body.status).toBe("success");
        expect(response.body.message).toContain("deleted");
      });

      it("should return 404 for non-existent category", async () => {
        await request(app).delete("/notes/delete-category/999999").expect(404);
      });
    });

    describe("PATCH /notes/assign-note-category/:noteId", () => {
      let noteId: string;
      let categoryName: string;

      beforeEach(async () => {
        const catResponse = await request(app)
          .post("/notes/create-category")
          .send({ name: "Work" });

        categoryName = catResponse.body.data.category.name;

        const noteResponse = await request(app)
          .post("/notes/create-note")
          .send({ title: "Test Note" });

        noteId = noteResponse.body.data.note._id;
      });

      it("should assign category to note", async () => {
        const response = await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: categoryName })
          .expect(200);

        expect(response.body.status).toBe("success");
        expect(response.body.data.note.category).toBe(categoryName);
      });

      it("should remove category by setting to null", async () => {
        await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: categoryName });

        const response = await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: null })
          .expect(200);

        expect(response.body.data.note.category).toBeNull();
      });

      it("should fail for non-existent category", async () => {
        await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: "NonExistentCategory" })
          .expect(404);
      });
    });
  });
});
