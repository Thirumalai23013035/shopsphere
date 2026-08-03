const admin = (req,res,next)=>{

    if(req.user && (req.user.role == "Admin" || req.user.role == "admin"))
    {
        return next();
    }

    res.status(403).json({

        message:" Access denied , Admin only ",
        success:false
    })
}

module.exports = {
    admin
}