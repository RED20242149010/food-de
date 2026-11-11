
import { useEffect, useState } from "react";
import "./AdminOrders.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again as an admin.");
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load customers.");
      }

      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const formatMoney = (amount) =>
    `৳${Number(amount || 0).toLocaleString("en-BD")}`;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = (customer.name || "").toLowerCase();
    const email = (customer.email || "").toLowerCase();
    const phone = (customer.phone || "").toLowerCase();
    const searchValue = search.toLowerCase();

    return (
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      phone.includes(searchValue)
    );
  });

  const totalOrders = customers.reduce(
    (sum, customer) => sum + Number(customer.totalOrders || 0),
    0
  );

  const totalSpent = customers.reduce(
    (sum, customer) => sum + Number(customer.totalSpent || 0),
    0
  );

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <div>
          <h1>Customers Management</h1>
          <p>View and manage registered FourCheez customers.</p>
        </div>

        <button
          className="orders-refresh-btn"
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Customers"}
        </button>
      </div>

      <div className="orders-summary">
        <div className="orders-summary-card">
          <span>Total Customers</span>
          <h2>{customers.length}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Total Orders</span>
          <h2>{totalOrders}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Total Customer Spending</span>
          <h2>{formatMoney(totalSpent)}</h2>
        </div>
      </div>

      <div className="orders-toolbar">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="orders-error">
          <p>{error}</p>
          <button onClick={fetchCustomers}>Try Again</button>
        </div>
      )}

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Joined</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="orders-empty">
                  Loading customers...
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <strong>{customer.name || "Unknown"}</strong>
                  </td>

                  <td>{customer.email || "N/A"}</td>

                  <td>{customer.phone || "N/A"}</td>

                  <td>{customer.totalOrders || 0}</td>

                  <td className="order-total">
                    {formatMoney(customer.totalSpent)}
                  </td>

                  <td>{formatDate(customer.createdAt)}</td>

                  <td>
                    <button
                      className="view-order-btn"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="orders-empty">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="orders-results-count">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>

      {selectedCustomer && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <h2>Customer Details</h2>
                <p>{selectedCustomer.name}</p>
              </div>

              <button
                className="order-modal-close"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>

            <div className="order-details-content">
              <section className="order-detail-section">
                <h3>Personal Information</h3>

                <p>
                  <strong>Name:</strong> {selectedCustomer.name || "N/A"}
                </p>

                <p>
                  <strong>Email:</strong> {selectedCustomer.email || "N/A"}
                </p>

                <p>
                  <strong>Phone:</strong> {selectedCustomer.phone || "N/A"}
                </p>

                <p>
                  <strong>Joined:</strong>{" "}
                  {formatDate(selectedCustomer.createdAt)}
                </p>
              </section>

              <section className="order-detail-section">
                <h3>Order Summary</h3>

                <p>
                  <strong>Total Orders:</strong>{" "}
                  {selectedCustomer.totalOrders || 0}
                </p>

                <p>
                  <strong>Total Spent:</strong>{" "}
                  {formatMoney(selectedCustomer.totalSpent)}
                </p>
              </section>

              <section className="order-detail-section">
                <h3>Order History</h3>

                {selectedCustomer.orders?.length > 0 ? (
                  selectedCustomer.orders.map((order) => (
                    <p key={order._id}>
                      Order #{order._id.slice(-6).toUpperCase()} —{" "}
                      {formatMoney(order.total)} — {order.status}
                    </p>
                  ))
                ) : (
                  <p>No order history available.</p>
                )}
              </section>
            </div>

            <div className="order-modal-footer">
              <button onClick={() => setSelectedCustomer(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;
