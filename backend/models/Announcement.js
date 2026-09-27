const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: {
      type: String,
      enum: ["All", "Citizen", "Volunteer", "Donor", "NGO", "Government"],
      default: "All",
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Critical"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
