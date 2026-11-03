
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrderHistory.css";

function OrderHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
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
          throw new Error(data.message || "Could not load orders.");
        }

        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        console.error("ORDER HISTORY ERROR:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const formatPrice = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (loading) {
    return (
      <div className="order-history-message">
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-message">
        <h2>Unable to load orders</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <div>
          <p className="order-history-eyebrow">YOUR 4CHEEZ ACCOUNT</p>
          <h1>My Orders</h1>
          <p>Track your orders and see what you've ordered before.</p>
        </div>

        <Link to="/menu" className="order-history-shop-button">
          Order Again
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No orders yet!</h2>
          <p>Your delicious 4Cheez orders will appear here.</p>
          <Link to="/menu">Explore Our Menu</Link>
        </div>
      ) : (
        <div className="order-history-list">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div className="order-card-header">
                <div>
                  <span className="order-label">ORDER ID</span>
                  <h3>#{order._id}</h3>
                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <span className={`order-status ${String(order.status || "placed").toLowerCase()}`}>
                  {String(order.status || "placed").replaceAll("_", " ")}
                </span>
              </div>

              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div className="order-item" key={`${item.productId}-${index}`}>
                    <div className="order-item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span>🧀</span>
                      )}
                    </div>

                    <div className="order-item-details">
                      <strong>{item.name}</strong>
                      <span>Quantity: {item.quantity}</span>
                    </div>

                    <strong>
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div>
                  <span>Payment</span>
                  <strong>
                    {String(order.paymentMethod || "").replaceAll("_", " ")}
                  </strong>
                  <span className={`payment-status ${String(order.paymentStatus || "pending").toLowerCase()}`}>
                    {order.paymentStatus || "pending"}
                  </span>
                </div>

                <div className="order-total">
                  <span>Order Total</span>
                  <strong>{formatPrice(order.total)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
