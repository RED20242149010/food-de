
import { useEffect, useRef, useState } from "react";
import "./AdminFoods.css";

const API_URL = "http://localhost:5000/api/admin/foods";
const UPLOAD_URL = `${API_URL}/upload`;
const SERVER_URL = "http://localhost:5000";

const emptyForm = {
  productId: "",
  name: "",
  category: "",
  price: "",
  image: "",
  rating: "0",
  calories: "0",
  prepTime: "0",
  vegetarian: false,
  popular: "0",
  description: "",
  ingredients: "",
  isAvailable: true,
};

function AdminFoods() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fileInputRef = useRef(null);

  const getToken = () => localStorage.getItem("token");

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load food items");
      }

      setFoods(data.foods || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // Clean up temporary image previews.
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(selectedImage);
    setImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [selectedImage]);

  const resetImageSelection = () => {
    setSelectedImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddForm = () => {
    const nextProductId =
      foods.length > 0
        ? Math.max(...foods.map((food) => Number(food.productId) || 0)) + 1
        : 1;

    setEditingFood(null);
    setForm({
      ...emptyForm,
      productId: String(nextProductId),
    });

    resetImageSelection();
    setError("");
    setShowForm(true);
  };

  const openEditForm = (food) => {
    setEditingFood(food);

    setForm({
      productId: String(food.productId ?? ""),
      name: food.name || "",
      category: food.category || "",
      price: String(food.price ?? ""),
      image: food.image || "",
      rating: String(food.rating ?? 0),
      calories: String(food.calories ?? 0),
      prepTime: String(food.prepTime ?? 0),
      vegetarian: Boolean(food.vegetarian),
      popular: String(food.popular ?? 0),
      description: food.description || "",
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(", ")
        : "",
      isAvailable: food.isAvailable !== false,
    });

    resetImageSelection();
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP, or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
  };

  const uploadFoodImage = async () => {
    if (!selectedImage) {
      return form.image;
    }

    const imageData = new FormData();
    imageData.append("image", selectedImage);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: imageData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Image upload failed.");
    }

    return data.image;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.category.trim() || form.price === "") {
      setError("Please enter the food name, category, and price.");
      return;
    }

    const payload = {
      productId: Number(form.productId),
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      image: form.image,
      rating: Number(form.rating || 0),
      calories: Number(form.calories || 0),
      prepTime: Number(form.prepTime || 0),
      vegetarian: form.vegetarian,
      popular: Number(form.popular || 0),
      description: form.description.trim(),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isAvailable: form.isAvailable,
    };

    if (
      !Number.isFinite(payload.productId) ||
      !Number.isFinite(payload.price) ||
      payload.price < 0
    ) {
      setError("Please enter a valid product ID and price.");
      return;
    }

    if (payload.rating < 0 || payload.rating > 5) {
      setError("Rating must be between 0 and 5.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      // Upload the selected image first.
      const uploadedImage = await uploadFoodImage();
      payload.image = uploadedImage;

      const url = editingFood
        ? `${API_URL}/${editingFood._id}`
        : API_URL;

      const response = await fetch(url, {
        method: editingFood ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save food item");
      }

      setShowForm(false);
      setEditingFood(null);
      setForm(emptyForm);
      resetImageSelection();

      await fetchFoods();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFood(null);
    setForm(emptyForm);
    resetImageSelection();
    setError("");
  };

  const deleteFood = async (food) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${food.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${food._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete food item");
      }

      await fetchFoods();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAvailability = async (food) => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${food._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          isAvailable: !food.isAvailable,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update availability");
      }

      await fetchFoods();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredFoods = foods.filter((food) => {
    const searchText = search.toLowerCase();

    return (
      food.name?.toLowerCase().includes(searchText) ||
      food.category?.toLowerCase().includes(searchText)
    );
  });

  const formatMoney = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  return (
    <div className="admin-foods">
      <div className="admin-foods-header">
        <div>
          <h2>Food Items</h2>
          <p>Manage your FourCheez menu and food products.</p>
        </div>

        <button className="add-food-btn" onClick={openAddForm}>
          + Add New Food
        </button>
      </div>

      <div className="food-summary">
        <div className="food-summary-card">
          <span>Total Food Items</span>
          <strong>{foods.length}</strong>
        </div>

        <div className="food-summary-card">
          <span>Available Items</span>
          <strong>
            {foods.filter((food) => food.isAvailable !== false).length}
          </strong>
        </div>

        <div className="food-summary-card">
          <span>Unavailable Items</span>
          <strong>
            {foods.filter((food) => food.isAvailable === false).length}
          </strong>
        </div>
      </div>

      <div className="food-toolbar">
        <input
          type="text"
          placeholder="Search food by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={fetchFoods} className="refresh-food-btn">
          Refresh
        </button>
      </div>

      {error && <div className="food-error">{error}</div>}

      {showForm && (
        <div className="food-form-card">
          <div className="food-form-heading">
            <h3>{editingFood ? "Edit Food Item" : "Add New Food Item"}</h3>

            <button
              type="button"
              className="close-food-form"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="food-form-grid">
              <label>
                Product ID
                <input
                  type="number"
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Food Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter food name"
                  required
                />
              </label>

              <label>
                Category
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Cheez Boxes"
                  required
                />
              </label>

              <label>
                Price (৳)
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </label>

              <label>
                Rating
                <input
                  type="number"
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </label>

              <label>
                Calories
                <input
                  type="number"
                  name="calories"
                  value={form.calories}
                  onChange={handleChange}
                  min="0"
                />
              </label>

              <label>
                Preparation Time (minutes)
                <input
                  type="number"
                  name="prepTime"
                  value={form.prepTime}
                  onChange={handleChange}
                  min="0"
                />
              </label>

              <label>
                Popularity
                <input
                  type="number"
                  name="popular"
                  value={form.popular}
                  onChange={handleChange}
                  min="0"
                />
              </label>

              {/* IMAGE UPLOAD */}
              <div className="food-full-width food-image-upload">
                <label htmlFor="food-image-input">
                  Food Image
                </label>

                <input
                  ref={fileInputRef}
                  id="food-image-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageChange}
                />

                <p className="food-image-help">
                  Choose JPG, PNG, WEBP or GIF. Maximum size: 5 MB.
                </p>

                {(imagePreview || form.image) && (
                  <div className="food-image-preview">
                    <img
                      src={
                        imagePreview || getImageUrl(form.image)
                      }
                      alt="Food preview"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        resetImageSelection();
                        setForm((previous) => ({
                          ...previous,
                          image: "",
                        }));
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
              </div>

              <label className="food-full-width">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this food item..."
                  rows="3"
                />
              </label>

              <label className="food-full-width">
                Ingredients (separate with commas)
                <input
                  type="text"
                  name="ingredients"
                  value={form.ingredients}
                  onChange={handleChange}
                  placeholder="Cheese, Beef, Tomato..."
                />
              </label>
            </div>

            <div className="food-checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={form.vegetarian}
                  onChange={handleChange}
                />
                Vegetarian
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                />
                Available for ordering
              </label>
            </div>

            <div className="food-form-actions">
              <button
                type="button"
                className="cancel-food-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-food-btn"
                disabled={saving}
              >
                {saving
                  ? "Uploading and Saving..."
                  : editingFood
                    ? "Update Food"
                    : "Add Food"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="food-loading">Loading food items...</p>
      ) : filteredFoods.length === 0 ? (
        <p className="food-empty">No food items found.</p>
      ) : (
        <div className="food-table-wrapper">
          <table className="food-table">
            <thead>
              <tr>
                <th>Food</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food._id}>
                  <td>
                    <div className="food-table-product">
                      {food.image ? (
                        <img
                          src={getImageUrl(food.image)}
                          alt={food.name}
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <div className="food-image-placeholder">🍽️</div>
                      )}

                      <div>
                        <strong>{food.name}</strong>
                        <small>ID: {food.productId}</small>
                      </div>
                    </div>
                  </td>

                  <td>{food.category}</td>
                  <td>{formatMoney(food.price)}</td>
                  <td>⭐ {Number(food.rating || 0).toFixed(1)}</td>

                  <td>
                    <button
                      className={`food-availability ${
                        food.isAvailable === false
                          ? "unavailable"
                          : "available"
                      }`}
                      onClick={() => toggleAvailability(food)}
                    >
                      {food.isAvailable === false
                        ? "Unavailable"
                        : "Available"}
                    </button>
                  </td>

                  <td>
                    <div className="food-actions">
                      <button
                        className="edit-food-btn"
                        onClick={() => openEditForm(food)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-food-btn"
                        onClick={() => deleteFood(food)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminFoods;
