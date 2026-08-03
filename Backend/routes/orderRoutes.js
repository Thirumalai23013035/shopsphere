const express = require("express");

const Router = express.Router();

const {protect} = require("../middleware/authmiddleware");
const {admin} = require("../middleware/adminmiddleware");

const {placeOrder,getOrders,getSingleOrder,getAllOrders,updateOrderStatus,updatePaymentStatus} = require("../controllers/OrderController");

Router.post("/place",protect,placeOrder);
Router.get("/all",protect,admin,getAllOrders);
Router.get("/myorders",protect,getOrders);
Router.get("/:id",protect,getSingleOrder);
Router.patch("/:id/status",protect,admin,updateOrderStatus);
Router.patch("/:id/payment",protect,admin,updatePaymentStatus);

module.exports = Router;