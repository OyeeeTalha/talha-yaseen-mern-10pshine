import mongoose from 'mongoose';

const MONGO_URI = process.env.DB_URI;

if (!MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

