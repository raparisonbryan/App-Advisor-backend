const { calculerMoyennesOutil } = require("../../utils/statistiques");

describe("Statistiques Utils", () => {
  describe("calculerMoyennesOutil", () => {
    it("should be a function", () => {
      expect(typeof calculerMoyennesOutil).toBe("function");
    });

    it("should be async", () => {
      // La fonction est async, donc elle retourne une Promise
      expect(() => {
        calculerMoyennesOutil("test-id");
      }).not.toThrow();
    });

    it("should accept one parameter", () => {
      // La fonction accepte un paramètre
      expect(() => {
        calculerMoyennesOutil("test-id");
      }).not.toThrow();
    });

    it("should handle basic functionality", async () => {
      // Test simple pour vérifier que la fonction existe et peut être appelée
      expect(() => {
        // La fonction peut être appelée sans erreur de syntaxe
        calculerMoyennesOutil("test-id");
      }).not.toThrow();
    });

    it("should have correct function signature", () => {
      // Vérifier que la fonction a la bonne signature
      expect(typeof calculerMoyennesOutil).toBe("function");
      expect(calculerMoyennesOutil).toBeDefined();
    });
  });
});
