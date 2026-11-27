
const mongoose = require("mongoose");

const restaurantSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
    },

    restaurantName: {
      type: String,
      default: "FourCheez",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedDeliveryTime: {
      type: Number,
      default: 30,
      min: 1,
    },

    acceptingOrders: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "RestaurantSettings",
  restaurantSettingsSchema
);
