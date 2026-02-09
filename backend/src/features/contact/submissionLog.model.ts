import mongoose, { Schema, Document } from "mongoose";

export interface ISubmissionLog extends Document {
    ip: string;
    action: string;
    expireAt: Date;
}

const SubmissionLogSchema: Schema = new Schema({
    ip: { type: String, required: true },
    action: { type: String, required: true }, // 'contact' or 'waitlist'
    expireAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
});

// Compound index for efficient queries
SubmissionLogSchema.index({ ip: 1, action: 1 });

export default mongoose.model<ISubmissionLog>("SubmissionLog", SubmissionLogSchema);
