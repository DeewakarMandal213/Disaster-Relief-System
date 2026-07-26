const { MongoClient } = require("mongodb");
require("dotenv").config();

async function test() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected successfully!");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  }
}

test();
