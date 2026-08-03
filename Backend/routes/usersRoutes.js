const express = require("express")

const router = express.Router();


const {registerUser,getUsers,getUserById,updateUser,loginAPI,getProfile, logout,deleteUser} = require("../controllers/UserController");
const { protect } = require("../middleware/authmiddleware");
const {deleteProduct} = require("../controllers/ProductController")
const {admin} = require("../middleware/adminmiddleware")
console.log(registerUser);

router.post("/",registerUser);
router.post("/login",loginAPI);
router.post("/logout",logout)
router.get("/",getUsers);
router.get("/profile",protect,getProfile);
router.delete("/:id",protect,admin,deleteUser);
router.get("/:id",getUserById);
router.put("/:id",updateUser);
module.exports = router;