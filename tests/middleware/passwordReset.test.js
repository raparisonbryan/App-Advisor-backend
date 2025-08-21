jest.mock("nodemailer", () => ({ createTransport: jest.fn() }));
jest.mock("../../Models/UserModel");

const passwordReset = require("../../middleware/passwordReset");
const UserModel = require("../../Models/UserModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const {
  createMockRequest,
  createMockResponse,
} = require("../helpers/testUtils");

describe("middleware/passwordReset", () => {
  let req, res;
  const sendMail = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
    nodemailer.createTransport.mockReturnValue({ sendMail });
  });

  describe("forgotPassword", () => {
    it("should return 400 when email missing", async () => {
      req.body = {};
      await passwordReset.forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 when user not found", async () => {
      req.body = { email: "none@example.com" };
      UserModel.findOne.mockResolvedValue(null);
      await passwordReset.forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("should send email and return 200", async () => {
      req.body = { email: "user@example.com" };
      const user = { save: jest.fn().mockResolvedValue(true) };
      UserModel.findOne.mockResolvedValue(user);

      await passwordReset.forgotPassword(req, res);

      expect(user.save).toHaveBeenCalled();
      expect(sendMail).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("resetPassword", () => {
    it("should return 400 when password missing", async () => {
      req.params = { token: "t" };
      req.body = {};
      await passwordReset.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for invalid or expired token", async () => {
      req.params = { token: "bad" };
      req.body = { password: "newpass123" };
      UserModel.findOne.mockResolvedValue(null);
      await passwordReset.resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should reject if new password equals old", async () => {
      req.params = { token: "ok" };
      req.body = { password: "samepass" };
      const user = { password: "hashed", save: jest.fn() };
      UserModel.findOne.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true); // same password

      await passwordReset.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should hash and save new password", async () => {
      req.params = { token: "ok" };
      req.body = { password: "newpass123" };
      const user = {
        password: "hashed",
        save: jest.fn().mockResolvedValue(true),
      };
      UserModel.findOne.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      bcrypt.hash = jest.fn().mockResolvedValue("hashedNew");

      await passwordReset.resetPassword(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith("newpass123", 10);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
