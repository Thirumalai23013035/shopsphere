const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asynchandler");

const protect = asyncHandler(async (req, res, next) => {

    let token;

    
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {


        token = req.headers.authorization.split(" ")[1];

    
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "shopsphere_secret_key_2026");


        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        
        req.user = user;

        next();

    } else {

        return res.status(401).json({
            success: false,
            message: "No token, authorization denied"
        });

    }

});

module.exports = {
    protect
};