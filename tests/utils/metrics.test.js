const {
  register,
  metricsMiddleware,
  incrementActiveConnections,
  decrementActiveConnections,
  measureDatabaseOperation,
  getMetrics,
  httpRequestDurationMicroseconds,
  httpRequestsTotal,
  activeConnections,
  databaseQueryDuration,
  databaseOperationsTotal,
} = require("../../utils/metrics");

describe("utils/metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should have a Prometheus registry", () => {
      expect(register).toBeDefined();
      expect(typeof register.metrics).toBe("function");
    });
  });

  describe("metricsMiddleware", () => {
    it("should be a function", () => {
      expect(typeof metricsMiddleware).toBe("function");
    });

    it("should call next()", () => {
      const req = { method: "GET", path: "/test", route: { path: "/test" } };
      const res = { on: jest.fn(), statusCode: 200 };
      const next = jest.fn();

      metricsMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should set up response finish listener", () => {
      const req = { method: "GET", path: "/test", route: { path: "/test" } };
      const res = { on: jest.fn(), statusCode: 200 };
      const next = jest.fn();

      metricsMiddleware(req, res, next);

      expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
    });
  });

  describe("connection metrics", () => {
    it("should increment active connections", () => {
      const initialValue = activeConnections._value;
      incrementActiveConnections();
      expect(activeConnections._value).toBe(initialValue + 1);
    });

    it("should decrement active connections", () => {
      const initialValue = activeConnections._value;
      decrementActiveConnections();
      expect(activeConnections._value).toBe(initialValue - 1);
    });
  });

  describe("measureDatabaseOperation", () => {
    it("should measure successful database operations", async () => {
      const mockFn = jest.fn().mockResolvedValue("success");

      const result = await measureDatabaseOperation("find", "users", mockFn);

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalled();
    });

    it("should measure failed database operations", async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error("DB Error"));

      await expect(
        measureDatabaseOperation("find", "users", mockFn)
      ).rejects.toThrow("DB Error");
    });

    it("should record operation duration", async () => {
      const mockFn = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 10))
        );

      await measureDatabaseOperation("find", "users", mockFn);

      // Vérifier que la métrique a été enregistrée
      expect(databaseQueryDuration._value).toBeGreaterThan(0);
    });
  });

  describe("getMetrics", () => {
    it("should return metrics string", async () => {
      const metrics = await getMetrics();
      expect(typeof metrics).toBe("string");
      expect(metrics.length).toBeGreaterThan(0);
    });

    it("should contain Prometheus format", async () => {
      const metrics = await getMetrics();
      expect(metrics).toContain("# HELP");
      expect(metrics).toContain("# TYPE");
    });
  });

  describe("metric objects", () => {
    it("should have httpRequestDurationMicroseconds", () => {
      expect(httpRequestDurationMicroseconds).toBeDefined();
      expect(httpRequestDurationMicroseconds._value).toBeDefined();
    });

    it("should have httpRequestsTotal", () => {
      expect(httpRequestsTotal).toBeDefined();
      expect(httpRequestsTotal._value).toBeDefined();
    });

    it("should have activeConnections", () => {
      expect(activeConnections).toBeDefined();
      expect(activeConnections._value).toBeDefined();
    });

    it("should have databaseQueryDuration", () => {
      expect(databaseQueryDuration).toBeDefined();
      expect(databaseQueryDuration._value).toBeDefined();
    });

    it("should have databaseOperationsTotal", () => {
      expect(databaseOperationsTotal).toBeDefined();
      expect(databaseOperationsTotal._value).toBeDefined();
    });
  });

  describe("metric labels", () => {
    it("should support metric labeling", () => {
      const metric = httpRequestsTotal.labels("GET", "/test", 200);
      expect(metric).toBeDefined();
    });
  });
});
