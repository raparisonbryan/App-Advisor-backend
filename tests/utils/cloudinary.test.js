describe("utils/cloudinary", () => {
  it("should export cloudinary and storage", () => {
    // Use secure test values that are not real secrets
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud-name";
    process.env.CLOUDINARY_API_KEY = "test-api-key-for-testing-only";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret-for-testing-only";
    const mod = require("../../utils/cloudinary");
    expect(mod).toHaveProperty("cloudinary");
    expect(mod).toHaveProperty("storage");
  });
});
