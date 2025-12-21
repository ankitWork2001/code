import mongoose from "mongoose";


const subServiceSchema = new mongoose.Schema({
  // Name of the sub-service, e.g., "USA" or "UK"
  name: {
    type: String,
    required: [true, "Sub-Service name is required"],
    trim: true,
  },
  // Sub-Service-specific dynamic form fields
  formFields: {
    type: [
      {
        label: { type: String, required: true }, // shown on UI
        name: { type: String, required: true }, // key in formData
        type: {
          type: String,
          enum: ["text", "number", "date", "select", "file", "phone", "dropdown"],
          required: true,
        },
        required: { type: Boolean, default: false },
        options: { type: [String], default: [] }, // for select only
      },
    ],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      unique: true,
      trim: true,
    },
    imageURL: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
    },

    subServices: {
      type: [subServiceSchema],
      default: [],
    },
    subServicesUIType: {
      type: String,
      enum: ["card", "dropdown"],
      default: "card",
    },
    // List of document names the user needs to upload
    requiredDocuments: {
      type: [String],
      default: [],
    },
    estimatedProcessingDays: {
      type: Number,
      default: 0,
    },
    // add air ticket company name
    airlines: {
      type: [String],
      default: [], // eg: ["Delta", "American Airlines"]
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
