
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartTemp";
import "./AIAssistant.css";

import beefPastaImage from "../../assets/beef-pasta.png";

// Actual products from your Menu.jsx
const aiMenuProducts = [
  {
    id: 1,
    name: "Loaded Ultimate Cheez Box",
    category: "Cheez Boxes",
    price: 350,
    calories: 680,
    vegetarian: false,
    description:
      "Gourmet crisp chicken pops, double sausage, gold cheese sauce pool over golden New Market fries.",
    ingredients: ["Chicken pops", "Sausage", "Golden fries", "Cheese sauce"],
  },
  {
    id: 2,
    name: "Sausage Blast Cheez Box",
    category: "Cheez Boxes",
    price: 260,
    calories: 590,
    vegetarian: false,
    description:
      "Triple premium sliced sausages, crisp potato wedges, loaded with our trademark cheddar pool.",
    ingredients: ["Sausages", "Potato wedges", "Cheddar cheese", "Seasoning"],
  },
  {
    id: 3,
    name: "Gourmet BBQ Beef Pizza",
    category: "Gourmet Pizza",
    price: 580,
    calories: 920,
    vegetarian: false,
    description:
      "Fresh thin crust pizza with shredded BBQ beef brisket, bell peppers, mozzarella, and gouda cheese swirl.",
    ingredients: [
      "Pizza crust",
      "BBQ beef",
      "Bell peppers",
      "Mozzarella",
      "Gouda cheese",
    ],
  },
  {
    id: 4,
    name: "Smoked Cheese Steak Burger",
    category: "Steak Burgers",
    price: 340,
    calories: 640,
    vegetarian: false,
    description:
      "Premium beef patty, caramelized onions, smoked provolone cheese, and 4Cheez signature burger sauce.",
    ingredients: [
      "Beef patty",
      "Burger bun",
      "Smoked cheese",
      "Onions",
      "Burger sauce",
    ],
  },
  {
    id: 5,
    name: "Oven-Baked Creamy Pasta",
    category: "Oven-Baked Pasta",
    price: 290,
    calories: 580,
    vegetarian: false,
    description:
      "White sauce baked pasta with tender chicken, mushrooms, and a deep layer of caramelized parmesan cheese.",
    ingredients: [
      "Pasta",
      "White sauce",
      "Chicken",
      "Mushrooms",
      "Parmesan cheese",
    ],
  },
  {
    id: 6,
    name: "Golden Cheezy Wedges",
    category: "Sides and Drinks",
    price: 160,
    calories: 340,
    vegetarian: true,
    description:
      "Thick-cut crispy seasoned potato wedges drizzled with warm jalapeno cheese dip.",
    ingredients: ["Potato wedges", "Cheese sauce", "Jalapeno", "Seasoning"],
  },
  {
    id: 7,
    name: "Garden Fresh Salad",
    category: "Sides and Drinks",
    price: 190,
    calories: 180,
    vegetarian: true,
    description:
      "A fresh garden salad with crisp vegetables and a light dressing.",
    ingredients: [
      "Lettuce",
      "Tomatoes",
      "Cucumber",
      "Fresh vegetables",
      "Dressing",
    ],
  },
  {
    id: 8,
    name: "Beefy Cheesy Pasta",
    category: "Oven-Baked Pasta",
    price: 320,
    calories: 620,
    vegetarian: false,
    description:
      "Rich, creamy pasta with savory beef and melted cheese.",
    ingredients: ["Pasta", "Beef", "Creamy sauce", "Melted cheese"],
  },
];

// The recommendation now uses a real menu product.
const recommendedProduct = aiMenuProducts.find(
  (product) => product.id === 5
);

const recommendedFood = {
  ...recommendedProduct,
  image: beefPastaImage,
  rating: 4.8,
  time: 15,
};

const quickSuggestions = [
  "What can I eat under ৳300?",
  "Suggest a lower-calorie meal",
  "What should I order based on my previous orders?",
];

// Detect budget questions and answer using actual menu prices.
function getBudgetAnswer(question) {
  const isBudgetQuestion =
    /(under|below|within|less than|maximum|max|budget|at most|up to)/i.test(
      question
    );

  if (!isBudgetQuestion) return null;

  const amountMatch = question.match(/(?:৳|tk\.?|taka\s*)\s*(\d+)/i) ||
    question.match(/(\d+)\s*(?:taka|tk|৳)/i);

  if (!amountMatch) return null;

  const budget = Number(amountMatch[1]);

  if (!Number.isFinite(budget)) return null;

  const matchingProducts = aiMenuProducts.filter(
    (product) => product.price <= budget
  );

  if (matchingProducts.length === 0) {
    return `Sorry! We don't currently have any products priced at or below ৳${budget}.`;
  }

  const productList = matchingProducts
    .map(
      (product) =>
        `• ${product.name} — ৳${product.price}\n  ${product.description}`
    )
    .join("\n\n");

  return `Here are all the 4Cheez products you can get within ৳${budget}:\n\n${productList}\n\nMy recommendation: ${matchingProducts[0].name} at ৳${matchingProducts[0].price}.`;
}

