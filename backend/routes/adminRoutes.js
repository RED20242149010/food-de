
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const Order = require("../models/Order");
const User = require("../models/User");
const Food = require("../models/Food");
const Coupon = require("../models/Coupon");
const RestaurantSettings = require("../models/RestaurantSettings");

const router = express.Router();

// Authentication is handled centrally in server.js
// All /api/admin routes are protected there.

// ==========================================
// IMAGE UPLOAD CONFIGURATION
// ==========================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "foods"
);

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPG, PNG, WEBP and GIF images are allowed.")
      );
    }
  },
});

// ==========================================
// 1. ADMIN DASHBOARD
// GET /api/admin/dashboard
// ==========================================

router.get("/dashboard", async (req, res) => {
  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const [
      totalOrders,
      totalCustomers,
      pendingOrders,
      salesResult,
      averageResult,
      recentOrders,
      topFoods,
    ] = await Promise.all([
      Order.countDocuments(),

      User.countDocuments({ role: "customer" }),

      Order.countDocuments({
        status: {
          $in: [
            "placed",
            "confirmed",
            "preparing",
            "out_for_delivery",
          ],
        },
      }),

      Order.aggregate([
        {
          $match: {
            status: "delivered",
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$total" },
          },
        },
      ]),

      Order.aggregate([
        { $match: { status: "delivered" } },
        {
          $group: {
            _id: null,
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]),

      Order.find()
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-__v"),

      Order.aggregate([
        { $match: { status: "delivered" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            totalSales: {
              $sum: {
                $multiply: ["$items.price", "$items.quantity"],
              },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      message: "Dashboard data retrieved successfully",
      stats: {
        totalSalesYTD: salesResult[0]?.totalSales || 0,
        totalOrders,
        totalCustomers,
        averageOrderValue: Math.round(
          averageResult[0]?.averageOrderValue || 0
        ),
        pendingOrders,
      },
      recentOrders,
      topFoods,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);

    res.status(500).json({
      message: "Failed to load dashboard data",
    });
  }
});

// ==========================================
// 2. GET ALL ORDERS
// GET /api/admin/orders
// ==========================================

router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      message: "Orders retrieved successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("ADMIN ORDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve orders",
    });
  }
});

// ==========================================
// 3. UPDATE ORDER STATUS
// PATCH /api/admin/orders/:id/status
// ==========================================

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
        allowedStatuses,
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update order status",
    });
  }
});

// ==========================================
// 4. GET ALL CUSTOMERS
// GET /api/admin/customers
// ==========================================

router.get("/customers", async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password -__v")
      .sort({ createdAt: -1 });

    const customerIds = customers.map(
      (customer) => customer._id
    );

    const orders = await Order.find({
      user: { $in: customerIds },
    })
      .select(
        "_id user total status createdAt items paymentMethod paymentStatus"
      )
      .sort({ createdAt: -1 });

    const ordersByCustomer = {};

    orders.forEach((order) => {
      const customerId = String(order.user);

      if (!ordersByCustomer[customerId]) {
        ordersByCustomer[customerId] = [];
      }

      ordersByCustomer[customerId].push(order);
    });

    const customersWithOrders = customers.map((customer) => {
      const customerOrders =
        ordersByCustomer[String(customer._id)] || [];

      const totalOrders = customerOrders.length;

      const totalSpent = customerOrders
        .filter((order) => order.status === "delivered")
        .reduce(
          (sum, order) => sum + Number(order.total || 0),
          0
        );

      return {
        ...customer.toObject(),
        totalOrders,
        totalSpent,
        orders: customerOrders,
      };
    });

    res.status(200).json({
      message: "Customers retrieved successfully",
      count: customersWithOrders.length,
      customers: customersWithOrders,
    });
  } catch (error) {
    console.error("ADMIN CUSTOMERS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve customers",
      error: error.message,
    });
  }
});

// ==========================================
// 5. GET ALL FOODS
// GET /api/admin/foods
// ==========================================

router.get("/foods", async (req, res) => {
  try {
    const foods = await Food.find().sort({ popular: 1 });

    res.status(200).json({
      message: "Foods retrieved successfully",
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error("GET FOODS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve foods",
    });
  }
});

// ==========================================
// 6. UPLOAD FOOD IMAGE
// POST /api/admin/foods/upload
// ==========================================

router.post("/foods/upload", (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      console.error("FOOD IMAGE UPLOAD ERROR:", error);

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Image must be smaller than 5 MB.",
          });
        }
      }

      return res.status(400).json({
        message: error.message || "Image upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image.",
      });
    }

    const imagePath = `/uploads/foods/${req.file.filename}`;

    res.status(200).json({
      message: "Food image uploaded successfully!",
      image: imagePath,
    });
  });
});

// ==========================================
// 7. ADD NEW FOOD
// POST /api/admin/foods
// ==========================================

router.post("/foods", async (req, res) => {
  try {
    const {
      productId,
      name,
      category,
      price,
      image,
      rating,
      calories,
      prepTime,
      vegetarian,
      popular,
      description,
      ingredients,
      isAvailable,
    } = req.body;

    if (
      productId === undefined ||
      !name ||
      !category ||
      price === undefined
    ) {
      return res.status(400).json({
        message: "Product ID, name, category and price are required",
      });
    }

    const existingFood = await Food.findOne({ productId });

    if (existingFood) {
      return res.status(409).json({
        message: "This product ID already exists",
      });
    }

    const food = await Food.create({
      productId,
      name,
      category,
      price,
      image,
      rating,
      calories,
      prepTime,
      vegetarian,
      popular,
      description,
      ingredients,
      isAvailable,
    });

    res.status(201).json({
      message: "Food added successfully",
      food,
    });
  } catch (error) {
    console.error("ADD FOOD ERROR:", error);

    res.status(500).json({
      message: "Failed to add food",
      error: error.message,
    });
  }
});

