import mongoose from "mongoose";
import DocumentSchema from "./Document.js";

const RequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    service: { type: mongoose.Types.ObjectId, ref: "Service", required: true },
    subService: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    subServiceName: { type: String, required: true },
    // dynamic form fields saved here (passport number, dates...), keep flexible
    formData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // attached documents
    documents: [DocumentSchema],

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // final files generated (ticket PDF, visa copy etc.)
    outputs: [
      {
        fileName: String,
        mimeType: String,
        url: String,
        provider: { type: String, enum: ["cloudinary", "s3"], default: "cloudinary" },
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],

    completedAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Request", RequestSchema);
