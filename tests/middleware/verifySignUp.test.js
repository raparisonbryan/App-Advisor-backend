const verifySignUp = require("../../middleware/verifySignUp");
const UserModel = require("../../Models/UserModel");
const {
  createMockRequest,
  createMockResponse,
  createMockNext,
} = require("../helpers/testUtils");

jest.mock("../../Models/UserModel");

describe("middleware/verifySignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateEmail", () => {
    it("should reject when email is missing", () => {
      const req = createMockRequest({ body: {} });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "L'email est requis" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject when email is invalid", () => {
      const req = createMockRequest({ body: { email: "invalid" } });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validateEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Format d'email invalide" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when email is valid", () => {
      const req = createMockRequest({ body: { email: "test@example.com" } });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validateEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("validatePassword", () => {
    it("should reject when password is missing", () => {
      const req = createMockRequest({ body: {} });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Le mot de passe est requis" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject when password length < 8", () => {
      const req = createMockRequest({ body: { password: "short" } });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validatePassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Le mot de passe doit contenir au moins 8 caractères" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next for acceptable password (>=8)", () => {
      const req = createMockRequest({ body: { password: "longenough" } });
      const res = createMockResponse();
      const next = createMockNext();

      verifySignUp.validatePassword(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("checkDuplicateUsernameOrEmail", () => {
    it("should reject when username already exists", async () => {
      const req = createMockRequest({ body: { name: "john", email: "john@example.com" } });
      const res = createMockResponse();
      const next = createMockNext();

      UserModel.findOne.mockResolvedValueOnce({ _id: "1", name: "john" });

      await verifySignUp.checkDuplicateUsernameOrEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Nom d'utilisateur déjà utilisé" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject when email already exists", async () => {
      const req = createMockRequest({ body: { name: "john", email: "john@example.com" } });
      const res = createMockResponse();
      const next = createMockNext();

      UserModel.findOne
        .mockResolvedValueOnce(null) // by name
        .mockResolvedValueOnce({ _id: "2", email: "john@example.com" });

      await verifySignUp.checkDuplicateUsernameOrEmail(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: "Adresse mail déjà utilisée" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next when no duplicates", async () => {
      const req = createMockRequest({ body: { name: "jane", email: "jane@example.com" } });
      const res = createMockResponse();
      const next = createMockNext();

      UserModel.findOne
        .mockResolvedValueOnce(null) // by name
        .mockResolvedValueOnce(null); // by email

      await verifySignUp.checkDuplicateUsernameOrEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should call next on unexpected error (non-bloquant)", async () => {
      const req = createMockRequest({ body: { name: "jane", email: "jane@example.com" } });
      const res = createMockResponse();
      const next = createMockNext();

      UserModel.findOne.mockRejectedValue(new Error("DB error"));

      await verifySignUp.checkDuplicateUsernameOrEmail(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
