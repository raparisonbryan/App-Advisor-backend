const mongoose = require("mongoose");
const Outil = require("../../Models/Outil");

describe("Outil Schema Validation", () => {
  describe("Valid Outil Creation", () => {
    it("should create an outil with valid data", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.name).toBe(validOutil.name);
      expect(savedOutil.description).toBe(validOutil.description);
      expect(savedOutil.imageURL).toBe(validOutil.imageURL);
      expect(savedOutil._id).toBeDefined();
    });

    it("should create an outil with default values", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.moyenneNote).toBe(0);
      expect(savedOutil.moyenneDifficulte).toBe(0);
      expect(savedOutil.moyennePerformance).toBe(0);
      expect(savedOutil.moyenneFlexibilite).toBe(0);
      expect(savedOutil.nombreAvis).toBe(0);
    });
  });

  describe("Required Fields Validation", () => {
    it("should fail when name is missing", async () => {
      const invalidOutil = {
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
      };

      const outil = new Outil(invalidOutil);
      await expect(outil.save()).rejects.toThrow();
    });

    it("should fail when description is missing", async () => {
      const invalidOutil = {
        name: "Test Outil",
        imageURL: "https://example.com/image.jpg",
      };

      const outil = new Outil(invalidOutil);
      await expect(outil.save()).rejects.toThrow();
    });

    it("should fail when imageURL is missing", async () => {
      const invalidOutil = {
        name: "Test Outil",
        description: "Test description",
      };

      const outil = new Outil(invalidOutil);
      await expect(outil.save()).rejects.toThrow();
    });
  });

  describe("Optional Fields", () => {
    it("should allow optional avis array", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        avis: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.avis).toHaveLength(2);
      expect(savedOutil.avis[0]).toBeDefined();
      expect(savedOutil.avis[1]).toBeDefined();
    });

    it("should allow optional categories array", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        categories: [
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
        ],
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.categories).toHaveLength(2);
      expect(savedOutil.categories[0]).toBeDefined();
      expect(savedOutil.categories[1]).toBeDefined();
    });

    it("should allow custom moyenneNote value", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        moyenneNote: 15.5,
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.moyenneNote).toBe(15.5);
    });

    it("should allow custom moyenneDifficulte value", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        moyenneDifficulte: 8.5,
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.moyenneDifficulte).toBe(8.5);
    });

    it("should allow custom moyennePerformance value", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        moyennePerformance: 16.2,
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.moyennePerformance).toBe(16.2);
    });

    it("should allow custom moyenneFlexibilite value", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        moyenneFlexibilite: 12.8,
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.moyenneFlexibilite).toBe(12.8);
    });

    it("should allow custom nombreAvis value", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
        nombreAvis: 25,
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.nombreAvis).toBe(25);
    });
  });

  describe("Schema Configuration", () => {
    it("should not include versionKey", async () => {
      const validOutil = {
        name: "Test Outil",
        description: "Test description",
        imageURL: "https://example.com/image.jpg",
      };

      const outil = new Outil(validOutil);
      const savedOutil = await outil.save();

      expect(savedOutil.__v).toBeUndefined();
    });
  });
});
