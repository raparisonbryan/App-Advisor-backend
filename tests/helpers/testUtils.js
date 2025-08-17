const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

/**
 * Crée un token JWT de test
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Token JWT
 */
const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

/**
 * Crée un utilisateur de test avec des données valides
 * @param {Object} overrides - Données à surcharger
 * @returns {Object} Données d'utilisateur
 */
const createTestUserData = (overrides = {}) => {
  return {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    Admin: false,
    ...overrides,
  };
};

/**
 * Crée un avis de test avec des données valides
 * @param {Object} overrides - Données à surcharger
 * @returns {Object} Données d'avis
 */
const createTestAvisData = (overrides = {}) => {
  return {
    note: 15,
    difficulte: 10,
    performance: 18,
    flexibilite: 12,
    commentaire: "Excellent outil pour le développement",
    ...overrides,
  };
};

/**
 * Crée un outil de test avec des données valides
 * @param {Object} overrides - Données à surcharger
 * @returns {Object} Données d'outil
 */
const createTestOutilData = (overrides = {}) => {
  return {
    name: "Test Tool",
    description: "Un outil de test pour les développeurs",
    imageURL: "https://example.com/image.jpg",
    ...overrides,
  };
};

/**
 * Crée une catégorie de test avec des données valides
 * @param {Object} overrides - Données à surcharger
 * @returns {Object} Données de catégorie
 */
const createTestCategorieData = (overrides = {}) => {
  return {
    name: "Test Category",
    description: "Une catégorie de test",
    ...overrides,
  };
};

/**
 * Simule une requête Express
 * @param {Object} body - Corps de la requête
 * @param {Object} params - Paramètres de route
 * @param {Object} query - Paramètres de requête
 * @param {Object} headers - En-têtes
 * @returns {Object} Objet de requête simulé
 */
const mockRequest = (body = {}, params = {}, query = {}, headers = {}) => {
  return {
    body,
    params,
    query,
    headers,
    userId: "test-user-id",
    cookies: {},
    file: null,
    files: [],
  };
};

/**
 * Simule une réponse Express
 * @returns {Object} Objet de réponse simulé
 */
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Vérifie si une réponse contient une erreur
 * @param {Object} response - Objet de réponse
 * @param {number} expectedStatus - Statut HTTP attendu
 * @param {string} expectedMessage - Message d'erreur attendu (optionnel)
 */
const expectErrorResponse = (
  response,
  expectedStatus,
  expectedMessage = null
) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);

  if (expectedMessage) {
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining(expectedMessage),
      })
    );
  }
};

/**
 * Vérifie si une réponse contient un succès
 * @param {Object} response - Objet de réponse
 * @param {number} expectedStatus - Statut HTTP attendu
 */
const expectSuccessResponse = (response, expectedStatus) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
};

// Fonctions utilitaires pour configurer les mocks
const setupMocks = () => {
  // Mock de JWT
  const jwt = require("jsonwebtoken");
  jwt.verify.mockImplementation((token, secret, callback) => {
    if (token === "valid-token") {
      callback(null, { userId: "1" });
    } else {
      callback(new Error("Invalid token"), null);
    }
  });

  jwt.sign.mockReturnValue("mock-jwt-token");

  // Mock de bcrypt
  const bcrypt = require("bcrypt");
  bcrypt.hash.mockResolvedValue("hashedPassword123");
  bcrypt.compare.mockResolvedValue(true);

  // Mock des modèles Mongoose avec des valeurs par défaut
  const UserModel = require("../../Models/UserModel");
  const AvisModel = require("../../Models/Avis");
  const OutilModel = require("../../Models/Outil");
  const CategorieModel = require("../../Models/Categorie");

  // Configuration des mocks UserModel
  UserModel.find.mockResolvedValue([]);
  UserModel.findById.mockResolvedValue(null);
  UserModel.findOne.mockResolvedValue(null);
  UserModel.create.mockResolvedValue({ _id: "1", name: "Test User" });
  UserModel.save.mockResolvedValue({ _id: "1", name: "Test User" });

  // Configuration des mocks AvisModel
  AvisModel.find.mockResolvedValue([]);
  AvisModel.findById.mockResolvedValue(null);
  AvisModel.create.mockResolvedValue({ _id: "1", note: 15 });
  AvisModel.save.mockResolvedValue({ _id: "1", note: 15 });

  // Configuration des mocks OutilModel
  OutilModel.find.mockResolvedValue([]);
  OutilModel.findById.mockResolvedValue(null);
  OutilModel.create.mockResolvedValue({ _id: "1", name: "Test Tool" });
  OutilModel.save.mockResolvedValue({ _id: "1", name: "Test Tool" });

  // Configuration des mocks CategorieModel
  CategorieModel.find.mockResolvedValue([]);
  CategorieModel.findById.mockResolvedValue(null);
  CategorieModel.create.mockResolvedValue({ _id: "1", name: "Test Category" });
  CategorieModel.save.mockResolvedValue({ _id: "1", name: "Test Category" });

  // Mock de la fonction calculerMoyennesOutil
  const { calculerMoyennesOutil } = require("../../utils/statistiques");
  if (calculerMoyennesOutil) {
    calculerMoyennesOutil.mockResolvedValue();
  }
};

// Fonction pour créer des objets de requête mockés
const createMockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    cookies: {},
    file: null,
    ...overrides,
  };
  return req;
};

// Fonction pour créer des objets de réponse mockés
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

// Fonction pour créer des objets next mockés
const createMockNext = () => jest.fn();

// Export des nouvelles fonctions
module.exports = {
  generateTestToken,
  createTestUserData,
  createTestAvisData,
  createTestOutilData,
  createTestCategorieData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
  expectSuccessResponse,
  setupMocks,
  createMockRequest,
  createMockResponse,
  createMockNext,
};
