const { cleanupOrphanedAvis } = require("../../utils/cleanup");
const AvisModel = require("../../Models/Avis");

jest.mock("../../Models/Avis");

describe("utils/cleanup - cleanupOrphanedAvis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete orphaned avis and return deletedCount", async () => {
    const orphaned = [
      { _id: "a1", outils: null },
      { _id: "a2", outils: { _id: "tool1" } },
      { _id: "a3", outils: null },
    ];

    AvisModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(orphaned),
    });

    AvisModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

    const result = await cleanupOrphanedAvis();

    expect(AvisModel.find).toHaveBeenCalled();
    expect(AvisModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: ["a1", "a3"] } });
    expect(result).toEqual({ deletedCount: 2 });
  });

  it("should return 0 when no orphaned avis", async () => {
    const orphaned = [
      { _id: "a2", outils: { _id: "tool1" } },
    ];

    AvisModel.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(orphaned),
    });

    const result = await cleanupOrphanedAvis();

    expect(AvisModel.deleteMany).not.toHaveBeenCalled();
    expect(result).toEqual({ deletedCount: 0 });
  });
});
