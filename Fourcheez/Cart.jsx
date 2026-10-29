
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartTemp";
import "./Cart.css";

import goldenWedges from "../../assets/Golden Cheezy Wedges.png";
import gardenSalad from "../../assets/garden-salad.png";

function Cart() {
  const {
    cart,
    addToCart,
    changeQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();

  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");

  const navigate = useNavigate();

  const deliveryFee = cart.length > 0 ? 30 : 0;
  const tax = cart.length > 0 ? 15 : 0;
  const discount = promoApplied ? 50 : 0;
  const grandTotal = Math.max(0, cartTotal - discount) + deliveryFee + tax;

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const applyPromo = (event) => {
    event.preventDefault();

    const code = promoInput.trim().toUpperCase();

    if (code !== "CHEEZ50") {
      setPromoApplied(false);
      setPromoMessage("Invalid promo code. Try CHEEZ50.");
      return;
    }

    if (cartTotal < 800) {
      setPromoApplied(false);
      setPromoMessage("Add items worth ৳800 to use this code.");
      return;
    }

    setPromoApplied(true);
    setPromoMessage("৳50 saved! Your promo code is applied.");
  };

  const removePromo = () => {
    setPromoApplied(false);
    setPromoInput("");
    setPromoMessage("");
  };

  const addOnProducts = [
    {
      id: 6,
      name: "Golden Cheezy Wedges",
      description: "Crispy and cheesy",
      price: 160,
      image: goldenWedges,
      category: "Sides",
      rating: 4.6,
      calories: 320,
      time: 12,
      vegetarian: true,
      popular: true,
    },
    {
      id: 7,
      name: "Garden Fresh Salad",
      description: "Fresh and refreshing",
      price: 190,
      image: gardenSalad,
      category: "Salads",
      rating: 4.5,
      calories: 220,
      time: 10,
      vegetarian: true,
      popular: false,
    },
  ];

  return (
    <main className="cart-page">
      <div className="cart-container">
        <nav className="cart-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/menu">Menu</Link>
          <span>/</span>
          <span>Cart</span>
        </nav>

        <header className="cart-page-heading">
          <h1>Review your cheese haul</h1>
          <p>
            {itemCount} {itemCount === 1 ? "item" : "items"} from
            {" "}4Cheez Restaurant, Khulna New Market
          </p>
        </header>

        <div className="cart-layout">
          <section className="cart-main-column">
            {cart.length === 0 ? (
              <div className="cart-empty-state">
                <div className="cart-empty-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>
                  Your next cheesy favorite is waiting for you.
                </p>
                <Link className="cart-primary-button" to="/menu">
                  Explore Menu
                </Link>
              </div>
            ) : (
              <div className="cart-product-list">
                {cart.map((item) => (
                  <article className="cart-product" key={item.id}>
                    <img
                      className="cart-product-image"
                      src={item.image}
                      alt={item.name}
                    />

                    <div className="cart-product-info">
                      <h3>{item.name}</h3>
                      <p>
                        {item.customization || item.description}
                      </p>

                      <span className="cart-unit-price">
                        ৳{item.price} each
                      </span>

                      <div className="cart-product-actions">
                        <button
                          type="button"
                          onClick={() => navigate("/menu")}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="cart-remove-link"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-product-right">
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(item.id, -1)
                          }
                          aria-label={`Decrease ${item.name} quantity`}
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(item.id, 1)
                          }
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>

                      <strong>
                        ৳{item.price * item.quantity}
                      </strong>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Link className="cart-back-to-menu" to="/menu">
              <span>←</span>
              Add more from the menu
            </Link>

            <section className="cart-addons">
              <h2>Complete your cheesy combo</h2>

              <div className="cart-addon-grid">
                {addOnProducts.map((product) => (
                  <article className="cart-addon" key={product.id}>
                    <img src={product.image} alt={product.name} />

                    <div className="cart-addon-info">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <strong>৳{product.price}</strong>
                    </div>

                    <button
                      type="button"
                      aria-label={`Add ${product.name}`}
                      onClick={() => addToCart(product)}
                    >
                      +
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <div className="cart-delivery-note">
              <span className="cart-clock-icon">◷</span>

              <div>
                <strong>Estimated delivery: 25–30 mins</strong>
                <p>
                  From our New Market kitchen. Times may vary with traffic.
                </p>
              </div>
            </div>
          </section>

          <aside className="cart-summary-column">
            <section className="cart-promo-card">
              <div className="cart-card-heading">
                <h2>Promo Code</h2>

                <button
                  type="button"
                  onClick={() =>
                    setPromoMessage("Ask us about available offers.")
                  }
                >
                  View offers
                </button>
              </div>

              <form className="cart-promo-form" onSubmit={applyPromo}>
                <input
                  value={promoInput}
                  onChange={(event) =>
                    setPromoInput(event.target.value)
                  }
                  placeholder="Enter promo code"
                  aria-label="Promo code"
                />

                <button type="submit" disabled={promoApplied}>
                  {promoApplied ? "APPLIED" : "Apply"}
                </button>
              </form>

              <div className="cart-promo-bottom">
                <p
                  className={
                    promoApplied
                      ? "cart-promo-message success"
                      : "cart-promo-message"
                  }
                >
                  {promoMessage ||
                    "৳50 off on orders of ৳800 or more"}
                </p>

                {promoApplied && (
                  <button type="button" onClick={removePromo}>
                    Remove
                  </button>
                )}
              </div>
            </section>

            <section className="cart-bill-card">
              <h2>Bill Details</h2>

              <div className="cart-bill-row">
                <span>Subtotal ({itemCount} items)</span>
                <span>৳{cartTotal}</span>
              </div>

              <div className="cart-bill-row cart-discount-row">
                <span>Promo Discount (CHEEZ50)</span>
                <span>−৳{discount}</span>
              </div>

              <div className="cart-bill-row">
                <span>Delivery Fee (New Market area)</span>
                <span>৳{deliveryFee}</span>
              </div>

              <div className="cart-bill-row">
                <span>Govt VAT / Tax</span>
                <span>৳{tax}</span>
              </div>

              <div className="cart-bill-divider" />

              <div className="cart-grand-total">
                <div>
                  <strong>Grand Total</strong>
                  <span>Inclusive of all taxes</span>
                </div>

                <strong>৳{grandTotal}</strong>
              </div>

              {discount > 0 && (
                <div className="cart-savings">
                  You're saving ৳{discount} on your cheese haul!
                </div>
              )}

              <button
                type="button"
                className="cart-checkout-button"
                disabled={cart.length === 0}
                onClick={() => navigate("/signin")}
              >
                Proceed to Checkout (৳{grandTotal})
              </button>

              <p className="cart-summary-note">
                Freshly prepared at 4Cheez, Khulna New Market.
              </p>
            </section>
          </aside>
        </div>
      </div>

      <footer className="cart-footer">
        <div className="cart-footer-top">
          <div className="cart-footer-brand">
            <div className="cart-footer-logo">
              <span>4</span>
              <strong>cheez</strong>
            </div>

            <p>
              Indulge in the cheesiest boxes, gourmet pizzas, and
              oven-baked pastas right in the heart of Khulna.
              Melty goodness delivered straight to your door.
            </p>
          </div>

          <div className="cart-footer-column">
            <h3>OUR MENU</h3>
            <Link to="/menu">Cheez Boxes</Link>
            <Link to="/menu">Gourmet Pizzas</Link>
            <Link to="/menu">Oven-Baked Pastas</Link>
            <Link to="/menu">Steak Burgers</Link>
          </div>

          <div className="cart-footer-column">
            <h3>HELP &amp; SUPPORT</h3>
            <Link to="/orders">Track Order</Link>
            <Link to="/ai-assistant">AI Assistant Guide</Link>
            <Link to="/">Terms of Service</Link>
            <Link to="/">Privacy Policy</Link>
          </div>

          <div className="cart-footer-column">
            <h3>CONTACT US</h3>
            <span>Khulna New Market, Block B</span>
            <span>Phone: +880 1712-444333</span>
            <span>Email: hello@4cheez.com</span>
          </div>
        </div>

        <div className="cart-footer-bottom">
          <span>
            © {new Date().getFullYear()} 4Cheez Restaurant, Khulna.
            All rights reserved.
          </span>

          <span className="cart-social-links">
            f &nbsp; ◎ &nbsp; ▷
          </span>
        </div>
      </footer>
    </main>
  );
}

export default Cart;