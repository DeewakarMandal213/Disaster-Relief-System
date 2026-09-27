const mongoose = require("mongoose");

const reliefCampSchema = new mongoose.Schema(
  {
    // NGO responsible for operating this camp; null for public/system camps
    managedByNGO: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Government officer/department managing this camp; null for public/system camps
    managedByGovernment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Name of the relief camp
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Camp location
    location: {
      type: String,
      required: true,
      trim: true,
    },

    // Contact number of the camp
    contactNumber: {
      type: String,
      trim: true,
    },

    // Maximum number of people the camp can accommodate
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },

    // Current number of people staying in the camp
    occupied: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Facilities available at the camp
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],

    // Current camp status
    status: {
      type: String,
      enum: [
        "Open",
        "Limited Capacity",
        "Full",
        "Closed",
      ],
      default: "Open",
    },

    // Latitude for future map integration
    latitude: {
      type: Number,
    },

    // Longitude for future map integration
    longitude: {
      type: Number,
    },

    // Additional information
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ReliefCamp",
  reliefCampSchema
);