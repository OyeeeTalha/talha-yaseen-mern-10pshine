import mongoose from "mongoose";
import { beforeAll, afterAll, afterEach } from "vitest";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// 1. GLOBAL SETUP: Connect to the Test Database
// Runs once before any test in your entire suite starts.
beforeAll(async () => {
  // Use the DB_URI from .env (your online MongoDB)
  const DB_URI = process.env.DB_URI;

  if (!DB_URI) {
    throw new Error("DB_URI is not defined in .env file");
  }

  try {
    console.log(`🔌 Attempting to connect to Database...`);
    await mongoose.connect(DB_URI);
    console.log("✅ Connected to Database");
  } catch (error: any) {
    console.error("❌ Error connecting to Database:", error.message);
    throw new Error("Failed to connect to database");
  }
}, 30000);

// 2. GLOBAL TEARDOWN: Clean up after EACH test
// Runs after every single test in your project.
afterEach(async () => {
  try {
    // Get all collections in the database
    const collections = mongoose.connection.collections;

    // Loop through them and delete all documents
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error: any) {
    console.error("⚠️  Error cleaning up after test:", error.message);
  }
});

// 3. GLOBAL FINISH: Close Connection
// Runs once after all tests are done.
afterAll(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("� Disconnecting from Database");
    }
  } catch (error: any) {
    console.error("⚠️  Error during cleanup:", error.message);
  }

  try {
    await mongoose.connection.close();
    console.log("✅ Disconnected from Database");
  } catch (error: any) {
    console.error("⚠️  Error closing connection:", error.message);
  }
}, 30000);
