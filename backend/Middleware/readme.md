# FourCheez – Backend Middleware

This folder contains middleware functions used to handle authentication and authorization in the FourCheez backend application.

Middleware functions run between an incoming HTTP request and the route handler. They help protect API endpoints and control access to different parts of the application.

## 📁 Folder Structure

```text
middleware/
│
├── authMiddleware.js
└── README.md
```

## 🔐 Authentication and Authorization

### authMiddleware.js

This file contains middleware functions responsible for verifying user authentication and controlling access to protected API routes.

**Main responsibilities:**

- Authenticate users using JSON Web Tokens (JWT).
- Verify the validity of authentication tokens.
- Protect routes that require a logged-in user.
- Restrict administrator-only operations.
- Check user roles before allowing access to protected resources.

### Main Middleware Functions

**1. authenticateToken**

Checks whether a request contains a valid authentication token.

If authentication is successful, the user's information is made available to the protected route.

**2. authorizeAdmin**

Restricts access to administrator-only routes.

It ensures that only users with the appropriate administrator role can perform protected administrative operations.

## ⚙️ Usage

Middleware functions are imported into route files and applied to protect API endpoints.

Example:

```javascript
const {
  authenticateToken,
  authorizeAdmin
} = require("../middleware/authMiddleware");

// Protect a route with authentication
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Access granted"
  });
});

// Protect a route for administrators
router.get(
  "/dashboard",
  authenticateToken,
  authorizeAdmin,
  (req, res) => {
    res.json({
      message: "Admin access granted"
    });
  }
);
```

## 🎯 Purpose in FourCheez

The middleware layer helps maintain application security by separating authentication and authorization logic from the main route handlers.

It supports the separation of customer and administrator permissions throughout the FourCheez application.

---

**Project:** FourCheez  
**Module:** Backend Middleware  
**Technology:** Node.js, Express.js, JSON Web Token (JWT)
