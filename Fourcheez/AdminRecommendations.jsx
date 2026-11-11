
import { useEffect, useState } from "react";
import "./AdminRecommendations.css";

const API_URL = "http://localhost:5000/api/admin/recommendations";
const SERVER_URL = "http://localhost:5000";

// Safely read JSON responses
async function readResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Non-JSON API response:", text);

    throw new Error(
      `Server returned HTML or invalid data (HTTP ${response.status}). Check the API URL and backend route.`
    );
  }
}

function AdminRecommendations() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // ==========================================
  // FETCH FOOD ITEMS
  // ==========================================

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again as an admin.");
      }

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Could not fetch food items."
        );
      }

      setFoods(data.foods || []);
    } catch (err) {
      console.error("Fetch recommendations error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // ==========================================
  // TOGGLE RECOMMENDATION STATUS
  // ==========================================

  const toggleRecommendation = async (food) => {
    try {
      setUpdatingId(food._id);
      setError("");

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again as an admin.");
      }

      const newStatus = !food.isRecommended;

      const response = await fetch(`${API_URL}/${food._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          isRecommended: newStatus,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update recommendation."
        );
      }

      setFoods((previousFoods) =>
        previousFoods.map((item) =>
          item._id === food._id ? data.food : item
        )
      );
    } catch (err) {
      console.error("Update recommendation error:", err);
      setError(err.message || "Could not update recommendation.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    return `${SERVER_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  };

  // ==========================================
  // FILTER FOODS
  // ==========================================

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "Recommended" && food.isRecommended) ||
      (filter === "Not Recommended" && !food.isRecommended);

    return matchesSearch && matchesFilter;
  });

  const recommendedCount = foods.filter(
    (food) => food.isRecommended
  ).length;

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="recommendations-page">

      <div className="recommendations-header">
        <div>
          <h1>Food Recommendations</h1>
          <p>
            Choose which food items should be featured as recommendations.
          </p>
        </div>

        <button
          className="recommendations-refresh"
          onClick={fetchFoods}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="recommendation-stats">
        <div className="recommendation-stat-card">
          <span>Total Food Items</span>
          <h2>{foods.length}</h2>
        </div>

        <div className="recommendation-stat-card">
          <span>Recommended Foods</span>
          <h2>{recommendedCount}</h2>
        </div>

        <div className="recommendation-stat-card">
          <span>Not Recommended</span>
          <h2>{foods.length - recommendedCount}</h2>
        </div>
      </div>

      <div className="recommendation-toolbar">
        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Food Items</option>
          <option value="Recommended">Recommended</option>
          <option value="Not Recommended">Not Recommended</option>
        </select>
      </div>

      {error && (
        <div className="recommendation-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="recommendation-message">
          Loading food items...
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="recommendation-empty">
          <h3>No food items found</h3>
          <p>
            Try another search or add food items from Food Items management.
          </p>
        </div>
      ) : (
        <div className="recommendation-food-grid">
          {filteredFoods.map((food) => (
            <div
              className="recommendation-food-card"
              key={food._id}
            >
              <div className="recommendation-image-wrapper">
                {food.image ? (
                  <img
                    src={getImageUrl(food.image)}
                    alt={food.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="recommendation-image-placeholder">
                    🍽️
                  </div>
                )}

                <span
                  className={`recommendation-status ${
                    food.isRecommended
                      ? "recommended"
                      : "not-recommended"
                  }`}
                >
                  {food.isRecommended
                    ? "Recommended"
                    : "Not Recommended"}
                </span>
              </div>

              <div className="recommendation-food-details">
                <span className="recommendation-category">
                  {food.category || "Uncategorized"}
                </span>

                <h3>{food.name}</h3>

                <p className="recommendation-description">
                  {food.description || "No description available."}
                </p>

                <div className="recommendation-food-info">
                  <strong>
                    ৳{Number(food.price || 0).toLocaleString("en-BD")}
                  </strong>

                  <span>
                    ⭐ {Number(food.rating || 0).toFixed(1)}
                  </span>
                </div>

                {!food.isAvailable && (
                  <p className="recommendation-unavailable">
                    Currently unavailable
                  </p>
                )}

                <button
                  className={`recommendation-toggle-button ${
                    food.isRecommended
                      ? "remove-recommendation"
                      : "add-recommendation"
                  }`}
                  onClick={() => toggleRecommendation(food)}
                  disabled={
                    updatingId === food._id ||
                    (!food.isAvailable && !food.isRecommended)
                  }
                >
                  {updatingId === food._id
                    ? "Updating..."
                    : food.isRecommended
                    ? "Remove Recommendation"
                    : food.isAvailable
                    ? "Add to Recommendations"
                    : "Food Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminRecommendations;
