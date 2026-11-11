
import { useEffect, useState } from "react";
import "./AdminSettings.css";

const API_URL = "http://localhost:5000/api/admin/settings";

const initialRestaurantSettings = {
  restaurantName: "FourCheez",
  address: "",
  phone: "",
  email: "",
  deliveryFee: 0,
  minimumOrder: 0,
  estimatedDeliveryTime: 30,
  acceptingOrders: true,
};

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "The server returned an invalid response. Check that your backend is running."
    );
  }
}

function AdminSettings() {
  const [adminProfile, setAdminProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [restaurantSettings, setRestaurantSettings] = useState(
    initialRestaurantSettings
  );

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [restaurantMessage, setRestaurantMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();

        if (!token) {
          throw new Error("Please sign in as an admin first.");
        }

        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await readResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load settings."
          );
        }

        setAdminProfile({
          name: data.admin?.name || "",
          email: data.admin?.email || "",
          phone: data.admin?.phone || "",
        });

        setRestaurantSettings({
          ...initialRestaurantSettings,
          ...(data.settings || {}),
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setAdminProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRestaurantChange = (event) => {
    const { name, value, type, checked } = event.target;

    setRestaurantSettings((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? value
          : value,
    }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setErrorMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in as an admin first.");
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminProfile),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update admin profile."
        );
      }

      setAdminProfile({
        name: data.admin?.name || adminProfile.name,
        email: data.admin?.email || adminProfile.email,
        phone: data.admin?.phone || adminProfile.phone,
      });

      setProfileMessage(
        data.message || "Admin profile updated successfully!"
      );
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveRestaurantSettings = async (event) => {
    event.preventDefault();

    setSavingRestaurant(true);
    setRestaurantMessage("");
    setErrorMessage("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please sign in as an admin first.");
      }

      const payload = {
        ...restaurantSettings,
        deliveryFee: Number(restaurantSettings.deliveryFee),
        minimumOrder: Number(restaurantSettings.minimumOrder),
        estimatedDeliveryTime: Number(
          restaurantSettings.estimatedDeliveryTime
        ),
      };

      const response = await fetch(`${API_URL}/restaurant`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update restaurant settings."
        );
      }

      setRestaurantSettings({
        ...initialRestaurantSettings,
        ...(data.settings || payload),
      });

      setRestaurantMessage(
        data.message || "Restaurant settings saved successfully!"
      );
    } catch (error) {
      setRestaurantMessage(error.message);
    } finally {
      setSavingRestaurant(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-settings-loading">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings-heading">
        <div>
          <span className="admin-settings-eyebrow">
            ADMIN CONTROL PANEL
          </span>
          <h2>Settings</h2>
          <p>
            Manage your administrator profile and restaurant
            information.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="settings-message settings-error">
          {errorMessage}
        </div>
      )}

      {/* ADMIN PROFILE */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">👤</div>

          <div>
            <h3>Admin Profile</h3>
            <p>Manage your administrator account information.</p>
          </div>
        </div>

        <form onSubmit={saveProfile}>
          <div className="settings-form-grid">
            <div className="settings-field">
              <label htmlFor="admin-name">Full Name</label>
              <input
                id="admin-name"
                type="text"
                name="name"
                value={adminProfile.name}
                onChange={handleProfileChange}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="admin-email">Email Address</label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={adminProfile.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="admin-phone">Phone Number</label>
              <input
                id="admin-phone"
                type="tel"
                name="phone"
                value={adminProfile.phone}
                onChange={handleProfileChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          {profileMessage && (
            <div className="settings-message">
              {profileMessage}
            </div>
          )}

          <button
            type="submit"
            className="settings-save-button"
            disabled={savingProfile}
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </section>

      {/* RESTAURANT INFORMATION */}

      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">🏪</div>

          <div>
            <h3>Restaurant Information</h3>
            <p>Update your restaurant's basic information.</p>
          </div>
        </div>

        <form onSubmit={saveRestaurantSettings}>
          <div className="settings-form-grid">
            <div className="settings-field">
              <label htmlFor="restaurant-name">
                Restaurant Name
              </label>
              <input
                id="restaurant-name"
                type="text"
                name="restaurantName"
                value={restaurantSettings.restaurantName}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant name"
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="restaurant-email">
                Restaurant Email
              </label>
              <input
                id="restaurant-email"
                type="email"
                name="email"
                value={restaurantSettings.email}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant email"
              />
            </div>

            <div className="settings-field">
              <label htmlFor="restaurant-phone">
                Restaurant Phone
              </label>
              <input
                id="restaurant-phone"
                type="tel"
                name="phone"
                value={restaurantSettings.phone}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant phone"
              />
            </div>

            <div className="settings-field settings-full-width">
              <label htmlFor="restaurant-address">
                Restaurant Address
              </label>
              <textarea
                id="restaurant-address"
                name="address"
                value={restaurantSettings.address}
                onChange={handleRestaurantChange}
                placeholder="Enter restaurant address"
                rows="3"
              />
            </div>
          </div>

          <div className="settings-section-divider" />

          {/* ORDER SETTINGS */}

          <div className="settings-subheading">
            <h3>Order & Delivery Settings</h3>
            <p>Configure your restaurant's order and delivery rules.</p>
          </div>

          <div className="settings-form-grid">
            <div className="settings-field">
              <label htmlFor="delivery-fee">
                Delivery Fee (৳)
              </label>
              <input
                id="delivery-fee"
                type="number"
                name="deliveryFee"
                min="0"
                step="any"
                value={restaurantSettings.deliveryFee}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="minimum-order">
                Minimum Order Amount (৳)
              </label>
              <input
                id="minimum-order"
                type="number"
                name="minimumOrder"
                min="0"
                step="any"
                value={restaurantSettings.minimumOrder}
                onChange={handleRestaurantChange}
                required
              />
            </div>

            <div className="settings-field">
              <label htmlFor="delivery-time">
                Estimated Delivery Time (minutes)
              </label>
              <input
                id="delivery-time"
                type="number"
                name="estimatedDeliveryTime"
                min="1"
                step="1"
                value={restaurantSettings.estimatedDeliveryTime}
                onChange={handleRestaurantChange}
                required
              />
            </div>
          </div>

          <div className="settings-availability">
            <div>
              <h4>Accepting New Orders</h4>
              <p>
                Allow customers to place new orders through the
                restaurant.
              </p>
            </div>

            <label className="settings-toggle">
              <input
                type="checkbox"
                name="acceptingOrders"
                checked={Boolean(restaurantSettings.acceptingOrders)}
                onChange={handleRestaurantChange}
              />
              <span className="settings-toggle-slider" />
            </label>
          </div>

          <div className="settings-order-status">
            <span
              className={
                restaurantSettings.acceptingOrders
                  ? "settings-status-dot status-open"
                  : "settings-status-dot status-closed"
              }
            />
            {restaurantSettings.acceptingOrders
              ? "Restaurant is accepting orders"
              : "Restaurant is not accepting orders"}
          </div>

          {restaurantMessage && (
            <div className="settings-message">
              {restaurantMessage}
            </div>
          )}

          <button
            type="submit"
            className="settings-save-button"
            disabled={savingRestaurant}
          >
            {savingRestaurant
              ? "Saving..."
              : "Save Restaurant Settings"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminSettings;
