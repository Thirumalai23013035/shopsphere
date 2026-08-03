const express = require("express")

const Router = express.Router();

const {protect} = require("../middleware/authmiddleware")
const {admin} = require("../middleware/adminmiddleware")

const {getDetails} = require("../controllers/AdminController")

Router.get("/dashboard", protect, admin, getDetails);
Router.use("/", protect, admin, getDetails);

module.exports = Router;