jest.unmock("../../utils/statistiques");
const { calculerMoyennesOutil } = require("../../utils/statistiques");
const AvisModel = require("../../Models/Avis");
const OutilModel = require("../../Models/Outil");

jest.mock("../../Models/Avis");
jest.mock("../../Models/Outil");

describe("Statistiques Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set zeros when no avis found", async () => {
    AvisModel.find.mockResolvedValue([]);
    OutilModel.findByIdAndUpdate.mockResolvedValue({});

    await calculerMoyennesOutil("oid");

    expect(OutilModel.findByIdAndUpdate).toHaveBeenCalledWith("oid", expect.objectContaining({
      moyenneNote: 0,
      nombreAvis: 0,
    }));
  });

  it("should compute averages and update outil", async () => {
    AvisModel.find.mockResolvedValue([
      { note: 10, difficulte: 12, performance: 14, flexibilite: 16 },
      { note: 20, difficulte: 8, performance: 6, flexibilite: 4 },
    ]);
    OutilModel.findByIdAndUpdate.mockResolvedValue({});

    await calculerMoyennesOutil("oid");

    expect(OutilModel.findByIdAndUpdate).toHaveBeenCalledWith(
      "oid",
      expect.objectContaining({ moyenneNote: 15, nombreAvis: 2 })
    );
  });
});