// ==========================================
// 8. UPDATE FOOD
// PUT /api/admin/foods/:id
// ==========================================

router.put("/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const allowedFields = [
      "productId",
      "name",
      "category",
      "price",
      "image",
      "rating",
      "calories",
      "prepTime",
      "vegetarian",
      "popular",
      "description",
      "ingredients",
      "isAvailable",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const food = await Food.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.status(200).json({
      message: "Food updated successfully",
      food,
    });
  } catch (error) {
    console.error("UPDATE FOOD ERROR:", error);

    res.status(500).json({
      message: "Failed to update food",
      error: error.message,
    });
  }
});

// ==========================================
// 9. DELETE FOOD
// DELETE /api/admin/foods/:id
// ==========================================

router.delete("/foods/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid food ID",
      });
    }

    const food = await Food.findByIdAndDelete(id);

    if (!food) {
      return res.status(404).json({
        message: "Food not found",
      });
    }

    res.status(200).json({
      message: "Food deleted successfully",
      food,
    });
  } catch (error) {
    console.error("DELETE FOOD ERROR:", error);

    res.status(500).json({
      message: "Failed to delete food",
    });
  }
});

// ==========================================
// 10. GET ALL COUPONS
// GET /api/admin/coupons
// ==========================================

router.get("/coupons", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Coupons retrieved successfully",
      count: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error("ADMIN COUPONS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve coupons",
    });
  }
});

// ==========================================
// 11. ADD NEW COUPON
// POST /api/admin/coupons
// ==========================================

router.post("/coupons", async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (
      !code ||
      !discountType ||
      discountValue === undefined ||
      !expiryDate
    ) {
      return res.status(400).json({
        message: "Code, discount type, discount value and expiry date are required",
      });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount: maxDiscount === "" ? null : maxDiscount,
      expiryDate,
      usageLimit: usageLimit === "" ? null : usageLimit,
      isActive,
    });

    res.status(201).json({
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This coupon code already exists",
      });
    }

    res.status(400).json({
      message: error.message || "Failed to create coupon",
    });
  }
});

// ==========================================
// 12. UPDATE COUPON
// PUT /api/admin/coupons/:id
// ==========================================

router.put("/coupons/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid coupon ID",
      });
    }

    const allowedFields = [
      "code",
      "discountType",
      "discountValue",
      "minOrderAmount",
      "maxDiscount",
      "expiryDate",
      "usageLimit",
      "isActive",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] =
          req.body[field] === "" &&
          ["maxDiscount", "usageLimit"].includes(field)
            ? null
            : req.body[field];
      }
    });

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("UPDATE COUPON ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This coupon code already exists",
      });
    }

    res.status(400).json({
      message: error.message || "Failed to update coupon",
    });
  }
});

// ==========================================
// 13. DELETE COUPON
// DELETE /api/admin/coupons/:id
// ==========================================

router.delete("/coupons/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      message: "Coupon deleted successfully",
      coupon,
    });
  } catch (error) {
    console.error("DELETE COUPON ERROR:", error);

    res.status(500).json({
      message: "Failed to delete coupon",
    });
  }
});

// ==========================================
// 14. GET ADMIN SETTINGS
// GET /api/admin/settings
// ==========================================

router.get("/settings", async (req, res) => {
  try {
    const admin = await User.findById(req.userId).select(
      "-password -__v"
    );

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    const settings = await RestaurantSettings.findOneAndUpdate(
      { key: "main" },
      { $setOnInsert: { key: "main" } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Settings retrieved successfully.",
      admin,
      settings,
    });
  } catch (error) {
    console.error("GET ADMIN SETTINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to retrieve settings.",
    });
  }
});

// ==========================================
// 15. UPDATE ADMIN PROFILE
// PUT /api/admin/settings/profile
// ==========================================

router.put("/settings/profile", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        message: "Name and email are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already being used.",
      });
    }

    const admin = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || "",
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -__v");

    if (!admin) {
      return res.status(404).json({
        message: "Admin account not found.",
      });
    }

    res.status(200).json({
      message: "Admin profile updated successfully.",
      admin,
    });
  } catch (error) {
    console.error("UPDATE ADMIN PROFILE ERROR:", error);

    res.status(500).json({
      message: "Failed to update admin profile.",
    });
  }
});

// ==========================================
// 16. UPDATE RESTAURANT SETTINGS
// PUT /api/admin/settings/restaurant
// ==========================================

router.put("/settings/restaurant", async (req, res) => {
  try {
    const allowedFields = [
      "restaurantName",
      "address",
      "phone",
      "email",
      "deliveryFee",
      "minimumOrder",
      "estimatedDeliveryTime",
      "acceptingOrders",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (
      updates.restaurantName !== undefined &&
      !String(updates.restaurantName).trim()
    ) {
      return res.status(400).json({
        message: "Restaurant name cannot be empty.",
      });
    }

    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();
    }

    const settings = await RestaurantSettings.findOneAndUpdate(
      { key: "main" },
      {
        $set: updates,
        $setOnInsert: { key: "main" },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Restaurant settings updated successfully.",
      settings,
    });
  } catch (error) {
    console.error("UPDATE RESTAURANT SETTINGS ERROR:", error);

    res.status(400).json({
      message: error.message || "Failed to update restaurant settings.",
    });
  }
});

// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
