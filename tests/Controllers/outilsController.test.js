const outilModel = require("../../Models/Outil");
const avisModel = require("../../Models/Avis");
const categorieModel = require("../../Models/Categorie");
const {
  createTestOutilData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
} = require("../helpers/testUtils");

jest.mock("../../Models/Outil");
jest.mock("../../Models/Avis");
jest.mock("../../Models/Categorie");
jest.mock("../../utils/cleanup", () => ({ cleanupOrphanedAvis: jest.fn() }));

// Mock mongoose startSession - this needs to be before requiring the controller
const mockStartSession = jest.fn();
jest.mock("mongoose", () => ({
  startSession: mockStartSession,
}));

// Re-require the controller after mocking mongoose
const outilsController = require("../../Controllers/outilsController");

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
        _id: "507f1f77bcf86cd799439011",
        name: "Test Tool",
        description: "Test Description",
      };
      req.params = { id: "507f1f77bcf86cd799439011" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutil),
        }),
      });

      await outilsController.getByIdOutils(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
      expect(res.send).toHaveBeenCalledWith(mockOutil);
    });

    it("should return 404 when tool not found", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await outilsController.getByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Outil not found" });
    });

    it("should return 400 for invalid ObjectId format", async () => {
      req.params = { id: "invalid-id" };

      await outilsController.getByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should return 400 for missing ID parameter", async () => {
      req.params = {};

      await outilsController.getByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
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

  describe("searchOutils", () => {
    it("should search tools by query successfully", async () => {
      const mockOutils = [
        { _id: "1", name: "Test Tool 1", description: "Test Description 1" },
        { _id: "2", name: "Test Tool 2", description: "Test Description 2" },
      ];
      req.query = { q: "test" };

      outilModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockOutils),
        }),
      });

      await outilsController.searchOutils(req, res);

      expect(outilModel.find).toHaveBeenCalledWith({
        $or: [{ name: /test/i }, { description: /test/i }],
      });
      expect(res.send).toHaveBeenCalledWith(mockOutils);
    });

    it("should return 400 when query parameter is missing", async () => {
      req.query = {};

      await outilsController.searchOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Query parameter 'q' is required",
      });
    });

    it("should return 400 when query parameter is empty", async () => {
      req.query = { q: "" };

      await outilsController.searchOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Query parameter 'q' is required",
      });
    });

    it("should handle database errors", async () => {
      req.query = { q: "test" };
      const error = new Error("Database connection failed");

      outilModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await outilsController.searchOutils(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("getOutilCategories", () => {
    it("should return tool categories successfully", async () => {
      const mockOutil = {
        _id: "507f1f77bcf86cd799439011",
        name: "Test Tool",
        categories: [
          { _id: "cat1", name: "Category 1" },
          { _id: "cat2", name: "Category 2" },
        ],
      };
      req.params = { id: "507f1f77bcf86cd799439011" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockOutil),
      });

      await outilsController.getOutilCategories(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
      expect(res.send).toHaveBeenCalledWith(mockOutil.categories);
    });

    it("should return 404 when tool not found", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await outilsController.getOutilCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Outil non trouvé" });
    });

    it("should return 400 for invalid ObjectId format", async () => {
      req.params = { id: "invalid-id" };

      await outilsController.getOutilCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      const error = new Error("Database error");

      outilModel.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await outilsController.getOutilCategories(req, res);

      expectErrorResponse(res, 500, "Database error");
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
      req.params = { id: "507f1f77bcf86cd799439011" };
      req.body = { name: "Updated Tool Name" };

      const mockOldOutil = {
        _id: "507f1f77bcf86cd799439011",
        name: "Old Name",
        categories: [],
      };
      const mockUpdatedOutil = {
        _id: "507f1f77bcf86cd799439011",
        name: "Updated Tool Name",
      };

      outilModel.findById.mockResolvedValue(mockOldOutil);
      outilModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUpdatedOutil),
      });

      await outilsController.updateOutilsById(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        { name: "Updated Tool Name" },
        { new: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockUpdatedOutil);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      req.params = { id: "invalid-id" };
      req.body = { name: "Updated Name" };

      await outilsController.updateOutilsById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should return 404 when tool not found", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      req.body = { name: "Updated Name" };

      outilModel.findById.mockResolvedValue(null);

      await outilsController.updateOutilsById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Outil not found" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      req.body = { name: "Updated Name" };
      const error = new Error("Update failed");

      outilModel.findById.mockResolvedValue({
        _id: "507f1f77bcf86cd799439011",
        categories: [],
      });
      outilModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockRejectedValue(error),
      });

      await outilsController.updateOutilsById(req, res);

      expectErrorResponse(res, 500, "Update failed");
    });
  });

  describe("deleteByIdOutils", () => {
    it("should delete tool successfully", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };

      const mockOutil = {
        _id: "507f1f77bcf86cd799439011",
        name: "Test Tool",
        categories: [],
      };
      const mockResult = { _id: "507f1f77bcf86cd799439011", deleted: true };

      outilModel.findById.mockResolvedValue(mockOutil);
      outilModel.findByIdAndDelete.mockResolvedValue(mockResult);

      // Mock des modèles utilisés dans la suppression
      avisModel.deleteMany.mockResolvedValue({ deletedCount: 0 });
      categorieModel.updateMany.mockResolvedValue({ modifiedCount: 0 });

      await outilsController.deleteByIdOutils(req, res);

      expect(outilModel.findById).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
      expect(outilModel.findByIdAndDelete).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011"
      );
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("should return 400 for invalid ObjectId format", async () => {
      req.params = { id: "invalid-id" };

      await outilsController.deleteByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should return 404 when tool not found", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };

      outilModel.findById.mockResolvedValue(null);

      await outilsController.deleteByIdOutils(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Outil non trouvé" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      const error = new Error("Delete failed");

      outilModel.findById.mockRejectedValue(error);

      await outilsController.deleteByIdOutils(req, res);

      expectErrorResponse(res, 500, "Delete failed");
    });
  });
});

