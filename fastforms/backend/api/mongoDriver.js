const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const uri = "uriToConnectToDatabase";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,           
    deprecationErrors: true 
  },
});


const databases = {}; // Cache for MongoDB databases

async function connectToDatabase(dbName) {
  if (!databases[dbName]) {
    try {
      await client.connect();
      databases[dbName] = client.db(dbName);
      console.log(`Connected to database: ${dbName}`);
    } catch (error) {
      console.error(`Error connecting to database ${dbName}:`, error.message);
      throw error;
    }
  }
  return databases[dbName];
}

async function getCollection(collectionName, dbName = '') {
  const db = await connectToDatabase(dbName);
  console.log(`Connected to collection: ${collectionName} in database: ${dbName}`);
  return db.collection(collectionName);
}

module.exports = {
  getCollection,
  ObjectId,
};
