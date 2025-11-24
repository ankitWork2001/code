import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["passport", "photo", "ticket", "mofa", "other"],
      default: "other",
    },
    filename: String,
    url: { type: String, required: true },
    provider: { type: String }, // "cloudinary" | "s3"
    publicId: String,
    uploadedBy: { type: mongoose.Types.ObjectId, ref: "User" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

export default DocumentSchema;