describe("OutilsController extended", () => {
  let req, res;
  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("postManyOutils", () => {
    it("should create multiple tools and update categories", async () => {
      req.body = [
        { name: "t1", categories: ["c1", "c2"] },
        { name: "t2", categories: [] },
      ];

      const saved1 = { _id: "o1" };
      const saved2 = { _id: "o2" };
      const saveMock1 = jest.fn().mockResolvedValue(saved1);
      const saveMock2 = jest.fn().mockResolvedValue(saved2);
      let call = 0;
      outilModel.mockImplementation(() => ({
        save: ++call === 1 ? saveMock1 : saveMock2,
      }));

      categorieModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await outilsController.postManyOutils(req, res);

      expect(categorieModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ["c1", "c2"] } },
        { $push: { outils: "o1" } }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalled();
      const sent = res.send.mock.calls[0][0];
      expect(Array.isArray(sent)).toBe(true);
      expect(sent).toHaveLength(2);
    });

    it("should create single tool when body is not array", async () => {
      req.body = { name: "single", categories: ["c3"] };
      const saved = { _id: "o3", name: "single" };
      outilModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(saved),
      }));

      await outilsController.postManyOutils(req, res);

      expect(categorieModel.updateMany).toHaveBeenCalledWith(
        { _id: { $in: ["c3"] } },
        { $push: { outils: "o3" } }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(saved);
    });
  });

  describe("updateOutilCategories", () => {
    it("should update categories transactionally", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      req.body = { categories: ["nc1", "nc2"] };

      // mock session
      const session = {
        startTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mockStartSession.mockResolvedValue(session);

      const outil = {
        _id: "507f1f77bcf86cd799439011",
        categories: ["oc1"],
        save: jest.fn().mockResolvedValue(true),
      };
      // findById().session(session)
      const sessionFn = jest.fn().mockResolvedValue(outil);
      outilModel.findById.mockReturnValue({ session: sessionFn });

      categorieModel.updateMany.mockResolvedValue({});

      await outilsController.updateOutilCategories(req, res);

      expect(session.startTransaction).toHaveBeenCalled();
      expect(categorieModel.updateMany).toHaveBeenCalledTimes(2);
      expect(outil.save).toHaveBeenCalledWith({ session });
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
      expect(session.endSession).toHaveBeenCalled();
    });

    it("should return 400 for invalid ObjectId format", async () => {
      req.params = { id: "invalid-id" };
      req.body = { categories: ["nc1", "nc2"] };

      await outilsController.updateOutilCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Invalid ObjectId format. ID must be a 24-character hexadecimal string.",
      });
    });

    it("should handle transaction errors", async () => {
      req.params = { id: "507f1f77bcf86cd799439011" };
      req.body = { categories: ["nc1", "nc2"] };

      const session = {
        startTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      mockStartSession.mockResolvedValue(session);

      const error = new Error("Transaction failed");
      const sessionFn = jest.fn().mockRejectedValue(error);
      outilModel.findById.mockReturnValue({ session: sessionFn });

      await outilsController.updateOutilCategories(req, res);

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
      expectErrorResponse(res, 500, "Transaction failed");
    });
  });

  describe("syncAvisToOutils", () => {
    it("should add avis ids to outils", async () => {
      const avis = [
        { _id: "a1", outils: "507f1f77bcf86cd799439011" },
        { _id: "a2", outils: null },
      ];
      avisModel.find.mockResolvedValue(avis);
      outilModel.findByIdAndUpdate.mockResolvedValue({});

      await outilsController.syncAvisToOutils(req, res);

      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        { $addToSet: { avis: "a1" } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAvis: avis.length,
          errors: 0,
        })
      );
    });

    it("should skip invalid ObjectId formats", async () => {
      const avis = [
        { _id: "a1", outils: "invalid-id" },
        { _id: "a2", outils: "507f1f77bcf86cd799439011" },
      ];
      avisModel.find.mockResolvedValue(avis);
      outilModel.findByIdAndUpdate.mockResolvedValue({});

      await outilsController.syncAvisToOutils(req, res);

      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "507f1f77bcf86cd799439011",
        { $addToSet: { avis: "a2" } }
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAvis: avis.length,
          errors: 0,
        })
      );
    });

    it("should handle individual update errors", async () => {
      const avis = [{ _id: "a1", outils: "507f1f77bcf86cd799439011" }];
      avisModel.find.mockResolvedValue(avis);

      const error = new Error("Update failed");
      outilModel.findByIdAndUpdate.mockRejectedValue(error);

      await outilsController.syncAvisToOutils(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAvis: avis.length,
          errors: 1,
        })
      );
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      avisModel.find.mockRejectedValue(error);

      await outilsController.syncAvisToOutils(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("syncMoyennes", () => {
    it("should compute averages and update outils", async () => {
      outilModel.updateMany.mockResolvedValue({ modifiedCount: 3 });
      const outils = [{ _id: "o1" }, { _id: "o2" }];
      outilModel.find.mockResolvedValue(outils);
      avisModel.find
        .mockResolvedValueOnce([
          { note: 10, difficulte: 10, performance: 10, flexibilite: 10 },
        ])
        .mockResolvedValueOnce([]);
      outilModel.findByIdAndUpdate.mockResolvedValue({});

      await outilsController.syncMoyennes(req, res);

      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "o1",
        expect.objectContaining({ moyenneNote: 10, nombreAvis: 1 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ totalOutils: 2 })
      );
    });
  });

  describe("cleanupData", () => {
    it("should return deleted count from cleanup util", async () => {
      jest.resetModules();
      const mockCleanup = {
        cleanupOrphanedAvis: jest.fn().mockResolvedValue({ deletedCount: 5 }),
      };
      jest.doMock("../../utils/cleanup", () => mockCleanup);
      const ctrl = require("../../Controllers/outilsController");

      await ctrl.cleanupData(req, res);

      expect(mockCleanup.cleanupOrphanedAvis).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nettoyage terminé avec succès",
        avisOrphelinsSupprimes: 5,
      });
    });
  });
});
