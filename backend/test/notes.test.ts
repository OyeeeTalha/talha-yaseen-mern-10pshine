import { describe, it, beforeEach, expect, vi, afterEach } from "vitest";
import request from "supertest";
import { UserModel } from "../src/models/User.js";
import { Types } from "mongoose";

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
      catagories: [
        {
          id: new Types.ObjectId(),
          name: "Void",
        },
      ],
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

  describe("PATCH /notes/trash-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app).post("/notes/create-note").send({
        title: "Note to Trash",
        content: "This will be trashed",
        isPinned: true,
        isFavorite: true,
      });

      noteId = response.body.data.note._id;
    });

    it("should trash a note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/trash-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("trash");
      expect(response.body.data.note.isTrash).toBe(true);
      expect(response.body.data.note.isPinned).toBe(false);
      expect(response.body.data.note.isFavorite).toBe(false);
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).patch(`/notes/trash-note/${fakeId}`).expect(404);
    });

    it("should fail without authentication", async () => {
      vi.mocked(getSession).mockResolvedValue(null as any);

      await request(app).patch(`/notes/trash-note/${noteId}`).expect(401);
    });
  });

  describe("PATCH /notes/restore-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const createResponse = await request(app).post("/notes/create-note").send({
        title: "Note to Restore",
      });

      noteId = createResponse.body.data.note._id;

      // Trash the note first
      await request(app).patch(`/notes/trash-note/${noteId}`);
    });

    it("should restore a trashed note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/restore-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("restored");
      expect(response.body.data.note.isTrash).toBe(false);
      expect(response.body.data.note.trashedAt).toBeNull();
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).patch(`/notes/restore-note/${fakeId}`).expect(404);
    });
  });

  describe("DELETE /notes/permanent-delete/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const createResponse = await request(app).post("/notes/create-note").send({
        title: "Note to Permanently Delete",
      });

      noteId = createResponse.body.data.note._id;
    });

    it("should permanently delete a note successfully", async () => {
      const response = await request(app)
        .delete(`/notes/permanent-delete/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("permanently deleted");
      expect(response.body.data.note.isDeleted).toBe(true);
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).delete(`/notes/permanent-delete/${fakeId}`).expect(404);
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
    let categoryId: string;

    beforeEach(async () => {
      // Create a category first
      const catResponse = await request(app)
        .post("/notes/create-category")
        .send({ name: "Work" });

      categoryId = catResponse.body.data.category.id;

      // Create notes and assign category
      const note1 = await request(app)
        .post("/notes/create-note")
        .send({ title: "Work Note 1", isPinned: true });

      const note2 = await request(app)
        .post("/notes/create-note")
        .send({ title: "Work Note 2" });

      await request(app)
        .patch(`/notes/assign-note-category/${note1.body.data.note._id}`)
        .send({ category: categoryId });

      await request(app)
        .patch(`/notes/assign-note-category/${note2.body.data.note._id}`)
        .send({ category: categoryId });

      // Create a note without category
      await request(app)
        .post("/notes/create-note")
        .send({ title: "Uncategorized Note" });
    });

    it("should retrieve notes by category", async () => {
      const response = await request(app)
        .get(`/notes/get-notes-by-category/${categoryId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.notes).toHaveLength(2);
    });

    it("should sort notes with pinned first", async () => {
      const response = await request(app)
        .get(`/notes/get-notes-by-category/${categoryId}`)
        .expect(200);

      expect(response.body.data.notes[0].isPinned).toBe(true);
    });

    it("should return empty array for non-existent category", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/notes/get-notes-by-category/${fakeId}`)
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

  describe("PATCH /notes/favorite-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/notes/create-note")
        .send({ title: "Note to Favorite", isFavorite: false });

      noteId = response.body.data.note._id;
    });

    it("should favorite a note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/favorite-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("favorites");
      expect(response.body.data.note.isFavorite).toBe(true);
    });

    it("should return 404 for non-existent note", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app).patch(`/notes/favorite-note/${fakeId}`).expect(404);
    });
  });

  describe("PATCH /notes/unfavorite-note/:id", () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post("/notes/create-note")
        .send({ title: "Favorited Note" });

      noteId = response.body.data.note._id;

      // Favorite the note first
      await request(app).patch(`/notes/favorite-note/${noteId}`);
    });

    it("should unfavorite a note successfully", async () => {
      const response = await request(app)
        .patch(`/notes/unfavorite-note/${noteId}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.message).toContain("removed from favorites");
      expect(response.body.data.note.isFavorite).toBe(false);
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
        expect(response.body.data.category.id).toBeDefined();
      });

      it("should fail without category name", async () => {
        await request(app).post("/notes/create-category").send({}).expect(400);
      });

      it("should capitalize category names", async () => {
        const response = await request(app)
          .post("/notes/create-category")
          .send({ name: "work projects" })
          .expect(201);

        expect(response.body.data.category.name).toBe("Work Projects");
      });

      it("should prevent duplicate category names", async () => {
        await request(app)
          .post("/notes/create-category")
          .send({ name: "Work" });

        await request(app)
          .post("/notes/create-category")
          .send({ name: "work" })
          .expect(400);
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
        // 3 because Void is default + 2 created
        expect(response.body.data.categories.length).toBeGreaterThanOrEqual(3);
      });

      it("should include category index", async () => {
        const response = await request(app)
          .get("/notes/get-categories")
          .expect(200);

        const categories = response.body.data.categories;
        expect(categories[0]).toHaveProperty("index");
      });
    });

    describe("DELETE /notes/delete-category/:id", () => {
      let categoryId: string;

      beforeEach(async () => {
        const response = await request(app)
          .post("/notes/create-category")
          .send({ name: "To Delete" });

        categoryId = response.body.data.category.id;
      });

      it("should delete a category", async () => {
        const response = await request(app)
          .delete(`/notes/delete-category/${categoryId}`)
          .expect(200);

        expect(response.body.status).toBe("success");
        expect(response.body.message).toContain("deleted");
      });

      it("should return 404 for non-existent category", async () => {
        const fakeId = "507f1f77bcf86cd799439011";
        await request(app).delete(`/notes/delete-category/${fakeId}`).expect(404);
      });

      it("should return 400 for invalid ObjectId", async () => {
        await request(app).delete("/notes/delete-category/invalid-id").expect(400);
      });

      it("should prevent deleting Void category", async () => {
        // Get user's categories to find Void
        const catResponse = await request(app).get("/notes/get-categories");
        const voidCategory = catResponse.body.data.categories.find(
          (c: any) => c.name === "Void"
        );

        await request(app)
          .delete(`/notes/delete-category/${voidCategory.id}`)
          .expect(400);
      });
    });

    describe("PATCH /notes/assign-note-category/:noteId", () => {
      let noteId: string;
      let categoryId: string;

      beforeEach(async () => {
        const catResponse = await request(app)
          .post("/notes/create-category")
          .send({ name: "Work" });

        categoryId = catResponse.body.data.category.id;

        const noteResponse = await request(app)
          .post("/notes/create-note")
          .send({ title: "Test Note" });

        noteId = noteResponse.body.data.note._id;
      });

      it("should assign category to note", async () => {
        const response = await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: categoryId })
          .expect(200);

        expect(response.body.status).toBe("success");
        expect(response.body.data.note.category).toBe(categoryId);
      });

      it("should remove category by setting to null", async () => {
        await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: categoryId });

        const response = await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: null })
          .expect(200);

        expect(response.body.data.note.category).toBeNull();
      });

      it("should fail for non-existent category", async () => {
        const fakeId = "507f1f77bcf86cd799439011";
        await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: fakeId })
          .expect(404);
      });

      it("should fail for invalid ObjectId", async () => {
        await request(app)
          .patch(`/notes/assign-note-category/${noteId}`)
          .send({ category: "invalid-id" })
          .expect(400);
      });
    });
  });
});
