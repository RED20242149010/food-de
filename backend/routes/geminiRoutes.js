
const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const Food = require("../models/Food");
const Order = require("../models/Order");

const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// GEMINI CONFIGURATION
// ======================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];
const MODEL_TIMEOUT = 30000;

// ======================================================
// GENERATE GEMINI RESPONSE WITH AUTOMATIC FALLBACK
// ======================================================

async function generateAIResponse(prompt) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    let timeoutId;

    try {
      console.log("=================================");
      console.log(`Trying Gemini model: ${model}`);

      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),

        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            const error = new Error("Gemini request timed out");
            error.isTimeout = true;
            reject(error);
          }, MODEL_TIMEOUT);
        }),
      ]);

      if (!response || !response.text) {
        throw new Error(`${model} returned an empty response.`);
      }

      console.log(`Gemini response successful using: ${model}`);

      return {
        text: response.text,
        model,
      };
    } catch (error) {
      lastError = error;

      const status = Number(error.status || error.code);
      const isTimeout = error.isTimeout === true;

      console.error(`Gemini model ${model} failed.`);
      console.error("Status:", status || "Unknown");
      console.error("Error:", error.message);

      if (
        !isTimeout &&
        !RETRYABLE_STATUS_CODES.includes(status)
      ) {
        throw error;
      }

      console.log("Switching to the next Gemini model...");
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  throw lastError;
}

// ======================================================
// GET AVAILABLE MENU FROM MONGODB
// ======================================================

async function getAvailableMenu() {
  const foods = await Food.find({
    isAvailable: true,
  })
    .select(
      "productId name category price description ingredients calories vegetarian rating popular isRecommended prepTime"
    )
    .sort({ category: 1, name: 1 })
    .lean();

  const menu = foods.map((food) => ({
    productId: food.productId,
    name: food.name,
    category: food.category,
    price: food.price,
    description: food.description || "",
    ingredients: food.ingredients || [],
    calories: food.calories,
    vegetarian: food.vegetarian,
    rating: food.rating,
    popular: food.popular,
    recommended: food.isRecommended,
    preparationTime: food.prepTime,
  }));

  console.log("=================================");
  console.log("AI Assistant - Foods retrieved:", menu.length);

  return menu;
}

// ======================================================
// EXTRACT CUSTOMER BUDGET
// ======================================================

function extractBudget(message) {
  const budgetMatch =
    message.match(
      /(?:under|below|within|budget(?:\s+of)?|less than|up to)\s*(?:৳|tk\.?|taka)?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    ) ||
    message.match(
      /(?:৳|tk\.?|taka)\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i
    );

  if (!budgetMatch) {
    return null;
  }

  const budget = Number(budgetMatch[1].replace(/,/g, ""));

  return Number.isFinite(budget) && budget > 0
    ? budget
    : null;
}

// ======================================================
// DATABASE-BASED MENU FALLBACK
// ======================================================

