
const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    // Keeps compatibility with your existing Menu.jsx product IDs.
    productId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    calories: {
      type: Number,
      default: 0,
      min: 0,
    },

    prepTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    vegetarian: {
      type: Boolean,
      default: false,
    },

    popular: {
      type: Number,
      default: 0,
    },

    // Admin recommendation setting
    isRecommended: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    ingredients: {
      type: [String],
      default: [],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Food", foodSchema);
