import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    manufacturingDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RECALLED", "EXPIRED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

const Medicine = mongoose.model("Medicine", medicineSchema);

export default Medicine;