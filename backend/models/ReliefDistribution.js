const mongoose = require("mongoose");

const reliefDistributionSchema = new mongoose.Schema(
  {
    itemType: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "units" },
    location: { type: String, trim: true, default: "" },
    recipient: { type: String, trim: true, default: "" },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: "ReliefCamp", default: null },
    operation: { type: mongoose.Schema.Types.ObjectId, ref: "GovernmentOperation", default: null },
    distributedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Distributed", "Cancelled"],
      default: "Planned",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReliefDistribution", reliefDistributionSchema);