function AIAssistant() {
  const { addToCart, cartCount } = useCart();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      text: "Hello! Welcome to 4Cheez Chef Assistant! 🧀 I'm powered by Gemini. Ask me about our food, ingredients, prices, or recommendations!",
    },
  ]);

  const sendMessage = async (text = input) => {
    const question = text.trim();

    if (!question || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      text: question,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");

    // Answer budget questions directly from the real menu.
    const budgetAnswer = getBudgetAnswer(question);

    if (budgetAnswer) {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          type: "assistant",
          text: budgetAnswer,
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: question,
            products: aiMenuProducts,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong. Please try again."
        );
      }

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          type: "assistant",
          text:
            data.reply ||
            "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("AI Assistant error:", error);

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          type: "assistant",
          text:
            error.message ||
            "Sorry, I couldn't connect to Gemini. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(recommendedFood);
    setAdded(true);
  };

  return (
    <main className="ai-page">
      <div className="ai-container">
        <section className="ai-chat-column">
          <header className="ai-assistant-heading">
            <div className="ai-logo">4</div>

            <div>
              <h1>4Cheez Chef Assistant</h1>
              <p>Powered by Gemini</p>
            </div>

            <span className="ai-online-status">
              {isLoading ? "THINKING..." : "ONLINE"}
            </span>
          </header>

          <section
            className="ai-chat-window"
            aria-label="Chef assistant conversation"
          >
            <div className="ai-messages">
              {messages.map((message) => (
                <article
                  className={`ai-message ${
                    message.type === "user"
                      ? "ai-user-message"
                      : "ai-chef-message"
                  }`}
                  key={message.id}
                >
                  <p style={{ whiteSpace: "pre-line" }}>
                    {message.text}
                  </p>
                </article>
              ))}

              {isLoading && (
                <article
                  className="ai-message ai-chef-message"
                  aria-live="polite"
                >
                  <p>Gemini Chef is preparing your answer... 🧀</p>
                </article>
              )}
            </div>
          </section>

          <section className="ai-quick-suggestions">
            <h2>QUICK SUGGESTIONS</h2>

            <div className="ai-suggestion-list">
              {quickSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <form
            className="ai-input-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Gemini Chef for customized cheesiness..."
              aria-label="Ask the chef assistant"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Thinking..." : "Send Ask"}
            </button>
          </form>
        </section>

        <aside className="ai-recommendation-column">
          <h2>Assistant Recommendations</h2>

          <article className="ai-food-card">
            <div className="ai-food-image-wrapper">
              <img
                src={recommendedFood.image}
                alt={recommendedFood.name}
                className="ai-food-image"
              />
            </div>

            <div className="ai-food-card-content">
              <div className="ai-food-card-meta">
                <span className="ai-recommendation-badge">
                  TOP RECS FOR YOU
                </span>

                <span className="ai-rating">
                  <span>★</span> {recommendedFood.rating}
                </span>
              </div>

              <h3>{recommendedFood.name}</h3>

              <p className="ai-food-description">
                {recommendedFood.description}
              </p>

              <div className="ai-recommendation-reason">
                <strong>Why?</strong> A creamy, cheesy pasta option
                made with chicken, mushrooms, and parmesan cheese.
              </div>

              <div className="ai-food-details">
                <span>{recommendedFood.calories} Calories</span>
                <span>{recommendedFood.time} Mins Delivery</span>
              </div>

              <div className="ai-food-card-bottom">
                <strong className="ai-food-price">
                  ৳{recommendedFood.price}
                </strong>

                <button
                  type="button"
                  onClick={handleAddToCart}
                >
                  {added ? "Add Another" : "Add to Cart"}
                </button>
              </div>

              {added && (
                <p className="ai-added-message" role="status">
                  Added to cart! Your cart has {cartCount}{" "}
                  {cartCount === 1 ? "item" : "items"}.{" "}
                  <Link to="/cart">View cart</Link>
                </p>
              )}
            </div>
          </article>
        </aside>
      </div>

      <footer className="ai-footer">
        <div className="ai-footer-top">
          <div className="ai-footer-brand">
            <Link to="/" className="ai-footer-logo">
              <span>4</span>
              <strong>cheez</strong>
            </Link>

            <p>
              Indulge in the cheesiest boxes, gourmet pizzas, and
              oven-baked pastas right in the heart of Khulna. Melty
              goodness delivered straight to your door.
            </p>
          </div>

          <div className="ai-footer-column">
            <h3>OUR MENU</h3>
            <Link to="/menu">Cheez Boxes</Link>
            <Link to="/menu">Gourmet Pizzas</Link>
            <Link to="/menu">Oven-Baked Pastas</Link>
            <Link to="/menu">Steak Burgers</Link>
          </div>

          <div className="ai-footer-column">
            <h3>HELP &amp; SUPPORT</h3>
            <Link to="/account">Track Order</Link>
            <Link to="/ai-assistant">AI Assistant Guide</Link>
            <Link to="/account">Terms of Service</Link>
            <Link to="/account">Privacy Policy</Link>
          </div>

          <div className="ai-footer-column">
            <h3>CONTACT US</h3>
            <span>Khulna New Market, Block B</span>
            <span>Phone: +880 1712-444333</span>
            <span>Email: hello@4cheez.com</span>
          </div>
        </div>

        <div className="ai-footer-bottom">
          <p>
            © {new Date().getFullYear()} 4Cheez Restaurant, Khulna.
            All rights reserved.
          </p>

          <div className="ai-social-links">
            <span>f</span>
            <span>◎</span>
            <span>▷</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default AIAssistant;
