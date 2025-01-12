require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.mongodb_uri);


//const { MongoClient } = require("mongodb");

// Replace the following with your Atlas connection string
//const url = "mongodb+srv://<username>:<password>@clustername.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
//const client = new MongoClient(url);

// The database to use
const dbName = "flibusta";

async function run() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);

    //console.log(await db.listCollections().toArray());

    // Use the collection "people"
    const col = db.collection("Books");

    console.log(await col.countDocuments())

    // Find one document
    const myDoc = await col.findOne();
    // Print to the console
    console.log(myDoc);

  } catch (err) {
    console.log(err.stack);
  }

  finally {
    await client.close();
  }
}

run().catch(console.dir);
