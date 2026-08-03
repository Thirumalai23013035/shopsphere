const jwt = require("jsonwebtoken");

const generatetoken = (user_id)=>{

    return jwt.sign({

        id:user_id
    },
    process.env.JWT_SECRET || "shopsphere_secret_key_2026",{

        expiresIn:process.env.JWT_EXPIRES_IN || "7d"
    })
}

module.exports = generatetoken;