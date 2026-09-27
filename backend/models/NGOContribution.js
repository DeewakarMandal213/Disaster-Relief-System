const mongoose = require("mongoose");

const ngoContributionSchema = new mongoose.Schema(
  {
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contributionType: {
      type: String,
      enum: ["Money", "Supplies"],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    quantity: {
      type: String,
      trim: true,
      default: "",
    },
    itemType: {
      type: String,
      enum: [
        "Food",
        "Water",
        "Medical Supplies",
        "Clothes",
        "Essential Supplies",
      ],
      default: "Food",
    },
    purpose: {
      type: String,
      enum: [
        "General Relief",
        "Food Relief",
        "Medical Relief",
        "Shelter Support",
        "Emergency Response",
      ],
      default: "General Relief",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    referenceId: {
      type: String,
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["Recorded", "Verified", "Distributed"],
      default: "Recorded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGOContribution", ngoContributionSchema);
