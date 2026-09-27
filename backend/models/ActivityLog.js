const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
