const rateLimit = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard.",
      retryAfter: "15 minutes",
    });
  },
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    error:
      "Trop de tentatives d'opérations sensibles, veuillez réessayer plus tard.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error:
        "Trop de tentatives d'opérations sensibles, veuillez réessayer plus tard.",
      retryAfter: "15 minutes",
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
      retryAfter: "15 minutes",
    });
  },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: "Trop d'uploads depuis cette IP, veuillez réessayer plus tard.",
    retryAfter: "1 heure",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Trop d'uploads depuis cette IP, veuillez réessayer plus tard.",
      retryAfter: "1 heure",
    });
  },
});

module.exports = {
  generalLimiter,
  strictLimiter,
  authLimiter,
  uploadLimiter,
};
