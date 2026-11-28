
const express = require("express");
const mongoose = require("mongoose");

const Review = require("../models/Review");

const router = express.Router();

// ==========================================
// 1. GET ALL REVIEWS
// GET /api/admin/reviews
// ==========================================

router.get("/", async (req, res) => {
  try {
    const { status, rating, search } = req.query;

    const filter = {};

    // Filter by review status
    if (status) {
      if (!["pending", "approved", "hidden"].includes(status)) {
        return res.status(400).json({
          message: "Invalid review status",
        });
      }

      filter.status = status;
    }

    // Filter by rating
    if (rating) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }

      filter.rating = numericRating;
    }

    // Search reviews
    if (search && search.trim()) {
      const escapedSearch = search
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { foodName: searchRegex },
        { comment: searchRegex },
      ];
    }

    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      message: "Reviews retrieved successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET ADMIN REVIEWS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve reviews",
    });
  }
});

// ==========================================
// 2. UPDATE REVIEW STATUS
// PATCH /api/admin/reviews/:id/status
// ==========================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const allowedStatuses = [
      "pending",
      "approved",
      "hidden",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid review status",
        allowedStatuses,
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email");

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: `Review ${status} successfully`,
      review,
    });
  } catch (error) {
    console.error("UPDATE REVIEW STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update review status",
    });
  }
});

// ==========================================
// 3. ADD OR UPDATE ADMIN REPLY
// PATCH /api/admin/reviews/:id/reply
// ==========================================

router.patch("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    if (
      typeof adminReply !== "string" ||
      adminReply.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Please enter an admin reply",
      });
    }

    if (adminReply.trim().length > 1000) {
      return res.status(400).json({
        message: "Reply cannot exceed 1000 characters",
      });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { adminReply: adminReply.trim() },
      {
        new: true,
        runValidators: true,
      }
    ).populate("user", "name email");

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Admin reply saved successfully",
      review,
    });
  } catch (error) {
    console.error("ADMIN REVIEW REPLY ERROR:", error);

    res.status(500).json({
      message: "Failed to save admin reply",
    });
  }
});

// ==========================================
// 4. DELETE REVIEW
// DELETE /api/admin/reviews/:id
// ==========================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid review ID",
      });
    }

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json({
      message: "Review deleted successfully",
      review,
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);

    res.status(500).json({
      message: "Failed to delete review",
    });
  }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
