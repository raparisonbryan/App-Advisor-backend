const { validatePassword } = require("../../middleware/validatePassword");
const { createMockRequest, createMockResponse, createMockNext } = require("../helpers/testUtils");

describe("middleware/validatePassword (strong policy)", () => {
  it("should reject when password missing", () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();
    const next = createMockNext();

    validatePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should reject when password too short", () => {
    const req = createMockRequest({ body: { password: "Ab1!" } });
    const res = createMockResponse();
    const next = createMockNext();

    validatePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should reject when missing char classes", () => {
    const req = createMockRequest({ body: { password: "aaaaaaaa" } });
    const res = createMockResponse();
    const next = createMockNext();

    validatePassword(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].msg).toContain("au moins");
  });

  it("should pass for strong password", () => {
    const req = createMockRequest({ body: { password: "Aa1!aaaa" } });
    const res = createMockResponse();
    const next = createMockNext();

    validatePassword(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
