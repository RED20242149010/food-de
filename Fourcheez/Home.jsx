import "./Home.css";

import heroImage from "../../assets/hero-cheez-box.png";

import loadedCheezBox from "../../assets/loaded-cheez-box.png";
import beefPasta from "../../assets/beef-pasta.png";
import sausageBox from "../../assets/sausage-box.png";

import veggiePasta from "../../assets/veggie-pasta.png";
import chickenBurger from "../../assets/chicken-burger.png";
import gardenSalad from "../../assets/garden-salad.png";


function ProductCard({
  image,
  rating,
  calories,
  time,
  name,
  description,
  price,
  reorder = false
}) {

  return (
    <div className="product-card">

      <img
        className="product-image"
        src={image}
        alt={name}
      />

      <div className="product-content">

        <div className="product-info">
          <span className="rating">
            ⭐️ {rating}
          </span>

          <span>
            {calories} · {time}
          </span>
        </div>

        <h3>{name}</h3>

        <p>{description}</p>

        <div className="product-bottom">

          <strong>৳{price}</strong>

          <button>
            {reorder ? Reorder ৳${price} : "Add to Cart"}
          </button>

        </div>

      </div>

    </div>
  );
}


function Home() {

  return (
    <>

      {/* HERO */}

      <section className="hero">

        <div className="hero-left">

          <div className="hero-tag">
            🏆 KHULNA'S CHEESIEST DESTINATION
          </div>

          <h1>
            Hot, Melty, Loaded.
            <span>Your cheese box</span>
            is calling.
          </h1>

          <p>
            Experience the legendary Loaded Cheez Boxes at Khulna
            New Market. Golden fries, sausage slices, tender crispy
            chicken swimming in our special pool of premium melted cheese.
          </p>

          <div className="hero-action">

            <button className="order-btn">
              Order Cheez Box Now
            </button>

            <span>
              🚚 <b>25 mins delivery to New Market area</b>
            </span>

          </div>

        </div>


        <div className="hero-right">
          <img src={heroImage} alt="Loaded cheese box" />
        </div>

      </section>


      {/* STORE + OFFER */}

      <section className="store-offer">

        <div className="store-card">

          <div className="round-icon">
            🏪
          </div>

          <div>
            <h3>
              4Cheez Outlet
              <span>OPEN NOW</span>
            </h3>

            <p>
              Khulna New Market, Block B · 11:00 AM – 11:00 PM
            </p>
          </div>

        </div>


        <div className="offer-card">

          <div className="round-icon">
            %
          </div>

          <div>
            <h3>Flat ৳50 Off on first order!</h3>

            <p>
              Use code <b>CHEEZNEW</b> · Min order ৳250
            </p>
          </div>

        </div>

      </section>


      {/* AI FINDER */}

      <section className="ai-finder">

        <div>

          <h2>
            Tight on budget? Let our AI find your perfect meal!
          </h2>

          <p>
            Input your budget and we'll instantly assemble the
            cheesiest box or pizza combination for you.
          </p>

        </div>

        <div className="ai-right">

          <div className="budget">
            ৳ <b>300</b> max
          </div>

          <button>
            Find Meals
          </button>

        </div>

      </section>


      {/* CATEGORIES */}

      <div className="categories">

        <button className="selected">All</button>
        <button>Cheez Boxes</button>
        <button>Gourmet Pizza</button>
        <button>Oven-Baked Pasta</button>
        <button>Steak Burgers</button>
        <button>Sides & Drinks</button>

      </div>


      {/* PRODUCTS */}

      <main className="home-products">

        {/* USUALS */}

        <section className="product-section">

          <div className="section-title">

            <div>
              <h2>Welcome back, Sajid! Your Usuals</h2>
              <p>
                Based on your 4 prior orders at Khulna New Market
              </p>
            </div>

            <a href="#">View History</a>

          </div>


          <div className="product-grid">

            <ProductCard
              image={loadedCheezBox}
              rating="4.9"
              calories="680 kcal"
              time="20 mins"
              name="Loaded Ultimate Cheez Box"
              description="Gourmet crisp chicken pops, double sausages, gold cheese sauce pool over golden New Market fries."
              price="350"
              reorder={true}
            />

            <ProductCard
              image={beefPasta}
              rating="4.8"
              calories="540 kcal"
              time="15 mins"
              name="Oven-Baked Beef Pasta"
              description="Stoneware baked pasta with minced beef, rich marinara, and a thick, torched mozzarella blanket."
              price="280"
            />

            <ProductCard
              image={sausageBox}
              rating="4.7"
              calories="390 kcal"
              time="12 mins"
              name="Cheesy Sausage Side Box"
              description="Sliced premium sausages tossed in our signature melted cheese blend with a touch of chili flakes."
              price="180"
            />

          </div>

        </section>


        {/* HEALTHY */}

        <section className="product-section">

          <div className="section-title">

            <div>
              <h2>
                Healthy Cheez & Calorie Conscious
              </h2>

              <p>
                Lighter cheese blends and high-protein picks under 500 kcal
              </p>
            </div>

          </div>


          <div className="product-grid">

            <ProductCard
              image={veggiePasta}
              rating="4.6"
              calories="410 kcal"
              time="15 mins"
              name="Baked Lite Veggie Pasta"
              description="Oven baked garden vegetables, low-fat cottage cheese blend, light whole-wheat penne."
              price="250"
            />

            <ProductCard
              image={chickenBurger}
              rating="4.8"
              calories="470 kcal"
              time="18 mins"
              name="Grilled Chicken Steak Burger"
              description="Slab of flame-grilled chicken breast, single slice Swiss cheese, fresh lettuce, whole-wheat bun."
              price="320"
            />

            <ProductCard
              image={gardenSalad}
              rating="4.5"
              calories="280 kcal"
              time="10 mins"
              name="Premium Cheez Garden Salad"
              description="Crisp garden greens, cherry tomatoes, cucumbers, premium feta cheese cubes, light olive oil drizzle."
              price="190"
            />

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-grid">

          <div>
            <h2>
              <span>4</span> cheez
            </h2>

            <p>
              Indulge in the cheesiest boxes, gourmet pizzas,
              and oven-baked pastas right in the heart of Khulna.
              Melty goodness delivered straight to your door.
            </p>
          </div>


          <div>
            <h4>OUR MENU</h4>
            <a href="#">Cheez Boxes</a>
            <a href="#">Gourmet Pizzas</a>
            <a href="#">Oven-Baked Pastas</a>
            <a href="#">Steak Burgers</a>
          </div>


          <div>
            <h4>HELP & SUPPORT</h4>
            <a href="#">Track Order</a>
            <a href="#">AI Assistant Guide</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>


          <div>
            <h4>CONTACT US</h4>
            <a href="#">Khulna New Market, Block B</a>
            <a href="#">Phone: +880 1712-444333</a>
            <a href="#">Email: hello@4cheez.com</a>
          </div>

        </div>
        <div className="footer-bottom">

          <p>
            © 2026 4Cheez Restaurant, Khulna. All rights reserved.
          </p>

          <div>
            ● &nbsp; ◎ &nbsp; ▶️
          </div>

        </div>

      </footer>

    </>
  );
}

export default Home;