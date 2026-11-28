
const mongoose = require("mongoose");
require("dotenv").config();

const Food = require("./models/Food");

const foods = [
  {
    productId: 1,
    name: "Loaded Ultimate Cheez Box",
    category: "Cheez Boxes",
    price: 350,
    image: "/src/assets/Loaded%20Ultimate%20Cheez%20Box.png",
    rating: 4.9,
    calories: 680,
    prepTime: 20,
    vegetarian: false,
    popular: 1,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 2,
    name: "Sausage Blast Cheez Box",
    category: "Cheez Boxes",
    price: 260,
    image: "/src/assets/Sausage%20Blast%20Cheez%20Box.png",
    rating: 4.7,
    calories: 590,
    prepTime: 15,
    vegetarian: false,
    popular: 2,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 3,
    name: "Gourmet BBQ Beef Pizza",
    category: "Gourmet Pizza",
    price: 580,
    image: "/src/assets/Gourmet%20BBQ%20Beef%20Pizza.png",
    rating: 4.8,
    calories: 920,
    prepTime: 25,
    vegetarian: false,
    popular: 3,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 4,
    name: "Smoked Cheese Steak Burger",
    category: "Steak Burgers",
    price: 340,
    image: "/src/assets/Smoked%20Cheese%20Steak%20Burger.png",
    rating: 4.8,
    calories: 640,
    prepTime: 18,
    vegetarian: false,
    popular: 4,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 5,
    name: "Oven-Baked Creamy Pasta",
    category: "Oven-Baked Pasta",
    price: 290,
    image: "/src/assets/Oven-Baked%20Creamy%20Pasta.png",
    rating: 4.7,
    calories: 580,
    prepTime: 15,
    vegetarian: false,
    popular: 5,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 6,
    name: "Golden Cheezy Wedges",
    category: "Sides and Drinks",
    price: 160,
    image: "/src/assets/Golden%20Cheezy%20Wedges.png",
    rating: 4.5,
    calories: 340,
    prepTime: 10,
    vegetarian: true,
    popular: 6,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 7,
    name: "Garden Fresh Salad",
    category: "Sides and Drinks",
    price: 190,
    image: "/src/assets/garden-salad.png",
    rating: 4.4,
    calories: 180,
    prepTime: 8,
    vegetarian: true,
    popular: 7,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
  {
    productId: 8,
    name: "Beefy Cheesy Pasta",
    category: "Oven-Baked Pasta",
    price: 320,
    image: "/src/assets/beef-pasta.png",
    rating: 4.6,
    calories: 620,
    prepTime: 18,
    vegetarian: false,
    popular: 8,
    description: "",
    ingredients: [],
    isAvailable: true,
  },
];

async function seedFoods() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const result = await Food.bulkWrite(
      foods.map((food) => ({
        updateOne: {
          filter: { productId: food.productId },
          update: { $setOnInsert: food },
          upsert: true,
        },
      }))
    );

    console.log("Food seeding completed!");
    console.log("New foods inserted:", result.upsertedCount);
    console.log("Existing foods left unchanged:", foods.length - result.upsertedCount);
  } catch (error) {
    console.error("FOOD SEEDING ERROR:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedFoods();
