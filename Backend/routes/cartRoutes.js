const express = require("express");

const Router = express.Router();

const {protect} = require("../middleware/authmiddleware");



const {AddtoCart,getCart,increaseQuantity,decreaseQuantity,clearCart,removeFromCart,cartTotal} = require("../controllers/CartController");

Router.post("/add",protect,AddtoCart);
Router.post("/inc/:id",protect,increaseQuantity);
Router.post("/dec/:id",protect,decreaseQuantity);
Router.get("/total",protect,cartTotal);
Router.get("/",protect,getCart);
Router.delete("/",protect,clearCart);
Router.delete("/:id",protect,removeFromCart);

module.exports = Router;
