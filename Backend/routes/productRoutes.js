const express = require("express");

const Router = express.Router();

const {AddProduct,getAllProducts,getProduct,deleteProduct,updateProduct,searchProducts,filterProducts,filterPrice,sortProducts,addManyProducts,Pagination,uploadProductImage,getCategories} = require("../controllers/ProductController");
const {protect} = require("../middleware/authmiddleware");
const {admin} = require("../middleware/adminmiddleware");
const upload = require("../middleware/uploadmiddleware");



Router.post("/add",protect,admin,upload.single("image"),AddProduct);
Router.post("/seed",protect,admin,addManyProducts);

// Named update routes (frontend uses PUT /products/update/:id)
Router.put("/update/:id",protect,admin,upload.single("image"),updateProduct);
Router.post("/update/:id",protect,admin,upload.single("image"),updateProduct);

// Named delete route (frontend uses DELETE /products/delete/:id)
Router.delete("/delete/:id",protect,admin,deleteProduct);

Router.get("/categories",getCategories);
Router.get("/price",filterPrice);
Router.get("/search",searchProducts);
Router.get("/filter",filterProducts);
Router.get("/sort",sortProducts);
Router.get("/pagination",Pagination);

Router.post("/upload",upload.single("image"),uploadProductImage);


Router.get("/",getAllProducts);

Router.get("/:id",getProduct);
Router.put("/:id",protect,admin,upload.single("image"),updateProduct);
Router.delete("/:id",protect,admin,deleteProduct);


module.exports = Router;