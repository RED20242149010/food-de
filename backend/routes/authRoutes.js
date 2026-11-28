
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// TEST ROUTE
// ======================================================

router.get("/test", (req, res) => {
  res.json({
    message: "Auth routes are working!",
    mongooseState: mongoose.connection.readyState,
  });
});

// ======================================================
// SIGN UP
// POST /api/auth/signup
// PUBLIC REGISTRATION - CUSTOMER ONLY
// ======================================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Validate name
    if (name.trim().length > 100) {
      return res.status(400).json({
        message: "Name cannot exceed 100 characters",
      });
    }

    // Validate email
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (password.length > 72) {
      return res.status(400).json({
        message: "Password cannot exceed 72 characters",
      });
    }

    // Validate phone if provided
    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).exec();

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer account.
    // IMPORTANT: Never accept role from public signup.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      password: hashedPassword,
      role: "customer",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    console.error("SIGNUP ERROR:", error);

    return res.status(500).json({
      message: "Unable to register user",
    });
  }
});

// ======================================================
// LOGIN
// POST /api/auth/login
// CUSTOMER AND ADMIN AUTHENTICATION
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server configuration error",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).exec();

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      expiresIn: 900,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Unable to log in",
    });
  }
});

// ======================================================
// RESTORE CURRENT USER SESSION
// GET /api/auth/me
// ======================================================

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .exec();

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists. Please log in again.",
      });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("SESSION RESTORE ERROR:", error);

    return res.status(500).json({
      message: "Unable to restore session",
    });
  }
});

// ======================================================
// LOGOUT
// POST /api/auth/logout
// ======================================================

router.post("/logout", (req, res) => {
  // Client must clear its stored JWT.
  // This endpoint does not revoke an already-issued token.

  return res.status(200).json({
    message: "Logged out successfully",
  });
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
