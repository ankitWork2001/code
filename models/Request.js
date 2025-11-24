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
    // dynamic form fields saved here (passport number, dates...), keep flexible
    formData: { type: mongoose.Schema.Types.Mixed, default: {} },

    // attached documents
    documents: [DocumentSchema],

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "processing",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // history of status changes & admin comments
    history: [
      {
        fromStatus: String,
        toStatus: String,
        changedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: String,
        at: { type: Date, default: Date.now },
      },
    ],

    // final files generated (ticket PDF, visa copy etc.)
    outputs: [
      {
        label: String,
        url: String,
        uploadedAt: Date,
        uploadedBy: { type: mongoose.Types.ObjectId, ref: "User" },
      },
    ],

    completedAt: Date,
    rejectedReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("Request", RequestSchema);
