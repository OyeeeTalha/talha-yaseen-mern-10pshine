import mongoose, { Schema, Document } from "mongoose";

export interface IContact extends Document {
    email: string;
    subject: string;
    message: string;
    createdAt: Date;
}

const ContactSchema: Schema = new Schema({
    email: { type: String, required: true },
    subject: { type: String, default: "No Subject" },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IContact>("Contact", ContactSchema);
