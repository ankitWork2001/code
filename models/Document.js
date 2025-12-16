import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
      filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String, // e.g., "application/pdf", "image/jpeg"
      // required: true,
    },
    url: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["cloudinary", "s3"],
      // default: "cloudinary",
    },

    publicId: {
      type: String,
      // required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
    timestamps: true, // optional: adds createdAt & updatedAt automatically
  }
);

export default DocumentSchema;
