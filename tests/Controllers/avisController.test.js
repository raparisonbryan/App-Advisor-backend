const avisController = require("../../Controllers/avisController");
const avisModel = require("../../Models/Avis");
const outilModel = require("../../Models/Outil");
const { calculerMoyennesOutil } = require("../../utils/statistiques");
const {
  createTestAvisData,
  mockRequest,
  mockResponse,
  expectErrorResponse,
} = require("../helpers/testUtils");

jest.mock("../../Models/Avis");
jest.mock("../../Models/Outil");
jest.mock("../../utils/statistiques");

describe("AvisController", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  describe("getManyAvis", () => {
    it("should return all reviews successfully", async () => {
      const mockAvis = [
        {
          _id: "1",
          note: 15,
          commentaire: "Excellent outil",
          user: { _id: "1", name: "User 1" },
          outils: { _id: "1", name: "Tool 1", imageURL: "url1" },
        },
        {
          _id: "2",
          note: 18,
          commentaire: "Très bon outil",
          user: { _id: "2", name: "User 2" },
          outils: { _id: "2", name: "Tool 2", imageURL: "url2" },
        },
      ];

      avisModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAvis),
        }),
      });

      await avisController.getManyAvis(req, res);

      expect(avisModel.find).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockAvis);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      avisModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await avisController.getManyAvis(req, res);

      expectErrorResponse(res, 500, "Database connection failed");
    });
  });

  describe("getByIdAvis", () => {
    it("should return review by ID successfully", async () => {
      const mockAvis = {
        _id: "1",
        note: 15,
        commentaire: "Excellent outil",
        user: { _id: "1", name: "User 1" },
        outils: { _id: "1", name: "Tool 1", imageURL: "url1" },
      };

      req.params = { id: "1" };

      avisModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAvis),
        }),
      });

      await avisController.getByIdAvis(req, res);

      expect(avisModel.findById).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockAvis);
    });

    it("should return 404 when review not found", async () => {
      req.params = { id: "999" };

      avisModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      });

      await avisController.getByIdAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith("Avis introuvable");
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Invalid ObjectId");

      avisModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await avisController.getByIdAvis(req, res);

      expectErrorResponse(res, 500, "Invalid ObjectId");
    });
  });

  describe("getAvisByOutilId", () => {
    it("should return reviews by tool ID successfully", async () => {
      const mockAvis = [
        {
          _id: "1",
          note: 15,
          commentaire: "Excellent outil",
          user: { _id: "1", name: "User 1" },
          outils: { _id: "1", name: "Tool 1", imageURL: "url1" },
        },
      ];

      req.params = { id: "1" };

      avisModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAvis),
        }),
      });

      await avisController.getAvisByOutilId(req, res);

      expect(avisModel.find).toHaveBeenCalledWith({ outils: "1" });
      expect(res.send).toHaveBeenCalledWith(mockAvis);
    });

    it("should return 404 when no reviews found for tool", async () => {
      req.params = { id: "1" };

      avisModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue([]),
        }),
      });

      await avisController.getAvisByOutilId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Aucun avis trouvé pour cet outil",
      });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");

      avisModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(error),
        }),
      });

      await avisController.getAvisByOutilId(req, res);

      expectErrorResponse(res, 500, "Database error");
    });
  });

  describe("postAvis", () => {
    it("should create review successfully", async () => {
      const avisData = createTestAvisData();
      req.userId = "1";
      req.body = {
        ...avisData,
        outilId: "1",
      };

      const mockSavedAvis = { ...avisData, _id: "1", user: "1", outils: "1" };

      avisModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockSavedAvis),
      }));

      outilModel.findByIdAndUpdate.mockResolvedValue({ _id: "1" });
      calculerMoyennesOutil.mockResolvedValue();

      await avisController.postAvis(req, res);

      expect(avisModel).toHaveBeenCalledWith({
        ...avisData,
        user: "1",
        outils: "1",
      });
      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith("1", {
        $push: { avis: "1" },
      });
      expect(calculerMoyennesOutil).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockSavedAvis);
    });

    it("should return 400 when user or tool not specified", async () => {
      req.userId = null;
      req.body = createTestAvisData();

      await avisController.postAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "L'utilisateur et l'outil doivent être spécifiés",
      });
    });

    it("should return 400 when notes are out of range", async () => {
      req.userId = "1";
      req.body = {
        ...createTestAvisData(),
        outilId: "1",
        note: 25, // Invalid note
        difficulte: 10,
        performance: 18,
        flexibilite: 12,
      };

      await avisController.postAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Toutes les notes doivent être comprises entre 0 et 20",
      });
    });

    it("should handle database errors", async () => {
      req.userId = "1";
      req.body = {
        ...createTestAvisData(),
        outilId: "1",
      };

      const error = new Error("Validation failed");
      avisModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(error),
      }));

      await avisController.postAvis(req, res);

      expectErrorResponse(res, 500, "Validation failed");
    });
  });

  describe("putAvisById", () => {
    it("should update review successfully", async () => {
      const avisData = createTestAvisData();
      req.params = { id: "1" };
      req.body = { note: 18, commentaire: "Updated comment" };

      const mockAvis = { ...avisData, _id: "1" };
      const mockUpdatedAvis = {
        ...mockAvis,
        note: 18,
        commentaire: "Updated comment",
      };

      avisModel.findById.mockResolvedValue(mockAvis);
      avisModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedAvis);

      await avisController.putAvisById(req, res);

      expect(avisModel.findById).toHaveBeenCalledWith("1");
      expect(avisModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        { note: 18, commentaire: "Updated comment" },
        { new: true }
      );
      expect(res.send).toHaveBeenCalledWith(mockUpdatedAvis);
    });

    it("should return 404 when review not found", async () => {
      req.params = { id: "999" };
      req.body = { note: 18 };

      avisModel.findById.mockResolvedValue(null);

      await avisController.putAvisById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Avis non trouvé" });
    });

    it("should return 400 when note is out of range", async () => {
      const avisData = createTestAvisData();
      req.params = { id: "1" };
      req.body = { note: 25 }; // Invalid note

      const mockAvis = { ...avisData, _id: "1" };

      avisModel.findById.mockResolvedValue(mockAvis);

      await avisController.putAvisById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La note doit être comprise entre 0 et 20",
      });
    });

    it("should return 400 when difficulte is out of range", async () => {
      const avisData = createTestAvisData();
      req.params = { id: "1" };
      req.body = { difficulte: 25 }; // Invalid difficulte

      const mockAvis = { ...avisData, _id: "1" };

      avisModel.findById.mockResolvedValue(mockAvis);

      await avisController.putAvisById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La difficulté doit être comprise entre 0 et 20",
      });
    });

    it("should return 400 when performance is out of range", async () => {
      const avisData = createTestAvisData();
      req.params = { id: "1" };
      req.body = { performance: 25 }; // Invalid performance

      const mockAvis = { ...avisData, _id: "1" };

      avisModel.findById.mockResolvedValue(mockAvis);

      await avisController.putAvisById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La performance doit être comprise entre 0 et 20",
      });
    });

    it("should return 400 when flexibilite is out of range", async () => {
      const avisData = createTestAvisData();
      req.params = { id: "1" };
      req.body = { flexibilite: 25 }; // Invalid flexibilite

      const mockAvis = { ...avisData, _id: "1" };

      avisModel.findById.mockResolvedValue(mockAvis);

      await avisController.putAvisById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La flexibilité doit être comprise entre 0 et 20",
      });
    });
  });

  describe("deleteByIdAvis", () => {
    it("should delete review successfully", async () => {
      req.params = { id: "1" };

      const mockAvis = { _id: "1", outils: "1" };
      const mockResult = { _id: "1", deleted: true };

      avisModel.findById.mockResolvedValue(mockAvis);
      avisModel.findByIdAndDelete.mockResolvedValue(mockResult);
      outilModel.findByIdAndUpdate.mockResolvedValue({ _id: "1" });
      outilModel.findById.mockResolvedValue({ _id: "1", name: "Test Tool" });
      calculerMoyennesOutil.mockResolvedValue();

      await avisController.deleteByIdAvis(req, res);

      expect(avisModel.findById).toHaveBeenCalledWith("1");
      expect(avisModel.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(outilModel.findByIdAndUpdate).toHaveBeenCalledWith("1", {
        $pull: { avis: "1" },
      });
      expect(calculerMoyennesOutil).toHaveBeenCalledWith("1");
      expect(res.send).toHaveBeenCalledWith(mockResult);
    });

    it("should return 404 when review not found", async () => {
      req.params = { id: "999" };

      avisModel.findById.mockResolvedValue(null);

      await avisController.deleteByIdAvis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Avis non trouvé" });
    });

    it("should handle database errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");

      avisModel.findById.mockRejectedValue(error);

      await avisController.deleteByIdAvis(req, res);

      expectErrorResponse(res, 500, "Database error");
    });
  });
});
