const errorhandler = (error,req,res,next)=>{

    res.status(500).json({
        success:false,

        message:error.message,

    })
}

module.exports = errorhandler
