const { MongoClient } = require('mongodb');
// This is just a test case

const uri = "uriToConnectToDatabase";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");

    const db = client.db("DatabaseName");
    const ordersCollection = db.collection("Rule");
    const sampleDoc = await ordersCollection.findOne();

    console.log("Sample document from Rule collection:", sampleDoc);
  } catch (err) {
    console.error("Failed to connect:", err);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
