const express = require("express");
const router = express.Router();
const { getMetrics } = require("../utils/metrics");
const grafanaService = require("../services/grafanaService");
const { logger } = require("../utils/logger");

router.get("/metrics", async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set("Content-Type", "text/plain");
    res.send(metrics);
  } catch (error) {
    logger.error("Error getting metrics", { error: error.message });
    res.status(500).json({ error: "Failed to get metrics" });
  }
});

router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV || "development",
    };

    res.json(health);
  } catch (error) {
    logger.error("Health check failed", { error: error.message });
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/grafana/status", async (req, res) => {
  try {
    const status = await grafanaService.checkConnection();
    res.json(status);
  } catch (error) {
    logger.error("Grafana status check failed", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/grafana/dashboard/default", async (req, res) => {
  try {
    const result = await grafanaService.createDefaultDashboard();
    res.json(result);
  } catch (error) {
    logger.error("Failed to create default dashboard", {
      error: error.message,
    });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/grafana/dashboards", async (req, res) => {
  try {
    const result = await grafanaService.getDashboards();
    res.json(result);
  } catch (error) {
    logger.error("Failed to get dashboards", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/grafana/org-stats", async (req, res) => {
  try {
    const result = await grafanaService.getOrgStats();
    res.json(result);
  } catch (error) {
    logger.error("Failed to get organization stats", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/grafana/alerts", async (req, res) => {
  try {
    const { title, message, severity = "info", tags = [] } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: "Title and message are required",
      });
    }

    const alert = {
      title,
      message,
      severity,
      tags: ["appadvisor", "backend", ...tags],
      timestamp: new Date().toISOString(),
    };

    const result = await grafanaService.sendAlert(alert);
    res.json(result);
  } catch (error) {
    logger.error("Failed to send alert", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/system", (req, res) => {
  try {
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      pid: process.pid,
      title: process.title,
      argv: process.argv,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT || 3000,
      },
    };

    res.json(systemInfo);
  } catch (error) {
    logger.error("Failed to get system info", { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
