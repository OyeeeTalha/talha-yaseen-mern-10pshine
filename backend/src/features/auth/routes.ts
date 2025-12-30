import { Router, Request, Response } from "express";
import mongoose from "mongoose";

import { userAuthSchema } from "./schema";
import { UserModel } from "../../models/User";

const router = Router();


// Use the User model from models/User.ts

// Route to test DB connection and add a user
router.post("/test-add-user", async (req: Request, res: Response) => {
  try {
    const parseResult = userAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Validation failed", errors: parseResult.error.issues });
    }
    const { googleId, email, name, refreshToken } = parseResult.data;
    const user = new UserModel({ googleId, email, name, refreshToken });
    await user.save();
    res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Error adding user", error: error instanceof Error ? error.message : String(error) });
  }
});

// Route to test DB connection (ping)
router.get("/test-db", async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ message: "Database connection is working!" });
    } else {
      res.status(500).json({ message: "Database connection failed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error });
  }
});

export default router;
