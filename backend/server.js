
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const {
  authenticateToken,
  authorizeAdmin,
} = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// SERVE UPLOADED FOOD IMAGES
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

const PORT = process.env.PORT || 5000;

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("4Cheez Backend Server is Running!");
});

// ==========================================
// MONGOOSE CONNECTION EVENTS
// ==========================================

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully!");
});

mongoose.connection.on("disconnected", () => {
  console.log("WARNING: MongoDB connection lost!");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully!");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

mongoose.connection.on("close", () => {
  console.log("MongoDB connection closed!");
});

// ==========================================
// REGISTER ALL API ROUTES
// ==========================================

function registerRoutes() {
  // ==========================================
  // CUSTOMER AUTHENTICATION
  // ==========================================

  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);

  // ==========================================
  // CUSTOMER ORDER ROUTES
  // ==========================================

  const orderRoutes = require("./routes/orderRoutes");
  app.use("/api/orders", orderRoutes);

  // ==========================================
  // CUSTOMER COUPON ROUTES
  // ==========================================

  const couponRoutes = require("./routes/couponRoutes");
  app.use("/api/coupons", couponRoutes);

  // ==========================================
  // GEMINI AI ROUTES
  // ==========================================

  const geminiRoutes = require("./routes/geminiRoutes");
  app.use("/api/ai", geminiRoutes);

  // ==========================================
  // ADMIN AUTHENTICATION
  // ALL /api/admin ROUTES REQUIRE ADMIN ACCESS
  // ==========================================

  app.use(
    "/api/admin",
    authenticateToken,
    authorizeAdmin
  );

  // ==========================================
  // ADMIN DASHBOARD, ORDERS, FOODS,
  // CUSTOMERS, COUPONS AND SETTINGS
  // ==========================================

  const adminRoutes = require("./routes/adminRoutes");
  app.use("/api/admin", adminRoutes);

  // ==========================================
  // ADMIN RECOMMENDATION ROUTES
  // ==========================================

  const recommendationRoutes = require(
    "./routes/recommendationRoutes"
  );

  app.use(
    "/api/admin/recommendations",
    recommendationRoutes
  );

  // ==========================================
  // ADMIN REVIEW ROUTES
  // ==========================================

  const reviewRoutes = require("./routes/reviewRoutes");

  app.use(
    "/api/admin/reviews",
    reviewRoutes
  );

  // ==========================================
  // CUSTOMER REVIEW ROUTES
  // ==========================================

  const customerReviewRoutes = require(
    "./routes/customerReviewRoutes"
  );

  app.use(
    "/api/reviews",
    customerReviewRoutes
  );

  // ==========================================
  // PUBLIC FOOD ROUTES
  // CUSTOMER MENU
  // ==========================================

  const foodRoutes = require("./routes/foodRoutes");

  app.use(
    "/api/foods",
    foodRoutes
  );
}

// ==========================================
// START EXPRESS SERVER
// ==========================================

function startExpressServer() {
  app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("4CHEEZ BACKEND STARTED");
    console.log("=================================");

    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`Order API: http://localhost:${PORT}/api/orders`);
    console.log(`Coupon API: http://localhost:${PORT}/api/coupons`);
    console.log(`AI API: http://localhost:${PORT}/api/ai`);
    console.log(`Admin API: http://localhost:${PORT}/api/admin`);

    console.log(
      `Admin Recommendation API: http://localhost:${PORT}/api/admin/recommendations`
    );

    console.log(
      `Admin Review API: http://localhost:${PORT}/api/admin/reviews`
    );

    console.log(
      `Customer Review API: http://localhost:${PORT}/api/reviews`
    );

    console.log(
      `Customer Food API: http://localhost:${PORT}/api/foods`
    );

    console.log(
      `Food Images: http://localhost:${PORT}/uploads/`
    );

    console.log("=================================");
  });
}

// ==========================================
// CONNECT TO MONGODB AND START APPLICATION
// ==========================================

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from your backend .env file."
      );
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      autoSelectFamily: false,
    });

    console.log("MongoDB connection established.");

    console.log(
      "MongoDB connection state:",
      mongoose.connection.readyState
    );

    // Verify MongoDB connection

    const result = await mongoose.connection.db
      .admin()
      .ping();

    console.log("MongoDB ping successful!");
    console.log("Ping result:", result);

    // Register API routes after database connection

    registerRoutes();

    // Start Express

    startExpressServer();

  } catch (error) {
    console.error("");
    console.error("=================================");
    console.error("BACKEND STARTUP ERROR");
    console.error("=================================");

    console.error(error);

    console.error("=================================");

    process.exit(1);
  }
}

// ==========================================
// START APPLICATION
// ==========================================

startServer();
