import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  passportNumber: { type: String }
});

const airBookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fromCity: { type: String, required: true, trim: true },
    toCity: { type: String, required: true, trim: true },
    departureDate: { type: String, required: true },
 returnDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return this.travelType !== "RoundTrip" || value;
        },
        message: "Return date is required for round-trip bookings"
      }
    },
    travelType: {
      type: String,
      enum: ["OneWay", "RoundTrip"],
      default: "OneWay"
    },
    travelClass: { type: String, enum: ["Economy", "Premium Economy", "Business", "First"], default: "Economy" },
    status: { type: String, enum: ["Pending", "Booked", "Cancelled", "Completed"], default: "Pending" },
    passengers: {
      Adult: { type: [passengerSchema], default: [] },
      Child: { type: [passengerSchema], default: [] },
      Infant: { type: [passengerSchema], default: [] }
    }
  },
  { timestamps: true }
);

export default mongoose.model("AirBooking", airBookingSchema);
