describe("middleware/upload", () => {
  it("should load the multer upload instance", () => {
    const upload = require("../../middleware/upload");
    expect(upload).toBeTruthy();
    // Common multer interface: should have .single function
    expect(typeof upload.single).toBe("function");
  });
});
