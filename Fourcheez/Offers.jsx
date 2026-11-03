
import React, { useState } from "react";
import "./Offers.css";

import loadedUltimateCheezBox from "../../assets/Loaded Ultimate Cheez Box.png";
import beefPasta from "../../assets/beef-pasta.png";
import sausageBlastCheezBox from "../../assets/Sausage Blast Cheez Box.png";
import gourmetBBQBeefPizza from "../../assets/Gourmet BBQ Beef Pizza.png";
import goldenCheezyWedges from "../../assets/Golden Cheezy Wedges.png";

const offers = [
  {
    id: 1,
    title: "Cheezy Welcome",
    discount: "15% OFF",
    description: "Get 15% off your first order at 4Cheez.",
    code: "WELCOME15",
    category: "First Order",
    expiry: "Limited time offer",
    image: loadedUltimateCheezBox,
  },
  {
    id: 2,
    title: "Big Cheez Deal",
    discount: "৳100 OFF",
    description: "Enjoy ৳100 off on orders above ৳599.",
    code: "BIGCHEEZ100",
    category: "Popular",
    expiry: "Limited time offer",
    image: beefPasta,
  },
  {
    id: 3,
    title: "Cheez Box Special",
    discount: "20% OFF",
    description: "Get 20% off selected Cheez Box orders.",
    code: "CHEEZ20",
    category: "Food Deals",
    expiry: "Limited time offer",
    image: sausageBlastCheezBox,
  },
  {
    id: 4,
    title: "Weekend Treat",
    discount: "10% OFF",
    description: "Make your weekend cheesier with 10% off.",
    code: "WEEKEND10",
    category: "Popular",
    expiry: "Weekend offer",
    image: gourmetBBQBeefPizza,
  },
  {
    id: 5,
    title: "Cheezy Side Treat",
    discount: "৳50 OFF",
    description: "Enjoy a delicious side with your next order.",
    code: "SIDE50",
    category: "Food Deals",
    expiry: "Limited time offer",
    image: goldenCheezyWedges,
  },
];

function Offers() {
  const [activeFilter, setActiveFilter] = useState("All offers");
  const [copiedCode, setCopiedCode] = useState("");

  const filters = [
    "All offers",
    "Popular",
    "First Order",
    "Food Deals",
  ];

  const filteredOffers =
    activeFilter === "All offers"
      ? offers
      : offers.filter(
          (offer) => offer.category === activeFilter
        );

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("Could not copy coupon code:", error);
      window.prompt("Copy this coupon code:", code);
    }
  };

  return (
    <main className="offers-page">

      {/* Page Header */}
      <section className="offers-header">
        <p className="offers-subtitle">
          SPECIAL DEALS FOR YOU
        </p>

        <h1>
          Offers & <span>Promotions</span>
        </h1>

        <p>
          More cheese, more happiness, and more savings.
          Explore our latest deals!
        </p>
      </section>

      {/* Featured Offer */}
      <section className="featured-offer">
        <div className="featured-content">
          <span className="featured-label">
            FEATURED DEAL
          </span>

          <h2>
            Make Every Bite
            <br />
            <span>Extra Cheezy!</span>
          </h2>

          <p>
            Enjoy our Loaded Ultimate Cheez Box and make
            every meal a delicious experience.
          </p>

          <div className="featured-discount">
            <strong>15% OFF</strong>
            <span>Use code: WELCOME15</span>
          </div>

          <button
            className="featured-copy-btn"
            onClick={() => copyCode("WELCOME15")}
          >
            {copiedCode === "WELCOME15"
              ? "Copied!"
              : "Copy Coupon Code"}
          </button>
        </div>

        <div className="featured-image">
          <img
            src={loadedUltimateCheezBox}
            alt="Loaded Ultimate Cheez Box"
          />
        </div>
      </section>

      {/* Available Offers */}
      <section className="offers-list-section">

        <div className="offers-section-heading">
          <div>
            <p className="offers-subtitle">
              DON'T MISS OUT
            </p>

            <h2>Available Offers</h2>
          </div>

          <span className="offers-count">
            {filteredOffers.length} offers
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="offers-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={
                activeFilter === filter ? "active" : ""
              }
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              {filter === "All offers" && ` (${offers.length})`}
            </button>
          ))}
        </div>

        {/* Offer Cards */}
        <div className="offers-grid">
          {filteredOffers.map((offer) => (
            <article
              className="offer-card"
              key={offer.id}
            >

              {/* Different Food Image */}
              <div className="offer-card-image">
                <img
                  src={offer.image}
                  alt={offer.title}
                />
              </div>

              <div className="offer-card-top">
                <span className="offer-category">
                  {offer.category}
                </span>

                <span className="offer-discount">
                  {offer.discount}
                </span>
              </div>

              <div className="offer-card-content">
                <h3>{offer.title}</h3>

                <p>{offer.description}</p>

                <div className="offer-expiry">
                  {offer.expiry}
                </div>
              </div>

              {/* Coupon Code */}
              <div className="offer-card-bottom">
                <div className="coupon-code">
                  <span>COUPON CODE</span>
                  <strong>{offer.code}</strong>
                </div>

                <button
                  className="copy-code-btn"
                  onClick={() => copyCode(offer.code)}
                >
                  {copiedCode === offer.code
                    ? "Copied!"
                    : "Copy"}
                </button>
              </div>

            </article>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <p className="no-offers">
            No offers available in this category.
          </p>
        )}

      </section>

      {/* Bottom Banner */}
      <section className="offers-bottom-banner">
        <h2>Stay Cheezy. Save More!</h2>

        <p>
          Keep checking this page for more delicious deals
          and special promotions.
        </p>
      </section>

    </main>
  );
}

export default Offers;
