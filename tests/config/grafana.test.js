const config = require("../../config/grafana");

describe("config/grafana", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("grafana configuration", () => {
    it("should have default cloud URL", () => {
      delete process.env.GRAFANA_CLOUD_URL;
      const config = require("../../config/grafana");
      expect(config.grafana.cloudUrl).toBe(
        "https://raparisonbryan.grafana.net"
      );
    });

    it("should use environment variable for cloud URL", () => {
      process.env.GRAFANA_CLOUD_URL = "https://custom.grafana.net";
      const config = require("../../config/grafana");
      expect(config.grafana.cloudUrl).toBe("https://custom.grafana.net");
    });

    it("should have API key from environment", () => {
      process.env.GRAFANA_API_KEY = "test-api-key";
      const config = require("../../config/grafana");
      expect(config.grafana.apiKey).toBe("test-api-key");
    });

    it("should have org ID from environment", () => {
      process.env.GRAFANA_ORG_ID = "test-org-id";
      const config = require("../../config/grafana");
      expect(config.grafana.orgId).toBe("test-org-id");
    });

    it("should have Prometheus URL from environment", () => {
      process.env.GRAFANA_PROMETHEUS_URL = "https://prometheus.test.com";
      const config = require("../../config/grafana");
      expect(config.grafana.prometheusUrl).toBe("https://prometheus.test.com");
    });

    it("should have Loki URL from environment", () => {
      process.env.GRAFANA_LOKI_URL = "https://loki.test.com";
      const config = require("../../config/grafana");
      expect(config.grafana.lokiUrl).toBe("https://loki.test.com");
    });
  });

  describe("metrics configuration", () => {
    it("should have metrics enabled by default", () => {
      delete process.env.METRICS_ENABLED;
      const config = require("../../config/grafana");
      expect(config.metrics.enabled).toBe(true);
    });

    it("should respect METRICS_ENABLED environment variable", () => {
      process.env.METRICS_ENABLED = "false";
      const config = require("../../config/grafana");
      expect(config.metrics.enabled).toBe(false);
    });

    it("should have default metrics port", () => {
      delete process.env.METRICS_PORT;
      const config = require("../../config/grafana");
      expect(config.metrics.port).toBe(9090);
    });

    it("should use custom metrics port from environment", () => {
      process.env.METRICS_PORT = "8080";
      const config = require("../../config/grafana");
      expect(config.metrics.port).toBe(8080);
    });

    it("should have default metrics path", () => {
      delete process.env.METRICS_PATH;
      const config = require("../../config/grafana");
      expect(config.metrics.path).toBe("/metrics");
    });

    it("should use custom metrics path from environment", () => {
      process.env.METRICS_PATH = "/custom-metrics";
      const config = require("../../config/grafana");
      expect(config.metrics.path).toBe("/custom-metrics");
    });
  });

  describe("logging configuration", () => {
    it("should have default log level", () => {
      delete process.env.LOG_LEVEL;
      const config = require("../../config/grafana");
      expect(config.logging.level).toBe("info");
    });

    it("should use custom log level from environment", () => {
      process.env.LOG_LEVEL = "debug";
      const config = require("../../config/grafana");
      expect(config.logging.level).toBe("debug");
    });

    it("should have default log format", () => {
      delete process.env.LOG_FORMAT;
      const config = require("../../config/grafana");
      expect(config.logging.format).toBe("json");
    });

    it("should use custom log format from environment", () => {
      process.env.LOG_FORMAT = "text";
      const config = require("../../config/grafana");
      expect(config.logging.format).toBe("text");
    });
  });

  describe("configuration structure", () => {
    it("should have correct structure", () => {
      expect(config).toHaveProperty("grafana");
      expect(config).toHaveProperty("metrics");
      expect(config).toHaveProperty("logging");
    });

    it("should have grafana sub-properties", () => {
      expect(config.grafana).toHaveProperty("cloudUrl");
      expect(config.grafana).toHaveProperty("apiKey");
      expect(config.grafana).toHaveProperty("orgId");
      expect(config.grafana).toHaveProperty("prometheusUrl");
      expect(config.grafana).toHaveProperty("lokiUrl");
    });

    it("should have metrics sub-properties", () => {
      expect(config.metrics).toHaveProperty("enabled");
      expect(config.metrics).toHaveProperty("port");
      expect(config.metrics).toHaveProperty("path");
    });

    it("should have logging sub-properties", () => {
      expect(config.logging).toHaveProperty("level");
      expect(config.logging).toHaveProperty("format");
    });
  });
});
