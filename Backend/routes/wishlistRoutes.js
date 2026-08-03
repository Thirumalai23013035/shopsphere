const express = require("express")

const Router = express.Router();

const {wishlistAdd,getWishList,deleteWishList} = require("../controllers/WishController");

const {protect} = require("../middleware/authmiddleware");
Router.post("/add",protect,wishlistAdd);
Router.delete("/:id",protect,deleteWishList);
Router.get("/",protect,getWishList);

module.exports = Router;