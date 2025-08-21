const promClient = require("prom-client");

const register = new promClient.Registry();

promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
  register,
});

const httpRequestsTotal = new promClient.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  register,
});

const activeConnections = new promClient.Gauge({
  name: "active_connections",
  help: "Number of active connections",
  register,
});

const databaseQueryDuration = new promClient.Histogram({
  name: "database_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "collection"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1],
  register,
});

const databaseOperationsTotal = new promClient.Counter({
  name: "database_operations_total",
  help: "Total number of database operations",
  labelNames: ["operation", "collection", "status"],
  register,
});

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationMicroseconds
      .labels(req.method, route, res.statusCode)
      .observe(duration);

    httpRequestsTotal.labels(req.method, route, res.statusCode).inc();
  });

  next();
};

const incrementActiveConnections = () => activeConnections.inc();
const decrementActiveConnections = () => activeConnections.dec();

const measureDatabaseOperation = async (operation, collection, fn) => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = (Date.now() - start) / 1000;

    databaseQueryDuration.labels(operation, collection).observe(duration);

    databaseOperationsTotal.labels(operation, collection, "success").inc();

    return result;
  } catch (error) {
    const duration = (Date.now() - start) / 1000;

    databaseQueryDuration.labels(operation, collection).observe(duration);

    databaseOperationsTotal.labels(operation, collection, "error").inc();

    throw error;
  }
};

const getMetrics = async () => {
  return await register.metrics();
};

module.exports = {
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
};
