const mongoose = require("mongoose");
const Avis = require("../../Models/Avis");

describe("Avis Schema Validation", () => {
  describe("Valid Avis Creation", () => {
    it("should create an avis with valid data", async () => {
      const validAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();

      expect(savedAvis.message).toBe(validAvis.message);
      expect(savedAvis.note).toBe(validAvis.note);
      expect(savedAvis.difficulte).toBe(validAvis.difficulte);
      expect(savedAvis.performance).toBe(validAvis.performance);
      expect(savedAvis.flexibilite).toBe(validAvis.flexibilite);
      expect(savedAvis._id).toBeDefined();
    });
  });

  describe("Required Fields Validation", () => {
    it("should fail when message is missing", async () => {
      const invalidAvis = {
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when note is missing", async () => {
      const invalidAvis = {
        message: "Test message",
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when difficulte is missing", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when performance is missing", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when flexibilite is missing", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });
  });

  describe("Number Range Validation", () => {
    it("should accept note at minimum value (0)", async () => {
      const validAvis = {
        message: "Test message",
        note: 0,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();
      expect(savedAvis.note).toBe(0);
    });

    it("should accept note at maximum value (20)", async () => {
      const validAvis = {
        message: "Test message",
        note: 20,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();
      expect(savedAvis.note).toBe(20);
    });

    it("should fail when note is below minimum (0)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: -1,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when note is above maximum (20)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 21,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when difficulte is below minimum (0)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: -1,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when difficulte is above maximum (20)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 21,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when performance is below minimum (0)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: -1,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when performance is above maximum (20)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 21,
        flexibilite: 12,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when flexibilite is below minimum (0)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: -1,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });

    it("should fail when flexibilite is above maximum (20)", async () => {
      const invalidAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 21,
      };

      const avis = new Avis(invalidAvis);
      await expect(avis.save()).rejects.toThrow();
    });
  });

  describe("Optional Fields", () => {
    it("should allow optional outils reference", async () => {
      const validAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
        outils: new mongoose.Types.ObjectId(),
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();

      expect(savedAvis.outils).toBeDefined();
      expect(savedAvis.outils.toString()).toBe(validAvis.outils.toString());
    });

    it("should allow optional user reference", async () => {
      const validAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
        user: new mongoose.Types.ObjectId(),
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();

      expect(savedAvis.user).toBeDefined();
      expect(savedAvis.user.toString()).toBe(validAvis.user.toString());
    });
  });

  describe("Schema Configuration", () => {
    it("should not include versionKey", async () => {
      const validAvis = {
        message: "Test message",
        note: 15,
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      const avis = new Avis(validAvis);
      const savedAvis = await avis.save();

      expect(savedAvis.__v).toBeUndefined();
    });
  });
});
