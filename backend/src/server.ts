import "dotenv/config"
import mongoose from "mongoose";
import app from "./app"
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 4000

const startServer = async () => {
  await connectDB();           
  app.listen(PORT, () => {
  const host = process.env.HOST || 'localhost';
  const protocol = process.env.PROTOCOL || 'http';
  console.log(`🚀 Server running at ${protocol}://${host}:${PORT}`);
})
};

startServer();

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});