const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // NGO responsible for handling/coordinating this request
    handledByNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Government officer currently responsible for direct intervention
    handledByGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedVolunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    emergencyType: {
      type: String,
      required: true,
      enum: [
        "Flood",
        "Fire",
        "Building Damage",
        "Other Emergency",
      ],
    },

    severity: {
      type: String,
      required: true,
      enum: [
        "Low",
        "Medium",
        "High",
        "Critical",
      ],
      default: "Medium",
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * Exact map coordinates selected by the citizen.
     */
    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    contactNumber: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Acknowledged",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Emergency", emergencySchema);