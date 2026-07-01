const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
require("./config/db");

const { profileDb, logsDb } = require("./config/db");

const User = require("./models/User");
const AuditLog = require("./models/AuditLog");

const path = require("path");

const app = express();

app.use(express.json());

// CORS
app.use(cors());

// Security headers
app.use(helmet());

// Prevent browser/API caching for all API routes
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// Static public files, if still needed
app.use(express.static(path.join(__dirname, "public")));

// Middleware to check JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format." });
  }

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

// Helper function to create audit logs
async function createdAuditLog(username, action, description) {
  try {
    await AuditLog.create({
      username,
      action,
      description
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
}

// Test route
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// API status route
app.get("/api/status", (req, res) => {
  try {
    const profileDbStatus = profileDb.readyState === 1 ? "connected" : "disconnected";
    const logsDbStatus = logsDb.readyState === 1 ? "connected" : "disconnected";

    res.json({
      message: "API status is healthy.",
      appName: "Profile Management API",
      version: "1.0.0",
      serverTime: new Date().toISOString(),
      databases: {
        profile: profileDbStatus,
        logs: logsDbStatus
      },
      environment: process.env.NODE_ENV || "development"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while checking API status." });
  }
});

// Version route
app.get("/api/version", (req, res) => {
  res.json({
    version: "1.0.0",
    message: "Version control demo update",
    updatedBy: "SE_22025"
  });
});

// Registration route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email, phone, dob } = req.body;

    if (!username || !password || !email || !phone || !dob) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      await createdAuditLog(
        username,
        "Failed Registration",
        `Registration failed because username already exists: ${username}`
      );

      return res.status(400).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      dob
    });

    await newUser.save();

    await createdAuditLog(
      username,
      "User Registration",
      `New user registered with username: ${username}`
    );

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      await createdAuditLog(
        username || "Unknown",
        "Failed Login",
        "Login failed because username or password was missing."
      );

      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await User.findOne({ username });

    if (!user) {
      await createdAuditLog(
        username,
        "Failed Login",
        `Failed login attempt with unknown username: ${username}`
      );

      return res.status(401).json({ message: "Incorrect username or password." });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      await createdAuditLog(
        username,
        "Failed Login",
        `Failed login attempt for username: ${username}`
      );

      return res.status(401).json({ message: "Incorrect username or password." });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await createdAuditLog(
      username,
      "User Login",
      `User logged in with username: ${username}`
    );

    res.json({
      message: "Login successful.",
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Get logged-in user profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile load error:", error);
    res.status(500).json({ message: "Server error while loading profile." });
  }
});

// Update logged-in user profile
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { email, phone, dob } = req.body;

    if (!email || !phone || !dob) {
      return res.status(400).json({ message: "Email, phone, and date of birth are required." });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const phonePattern = /^[0-9]+$/;

    if (!phonePattern.test(phone)) {
      return res.status(400).json({ message: "Phone number must contain numbers only." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        email,
        phone,
        dob
      },
      {
        new: true
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    await createdAuditLog(
      req.user.username,
      "Profile Update",
      `User updated profile information for username: ${req.user.username}`
    );

    res.json({
      message: "Profile updated successfully.",
      user: updatedUser
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

// Audit logs route
// Currently public for testing.
// Add authenticateToken later if you want to protect it.
app.get("/api/audit-logs", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Audit logs fetch error:", error);
    res.status(500).json({ message: "Server error while fetching audit logs." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});