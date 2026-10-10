const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_DIR = path.resolve(__dirname, "../../data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, "ruang_namu.db");

const db = new Database(DB_PATH);

// Configure SQLite for high performance, ACID compliance and foreign keys
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = -64000"); // 64MB cache

module.exports = db;
