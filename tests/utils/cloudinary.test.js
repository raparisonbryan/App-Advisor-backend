describe("utils/cloudinary", () => {
  it("should export cloudinary and storage", () => {
    const mod = require("../../utils/cloudinary");
    expect(mod).toHaveProperty("cloudinary");
    expect(mod).toHaveProperty("storage");
  });
});
