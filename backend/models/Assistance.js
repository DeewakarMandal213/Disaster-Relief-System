const mongoose = require("mongoose");

const assistanceSchema = new mongoose.Schema(
  {
    // Citizen who created the request
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Volunteer who accepted the request
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

    assistanceType: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Water",
        "Medical Help",
        "Shelter",
        "Essential Supplies",
      ],
    },

    priority: {
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

    // Exact map coordinates selected by the citizen.
    // These are optional for backward compatibility with older requests.
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
        "Fulfilled",
        "Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Assistance",
  assistanceSchema
);