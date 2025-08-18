const mongoose = require("mongoose");
const Categorie = require("../../Models/Categorie");

describe("Categorie Schema Validation", () => {
  describe("Valid Categorie Creation", () => {
    it("should create a categorie with valid data", async () => {
      const validCategorie = {
        name: "Test Category",
        imageURL: "https://example.com/category.jpg",
      };

      const categorie = new Categorie(validCategorie);
      const savedCategorie = await categorie.save();

      expect(savedCategorie.name).toBe(validCategorie.name);
      expect(savedCategorie.imageURL).toBe(validCategorie.imageURL);
      expect(savedCategorie._id).toBeDefined();
    });
  });

  describe("Required Fields Validation", () => {
    it("should fail when name is missing", async () => {
      const invalidCategorie = {
        imageURL: "https://example.com/category.jpg",
      };

      const categorie = new Categorie(invalidCategorie);
      await expect(categorie.save()).rejects.toThrow();
    });

    it("should fail when imageURL is missing", async () => {
      const invalidCategorie = {
        name: "Test Category",
      };

      const categorie = new Categorie(invalidCategorie);
      await expect(categorie.save()).rejects.toThrow();
    });
  });

  describe("Optional Fields", () => {
    it("should allow optional outils array", async () => {
      const validCategorie = {
        name: "Test Category",
        imageURL: "https://example.com/category.jpg",
        outils: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      };

      const categorie = new Categorie(validCategorie);
      const savedCategorie = await categorie.save();

      expect(savedCategorie.outils).toHaveLength(2);
      expect(savedCategorie.outils[0]).toBeDefined();
      expect(savedCategorie.outils[1]).toBeDefined();
    });

    it("should allow empty outils array", async () => {
      const validCategorie = {
        name: "Test Category",
        imageURL: "https://example.com/category.jpg",
        outils: [],
      };

      const categorie = new Categorie(validCategorie);
      const savedCategorie = await categorie.save();

      expect(savedCategorie.outils).toHaveLength(0);
    });

    it("should initialize empty outils array when not provided", async () => {
      const validCategorie = {
        name: "Test Category",
        imageURL: "https://example.com/category.jpg",
      };

      const categorie = new Categorie(validCategorie);
      const savedCategorie = await categorie.save();

      expect(savedCategorie.outils).toBeDefined();
      expect(Array.isArray(savedCategorie.outils)).toBe(true);
    });
  });

  describe("Schema Configuration", () => {
    it("should not include versionKey", async () => {
      const validCategorie = {
        name: "Test Category",
        imageURL: "https://example.com/category.jpg",
      };

      const categorie = new Categorie(validCategorie);
      const savedCategorie = await categorie.save();

      expect(savedCategorie.__v).toBeUndefined();
    });
  });
});
