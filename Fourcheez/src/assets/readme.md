# Assets – FourCheez

This folder contains the static assets used throughout the FourCheez food ordering and delivery web application.

## Purpose

The assets folder stores images and other visual resources used to improve the website's appearance and user experience.

## Main Contents

- **Food Images:** Images of food items displayed on the menu and product cards.
- **Logo:** FourCheez branding and logo images.
- **Background Images:** Images used in website sections and page backgrounds.
- **Icons:** Visual icons used in different components.
- **Illustrations:** Decorative images used throughout the application.

## Usage

Assets are imported into React components when needed.

Example:

```jsx
import foodImage from "../../assets/food-image.png";

function FoodCard() {
  return <img src={foodImage} alt="Food item" />;
}
```

## Technologies Used

- React
- JavaScript (JSX)
- PNG, JPG, JPEG, SVG, and other supported image formats

---

**Project:** FourCheez – Food Ordering and Delivery Web Application
