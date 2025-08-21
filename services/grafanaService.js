const axios = require("axios");
const config = require("../config/grafana");
const { logger } = require("../utils/logger");

class GrafanaService {
  constructor() {
    this.baseUrl = config.grafana.cloudUrl;
    this.apiKey = config.grafana.apiKey;
    this.orgId = config.grafana.orgId;
    this.prometheusUrl = config.grafana.prometheusUrl;
    this.lokiUrl = config.grafana.lokiUrl;

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  async checkConnection() {
    try {
      const response = await this.httpClient.get("/api/health");
      logger.info("Grafana Cloud connection successful", {
        status: response.status,
      });
      return { success: true, status: response.status };
    } catch (error) {
      logger.error("Grafana Cloud connection failed", {
        error: error.message,
        status: error.response?.status,
      });
      return { success: false, error: error.message };
    }
  }

  async sendCustomMetrics(metrics) {
    if (!this.prometheusUrl) {
      logger.warn("Prometheus URL not configured, skipping metrics send");
      return { success: false, error: "Prometheus URL not configured" };
    }

    try {
      const response = await axios.post(this.prometheusUrl, metrics, {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      logger.info("Custom metrics sent successfully", {
        status: response.status,
      });
      return { success: true, status: response.status };
    } catch (error) {
      logger.error("Failed to send custom metrics", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async sendLogsToLoki(logs) {
    if (!this.lokiUrl) {
      logger.warn("Loki URL not configured, skipping logs send");
      return { success: false, error: "Loki URL not configured" };
    }

    try {
      const lokiPayload = {
        streams: [
          {
            stream: {
              application: "app-advisor-backend",
              environment: process.env.NODE_ENV || "development",
            },
            values: logs.map((log) => [
              Date.now().toString(),
              typeof log === "string" ? log : JSON.stringify(log),
            ]),
          },
        ],
      };

      const response = await axios.post(this.lokiUrl, lokiPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      logger.info("Logs sent to Loki successfully", {
        status: response.status,
      });
      return { success: true, status: response.status };
    } catch (error) {
      logger.error("Failed to send logs to Loki", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createDashboard(dashboardConfig) {
    try {
      const response = await this.httpClient.post("/api/dashboards/db", {
        dashboard: dashboardConfig,
        overwrite: true,
      });

      logger.info("Dashboard created successfully", {
        title: dashboardConfig.title,
        uid: response.data.uid,
      });
      return { success: true, data: response.data };
    } catch (error) {
      logger.error("Failed to create dashboard", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getDashboards() {
    try {
      const response = await this.httpClient.get("/api/search");
      logger.info("Dashboards retrieved successfully", {
        count: response.data.length,
      });
      return { success: true, data: response.data };
    } catch (error) {
      logger.error("Failed to get dashboards", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async createDefaultDashboard() {
    const defaultDashboard = {
      title: "AppAdvisor Backend Monitoring",
      uid: "appadvisor-backend",
      tags: ["appadvisor", "backend", "monitoring"],
      timezone: "browser",
      panels: [
        {
          title: "HTTP Request Rate",
          type: "graph",
          targets: [
            {
              expr: "rate(http_requests_total[5m])",
              legendFormat: "{{method}} {{route}}",
            },
          ],
          gridPos: { h: 8, w: 12, x: 0, y: 0 },
        },
        {
          title: "Response Time",
          type: "graph",
          targets: [
            {
              expr: "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
              legendFormat: "95th percentile",
            },
          ],
          gridPos: { h: 8, w: 12, x: 12, y: 0 },
        },
        {
          title: "Database Operations",
          type: "graph",
          targets: [
            {
              expr: "rate(database_operations_total[5m])",
              legendFormat: "{{operation}} {{collection}}",
            },
          ],
          gridPos: { h: 8, w: 12, x: 0, y: 8 },
        },
        {
          title: "Active Connections",
          type: "stat",
          targets: [
            {
              expr: "active_connections",
            },
          ],
          gridPos: { h: 4, w: 6, x: 12, y: 8 },
        },
      ],
    };

    return await this.createDashboard(defaultDashboard);
  }

  async sendAlert(alert) {
    try {
      const response = await this.httpClient.post("/api/alerts", alert);
      logger.info("Alert sent successfully", { alert: alert.title });
      return { success: true, data: response.data };
    } catch (error) {
      logger.error("Failed to send alert", { error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getOrgStats() {
    try {
      const response = await this.httpClient.get(`/api/orgs/${this.orgId}`);
      logger.info("Organization stats retrieved successfully");
      return { success: true, data: response.data };
    } catch (error) {
      logger.error("Failed to get organization stats", {
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = new GrafanaService();
