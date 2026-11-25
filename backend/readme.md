# FourCheez Backend

The backend API for **FourCheez**, a food ordering and delivery web application. It is built using Node.js, Express.js, and MongoDB.

The backend manages customer authentication, food items, orders, coupons, reviews, admin operations, and AI-powered food recommendations.

## 🚀 Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT) Authentication
- Google Gemini AI
- dotenv
- CORS

## 📁 Project Structure

```text
backend/
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Food.js
│   ├── Order.js
│   └── Coupon.js
│
├── routes/
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── foodRoutes.js
│   ├── couponRoutes.js
│   ├── geminiRoutes.js
│   ├── reviewRoutes.js
│   └── adminRoutes.js
│
├── uploads/
│   └── foods/
│
├── .env
├── .gitignore
├── package.json
└── server.js
```

*Note: This structure represents the main backend organization. Your actual project may contain additional files and folders.*

## ✨ Main Features

### 1. Authentication
- Customer registration and login.
- Secure password handling.
- JWT-based authentication.
- Separate customer and administrator access.

### 2. Food Management
- Retrieve food items from MongoDB.
- Display food categories and details.
- Manage food availability.
- Manage food images.
- Support recommended food items.

### 3. Order Management
- Create and save customer orders.
- Retrieve customer order history.
- Track order status.
- Cancel eligible orders.
- Manage orders through the admin dashboard.

### 4. Admin Management
- Manage food items.
- View and manage customer orders.
- Manage customers.
- Manage coupons and offers.
- Manage reviews.
- Manage food recommendations.
- Configure restaurant settings.

### 5. Coupon Management
- Validate coupon codes.
- Apply discounts to eligible orders.
- Track coupon usage and expiration.

### 6. Review Management
- Retrieve food reviews.
- Allow customers to submit reviews.
- Manage and respond to reviews through the admin dashboard.

### 7. AI Food Assistant
- Google Gemini AI integration.
- Retrieve available food items from MongoDB.
- Provide food recommendations.
- Answer budget-based food questions.
- Retrieve customer order information.
- Provide database-based fallback responses when Gemini is unavailable.

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB database

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Backend Folder

```bash
cd fourcheez/backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend folder.

Add your project's required environment variables, using the exact names expected by your backend code.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** Never upload your actual `.env` file, database credentials, or API keys to GitHub.

### 5. Start the Backend Server

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5000
```

## 🔗 API Endpoints

| API Route | Description |
|---|---|
| `/api/auth` | Customer authentication |
| `/api/foods` | Food items and recommendations |
| `/api/orders` | Customer order management |
| `/api/coupons` | Coupon management |
| `/api/ai` | AI assistant |
| `/api/admin` | Admin operations |
| `/api/admin/recommendations` | Food recommendations management |
| `/api/admin/reviews` | Admin review management |
| `/api/reviews` | Customer reviews |
| `/uploads/` | Uploaded food images |

## 🗄️ Database

FourCheez uses MongoDB with Mongoose for database management.

Main collections include:

- `users`
- `foods`
- `orders`
- `coupons`

## 💳 Payment Integration

The checkout system supports Cash on Delivery and payment method options such as bKash, Nagad, and cards.

Online payment gateway integration with SSLCommerz Sandbox is planned for testing before production deployment.

## 🔐 Security

- JWT authentication middleware.
- Separate customer and administrator authorization.
- Environment variables for sensitive credentials.
- Protected customer and admin API routes.

## 👨‍💻 Developer

Fatema Khatun(20242126010)
Salman Shadik Pranto(20242164010)
Md.Sunzidul Islam Reshad(20242149010)

**Project:** FourCheez  
**Type:** Food Ordering and Delivery Web Application  
**Backend:** Node.js, Express.js, MongoDB

---

⭐ Developed as part of the FourCheez full-stack web application project.
