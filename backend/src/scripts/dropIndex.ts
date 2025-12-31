import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.DB_URI;

if (!uri) {
  throw new Error("DB_URI environment variable is not set");
}

async function dropIndex() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    
    const db = client.db();
    const collection = db.collection("users");
    
    // Try to drop the problematic index
    try {
      await collection.dropIndex("id_1");
      console.log("Successfully dropped id_1 index");
    } catch (error: any) {
      if (error.code === 27) {
        console.log("Index id_1 does not exist, nothing to drop");
      } else {
        throw error;
      }
    }
    
    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await client.close();
  }
}

dropIndex();