function buildMenuFallback(message, menu) {
  const question = message.toLowerCase();

  if (!menu.length) {
    return "Sorry! There are currently no available food items.";
  }

  // Budget recommendation

  const budget = extractBudget(message);

  if (budget !== null) {
    const matchingFoods = menu
      .filter((food) => Number(food.price) <= budget)
      .sort((a, b) => Number(a.price) - Number(b.price));

    if (!matchingFoods.length) {
      return `Sorry! We couldn't find any available food items within ৳${budget}.`;
    }

    return (
      `Here are ${matchingFoods.length} food items within your budget of ৳${budget}:\n\n` +
      matchingFoods
        .map((food, index) =>
          `${index + 1}. ${food.name} — ৳${food.price}`
        )
        .join("\n")
    );
  }

  // Vegetarian food

  if (/vegetarian|vegan|meatless/i.test(question)) {
    const foods = menu.filter((food) => food.vegetarian === true);

    if (!foods.length) {
      return "Sorry! There are currently no vegetarian items available.";
    }

    return (
      "Here are our available vegetarian options:\n\n" +
      foods
        .map((food) => `${food.name} — ৳${food.price}`)
        .join("\n")
    );
  }

  // Lowest calorie food

  if (/calorie|calories|low.calorie|healthier|healthy/i.test(question)) {
    const foods = menu
      .filter((food) => Number.isFinite(Number(food.calories)))
      .sort((a, b) => Number(a.calories) - Number(b.calories))
      .slice(0, 5);

    if (!foods.length) {
      return "Sorry! Calorie information is not available for the current menu.";
    }

    return (
      "Here are some of our lowest-calorie menu items:\n\n" +
      foods
        .map(
          (food) =>
            `${food.name} — ${food.calories} calories — ৳${food.price}`
        )
        .join("\n")
    );
  }

  // Recommended foods

  if (/recommend|popular|best food|what should i eat/i.test(question)) {
    let foods = menu.filter((food) => food.recommended === true);

    if (!foods.length) {
      foods = [...menu]
        .filter((food) => Number(food.popular) > 0)
        .sort((a, b) => Number(a.popular) - Number(b.popular))
        .slice(0, 5);
    }

    if (!foods.length) {
      foods = menu.slice(0, 5);
    }

    return (
      "Here are some FourCheez food recommendations:\n\n" +
      foods
        .map((food) => `${food.name} — ৳${food.price}`)
        .join("\n")
    );
  }

  // General menu fallback

  return (
    "Here are the currently available FourCheez menu items:\n\n" +
    menu
      .map((food) => {
        const calories =
          food.calories !== undefined && food.calories !== null
            ? ` — ${food.calories} calories`
            : "";

        return `${food.name} — ৳${food.price}${calories}`;
      })
      .join("\n") +
    "\n\nYou can ask me about prices, vegetarian food, calories, or recommendations."
  );
}

// ======================================================
// POST /api/ai/chat
// PUBLIC MENU-BASED AI ASSISTANT
// ======================================================

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    const menu = await getAvailableMenu();

    if (!menu.length) {
      return res.status(404).json({
        success: false,
        message: "There are currently no available menu items.",
      });
    }

    // Direct database answer for budget questions

    const budget = extractBudget(message);

    if (budget !== null) {
      return res.json({
        success: true,
        reply: buildMenuFallback(message, menu),
        model: "database",
      });
    }

    const prompt = `
You are the official FourCheez AI Food Assistant.

Use the current FourCheez menu retrieved from MongoDB.

STRICT RULES:

1. Only recommend food items in the database.
2. Never invent product names or prices.
3. Always use the exact database price.
4. Display prices in Bangladeshi Taka (৳).
5. Recommend only vegetarian items when vegetarian food is requested.
6. Respect the requested food category.
7. Never invent missing ingredients or descriptions.
8. You may compare calories, ratings and preparation times.
9. Never claim to have placed, cancelled or changed an order.
10. Be friendly, natural and concise.

DATABASE MENU:

${JSON.stringify(menu, null, 2)}

CUSTOMER QUESTION:

${message.trim()}

Answer using only the supplied database information.
`;

    try {
      console.log("AI Assistant - Sending menu to Gemini...");

      const result = await generateAIResponse(prompt);

      return res.json({
        success: true,
        reply: result.text,
        model: result.model,
      });
    } catch (geminiError) {
      console.error(
        "Gemini unavailable. Using database menu fallback:",
        geminiError.message
      );

      return res.json({
        success: true,
        reply: buildMenuFallback(message, menu),
        model: "database-fallback",
      });
    }
  } catch (error) {
    console.error("AI menu assistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the menu. Please try again.",
    });
  }
});

// ======================================================
// ORDER STATUS FORMATTING
// ======================================================

function getOrderStatusText(status) {
  const statuses = {
    placed: "Order placed - We have received your order.",
    confirmed: "Confirmed - The restaurant has accepted your order.",
    preparing: "Preparing - Your food is being prepared.",
    out_for_delivery: "Out for delivery - Your order is on its way.",
    delivered: "Delivered - Your order has been delivered.",
    cancelled: "Cancelled - This order has been cancelled.",
  };

  return statuses[status] || `Current status: ${status || "Unknown"}`;
}

function getPaymentStatusText(status) {
  const statuses = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
  };

  return statuses[status] || status || "Unknown";
}

function getPaymentMethodText(method) {
  const methods = {
    cash: "Cash on Delivery",
    cash_on_delivery: "Cash on Delivery",
    bkash: "bKash",
    nagad: "Nagad",
    card: "Card",
  };

  return methods[method] || method || "Not specified";
}

