import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./OrderTracking.css";

function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        // Reuse the existing authenticated orders endpoint.
        const response = await fetch(
          "http://localhost:5000/api/orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load your orders.");
        }

        const orders = Array.isArray(data)
          ? data
          : data.orders || [];

        const selectedOrder = orders.find(
          (item) => String(item._id) === String(orderId)
        );

        if (!selectedOrder) {
          throw new Error("We couldn't find this order in your order history.");
        }

        setOrder(selectedOrder);
      } catch (err) {
        console.error("ORDER TRACKING ERROR:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const formatPrice = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const normalizeStatus = (status) =>
    String(status || "pending")
      .toLowerCase()
      .trim()
      .replaceAll("_", " ")
      .replaceAll("-", " ");

  const status = normalizeStatus(order?.status);

  const statusSteps = [
    {
      title: "Order Confirmed",
      description: "4Cheez kitchen has accepted your request.",
      statuses: ["confirmed", "accepted", "preparing", "preparing meal", "ready", "out for delivery", "rider pickup", "delivered"],
    },
    {
      title: "Preparing Melty Goodness",
      description: "Your order is being freshly prepared.",
      statuses: ["preparing", "preparing meal", "ready", "out for delivery", "rider pickup", "delivered"],
    },
    {
      title: "Rider Pickup",
      description: "Your rider is heading to your delivery address.",
      statuses: ["out for delivery", "rider pickup", "delivered"],
    },
    {
      title: "Delivered",
      description: "Enjoy your fresh and cheesy feast!",
      statuses: ["delivered"],
    },
  ];

  const getCurrentStep = () => {
    if (status === "cancelled" || status === "canceled") {
      return -1;
    }

    if (["pending", "placed"].includes(status)) {
      return 0;
    }

    if (["confirmed", "accepted"].includes(status)) {
      return 0;
    }

    if (["preparing", "preparing meal", "ready"].includes(status)) {
      return 1;
    }

    if (["out for delivery", "rider pickup"].includes(status)) {
      return 2;
    }

    if (status === "delivered") {
      return 3;
    }

    return 0;
  };

  const currentStep = getCurrentStep();

  const getAddress = () => {
    const address = order?.deliveryAddress;

    if (!address) return "Delivery address not available";

    if (typeof address === "string") return address;

    return [
      address.address,
      address.area,
      address.city,
    ]
      .filter(Boolean)
      .join(", ") || "Delivery address not available";
  };

  const getPaymentMethod = () =>
    String(order?.paymentMethod || "Not available")
      .replaceAll("_", " ");

  const rider =
    order?.deliveryPartner ||
    order?.rider ||
    order?.assignedRider ||
    null;

  const riderName =
    rider?.name ||
    rider?.fullName ||
    "Delivery partner not assigned";

  const riderPhone = rider?.phone || rider?.phoneNumber || "";

  const handleCallRider = () => {
    if (riderPhone) {
      window.location.href = `tel:${riderPhone}`;
    }
  };

  if (loading) {
    return (
      <div className="tracking-message">
        <div className="tracking-spinner"></div>
        <p>Loading your order tracking...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-message">
        <h2>Unable to track this order</h2>
        <p>{error || "Order not found."}</p>
        <Link to="/orders" className="tracking-back-button">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const isCancelled =
    status === "cancelled" || status === "canceled";

  return (
    <div className="order-tracking-page">
      <main className="tracking-container">
        {/* LEFT SIDE */}
        <section className="tracking-main">
          <div className="tracking-order-label">
            <span className={`tracking-status ${isCancelled ? "cancelled" : ""}`}>
              {status === "preparing" || status === "preparing meal"
                ? "PREPARING MEAL"
                : status.toUpperCase()}
            </span>

            <span>
              Order #{String(order._id).slice(-6).toUpperCase()}
            </span>
          </div>

          <h1 className="tracking-heading">
            {isCancelled
              ? "Your order was cancelled"
              : status === "delivered"
              ? "Your order has arrived!"
              : status === "out for delivery" || status === "rider pickup"
              ? "Your order is on its way!"
              : status === "preparing" || status === "preparing meal"
              ? "Preparing your cheesy goodness"
              : "We're getting your order ready!"}
          </h1>

          {/* DELIVERY TIMELINE */}
          <div className="tracking-timeline-card">
            {isCancelled ? (
              <div className="cancelled-message">
                <span className="cancelled-icon">!</span>
                <div>
                  <strong>Order Cancelled</strong>
                  <p>This order has been cancelled.</p>
                </div>
              </div>
            ) : (
              statusSteps.map((step, index) => {
                const completed = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    className={`timeline-item ${
                      completed ? "completed" : ""
                    } ${isCurrent ? "current" : ""}`}
                    key={step.title}
                  >
                    <div className="timeline-marker-column">
                      <span className="timeline-marker">
                        {completed ? "" : ""}
                      </span>

                      {index !== statusSteps.length - 1 && (
                        <span className="timeline-line"></span>
                      )}
                    </div>

                    <div className="timeline-content">
                      <div className="timeline-title-row">
                        <strong>{step.title}</strong>

                        <span>
                          {isCurrent
                            ? "Current"
                            : completed
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>

                      <p>{step.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DELIVERY MAP */}
          <div className="tracking-map-card">
            <h2>Delivery Location</h2>

            <div className="tracking-map">
              <div className="map-road map-road-horizontal"></div>
              <div className="map-road map-road-vertical"></div>
              <div className="map-road map-road-diagonal"></div>

              <div className="map-location map-outlet">
                <span>4CHEEZ OUTLET</span>
              </div>

              <div className="map-delivery-icon">
                <span>🚚</span>
              </div>

              <div className="map-location map-home">
                <span>DELIVERY ADDRESS</span>
              </div>
            </div>

            <p className="map-caption">
              Delivery address: {getAddress()}
            </p>

            <p className="map-disclaimer">
              This is an illustrative location panel, not live GPS tracking.
            </p>
          </div>
        </section>

        {/* RIGHT SIDE */}
        <aside className="tracking-sidebar">
          {/* RIDER */}
          <div className="tracking-side-card rider-card">
            <h2>Your Delivery Partner</h2>

            <div className="rider-information">
              <div className="rider-avatar">
                {riderName !== "Delivery partner not assigned"
                  ? riderName.charAt(0).toUpperCase()
                  : "👤"}
              </div>

              <div className="rider-details">
                <strong>{riderName}</strong>
                <span>
                  {rider?.rating
                    ? `Rider rating · ${rider.rating} ★`
                    : "Your delivery partner"}
                </span>
              </div>

              {riderPhone && (
                <button
                  className="call-rider-button"
                  onClick={handleCallRider}
                >
                  Call Rider
                </button>
              )}
            </div>
          </div>

          {/* ORDER DETAILS */}
          <div className="tracking-side-card">
            <h2>Order Details</h2>

            <div className="tracking-items">
              {order.items?.map((item, index) => (
                <div
                  className="tracking-item"
                  key={`${item.productId || item.name}-${index}`}
                >
                  <span>
                    {item.quantity || 1} × {item.name || "Food item"}
                  </span>

                  <span>
                    {formatPrice(
                      Number(item.price || 0) *
                        Number(item.quantity || 1)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="tracking-payment-row">
              <span>
                {order.paymentStatus === "paid" ? "Paid" : "Payment"} via{" "}
                {getPaymentMethod()}
              </span>

              <strong>{formatPrice(order.total)}</strong>
            </div>

            <p className="tracking-order-date">
              Ordered: {formatDate(order.createdAt)}
            </p>
          </div>

          {/* RATING */}
          <div className="tracking-rating-card">
            <h2>Arrived? Help us improve!</h2>

            <p>
              Provide immediate rating to our kitchen team and delivery rider.
            </p>

            <div className="tracking-rating-stars">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= rating ? "selected" : ""}
                  onClick={() => setRating(value)}
                  aria-label={`Rate ${value} stars`}
                  disabled={status !== "delivered"}
                  title={
                    status !== "delivered"
                      ? "You can rate after delivery"
                      : `Rate ${value} stars`
                  }
                >
                  ★
                </button>
              ))}
            </div>

            {status !== "delivered" && (
              <span className="rating-note">
                You can rate this order after it is delivered.
              </span>
            )}

            {status === "delivered" && rating > 0 && (
              <span className="rating-note">
                You selected {rating} out of 5 stars.
                Review submission will be connected to the backend later.
              </span>
            )}
          </div>

          <Link to="/orders" className="back-to-orders-link">
            ← Back to My Orders
          </Link>
        </aside>
      </main>

      {/* FOOTER */}
      <footer className="tracking-footer">
        <div className="tracking-footer-content">
          <div className="tracking-footer-brand">
            <Link to="/" className="tracking-footer-logo">
              <span>4</span>
              <strong>cheez</strong>
            </Link>

            <p>
              Indulge in the cheesiest boxes, gourmet pizzas, and
              oven-baked pastas right in the heart of Khulna.
              Melty goodness delivered straight to your door.
            </p>
          </div>

          <div className="tracking-footer-column">
            <h4>OUR MENU</h4>
            <Link to="/menu">Cheez Boxes</Link>
            <Link to="/menu">Gourmet Pizzas</Link>
            <Link to="/menu">Oven-Baked Pastas</Link>
            <Link to="/menu">Steak Burgers</Link>
          </div>

          <div className="tracking-footer-column">
            <h4>HELP & SUPPORT</h4>
            <Link to="/orders">Track Order</Link>
            <Link to="/ai-assistant">AI Assistant Guide</Link>
            <Link to="/orders">My Orders</Link>
          </div>

          <div className="tracking-footer-column">
            <h4>CONTACT US</h4>
            <span>Khulna New Market, Block B</span>
            <span>Phone: +880 1712-444333</span>
            <span>Email: hello@4cheez.com</span>
          </div>
        </div>

        <div className="tracking-footer-bottom">
          <span>
            © 2026 4Cheez Restaurant, Khulna. All rights reserved.
          </span>

          <div className="tracking-social-links">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">f</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">◎</a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">▶</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default OrderTracking;