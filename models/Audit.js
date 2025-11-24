import mongoose, { Schema, Types, model } from "mongoose";

const AuditLogSchema = new Schema({
  actor: { type: Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  targetType: String,
  targetId: Types.ObjectId,
  details: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export const AuditLog = model("AuditLog", AuditLogSchema);
