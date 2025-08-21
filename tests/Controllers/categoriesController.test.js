const categoriesController = require("../../Controllers/categoriesController");
const categorieModel = require("../../Models/Categorie");
const {
  createTestCategorieData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
} = require("../helpers/testUtils");

jest.mock("../../Models/Categorie");

describe("CategoriesController", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("getManyCategories", () => {
    it("should return all categories successfully", async () => {
      const mockCategories = [
        { _id: "1", name: "Category 1", description: "Description 1" },
        { _id: "2", name: "Category 2", description: "Description 2" },
      ];

      categorieModel.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCategories),
      });

      await categoriesController.getManyCategories(req, res);

      expect(categorieModel.find).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockCategories);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      categorieModel.find.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await categoriesController.getManyCategories(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("getByIdCategories", () => {
    it("should return category by ID successfully", async () => {
      const mockCategorie = {
        _id: "1",
        name: "Test Category",
        description: "Test Description",
      };
      req.params = { id: "1" };

      categorieModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCategorie),
      });

      await categoriesController.getByIdCategories(req, res);

      expect(categorieModel.findById).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockCategorie);
    });

    it("should return 404 when category not found", async () => {
      req.params = { id: "999" };
      categorieModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await categoriesController.getByIdCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Catégorie non trouvée" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Invalid ObjectId");
      categorieModel.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await categoriesController.getByIdCategories(req, res);

      expectErrorResponse(res, 500, "Invalid ObjectId");
    });
  });

  describe("postCategories", () => {
    it("should create category successfully", async () => {
      const categorieData = createTestCategorieData();
      req.body = categorieData;

      const mockSavedCategorie = { ...categorieData, _id: "1" };
      categorieModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedCategorie),
      }));

      await categoriesController.postCategories(req, res);

      expect(categorieModel).toHaveBeenCalledWith(categorieData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockSavedCategorie);
    });

    it("should handle validation errors", async () => {
      req.body = createTestCategorieData();
      const error = new Error("Validation failed");
      categorieModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await categoriesController.postCategories(req, res);

      expectErrorResponse(res, 500, "Validation failed");
    });
  });

  describe("updateCategoriesById", () => {
    it("should update category successfully", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Category Name" };

      const mockUpdatedCategorie = { _id: "1", name: "Updated Category Name" };
      categorieModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedCategorie),
      });

      await categoriesController.updateCategoriesById(req, res);

      expect(categorieModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "Updated Category Name" },
        { new: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockUpdatedCategorie);
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Name" };
      const error = new Error("Update failed");

      categorieModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await categoriesController.updateCategoriesById(req, res);

      expectErrorResponse(res, 500, "Update failed");
    });
  });

  describe("deleteByIdCategories", () => {
    it("should delete category successfully", async () => {
      req.params = { id: "1" };

      const mockResult = { _id: "1", deleted: true };
      categorieModel.findByIdAndDelete.mockResolvedValue(mockResult);

      await categoriesController.deleteByIdCategories(req, res);

      expect(categorieModel.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Delete failed");

      categorieModel.findByIdAndDelete.mockRejectedValue(error);

      await categoriesController.deleteByIdCategories(req, res);

      expectErrorResponse(res, 500, "Delete failed");
    });
  });
});
