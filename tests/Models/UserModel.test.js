const UserModel = require("../../Models/UserModel");
const Avis = require("../../Models/Avis");

describe("UserModel Schema Validation", () => {
  describe("Valid User Creation", () => {
    it("should create a user with valid data", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        Admin: false,
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.name).toBe(validUser.name);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.password).toBe(validUser.password);
      expect(savedUser.Admin).toBe(validUser.Admin);
      expect(savedUser._id).toBeDefined();
    });

    it("should create a user with default Admin value", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.Admin).toBe(false);
    });
  });

  describe("Required Fields Validation", () => {
    it("should fail when name is missing", async () => {
      const invalidUser = {
        email: "test@example.com",
        password: "password123",
      };

      const user = new UserModel(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when email is missing", async () => {
      const invalidUser = {
        name: "Test User",
        password: "password123",
      };

      const user = new UserModel(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });

    it("should fail when password is missing", async () => {
      const invalidUser = {
        name: "Test User",
        email: "test@example.com",
      };

      const user = new UserModel(invalidUser);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("Optional Fields", () => {
    it("should allow optional resetPasswordToken", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        resetPasswordToken: "token123",
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.resetPasswordToken).toBe("token123");
    });

    it("should allow optional resetPasswordExpires", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        resetPasswordExpires: new Date(),
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.resetPasswordExpires).toBeInstanceOf(Date);
    });

    it("should allow optional refreshToken", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        refreshToken: "refresh123",
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.refreshToken).toBe("refresh123");
    });
  });

  describe("Schema Configuration", () => {
    it("should not include versionKey", async () => {
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      expect(savedUser.__v).toBeUndefined();
    });
  });

  describe("Pre Middleware", () => {
    it("should trigger pre findOneAndDelete middleware", async () => {
      // Create a user first
      const validUser = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const user = new UserModel(validUser);
      const savedUser = await user.save();

      // Create an avis for this user
      const avis = new Avis({
        message: "Test avis",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
        user: savedUser._id,
      });
      await avis.save();

      // Verify avis exists
      const avisBefore = await Avis.find({ user: savedUser._id });
      expect(avisBefore).toHaveLength(1);

      // Delete the user (this should trigger the middleware)
      await UserModel.findByIdAndDelete(savedUser._id);

      // Verify avis was deleted by the middleware
      const avisAfter = await Avis.find({ user: savedUser._id });
      expect(avisAfter).toHaveLength(0);
    });
  });
});
