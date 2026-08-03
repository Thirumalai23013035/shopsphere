const express = require("express");


const Router = express.Router();

const {addReview,getReviews,updateReview,deleteReview} = require("../controllers/ReviewController");
const {protect} = require("../middleware/authmiddleware");


Router.post("/add",protect,addReview);
Router.get("/product/:id",protect,getReviews);
Router.put("/update/:id",protect,updateReview);
Router.delete("/del/:id",protect,deleteReview);


module.exports = Router;