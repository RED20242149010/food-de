
import { useEffect, useState } from "react";
import "./AdminCoupons.css";

const API_URL = "http://localhost:5000/api/admin/coupons";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: 0,
  maxDiscount: "",
  expiryDate: "",
  usageLimit: "",
  isActive: true,
};

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // FETCH COUPONS
  const fetchCoupons = async () => {
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
        throw new Error(data.message || "Failed to load coupons");
      }

      setCoupons(data.coupons || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // FORMAT MONEY
  const formatMoney = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  // FORMAT DATE FOR INPUT
  const formatDateInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // OPEN ADD FORM
  const handleAdd = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue ?? "",
      minOrderAmount: coupon.minOrderAmount ?? 0,
      maxDiscount: coupon.maxDiscount ?? "",
      expiryDate: formatDateInput(coupon.expiryDate),
      usageLimit: coupon.usageLimit ?? "",
      isActive: coupon.isActive,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // FORM INPUT HANDLER
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // SAVE COUPON
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!token) {
        throw new Error("Please log in again as an admin.");
      }

      const couponData = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount || 0),
        maxDiscount:
          form.maxDiscount === "" ? null : Number(form.maxDiscount),
        usageLimit:
          form.usageLimit === "" ? null : Number(form.usageLimit),
      };

      const url = editingCoupon
        ? `${API_URL}/${editingCoupon._id}`
        : API_URL;

      const response = await fetch(url, {
        method: editingCoupon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save coupon");
      }

      setSuccess(
        editingCoupon
          ? "Coupon updated successfully!"
          : "Coupon created successfully!"
      );

      setShowForm(false);
      setEditingCoupon(null);
      setForm(emptyForm);

      await fetchCoupons();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // DELETE COUPON
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete coupon");
      }

      setSuccess("Coupon deleted successfully!");
      await fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  // TOGGLE ACTIVE STATUS
  const handleToggleStatus = async (coupon) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${coupon._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update coupon status");
      }

      setSuccess(
        `Coupon ${coupon.isActive ? "deactivated" : "activated"} successfully!`
      );

      await fetchCoupons();
    } catch (err) {
      setError(err.message);
    }
  };

  // SEARCH FILTER
  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(search.toLowerCase())
  );

  // SUMMARY
  const activeCoupons = coupons.filter(
    (coupon) => coupon.isActive
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) => new Date(coupon.expiryDate) < new Date()
  ).length;

  return (
    <div className="admin-coupons">
      {/* HEADER */}
      <div className="coupons-header">
        <div>
          <h1>Offers & Coupons</h1>
          <p>Manage promotional codes and customer discounts.</p>
        </div>

        <button className="add-coupon-btn" onClick={handleAdd}>
          + Create Coupon
        </button>
      </div>

      {/* ALERTS */}
      {error && <div className="coupon-alert error">{error}</div>}
      {success && (
        <div className="coupon-alert success">{success}</div>
      )}

      {/* STATISTICS */}
      <section className="coupon-stats">
        <div className="coupon-stat-card">
          <span>Total Coupons</span>
          <h2>{coupons.length}</h2>
        </div>

        <div className="coupon-stat-card">
          <span>Active Coupons</span>
          <h2>{activeCoupons}</h2>
        </div>

        <div className="coupon-stat-card">
          <span>Expired Coupons</span>
          <h2>{expiredCoupons}</h2>
        </div>
      </section>

      {/* COUPON TABLE */}
      <section className="coupon-table-card">
        <div className="coupon-table-heading">
          <h2>All Coupons</h2>

          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="coupon-message">Loading coupons...</p>
        ) : filteredCoupons.length === 0 ? (
          <p className="coupon-message">
            No coupons found. Create your first coupon!
          </p>
        ) : (
          <div className="coupon-table-wrapper">
            <table className="coupon-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Min. Order</th>
                  <th>Expiry Date</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon) => {
                  const expired =
                    new Date(coupon.expiryDate) < new Date();

                  return (
                    <tr key={coupon._id}>
                      <td>
                        <strong className="coupon-code">
                          {coupon.code}
                        </strong>
                      </td>

                      <td>
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : formatMoney(coupon.discountValue)}
                      </td>

                      <td>
                        {formatMoney(coupon.minOrderAmount)}
                      </td>

                      <td>
                        {new Date(
                          coupon.expiryDate
                        ).toLocaleDateString("en-GB")}
                      </td>

                      <td>
                        {coupon.usedCount || 0} /{" "}
                        {coupon.usageLimit ?? "Unlimited"}
                      </td>

                      <td>
                        <span
                          className={`coupon-status ${
                            expired
                              ? "expired"
                              : coupon.isActive
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {expired
                            ? "Expired"
                            : coupon.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="coupon-actions">
                          <button
                            className="coupon-edit-btn"
                            onClick={() => handleEdit(coupon)}
                          >
                            Edit
                          </button>

                          <button
                            className="coupon-toggle-btn"
                            onClick={() =>
                              handleToggleStatus(coupon)
                            }
                          >
                            {coupon.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            className="coupon-delete-btn"
                            onClick={() =>
                              handleDelete(coupon._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="coupon-modal-overlay">
          <div className="coupon-modal">
            <div className="coupon-modal-header">
              <div>
                <h2>
                  {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
                </h2>
                <p>Enter the promotional coupon details.</p>
              </div>

              <button
                className="coupon-close-btn"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="coupon-form-grid">
                <div className="coupon-form-group">
                  <label>Coupon Code *</label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. CHEEZY20"
                    required
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Discount Type *</label>
                  <select
                    name="discountType"
                    value={form.discountType}
                    onChange={handleChange}
                    required
                  >
                    <option value="percentage">
                      Percentage (%)
                    </option>
                    <option value="fixed">
                      Fixed Amount (৳)
                    </option>
                  </select>
                </div>

                <div className="coupon-form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    name="discountValue"
                    value={form.discountValue}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Minimum Order Amount (৳)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={form.minOrderAmount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Maximum Discount (৳)</label>
                  <input
                    type="number"
                    name="maxDiscount"
                    value={form.maxDiscount}
                    onChange={handleChange}
                    min="0"
                    placeholder="Leave empty for no limit"
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    min={formatDateInput(new Date())}
                    required
                  />
                </div>

                <div className="coupon-form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit}
                    onChange={handleChange}
                    min="1"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div className="coupon-form-group coupon-checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                    Active Coupon
                  </label>
                </div>
              </div>

              <div className="coupon-form-footer">
                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
