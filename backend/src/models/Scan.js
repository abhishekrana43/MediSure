import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      index: true,
    },

    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },

    result: {
      type: String,
      enum: ["GENUINE", "SUSPICIOUS", "COUNTERFEIT"],
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    reason: {
      type: String,
      required: true,
    },

    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deviceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Scan = mongoose.model("Scan", scanSchema);

export default Scan;