function formatOrderDate(date) {
  if (!date) {
    return "Date not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ======================================================
// BUILD ORDER ANSWER DIRECTLY FROM MONGODB
// NO GEMINI REQUIRED
// ======================================================

function buildOrderDatabaseAnswer(message, orders) {
  const question = message.toLowerCase();

  if (!orders.length) {
    return "You don't have any orders yet. Once you place an order with FourCheez, you can ask me about its status and details.";
  }

  const latestOrder = orders[0];

  const orderReference = (order) =>
    order._id
      ? String(order._id).slice(-6).toUpperCase()
      : "Unavailable";

  const formatItems = (order) => {
    if (!order.items || !order.items.length) {
      return "Item information is unavailable.";
    }

    return order.items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} — ৳${item.price}`
      )
      .join("\n");
  };

  // Order history questions

  if (
    /history|previous orders|past orders|all orders|how many orders|recent orders/i.test(
      question
    )
  ) {
      const orderList = orders
        .map((order, index) => {
          return (
            `${index + 1}. Order #${orderReference(order)}\n` +
            `Date: ${formatOrderDate(order.createdAt)}\n` +
            `Status: ${getOrderStatusText(order.status)}\n` +
            `Total: ৳${order.total ?? 0}`
          );
        })
        .join("\n\n");

      return (
        `I found ${orders.length} of your most recent orders:\n\n` +
        orderList +
        "\n\nThese are your latest available order records."
      );
  }

  // Latest order details

  let reply = `Here are the details of your latest FourCheez order:\n\n`;

  reply += `Order reference: #${orderReference(latestOrder)}\n`;
  reply += `Order date: ${formatOrderDate(latestOrder.createdAt)}\n\n`;

  if (/item|food|what did i order|what have i ordered/i.test(question)) {
    reply += `Your ordered items:\n${formatItems(latestOrder)}\n\n`;
  }

  if (/payment|paid|pay|method|cash|bkash|nagad|card/i.test(question)) {
    reply += `Payment method: ${getPaymentMethodText(latestOrder.paymentMethod)}\n`;
    reply += `Payment status: ${getPaymentStatusText(latestOrder.paymentStatus)}\n\n`;
  }

  reply += `Order status: ${getOrderStatusText(latestOrder.status)}\n`;
  reply += `Order total: ৳${latestOrder.total ?? 0}\n`;

  if (
    !/item|food|what did i order|what have i ordered|payment|paid|pay|method|cash|bkash|nagad|card/i.test(
      question
    )
  ) {
    reply += `\nOrdered items:\n${formatItems(latestOrder)}\n`;
    reply += `Payment method: ${getPaymentMethodText(latestOrder.paymentMethod)}\n`;
    reply += `Payment status: ${getPaymentStatusText(latestOrder.paymentStatus)}\n`;
  }

  reply += "\nYou can visit My Orders or Order Tracking for more details.";

  return reply;
}

// ======================================================
// POST /api/ai/orders
// AUTHENTICATED CUSTOMER ORDER ASSISTANT
// ANSWERS DIRECTLY FROM MONGODB
// ======================================================

router.post("/orders", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message.",
      });
    }

    // Only customer accounts can access order assistance.

    if (
      String(req.user?.role || "").toLowerCase() !== "customer"
    ) {
      return res.status(403).json({
        success: false,
        message: "Only customer accounts can access order assistance.",
      });
    }

    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication is required.",
      });
    }

    // Retrieve only the logged-in customer's orders.

    const orders = await Order.find({
      user: userId,
    })
      .select(
        "_id items subtotal discount deliveryFee tax total status paymentStatus paymentMethod createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log(
      "AI Order Assistant - Orders retrieved:",
      orders.length
    );

    // Answer directly using MongoDB.
    // No Gemini API request is made here.

    const reply = buildOrderDatabaseAnswer(
      message.trim(),
      orders
    );

    console.log("AI Order Assistant - Database answer generated.");

    return res.json({
      success: true,
      reply,
      model: "database",
    });
  } catch (error) {
    console.error("AI order assistant error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your orders. Please try again.",
    });
  }
});

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
