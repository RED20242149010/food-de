
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartTemp";
import "./Navbar.css";

function Navbar() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const { cartCount } = useCart();
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchText.trim();

    if (query) {
      navigate(`/menu?search=${encodeURIComponent(query)}`);
      setSearchText("");
    }
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo" aria-label="4Cheez home">
        <span>4</span>
        <strong>cheez</strong>
      </Link>

      {/* Delivery Location */}
      <div className="location">
        <span className="location-icon">📍</span>
        <div>
          <small>DELIVERING TO</small>
          <p>Khulna New Market</p>
        </div>
      </div>

      {/* Customer Navigation Links */}
      <div className="nav-links">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>

        <NavLink to="/menu" className={navLinkClass}>
          Menu
        </NavLink>

        <NavLink to="/offers" className={navLinkClass}>
          Offers
        </NavLink>

        <NavLink to="/ai-assistant" className={navLinkClass}>
          AI Assistant
        </NavLink>

        {token && (
          <NavLink to="/orders" className={navLinkClass}>
            My Orders
          </NavLink>
        )}
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        {/* Search Bar */}
        <form className="search-box" onSubmit={handleSearch}>
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>

          <input
            type="search"
            placeholder="Search 4Cheez..."
            aria-label="Search menu"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />

          {searchText && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => setSearchText("")}
            >
              ×
            </button>
          )}

          <button
            type="button"
            className="voice-search-nav-btn"
            aria-label="Search with your voice"
            title="Voice Search"
            onClick={() => navigate("/voice-search")}
          >
            🎙️
          </button>
        </form>

        {/* Cart */}
        <Link
          to="/cart"
          className="cart"
          aria-label={`Shopping cart with ${cartCount} items`}
        >
          <span aria-hidden="true">🛒</span>
          <strong>Cart</strong>
          <span className="cart-count">{cartCount}</span>
        </Link>

        {/* User Account */}
        <Link
          to={token ? "/account" : "/signin"}
          className="user"
          aria-label={token ? "My Account" : "Sign in"}
        >
          <div className="user-avatar">👤</div>
          <span>{token ? "My Account" : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
