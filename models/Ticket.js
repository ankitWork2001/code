// models/index.js (example)
import mongoose from "mongoose";
const { Schema, model, Types } = mongoose;

const TicketSchema = new Schema(
  {
    request: { type: Types.ObjectId, ref: "Request" }, // optional link back to request
    user: { type: Types.ObjectId, ref: "User", required: true },
    pnr: { type: String, index: true },
    airline: String,
    itinerary: [{ from: String, to: String, departAt: Date, arriveAt: Date }],
    ticketPdf: { url: String, publicId: String },
    issuedAt: Date,
    issuedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("Ticket", TicketSchema);
