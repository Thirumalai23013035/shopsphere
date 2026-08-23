const express = require("express");


const Router = express.Router();

const {addReview,getReviews,updateReview,deleteReview} = require("../controllers/ReviewController");
const {protect} = require("../middleware/authmiddleware");


Router.post("/add", protect, addReview);

// Public routes for fetching reviews (both /review/:id and /review/product/:id)
Router.get("/:id", getReviews);
Router.get("/product/:id", getReviews);

Router.put("/update/:id", protect, updateReview);

// Protected routes for deleting reviews (both /review/:id and /review/del/:id)
Router.delete("/:id", protect, deleteReview);
Router.delete("/del/:id", protect, deleteReview);

module.exports = Router;