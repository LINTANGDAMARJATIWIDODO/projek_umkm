require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const db = require("./db/database");
const { initializeSchema } = require("./db/schema");
const apiRoutes = require("./routes");
const { logger } = require("./utils/logger");

// Initialize database schema
initializeSchema();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, webhooks)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local development and testing
  },
  credentials: true
}));

// Body parsers - store raw body for cryptographic webhook signature checks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Request logging (sanitized)
app.use((req, res, next) => {
  if (req.path !== "/api/health" && req.path !== "/api/orders/queue") {
    logger.info(`${req.method} ${req.path}`);
  }
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Cafe Ruang Namu API",
    version: "1.0.0",
    time: new Date().toISOString()
  });
});

// API Routes
app.use("/api", apiRoutes);

// Serve Client Static Build in Production if present
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const indexHtml = path.join(clientDist, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) next();
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled Error", { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server."
  });
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`☕ CAFE RUANG NAMU SERVER IS RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server...");
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, closing server...");
  server.close(() => {
    db.close();
    process.exit(0);
  });
});

module.exports = app;
