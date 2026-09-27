const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    donationType: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Water",
        "Medical Supplies",
        "Shelter",
        "Essential Supplies",
        "General Relief",
      ],
      default: "General Relief",
    },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["Recorded", "Verified", "Used"],
      default: "Recorded",
    },

    referenceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);