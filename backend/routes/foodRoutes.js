
const express = require("express");
const router = express.Router();

const Food = require("../models/Food");

// ==========================================
// GET RECOMMENDED FOODS FOR CUSTOMERS
// GET /api/foods/recommended
// ==========================================

router.get("/recommended", async (req, res) => {
  try {
    const foods = await Food.find({
      isRecommended: true,
      isAvailable: true,
    }).sort({
      popular: 1,
      rating: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalRecommendations: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Customer recommendations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load recommended foods.",
    });
  }
});

// ==========================================
// GET ALL AVAILABLE FOOD ITEMS
// GET /api/foods
// ==========================================

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find({
      isAvailable: true,
    }).sort({
      popular: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      foods,
    });
  } catch (error) {
    console.error("Customer food fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load food items.",
    });
  }
});

module.exports = router;
