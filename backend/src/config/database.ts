import mongoose from 'mongoose';
import logger from '../shared/utils/logger.js';
import { AppError } from '../shared/errors/AppError.js';

const MONGO_URI = process.env.DB_URI;

if (!MONGO_URI) {
  throw new AppError('Invalid/Missing environment variable: "DB_URI"', 500);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(error, 'MongoDB connection error');
    process.exit(1);
  }
};