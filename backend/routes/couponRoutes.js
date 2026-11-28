
const express = require("express");
const router = express.Router();

const Coupon = require("../models/Coupon");

// POST /api/coupons/validate
router.post("/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    // Check required fields
    if (!code || subtotal === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and subtotal are required.",
      });
    }

    const orderSubtotal = Number(subtotal);

    if (!Number.isFinite(orderSubtotal) || orderSubtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid subtotal.",
      });
    }

    // Find coupon (case-insensitive because codes are stored uppercase)
    const coupon = await Coupon.findOne({
      code: String(code).trim().toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is inactive.",
      });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        success: false,
        message: "This coupon usage limit has been reached.",
      });
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ৳${coupon.minOrderAmount}.`,
      });
    }

    // Calculate discount on the backend
    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (orderSubtotal * coupon.discountValue) / 100;

      if (coupon.maxDiscount !== null) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    // A discount cannot exceed the subtotal
    discount = Math.min(discount, orderSubtotal);
    discount = Math.round(discount * 100) / 100;

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully!",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      subtotal: orderSubtotal,
      discount,
      finalSubtotal: orderSubtotal - discount,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while validating coupon.",
    });
  }
});

module.exports = router;
