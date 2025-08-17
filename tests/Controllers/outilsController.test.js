const outilsController = require("../../Controllers/outilsController");
const outilModel = require("../../Models/Outil");
const avisModel = require("../../Models/Avis");
const categorieModel = require("../../Models/Categorie");
const {
  createTestOutilData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
  expectSuccessResponse,
} = require("../helpers/testUtils");

// Mock des modèles
jest.mock("../../Models/Outil");
jest.mock("../../Models/Avis");
jest.mock("../../Models/Categorie");

describe("OutilsController", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("getManyOutils", () => {
    it("should return all tools successfully", async () => {
      const mockOutils = [
        { _id: "1", name: "Tool 1", description: "Description 1" },
        { _id: "2", name: "Tool 2", description: "Description 2" },
      ];

      outilModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutils),
        }),
      });

      await outilsController.getManyOutils(req, res);

      expect(outilModel.find).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockOutils);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      outilModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await outilsController.getManyOutils(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("getByIdOutils", () => {
    it("should return tool by ID successfully", async () => {
      const mockOutil = {
        _id: "1",
        name: "Test Tool",
        description: "Test Description",
      };
      req.params = { id: "1" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutil),
        }),
      });

      await outilsController.getByIdOutils(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockOutil);
    });

    it("should return null when tool not found", async () => {
      req.params = { id: "999" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await outilsController.getByIdOutils(req, res);

      expect(res.send).toHaveBeenCalledWith(null);
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Invalid ObjectId");

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await outilsController.getByIdOutils(req, res);

      expectErrorResponse(res, 500, "Invalid ObjectId");
    });
  });

  describe("postOutils", () => {
    it("should create tool successfully", async () => {
      const outilData = createTestOutilData();
      req.body = outilData;

      const mockSavedOutil = { ...outilData, _id: "1" };
      outilModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedOutil),
      }));

      await outilsController.postOutils(req, res);

      expect(outilModel).toHaveBeenCalledWith(outilData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockSavedOutil);
    });

    it("should handle validation errors", async () => {
      req.body = createTestOutilData();
      const error = new Error("Validation failed");
      outilModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await outilsController.postOutils(req, res);

      expectErrorResponse(res, 500, "Validation failed");
    });
  });

  describe("updateOutilsById", () => {
    it("should update tool successfully", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Tool Name" };

      const mockOldOutil = { _id: "1", name: "Old Name", categories: [] };
      const mockUpdatedOutil = { _id: "1", name: "Updated Tool Name" };

      outilModel.findById.mockResolvedValue(mockOldOutil);
      outilModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedOutil),
      });

      await outilsController.updateOutilsById(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith("1");
      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { name: "Updated Tool Name" },
        { new: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockUpdatedOutil);
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Name" };
      const error = new Error("Update failed");

      outilModel.findById.mockResolvedValue({ _id: "1", categories: [] });
      outilModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await outilsController.updateOutilsById(req, res);

      expectErrorResponse(res, 500, "Update failed");
    });
  });

  describe("deleteByIdOutils", () => {
    it("should delete tool successfully", async () => {
      req.params = { id: "1" };

      const mockOutil = { _id: "1", name: "Test Tool", categories: [] };
      const mockResult = { _id: "1", deleted: true };

      outilModel.findById.mockResolvedValue(mockOutil);
      outilModel.findByIdAndDelete.mockResolvedValue(mockResult);

      // Mock des modèles utilisés dans la suppression
      avisModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
      categorieModel.updateMany.mockResolvedValue({ modifiedCount: 0 });

      await outilsController.deleteByIdOutils(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith("1");
      expect(outilModel.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("should return 404 when tool not found", async () => {
      req.params = { id: "1" };

      outilModel.findById.mockResolvedValue(null);

      await outilsController.deleteByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Outil non trouvé" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Delete failed");

      outilModel.findById.mockRejectedValue(error);

      await outilsController.deleteByIdOutils(req, res);

      expectErrorResponse(res, 500, "Delete failed");
    });
  });
});
