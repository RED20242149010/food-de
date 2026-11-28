
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Food = require("../models/Food");

// ==========================================
// GET ALL FOODS WITH RECOMMENDATION STATUS
// GET /api/admin/recommendations
// ==========================================

router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalFoods: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Fetch recommendations error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch food recommendations.",
    });
  }
});

// ==========================================
// GET ONLY RECOMMENDED FOODS
// GET /api/admin/recommendations/selected
// ==========================================

router.get("/selected", async (req, res) => {
  try {
    const foods = await Food.find({
      isRecommended: true,
      isAvailable: true,
    }).sort({ popular: -1, rating: -1 });

    res.status(200).json({
      success: true,
      totalRecommendations: foods.length,
      foods,
    });
  } catch (error) {
    console.error("Fetch selected recommendations error:", error);

    res.status(500).json({
      success: false,
      message: "Could not fetch selected recommendations.",
    });
  }
});

// ==========================================
// ADD OR REMOVE FOOD FROM RECOMMENDATIONS
// PATCH /api/admin/recommendations/:id
// ==========================================

router.patch("/:id", async (req, res) => {
  try {
    const { isRecommended } = req.body;

    if (typeof isRecommended !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid recommendation status.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid food ID.",
      });
    }

    const food = await Food.findByIdAndUpdate(
      req.params.id,
      { isRecommended },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: isRecommended
        ? "Food added to recommendations successfully."
        : "Food removed from recommendations successfully.",
      food,
    });
  } catch (error) {
    console.error("Update recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update recommendation.",
    });
  }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
