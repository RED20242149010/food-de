
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const User = require("../models/User");
const Coupon = require("../models/Coupon");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// PROTECT ALL ORDER ROUTES
// ONLY CUSTOMER ACCOUNTS CAN USE THESE ROUTES
// ======================================================

router.use(authenticateToken);

router.use((req, res, next) => {
  if (!req.user || req.user.role !== "customer") {
    return res.status(403).json({
      message:
        "Access denied. Only customer accounts can use ordering services.",
    });
  }

  next();
});

// ======================================================
// POST /api/orders/validate-coupon
// VALIDATE COUPON BEFORE ORDERING
// ======================================================

router.post("/validate-coupon", async (req, res) => {
  try {
    const { promoCode, subtotal } = req.body;

    const normalizedCode =
      typeof promoCode === "string"
        ? promoCode.trim().toUpperCase()
        : "";

    const orderSubtotal = Number(subtotal);

    if (!normalizedCode) {
      return res.status(400).json({
        message: "Please enter a coupon code.",
      });
    }

    if (
      !Number.isFinite(orderSubtotal) ||
      orderSubtotal <= 0
    ) {
      return res.status(400).json({
        message: "Invalid order subtotal.",
      });
    }

    const coupon = await Coupon.findOne({
      code: normalizedCode,
    });

    if (!coupon) {
      return res.status(400).json({
        message: "Invalid coupon code.",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        message: "This coupon is inactive.",
      });
    }

    if (
      !coupon.expiryDate ||
      new Date(coupon.expiryDate).getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: "This coupon has expired.",
      });
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageLimit !== undefined &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      return res.status(400).json({
        message: "This coupon has reached its usage limit.",
      });
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}.`,
      });
    }

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount =
        (orderSubtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === "fixed") {
      discount = coupon.discountValue;
    }

    if (coupon.maxDiscount !== null) {
      discount = Math.min(
        discount,
        coupon.maxDiscount
      );
    }

    discount = Math.min(discount, orderSubtotal);

    return res.status(200).json({
      message: "Coupon applied successfully!",
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);

    return res.status(500).json({
      message: "Unable to validate coupon.",
    });
  }
});

// ======================================================
// POST /api/orders
// PLACE A NEW ORDER
// ======================================================

router.post("/", async (req, res) => {
  let session;

  try {
    const {
      items,
      deliveryAddress,
      paymentMethod,
      promoCode,
    } = req.body;

    // Validate cart

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    // Validate delivery address

    if (
      !deliveryAddress ||
      !deliveryAddress.fullName?.trim() ||
      !deliveryAddress.phone?.trim() ||
      !deliveryAddress.address?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a complete delivery address",
      });
    }

    // Validate payment method

    const allowedPaymentMethods = [
      "cash_on_delivery",
      "bkash",
      "nagad",
      "card",
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // Validate and clean cart items

    const cleanItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(productId) ||
        !Number.isFinite(price) ||
        !Number.isInteger(quantity) ||
        productId <= 0 ||
        price < 0 ||
        quantity < 1 ||
        !item.name?.trim()
      ) {
        return res.status(400).json({
          message: "Invalid product information in your cart",
        });
      }

      cleanItems.push({
        productId,
        name: item.name.trim(),
        price,
        quantity,
        image: item.image || "",
      });
    }

    // Check whether user exists

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please log in again.",
      });
    }

    // Calculate subtotal

    const subtotal = cleanItems.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );

    let discount = 0;
    let appliedCoupon = null;

    const normalizedPromoCode =
      typeof promoCode === "string"
        ? promoCode.trim().toUpperCase()
        : "";

    // ==================================================
    // COUPON VALIDATION
    // ==================================================

    if (normalizedPromoCode) {
      const coupon = await Coupon.findOne({
        code: normalizedPromoCode,
      });

      if (!coupon) {
        return res.status(400).json({
          message: "Invalid coupon code",
        });
      }

      if (!coupon.isActive) {
        return res.status(400).json({
          message: "This coupon is inactive",
        });
      }

      if (
        !coupon.expiryDate ||
        new Date(coupon.expiryDate).getTime() <= Date.now()
      ) {
        return res.status(400).json({
          message: "This coupon has expired",
        });
      }

      if (
        coupon.usageLimit !== null &&
        coupon.usageLimit !== undefined &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          message: "This coupon has reached its usage limit",
        });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
        });
      }

      // Calculate discount

      if (coupon.discountType === "percentage") {
        discount =
          (subtotal * coupon.discountValue) / 100;
      } else if (coupon.discountType === "fixed") {
        discount = coupon.discountValue;
      }

      // Apply maximum discount limit

      if (coupon.maxDiscount !== null) {
        discount = Math.min(
          discount,
          coupon.maxDiscount
        );
      }

      // Discount cannot exceed subtotal

      discount = Math.min(discount, subtotal);

      appliedCoupon = coupon;
    }

    // ==================================================
    // CALCULATE FINAL AMOUNT
    // ==================================================

    const deliveryFee = 30;
    const tax = 15;

    const total = Math.max(
      0,
      subtotal - discount + deliveryFee + tax
    );

    // ==================================================
    // SAVE ORDER AND UPDATE COUPON
    // ==================================================

    session = await mongoose.startSession();

    let savedOrder;

    await session.withTransaction(async () => {
      // Increase coupon usage only when order is saved

      if (appliedCoupon) {
        const couponConditions = {
          _id: appliedCoupon._id,
          isActive: true,
          usedCount: appliedCoupon.usedCount,
          expiryDate: { $gt: new Date() },
        };

        if (
          appliedCoupon.usageLimit !== null &&
          appliedCoupon.usageLimit !== undefined
        ) {
          couponConditions.$expr = {
            $lt: ["$usedCount", "$usageLimit"],
          };
        }

        const updatedCoupon =
          await Coupon.findOneAndUpdate(
            couponConditions,
            {
              $inc: {
                usedCount: 1,
              },
            },
            {
              returnDocument: "after",
              session,
            }
          );

        if (!updatedCoupon) {
          throw new Error("COUPON_UNAVAILABLE");
        }
      }

      // Prepare order data

      const orderData = {
        user: req.userId,
        items: cleanItems,

        deliveryAddress: {
          fullName: deliveryAddress.fullName.trim(),
          phone: deliveryAddress.phone.trim(),
          address: deliveryAddress.address.trim(),
          area: deliveryAddress.area || "",
          instructions: deliveryAddress.instructions || "",
        },

        paymentMethod,

        promoCode: normalizedPromoCode,

        subtotal,
        discount,
        deliveryFee,
        tax,
        total,

        status: "placed",
        paymentStatus: "pending",
      };

      const createdOrders = await Order.create(
        [orderData],
        { session }
      );

      savedOrder = createdOrders[0];
    });

    return res.status(201).json({
      message: "Order placed successfully!",
      order: savedOrder,
      subtotal,
      discount,
      deliveryFee,
      tax,
      total,
    });
  } catch (error) {
    if (error.message === "COUPON_UNAVAILABLE") {
      return res.status(400).json({
        message:
          "This coupon is no longer available. Please try again.",
      });
    }

    console.error("PLACE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to place order",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// ======================================================
// GET /api/orders
// GET ALL ORDERS FOR LOGGED-IN CUSTOMER
// ======================================================

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch orders",
    });
  }
});

// ======================================================
// GET /api/orders/:id
// GET ONE ORDER
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.json({
      order,
    });
  } catch (error) {
    console.error("GET SINGLE ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch order",
    });
  }
});

// ======================================================
// PATCH /api/orders/:id/cancel
// CANCEL AN ORDER
// ======================================================

router.patch("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status !== "placed") {
      return res.status(400).json({
        message: "This order can no longer be cancelled",
      });
    }

    order.status = "cancelled";

    await order.save();

    return res.json({
      message: "Order cancelled successfully!",
      order,
    });
  } catch (error) {
    console.error("CANCEL ORDER ERROR:", error);

    return res.status(500).json({
      message: "Unable to cancel order",
    });
  }
});

module.exports = router;
