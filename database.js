const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let usersCollection;

async function connectToDB() {
    try {
        await mongoClient.connect();
        db = mongoClient.db("Smelly-Assistant");
        usersCollection = db.collection("users");
        console.log("Connected to MongoDB");
    }
    catch(error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

function getUsersCollection() {
    return usersCollection;
}


module.exports = { connectToDB, getUsersCollection };