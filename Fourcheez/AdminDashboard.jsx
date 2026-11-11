
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

import AdminOrders from "./AdminOrders";
import AdminFoods from "./AdminFoods";
import AdminCustomers from "./AdminCustomers";
import AdminCoupons from "./AdminCoupons";
import AdminReviews from "./AdminReviews";
import AdminRecommendations from "./AdminRecommendations";
import AdminSettings from "./AdminSettings";

const navigation = [
  "Dashboard",
  "Orders",
  "Food Items",
  "Customers",
  "Offers/Coupons",
  "Reviews",
  "Recommendations",
  "Settings",
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          navigate("/admin", { replace: true });
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not retrieve dashboard data."
          );
        }

        setDashboardData(data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [refreshKey, navigate]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/admin", { replace: true });
  };

  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (amount) => {
    return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
  };

  // ==========================================
  // DASHBOARD STATISTICS
  // ==========================================

  const stats = [
    {
      title: "TOTAL SALES YTD",
      value: formatMoney(dashboardData?.stats?.totalSalesYTD),
      change: "Sales from delivered orders this year",
    },
    {
      title: "TOTAL ORDERS",
      value: dashboardData?.stats?.totalOrders ?? 0,
      change: "All orders in the database",
    },
    {
      title: "CUSTOMERS",
      value: dashboardData?.stats?.totalCustomers ?? 0,
      change: "Registered customer accounts",
    },
    {
      title: "AVERAGE VALUE",
      value: formatMoney(dashboardData?.stats?.averageOrderValue),
      change: "Average delivered order value",
    },
    {
      title: "PENDING ORDERS",
      value: dashboardData?.stats?.pendingOrders ?? 0,
      change: "Orders awaiting completion",
    },
  ];

  const recentOrders = dashboardData?.recentOrders || [];
  const topFoods = dashboardData?.topFoods || [];

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <span className="admin-logo-icon">4</span>
          <span>cheez Admin</span>
        </div>

        <nav className="admin-navigation">
          {navigation.map((item) => (
            <button
              key={item}
              type="button"
              className={`admin-nav-item ${
                activePage === item ? "active" : ""
              }`}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <main className="admin-main">

        {activePage === "Orders" ? (
          <AdminOrders />

        ) : activePage === "Food Items" ? (
          <AdminFoods />

        ) : activePage === "Customers" ? (
          <AdminCustomers />

        ) : activePage === "Offers/Coupons" ? (
          <AdminCoupons />

        ) : activePage === "Reviews" ? (
          <AdminReviews />

        ) : activePage === "Recommendations" ? (
          <AdminRecommendations />

        ) : activePage === "Settings" ? (
          <AdminSettings />

        ) : (

          <>

            {/* HEADER */}

            <header className="admin-header">

              <div>
                <h1>Khulna New Market Hub</h1>

                <p>
                  Operational status and daily metrics for 4Cheez Restaurant
                </p>
              </div>

              <div className="admin-header-actions">

                <button
                  type="button"
                  className="admin-refresh-button"
                  onClick={() =>
                    setRefreshKey((previous) => previous + 1)
                  }
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>

                {/* ADMIN ACCOUNT BUTTON */}

                <div className="admin-account-wrapper">

                  <button
                    type="button"
                    className="admin-manager"
                    onClick={() =>
                      setShowAccountMenu((previous) => !previous)
                    }
                    aria-expanded={showAccountMenu}
                    aria-haspopup="true"
                  >

                    <div className="manager-avatar">
                      4
                    </div>

                    <div className="admin-manager-info">
                      <h4>FourCheez Admin</h4>
                      <span>Administrator</span>
                    </div>

                    <span className="admin-account-arrow">
                      {showAccountMenu ? "▲" : "▼"}
                    </span>

                  </button>

                  {/* ACCOUNT DROPDOWN */}

                  {showAccountMenu && (
                    <div className="admin-account-dropdown">

                      <div className="admin-dropdown-info">
                        <strong>FourCheez Admin</strong>
                        <span>Administrator Account</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="admin-logout-button"
                      >
                        <span>↪</span>
                        Logout
                      </button>

                    </div>
                  )}

                </div>

              </div>

            </header>

            {/* LOADING */}

            {loading && (
              <div className="admin-message">
                Loading dashboard data...
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="admin-error">

                <p>{error}</p>

                <button
                  type="button"
                  onClick={() =>
                    setRefreshKey((previous) => previous + 1)
                  }
                >
                  Try Again
                </button>

              </div>
            )}

            {/* DASHBOARD DATA */}

            {!loading && !error && dashboardData && (
              <>

                {/* STATISTICS */}

                <section className="admin-stats">

                  {stats.map((stat) => (
                    <div className="stat-card" key={stat.title}>

                      <h4>{stat.title}</h4>

                      <h2>{stat.value}</h2>

                      <span className="stat-description">
                        {stat.change}
                      </span>

                    </div>
                  ))}

                </section>

                {/* SALES AND TOP FOODS */}

                <section className="admin-middle">

                  <div className="admin-card sales-card">

                    <div className="card-heading">
                      <h3>Sales Overview</h3>

                      <span className="sales-period">
                        Year to date
                      </span>
                    </div>

                    <div className="sales-summary">

                      <span>Total sales this year</span>

                      <h2>
                        {formatMoney(
                          dashboardData.stats?.totalSalesYTD
                        )}
                      </h2>

                      <p>
                        This amount includes orders marked as delivered
                        during the current year.
                      </p>

                    </div>

                  </div>

                  <div className="admin-card top-foods-card">

                    <h3>Top-Selling Foods</h3>

                    {topFoods.length > 0 ? (
                      <div className="food-list">

                        {topFoods.map((food) => (
                          <div className="food-row" key={food._id}>

                            <div>
                              <h4>{food.name}</h4>

                              <span>
                                {food.totalQuantity} items sold
                              </span>
                            </div>

                            <strong>
                              {formatMoney(food.totalSales)}
                            </strong>

                          </div>
                        ))}

                      </div>
                    ) : (
                      <p className="empty-message">
                        No delivered food orders yet. Top-selling foods
                        will appear here after orders are delivered.
                      </p>
                    )}

                  </div>

                </section>

                {/* RECENT ORDERS */}

                <section className="admin-card recent-orders">

                  <h3>Recent Orders</h3>

                  {recentOrders.length > 0 ? (
                    <div className="orders-list">

                      {recentOrders.map((order) => {

                        const customerName =
                          order.user?.name ||
                          order.deliveryAddress?.fullName ||
                          "Unknown customer";

                        const itemNames = (order.items || [])
                          .map(
                            (item) =>
                              `${item.name} x${item.quantity}`
                          )
                          .join(", ");

                        const statusClass = (
                          order.status || "placed"
                        )
                          .toLowerCase()
                          .replace(/_/g, "-");

                        return (
                          <div className="order-row" key={order._id}>

                            <strong className="order-id">
                              #{order._id.slice(-6).toUpperCase()}
                            </strong>

                            <strong className="order-customer">
                              {customerName}
                            </strong>

                            <span className="order-items">
                              {itemNames}
                            </span>

                            <strong className="order-amount">
                              {formatMoney(order.total)}
                            </strong>

                            <span
                              className={`order-status ${statusClass}`}
                            >
                              {(order.status || "placed").replace(
                                /_/g,
                                " "
                              )}
                            </span>

                          </div>
                        );
                      })}

                    </div>
                  ) : (
                    <p className="empty-message">
                      No orders found.
                    </p>
                  )}

                </section>

              </>
            )}

          </>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;
