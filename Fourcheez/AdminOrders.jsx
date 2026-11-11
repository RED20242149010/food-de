
import { useEffect, useState } from "react";
import "./AdminOrders.css";

const orderStatuses = [
  "placed",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const token = localStorage.getItem("token");

  // FETCH ALL ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);

      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update order.");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? { ...order, ...data.order }
            : order
        )
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder((previous) => ({
          ...previous,
          ...data.order,
        }));
      }

      return true;
    } catch (err) {
      alert(err.message);
      return false;
    } finally {
      setUpdatingId("");
    }
  };

  // CANCEL ORDER
  const cancelOrder = async () => {
    if (!selectedOrder) return;

    if (
      selectedOrder.status === "cancelled" ||
      selectedOrder.status === "delivered"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    await updateOrderStatus(selectedOrder._id, "cancelled");
  };

  // FORMAT MONEY
  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
  };

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // FORMAT STATUS
  const formatStatus = (status) => {
    return (status || "placed")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // GET DELIVERY ADDRESS
  const getAddress = (address) => {
    if (!address) return "No delivery address available.";

    if (typeof address === "string") return address;

    return [
      address.address,
      address.area,
    ]
      .filter(Boolean)
      .join(", ") || "No delivery address available.";
  };

  // FILTER ORDERS
  const filteredOrders = orders.filter((order) => {
    const customerName =
      order.user?.name ||
      order.deliveryAddress?.fullName ||
      "";

    const customerEmail = order.user?.email || "";
    const orderId = order._id || "";

    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      orderId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // SUMMARY COUNTS
  const pendingOrders = orders.filter(
    (order) => order.status === "placed"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;

  return (
    <div className="admin-orders">
      {/* HEADER */}
      <div className="admin-orders-header">
        <div>
          <h1>Orders Management</h1>
          <p>View and manage all FourCheez customer orders.</p>
        </div>

        <button
          className="orders-refresh-btn"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh Orders"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="orders-error">
          <p>{error}</p>
          <button onClick={fetchOrders}>Try Again</button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="orders-summary">
        <div className="orders-summary-card">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Pending Orders</span>
          <h2>{pendingOrders}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Completed Orders</span>
          <h2>{completedOrders}</h2>
        </div>

        <div className="orders-summary-card">
          <span>Cancelled Orders</span>
          <h2>{cancelledOrders}</h2>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="orders-toolbar">
        <input
          type="text"
          placeholder="Search by customer name, email or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>

          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
      </div>

      {/* ORDERS TABLE */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="orders-empty">
                  Loading orders...
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>

                  <td>
                    <strong>
                      {order.user?.name ||
                        order.deliveryAddress?.fullName ||
                        "Unknown Customer"}
                    </strong>
                    <small>{order.user?.email || "No email"}</small>
                  </td>

                  <td>
                    <div className="order-items-list">
                      {order.items?.map((item, index) => (
                        <div key={index}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="order-total">
                    {formatMoney(order.total)}
                  </td>

                  <td>
                    <span>
                      {(order.paymentMethod || "N/A").replace(/_/g, " ")}
                    </span>
                    <small>{order.paymentStatus || "N/A"}</small>
                  </td>

                  <td>{formatDate(order.createdAt)}</td>

                  <td>
                    <select
                      className={`order-status-select status-${order.status}`}
                      value={order.status || "placed"}
                      disabled={
                        updatingId === order._id ||
                        order.status === "cancelled" ||
                        order.status === "delivered"
                      }
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>

                    {updatingId === order._id && (
                      <small>Updating...</small>
                    )}
                  </td>

                  <td>
                    <button
                      className="view-order-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="orders-empty">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="orders-results-count">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <h2>Order Details</h2>
                <p>
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </p>
              </div>

              <button
                className="order-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="order-details-content">
              {/* CUSTOMER INFORMATION */}
              <section className="order-detail-section">
                <h3>Customer Information</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.user?.name ||
                    selectedOrder.deliveryAddress?.fullName ||
                    "N/A"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.user?.email || "N/A"}
                </p>

                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.user?.phone ||
                    selectedOrder.deliveryAddress?.phone ||
                    "N/A"}
                </p>

                <p>
                  <strong>Delivery Address:</strong>{" "}
                  {getAddress(selectedOrder.deliveryAddress)}
                </p>

                <p>
                  <strong>Delivery Instructions:</strong>{" "}
                  {selectedOrder.deliveryAddress?.instructions ||
                    "No special instructions"}
                </p>
              </section>

              {/* ORDER INFORMATION */}
              <section className="order-detail-section">
                <h3>Order Information</h3>

                <p>
                  <strong>Order Date:</strong>{" "}
                  {formatDate(selectedOrder.createdAt)}
                </p>

                <p>
                  <strong>Order Status:</strong>{" "}
                  {formatStatus(selectedOrder.status)}
                </p>

                <p>
                  <strong>Payment Method:</strong>{" "}
                  {formatStatus(selectedOrder.paymentMethod || "N/A")}
                </p>

                <p>
                  <strong>Payment Status:</strong>{" "}
                  {formatStatus(selectedOrder.paymentStatus || "N/A")}
                </p>
              </section>

              {/* ORDERED FOOD */}
              <section className="order-detail-section">
                <h3>Ordered Food Items</h3>

                <div className="order-detail-items">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div className="order-detail-item" key={index}>
                        <div>
                          <strong>{item.name || "Food Item"}</strong>
                          <small>
                            Quantity: {item.quantity || 1}
                          </small>
                        </div>

                        <span>
                          {formatMoney(
                            Number(item.price || item.unitPrice || 0) *
                              Number(item.quantity || 1)
                          )}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No food items found.</p>
                  )}
                </div>
              </section>

              {/* PRICE SUMMARY */}
              <section className="order-detail-section">
                <h3>Payment Summary</h3>

                <div className="order-price-row">
                  <span>Subtotal</span>
                  <span>
                    {formatMoney(
                      selectedOrder.subtotal ??
                      selectedOrder.items?.reduce(
                        (sum, item) =>
                          sum +
                          Number(item.price || item.unitPrice || 0) *
                            Number(item.quantity || 1),
                        0
                      )
                    )}
                  </span>
                </div>

                <div className="order-price-row">
                  <span>Delivery Charge</span>
                  <span>
                    {formatMoney(
                      selectedOrder.deliveryFee ??
                      selectedOrder.deliveryCharge
                    )}
                  </span>
                </div>

                <div className="order-price-row">
                  <span>Discount</span>
                  <span>
                    {formatMoney(selectedOrder.discount)}
                  </span>
                </div>

                <div className="order-price-row order-grand-total">
                  <strong>Total</strong>
                  <strong>{formatMoney(selectedOrder.total)}</strong>
                </div>
              </section>
            </div>

            {/* MODAL FOOTER */}
            <div className="order-modal-footer">
              {selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "delivered" && (
                  <button
                    className="cancel-order-btn"
                    onClick={cancelOrder}
                    disabled={updatingId === selectedOrder._id}
                  >
                    {updatingId === selectedOrder._id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}

              <button onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
