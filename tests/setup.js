const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    await mongod.stop();
  } catch (error) {
    console.error("Error during test teardown:", error);
  }
});

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.test") });
process.env.NODE_ENV = "test";

// Increase timeout for tests
jest.setTimeout(30000);
