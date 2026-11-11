
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./RateOrder.css";

function RateOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const fetchEligibleOrder = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/reviews/eligible-orders",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load eligible orders.");
        }

        const orders = data.orders || [];
        const foundOrder = orders.find(
          (item) => item._id === orderId
        );

        if (!foundOrder) {
          throw new Error(
            "This order is not available for review. Only delivered orders can be reviewed."
          );
        }

        setOrder(foundOrder);

        // Prepare separate rating and comment fields for each food.
        const initialReviews = {};

        foundOrder.items.forEach((item) => {
          initialReviews[item.productId] = {
            rating: 0,
            comment: "",
            alreadyReviewed: Boolean(item.alreadyReviewed),
          };
        });

        setReviews(initialReviews);
      } catch (err) {
        console.error("RATE ORDER ERROR:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchEligibleOrder();
  }, [orderId, navigate]);

  const formatPrice = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-BD", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "Date unavailable";

  const normalizeStatus = (status) =>
    String(status || "")
      .toLowerCase()
      .replaceAll("_", " ")
      .replaceAll("-", " ");

  const updateReview = (productId, field, value) => {
    setReviews((previous) => ({
      ...previous,
      [productId]: {
        ...previous[productId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (item) => {
    const productId = item.productId;
    const currentReview = reviews[productId];

    setMessages((previous) => ({
      ...previous,
      [productId]: "",
    }));

    if (!currentReview || currentReview.rating === 0) {
      setMessages((previous) => ({
        ...previous,
        [productId]: "Please select a star rating.",
      }));
      return;
    }

    if (!currentReview.comment.trim()) {
      setMessages((previous) => ({
        ...previous,
        [productId]: "Please write a comment before submitting.",
      }));
      return;
    }

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    try {
      setSubmitting((previous) => ({
        ...previous,
        [productId]: true,
      }));

      const response = await fetch(
        "http://localhost:5000/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: order._id,
            productId,
            rating: currentReview.rating,
            comment: currentReview.comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not submit your review.");
      }

      setReviews((previous) => ({
        ...previous,
        [productId]: {
          ...previous[productId],
          alreadyReviewed: true,
        },
      }));

      setMessages((previous) => ({
        ...previous,
        [productId]:
          data.message ||
          "Review submitted successfully! Waiting for admin approval.",
      }));
    } catch (err) {
      setMessages((previous) => ({
        ...previous,
        [productId]: err.message || "Something went wrong.",
      }));
    } finally {
      setSubmitting((previous) => ({
        ...previous,
        [productId]: false,
      }));
    }
  };

  if (loading) {
    return (
      <div className="rate-order-message">
        Loading your order...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rate-order-message">
        <h2>Unable to open this order</h2>
        <p>{error}</p>
        <Link to="/orders">Back to My Orders</Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const status = normalizeStatus(order.status);

  return (
    <main className="rate-order-page">
      <div className="rate-order-container">
        <Link to="/orders" className="rate-back-link">
          <span>←</span> Back to My Orders
        </Link>

        <header className="rate-order-header">
          <div className="rate-header-icon">🧀</div>
          <p className="rate-eyebrow">YOUR FEEDBACK MATTERS</p>
          <h1>Rate Your Order</h1>
          <p>
            Share your thoughts about each food item you ordered!
          </p>
        </header>

        <div className="rate-order-layout">
          <section className="rate-form-card">
            <div className="rate-section">
              <h2>Review Your Food</h2>
              <p className="rate-section-description">
                Give each food item its own rating and comment.
              </p>
            </div>

            <div className="rate-food-review-list">
              {order.items?.map((item, index) => {
                const productId = item.productId;
                const currentReview = reviews[productId] || {
                  rating: 0,
                  comment: "",
                  alreadyReviewed: false,
                };

                const ratingLabels = [
                  "",
                  "Poor",
                  "Fair",
                  "Good",
                  "Very good",
                  "Excellent!",
                ];

                return (
                  <div
                    className="rate-food-review"
                    key={`${productId}-${index}`}
                  >
                    <div className="rate-food-heading">
                      <div className="rate-food-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <span>🧀</span>
                        )}
                      </div>

                      <div className="rate-food-info">
                        <h3>{item.name}</h3>
                        <p>
                          Quantity: {item.quantity} ·{" "}
                          {formatPrice(
                            Number(item.price || 0) *
                              Number(item.quantity || 0)
                          )}
                        </p>
                      </div>
                    </div>

                    {currentReview.alreadyReviewed ? (
                      <div className="rate-already-reviewed">
                        <span>✓</span>
                        <div>
                          <strong>Review submitted</strong>
                          <p>
                            Thank you! Your review has been submitted
                            and is waiting for admin approval.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rate-food-rating">
                          <h4>How many stars would you give it?</h4>

                          <div className="rate-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                className={`rate-star ${
                                  star <= currentReview.rating
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() =>
                                  updateReview(
                                    productId,
                                    "rating",
                                    star
                                  )
                                }
                                aria-label={`Rate ${star} out of 5 stars`}
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <p className="rate-rating-label">
                            {ratingLabels[currentReview.rating] ||
                              "Select your rating"}
                          </p>
                        </div>

                        <div className="rate-food-comment">
                          <h4>Write your review</h4>

                          <textarea
                            className="rate-review-textarea"
                            placeholder={`What did you think about ${item.name}?`}
                            value={currentReview.comment}
                            onChange={(event) =>
                              updateReview(
                                productId,
                                "comment",
                                event.target.value.slice(0, 1000)
                              )
                            }
                            maxLength={1000}
                            rows={4}
                          />

                          <div className="rate-character-count">
                            {currentReview.comment.length}/1000 characters
                          </div>
                        </div>

                        {messages[productId] && (
                          <div className="rate-form-message">
                            {messages[productId]}
                          </div>
                        )}

                        <button
                          type="button"
                          className="rate-submit-button"
                          onClick={() => handleSubmit(item)}
                          disabled={Boolean(submitting[productId])}
                        >
                          {submitting[productId]
                            ? "Submitting..."
                            : "Submit Review"}
                          <span>→</span>
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="rate-privacy-note">
              Thank you for helping us make 4Cheez better!
            </p>
          </section>

          <aside className="rate-order-summary">
            <h2>Your Order</h2>

            <div className="rate-summary-order-id">
              <span>ORDER ID</span>
              <strong>#{order._id}</strong>
            </div>

            <div className="rate-summary-date">
              <span>Order Date</span>
              <strong>{formatDate(order.createdAt)}</strong>
            </div>

            <div className="rate-summary-status">
              <span>Status</span>
              <strong
                className={`rate-summary-badge ${status.replaceAll(
                  " ",
                  "-"
                )}`}
              >
                {status || "Unknown"}
              </strong>
            </div>

            <div className="rate-summary-divider" />

            <h3>Items Ordered</h3>

            <div className="rate-summary-items">
              {order.items?.map((item, index) => (
                <div
                  className="rate-summary-item"
                  key={`${item.productId}-${index}`}
                >
                  <div className="rate-summary-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <span>🧀</span>
                    )}
                  </div>

                  <div className="rate-summary-item-details">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>

                  <strong>
                    {formatPrice(
                      Number(item.price || 0) *
                        Number(item.quantity || 0)
                    )}
                  </strong>
                </div>
              ))}
            </div>

            <div className="rate-summary-divider" />

            <div className="rate-summary-total">
              <span>Total Paid</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>

            <div className="rate-summary-thank-you">
              <span>💛</span>
              <p>
                Thanks for choosing 4Cheez. Your feedback helps us
                serve you better!
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default RateOrder;
