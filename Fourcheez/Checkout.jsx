import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartTemp";
import "./Checkout.css";

import goldenWedges from "../../assets/Golden Cheezy Wedges.png";
import gardenSalad from "../../assets/garden-salad.png";

const defaultAddress = {
  area: "Khulna New Market Area",
  street: "Flat 3B, building 14, Road 2, New Market residential area, Khulna",
  contact: "Sajid Ahmed",
  phone: "+880 1819-246810",
};

function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [fulfillment, setFulfillment] = useState("delivery");
  const [payment, setPayment] = useState("cash");
  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState(
    "Please bring extra napkins. Call me when you reach the building."
  );
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [editingArea, setEditingArea] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = cartTotal;
  const discount =
    promoApplied && subtotal >= 800 ? 50 : 0;
  const deliveryFee = fulfillment === "delivery" ? 30 : 0;
  const tax = subtotal > 0 ? 15 : 0;
  const grandTotal = Math.max(
    0,
    subtotal + deliveryFee + tax - discount
  );

  const formatPrice = (price) =>
    `৳${Number(price).toLocaleString("en-BD")}`;

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();

    if (code === "CHEEZ50" && subtotal >= 800) {
      setPromoApplied(true);
      setPromoMessage("৳50 saved! Your promo code is applied.");
    } else if (code === "CHEEZ50") {
      setPromoApplied(false);
      setPromoMessage("Your order subtotal must be at least ৳800.");
    } else {
      setPromoApplied(false);
      setPromoMessage("Invalid promo code. Try CHEEZ50.");
    }
  };

  const removePromo = () => {
    setPromoApplied(false);
    setPromoInput("");
    setPromoMessage("");
  };

  const updateAddress = (field, value) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    if (cart.length === 0) return;

    if (
      fulfillment === "delivery" &&
      (!address.area.trim() ||
        !address.street.trim() ||
        !address.contact.trim() ||
        !address.phone.trim())
    ) {
      window.alert("Please complete all delivery address details.");
      return;
    }

    // Demo confirmation only. Connect this handler to your backend
    // when you are ready to save real orders.
    setOrderPlaced(true);
    clearCart();
  };

  if (cart.length === 0 && !orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <span className="checkout-empty-icon">🛒</span>
          <h1>Your cart is empty</h1>
          <p>Add some cheesy favorites before checking out.</p>
          <Link to="/menu" className="checkout-primary-link">
            Explore Our Menu
          </Link>
        </div>
      </main>
    );
  }

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="checkout-success">
          <span className="checkout-success-icon">✓</span>
          <h1>Thank You for Your Order!</h1>
          <p>
            Your demo order has been confirmed on this page.
            No order has been saved to the server yet.
          </p>
          <Link to="/menu" className="checkout-primary-link">
            Order More Food
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/cart">Cart</Link>
          <span>/</span>
          <span>Checkout</span>
        </div>

        <header className="checkout-heading">
          <h1>Checkout Details</h1>
          <p>
            Just a few details before we start the melty goodness.
          </p>
        </header>

        <form
          className="checkout-layout"
          onSubmit={handlePlaceOrder}
        >
          <div className="checkout-main">
            {/* Fulfillment */}
            <section className="checkout-panel">
              <h2>Fulfillment Mode</h2>

              <div className="fulfillment-options">
                <button
                  type="button"
                  className={`fulfillment-option ${
                    fulfillment === "delivery" ? "selected" : ""
                  }`}
                  onClick={() => setFulfillment("delivery")}
                >
                  <span className="option-radio" />
                  <span className="option-text">
                    <strong>Home Delivery</strong>
                    <small>৳30 delivery fee</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={`fulfillment-option ${
                    fulfillment === "pickup" ? "selected" : ""
                  }`}
                  onClick={() => setFulfillment("pickup")}
                >
                  <span className="option-radio" />
                  <span className="option-text">
                    <strong>Pickup at New Market</strong>
                    <small>No delivery fee</small>
                  </span>
                </button>
              </div>
            </section>

            {/* Delivery address */}
            {fulfillment === "delivery" && (
              <section className="checkout-panel">
                <div className="panel-heading-row">
                  <h2>Delivery Address</h2>
                  <span className="address-type">Home</span>
                </div>

                <div className="checkout-field">
                  <label htmlFor="checkout-area">
                    AREA / NEIGHBORHOOD
                  </label>

                  {editingArea ? (
                    <div className="area-edit-row">
                      <input
                        id="checkout-area"
                        value={address.area}
                        onChange={(event) =>
                          updateAddress("area", event.target.value)
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setEditingArea(false)}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="area-display">
                      <strong>{address.area}</strong>
                      <button
                        type="button"
                        onClick={() => setEditingArea(true)}
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <div className="checkout-field">
                  <label htmlFor="checkout-street">
                    HOUSE, FLAT &amp; STREET DETAILS
                  </label>
                  <input
                    id="checkout-street"
                    value={address.street}
                    onChange={(event) =>
                      updateAddress("street", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-field">
                    <label htmlFor="checkout-contact">
                      CONTACT PERSON
                    </label>
                    <input
                      id="checkout-contact"
                      value={address.contact}
                      onChange={(event) =>
                        updateAddress("contact", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="checkout-phone">
                      MOBILE NUMBER
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={address.phone}
                      onChange={(event) =>
                        updateAddress("phone", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Pickup details */}
            {fulfillment === "pickup" && (
              <section className="checkout-panel pickup-details">
                <h2>Pickup Location</h2>
                <strong>4Cheez — New Market</strong>
                <p>Khulna New Market, Block B</p>
                <p>
                  Your order will be ready for collection at the
                  restaurant.
                </p>
              </section>
            )}

            {/* Delivery estimate */}
            <section className="delivery-estimate">
              <span className="estimate-clock" aria-hidden="true">
                ◷
              </span>
              <div>
                <strong>
                  {fulfillment === "delivery"
                    ? "Estimated delivery: 25–30 mins"
                    : "Estimated pickup: 15–20 mins"}
                </strong>
                <p>
                  {fulfillment === "delivery"
                    ? "From our New Market kitchen. Times may vary with traffic."
                    : "We'll prepare your order fresh for collection."}
                </p>
              </div>
            </section>

            {/* Payment */}
            <section className="checkout-panel">
              <h2>Payment Options</h2>

              <div className="payment-options">
                <label
                  className={`payment-option ${
                    payment === "cash" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={payment === "cash"}
                    onChange={() => setPayment("cash")}
                  />
                  <span className="payment-option-text">
                    <strong>Cash on Delivery</strong>
                    <small>
                      Pay {formatPrice(grandTotal)} when your food arrives
                    </small>
                  </span>
                  {payment === "cash" && (
                    <span className="payment-selected-label">
                      SELECTED
                    </span>
                  )}
                </label>

                <label
                  className={`payment-option ${
                    payment === "bkash" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={payment === "bkash"}
                    onChange={() => setPayment("bkash")}
                  />
                  <span className="payment-option-text">
                    <strong>bKash Mobile Wallet</strong>
                    <small>Pay securely with your bKash account</small>
                  </span>
                </label>

                <label
                  className={`payment-option ${
                    payment === "nagad" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={payment === "nagad"}
                    onChange={() => setPayment("nagad")}
                  />
                  <span className="payment-option-text">
                    <strong>Nagad Wallet</strong>
                    <small>Fast and secure mobile payment</small>
                  </span>
                </label>

                <label
                  className={`payment-option ${
                    payment === "card" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                  />
                  <span className="payment-option-text">
                    <strong>Credit / Debit Card</strong>
                    <small>Visa, Mastercard, DBBL Nexus</small>
                  </span>
                </label>
              </div>

              {payment !== "cash" && (
                <p className="payment-demo-notice">
                  This payment method is for display only. A payment
                  gateway must be connected before real payments can
                  be accepted.
                </p>
              )}
            </section>

            {/* Notes */}
            <section className="checkout-panel">
              <h2>Order Notes</h2>

              <div className="checkout-field">
                <label htmlFor="checkout-notes">
                  SPECIAL INSTRUCTIONS (OPTIONAL)
                </label>
                <textarea
                  id="checkout-notes"
                  rows="4"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Any special instructions for your order?"
                />
              </div>

              <p className="notes-hint">
                Food customizations are listed with each item in your
                order.
              </p>
            </section>
          </div>

          {/* Order summary */}
          <aside className="checkout-sidebar">
            <section className="checkout-panel order-summary">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <div className="summary-item-image">
                      <img
                        src={
                          item.name === "Golden Cheezy Wedges"
                            ? goldenWedges
                            : item.name === "Garden Fresh Salad"
                              ? gardenSalad
                              : item.image
                        }
                        alt={item.name}
                      />
                    </div>

                    <div className="summary-item-info">
                      <strong>
                        {item.quantity} × {item.name}
                      </strong>
                      <small>
                        {item.name === "Loaded Ultimate Cheez Box"
                          ? "Extra Melty Cheese Blast (+৳50)"
                          : "Standard patty • No onions"}
                      </small>
                    </div>

                    <strong className="summary-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="summary-line">
                <span>
                  Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="summary-line discount-line">
                  <span>Promo Discount (CHEEZ50)</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}

              <div className="summary-line">
                <span>
                  Delivery Fee
                  {fulfillment === "delivery" ? " (New Market area)" : ""}
                </span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>

              <div className="summary-line">
                <span>Govt VAT / Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="summary-grand-total">
                <div>
                  <strong>Grand Total</strong>
                  <small>Inclusive of all taxes</small>
                </div>
                <strong>{formatPrice(grandTotal)}</strong>
              </div>

              {discount > 0 && (
                <div className="savings-message">
                  You're saving ৳50 on your cheese haul!
                </div>
              )}

              <button
                className="place-order-btn"
                type="submit"
                disabled={cart.length === 0}
              >
                Place Order ({formatPrice(grandTotal)})
              </button>

              <p className="order-terms">
                {payment === "cash"
                  ? `Pay ${formatPrice(grandTotal)} in cash when your food arrives.`
                  : "Payment integration is required to process online payments."}
                <br />
                By placing an order, you agree to our Terms of Service.
              </p>
            </section>

            {/* Promo code */}
            <section className="checkout-panel promo-panel">
              <div className="promo-heading">
                <h3>Promo Code</h3>
                <button
                  type="button"
                  onClick={() => {
                    setPromoInput("CHEEZ50");
                    setPromoMessage(
                      "Enter the code and apply it to your order."
                    );
                  }}
                >
                  View offers
                </button>
              </div>

              <div className="promo-input-row">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(event) => {
                    setPromoInput(event.target.value);
                    setPromoMessage("");
                  }}
                  placeholder="Enter promo code"
                  aria-label="Promo code"
                  disabled={promoApplied}
                />

                {promoApplied ? (
                  <button
                    type="button"
                    className="promo-applied-btn"
                    onClick={removePromo}
                  >
                    APPLIED
                  </button>
                ) : (
                  <button
                    type="button"
                    className="promo-apply-btn"
                    onClick={applyPromo}
                  >
                    APPLY
                  </button>
                )}
              </div>

              {promoMessage && (
                <p
                  className={`promo-message ${
                    promoApplied ? "promo-success" : ""
                  }`}
                >
                  {promoMessage}
                </p>
              )}

              {promoApplied && (
                <button
                  type="button"
                  className="promo-remove-btn"
                  onClick={removePromo}
                >
                  Remove
                </button>
              )}

              {!promoApplied && !promoMessage && (
                <p className="promo-hint">
                  Use CHEEZ50 to save ৳50 on orders of ৳800 or more.
                </p>
              )}
            </section>

            <Link to="/cart" className="back-to-cart">
              ← Back to cart to edit items
            </Link>
          </aside>
        </form>
      </div>

      {/* Footer */}
      <footer className="checkout-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>4</span>
              <strong>cheez</strong>
            </Link>
            <p>
              Indulge in the cheesiest boxes, gourmet pizzas, and
              oven-baked pastas right in the heart of Khulna. Melty
              goodness delivered straight to your door.
            </p>
          </div>

          <div className="footer-column">
            <h3>OUR MENU</h3>
            <Link to="/menu">Cheez Boxes</Link>
            <Link to="/menu">Gourmet Pizzas</Link>
            <Link to="/menu">Oven-Baked Pastas</Link>
            <Link to="/menu">Steak Burgers</Link>
          </div>

          <div className="footer-column">
            <h3>HELP &amp; SUPPORT</h3>
            <Link to="/account">Track Order</Link>
            <Link to="/menu">AI Assistant Guide</Link>
            <Link to="/account">Terms of Service</Link>
            <Link to="/account">Privacy Policy</Link>
          </div>

          <div className="footer-column">
            <h3>CONTACT US</h3>
            <span>Khulna New Market, Block B</span>
            <span>Phone: +880 1712-444333</span>
            <span>Email: hello@4cheez.com</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 4Cheez Restaurant, Khulna. All rights reserved.</p>
          <div className="footer-socials" aria-label="Social media">
            <span>f</span>
            <span>◎</span>
            <span>▣</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default Checkout;