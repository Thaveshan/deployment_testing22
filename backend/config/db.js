const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  console.error("MONGO_PROFILE_URI is missing.");
}

if (!process.env.MONGO_LOGS_URI) {
  console.error("MONGO_LOGS_URI is missing.");
}

const profileDb = mongoose.createConnection(process.env.MONGO_URI || "");
const logsDb = mongoose.createConnection(process.env.MONGO_LOGS_URI || "");

profileDb.on("connected", () => {
  console.log("Connected to Profile Database");
});

logsDb.on("connected", () => {
  console.log("Connected to Logs Database");
});

profileDb.on("error", (error) => {
  console.error("Profile Database connection error:", error.message);
});

logsDb.on("error", (error) => {
  console.error("Logs Database connection error:", error.message);
});

module.exports = {
  profileDb,
  logsDb
};