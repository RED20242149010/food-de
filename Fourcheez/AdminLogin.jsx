
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      if (!data.token || !data.user) {
        setError("Invalid server response.");
        return;
      }

      if (
        String(data.user.role || "").toLowerCase() !== "admin"
      ) {
        setError("Access denied. This account is not an admin.");
        return;
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      console.error("ADMIN LOGIN ERROR:", err);
      setError("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <Link to="/" className="admin-login-logo">
          <span>4</span>
          <strong>cheez</strong>
        </Link>

        <div className="admin-login-heading">
          <h1>Admin Login</h1>
          <p>
            Sign in to manage your FourCheez restaurant.
          </p>
        </div>

        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">
            Admin Email
          </label>

          <input
            id="admin-email"
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="admin-password">
            Password
          </label>

          <input
            id="admin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In to Admin"}
          </button>
        </form>

        <p className="admin-login-footer">
          FourCheez Admin Panel
        </p>

        <Link to="/" className="admin-login-home-link">
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default AdminLogin;
