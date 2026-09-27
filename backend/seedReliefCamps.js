const dotenv = require("dotenv");
const connectDB = require("./config/db");
const ReliefCamp = require("./models/ReliefCamp");

dotenv.config();

// Legacy demo-camp seeding is intentionally disabled.
// Relief camps are now created and managed by NGO/Government roles.
const main = async () => {
  try {
    await connectDB();
    const count = await ReliefCamp.countDocuments();
    console.log("================================================");
    console.log("RELIEF CAMP SEEDING IS DISABLED");
    console.log("================================================");
    console.log(`Current relief camps in database: ${count}`);
    console.log("Use the NGO or Government portal to create camps.");
    console.log("No records were deleted or inserted.");
    console.log("================================================");
    process.exit(0);
  } catch (error) {
    console.error("Unable to inspect relief camps:", error);
    process.exit(1);
  }
};

main();
