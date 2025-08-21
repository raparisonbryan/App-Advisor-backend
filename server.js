const express = require("express");
const connectDatabase = require("./db/connect");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const userRouter = require("./Routers/userRouter");
const outilsRouter = require("./Routers/outilsRouter");
const avisRouter = require("./Routers/avisRouter");
const categoriesRouter = require("./Routers/categoriesRouter");
const aiRouter = require("./Routers/chatbotRouter");
const monitoringRouter = require("./Routers/monitoringRouter");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerDocs = require("./swagger");
const swaggerUI = require("swagger-ui-express");
const { metricsMiddleware } = require("./utils/metrics");
const { logger, httpLoggingMiddleware } = require("./utils/logger");

// Créer le dossier logs pour Grafana
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

connectDatabase();

const corsOptions = {
  origin: [
    "https://app-advisor-frontend-production.up.railway.app",
    "https://app-advisor-llm-production.up.railway.app",
    "https://frontend-dev-developpment.up.railway.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5005",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(metricsMiddleware);
app.use(httpLoggingMiddleware);

app.get("/", (req, res) => {
  res.send("Hello, Node.js!");
});

app.use("/ai", aiRouter);
app.use("/user", userRouter);
app.use("/outils", outilsRouter);
app.use("/avis", avisRouter);
app.use("/categories", categoriesRouter);
app.use("/monitoring", monitoringRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
