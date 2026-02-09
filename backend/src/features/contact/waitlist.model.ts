import mongoose, { Schema, Document } from "mongoose";

export interface IWaitlist extends Document {
    email: string;
    type: string;
    createdAt: Date;
}

const WaitlistSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true },
    type: { type: String, default: "general" }, // 'general' or 'contributor_waitlist'
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWaitlist>("Waitlist", WaitlistSchema);
