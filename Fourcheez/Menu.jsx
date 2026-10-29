
import { useMemo, useState } from "react";
import "./Menu.css";

import loadedUltimateCheezBox from "../../assets/Loaded Ultimate Cheez Box.png";
import sausageBlastCheezBox from "../../assets/Sausage Blast Cheez Box.png";
import beefPasta from "../../assets/beef-pasta.png";
import goldenCheezyWedges from "../../assets/Golden Cheezy Wedges.png";
import gourmetBBQBeefPizza from "../../assets/Gourmet BBQ Beef Pizza.png";
import gardenSalad from "../../assets/garden-salad.png";
import smokedCheeseSteakBurger from "../../assets/Smoked Cheese Steak Burger.png";
import ovenBakedCreamyPasta from "../../assets/Oven-Baked Creamy Pasta.png";

const products = [
  {
    id: 1,
    name: "Loaded Ultimate Cheez Box",
    category: "Cheez Boxes",
    price: 350,
    rating: 4.9,
    calories: 680,
    time: 20,
    description:
      "A loaded box packed with cheesy goodness and delicious flavors.",
    image: loadedUltimateCheezBox,
    vegetarian: false,
    popular: true,
  },
  {
    id: 2,
    name: "Sausage Blast Cheez Box",
    category: "Cheez Boxes",
    price: 260,
    rating: 4.8,
    calories: 590,
    time: 15,
    description:
      "A tasty sausage box loaded with rich cheese and flavor.",
    image: sausageBlastCheezBox,
    vegetarian: false,
    popular: true,
  },
  {
    id: 3,
    name: "Gourmet BBQ Beef Pizza",
    category: "Pizza",
    price: 580,
    rating: 4.9,
    calories: 720,
    time: 25,
    description:
      "BBQ beef, melted cheese, and a delicious golden crust.",
    image: gourmetBBQBeefPizza,
    vegetarian: false,
    popular: true,
  },
  {
    id: 4,
    name: "Smoked Cheese Steak Burger",
    category: "Burgers",
    price: 340,
    rating: 4.7,
    calories: 650,
    time: 20,
    description:
      "A juicy burger with smoky flavors and melted cheese.",
    image: smokedCheeseSteakBurger,
    vegetarian: false,
    popular: true,
  },
  {
    id: 5,
    name: "Oven-Baked Creamy Pasta",
    category: "Pasta",
    price: 290,
    rating: 4.8,
    calories: 540,
    time: 20,
    description:
      "Creamy baked pasta with a rich, cheesy sauce.",
    image: ovenBakedCreamyPasta,
    vegetarian: false,
    popular: false,
  },
  {
    id: 6,
    name: "Golden Cheezy Wedges",
    category: "Sides",
    price: 160,
    rating: 4.6,
    calories: 320,
    time: 12,
    description:
      "Crispy golden potato wedges with a cheesy finish.",
    image: goldenCheezyWedges,
    vegetarian: true,
    popular: true,
  },
  {
    id: 7,
    name: "Garden Fresh Salad",
    category: "Salads",
    price: 190,
    rating: 4.5,
    calories: 220,
    time: 10,
    description:
      "A refreshing garden salad made with fresh vegetables.",
    image: gardenSalad,
    vegetarian: true,
    popular: false,
  },
  {
    id: 8,
    name: "Beefy Cheesy Pasta",
    category: "Pasta",
    price: 320,
    rating: 4.7,
    calories: 610,
    time: 20,
    description:
      "Savory beef and pasta mixed with a cheesy sauce.",
    image: beefPasta,
    vegetarian: false,
    popular: false,
  },
];

const categories = [
  "All",
  "Cheez Boxes",
  "Pizza",
  "Burgers",
  "Pasta",
  "Sides",
  "Salads",
];

