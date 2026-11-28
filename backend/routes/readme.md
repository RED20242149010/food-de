# FourCheez – Backend API Routes

This folder contains the API route files responsible for handling HTTP requests and managing communication between the FourCheez frontend and backend.

Each route file handles a specific feature of the food ordering and delivery application.

## 📁 Folder Structure

```text
routes/
│
├── authRoutes.js
├── foodRoutes.js
├── orderRoutes.js
├── couponRoutes.js
├── geminiRoutes.js
├── reviewRoutes.js
├── adminRoutes.js
└── README.md
```

## 🚀 API Route Modules

### 1. authRoutes.js – Authentication API

Handles customer authentication and account management.

**Responsibilities:**
- Customer registration.
- Customer login.
- Authentication-related operations.
- User account access.

### 2. foodRoutes.js – Food API

Manages food-related operations.

**Responsibilities:**
- Retrieve available food items.
- Retrieve food details.
- Fetch recommended food items.
- Provide food data to the frontend.

### 3. orderRoutes.js – Order API

Handles customer order operations.

**Responsibilities:**
- Create new orders.
- Retrieve customer order history.
- Retrieve individual order details.
- Cancel eligible orders.
- Validate coupons during checkout.
- Manage order information and status.

### 4. couponRoutes.js – Coupon API

Handles promotional codes and discount operations.

**Responsibilities:**
- Retrieve coupon information.
- Validate promotional codes.
- Manage coupon-related operations.

### 5. geminiRoutes.js – AI Assistant API

Integrates Google Gemini AI with the FourCheez application.

**Responsibilities:**
- Process customer questions.
- Provide food recommendations.
- Retrieve available food data from MongoDB.
- Answer budget-based food questions.
- Retrieve customer order information.
- Provide database-based fallback responses when Gemini is unavailable.

### 6. reviewRoutes.js – Review API

Handles customer food reviews and ratings.

**Responsibilities:**
- Submit food reviews.
- Retrieve food reviews.
- Manage review-related operations.

### 7. adminRoutes.js – Admin API

Provides administrative functionality for the FourCheez dashboard.

**Responsibilities:**
- Manage food products.
- Manage customer orders.
- Manage customer information.
- Manage coupons and offers.
- Manage restaurant settings.
- Support administrative operations.

## 🔗 API Route Registration

The route modules are registered in the main `server.js` file.

Example:

```javascript
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/ai", geminiRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
```

## 🔐 Security

Protected API endpoints use authentication and authorization middleware.

- JWT-based authentication.
- Customer-specific access control.
- Administrator-only access to protected operations.
- Server-side validation of requests.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- Google Gemini AI

## 🎯 Purpose in FourCheez

The routes layer organizes backend functionality into separate API modules.

It connects frontend requests with database models, authentication middleware, business logic, and AI services.

This modular structure makes the backend easier to maintain, test, and extend.

---

**Project:** FourCheez  
**Module:** Backend API Routes  
**Architecture:** RESTful API  
**Backend:** Node.js and Express.js
