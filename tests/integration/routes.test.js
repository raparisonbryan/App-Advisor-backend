const request = require("supertest");
const express = require("express");
const userRouter = require("../../Routers/userRouter");
const avisRouter = require("../../Routers/avisRouter");
const outilsRouter = require("../../Routers/outilsRouter");
const categoriesRouter = require("../../Routers/categoriesRouter");

jest.mock("../../middleware/authJwt", () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.userId = "test-user-id";
    next();
  }),
  isAdmin: jest.fn((req, res, next) => next()),
  isModeratorOrAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock("../../middleware/verifySignUp", () => ({
  validateEmail: (req, res, next) => next(),
  validatePassword: (req, res, next) => next(),
  checkDuplicateUsernameOrEmail: async (req, res, next) => next(),
}));

jest.mock("../../Models/UserModel");
jest.mock("../../Models/Avis");
jest.mock("../../Models/Outil");
jest.mock("../../Models/Categorie");

describe("Routes Integration Tests", () => {
  let app;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/user", userRouter);
    app.use("/avis", avisRouter);
    app.use("/outils", outilsRouter);
    app.use("/categories", categoriesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User Routes", () => {
    describe("POST /user/signup", () => {
      it("should create a new user successfully", async () => {
        const userData = {
          name: "Test User",
          email: "test@test.com",
          password: "password123",
        };

        const userModel = require("../../Models/UserModel");
        const mockUser = { ...userData, _id: "1", password: "hashedPassword" };

        userModel.mockImplementation(() => ({
          save: jest.fn().mockResolvedValue(mockUser),
        }));

        const response = await request(app)
          .post("/user/signup")
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe(userData.name);
        expect(response.body.email).toBe(userData.email);
      });

      it("should return 500 on validation error", async () => {
        const userData = {
          name: "Test User",
          email: "test@test.com",
          password: "password123",
        };

        const userModel = require("../../Models/UserModel");
        userModel.mockImplementation(() => ({
          save: jest.fn().mockRejectedValue(new Error("Validation failed")),
        }));

        await request(app).post("/user/signup").send(userData).expect(500);
      });
    });

    describe("POST /user/signin", () => {
      it("should authenticate user and return token", async () => {
        const loginData = {
          email: "test@test.com",
          password: "password123",
        };

        const userModel = require("../../Models/UserModel");
        const bcrypt = require("bcrypt");
        const jwt = require("jsonwebtoken");

        const mockUser = {
          _id: "1",
          email: "test@test.com",
          password: "hashedPassword",
          name: "Test User",
          Admin: false,
          save: jest.fn().mockResolvedValue(true),
        };

        userModel.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("jwt-token");

        const response = await request(app)
          .post("/user/signin")
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.message).toBe("Connexion réussie");
      });

      it("should return 404 when user not found", async () => {
        const loginData = {
          email: "nonexistent@test.com",
          password: "password123",
        };

        const userModel = require("../../Models/UserModel");
        userModel.findOne.mockResolvedValue(null);

        await request(app).post("/user/signin").send(loginData).expect(404);
      });
    });

    describe("GET /user", () => {
      it("should return all users", async () => {
        const userModel = require("../../Models/UserModel");
        const mockUsers = [
          { _id: "1", name: "User 1", email: "user1@test.com" },
          { _id: "2", name: "User 2", email: "user2@test.com" },
        ];

        userModel.find.mockResolvedValue(mockUsers);

        const response = await request(app).get("/user").expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].name).toBe("User 1");
        expect(response.body[1].name).toBe("User 2");
      });
    });
  });

  describe("Avis Routes", () => {
    describe("POST /avis", () => {
      it("should create a new review successfully", async () => {
        const avisData = {
          outilId: "1",
          note: 15,
          difficulte: 10,
          performance: 18,
          flexibilite: 12,
          commentaire: "Excellent outil",
        };

        const avisModel = require("../../Models/Avis");
        const outilModel = require("../../Models/Outil");
        const { calculerMoyennesOutil } = require("../../utils/statistiques");

        const mockAvis = {
          ...avisData,
          _id: "1",
          user: "test-user-id",
          outils: "1",
        };

        avisModel.mockImplementation(() => ({
          save: jest.fn().mockResolvedValue(mockAvis),
        }));

        outilModel.findByIdAndUpdate.mockResolvedValue({ _id: "1" });
        calculerMoyennesOutil.mockResolvedValue();

        const response = await request(app)
          .post("/avis")
          .send(avisData)
          .expect(201);

        expect(response.body).toHaveProperty("_id");
        expect(response.body.note).toBe(avisData.note);
        expect(response.body.commentaire).toBe(avisData.commentaire);
      });

      it("should return 400 when notes are out of range", async () => {
        const avisData = {
          outilId: "1",
          note: 25,
          difficulte: 10,
          performance: 18,
          flexibilite: 12,
          commentaire: "Excellent outil",
        };

        await request(app).post("/avis").send(avisData).expect(400);
      });
    });

    describe("GET /avis", () => {
      it("should return all reviews", async () => {
        const avisModel = require("../../Models/Avis");
        const mockAvis = [
          {
            _id: "1",
            note: 15,
            commentaire: "Excellent outil",
            user: { _id: "1", name: "User 1" },
            outils: { _id: "1", name: "Tool 1" },
          },
        ];

        avisModel.find.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAvis),
        });

        const response = await request(app).get("/avis").expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].note).toBe(15);
      });
    });
  });

  describe("Outils Routes", () => {
    describe("GET /outils", () => {
      it("should return all tools", async () => {
        const outilModel = require("../../Models/Outil");
        const mockOutils = [
          { _id: "1", name: "Tool 1", description: "Description 1" },
          { _id: "2", name: "Tool 2", description: "Description 2" },
        ];

        outilModel.find.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutils),
        });

        const response = await request(app).get("/outils").expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].name).toBe("Tool 1");
        expect(response.body[1].name).toBe("Tool 2");
      });
    });

    describe("GET /outils/search", () => {
      it("should search tools by query", async () => {
        const outilModel = require("../../Models/Outil");
        const mockOutils = [
          { _id: "1", name: "Test Tool 1" },
          { _id: "2", name: "Test Tool 2" },
        ];

        outilModel.find.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutils),
        });

        const response = await request(app)
          .get("/outils/search?q=test")
          .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].name).toContain("Test");
      });
    });
  });

  describe("Categories Routes", () => {
    describe("GET /categories", () => {
      it("should return all categories", async () => {
        const categorieModel = require("../../Models/Categorie");
        const mockCategories = [
          { _id: "1", name: "Category 1", description: "Description 1" },
          { _id: "2", name: "Category 2", description: "Description 2" },
        ];

        categorieModel.find.mockResolvedValue(mockCategories);

        const response = await request(app).get("/categories").expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body[0].name).toBe("Category 1");
        expect(response.body[1].name).toBe("Category 2");
      });
    });

    describe("POST /categories", () => {
      it("should create a new category successfully", async () => {
        const categorieData = {
          name: "Test Category",
          description: "Test Description",
        };

        const categorieModel = require("../../Models/Categorie");
        const mockCategorie = { ...categorieData, _id: "1" };

        categorieModel.mockImplementation(() => ({
          save: jest.fn().mockResolvedValue(mockCategorie),
        }));

        const response = await request(app)
          .post("/categories")
          .send(categorieData)
          .expect(201);

        expect(response.body).toHaveProperty("_id");
        expect(response.body.name).toBe(categorieData.name);
        expect(response.body.description).toBe(categorieData.description);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle 404 for non-existent routes", async () => {
      await request(app).get("/nonexistent").expect(404);
    });

    it("should handle malformed JSON", async () => {
      await request(app)
        .post("/user/signup")
        .set("Content-Type", "application/json")
        .send("invalid json")
        .expect(400);
    });
  });
});
