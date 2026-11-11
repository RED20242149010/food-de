
import { useEffect, useMemo, useState } from "react";
import "./AdminReviews.css";

const API_URL = "http://localhost:5000/api/admin/reviews";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [replyInputs, setReplyInputs] = useState({});
  const [savingReply, setSavingReply] = useState("");

  const token = localStorage.getItem("token");

  // ==========================================
  // FETCH REVIEWS
  // ==========================================

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load reviews");
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ==========================================
  // UPDATE REVIEW STATUS
  // ==========================================

  const updateStatus = async (reviewId, status) => {
    try {
      const response = await fetch(
        `${API_URL}/${reviewId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      setReviews((previous) =>
        previous.map((review) =>
          review._id === reviewId ? data.review : review
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // DELETE REVIEW
  // ==========================================

  const deleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this review?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      setReviews((previous) =>
        previous.filter((review) => review._id !== reviewId)
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // SAVE ADMIN REPLY
  // ==========================================

  const saveReply = async (reviewId) => {
    const adminReply = replyInputs[reviewId]?.trim();

    if (!adminReply) {
      alert("Please enter a reply first.");
      return;
    }

    try {
      setSavingReply(reviewId);

      const response = await fetch(
        `${API_URL}/${reviewId}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ adminReply }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save reply");
      }

      setReviews((previous) =>
        previous.map((review) =>
          review._id === reviewId ? data.review : review
        )
      );

      alert("Admin reply saved successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingReply("");
    }
  };

  // ==========================================
  // FILTER REVIEWS
  // ==========================================

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const customerName = review.user?.name || "";
      const foodName = review.foodName || "";
      const comment = review.comment || "";

      const searchText = search.toLowerCase();

      const matchesSearch =
        customerName.toLowerCase().includes(searchText) ||
        foodName.toLowerCase().includes(searchText) ||
        comment.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        review.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, search, statusFilter, ratingFilter]);

  // ==========================================
  // REVIEW STATISTICS
  // ==========================================

  const totalReviews = reviews.length;

  const approvedReviews = reviews.filter(
    (review) => review.status === "approved"
  ).length;

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending"
  ).length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (total, review) => total + review.rating,
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // ==========================================
  // RATING STARS
  // ==========================================

  const renderStars = (rating) => {
    return (
      <span className="review-stars">
        {"★".repeat(rating)}
        <span className="empty-stars">
          {"★".repeat(5 - rating)}
        </span>
      </span>
    );
  };

  // ==========================================
  // DATE FORMAT
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="admin-reviews">

      <div className="reviews-header">
        <div>
          <h1>Reviews Management</h1>
          <p>Manage customer feedback and food ratings.</p>
        </div>

        <button
          className="reviews-refresh-btn"
          onClick={fetchReviews}
        >
          ↻ Refresh
        </button>
      </div>

      {/* STATISTICS */}

      <div className="reviews-stats">

        <div className="review-stat-card">
          <span>Total Reviews</span>
          <h2>{totalReviews}</h2>
        </div>

        <div className="review-stat-card">
          <span>Approved Reviews</span>
          <h2>{approvedReviews}</h2>
        </div>

        <div className="review-stat-card">
          <span>Pending Reviews</span>
          <h2>{pendingReviews}</h2>
        </div>

        <div className="review-stat-card">
          <span>Average Rating</span>
          <h2>⭐ {averageRating}</h2>
        </div>

      </div>

      {/* FILTERS */}

      <div className="reviews-filters">

        <input
          type="text"
          placeholder="Search customer, food or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

      </div>

      {/* REVIEW LIST */}

      {loading ? (
        <div className="reviews-message">
          Loading reviews...
        </div>
      ) : error ? (
        <div className="reviews-error">
          {error}
          <button onClick={fetchReviews}>Try Again</button>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="reviews-message">
          No reviews found.
        </div>
      ) : (

        <div className="reviews-list">

          {filteredReviews.map((review) => (

            <div className="review-card" key={review._id}>

              <div className="review-card-top">

                <div>
                  <h3>{review.foodName}</h3>

                  <p className="review-customer">
                    Customer: {review.user?.name || "Unknown"}
                  </p>

                  <p className="review-date">
                    {formatDate(review.createdAt)}
                  </p>
                </div>

                <span
                  className={`review-status ${review.status}`}
                >
                  {review.status}
                </span>

              </div>

              <div className="review-rating">
                {renderStars(review.rating)}
                <span>{review.rating}/5</span>
              </div>

              <p className="review-comment">
                {review.comment}
              </p>

              {/* ADMIN REPLY */}

              <div className="review-reply-section">

                <label>Admin Reply</label>

                {review.adminReply && (
                  <div className="existing-reply">
                    {review.adminReply}
                  </div>
                )}

                <textarea
                  placeholder="Write a reply to this customer..."
                  value={
                    replyInputs[review._id] ??
                    review.adminReply ??
                    ""
                  }
                  onChange={(e) =>
                    setReplyInputs((previous) => ({
                      ...previous,
                      [review._id]: e.target.value,
                    }))
                  }
                />

                <button
                  className="review-reply-btn"
                  onClick={() => saveReply(review._id)}
                  disabled={savingReply === review._id}
                >
                  {savingReply === review._id
                    ? "Saving..."
                    : "Save Reply"}
                </button>

              </div>

              {/* ACTION BUTTONS */}

              <div className="review-actions">

                {review.status !== "approved" && (
                  <button
                    className="review-approve-btn"
                    onClick={() =>
                      updateStatus(review._id, "approved")
                    }
                  >
                    Approve
                  </button>
                )}

                {review.status !== "hidden" && (
                  <button
                    className="review-hide-btn"
                    onClick={() =>
                      updateStatus(review._id, "hidden")
                    }
                  >
                    Hide
                  </button>
                )}

                {review.status === "hidden" && (
                  <button
                    className="review-pending-btn"
                    onClick={() =>
                      updateStatus(review._id, "pending")
                    }
                  >
                    Set Pending
                  </button>
                )}

                <button
                  className="review-delete-btn"
                  onClick={() => deleteReview(review._id)}
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      <div className="reviews-results-count">
        Showing {filteredReviews.length} of {totalReviews} reviews
      </div>

    </div>
  );
}

export default AdminReviews;
