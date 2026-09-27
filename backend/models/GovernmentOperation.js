const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    resourceType: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, trim: true, default: "units" },
  },
  { _id: false }
);

const governmentOperationSchema = new mongoose.Schema(
  {
    governmentOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adminOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, required: true, trim: true },
    operationType: {
      type: String,
      enum: [
        "Direct Assistance",
        "Resource Deployment",
        "Relief Distribution",
        "Camp Allocation",
        "NGO Coordination",
        "Volunteer Deployment",
        "Emergency Escalation",
      ],
      required: true,
    },
    emergency: { type: mongoose.Schema.Types.ObjectId, ref: "Emergency", default: null },
    assistance: { type: mongoose.Schema.Types.ObjectId, ref: "Assistance", default: null },
    assignedNGO: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    assignedVolunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reliefCamp: { type: mongoose.Schema.Types.ObjectId, ref: "ReliefCamp", default: null },
    resources: [resourceSchema],
    affectedPeople: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["Planned", "In Progress", "Completed", "Cancelled"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GovernmentOperation", governmentOperationSchema);