function Menu() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [cart, setCart] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText);

      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesPrice = product.price <= maxPrice;

      const matchesVegetarian =
        !vegetarianOnly || product.vegetarian;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesVegetarian
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "popular") {
      result.sort(
        (a, b) => Number(b.popular) - Number(a.popular)
      );
    }

    return result;
  }, [
    search,
    activeCategory,
    sortBy,
    maxPrice,
    vegetarianOnly,
  ]);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const clearFilters = () => {
    setActiveCategory("All");
    setSearch("");
    setSortBy("popular");
    setMaxPrice(1000);
    setVegetarianOnly(false);
  };

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <div className="menu-hero-content">
          <p className="menu-eyebrow">WELCOME TO 4CHEEZ</p>

          <h1>
            Discover Your
            <br />
            <span>Cheesy Favorites.</span>
          </h1>

          <p>
            Freshly prepared favorites, delicious flavors, and
            cheesy goodness in every bite.
          </p>

          <a href="#menu-items" className="menu-hero-button">
            Explore Menu
          </a>
        </div>
      </section>

      <section className="menu-section">
        <div className="menu-heading">
          <div>
            <p className="menu-eyebrow">MADE FOR CHEESE LOVERS</p>
            <h2>Our Menu</h2>
            <p>Find something delicious for your next meal.</p>
          </div>

          <button
            type="button"
            className="mobile-filter-button"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            {filtersOpen ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="menu-toolbar">
          <div className="menu-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search your favorite food..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search menu"
            />
          </div>

          <label className="menu-sort">
            <span>Sort by</span>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </label>
        </div>

        <div className="menu-layout">
          <aside
            className={`menu-sidebar ${
              filtersOpen ? "filters-open" : ""
            }`}
          >
            <div className="filter-heading">
              <h3>Categories</h3>
            </div>

            <div className="category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    activeCategory === category
                      ? "category-button active"
                      : "category-button"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}

                  <span>
                    {category === "All"
                      ? products.length
                      : products.filter(
                          (product) =>
                            product.category === category
                        ).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="filter-divider" />

            <div className="filter-heading">
              <h3>Maximum Price</h3>
              <strong>৳{maxPrice}</strong>
            </div>

            <input
              className="price-slider"
              type="range"
              min="100"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(Number(event.target.value))
              }
              aria-label="Maximum price"
            />

            <div className="price-range-labels">
              <span>৳100</span>
              <span>৳1000</span>
            </div>

            <label className="vegetarian-filter">
              <input
                type="checkbox"
                checked={vegetarianOnly}
                onChange={(event) =>
                  setVegetarianOnly(event.target.checked)
                }
              />
              Vegetarian only
            </label>

            <button
              type="button"
              className="clear-filters-button"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </aside>

          <div className="menu-results" id="menu-items">
            <div className="menu-results-heading">
              <p>
                Showing <strong>{filteredProducts.length}</strong> items
              </p>

              <span>Prices in Bangladeshi Taka (৳)</span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="empty-menu">
                <h3>No food found</h3>
                <p>Try another search or change your filters.</p>

                <button type="button" onClick={clearFilters}>
                  Show All Foods
                </button>
              </div>
            ) : (
              <div className="menu-grid">
                {filteredProducts.map((product) => (
                  <article className="food-card" key={product.id}>
                    <div className="food-image-wrapper">
                      <button
                        type="button"
                        className="food-image-button"
                        onClick={() => setSelectedProduct(product)}
                        aria-label={`View details for ${product.name}`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="food-image"
                          loading="lazy"
                        />
                      </button>

                      {product.popular && (
                        <span className="popular-badge">
                          Popular
                        </span>
                      )}

                      <span className="food-category-badge">
                        {product.category}
                      </span>
                    </div>

                    <div className="food-card-content">
                      <div className="food-rating">
                        <span
                          aria-label={`${product.rating} out of 5 stars`}
                        >
                          ★ {product.rating}
                        </span>

                        <span>{product.time} min</span>
                      </div>

                      <h3>{product.name}</h3>

                      <p className="food-description">
                        {product.description}
                      </p>

                      <div className="food-meta">
                        <span>{product.calories} kcal</span>

                        {product.vegetarian && (
                          <span className="vegetarian-label">
                            Vegetarian
                          </span>
                        )}
                      </div>

                      <div className="food-card-bottom">
                        <strong className="food-price">
                          ৳{product.price}
                        </strong>

                        <button
                          type="button"
                          className="add-to-cart-button"
                          onClick={() => addToCart(product)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cart-section" id="cart">
        <div className="cart-heading">
          <div>
            <p className="menu-eyebrow">YOUR ORDER</p>
            <h2>Your Cart ({cartCount})</h2>
          </div>

          <strong className="cart-total">
            Total: ৳{cartTotal}
          </strong>
        </div>

        {cart.length === 0 ? (
          <p className="empty-cart">
            Your cart is empty. Add something delicious from the menu!
          </p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>৳{item.price} each</p>
                  </div>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(item.id, -1)
                      }
                      aria-label={`Remove one ${item.name}`}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(item.id, 1)
                      }
                      aria-label={`Add one ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ৳{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="clear-cart-button"
              onClick={() => setCart([])}
            >
              Clear Cart
            </button>
          </>
        )}
      </section>

      <footer className="menu-footer">
        <div className="menu-footer-brand">
          <span className="menu-logo-mark">4</span>
          <strong>cheez</strong>
        </div>

        <p>Made with love and lots of cheese.</p>

        <p>
          © {new Date().getFullYear()} 4Cheez. All rights reserved.
        </p>
      </footer>

      {selectedProduct && (
        <div
          className="food-modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="food-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProduct.name} details`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="food-modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close food details"
            >
              &times;
            </button>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="food-modal-image"
            />

            <div className="food-modal-content">
              <span className="food-modal-category">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <p className="food-modal-rating">
                ★ {selectedProduct.rating} &nbsp; | &nbsp;
                {selectedProduct.time} minutes
              </p>

              <p className="food-modal-description">
                {selectedProduct.description}
              </p>

              <div className="food-modal-info">
                <span>Calories</span>
                <strong>{selectedProduct.calories} kcal</strong>
              </div>

              <div className="food-modal-info">
                <span>Preparation time</span>
                <strong>{selectedProduct.time} minutes</strong>
              </div>

              <div className="food-modal-info">
                <span>Food type</span>
                <strong>
                  {selectedProduct.vegetarian
                    ? "Vegetarian"
                    : "Non-vegetarian"}
                </strong>
              </div>

              <div className="food-modal-bottom">
                <strong>৳{selectedProduct.price}</strong>

                <button
                  type="button"
                  className="add-to-cart-button"
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                >
                  + Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Menu;
