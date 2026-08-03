const express = require("express")

const router = express.Router()

const {addProduct,deleteProduct} = require("../controllers/ProductController");

router.post("/",addProduct);
router.delete("/",deleteProduct);

module.exports= router;