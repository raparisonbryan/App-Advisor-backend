require("dotenv").config();

module.exports = {
  grafana: {
    cloudUrl:
      process.env.GRAFANA_CLOUD_URL || "https://raparisonbryan.grafana.net",
    apiKey: process.env.GRAFANA_API_KEY,
    orgId: process.env.GRAFANA_ORG_ID,
    prometheusUrl: process.env.GRAFANA_PROMETHEUS_URL,
    lokiUrl: process.env.GRAFANA_LOKI_URL,
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === "true" || true,
    port: process.env.METRICS_PORT || 9090,
    path: process.env.METRICS_PATH || "/metrics",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
  },
};
