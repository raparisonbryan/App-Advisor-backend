const userController = require("../../Controllers/userController");
const userModel = require("../../Models/UserModel");
const avisModel = require("../../Models/Avis");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  createTestUserData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
} = require("../helpers/testUtils");

jest.mock("../../Models/UserModel");
jest.mock("../../Models/Avis");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("UserController", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("getManyUser", () => {
    it("should return all users successfully", async () => {
      const mockUsers = [
        { _id: "1", name: "User 1", email: "user1@test.com" },
        { _id: "2", name: "User 2", email: "user2@test.com" },
      ];

      userModel.find.mockResolvedValue(mockUsers);

      await userController.getManyUser(req, res);

      expect(userModel.find).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockUsers);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      userModel.find.mockRejectedValue(error);

      await userController.getManyUser(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("getByIdUser", () => {
    it("should return user by ID successfully", async () => {
      const mockUser = { _id: "1", name: "Test User", email: "test@test.com" };
      req.params = { id: "1" };

      userModel.findById.mockResolvedValue(mockUser);

      await userController.getByIdUser(req, res);

      expect(userModel.findById).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 when user not found", async () => {
      req.params = { id: "999" };
      userModel.findById.mockResolvedValue(null);

      await userController.getByIdUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Utilisateur introuvable");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Invalid ObjectId");
      userModel.findById.mockRejectedValue(error);

      await userController.getByIdUser(req, res);

      expectErrorResponse(
        res,
        500,
        "Une erreur est survenue lors de la récupération de l'utilisateur"
      );
    });
  });

  describe("getBymailUser", () => {
    it("should return user by email successfully", async () => {
      const mockUser = { _id: "1", name: "Test User", email: "test@test.com" };
      req.params = { email: "test@test.com" };

      userModel.findOne.mockResolvedValue(mockUser);

      await userController.getBymailUser(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: "test@test.com",
      });
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("postUser", () => {
    it("should create user successfully", async () => {
      const userData = createTestUserData();
      req.body = userData;

      const mockSavedUser = { ...userData, _id: "1" };
      userModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedUser),
      }));

      await userController.postUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockSavedUser);
    });

    it("should handle validation errors", async () => {
      req.body = createTestUserData();
      const error = new Error("Validation failed");
      userModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await userController.postUser(req, res);

      expectErrorResponse(res, 500, "Validation failed");
    });
  });

  describe("putManyUser", () => {
    it("should update multiple users successfully", async () => {
      req.body = {
        ids: ["1", "2"],
        input: { Admin: true },
      };

      const mockResult = { modifiedCount: 2 };
      userModel.updateMany.mockResolvedValue(mockResult);

      await userController.putManyUser(req, res);

      expect(userModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ["1", "2"] } },
        { Admin: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("putUserById", () => {
    it("should update user by ID successfully", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Name" };

      const mockUpdatedUser = { _id: "1", name: "Updated Name" };
      userModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

      await userController.putUserById(req, res);

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "Updated Name" },
        { new: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });

  describe("deleteManyUser", () => {
    it("should delete multiple users successfully", async () => {
      req.body = { Admin: false };

      const mockResult = { deletedCount: 3 };
      userModel.deleteMany.mockResolvedValue(mockResult);

      await userController.deleteManyUser(req, res);

      expect(userModel.deleteMany).toHaveBeenCalledWith({ Admin: false });
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });
  });

  describe("deleteByIdUser", () => {
    it("should delete user and associated reviews successfully", async () => {
      req.params = { id: "1" };

      avisModel.deleteMany.mockResolvedValue({ deletedCount: 2 });
      userModel.findByIdAndDelete.mockResolvedValue({
        _id: "1",
        name: "Test User",
      });

      await userController.deleteByIdUser(req, res);

      expect(avisModel.deleteMany).toHaveBeenCalledWith({ user: "1" });
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Utilisateur et ses avis supprimés avec succès",
      });
    });

    it("should return 404 when user not found", async () => {
      req.params = { id: "999" };

      avisModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
      userModel.findByIdAndDelete.mockResolvedValue(null);

      await userController.deleteByIdUser(req, res);

      expectErrorResponse(res, 404, "Utilisateur non trouvé");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      avisModel.deleteMany.mockRejectedValue(error);

      await userController.deleteByIdUser(req, res);

      expectErrorResponse(res, 500, "Database error");
    });
  });

  describe("signup", () => {
    it("should create user with hashed password successfully", async () => {
      const userData = createTestUserData();
      req.body = userData;

      const hashedPassword = "hashedPassword123";
      const mockSavedUser = { ...userData, password: hashedPassword, _id: "1" };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      userModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedUser),
      }));

      await userController.signup(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockSavedUser);
    });

    it("should handle signup errors", async () => {
      req.body = createTestUserData();
      const error = new Error("Email already exists");

      bcrypt.hash.mockResolvedValue("hashedPassword");
      userModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await userController.signup(req, res);

      expectErrorResponse(res, 500, "Erreur lors de l'inscription");
    });
  });

  describe("signin", () => {
    it("should authenticate user and return token successfully", async () => {
      const userData = createTestUserData();
      req.body = { email: userData.email, password: userData.password };

      const mockUser = {
        _id: "1",
        email: userData.email,
        password: "hashedPassword",
        name: userData.name,
        Admin: false,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockToken = "jwt-token";

      userModel.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue(mockToken);

      await userController.signin(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        userData.password,
        "hashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "1" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        mockToken,
        expect.any(Object)
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(String),
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          _id: "1",
          name: userData.name,
          email: userData.email,
          Admin: false,
        },
        token: mockToken,
        message: "Connexion réussie",
      });
    });

    it("should return 404 when user not found", async () => {
      req.body = { email: "nonexistent@test.com", password: "password123" };

      userModel.findOne.mockResolvedValue(null);

      await userController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: "Utilisateur introuvable" });
    });

    it("should return 400 when password is incorrect", async () => {
      const userData = createTestUserData();
      req.body = { email: userData.email, password: "wrongpassword" };

      const mockUser = {
        _id: "1",
        email: userData.email,
        password: "hashedPassword",
        save: jest.fn().mockResolvedValue(true),
      };

      userModel.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await userController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Mot de passe incorrect" });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const mockRefreshToken = "refresh-token-123";
      const mockUser = {
        _id: "1",
        refreshToken: mockRefreshToken,
        save: jest.fn().mockResolvedValue(true),
      };

      req.cookies = { refreshToken: mockRefreshToken };
      req.body = {};

      const mockNewToken = "new-jwt-token";
      jwt.sign.mockReturnValue(mockNewToken);

      userModel.findOne.mockResolvedValue(mockUser);

      await userController.refreshToken(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({
        refreshToken: mockRefreshToken,
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "1" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        mockNewToken,
        expect.any(Object)
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(String),
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: mockNewToken });
    });

    it("should return 401 when refresh token is missing", async () => {
      req.cookies = {};
      req.body = {};

      await userController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ msg: "Refresh token manquant" });
    });

    it("should return 403 when refresh token is invalid", async () => {
      req.cookies = { refreshToken: "invalid-token" };
      req.body = {};

      userModel.findOne.mockResolvedValue(null);

      await userController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: "Refresh token invalide" });
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      const mockRefreshToken = "refresh-token-123";
      const mockUser = {
        _id: "1",
        refreshToken: mockRefreshToken,
        save: jest.fn().mockResolvedValue(true),
      };

      req.cookies = { refreshToken: mockRefreshToken };
      req.body = {};

      userModel.findOne.mockResolvedValue(mockUser);

      await userController.logout(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({
        refreshToken: mockRefreshToken,
      });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        path: "/user/refresh-token",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "Déconnecté." });
    });

    it("should logout even when refresh token is missing", async () => {
      req.cookies = {};
      req.body = {};

      await userController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
        path: "/user/refresh-token",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ msg: "Déconnecté." });
    });
  });

  describe("getCurrentUser", () => {
    it("should return current user successfully", async () => {
      req.userId = "1";

      const mockUser = {
        _id: "1",
        name: "Test User",
        email: "test@test.com",
        Admin: false,
      };

      userModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await userController.getCurrentUser(req, res);

      expect(userModel.findById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        _id: "1",
        name: "Test User",
        email: "test@test.com",
        Admin: false,
      });
    });

    it("should handle database errors", async () => {
      req.userId = "1";
      const error = new Error("User not found");

      userModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(error),
      });

      await userController.getCurrentUser(req, res);

      expectErrorResponse(res, 500, "User not found");
    });
  });
});
