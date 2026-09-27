require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Assistance = require("./models/Assistance");

async function preview() {
  const records = await Assistance.find({})
    .sort({ createdAt: 1 })
    .select("_id assistanceType priority status location latitude longitude createdAt")
    .lean();

  console.log("============================================================");
  console.log("RELIEFCONNECT ASSISTANCE REQUEST CLEANUP / PREVIEW");
  console.log("============================================================");
  console.log(`Total assistance requests: ${records.length}`);

  if (!records.length) console.log("- None found.");
  else records.forEach((item, index) => console.log(
    `${index + 1}. ${item._id} | ${item.assistanceType} | ${item.priority} | ${item.status} | ${item.location || "No location"} | lat=${item.latitude ?? "none"} | lng=${item.longitude ?? "none"} | created ${item.createdAt || "unknown"}`
  ));

  console.log("\nNothing was deleted.");
  console.log("To delete selected records, run:");
  console.log("node cleanupAssistanceRequests.js --delete=id1,id2");
  console.log("============================================================");
}

async function deleteSelected(ids) {
  const cleanIds = ids.split(",").map((id) => id.trim()).filter(Boolean);
  if (!cleanIds.length) return console.log("❌ No Assistance IDs supplied.");

  const result = await Assistance.deleteMany({ _id: { $in: cleanIds } });
  console.log("============================================================");
  console.log("ASSISTANCE REQUEST CLEANUP");
  console.log("============================================================");
  console.log(`Requested IDs: ${cleanIds.length}`);
  console.log(`Deleted records: ${result.deletedCount}`);
  console.log(`Not found: ${cleanIds.length - result.deletedCount}`);
  console.log("============================================================");
}

async function main() {
  try {
    await connectDB();
    const arg = process.argv.find((a) => a.startsWith("--delete="));
    if (arg) await deleteSelected(arg.substring("--delete=".length));
    else await preview();
  } catch (error) {
    console.error("❌ Assistance cleanup failed");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}
main();
