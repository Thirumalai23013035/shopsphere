# 🛒 ShopSphere – Full Stack E-Commerce Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20ShopSphere-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://shopsphere-weld-nu.vercel.app/)

ShopSphere is a modern, full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). 

## Features
- **User Authentication:** Secure login and registration using JWT.
- **Product Catalog:** Browse products by category, search by name, or filter by price and brand.
- **Shopping Cart & Wishlist:** Add items to cart or wishlist, and manage quantities.
- **Admin Dashboard:** Full admin capabilities including adding, updating, and deleting products.
- **Cloudinary Integration:** Direct image uploads for product photos.
- **Responsive Design:** A beautiful, responsive user interface designed with modern aesthetics and TailwindCSS.

## Technologies Used
- **Frontend:** React, TailwindCSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Cloudinary

## Getting Started

### Prerequisites
- Node.js
- MongoDB (Atlas or local)
- Cloudinary Account

### Setup
1. Clone the repository.
2. Install backend dependencies: `cd Backend && npm install`
3. Install frontend dependencies: `cd Frontend && npm install`
4. Set up environment variables in `Backend/.env`:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   ```
5. Set up frontend variables in `Frontend/.env` (if applicable).
6. Start the backend: `cd Backend && npm run dev`
7. Start the frontend: `cd Frontend && npm run dev`
