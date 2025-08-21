const winston = require("winston");
const config = require("../config/grafana");

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),

  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
    format: logFormat,
  }),

  new winston.transports.File({
    filename: "logs/combined.log",
    format: logFormat,
  }),
];

const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports,
  exitOnError: false,
});

const httpLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/http.log",
      format: logFormat,
    }),
  ],
});

const dbLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: "logs/database.log",
      format: logFormat,
    }),
  ],
});

const httpLoggingMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null,
    };

    if (res.statusCode >= 400) {
      httpLogger.error("HTTP Request Error", logData);
    } else {
      httpLogger.info("HTTP Request", logData);
    }
  });

  next();
};

const logDatabaseOperation = (
  operation,
  collection,
  query,
  duration,
  success,
  error = null
) => {
  const logData = {
    operation,
    collection,
    query: typeof query === "string" ? query : JSON.stringify(query),
    duration: `${duration}ms`,
    success,
    error: error ? error.message : null,
    stack: error ? error.stack : null,
  };

  if (success) {
    dbLogger.info("Database Operation", logData);
  } else {
    dbLogger.error("Database Operation Error", logData);
  }
};

const logError = (error, context = {}) => {
  logger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

const logPerformance = (operation, duration, metadata = {}) => {
  logger.info("Performance Metric", {
    operation,
    duration: `${duration}ms`,
    ...metadata,
  });
};

const logBusinessEvent = (event, data = {}) => {
  logger.info("Business Event", {
    event,
    ...data,
  });
};

module.exports = {
  logger,
  httpLogger,
  dbLogger,
  httpLoggingMiddleware,
  logDatabaseOperation,
  logError,
  logPerformance,
  logBusinessEvent,
};
