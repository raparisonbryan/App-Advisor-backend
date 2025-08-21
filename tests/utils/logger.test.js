const {
  logger,
  httpLogger,
  dbLogger,
  logBusinessEvent,
  logError,
  logPerformance,
} = require("../../utils/logger");
const fs = require("fs");
const path = require("path");

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

describe("utils/logger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("logger principal", () => {
    it("should have info method", () => {
      expect(typeof logger.info).toBe("function");
    });

    it("should have error method", () => {
      expect(typeof logger.error).toBe("function");
    });

    it("should have warn method", () => {
      expect(typeof logger.warn).toBe("function");
    });

    it("should have debug method", () => {
      expect(typeof logger.debug).toBe("function");
    });
  });

  describe("httpLogger", () => {
    it("should have info method", () => {
      expect(typeof httpLogger.info).toBe("function");
    });

    it("should have error method", () => {
      expect(typeof httpLogger.error).toBe("function");
    });
  });

  describe("dbLogger", () => {
    it("should have info method", () => {
      expect(typeof dbLogger.info).toBe("function");
    });

    it("should have error method", () => {
      expect(typeof dbLogger.error).toBe("function");
    });
  });

  describe("logBusinessEvent", () => {
    it("should log business events", () => {
      const mockInfo = jest.spyOn(logger, "info").mockImplementation(() => {});

      logBusinessEvent("user_registration", {
        userId: "123",
        email: "test@test.com",
      });

      expect(mockInfo).toHaveBeenCalledWith("Business Event", {
        event: "user_registration",
        userId: "123",
        email: "test@test.com",
      });

      mockInfo.mockRestore();
    });
  });

  describe("logError", () => {
    it("should log errors with context", () => {
      const mockError = jest
        .spyOn(logger, "error")
        .mockImplementation(() => {});
      const error = new Error("Test error");

      logError(error, { context: "test", userId: "123" });

      expect(mockError).toHaveBeenCalledWith("Application Error", {
        message: "Test error",
        stack: error.stack,
        context: "test",
        userId: "123",
      });

      mockError.mockRestore();
    });
  });

  describe("logPerformance", () => {
    it("should log performance metrics", () => {
      const mockInfo = jest.spyOn(logger, "info").mockImplementation(() => {});

      logPerformance("database_query", 150, { collection: "users" });

      expect(mockInfo).toHaveBeenCalledWith("Performance Metric", {
        operation: "database_query",
        duration: "150ms",
        collection: "users",
      });

      mockInfo.mockRestore();
    });
  });

  describe("logger configuration", () => {
    it("should have correct log level", () => {
      expect(logger.level).toBeDefined();
    });

    it("should have transports configured", () => {
      expect(logger.transports).toBeDefined();
      expect(logger.transports.length).toBeGreaterThan(0);
    });
  });
});
