describe("middleware/upload", () => {
  it("should load the multer upload instance", () => {
    const upload = require("../../middleware/upload");
    expect(upload).toBeTruthy();
    expect(typeof upload.single).toBe("function");
  });
});
