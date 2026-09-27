require("dotenv").config();
const connectDB = require("./config/db");
const ReliefCamp = require("./models/ReliefCamp");
const Emergency = require("./models/Emergency");

// This script is intentionally safe-by-default.
// It never deletes emergencies automatically.
//
// Usage:
//   node cleanupLegacyData.js
//       -> preview legacy camps + unmapped emergencies
//
//   node cleanupLegacyData.js --delete-camps
//       -> deletes ONLY the five original seeded demo camps
//          when they have no NGO/Government owner.
//
//   node cleanupLegacyData.js --delete-emergencies id1,id2,id3
//       -> deletes ONLY the exact emergency IDs you explicitly provide.

const LEGACY_CAMP_NAMES = [
  "Chennai Central Relief Camp",
  "Anna Nagar Emergency Shelter",
  "Adyar Community Relief Camp",
  "Velachery Emergency Camp",
  "Tambaram Relief Shelter",
];

const args = process.argv.slice(2);
const deleteCamps = args.includes("--delete-camps");
const emergencyArg = args.find((arg) => arg.startsWith("--delete-emergencies="));
const emergencyIds = emergencyArg
  ? emergencyArg
      .split("=")[1]
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  : [];

const printCamp = (camp) => {
  console.log(
    `- ${camp.name} | ${camp.location} | owner NGO=${camp.managedByNGO || "none"} | owner Government=${camp.managedByGovernment || "none"}`
  );
};

const main = async () => {
  try {
    await connectDB();

    const legacyCamps = await ReliefCamp.find({
      name: { $in: LEGACY_CAMP_NAMES },
      managedByNGO: null,
      managedByGovernment: null,
    }).sort({ createdAt: 1 });

    const unmappedEmergencies = await Emergency.find({
      $or: [
        { latitude: null },
        { longitude: null },
        { latitude: { $exists: false } },
        { longitude: { $exists: false } },
      ],
    })
      .select("_id emergencyType severity location status createdAt latitude longitude")
      .sort({ createdAt: 1 });

    console.log("============================================================");
    console.log("RELIEFCONNECT LEGACY DATA CLEANUP / PREVIEW");
    console.log("============================================================");

    console.log(`\nLegacy demo camps found: ${legacyCamps.length}`);
    legacyCamps.forEach(printCamp);
    if (!legacyCamps.length) console.log("- None found.");

    console.log(`\nEmergencies without complete map coordinates: ${unmappedEmergencies.length}`);
    unmappedEmergencies.forEach((item) => {
      console.log(
        `- ${item._id} | ${item.emergencyType} | ${item.severity} | ${item.status} | ${item.location} | created ${item.createdAt.toISOString()}`
      );
    });
    if (!unmappedEmergencies.length) console.log("- None found.");

    if (deleteCamps) {
      const result = await ReliefCamp.deleteMany({
        _id: { $in: legacyCamps.map((camp) => camp._id) },
      });
      console.log(`\nDeleted legacy demo camps: ${result.deletedCount}`);
    } else {
      console.log("\nNo camps were deleted.");
      console.log("To delete only these five legacy demo camps, run:");
      console.log("node cleanupLegacyData.js --delete-camps");
    }

    if (emergencyIds.length) {
      const validIds = emergencyIds.filter((id) => /^[a-fA-F0-9]{24}$/.test(id));
      if (validIds.length !== emergencyIds.length) {
        console.log("\nSome emergency IDs were invalid and were ignored.");
      }

      const result = await Emergency.deleteMany({ _id: { $in: validIds } });
      console.log(`Deleted explicitly selected emergencies: ${result.deletedCount}`);
    } else {
      console.log("\nNo emergencies were deleted.");
      console.log("Review the IDs above, then delete only selected records with:");
      console.log("node cleanupLegacyData.js --delete-emergencies=id1,id2,id3");
    }

    console.log("============================================================");
    process.exit(0);
  } catch (error) {
    console.error("Legacy cleanup failed:", error);
    process.exit(1);
  }
};

main();
