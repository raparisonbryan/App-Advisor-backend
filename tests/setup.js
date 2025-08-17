const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongod;

// Configuration globale pour tous les tests
beforeAll(async () => {
  // Démarrer MongoDB en mémoire
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Connecter à la base de données en mémoire
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyer la base de données entre chaque test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Fermer la connexion et arrêter MongoDB après tous les tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
});

// Configuration des variables d'environnement pour les tests
process.env.JWT_SECRET = "test-secret-key";
process.env.NODE_ENV = "test";
