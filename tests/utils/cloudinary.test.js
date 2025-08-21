describe("utils/cloudinary", () => {
  it("should export cloudinary and storage", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "cname";
    process.env.CLOUDINARY_API_KEY = "ckey";
    process.env.CLOUDINARY_API_SECRET = "csecret";
    const mod = require("../../utils/cloudinary");
    expect(mod).toHaveProperty("cloudinary");
    expect(mod).toHaveProperty("storage");
  });
});
