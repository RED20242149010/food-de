# Context – FourCheez

This folder contains the React Context API files used to manage shared application state across the FourCheez food ordering website.

## Purpose

The context folder helps different components access shared data without passing props through multiple levels of components.

## Main Responsibilities

- Manage shopping cart data.
- Share cart information between pages and components.
- Update item quantities.
- Add and remove food items from the cart.
- Keep cart functionality consistent throughout the application.

## Main File

### CartTemp.jsx

Manages the shopping cart state and provides cart-related functions to components throughout the application.

## Technologies Used

- React
- React Context API
- JavaScript (JSX)

## Usage

Components can access the shared cart state using the custom `useCart` hook.

---

**Project:** FourCheez – Food Ordering and Delivery Web Application
