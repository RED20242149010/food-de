
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    productId: {
      type: Number,
      required: true,
    },

    foodName: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
      index: true,
    },

    adminReply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// A customer can review a particular food only once
// for each delivered order.
reviewSchema.index(
  {
    user: 1,
    orderId: 1,
    productId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);
