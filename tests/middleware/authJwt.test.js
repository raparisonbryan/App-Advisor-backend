const authJwt = require("../../middleware/authJwt");
const jwt = require("jsonwebtoken");
const User = require("../../Models/UserModel");

jest.mock("jsonwebtoken");
jest.mock("../../Models/UserModel");

describe("AuthJWT Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
      userId: "1",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("verifyToken", () => {
    it("should call next() when valid token is provided in headers", async () => {
      const token = "valid-token";
      req.headers["authorization"] = `Bearer ${token}`;

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, { userId: "1" });
      });

      authJwt.verifyToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        expect.any(String),
        expect.any(Function)
      );
      expect(req.userId).toBe("1");
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 when no token is provided", () => {
      authJwt.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: "Aucun token fourni!" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when token is invalid", () => {
      const token = "invalid-token";
      req.headers["authorization"] = `Bearer ${token}`;

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("Invalid token"), null);
      });

      authJwt.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Accès refusé!",
        error: "Invalid token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle JWT verification errors", () => {
      const token = "valid-token";
      req.headers["authorization"] = `Bearer ${token}`;

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error("JWT verification failed"), null);
      });

      authJwt.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        message: "Accès refusé!",
        error: "JWT verification failed",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("isAdmin", () => {
    it("should call next() when user is admin", async () => {
      const mockUser = { _id: "1", Admin: true };
      User.findById.mockResolvedValue(mockUser);

      await authJwt.isAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 when user is not admin", async () => {
      const mockUser = { _id: "1", Admin: false };
      User.findById.mockResolvedValue(mockUser);

      await authJwt.isAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({ message: "Accès admin requis!" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when user not found", async () => {
      User.findById.mockResolvedValue(null);

      await authJwt.isAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé!",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      User.findById.mockRejectedValue(error);

      await authJwt.isAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: "Database error" });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("isOwnerOrAdmin", () => {
    it("should call next() when user is admin", async () => {
      const mockUser = { _id: "1", Admin: true };
      User.findById.mockResolvedValue(mockUser);
      req.params = { id: "2" };

      await authJwt.isOwnerOrAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(next).toHaveBeenCalled();
    });

    it("should call next() when user is owner (not admin)", async () => {
      const mockUser = { _id: "1", Admin: false };
      User.findById.mockResolvedValue(mockUser);
      req.params = { id: "1" };

      await authJwt.isOwnerOrAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(next).toHaveBeenCalled();
    });

    it("should return 403 when user is not admin and not owner", async () => {
      const mockUser = { _id: "1", Admin: false };
      User.findById.mockResolvedValue(mockUser);
      req.params = { id: "2" };

      await authJwt.isOwnerOrAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith({
        message: "Vous ne pouvez modifier que votre propre profil!",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when user not found", async () => {
      User.findById.mockResolvedValue(null);
      req.params = { id: "1" };

      await authJwt.isOwnerOrAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "Utilisateur non trouvé!",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      const error = new Error("Database error");
      User.findById.mockRejectedValue(error);
      req.params = { id: "1" };

      await authJwt.isOwnerOrAdmin(req, res, next);

      expect(User.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({ message: "Database error" });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
