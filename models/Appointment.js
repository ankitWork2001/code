import mongoose from "mongoose";

const appointmentSchema = new mongooseSchema(
  {
    // The user for whom the appointment is
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Related request (e.g., medical for work visa)
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },
    type: {
      type: String,
      // enum: ["Embassy", "MOFA", "NAVTTC", "Medical"],
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Rescheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    notes: {
      type: String, // e.g., "Bring passport and 2 photos"
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);
