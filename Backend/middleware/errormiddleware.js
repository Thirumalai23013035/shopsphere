const errorhandler = (error, req, res, next) => {
    let statusCode = error.statusCode || error.status;

    if (!statusCode || statusCode < 400 || statusCode > 599) {
        if (error.name === 'CastError') {
            statusCode = 400;
        } else if (error.name === 'ValidationError') {
            statusCode = 400;
        } else if (error instanceof SyntaxError && 'body' in error) {
            statusCode = 400; 
        } else {
            statusCode = 500;
        }
    }

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Internal Server Error" : error.message,
    });
};

module.exports = errorhandler;
